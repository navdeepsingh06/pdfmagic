import { useState, useCallback } from 'react'
import { PDFDocument, MergeProgress } from '../types'
import { mergePDFs } from '../utils/pdfHelpers'
import { logger } from '../utils/logger'

export function usePDFMerge() {
  const [progress, setProgress] = useState<MergeProgress>({
    current: 0,
    total: 0,
    status: 'idle',
  })

  const merge = useCallback(
    async (
      pdfs: PDFDocument[],
      outputFilename: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        // Calculate total pages to merge
        const totalPages = pdfs.reduce(
          (sum, pdf) => sum + pdf.selectedPages.length,
          0
        )

        if (totalPages === 0) {
          return { success: false, error: 'No pages selected for merge' }
        }

        setProgress({
          current: 0,
          total: totalPages,
          status: 'merging',
        })

        // Create a map of filename -> selected pages
        const pageSelections = new Map<string, number[]>()
        const sortedPdfs = [...pdfs].sort((a, b) => a.order - b.order)

        for (const pdf of sortedPdfs) {
          pageSelections.set(pdf.filename, pdf.selectedPages)
        }

        const files = sortedPdfs.map((p) => p.file)

        const blob = await mergePDFs(
          files,
          pageSelections,
          outputFilename,
          (current, total) => {
            setProgress({
              current,
              total,
              status: 'merging',
            })
          }
        )

        // Download the file
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = outputFilename.endsWith('.pdf')
          ? outputFilename
          : `${outputFilename}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        setProgress({
          current: totalPages,
          total: totalPages,
          status: 'completed',
        })

        logger.log('PDF merge completed successfully')
        return { success: true }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred'
        logger.error('Merge error:', errorMessage)

        setProgress({
          current: 0,
          total: 0,
          status: 'error',
          error: errorMessage,
        })

        return { success: false, error: errorMessage }
      }
    },
    []
  )

  const resetProgress = useCallback(() => {
    setProgress({
      current: 0,
      total: 0,
      status: 'idle',
    })
  }, [])

  return {
    progress,
    merge,
    resetProgress,
  }
}
