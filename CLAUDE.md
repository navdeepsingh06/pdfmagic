# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server on port 5173 (opens browser automatically)
- `npm run build` — type-check (`tsc`) then produce a production build in `dist/`
- `npm run preview` — serve the production build locally
- `npm run lint` — alias for `tsc`; this is the only "test"/check in the repo (no test framework is configured, so there is no single-test command)

`dist/` is git-ignored; it is built and deployed by CI, not committed.

## Architecture

A 100% client-side React 19 + TypeScript + Vite single-page app that merges PDFs. No backend — every file is read and processed in the browser, and nothing is uploaded. Keep that invariant: do not introduce network calls that send file contents anywhere.

### Two PDF libraries, two distinct jobs

This is the central thing to understand. `src/utils/pdfHelpers.ts` is the only module that touches PDF libraries:

- **`pdfjs-dist`** — *reading/rendering* only. Used for page counts (`getPDFPageCount`) and canvas thumbnail rendering (`renderPageThumbnail`). Requires a web worker, wired up at module load via the `?url` import of `pdf.worker.min.mjs`. The worker version is pinned to the installed `pdfjs-dist`; bumping the dep can break rendering if the worker URL import drifts.
- **`pdf-lib`** — *writing/merging* only, in `mergePDFs`. Dynamically `import()`ed so it is not in the initial bundle. Produces the final merged `Blob`.

### State and data flow

- `src/hooks/usePDFState.ts` owns the single source of truth: a `pdfs: PDFDocument[]` array. Each item has a uuid `id`, the original `File`, `selectedPages` (**1-indexed** page numbers), and `order`. `order` is kept equal to array index on every add/remove/reorder.
- `src/hooks/usePDFUpload.ts` validates files (PDF type, 50MB soft-warn threshold from `src/utils/constants.ts`), reads page counts, and hands valid files back to `App`, which calls `addPDF`.
- `src/hooks/usePDFMerge.ts` orchestrates the merge: sorts by `order`, builds the page-selection map, calls `mergePDFs`, then triggers a browser download via an object URL. Progress is reported per copied page.
- `src/App.tsx` wires these three hooks together and is wrapped in react-dnd's `DndProvider` (HTML5 backend) for drag-to-reorder of the PDF list.

Page indexing: `selectedPages` are 1-based throughout the UI and state; `mergePDFs` subtracts 1 when calling pdf-lib's `copyPages`.

### Known footgun: merge keys by filename

`usePDFMerge` and `mergePDFs` key page selections by `file.name`, not by the uuid `id`. Two uploaded files with the **same filename** will collide in that `Map` and merge incorrectly. State everywhere else is keyed by `id` — prefer `id` if you touch the merge path.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and publishes `dist/` to GitHub Pages.

The Vite `base` in `vite.config.ts` (currently `/pdfmagic/`) must match the GitHub Pages subpath the site is served from, or assets 404 in production. Change `base` if the Pages URL path changes.
