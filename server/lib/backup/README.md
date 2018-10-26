# Backup and Restore

## Backup

Backups are run every morining by the [AppEngine Cron](../../cron.yaml).  The cron hits the endpoint /api/cron/backup which is only accessable to admins and AppEngine.

This backup endpoint creates a [jsonl](http://jsonlines.org/) file and stores in Google Cloud Store.  Each line has the following structure:

```
{
  collection : String,
  id : String,
  data : Object
}
```

Google Cloud Storage bucket names and collections to backup are defined in the [config.js](../../config.js) file.

Backups are store for the last week and the first of every month for the last year.

## Restore

WARNING: this drops the current Firestore DB!

Restores are preformed manually via the command line.  To run a restore, cd to this dir and run:

```
node restore 2018-10-16
```

Note.  The project which is restored is based on your service-account.json file.
