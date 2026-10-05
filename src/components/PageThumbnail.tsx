import React, { useState, useEffect } from 'react'
import { renderPageThumbnail } from '../utils/pdfHelpers'
import { logger } from '../utils/logger'

interface PageThumbnailProps {
  file: File
  pageNum: number
  isSelected: boolean
  onToggle: (pageNum: number) => void
}

export const PageThumbnail: React.FC<PageThumbnailProps> = ({
  file,
  pageNum,
  isSelected,
  onToggle,
}) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadThumbnail = async () => {
      try {
        setIsLoading(true)
        const dataUrl = await renderPageThumbnail(file, pageNum)
        setThumbnail(dataUrl)
        setError(null)
      } catch (err) {
        logger.error(`Failed to load thumbnail for page ${pageNum}:`, err)
        setError('Failed to load')
      } finally {
        setIsLoading(false)
      }
    }

    loadThumbnail()
  }, [file, pageNum])

  return (
    <button
      onClick={() => onToggle(pageNum)}
      className={`relative flex-shrink-0 rounded border-2 overflow-hidden transition-all ${
        isSelected
          ? 'border-blue-500 shadow-md'
          : 'border-gray-200 hover:border-gray-300'
      } ${isSelected ? 'ring-2 ring-blue-300' : ''}`}
      title={`Page ${pageNum}${isSelected ? ' - Selected' : ''}`}
    >
      {isLoading ? (
        <div className="w-24 h-32 bg-gray-100 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="w-24 h-32 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
          Error
        </div>
      ) : (
        <img
          src={thumbnail || ''}
          alt={`Page ${pageNum}`}
          className={`w-24 h-32 object-cover ${
            isSelected ? 'brightness-100' : 'opacity-75 hover:opacity-100'
          }`}
        />
      )}

      <div
        className={`absolute top-1 right-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
          isSelected
            ? 'bg-blue-500 border-blue-600'
            : 'bg-white border-gray-300 hover:border-gray-400'
        }`}
      >
        {isSelected && (
          <svg
            className="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      <span className="absolute bottom-1 left-1 text-xs font-medium text-gray-700 bg-white bg-opacity-80 px-1.5 py-0.5 rounded">
        {pageNum}
      </span>
    </button>
  )
}
