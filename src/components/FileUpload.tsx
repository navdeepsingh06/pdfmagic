import React, { useRef } from 'react'
import { UploadError } from '../hooks/usePDFUpload'

interface FileUploadProps {
  onFilesSelected: (files: FileList | File[]) => void
  isLoading: boolean
  errors: UploadError[]
  warnings: string[]
  onClearMessages: () => void
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  isLoading,
  errors,
  warnings,
  onClearMessages,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = React.useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    onFilesSelected(e.dataTransfer.files)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(e.target.files)
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf"
          onChange={handleChange}
          disabled={isLoading}
          className="hidden"
        />

        <div className="space-y-2">
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          <p className="text-lg font-medium text-gray-700">
            {isLoading ? 'Loading PDFs...' : 'Drag PDFs here or click to browse'}
          </p>
          <p className="text-sm text-gray-500">
            Max 50MB per file. Multiple files supported.
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800 mb-2">
            Upload Errors
          </h3>
          <ul className="space-y-1 text-sm text-red-700">
            {errors.map((err, i) => (
              <li key={i}>
                <strong>{err.file}:</strong> {err.error}
              </li>
            ))}
          </ul>
          <button
            onClick={onClearMessages}
            className="mt-2 text-xs text-red-600 hover:text-red-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Warnings</h3>
          <ul className="space-y-1 text-sm text-yellow-700">
            {warnings.map((warn, i) => (
              <li key={i}>• {warn}</li>
            ))}
          </ul>
          <button
            onClick={onClearMessages}
            className="mt-2 text-xs text-yellow-600 hover:text-yellow-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
