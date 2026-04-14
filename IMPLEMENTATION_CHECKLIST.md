# Admin Features - Implementation Checklist

## ✅ Installation & Setup

- [ ] Install csv-parse dependency: `npm install csv-parse` in server folder
- [ ] Restart backend server
- [ ] Frontend rebuilds automatically (or manually run build)
- [ ] Verify no errors in browser console
- [ ] Verify no errors in server logs

## ✅ Backend Verification

### Controllers
- [ ] Lead controller has new functions imported from file
- [ ] `importLeadsFromCsv()` handles CSV parsing correctly
- [ ] `getNextCounsellor()` implements round-robin algorithm
- [ ] `adminUpdateLead()` allows any field override
- [ ] `adminReassignLead()` validates counselor exists
- [ ] `adminUpdateLeadStatus()` accepts any status
- [ ] `bulkAssignLeads()` handles both strategies
- [ ] `getCounsellors()` returns active counselors only

### Routes
- [ ] Admin routes defined BEFORE parameterized :id routes
- [ ] All admin routes have `adminOnly` middleware
- [ ] Multer configured for CSV file upload
- [ ] Routes match API documentation

### Database
- [ ] No schema changes needed (using existing fields)
- [ ] ActivityLog schema supports tracking
- [ ] Indexes on Lead model are sufficient

## ✅ Frontend Verification

### Components Created
- [ ] `CSVUploadDialog.jsx` exists and renders
- [ ] `LeadAssignmentDialog.jsx` exists and renders
- [ ] Both components receive and handle props correctly
- [ ] Dialogs open/close properly
- [ ] Form validation works

### LeadsPage Updates
- [ ] Admin multi-select checkboxes visible to admins only
- [ ] "Select All" checkbox works
- [ ] "Import CSV" button appears (admin only)
- [ ] "Assign (X)" button conditional display works
- [ ] Selected leads highlight in blue
- [ ] Selection state managed correctly

### LeadDetailPage Updates
- [ ] Admin Controls panel appears (admin only)
- [ ] Purple styling applied correctly
- [ ] Reassign dropdown populates with counselors
- [ ] "Override Status" button text differs from regular
- [ ] Status dropdown shows all statuses for admins
- [ ] Status dropdown shows limited statuses for users
- [ ] Reassignment form works
- [ ] Status override form works

### API Client
- [ ] `getCounsellors()` method exists
- [ ] `importCsv()` creates FormData correctly
- [ ] `bulkAssign()` sends correct payload
- [ ] Admin methods use correct endpoints
- [ ] All methods handle errors properly

### Hooks
- [ ] All three admin hooks exported
- [ ] Hooks use correct API methods
- [ ] Query cache invalidation works
- [ ] Error handling shows toast messages
- [ ] Success handlers work correctly

## ✅ Functionality Testing

### CSV Import
- [ ] Dialog opens when clicking "Import CSV"
- [ ] File upload accepts CSV files
- [ ] File selection displays filename
- [ ] Drag-drop functionality works
- [ ] CSV format requirements displayed
- [ ] Round-robin strategy option works
- [ ] Direct strategy option works
- [ ] Counselor dropdown appears for direct strategy
- [ ] Counselor dropdown populates
- [ ] Import button disabled until file selected
- [ ] Upload processes file correctly
- [ ] Results show imported count
- [ ] Results show duplicate count with details
- [ ] Results show error count with row numbers
- [ ] Close button clears dialog state
- [ ] Success toast appears after import
- [ ] Error toast appears on failure

### Bulk Assignment
- [ ] Checkboxes appear only for admins
- [ ] Checkboxes can be checked/unchecked individually
- [ ] "Select All" checkbox selects all on page
- [ ] "Select All" unchecked when some deselected
- [ ] "Assign (X)" button shows correct count
- [ ] "Assign (X)" button hidden when no selection
- [ ] Dialog opens with correct lead count
- [ ] Strategy selection works in dialog
- [ ] Counselor dropdown appears for direct strategy
- [ ] Assignment executes correctly
- [ ] Leads show new counselor after assignment
- [ ] Success toast appears
- [ ] Dialog closes after success
- [ ] Query cache invalidates (leads update)

