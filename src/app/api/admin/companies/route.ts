import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('registrations')
    .select('company')

  if (error) {
    console.error('[companies] Query error:', error)
    return NextResponse.json({ error: 'Erro ao buscar empresas' }, { status: 500 })
  }

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    const name = (row.company ?? '').trim()
    if (name) counts[name] = (counts[name] ?? 0) + 1
  }

  const companies = Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pt-BR'))

  return NextResponse.json({ companies, total: companies.length })
}
