# FF Tournament Hub

## Local run
1. Install Node.js 18+
2. Run `npm install`
3. Set `JWT_SECRET` to a long random secret.
4. Create an admin user by editing `data.json` after first signup: change that user's `"role"` from `"user"` to `"admin"`.
5. Run `npm start`
6. Open http://localhost:10000

## Render
Create a Web Service from this GitHub repository.
Build command: `npm install`
Start command: `npm start`
Add environment variable:
`JWT_SECRET` = a long random value.

## Important
This starter uses a JSON file for demonstration. For production, migrate users/tournaments to PostgreSQL and use proper email verification, password reset, rate limiting, secure secrets, backups, and server-side authorization.

Payment/UPI fields are intentionally not implemented as real-money processing in this starter. Add a compliant payment provider only after its requirements and applicable rules are checked.