### Admin Controls
- [ ] Admin button appears on lead detail (admin only)
- [ ] Admin button hidden for non-admins
- [ ] Admin controls panel shows counselor dropdown
- [ ] Admin controls panel shows reassign button
- [ ] Reassign dropdown populates with counselors
- [ ] Reassignment works (lead gets new counselor)
- [ ] Override Status button text different for admins
- [ ] Override Status shows all statuses for admins
- [ ] Override Status shows limited statuses for users
- [ ] Status override works
- [ ] Lost reason field appears when selecting lost
- [ ] Changes persist after page refresh
- [ ] Activity logs updated with changes

## ✅ Security Testing

### Authorization
- [ ] Non-admin cannot see CSV import button
- [ ] Non-admin cannot see multi-select checkboxes
- [ ] Non-admin cannot see "Assign" button
- [ ] Non-admin cannot see Admin controls on detail
- [ ] API returns 403 if non-admin calls admin endpoint
- [ ] API returns 401 if no token provided
- [ ] API validates admin role
- [ ] JWT token required for all endpoints

### Validation
- [ ] CSV with missing required fields rejected
- [ ] CSV with invalid phone rejected
- [ ] CSV with short phone (< 10 digits) rejected
- [ ] Empty CSV file rejected
- [ ] Non-CSV file rejected
- [ ] Phone normalization handles various formats
- [ ] Email validation works
- [ ] Duplicate detection by phone works
- [ ] Counselor ID validation works
- [ ] Status enum validation works

### Audit Trail
- [ ] CSV import creates ActivityLog entry
- [ ] Bulk assign creates ActivityLog entries
- [ ] Admin reassignment creates ActivityLog entry
- [ ] Admin status change creates ActivityLog entry
- [ ] ActivityLog includes actor (user ID)
- [ ] ActivityLog includes timestamp
- [ ] ActivityLog includes before/after state
- [ ] ActivityLog includes IP address
- [ ] ActivityLog includes action type

## ✅ Error Handling

### CSV Import Errors
- [ ] No file error message shown
- [ ] Empty CSV error message shown
- [ ] Missing fields error message shown
- [ ] Invalid phone error message shown
- [ ] Duplicate detected properly (not errored)
- [ ] Error results shown in UI
- [ ] User can see which rows failed
- [ ] User can see why rows failed

### Assignment Errors
- [ ] No leads selected error shown
- [ ] No counselor available error handled
- [ ] Invalid counselor error shown
- [ ] Network errors handled gracefully

### Status Override Errors
- [ ] Invalid status rejected
- [ ] Lead not found error shown
- [ ] Lost status requires reason
- [ ] Reason field validates

## ✅ Performance

- [ ] CSV import handles 500+ leads efficiently
- [ ] Round-robin algorithm doesn't bottleneck
- [ ] Query cache properly invalidates
- [ ] No memory leaks on dialog open/close
- [ ] UI responsive during import
- [ ] No console errors or warnings

## ✅ Edge Cases

- [ ] Empty lead list doesn't crash
- [ ] Single lead assignment works
- [ ] All leads in system assigned at once
- [ ] Duplicate phone in same CSV handled
- [ ] Phone with leading zeros preserved
- [ ] Email with special chars handled
- [ ] Names with unicode characters work
- [ ] Very long names truncate gracefully
- [ ] CSV with Windows line endings works
- [ ] CSV with Mac line endings works
- [ ] CSV with Unix line endings works
- [ ] CSV with no trailing newline works
- [ ] Large file (5MB) handles correctly
- [ ] File over limit rejected

## ✅ Browser Compatibility

- [ ] Works in Chrome
- [ ] Works in Firefox  
- [ ] Works in Safari
- [ ] File upload works
- [ ] Drag-drop works
- [ ] Checkboxes work
- [ ] Dropdowns work
- [ ] Forms submit correctly

## ✅ Mobile Responsiveness

- [ ] Dialog responsive on mobile
- [ ] Checkboxes clickable on mobile
- [ ] Buttons accessible on mobile
- [ ] Dropdowns functional on mobile
- [ ] File upload works on mobile
- [ ] No layout breaking

## ✅ Documentation

- [ ] `IMPLEMENTATION_COMPLETE.md` created
- [ ] `ADMIN_FEATURES_TECHNICAL_REFERENCE.md` created
- [ ] `ADMIN_QUICK_START_GUIDE.md` created
- [ ] `CSV_IMPORT_GUIDE.md` created
- [ ] `ADMIN_FEATURES_VISUAL_GUIDE.md` created
- [ ] All guides are clear and up-to-date
- [ ] API endpoints documented
- [ ] Examples provided and accurate

