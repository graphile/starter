# Error codes

Errors from PostGraphile may come through with one of these error codes.

## Error code rules

Some error codes are [reserved by
PostgreSQL](https://www.postgresql.org/docs/current/errcodes-appendix.html),
so error codes we use must match these criteria:

- 5 alphanumeric (capitals) letters
- First character must be a letter
- First character cannot be F, H, P or X.
- Third character cannot be 0 or P.
- Fourth character must be a letter.
- Must not end `000`

Rewritten, the above rules state:

- Char 1: A-Z except F, H, P, X
- Char 2: A-Z0-9
- Char 3: A-Z0-9 except 0, P
- Char 4: A-Z
- Char 5: A-Z0-9

## General

FFFFF: unknown error

## Authentication

- WEAKP: password is too weak
- LOCKD: too many failed login/password reset attempts; try again in 6 hours
- TAKEN: a different user account is already linked to this profile
- EMTKN: a different user account is already linked to this email
- CREDS: bad credentials (incorrect username/password)
