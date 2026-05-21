'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/AdminLayout'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'

export default function SettingsPage() {
  const [meetLink, setMeetLink] = useState('')
  const [meetingTitle, setMeetingTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        setMeetLink(data.meet_link ?? '')
        setMeetingTitle(data.meeting_title ?? '')
      })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    if (meetLink && !meetLink.startsWith('https://meet.google.com/')) {
      setErrors({ meet_link: 'O link deve começar com https://meet.google.com/' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meet_link: meetLink, meeting_title: meetingTitle }),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-lg">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Configurações</h1>

        <Card className="p-6">
          <form onSubmit={handleSave} className="space-y-5">
            <Input
              id="meeting_title"
              label="Título da reunião"
              type="text"
              placeholder="Ex: Reunião EXPX"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
            />

            <div className="space-y-1.5">
              <Input
                id="meet_link"
                label="Link do Google Meet"
                type="url"
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                error={errors.meet_link}
              />
              {meetLink && meetLink.startsWith('https://meet.google.com/') && (
                <a
                  href={meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  ↗ Testar link
                </a>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" loading={loading}>
                Salvar Configurações
              </Button>
              {saved && (
                <span className="text-sm text-green-600 font-medium">✓ Salvo com sucesso!</span>
              )}
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  )
}
