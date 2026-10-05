import { useState, useCallback } from 'react'
import { PDFDocument } from '../types'
import { v4 as uuidv4 } from 'uuid'

export function usePDFState() {
  const [pdfs, setPdfs] = useState<PDFDocument[]>([])

  const addPDF = useCallback((file: File, pageCount: number) => {
    const newPDF: PDFDocument = {
      id: uuidv4(),
      file,
      filename: file.name,
      pageCount,
      selectedPages: Array.from({ length: pageCount }, (_, i) => i + 1),
      order: pdfs.length,
    }
    setPdfs((prev) => [...prev, newPDF])
    return newPDF.id
  }, [pdfs.length])

  const removePDF = useCallback((id: string) => {
    setPdfs((prev) => {
      const filtered = prev.filter((p) => p.id !== id)
      return filtered.map((p, i) => ({ ...p, order: i }))
    })
  }, [])

  const reorderPDFs = useCallback((fromIndex: number, toIndex: number) => {
    setPdfs((prev) => {
      const newPdfs = [...prev]
      const [removed] = newPdfs.splice(fromIndex, 1)
      newPdfs.splice(toIndex, 0, removed)
      return newPdfs.map((p, i) => ({ ...p, order: i }))
    })
  }, [])

  const updateSelectedPages = useCallback((id: string, pages: number[]) => {
    setPdfs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selectedPages: pages } : p))
    )
  }, [])

  const selectAllPages = useCallback((id: string) => {
    setPdfs((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            selectedPages: Array.from({ length: p.pageCount }, (_, i) => i + 1),
          }
        }
        return p
      })
    )
  }, [])

  const deselectAllPages = useCallback((id: string) => {
    setPdfs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selectedPages: [] } : p))
    )
  }, [])

  const clearAll = useCallback(() => {
    setPdfs([])
  }, [])

  return {
    pdfs,
    addPDF,
    removePDF,
    reorderPDFs,
    updateSelectedPages,
    selectAllPages,
    deselectAllPages,
    clearAll,
  }
}
