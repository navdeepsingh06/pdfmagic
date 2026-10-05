import { useState, useCallback } from 'react'
import { MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from '../utils/constants'
import { getPDFPageCount } from '../utils/pdfHelpers'
import { logger } from '../utils/logger'

export interface UploadError {
  file: string
  error: string
}

interface UploadState {
  isLoading: boolean
  errors: UploadError[]
  warnings: string[]
}

export function usePDFUpload(onFilesSelected: (files: File[], pageCounts: Map<string, number>) => void) {
  const [state, setState] = useState<UploadState>({
    isLoading: false,
    errors: [],
    warnings: [],
  })

  const validateFile = useCallback((file: File): { valid: boolean; error?: string; warning?: string } => {
    if (!ALLOWED_MIME_TYPES.includes(file.type) && !file.name.endsWith('.pdf')) {
      return { valid: false, error: 'File must be a PDF' }
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: true,
        warning: `File "${file.name}" is large (${(file.size / 1024 / 1024).toFixed(1)}MB). Processing may be slow.`,
      }
    }

    return { valid: true }
  }, [])

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setState({ isLoading: true, errors: [], warnings: [] })

      const validFiles: File[] = []
      const errors: UploadError[] = []
      const warnings: string[] = []
      const pageCounts = new Map<string, number>()

      for (const file of files) {
        const validation = validateFile(file)

        if (validation.warning) {
          warnings.push(validation.warning)
        }

        if (!validation.valid) {
          errors.push({ file: file.name, error: validation.error || 'Invalid file' })
          continue
        }

        try {
          const pageCount = await getPDFPageCount(file)
          validFiles.push(file)
          pageCounts.set(file.name, pageCount)
          logger.log(`Loaded PDF: ${file.name} (${pageCount} pages)`)
        } catch (error) {
          errors.push({
            file: file.name,
            error: error instanceof Error ? error.message : 'Failed to load PDF',
          })
        }
      }

      setState({ isLoading: false, errors, warnings })

      if (validFiles.length > 0) {
        onFilesSelected(validFiles, pageCounts)
      }
    },
    [validateFile, onFilesSelected]
  )

  const clearErrors = useCallback(() => {
    setState((prev) => ({ ...prev, errors: [], warnings: [] }))
  }, [])

  return {
    isLoading: state.isLoading,
    errors: state.errors,
    warnings: state.warnings,
    processFiles,
    clearErrors,
  }
}
