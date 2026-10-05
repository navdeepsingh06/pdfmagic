import React from 'react'
import { PDFDocument } from '../types'
import { PDFItem } from './PDFItem'

interface PDFListProps {
  pdfs: PDFDocument[]
  onRemove: (id: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onSelectionChange: (id: string, pages: number[]) => void
  onSelectAll: (id: string) => void
  onDeselectAll: (id: string) => void
  onClearAll: () => void
}

export const PDFList: React.FC<PDFListProps> = ({
  pdfs,
  onRemove,
  onReorder,
  onSelectionChange,
  onSelectAll,
  onDeselectAll,
  onClearAll,
}) => {
  if (pdfs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-4 text-gray-600 font-medium">No PDFs uploaded yet</p>
        <p className="text-sm text-gray-500">Upload PDFs using the form above</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Uploaded PDFs ({pdfs.length})
        </h2>
        <button
          onClick={onClearAll}
          className="text-sm px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3">
        {pdfs.map((pdf, index) => (
          <PDFItem
            key={pdf.id}
            pdf={pdf}
            index={index}
            onRemove={onRemove}
            onReorder={onReorder}
            onSelectionChange={onSelectionChange}
            onSelectAll={onSelectAll}
            onDeselectAll={onDeselectAll}
          />
        ))}
      </div>

      <div className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-3">
        💡 <strong>Tip:</strong> Drag PDFs to reorder them. Selected pages will be merged in this order.
      </div>
    </div>
  )
}
