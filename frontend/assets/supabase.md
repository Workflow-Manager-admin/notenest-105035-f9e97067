# Supabase Integration for NoteNest (Frontend)

NoteNest uses Supabase for backend data storage and real-time updates. Supabase is initialized in `src/App.js`
using the provided SUPABASE_URL and SUPABASE_KEY.

## Supabase Table: `notes`

Columns:
- `id` (uuid, primary key, auto-generated)
- `title` (text)
- `body` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## How to connect (JS)

```js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = '<provided-supabase-url>';
const SUPABASE_KEY = '<provided-supabase-key>';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
```

## Usage

The frontend uses Supabase to:
- Fetch all notes
- Filter/search notes client-side
- Create new notes
- Edit (update) notes
- Delete notes

All interactions are performed using Supabase JS SDK (`@supabase/supabase-js`). Update credentials via `.env` for production.

## Setup (in production)

Add these to your `.env` file in the root `frontend/` (do NOT expose secrets for production):

```
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_KEY=...
```

And initialize via `process.env.REACT_APP_SUPABASE_URL` etc.
