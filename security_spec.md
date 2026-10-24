# Security Specification for Genesis Revitalization Group (GRG)

## Data Invariants
1. A user profile MUST match the authenticated user's UID and email.
2. Only staff or admins can read/write most clinical and operational data (leads, billing, facility presence).
3. Patients can only read their own appointments and profile.
4. Security alerts and audit logs can be created by any authenticated client but only read by admins.
5. All updates to sensitive fields (rules, status) MUST be tracked and restricted to higher tiers.
6. Documentation (Case Notes, Pulse Checks) must be linked to a valid staff ID.

## The "Dirty Dozen" Payloads (Deny Test Cases)
1. **Identity Spoofing**: Attempt to create a user profile with a UID different from the authenticated session.
2. **Role Escalation**: A staff member attempting to update their own role to 'admin'.
3. **Ghost State Update**: Attempting to update an appointment's status to 'completed' as a patient.
4. **Data Scraping**: Authenticated user attempting to list all user profiles or all geofence alerts.
5. **PII Breach**: A patient attempting to read another patient's appointment details.
6. **Orphaned Record**: Creating a staff training record for a non-existent staff member.
7. **Timestamp Tampering**: Sending a manual `createdAt` string instead of using server-derived time (validation check).
8. **Shadow Field Injection**: Adding an `isVerified: true` field to a lead submission.
9. **Geofence Bypass**: A user attempting to delete a geofence alert triggered by their device.
10. **Historical Tampering**: Attempting to update the `timestamp` of an already logged audit event.
11. **Malicious ID**: Attempting to create a document with a 1MB junk string as the document ID.
12. **PII List Query**: A staff member attempting to list ALL phiAccessLogs without any filters.

## The Test Runner Plan
- Verify that every collection has a `isValid[Entity]` check.
- Verify that `affectedKeys().hasOnly()` is used for every update action.
- Verify that `resource.data` is checked in all `list` operations to enforce owner/tier boundaries.
