# Admin Quick Start Guide

## New Admin Features Available

### 1. 📥 Bulk Import Leads from CSV

**When to use:** Import 10s or 100s of leads at once instead of creating them manually.

**How to use:**
1. Click **"Import CSV"** button on the Leads page
2. Click the upload area or select a CSV file from your computer
3. Choose your assignment strategy:
   - **Round Robin** - Automatically distributes leads among your team based on current workload
   - **Direct** - Assign all imported leads to one specific counselor
4. Click **"Import"**
5. Review the results showing:
   - ✅ Successfully imported leads
   - ⚠️ Duplicate leads (already in system)
   - ❌ Rows with errors

**CSV Format:**
```
fullName,phone,email,programInterest,destinationCountry
John Smith,+1 (555) 123-4567,john@example.com,MBA,Canada
Jane Doe,555-987-6543,jane@example.com,Masters,USA
```

See `CSV_IMPORT_GUIDE.md` for detailed instructions.

---

### 2. 🔄 Bulk Assign Leads

**When to use:** Quickly reassign multiple leads to different counselors or rebalance workload.

**How to use:**
1. On the Leads page, **check the boxes** next to leads you want to assign
2. Use the **"Select All"** checkbox to select all leads on current page
3. Click **"Assign (X)"** button
4. Choose assignment method:
   - **Round Robin** - Smart distribution based on current workload
   - **Direct** - Assign to one specific counselor
5. Click **"Assign"**

**Tips:**
- Combine with filters (status, source, counselor) to narrow selection
- Use round-robin to automatically balance team workload
- Use direct assignment for special cases (new counselor, specialized skills)

---

### 3. 👤 Admin Controls on Lead Detail Page

**When to use:** Override lead status/assignments for special cases or corrections.

**What you can do:**

#### Override Lead Status
- Click **"Override Status"** button
- Select ANY status from dropdown (no restrictions like regular users)
- Optionally add a note/reason
- Click **"Confirm"**

**Regular users vs Admin:**
- Regular users: Can only move leads through valid pipeline stages
- Admins: Can jump to any status (new → enrolled, new → lost, etc.)

#### Reassign Lead
- Click **"Admin"** button (purple section)
- Select a counselor from dropdown
- Click **"Reassign"**
- Counselor is immediately updated

---

## Common Admin Tasks

### Task: My team is overloaded, need to rebalance

1. Go to Leads page
2. Filter by counselor or status to see workload
3. Select leads to reassign
4. Click "Assign" → Choose "Round Robin"
5. System automatically distributes among team

### Task: Imported leads from a lead list, but wrong counselor

1. Go to Leads page
2. Filter by source = "csv_import" 
3. Select all leads from that import
4. Click "Assign" → Choose "Direct Assignment"
5. Select correct counselor
6. Click "Assign"

### Task: Lead needs emergency status override

1. Open lead detail page
2. Click "Admin" button → Review admin capabilities
3. Click "Override Status" button
4. Select desired status
5. Add reason (e.g., "Enrolled by university")
6. Click "Confirm"

Monitor activity logs to track all changes.

### Task: Reassign single lead to different counselor

1. Open lead detail page
2. Click "Admin" button
3. Select new counselor from dropdown
4. Click "Reassign"

---

## What Gets Tracked?

All admin actions are logged with:
- ✅ Who made the change (admin username)
- ✅ What was changed (before/after values)
- ✅ When it happened (timestamp)
- ✅ Why (optional reason field)
- ✅ Where the change came from (IP address)

**View logs in:** Activity section (if enabled)

---

## Visibility & Permissions

**Admin-only features hidden from:**
- ✗ Counselors (can only see/manage their own leads)
- ✗ Other staff (see standard leads interface)

**What each role can do:**

| Action | Admin | Counselor | Other |
|--------|-------|-----------|-------|
| View all leads | ✅ | ❌ (own only) | ❌ |
| Create lead | ✅ | ✅ | ❌ |
| CSV import | ✅ | ❌ | ❌ |
| Bulk assign | ✅ | ❌ | ❌ |
| Override status | ✅ | ❌ | ❌ |
| Reassign lead | ✅ | ❌ | ❌ |
| Follow normal pipeline | ✅ | ✅ | ❌ |
| Delete lead | ✅ | ❌ | ❌ |

---

## Tips & Best Practices

✅ **DO:**
- Use round-robin for automatic workload balancing
- Filter leads before bulk operations (target specific imports/sources)
- Document reasons when overriding lead status
- Review import results for duplicates/errors

❌ **DON'T:**
- Upload very large CSV files (test with small batches first)
- Override status without checking lead history (understand why current status)
- Reassign leads without communicating with team
- Create manual leads when CSV import could do bulk work

---

## Troubleshooting

**Q: Import says duplicates found, what does this mean?**
A: Those leads already exist in system (matched by phone number). They were skipped to prevent duplicates. You can manually check if they're the same person.

**Q: Round robin assigned same counselor twice. Why?**
A: That counselor had the lowest workload. System optimizes for balanced distribution.

**Q: Can I undo an admin action?**
A: No - actions are permanent. Check activity logs to see what changed. You can manually reassign if needed.

**Q: CSV upload failed, what's wrong?**
A: Check the error messages in results screen. Common issues:
- Missing required columns (fullName, phone)
- Phone numbers with fewer than 10 digits
- Wrong CSV encoding (use UTF-8)

---

## Support

For questions about these features:
- Check `CSV_IMPORT_GUIDE.md` for CSV-specific help
- Review `ADMIN_FEATURES_IMPLEMENTATION.md` for technical details
- Check activity logs to audit all changes
