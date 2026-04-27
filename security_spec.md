# Security Specification - QQ4

## Data Invariants
1. **Users**: Users can only read and write their own profile. Wallet balance can only be updated via transactions (logic enforced in app, rules guard against arbitrary balance sets).
2. **Game Periods**: History is publicly readable. Only authenticated users can write (simulated game logic).
3. **Bets**: Users can only read their own bets. Bets must be linked to the user's UID.
4. **Transactions**: Users can only read their own transactions.

## The "Dirty Dozen" Payloads (Attacks)
1. **Identity Spoofing**: Attempting to set `uid` to another user's ID in `/users`.
2. **Shadow Updates**: Including `wallet: 999999` in a profile update.
3. **Cross-User Read**: Trying to `get` or `list` another user's bets.
4. **History Poisoning**: Authenticated user trying to overwrite a game result with a different outcome.
5. **Resource Exhaustion**: Sending a 1MB string as a `mobile` number.
6. **ID Injection**: Using a 1.5KB string as a document ID.
7. **Negative Bet**: Placing a bet with `amount: -100`.
8. **Auth-less Write**: Trying to create a bet without being signed in.
9. **Role Escalation**: Trying to create an `admins` document for themselves.
10. **State Skipping**: Updating a bet status from `pending` directly to `won` without valid game logic.
11. **PII Leak**: Unauthenticated user trying to list all user mobiles.
12. **Future Prediction**: Trying to read a "future" game period if it was secret (n/a here but good to consider).

## Test Runner
See `firestore.rules.test.ts` for implementation of these checks.
