export interface Registration {
  id: string
  name: string
  email: string
  company: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface Settings {
  meet_link: string
  meeting_title: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

export interface ApiError {
  error: string
  details?: string
}
