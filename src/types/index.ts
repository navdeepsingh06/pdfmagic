export interface PDFDocument {
  id: string
  file: File
  filename: string
  pageCount: number
  selectedPages: number[]
  order: number
}

export interface MergeProgress {
  current: number
  total: number
  status: 'idle' | 'merging' | 'completed' | 'error'
  error?: string
}
