'use client'

import { useEffect, useState, useCallback } from 'react'
import { AdminLayout } from '@/components/AdminLayout'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import type { Registration } from '@/lib/types'

interface CompanyStat {
  name: string
  count: number
}

export default function RegistrationsPage() {
  const [data, setData] = useState<Registration[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [company, setCompany] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [companies, setCompanies] = useState<CompanyStat[]>([])
  const [showCompanies, setShowCompanies] = useState(false)
  const [loadingCompanies, setLoadingCompanies] = useState(false)

  async function loadCompanies() {
    setLoadingCompanies(true)
    try {
      const res = await fetch('/api/admin/companies')
      const json = await res.json()
      setCompanies(json.companies ?? [])
    } finally {
      setLoadingCompanies(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  const buildParams = useCallback((p: number) => {
    const params = new URLSearchParams({ page: String(p), limit: '20' })
    if (search) params.set('search', search)
    if (company) params.set('company', company)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    return params.toString()
  }, [search, company, dateFrom, dateTo])

  async function load(p: number) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/registrations?${buildParams(p)}`)
      const json = await res.json()
      setData(json.data ?? [])
      setTotal(json.total ?? 0)
      setTotalPages(json.totalPages ?? 1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    load(1)
  }, [search, company, dateFrom, dateTo])

  useEffect(() => {
    load(page)
  }, [page])

  function handleExport() {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (company) params.set('company', company)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    window.open(`/api/admin/export?${params.toString()}`, '_blank')
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Registros</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {total} participante{total !== 1 ? 's' : ''} no total
            </p>
          </div>
          <Button variant="secondary" onClick={handleExport}>
            ↓ Exportar CSV
          </Button>
        </div>

        <Card className="p-4 mb-4">
          <div className="grid grid-cols-4 gap-3">
            <Input
              id="search"
              label="Buscar por nome ou e-mail"
              type="text"
              placeholder="Digite para buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Input
              id="company"
              label="Empresa"
              type="text"
              placeholder="Filtrar por empresa"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <Input
              id="dateFrom"
              label="Data inicial"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              id="dateTo"
              label="Data final"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </Card>

        <Card className="mb-4">
          <button
            onClick={() => setShowCompanies(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>Registros por empresa ({companies.length})</span>
            <span className="text-gray-400 text-xs">{showCompanies ? '▲ Ocultar' : '▼ Exibir'}</span>
          </button>

          {showCompanies && (
            <div className="border-t border-gray-100 px-4 pb-4 pt-3">
              {loadingCompanies ? (
                <p className="text-sm text-gray-400 text-center py-4">Carregando...</p>
              ) : companies.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Nenhuma empresa encontrada</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {companies.map(c => (
                    <button
                      key={c.name}
                      onClick={() => setCompany(c.name)}
                      title={`Filtrar por ${c.name}`}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-colors ${
                        company === c.name
                          ? 'bg-blue-50 border-blue-300 text-blue-800'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="truncate">{c.name}</span>
                      <span className={`shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        company === c.name ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {c.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {company && (
                <button
                  onClick={() => setCompany('')}
                  className="mt-3 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Limpar filtro de empresa
                </button>
              )}
            </div>
          )}
        </Card>

        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Nome', 'E-mail', 'Empresa', 'Data/Hora'].map(col => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400 text-sm">Carregando...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400 text-sm">Nenhum registro encontrado</td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.email}</td>
                    <td className="px-4 py-3 text-gray-600">{r.company}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(r.created_at).toLocaleString('pt-BR', {
                        timeZone: 'America/Sao_Paulo',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Página {page} de {totalPages}</p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Anterior
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima →
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}
