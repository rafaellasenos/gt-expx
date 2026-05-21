import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('settings')
    .select('key, value')
    .in('key', ['meet_link', 'meeting_title'])

  if (error) {
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 })
  }

  const settings = (data ?? []).reduce((acc, row) => {
    acc[row.key] = row.value
    return acc
  }, {} as Record<string, string>)

  return NextResponse.json({
    meet_link: settings['meet_link'] ?? '',
    meeting_title: settings['meeting_title'] ?? '',
  })
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const { meet_link, meeting_title } = body

  const errors: Record<string, string> = {}

  if (meet_link !== undefined && meet_link !== '') {
    if (!meet_link.startsWith('https://meet.google.com/')) {
      errors.meet_link = 'O link deve começar com https://meet.google.com/'
    }
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'Dados inválidos', details: errors }, { status: 400 })
  }

  const admin = createAdminClient()
  const updates: Array<{ key: string; value: string }> = []

  if (meet_link) updates.push({ key: 'meet_link', value: meet_link })
  if (meeting_title) updates.push({ key: 'meeting_title', value: meeting_title })

  for (const update of updates) {
    const { error } = await admin
      .from('settings')
      .update({ value: update.value })
      .eq('key', update.key)

    if (error) {
      return NextResponse.json({ error: `Erro ao atualizar ${update.key}` }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
