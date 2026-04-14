# Admin Features Implementation - Complete Technical Specification

## 📋 Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [API Reference](#api-reference)
6. [Database & Audit](#database--audit)
7. [Security](#security)
8. [Testing](#testing)
9. [Deployment](#deployment)

---

## Overview

This document details the complete implementation of admin lead management features including:
- **Bulk CSV Import** of leads with automatic or round-robin assignment
- **Bulk Lead Assignment** with intelligent workload balancing
- **Admin Override Capabilities** for lead status and assignments
- **Complete Audit Trails** for all admin operations

All features are role-based (admin-only) with comprehensive logging.

---

## Features

### 1. Bulk Lead Import via CSV

**Purpose:** Import 10s to 1000s of leads programmatically

**Capabilities:**
- Parse CSV files with required/optional fields
- Automatic phone number normalization
- Duplicate detection by phone number
- Round-robin or direct assignment strategy
- Auto-create first contact tasks with SLA
- Comprehensive import report and error handling
- Full audit logging of each import operation

**Source Tracking:** All imported leads marked with `source: 'csv_import'`

### 2. Bulk Lead Assignment

**Purpose:** Reassign multiple leads simultaneously

**Capabilities:**
- Select multiple leads from leads page
- Choose assignment strategy (Round-robin or Direct)
- Round-robin with workload balancing algorithm
- Direct assignment to specific counselor
- Real-time query cache invalidation
- Activity logging for all assignments

**Workload Balancing:** Counts existing leads per counselor and assigns to the one with fewest

### 3. Admin Lead Management

**Purpose:** Full override capabilities for lead data regardless of normal constraints

**Capabilities on Lead Detail Page:**
- Override lead status to ANY status (bypasses normal pipeline flow)
- Reassign lead to any counselor
- Update any lead field
- View admin controls in dedicated purple panel

**Capabilities:**
- No restrictions on status transitions (admin can move new → enrolled directly)
- All changes permanently logged with before/after state
- Reason/notes can be attached to override actions

### 4. Admin Features Visibility

**Leads Page (Admin Only):**
- Multi-select checkboxes for all leads
- "Select All" checkbox for current page
- CSV Import button (Opens import dialog)
- Bulk Assign button (appears only when leads selected)

**Lead Detail Page (Admin Only):**
- Admin Controls panel (purple section)
- Reassign dropdown
- Override Status button (different UX than regular status update)

---

## Backend Implementation

### New Endpoint Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/leads/import/csv` | Admin | Bulk import from CSV |
| POST | `/api/leads/bulk-assign` | Admin | Bulk reassign leads |
| GET | `/api/leads/admin/counsellors` | Admin | List active counselors |
| PATCH | `/api/leads/:id/admin` | Admin | Override any lead field |
| PATCH | `/api/leads/:id/admin/reassign` | Admin | Reassign single lead |
| PATCH | `/api/leads/:id/admin/status` | Admin | Override lead status |

### Controller Updates

**File:** `server/src/controllers/leadController.js`

**New Functions:**
```javascript
// CSV import and processing
importLeadsFromCsv(req, res, next)
getCounsellors(req, res, next)
getNextCounsellor()  // Round-robin algorithm

// Admin operations
adminUpdateLead(req, res, next)
adminReassignLead(req, res, next)
adminUpdateLeadStatus(req, res, next)

// Bulk operations
bulkAssignLeads(req, res, next)
```

**CSV Processing Logic:**
1. Parse CSV file with `csv-parse` library
2. Validate required fields (fullName, phone)
3. For each record:
   - Normalize phone (digits only)
   - Check for duplicates
   - Determine counselor assignment
   - Create lead document
   - Auto-create first contact task
4. Collect results (successes, duplicates, errors)
5. Log bulk import to ActivityLog
6. Return detailed import report

**Round-Robin Algorithm:**
```javascript
const leadCounts = await Promise.all(
  counsellors.map(c => ({
    counsellor: c._id,
    count: await Lead.countDocuments({ assignedCounsellor: c._id })
  }))
)
return leadCounts.reduce((min, current) =>
  current.count < min.count ? current : min
).counsellor
```

### Route Configuration

**File:** `server/src/routes/leadRoutes.js`

**Important:** Admin routes must be defined BEFORE parameterized routes to prevent conflicts

```javascript
// Admin routes (before :id routes)
router.get('/admin/counsellors', adminOnly, getCounsellors)
router.post('/import/csv', adminOnly, upload.single('file'), importLeadsFromCsv)
router.post('/bulk-assign', adminOnly, bulkAssignLeads)

// Then parameterized routes
router.get('/:id', getLeadById)
router.patch('/:id/admin', adminOnly, adminUpdateLead)
```

### Middleware Configuration

**Multer Setup:**
```javascript
const upload = multer({ 
  storage: multer.memoryStorage(),
  // Optional: Add file size limits
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})
```

**Protection:**
- All endpoints use `protect` middleware (verify JWT)
- All admin endpoints use `adminOnly` middleware (verify role='admin')

### Dependency

**New Dependency:** `csv-parse`
- Installed with: `npm install csv-parse`
- Used for parsing and validating CSV format
- Supports configurable delimiters and options

---

## Frontend Implementation

### New Components

#### `CSVUploadDialog.jsx`
Location: `client/src/components/ui/CSVUploadDialog.jsx`

**Props:**
- `isOpen` (bool) - Dialog visibility
- `onClose` (function) - Close handler
- `onSuccess` (function) - Success callback

**Features:**
- File upload with drag-drop ready UI
- CSV format requirements display
- Assignment strategy selector (radio buttons)
- Counselor dropdown (conditional)
- Import results display with success/duplicate/error breakdowns
- Real-time validation

**State:**
- `file` - Selected CSV file
- `assignmentStrategy` - "round-robin" or "direct"
- `selectedCounsellor` - Target counselor for direct assignment
- `uploadResult` - Results from import operation

#### `LeadAssignmentDialog.jsx`
Location: `client/src/components/ui/LeadAssignmentDialog.jsx`

**Props:**
- `isOpen` (bool) - Dialog visibility
- `onClose` (function) - Close handler
- `leadIds` (array) - IDs of leads to assign
- `onSuccess` (function) - Success callback

**Features:**
- Clear explanation of each strategy
- Visual strategy selector with descriptions
- Counselor dropdown (conditional on direct)
- Lead count display in title
- Loading states during submission

### Modified Components

#### `LeadsPage.jsx`
Location: `client/src/pages/leads/LeadsPage.jsx`

**New State:**
```javascript
const [csvDialogOpen, setCsvDialogOpen] = useState(false)
const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
const [selectedLeadIds, setSelectedLeadIds] = useState([])
const [selectAll, setSelectAll] = useState(false)
```

**New Functionality:**
- Multi-select checkboxes per lead (admin only)
- "Select All" checkbox functionality
- CSV Import button (admin only)
- Bulk Assign button (conditional visibility)
- Toggle selection helpers
- Row highlight on selection (bg-blue-50)

**Admin-Only Rendering:**
```javascript
{isAdmin && (
  <>
    <th className="py-3 px-4"><input type="checkbox" /></th>
    {/* ... */}
    <Button onClick={() => setCsvDialogOpen(true)}>
      <Upload /> Import CSV
    </Button>
    {selectedLeadIds.length > 0 && (
      <Button onClick={() => setAssignmentDialogOpen(true)}>
        Assign ({selectedLeadIds.length})
      </Button>
    )}
  </>
)}
```

#### `LeadDetailPage.jsx`
Location: `client/src/pages/leads/LeadDetailPage.jsx`

**New Sections:**
1. **Admin Controls Panel** (purple, conditional)
   - Reassign dropdown with counselor list
   - Clear capability statements
   - Only visible to admins

2. **Override Status UI** (conditional label)
   - Different button text for admins ("Override Status" vs "Update Status")
   - All statuses available to admins
   - Normal pipeline flow for regular users

**New State:**
```javascript
const [showAdminPanel, setShowAdminPanel] = useState(false)
const [selectedCounsellor, setSelectedCounsellor] = useState('')
```

**New Mutations:**
```javascript
// For admin status override
const adminUpdateStatusMutation = useMutation({...})

// For admin reassignment
const adminReassignMutation = useMutation({...})
```

### Updated API Client

**File:** `client/src/api/leads.js`

**New Methods:**
```javascript
getCounsellors: () => api.get('/leads/admin/counsellors')

importCsv: (file, assignmentStrategy, assignedCounsellor) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('assignmentStrategy', assignmentStrategy)
  if (assignedCounsellor) formData.append('assignedCounsellor', assignedCounsellor)
  return api.post('/leads/import/csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

bulkAssign: (leadIds, assignmentStrategy, assignedCounsellor) =>
  api.post('/leads/bulk-assign', { 
    leadIds, 
    assignmentStrategy, 
    assignedCounsellor 
  })

adminUpdateLead: (id, data) => api.patch(`/leads/${id}/admin`, data)
adminReassignLead: (id, assignedCounsellor) =>
  api.patch(`/leads/${id}/admin/reassign`, { assignedCounsellor })
adminUpdateLeadStatus: (id, data) => api.patch(`/leads/${id}/admin/status`, data)
```

### Updated Hooks

**File:** `client/src/hooks/useLeads.js`

**New Admin Hooks:**
```javascript
export const useAdminUpdateLead = () => {
  // Similar to useUpdateLead but calls adminUpdateLead API
}

export const useAdminReassignLead = () => {
  // Calls adminReassignLead API
}

export const useAdminUpdateLeadStatus = () => {
  // Calls adminUpdateLeadStatus API
}
```

---

## API Reference

### POST /api/leads/import/csv

**Authentication:** Required (admin only)

**Content-Type:** `multipart/form-data`

**Request Body:**
```
file (binary) - CSV file [REQUIRED]
assignmentStrategy (string) - "round-robin" or "direct" [DEFAULT: "round-robin"]
assignedCounsellor (string) - Counselor ObjectId [REQUIRED if strategy="direct"]
```

**CSV Format:**
- Header row required
- Columns: fullName, phone [REQUIRED]; email, programInterest, destinationCountry [OPTIONAL]
- Phone: Will be normalized (digits only, min 10 digits)
- Max file size: 5MB (configurable)

**Response (200 OK):**
```json
{
  "data": {
    "imported": 45,
    "duplicates": [
      {
        "fullName": "John Doe",
        "phone": "1234567890",
        "reason": "Phone already exists"
      }
    ],
    "errors": [
      {
        "row": 10,
        "error": "Invalid phone number"
      }
    ],
    "summary": {
      "total": 50,
      "imported": 45,
      "failed": 5
    }
  }
}
```

**Error Responses:**
- 400: No file provided
- 400: CSV empty
- 400: Missing required fields
- 401: Not authenticated
- 403: Not admin

### POST /api/leads/bulk-assign

**Authentication:** Required (admin only)

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "leadIds": ["id1", "id2", "id3"],
  "assignmentStrategy": "round-robin|direct",
  "assignedCounsellor": "counselor_id_123"
}
```

**Validation:**
- `leadIds` array required, non-empty
- `assignmentStrategy` required
- `assignedCounsellor` required if strategy is "direct"

**Response (200 OK):**
```json
{
  "data": {
    "updated": 3
  }
}
```

### GET /api/leads/admin/counsellors

**Authentication:** Required (admin only)

**Response (200 OK):**
```json
{
  "data": {
    "counsellors": [
      {
        "_id": "ObjectId",
        "fullName": "John Smith",
        "email": "john@example.com"
      }
    ]
  }
}
```

### PATCH /api/leads/:id/admin/status

**Authentication:** Required (admin only)

**Request Body:**
```json
{
  "status": "any_valid_status",
  "reason": "Reason for override (optional)",
  "reasonCategory": "lost_reason_category (optional for lost status)"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "lead": { /* full lead object */ }
  }
}
```

### PATCH /api/leads/:id/admin/reassign

**Authentication:** Required (admin only)

**Request Body:**
```json
{
  "assignedCounsellor": "counselor_id_123"
}
```

**Validation:**
- Counselor must exist and be active

**Response (200 OK):**
```json
{
  "data": {
    "lead": { /* full lead object */ }
  }
}
```

### PATCH /api/leads/:id/admin

**Authentication:** Required (admin only)

**Request Body:** Any lead fields to update
```json
{
  "fullName": "Updated Name",
  "status": "new_status",
  "qualificationNotes": "Updated notes"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "lead": { /* full lead object */ }
  }
}
```

---

## Database & Audit

### ActivityLog Schema

All admin operations create ActivityLog entries:

```javascript
{
  actor: ObjectId,           // Admin user ID
  actorRole: 'admin',
  action: string,            // e.g., 'leads.bulk_imported', 'lead.admin_reassigned'
  entityType: 'lead',
  entityId: ObjectId,
  entityLabel: string,       // Lead name
  description: string,       // For bulk operations
  beforeState: object,       // State before change
  afterState: object,        // State after change
  changeDelta: object,       // Specific changes
  metadata: object,          // Additional context (import counts, etc.)
  ipAddress: string,
  createdAt: Date
}
```

### Sample Activity Log Entries

**CSV Import:**
```javascript
{
  action: 'leads.bulk_imported',
  description: 'Bulk imported 45 leads via CSV',
  metadata: {
    totalRows: 50,
    importedCount: 45,
    duplicateCount: 3,
    errorCount: 2,
    assignmentStrategy: 'round-robin'
  }
}
```

**Lead Reassignment:**
```javascript
{
  action: 'lead.admin_reassigned',
  changeDelta: {
    assignedCounsellor: ['old_id', 'new_id']
  },
  beforeState: { /* before */ },
  afterState: { /* after */ }
}
```

**Status Override:**
```javascript
{
  action: 'lead.admin_status_changed',
  changeDelta: {
    status: ['new', 'enrolled']
  }
}
```

---

## Security

### Authorization

**Middleware Chain:**
```
Request → protect (auth) → adminOnly (role check) → Controller
```

**Role Validation:**
```javascript
const adminOnly = authorize('admin')  // Only allows role='admin'
```

### Input Validation

**CSV Import:**
- Required fields validation
- Phone number format (min 10 digits)
- Email format validation
- Field length limits
- File size limits (5MB default)

**Bulk Assign:**
- Lead IDs existence check
- Counselor existence verification
- Strategy parameter validation

**Lead Updates:**
- ObjectId validation
- Status enum validation
- Counselor existence check

### Audit Trail

**All Admin Actions Logged:**
- User performing action
- Timestamp
- IP address
- Before/after state
- Reason/notes (when applicable)
- Detailed change context

### Data Sensitivity

**What's NOT Restricted:**
- Admitted admins have full access
- All changes are permanently logged
- No soft deletes - audit trail is permanent record

---

## Testing

### Unit Tests

**CSV Parsing:**
- Valid CSV with all fields
- CSV with missing required fields
- CSV with invalid phone numbers
- CSV with duplicates
- CSV with wrong format

**Round-Robin Algorithm:**
- Even distribution
- Equal counselor counts
- Single counselor scenario
- No active counselors error

**Admin Operations:**
- Status override validation
- Counselor reassignment
- Bulk assignment with different strategies
- Activity log creation

### Integration Tests

**Import Workflow:**
1. Upload CSV with 10 valid leads
2. Verify round-robin distribution
3. Check task creation
4. Verify audit log

**Bulk Assignment:**
1. Create test leads
2. Select multiple leads
3. Perform bulk assignment
4. Verify counselor assignments
5. Check cache invalidation

**Admin Override:**
1. Open lead detail page
2. Override status directly
3. Verify status change
4. Check activity log
5. Verify non-users can't access

### Manual Testing Checklist

- [ ] CSV import with round-robin
- [ ] CSV import with direct assignment
- [ ] CSV import with duplicates
- [ ] CSV import with invalid data
- [ ] Verify auto-created tasks
- [ ] Bulk assign multiple leads
- [ ] Select all leads on page
- [ ] Admin detail page controls visible
- [ ] Status override works
- [ ] Counselor reassignment works
- [ ] Non-admins can't see admin features
- [ ] Activity logs track all operations
- [ ] Error messages clear and helpful

---

## Deployment

### Pre-Deployment

1. **Install Dependencies:**
   ```bash
   cd server
   npm install csv-parse
   ```

2. **Test Configuration:**
   - Verify multer max file size
   - Check CSV parsing edge cases
   - Test with sample imports

3. **Database:**
   - Ensure ActivityLog collection exists
   - Verify indexes on Lead model

4. **Environment:**
   - Check CORS configuration (should already be set)
   - Verify JWT authentication works
   - Check rate limiting settings

### Deployment Steps

1. **Backend:**
   ```bash
   # Install dependencies
   npm install csv-parse
   
   # Run tests
   npm test
   
   # Deploy (your deployment process)
   ```

2. **Frontend:**
   - New components already included
   - No dependencies added
   - Rebuild React app

3. **Verification:**
   - Test CSV import with sample data
   - Verify admin controls visible
   - Check activity logs
   - Monitor for errors

### Rollback

If issues occur:
1. Revert route order (admin routes must come first)
2. Remove CSV upload components if needed
3. Database changes are minimal - no migration needed
4. Activity logs are append-only

### Production Notes

- Monitor file upload sizes
- Set reasonable rate limits on import endpoint
- Consider batch processing for large imports (1000+ leads)
- Archive old activity logs periodically
- Test CSV import with realistic data volumes
- Set up alerts for admin operation monitoring

---

## FAQ

**Q: Why are admin routes defined before parameterized routes?**
A: Express routes are matched in order. Without this, `/api/leads/admin/counsellors` would match `/:id` pattern.

**Q: What happens if CSV has duplicate entries within file?**
A: First entry is processed, subsequent duplicates within file will fail with "duplicate" reason.

**Q: Can admins import leads with empty phone numbers?**
A: No - phone is required and must have minimum 10 digits.

**Q: Why round-robin instead of simple sequential?**
A: Round-robin balances workload by assigning to counselor with fewest leads, not just the next one.

**Q: Can I revert an admin action?**
A: No - actions are permanent. Check activity logs to see what changed. You can manually reassign/change if needed.

**Q: What's the maximum CSV file size?**
A: Default 5MB. Configure in multer options if different needed.

---

## Support & Maintenance

### Common Issues

**Issue: CSV import failing with "no token provided"**
- Ensure auth token is being passed in Authorization header
- Check if token is expired

**Issue: Admin buttons not showing**
- Verify user role is "admin"
- Check isAdmin value in useAuth hook
- Verify JWT contains role field

**Issue: Round-robin assigning to same counselor**
- This is correct behavior - that counselor has the fewest leads
- Check counselor load distribution

### Maintenance

- Monitor activity logs for unusual patterns
-archive old logs to prevent collection bloat
- Test CSV import monthly with sample data
- Review admin operation audit trail regularly
