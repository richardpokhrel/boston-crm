# Admin Features Implementation - Summary

## Overview

This implementation adds powerful admin controls to the Boston CRM system, enabling:

1. **Bulk Lead Import via CSV** - Import multiple leads at once with automatic assignment
2. **Bulk Lead Assignment** - Assign selected leads with Round-Robin or Direct assignment strategies
3. **Admin Lead Management** - Full override capabilities for lead data and status regardless of assignment
4. **Lead Reassignment** - Admins can reassign any lead to any counselor

## Features Implemented

### 1. CSV Bulk Import (`/api/leads/import/csv`)

**Backend Endpoint:**
- Route: `POST /leads/import/csv` (Admin only)
- Accepts: Multipart form data with CSV file
- Parameters:
  - `file`: CSV file (required)
  - `assignmentStrategy`: "round-robin" or "direct" (default: "round-robin")
  - `assignedCounsellor`: Counselor ID (required if strategy is "direct")

**Features:**
- ✅ Parses CSV with required fields: fullName, phone
- ✅ Optional fields: email, programInterest, destinationCountry
- ✅ Automatic phone normalization (numbers only)
- ✅ Duplicate detection by phone number
- ✅ Round-robin assignment with workload balancing
- ✅ Direct assignment to specific counselor
- ✅ Auto-creates "First Contact" task with 2-hour SLA
- ✅ Detailed import report with success/failure/duplicate counts
- ✅ Full audit logging of bulk import action

**Frontend UI:**
- `CSVUploadDialog` component with:
  - File upload with drag-and-drop ready
  - Assignment strategy selection (Round-Robin or Direct)
  - Counselor selection dropdown for direct assignment
  - Real-time CSV format validation
  - Detailed import results showing successes, duplicates, and errors

### 2. Bulk Lead Assignment (`POST /api/leads/bulk-assign`)

**Backend Endpoint:**
- Route: `POST /leads/bulk-assign` (Admin only)
- Parameters:
  - `leadIds`: Array of lead IDs to assign
  - `assignmentStrategy`: "round-robin" or "direct"
  - `assignedCounsellor`: Counselor ID (required if direct)

**Features:**
- ✅ Bulk reassignment with selected strategy
- ✅ Workload balancing for round-robin
- ✅ Activity logging for each reassignment
- ✅ Query cache invalidation for UI refresh

**Frontend UI:**
- `LeadAssignmentDialog` component
- Multi-select checkboxes on Leads page
- Bulk assign button (visible only when leads selected)
- Shows assignment strategy options with descriptions

### 3. Admin Lead Management

**Backend Endpoints:**
1. **Override Lead Status** (`PATCH /api/leads/:id/admin/status`)
   - Bypass normal status flow constraints
   - Support for any status transition
   - Set lost reason and category
   - Full audit logging

2. **Reassign Lead** (`PATCH /api/leads/:id/admin/reassign`)
   - Reassign individual lead to any counselor
   - Validation of target counselor

3. **Update Lead Fields** (`PATCH /api/leads/:id/admin`)
   - Override any lead field
   - Full before/after state logging

**Frontend UI on Lead Detail Page:**
- **Admin Controls Panel** (purple highlight):
  - Reassign dropdown with counselor list
  - Clear visibility of admin capabilities
  
- **Override Status Button**:
  - Shows all possible statuses (not just next valid ones)
  - Admins can move leads to any status
  - Users can only follow normal flow

### 4. Helper Endpoint

**Get Counselors** (`GET /api/leads/admin/counsellors`)
- Returns list of active counselors
- Used for dropdowns in reassign/assignment dialogs

## Database Schema Updates

**Lead Model Enhancement:**
- Added source value: "csv_import" for tracking bulk imports
- Existing fields support admin operations (no schema changes needed)

## Frontend Components

### New Components:
1. **CSVUploadDialog.jsx**
   - Modal dialog for CSV import
   - File upload with validation
   - Import results display
   - Strategy selection UI

2. **LeadAssignmentDialog.jsx**
   - Modal for bulk assignment
   - Strategy selection
   - Counselor dropdown
   - Shows number of leads to assign

