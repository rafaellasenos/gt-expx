import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? ''
  const company = searchParams.get('company') ?? ''
  const dateFrom = searchParams.get('dateFrom') ?? ''
  const dateTo = searchParams.get('dateTo') ?? ''

  const admin = createAdminClient()
  let query = admin.from('registrations').select('name, email, company, created_at')

  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  if (company) query = query.ilike('company', `%${company}%`)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) {
    const endOfDay = new Date(dateTo)
    endOfDay.setHours(23, 59, 59, 999)
    query = query.lte('created_at', endOfDay.toISOString())
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Erro ao exportar dados' }, { status: 500 })
  }

  const header = 'Nome,E-mail,Empresa,Data/Hora'
  const rows = (data ?? []).map(row => {
    const date = new Date(row.created_at).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    })
    return [
      `"${row.name.replace(/"/g, '""')}"`,
      `"${row.email.replace(/"/g, '""')}"`,
      `"${row.company.replace(/"/g, '""')}"`,
      `"${date}"`,
    ].join(',')
  })

  const csv = [header, ...rows].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="registros-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
