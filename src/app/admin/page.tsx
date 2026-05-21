'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/AdminLayout'
import { Card } from '@/components/Card'

interface Stats {
  total: number
  today: number
  week: number
}

interface DayData {
  date: string
  count: number
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString('pt-BR')}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </Card>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0, week: 0 })
  const [chartData, setChartData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/registrations?limit=1000&page=1')
        if (!res.ok) return
        const data = await res.json()

        const all = data.data as Array<{ created_at: string }>
        const now = new Date()
        const todayStr = now.toDateString()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        setStats({
          total: data.total,
          today: all.filter(r => new Date(r.created_at).toDateString() === todayStr).length,
          week: all.filter(r => new Date(r.created_at) >= weekAgo).length,
        })

        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
        const grouped: Record<string, number> = {}
        all
          .filter(r => new Date(r.created_at) >= fourteenDaysAgo)
          .forEach(r => {
            const day = new Date(r.created_at).toLocaleDateString('pt-BR', {
              timeZone: 'America/Sao_Paulo',
              day: '2-digit',
              month: '2-digit',
            })
            grouped[day] = (grouped[day] ?? 0) + 1
          })

        setChartData(Object.entries(grouped).map(([date, count]) => ({ date, count })))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const maxCount = Math.max(...chartData.map(d => d.count), 1)

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Total de Registros" value={stats.total} icon="👥" />
          <StatCard label="Hoje" value={stats.today} icon="📅" />
          <StatCard label="Últimos 7 dias" value={stats.week} icon="📈" />
        </div>

        <Card className="p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Registros por dia (últimos 14 dias)</h2>
          {loading ? (
            <div className="h-32 flex items-center justify-center text-gray-400 text-sm">Carregando...</div>
          ) : chartData.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
              Nenhum registro nos últimos 14 dias
            </div>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {chartData.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-blue-500 rounded-t-sm transition-all"
                    style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: '4px' }}
                    title={`${d.count} registros em ${d.date}`}
                  />
                  <span className="text-xs text-gray-400 whitespace-nowrap">{d.date}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}
