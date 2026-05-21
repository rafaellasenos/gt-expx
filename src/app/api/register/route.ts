import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

function isValidEmail(email: string): boolean {
  return /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, company } = body

    const errors: Record<string, string> = {}
    if (!name || name.trim().length < 2) errors.name = 'Nome deve ter pelo menos 2 caracteres'
    if (!email || !isValidEmail(email)) errors.email = 'E-mail inválido'
    if (!company || company.trim().length < 2) errors.company = 'Nome da empresa deve ter pelo menos 2 caracteres'

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Dados inválidos', details: errors }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error: insertError } = await supabase
      .from('registrations')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company.trim(),
        ip_address: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? null,
        user_agent: request.headers.get('user-agent') ?? null,
      })

    if (insertError) {
      console.error('[register] Insert error:', insertError)
      return NextResponse.json({ error: 'Erro ao salvar registro. Tente novamente.' }, { status: 503 })
    }

    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('key, value')
      .eq('key', 'meet_link')
      .single()

    if (settingsError || !settings?.value || settings.value === 'https://meet.google.com/configure-seu-link') {
      return NextResponse.json({
        error: 'Reunião não disponível no momento. Entre em contato com o organizador.'
      }, { status: 503 })
    }

    return NextResponse.json({ success: true, meetLink: settings.value })

  } catch {
    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 })
  }
}