### Modified Components:
1. **LeadsPage.jsx**
   - Added multi-select checkboxes (admin only)
   - CSV Import button (admin only)
   - Bulk Assign button (conditional visibility)
   - Select All checkbox for convenience

2. **LeadDetailPage.jsx**
   - Admin Controls section with purple styling
   - Override Status button (different from normal status update)
   - Reassign dropdown in admin panel
   - All available statuses dropdown for admins

### Modified Hooks:
1. **useLeads.js**
   - Added admin mutation hooks:
     - `useAdminUpdateLead()`
     - `useAdminReassignLead()`
     - `useAdminUpdateLeadStatus()`

### Updated API Client:
1. **leads.js**
   - Added admin methods:
     - `getCounsellors()`
     - `importCsv()`
     - `bulkAssign()`
     - `adminUpdateLead()`
     - `adminReassignLead()`
     - `adminUpdateLeadStatus()`

## Security & Validation

### Authorization:
- All admin endpoints protected with `adminOnly` middleware
- Only users with role "admin" can access these features

### Validation:
- Required CSV fields validation
- Phone number validation (minimum 10 digits)
- Counselor existence verification
- Optional field length limits
- Email format validation (when provided)

### Audit Logging:
- All admin operations logged with:
  - Actor (admin user)
  - Action type (e.g., "leads.bulk_imported", "lead.admin_reassigned")
  - Before/after state
  - Timestamp
  - IP address
  - Change delta (what changed)

## Dependencies Added

- `csv-parse` - For CSV parsing and validation

## API Workflow Examples

### Example 1: CSV Import with Round-Robin
```javascript
const formData = new FormData()
formData.append('file', csvFile)
formData.append('assignmentStrategy', 'round-robin')

const result = await fetch('/api/leads/import/csv', {
  method: 'POST',
  body: formData,
  headers: { Authorization: `Bearer ${token}` }
})

// Response:
// {
//   imported: 45,
//   duplicates: [{ fullName: "John Doe", phone: "5551234567" }],
//   errors: [{ row: 10, error: "Invalid phone number" }],
//   summary: { total: 50, imported: 45, failed: 5 }
// }
```

### Example 2: Bulk Assignment
```javascript
const result = await leadsApi.bulkAssign(
  ['lead1_id', 'lead2_id', 'lead3_id'],
  'direct',
  'counselor_id_123'
)
// Assigns 3 leads to specific counselor
```

### Example 3: Admin Status Override
```javascript
const result = await leadsApi.adminUpdateLeadStatus(
  'lead_id',
  {
    status: 'enrolled',
    reason: 'Manual enrollment by admin'
  }
)
// Directly set status to enrolled regardless of current status
```

## Testing Checklist

- [ ] Upload CSV with round-robin assignment
- [ ] Upload CSV with direct assignment
- [ ] Verify duplicate detection works
- [ ] Check error reporting for invalid rows
- [ ] Test multi-select on leads page
- [ ] Test bulk assign with round-robin
- [ ] Test bulk assign with direct assignment
- [ ] Verify lead detail admin controls
- [ ] Test admin status override
- [ ] Test admin lead reassignment
- [ ] Verify non-admins cannot see admin features
- [ ] Check activity logs for all operations

## CSV Template

See `CSV_IMPORT_GUIDE.md` for detailed CSV import instructions and template.

## Notes for Deployment

1. Install dependency: `npm install csv-parse` in server directory
2. Update server middleware order (multer should come before body parser for multipart)
3. Test CSV import with sample data before going live
4. Configure maximum file upload size if needed
5. Monitor Activity Logs for bulk import operations
6. Consider rate limiting on CSV import endpoint for production

## Future Enhancements

- [ ] Support for more CSV fields (attempt count, notes, etc.)
- [ ] CSV export functionality
- [ ] Import history/audit trail with revert capability
- [ ] Batch status update for multiple leads
- [ ] Scheduled imports from external sources
- [ ] Custom assignment algorithms (skills-based, capacity-based, etc.)
