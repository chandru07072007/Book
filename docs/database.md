# Database Notes

Primary schema and seed SQL lives in `supabase_schema.sql`.

## Main tables

- `users`
- `resources`
- `requests`
- `schedules`
- `lending_history`

## Security warning for schema defaults

The current SQL includes permissive development RLS policies such as:

- `CREATE POLICY "Allow all on ..." ... USING (true) WITH CHECK (true)`

Treat this as demo/development setup only. Before production, replace with strict authenticated policies per table and operation.
