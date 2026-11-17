# Architecture rules

- Keep the catalog-exported SQL baseline in `supabase/migrations` as new-database-only history, never apply it to the existing schema; it records existing objects rather than introducing database changes.