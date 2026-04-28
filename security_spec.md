# Security Specification

## Data Invariants
1. Users can only read and write their own profile data (except admins).
2. Transactions are created by users with status 'pending' and can only be approved/rejected by admins.
3. Users cannot modify the 'status' or 'amount' of a transaction once created.
4. Bets are immutable once created, status is updated by the system/host logic.
5. Gift codes are created by admins and claimed by users.

## The "Dirty Dozen" Payloads (Test Vectors)
1. **Identity Spoofing**: Attempt to create a transaction with `userId` of another user.
2. **Status Escalation**: Attempt to create a transaction with `status: 'success'`.
3. **Wallet Injection**: User attempting to directly `update` their `wallet` field.
4. **ID Poisoning**: Attempt to create a transaction with a 2MB string as ID.
5. **PII Leak**: Non-admin attempting to list all `users`.
6. **Double Claiming**: Claiming a gift code more than once.
7. **Negative Bet**: Placing a bet with a negative amount.
8. **Admin Impersonation**: Attempting to write to `gift_codes` as a normal user.
9. **Result Forgery**: Attempting to write to `game_periods/history` as a normal user.
10. **Shadow Field**: Adding a `role: 'admin'` to user profile during registration.
11. **Timestamp Forgery**: Use a client timestamp for `createdAt` instead of `serverTimestamp()`.
12. **Cross-User Withdrawal**: Requesting withdrawal to a number not bound to the user.

## The Test Runner (Plan)
The tests will verify that ALL above malicious payloads return `PERMISSION_DENIED`.
Rules will enforce:
- `isOwner(userId)`
- `isAdmin()`
- `isValidTransaction()`
- `isValidBet()`
- `isValidGiftCode()`
