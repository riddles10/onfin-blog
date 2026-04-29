// Liveness/readiness probe used by the Dockerfile HEALTHCHECK and by the
// Nginx reverse proxy upstream check. Deliberately avoids touching Supabase
// or any external service — its only job is to confirm that the Next.js
// server itself is up and routing.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  return Response.json({ status: 'ok', uptime: process.uptime() })
}
