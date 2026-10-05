import React, { useState } from 'react'
import { PDFDocument } from '../types'
import { PageThumbnail } from './PageThumbnail'
import { MAX_PREVIEW_PAGES } from '../utils/constants'

interface PageSelectorProps {
  pdf: PDFDocument
  onSelectionChange: (pageNums: number[]) => void
  onSelectAll: () => void
  onDeselectAll: () => void
}

export const PageSelector: React.FC<PageSelectorProps> = ({
  pdf,
  onSelectionChange,
  onSelectAll,
  onDeselectAll,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleTogglePage = (pageNum: number) => {
    const newSelection = pdf.selectedPages.includes(pageNum)
      ? pdf.selectedPages.filter((p) => p !== pageNum)
      : [...pdf.selectedPages, pageNum].sort((a, b) => a - b)
    onSelectionChange(newSelection)
  }

  const pagesToShow =
    pdf.pageCount > MAX_PREVIEW_PAGES ? MAX_PREVIEW_PAGES : pdf.pageCount

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">
          Page Selection ({pdf.selectedPages.length} of {pdf.pageCount} pages)
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="space-y-3 p-3 bg-gray-50 rounded border border-gray-200">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={onSelectAll}
              className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors font-medium"
            >
              Select All
            </button>
            <button
              onClick={onDeselectAll}
              className="text-xs px-3 py-1.5 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded transition-colors font-medium"
            >
              Deselect All
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: pagesToShow }, (_, i) => i + 1).map(
              (pageNum) => (
                <PageThumbnail
                  key={pageNum}
                  file={pdf.file}
                  pageNum={pageNum}
                  isSelected={pdf.selectedPages.includes(pageNum)}
                  onToggle={handleTogglePage}
                />
              )
            )}
          </div>

          {pdf.pageCount > MAX_PREVIEW_PAGES && (
            <p className="text-xs text-gray-500">
              Showing first {MAX_PREVIEW_PAGES} pages. You can select pages beyond the preview by using Select All/Deselect All.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
