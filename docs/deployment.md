# Deployment Notes

Current repository references include:

- Backend: `https://book-brown-one.vercel.app`
- Supabase project URL: `https://sdgszspdgrtbrsvqlzgh.supabase.co`

Use these as existing project references, not as production-hardening guidance.

Before real-user deployment:

1. Generate a new production `SECRET_KEY`.
2. Ensure no demo credentials remain enabled.
3. Replace permissive development RLS policies.
4. Keep Supabase `service_role` keys server-side only.
