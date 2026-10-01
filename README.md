# I Love C

A private shared home for C & C: dates, tasks, budget, watchlist, gallery, bucket list and music, built with React, Vite and Supabase, and deployed on Netlify.

## Run it locally

```bash
cp .env.example .env   # then fill in the values
npm install
npm run dev
```

`npm run dev` also serves the TMDB proxy at `/api/tmdb`, using `TMDB_API_KEY` from `.env`.

To look around without signing in, open `/?demo` (dev builds only). It answers every request from in-memory sample data. `/?demo=off` turns it off.

## Environment

| Variable | Where | What |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env`, Netlify | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env`, Netlify | Supabase anon key. Public by design; RLS protects the data |
| `TMDB_API_KEY` | `.env`, Netlify | Read server-side by `netlify/functions/tmdb.mts`, never bundled |

## Backend

The schema lives in `supabase/migrations`. Every table has Row Level Security: only accounts listed in `public.members` can read or write anything, and photos sit in a private Storage bucket served through signed URLs. Both phones stay in sync through Supabase Realtime.

### Accounts

There is no sign-up. To give someone access:

1. In the Supabase dashboard, open **Authentication > Users > Add user**, enter an email and password, and tick **Auto Confirm User**.
2. Link the account as Him or Her in the SQL editor:

   ```sql
   insert into public.members (user_id, person)
   select id, 'him' from auth.users where email = 'his@example.com';
   ```

An account that signs in without a `members` row sees an "Almost there" screen and no data.

Also turn off **Authentication > Sign In / Providers > Allow new users to sign up**. Unlinked accounts can't see anything either way, but there's no reason to allow them.

### Changing the schema

Add a new file to `supabase/migrations`, apply it, then regenerate `src/types/database.ts` (`supabase gen types typescript`).
