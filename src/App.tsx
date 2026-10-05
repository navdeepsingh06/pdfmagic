import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { FileUpload } from './components/FileUpload'
import { PDFList } from './components/PDFList'
import { MergePreview } from './components/MergePreview'
import { usePDFState } from './hooks/usePDFState'
import { usePDFUpload } from './hooks/usePDFUpload'
import { usePDFMerge } from './hooks/usePDFMerge'
import './App.css'

function App() {
  const {
    pdfs,
    addPDF,
    removePDF,
    reorderPDFs,
    updateSelectedPages,
    selectAllPages,
    deselectAllPages,
    clearAll,
  } = usePDFState()

  const { progress, merge, resetProgress } = usePDFMerge()

  const { isLoading, errors, warnings, processFiles, clearErrors } =
    usePDFUpload(async (files, pageCounts) => {
      for (const file of files) {
        const pageCount = pageCounts.get(file.name)
        if (pageCount) {
          addPDF(file, pageCount)
        }
      }
    })

  const handleMerge = async (filename: string) => {
    resetProgress()
    return await merge(pdfs, filename)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="pdf-container space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">PDF Merge</h1>
            <p className="text-lg text-gray-600">
              Combine multiple PDFs into one. Drag to reorder, click to select pages.
            </p>
          </div>

          {/* File Upload */}
          <FileUpload
            onFilesSelected={processFiles}
            isLoading={isLoading}
            errors={errors}
            warnings={warnings}
            onClearMessages={clearErrors}
          />

          {/* Main Content */}
          {pdfs.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* PDF List */}
              <div className="lg:col-span-2">
                <PDFList
                  pdfs={pdfs}
                  onRemove={removePDF}
                  onReorder={reorderPDFs}
                  onSelectionChange={updateSelectedPages}
                  onSelectAll={selectAllPages}
                  onDeselectAll={deselectAllPages}
                  onClearAll={clearAll}
                />
              </div>

              {/* Merge Preview */}
              <div className="lg:col-span-1">
                <MergePreview
                  pdfs={pdfs}
                  progress={progress}
                  onMerge={handleMerge}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-8">
            <p>
              🔒 All processing happens in your browser. No files are uploaded to servers.
            </p>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}

export default App
