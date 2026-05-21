'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'

interface FormData {
  name: string
  email: string
  company: string
}

interface FormErrors {
  name?: string
  email?: string
  company?: string
}

export default function RegisterPage() {
  const [meetingTitle, setMeetingTitle] = useState('Reunião Online')
  const [form, setForm] = useState<FormData>({ name: '', email: '', company: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'meeting_title')
      .single()
      .then(({ data }) => {
        if (data?.value) setMeetingTitle(data.value)
      })
  }, [])

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    }
    if (!form.email || !/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(form.email)) {
      newErrors.email = 'Digite um e-mail válido'
    }
    if (!form.company.trim() || form.company.trim().length < 2) {
      newErrors.company = 'Nome da empresa deve ter pelo menos 2 caracteres'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setServerError('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setServerError(data.error ?? 'Erro ao processar. Tente novamente.')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = data.meetLink
      }, 1500)

    } catch {
      setServerError('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center rounded-2xl bg-gray-900 px-6 py-3 mb-6">
            <Image
              src="/logo-expx.png"
              alt="EXPX"
              width={120}
              height={31}
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            Pronto para<br />o GT de hoje?
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Preencha seus dados para entrar na reunião
          </p>
        </div>

        <Card className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold text-gray-900">Tudo certo!</p>
              <p className="text-gray-500 text-sm mt-1">Redirecionando para a reunião...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="name"
                label="Nome completo"
                type="text"
                placeholder="Seu nome"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
                autoComplete="name"
              />
              <Input
                id="email"
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
                autoComplete="email"
              />
              <Input
                id="company"
                label="Nome da empresa"
                type="text"
                placeholder="Sua empresa"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                error={errors.company}
                autoComplete="organization"
              />

              {serverError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              <Button type="submit" loading={loading} className="w-full mt-2">
                {loading ? 'Aguarde...' : 'Entrar na Reunião →'}
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          🔒 Seus dados estão protegidos e não serão compartilhados
        </p>
      </div>
    </div>
  )
}
