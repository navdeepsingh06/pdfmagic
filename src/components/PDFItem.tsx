import React, { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { PDFDocument } from '../types'
import { PageSelector } from './PageSelector'

interface PDFItemProps {
  pdf: PDFDocument
  index: number
  onRemove: (id: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onSelectionChange: (id: string, pages: number[]) => void
  onSelectAll: (id: string) => void
  onDeselectAll: (id: string) => void
}

const PDFItemType = 'pdf'

interface DragItem {
  index: number
  type: string
}

export const PDFItem: React.FC<PDFItemProps> = ({
  pdf,
  index,
  onRemove,
  onReorder,
  onSelectionChange,
  onSelectAll,
  onDeselectAll,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const [, drag] = useDrag(
    () => ({
      type: PDFItemType,
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [index]
  )

  const [, drop] = useDrop<DragItem>(
    () => ({
      accept: PDFItemType,
      hover: (item) => {
        if (!ref.current) {
          return
        }
        const dragIndex = item.index
        const hoverIndex = index

        if (dragIndex === hoverIndex) {
          return
        }

        onReorder(dragIndex, hoverIndex)
        item.index = hoverIndex
      },
    }),
    [index, onReorder]
  )

  drag(drop(ref))

  const fileSize = (pdf.file.size / 1024 / 1024).toFixed(2)

  return (
    <div
      ref={ref}
      className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 hover:border-gray-300 transition-colors cursor-move"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100">
              <span className="text-xs font-semibold text-blue-700">
                {index + 1}
              </span>
            </span>
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {pdf.filename}
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {pdf.pageCount} pages • {fileSize} MB
          </p>
        </div>
        <button
          onClick={() => onRemove(pdf.id)}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Remove PDF"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <PageSelector
        pdf={pdf}
        onSelectionChange={(pages) => onSelectionChange(pdf.id, pages)}
        onSelectAll={() => onSelectAll(pdf.id)}
        onDeselectAll={() => onDeselectAll(pdf.id)}
      />
    </div>
  )
}
