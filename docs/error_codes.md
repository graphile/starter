# Error codes

PostgreSQL has a built in list of error codes that are associated with the
errors that it produces. These are outlined
[in the PostgreSQL documentation](https://www.postgresql.org/docs/current/errcodes-appendix.html).

Our custom functions may also raise exceptions with custom error codes. When we
add a custom errorcode to our database, we document it in this file.

## Error code rules

To try and avoid clashes with present or future PostgreSQL error codes, we
require that all custom error codes match the following criteria:

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

- FFFFF: unknown error
- DNIED: permission denied
- NUNIQ: not unique (from PostgreSQL 23505)
- NTFND: not found
- BADFK: foreign key violation (from PostgreSQL 23503)

## Registration

- MODAT: more data required (e.g. missing email address)

## Authentication

- WEAKP: password is too weak
- LOCKD: too many failed login/password reset attempts; try again in 6 hours
- TAKEN: a different user account is already linked to this profile
- EMTKN: a different user account is already linked to this email
- CREDS: bad credentials (incorrect username/password)
- LOGIN: you're not logged in

## Email management

- VRFY1: you need to verify your email before you can do that
- VRFY2: the target user needs to verify their email before you can do that
- CDLEA: cannot delete last email address (or last verified email address if you
  have verified email addresses)

## Organization membership

- ISMBR: this person is already a member

## Deleting account

- OWNER: you cannot delete your account because you are the owner of an
  organization
