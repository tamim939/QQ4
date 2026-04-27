# Firestore Security Specification

## Data Invariants
1. Users can only access their own profile.
2. Users can only manage their own bets and transactions.
3. Game history is public for reading but requires authentication for writing (for demo hosting logic).
4. Timestamp fields must be server-generated.
5. PII (if any) must be protected.

## The Dirty Dozen Payloads
We will test these payloads against our rules to ensure they are rejected.

1. **Identity Spoofing**: Attempt to create a user profile for someone else.
   - `PUT /users/victim-id { "uid": "attacker-id", ... }` -> DENIED
2. **Wallet Manipulation**: Attempt to increment own wallet balance directly.
   - `UPDATE /users/my-id { "wallet": 999999 }` -> DENIED (should only be via transactions)
3. **Ghost Field Injection**: Adding admin flags to profile.
   - `UPDATE /users/my-id { "isAdmin": true }` -> DENIED
4. **Orphaned Bet**: Creating a bet for a non-existent user.
   - `CREATE /bets/bet-id { "userId": "non-existent", ... }` -> DENIED
5. **Past Bet Creation**: Creating a bet for a period that has already ended.
   - `CREATE /bets/bet-id { "timestamp": "2020-01-01...", ... }` -> DENIED
6. **Result Tampering**: Overwriting a game result that already exists.
   - `UPDATE /game_periods/30/history/old-period { "number": 7 }` -> DENIED
7. **Resource Poisoning**: Injecting 1MB string as period ID.
   - `CREATE /game_periods/30/history/[1MB-STRING]` -> DENIED
8. **PII Leak**: Reading someone else's profile.
   - `GET /users/victim-id` -> DENIED
9. **History Wipe**: Deleting game history.
   - `DELETE /game_periods/30/history/some-id` -> DENIED
10. **Transaction Forgery**: Creating a 'success' deposit without approval.
    - `CREATE /transactions/tx-id { "status": "success", ... }` -> DENIED
11. **Negative Bet**: Betting a negative amount.
    - `CREATE /bets/bet-id { "amount": -100 }` -> DENIED
12. **Status Shortcutting**: Directly updating a bet to 'won'.
    - `UPDATE /bets/bet-id { "status": "won" }` -> DENIED

## Red Team Conflict Report (Anticipated)
| Collection | Identity Spoofing | State Shortcutting | Resource Poisoning |
|------------|-------------------|--------------------|--------------------|
| users      | Blocked via UID   | N/A                | id.size() guard    |
| game_hist  | Blocked via match | Immutable results  | isValidId() guard  |
| bets       | Blocked via UID   | Status locking     | id.size() guard    |
| txs        | Blocked via UID   | Status locking     | id.size() guard    |
