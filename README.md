# CoMail

This repository contains the public email application for commissioner email archives.

## Visibility Rule Split

Public visibility is enforced by `CoMail`, not by `GFIDataLoader`.

`GFIDataLoader` is an external process and is not part of this repository.

- `GFIDataLoader` loads qualifying commissioner emails into `PublicEmail`.
- `CoMail` decides whether an email is visible to the public.

For public users, an email must satisfy both rules:

- `ISNULL(ignore, 0) = 0`
- `dateReceived < CAST(DATEADD(DAY, -2, GETDATE()) AS date)`

Internal mailbox owners and authorized security groups can view restricted emails that do not meet the public visibility rules.

## SQL Scripts

Deployment and maintenance scripts for the `PublicEmail` database are stored in `Sql/`(not included in this repository).
