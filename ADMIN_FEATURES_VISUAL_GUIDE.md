# Admin Features - Visual Reference Guide

## 🎯 Feature Locations

### Leads Page (for Admins)

```
┌─────────────────────────────────────────────────┐
│  Leads                              50 total     │
│  ┌─────────────────────────────────────────────┐ │
│  │ [Import CSV] [Assign (5)]  [+ New Lead]    │ │ <- Admin buttons
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  Filters: [Search] [Status ▼] [Source ▼]        │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ ☑ │ Name      │ Phone │ Status │ Counselor  │ │
│  │───┼───────────┼───────┼────────┼────────────│ │
│  │ ☑ │ John Doe  │ ***   │ New    │ Sarah ✓    │ │
│  │ ☑ │ Jane Doe  │ ***   │ New    │ Mike ✓     │ │
│  │   │ Bob Smith │ ***   │ New    │ Unassigned │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

Legend:
  ☑ - Checkbox for selection (admin only)
  [Import CSV] - Open CSV upload dialog
  [Assign (5)] - Appears only when leads selected
```

---

## CSV Upload Dialog

```
╔════════════════════════════════════════════════╗
║          Import Leads from CSV                 ║
╠════════════════════════════════════════════════╣
║                                                ║
║  CSV Format Required:                          ║
║  fullName,phone,email,programInterest,...     ║
║                                                ║
║  ┌──────────────────────────────────────────┐ ║
║  │ 📁 Select or drag-drop CSV file here    │ ║
║  │    [sample.csv]                          │ ║
║  └──────────────────────────────────────────┘ ║
║                                                ║
║  Assignment Strategy:                          ║
║  ◉ Round Robin                                ║
║    □ Direct Assignment                         ║
║                                                ║
║  ┌─────────────┬──────────────────────────┐  ║
║  │   Cancel    │      Import              │  ║
║  └─────────────┴──────────────────────────┘  ║
║                                                ║
╚════════════════════════════════════════════════╝

After Import:
╔════════════════════════════════════════════════╗
║          Import Complete                       ║
╠════════════════════════════════════════════════╣
║                                                ║
║  ✅ Successfully imported 45 leads             ║
║                                                ║
║  ⚠️ Duplicates Found (3)                       ║
║     • John Smith (555-1234567)                 ║
║     • Jane Doe (555-7654321)                   ║
║                                                ║
║  ❌ Errors (2)                                 ║
║     Row 5: Invalid phone number                ║
║     Row 12: Missing fullName                   ║
║                                                ║
║                   [Close]                      ║
║                                                ║
╚════════════════════════════════════════════════╝
```

---

## Bulk Assignment Dialog

```
╔════════════════════════════════════════════════╗
║            Assign Leads (15)                   ║
╠════════════════════════════════════════════════╣
║                                                ║
║  Assignment Strategy:                          ║
║                                                ║
║  ┌─────────────────────────────────────────┐ ║
║  │ ◉ Round Robin                           │ ║
║  │   Automatically balanced distribution   │ ║
║  └─────────────────────────────────────────┘ ║
║                                                ║
║  ┌─────────────────────────────────────────┐ ║
║  │ ○ Direct Assignment                    │ ║
║  │   Assign to specific counselor          │ ║
║  └─────────────────────────────────────────┘ ║
║                                                ║
║  Counselor: [Select counselor...▼]            ║
║                                                ║
║  ┌──────────┬────┬────────────────┐           ║
║  │ Cancel   │    │   Assign       │           ║
║  └──────────┴────┴────────────────┘           ║
║                                                ║
╚════════════════════════════════════════════════╝
```

---

## Lead Detail Page - Admin Controls