## ✅ Code Quality

- [ ] No console errors
- [ ] No console warnings
- [ ] No ESLint violations
- [ ] Code follows project conventions
- [ ] Comments added where needed
- [ ] Functions properly documented
- [ ] Error messages user-friendly
- [ ] No hardcoded values
- [ ] No console.log() left in production code

## ✅ Database

- [ ] Lead schema supports all new operations
- [ ] ActivityLog created and working
- [ ] Duplicate detection by phone works
- [ ] Round-robin query efficient
- [ ] Index queries perform well
- [ ] Bulk operations don't timeout

## ✅ Integration

- [ ] CSV import creates tasks correctly
- [ ] Tasks have correct SLA
- [ ] Source tracking works (csv_import)
- [ ] Leads appear in list after import
- [ ] Assigned counselors visible
- [ ] Status changes reflected in UI

## ✅ Regression Testing

- [ ] Regular lead creation still works
- [ ] Regular status updates still work
- [ ] Counselor status updates still work
- [ ] Lead deletion still works
- [ ] Filters still work
- [ ] Search still work
- [ ] Pagination still works
- [ ] Role-based access control still works

## ✅ Production Deployments

Before deploying to production:

- [ ] Run full test suite
- [ ] Test with realistic data volume (1000+ leads)
- [ ] Test with real CSV samples
- [ ] Monitor server performance
- [ ] Check disk space for uploaded files
- [ ] Set up logging/monitoring for admin operations
- [ ] Configure rate limiting appropriately
- [ ] Set file upload size limits
- [ ] Configure AWS/storage if needed
- [ ] Backup data before deploying
- [ ] Have rollback plan ready
- [ ] Communicate feature to admin users
- [ ] Provide training on new features
- [ ] Document in team documentation
- [ ] Update user access policies if needed

## ✅ Post-Deployment

After deploying:

- [ ] Monitor for errors in logs
- [ ] Check activity logs for use
- [ ] Get feedback from admins
- [ ] Monitor performance metrics
- [ ] Check for any security issues
- [ ] Respond to any user questions
- [ ] Document any issues found
- [ ] Plan fixes if needed

## ✅ Sign-Off

- [ ] Product owner approves features
- [ ] QA signs off on testing
- [ ] Security team reviews code
- [ ] Performance tested and approved
- [ ] Documentation complete and reviewed
- [ ] Deployment plan documented
- [ ] Team trained on new features
- [ ] Ready for production release

---

## Notes for QA Team

### Test Data Preparation
```csv
fullName,phone,email,programInterest,destinationCountry
John Smith,5551234567,john@example.com,MBA,Canada
Jane Doe,5559876543,jane@example.com,Masters,USA
Bob Johnson,5551112222,,Engineering,Australia
```

### Scenarios to Test

1. **Happy Path - CSV Import**
   - Upload CSV with 10-20 valid leads
   - Use round-robin strategy
   - Verify all imported
   - Verify distributed to counselors

2. **Edge Case - Duplicates**
   - Upload CSV with 5 exact duplicates
   - Verify duplicates detected but not errored
   - Verify user sees duplicate report

3. **Error Handling - Invalid Data**
   - Upload CSV with short phone numbers
   - Upload CSV with missing names
   - Verify errors reported with row numbers

4. **Bulk Assignment**
   - Select 5 leads
   - Use direct strategy
   - Verify all assigned to same counselor

5. **Admin Override**
   - Open lead in admin mode
   - Directly assign to enrolled status
   - Verify non-admin can't do this
   - Verify logged in activity trail

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| CSV import button not showing | Verify user is admin, check browser cache |
| Round-robin assigning to same person | Check that person has fewest leads (it's correct) |
| Phone normalization failing | Ensure min 10 digits after removing special chars |
| Authorization errors | Verify JWT token, check role in token |
| Duplicate detection too strict | It uses phone number - exact match only |

---

## Success Criteria Met

✅ CSV bulk import with round-robin option
✅ CSV bulk import with direct assignment option  
✅ Bulk lead reassignment from leads page
✅ Admin status override on lead detail
✅ Admin lead reassignment on lead detail
✅ Full audit trail of admin operations
✅ Non-admin users cannot see admin features
✅ Proper error handling and user feedback
✅ Comprehensive documentation
