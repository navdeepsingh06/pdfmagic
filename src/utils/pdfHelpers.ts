import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { logger } from './logger'

// Set up the worker using the locally bundled version (matches installed pdfjs-dist)
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export async function getPDFPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    return pdf.numPages
  } catch (error) {
    logger.error('Error getting page count:', error)
    throw new Error('Failed to read PDF file. Make sure it is a valid PDF.')
  }
}

export async function renderPageThumbnail(
  file: File,
  pageNum: number
): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const page = await pdf.getPage(pageNum)

    const viewport = page.getViewport({ scale: 0.5 })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    canvas.width = viewport.width
    canvas.height = viewport.height

    if (!context) throw new Error('Failed to get canvas context')

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }

    await page.render(renderContext).promise

    return canvas.toDataURL('image/png')
  } catch (error) {
    logger.error(`Error rendering page ${pageNum}:`, error)
    throw new Error(`Failed to render page ${pageNum}`)
  }
}

export async function mergePDFs(
  files: File[],
  pageSelections: Map<string, number[]>,
  _outputFilename: string,
  onProgress: (current: number, total: number) => void
): Promise<Blob> {
  const { PDFDocument } = await import('pdf-lib')

  try {
    const mergedPdf = await PDFDocument.create()
    let totalPages = 0

    // Count total pages to merge for progress
    for (const [_, pages] of pageSelections) {
      totalPages += pages.length
    }

    let processedPages = 0
    const fileMap = new Map(files.map((f) => [f.name, f]))

    // Process each file in order
    for (const [filename, selectedPages] of pageSelections) {
      const file = fileMap.get(filename)
      if (!file) continue

      const arrayBuffer = await file.arrayBuffer()
      const srcPdf = await PDFDocument.load(arrayBuffer)

      // Copy selected pages
      for (const pageNum of selectedPages) {
        const [copiedPage] = await mergedPdf.copyPages(srcPdf, [pageNum - 1])
        mergedPdf.addPage(copiedPage)
        processedPages++
        onProgress(processedPages, totalPages)
      }
    }

    const pdfBytes = await mergedPdf.save()
    return new Blob([new Uint8Array(pdfBytes).buffer], { type: 'application/pdf' })
  } catch (error) {
    logger.error('Error merging PDFs:', error)
    throw new Error('Failed to merge PDFs. Please try again.')
  }
}