```
┌──────────────────────────────────────────────────────────┐
│ ← Back to Leads                                          │
├──────────────────────────────────────────────────────────┤
│ John Smith                         [New]  [Admin] [Override Status]
│ Lead ID: 5f9e1b9b9d9d9d9d9d9d9d9d              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ╔═══════════════════════════════════════════════════╗   │
│ ║ 🟣 Admin Controls                                 ║   │ <- Purple panel
│ ╠═══════════════════════════════════════════════════╣   │
│ ║                                                   ║   │
│ ║ Reassign to Counsellor:                          ║   │
│ ║ [Select counsellor...▼]  [Reassign]              ║   │
│ ║                                                   ║   │
│ ║ ✓ Can override any lead status or pipeline       ║   │
│ ║ ✓ Can reassign lead to any counsellor            ║   │
│ ║                                                   ║   │
│ ╚═══════════════════════════════════════════════════╝   │
│                                                          │
│ ─── Contact Information ──────────────────────────────  │
│ Full Name: John Smith                                   │
│ Email: john@example.com                                 │
│ Phone: (555) 123-4567                                   │
│ Status: New                                             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Override Status Panel

```
┌──────────────────────────────────────────────────────┐
│ 🔵 Override Lead Status                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Status: [All Statuses ▼]                           │
│         • new                                        │
│         • contacted                                  │
│         • interested                                 │
│         • docs_received                              │
│         • enrolled              ← All available      │
│         • lost                                       │
│         (... etc)                                    │
│                                                      │
│ Reason (optional): [________________]                │
│                                                      │
│ [Confirm]  [Cancel]                                 │
│                                                      │
└──────────────────────────────────────────────────────┘

NOTE: Regular users see different experience:
┌──────────────────────────────────────────────────────┐
│ Update Status                                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Status: [Next Valid Stages ▼]                       │
│         • contacted (only valid next step)          │
│         • lost                                       │
│         (Limited options based on current status)   │
│                                                      │
│ [Confirm]  [Cancel]                                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## User Workflow Comparison

### 👤 Regular Counselor User
```
Leads Page               Lead Detail Page
├─ View own leads        ├─ See own assigned leads only
├─ Create lead           ├─ Update lead info
├─ Update status         ├─ Follow pipeline constraints
│  (next stage only)     │  Status → Contacted → Interested...
└─ No bulk operations    └─ No admin controls
```

### 👨‍💼 Admin User
```
Leads Page               Lead Detail Page
├─ View ALL leads        ├─ See and manage any lead
├─ Create lead           ├─ Override any field
├─ CSV import            ├─ Jump to any status
├─ Bulk select           ├─ Reassign to any counselor
├─ Bulk assign           ├─ Full audit trail visible
├─ Multi-select          └─ Admin controls panel visible
└─ Checkboxes
```

---

## Assignment Strategy Comparison

### Round-Robin Strategy
```
Current Workload:
Sarah: 23 leads        Mike: 25 leads       Jane: 20 leads
                           ▲
                      (Has most)

New Leads to Assign: [Lead1, Lead2, Lead3]

Distribution:
1. Jane (20 leads) ← Assign Lead1
2. Sarah (23 leads) ← Assign Lead2
3. Jane (21 leads) ← Assign Lead3  (now tied with Sarah)

Result: Jane: 22, Sarah: 24, Mike: 25 ✅ Balanced
```

### Direct Assignment Strategy
```
Selected Counselor: Sarah

All 3 leads → Sarah
Sarah's workload: 23 → 26

Result: Sarah: 26, Mike: 25, Jane: 20 (unbalanced but intentional)
```

---

## CSV File Format Visualization

### Valid CSV
```
fullName,phone,email,programInterest,destinationCountry
John Smith,+1 (555) 123-4567,john@example.com,MBA,Canada
Jane Doe,555-987-6543,jane@example.com,Masters,USA
Bob Johnson,5551112222,,Engineering,Australia
```
Result: ✅ 3 leads imported

### CSV with Duplicates
```
fullName,phone,email,programInterest,destinationCountry
John Smith,5551234567,john@example.com,MBA,Canada
← Same phone already in system

Result: ✅ 1 imported  ⚠️ 1 duplicate detected
```

### CSV with Errors
```
fullName,phone,email,programInterest,destinationCountry
Jane Doe,555,jane@example.com,Masters,USA
       ↓
       Phone too short (5 digits, need 10+)

Result: ❌ Error: "Invalid phone number"
```

---

## Activity Log Entries

### CSV Import Log
```
Action: leads.bulk_imported
Message: Bulk imported 45 leads via CSV
Details:
  - Total rows: 50
  - Successfully imported: 45
  - Duplicates detected: 3
  - Errors: 2
  - Assignment strategy: round-robin
  - Actor: Admin (john@example.com)
  - Time: 2024-01-15 10:30:15 UTC
  - IP: 192.168.1.100
```

