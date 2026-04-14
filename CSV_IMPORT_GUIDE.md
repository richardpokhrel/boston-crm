# CSV Import Guide for Bulk Lead Upload

## CSV Format

The CSV file should contain the following columns (header row required):

### Required Columns:
- **fullName** - Lead's full name (string)
- **phone** - Contact phone number (string, will be normalized to digits only)

### Optional Columns:
- **email** - Email address (string, will be converted to lowercase)
- **programInterest** - Program name or interest (string)
- **destinationCountry** - Destination country (string)

## Example CSV Template

```
fullName,phone,email,programInterest,destinationCountry
John Smith,+1 (555) 123-4567,john@example.com,MBA,Canada
Jane Doe,555-987-6543,jane@example.com,Masters,USA
Bob Johnson,5551112222,,Engineering,Australia
```

## Important Notes

1. **Phone Normalization**: Phone numbers will be automatically normalized (only digits kept). Minimum 10 digits required.
2. **Duplicate Detection**: Leads are checked for duplicates using phone number. Duplicates will be reported but not imported.
3. **Assignment Strategies**:
   - **Round Robin**: Automatically distributes leads among active counsellors based on current workload (counsellor with fewest leads gets assigned first)
   - **Direct Assignment**: Assign all imported leads to a specific counsellor

4. **Automatic Processing**:
   - Each imported lead automatically gets a "First Contact" task with 2-hour SLA
   - Each lead is marked with source = "csv_import"
   - Created with status = "new"

## CSV File Requirements

- Format: Plain text CSV (comma-separated values)
- Encoding: UTF-8
- Max file size: Recommended under 5MB (typically supports 1000+ leads per file)
- Header row required on first line

## Sample CSV Download

You can download a template CSV file and fill it with your lead data:

```csv
fullName,phone,email,programInterest,destinationCountry
```

## Error Handling

The import process will provide detailed feedback:
- ✅ Successfully imported leads count
- ⚠️ Duplicate leads (phone already exists in system)
- ❌ Failed rows with specific error messages (invalid phone, missing fields, etc.)

## Tips for Best Results

1. Ensure phone numbers have at least 10 digits
2. Remove any special characters from phone numbers or let the system normalize them
3. Include email if available (helps with follow-up)
4. Test with a small batch first (10-20 leads) before doing bulk imports
5. Use round-robin for balanced distribution across your team
