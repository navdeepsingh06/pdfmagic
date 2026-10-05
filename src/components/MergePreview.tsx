import React, { useState } from 'react'
import { PDFDocument, MergeProgress } from '../types'

interface MergePreviewProps {
  pdfs: PDFDocument[]
  progress: MergeProgress
  onMerge: (filename: string) => Promise<{ success: boolean; error?: string }>
}

export const MergePreview: React.FC<MergePreviewProps> = ({
  pdfs,
  progress,
  onMerge,
}) => {
  const [filename, setFilename] = useState('merged')
  const [isMerging, setIsMerging] = useState(false)

  const totalPages = pdfs.reduce(
    (sum, pdf) => sum + pdf.selectedPages.length,
    0
  )

  const canMerge = totalPages > 0 && !isMerging && progress.status !== 'merging'

  const handleMerge = async () => {
    setIsMerging(true)
    const result = await onMerge(filename)

    if (!result.success) {
      // Error is shown in the UI
    }

    setIsMerging(false)
  }

  const sortedPdfs = [...pdfs].sort((a, b) => a.order - b.order)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Merge Preview</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-600 font-medium">Total Pages</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{totalPages}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-xs text-green-600 font-medium">PDFs</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{pdfs.length}</p>
          </div>
        </div>

        {totalPages > 0 && (
          <div className="bg-gray-50 rounded p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Merge Order:
            </h3>
            <div className="space-y-2">
              {sortedPdfs.map((pdf, i) => {
                const selected = pdf.selectedPages.length
                return (
                  <div
                    key={pdf.id}
                    className="text-xs text-gray-700 flex items-center gap-2"
                  >
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-300 text-gray-700 text-xs font-semibold">
                      {i + 1}
                    </span>
                    <span className="truncate">
                      {pdf.filename}
                    </span>
                    <span className="text-gray-500">
                      ({selected}/{pdf.pageCount} pages)
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Output Filename
          </span>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            disabled={isMerging}
            placeholder="merged"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">
            (.pdf extension will be added automatically)
          </p>
        </label>

        {progress.status === 'merging' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Merging...</span>
              <span>
                {progress.current} / {progress.total} pages
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{
                  width: `${
                    progress.total > 0 ? (progress.current / progress.total) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {progress.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-700 flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>PDF merged and downloaded successfully!</span>
          </div>
        )}

        {progress.status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
            <p className="font-medium">Merge failed</p>
            <p className="text-xs mt-1">{progress.error}</p>
          </div>
        )}

        <button
          onClick={handleMerge}
          disabled={!canMerge}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors text-white ${
            canMerge
              ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {isMerging || progress.status === 'merging'
            ? 'Merging...'
            : totalPages === 0
              ? 'Select pages to merge'
              : 'Merge & Download'}
        </button>
      </div>
    </div>
  )
}