### Admin Status Override Log
```
Action: lead.admin_status_changed
Entity: Lead "John Smith" (ID: 5f9e1b...)
Change: Status "new" → "enrolled"
Message: Manually enrolled by admin
Details:
  - Before: {status: 'new', ...}
  - After: {status: 'enrolled', ...}
  - Actor: Admin (john@example.com)
  - Time: 2024-01-15 10:35:22 UTC
  - IP: 192.168.1.100
```

### Bulk Reassignment Log
```
Action: lead.admin_reassigned (multiple)
Message: Bulk reassigned 15 leads
Details:
  - Leads reassigned: 15
  - Strategy: round-robin
  - From various counselors
  - To: Automatically balanced
  - Actor: Admin (john@example.com)
  - Time: 2024-01-15 10:40:45 UTC
```

---

## Feature Matrix

| Feature | Admin | Counselor | Staff | Public |
|---------|-------|-----------|-------|--------|
| View all leads | ✅ | ❌ | ❌ | ❌ |
| CSV import | ✅ | ❌ | ❌ | ❌ |
| Bulk assign | ✅ | ❌ | ❌ | ❌ |
| Multi-select | ✅ | ❌ | ❌ | ❌ |
| Round-robin | ✅ | ❌ | ❌ | ❌ |
| Override status | ✅ | ❌ | ❌ | ❌ |
| Force reassign | ✅ | ❌ | ❌ | ❌ |
| Create lead | ✅ | ✅ | ❌ | ❌ |
| Edit own leads | ✅ | ✅ | ❌ | ❌ |
| Move next stage | ✅ | ✅ | ❌ | ❌ |
| View activity | ✅ | ✅ | ✅ | ❌ |

---

## Color Coding

- 🟣 **Purple** - Admin-only features/sections
- 🟢 **Green** - Success states
- 🟡 **Yellow** - Warnings (duplicates)
- 🔴 **Red** - Errors
- 🔵 **Blue** - Info/Primary actions
- ⚫ **Black** - Default/Neutral

---

## Button States

### Disabled (grayed out)
- "Assign" button when no leads selected
- "Reassign" button when no counselor selected
- CSV upload button when no file selected

### Loading (spinner)
- "Uploading..." during CSV import
- "Assigning..." during bulk assign
- "Reassigning..." during single reassign

### Active (enabled)
- "Import CSV" always available to admins
- "Assign (X)" when leads selected
- "Override Status" after status selected

---

## Error States

### CSV Import Errors
- "No file selected"
- "CSV file is empty"
- "Missing required fields: fullName, phone"
- "Phone too short (minimum 10 digits)"
- "Invalid email format"

### Assignment Errors
- "No leads selected"
- "No active counselors available"
- "Counselor not found"

### Status Override Errors
- "Invalid status"
- "Lead not found"
- "Reason required for 'lost' status"

---

## Quick Reference: What Changed

### Before (Users Only)
```
Leads Page:
├─ Filter & search leads
├─ View individual lead details
├─ Update lead through normal pipeline
└─ Limited operations

Admin Work:
└─ Create leads manually one by one
```

### After (With Admin Features)
```
Leads Page:
├─ Filter & search leads
├─ CSV import (admin)
├─ Bulk select (admin)
├─ Bulk assign (admin)
└─ Round-robin distribution (admin)

Lead Detail:
├─ Normal status pipeline
└─ Admin override controls (admin)

Admin Work:
├─ Import 100 leads at once
├─ Auto-distribute across team
├─ Override statuses for special cases
├─ Reassign on-demand
└─ Full audit trail of changes
```

---

## Key Takeaways

✅ **CSV Import** - Bulk leads with auto-assignment
✅ **Bulk Assign** - Multi-select + smart distribution
✅ **Admin Overrides** - No pipeline restrictions
✅ **Full Audit** - Track all admin actions
✅ **User-Friendly** - Clear admin vs. regular UI
✅ **Secure** - Role-based access control
✅ **Robust** - Error handling & validation

**All admin features are clearly marked and separated from regular user interface.**
