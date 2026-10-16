# AcademicCV Studio — Phase 2

A guided, privacy-conscious CV builder for **schoolteachers**. Create a CV from scratch or **import selectable text from an existing PDF or DOCX**, review extracted fields, choose a design, and export a PDF or **editable Word document**.

## Features available

- Six teaching-focused form sections: personal details, teaching experience, education, skills/subjects, certifications/awards, and contributions/languages.
- Four CV templates: Classic Teacher, Modern Educator, ATS Simple, School Leader.
- Live preview, add/remove multiple experience and education records, and responsive layout.
- PDF or DOCX import (up to 10 MB), **in-browser extraction**, visible field review and explicit Apply/Discard.
- Import places experience and education into editable draft fields: review and select **Add experience** or **Add qualification** to include them as structured entries.
- **Editable DOCX download** (a clean, text-based CV with basic academic formatting).
- Browser print / Save as PDF, JSON profile export/import, and browser-local profile saving.

## Important limitations

- **Text-based PDFs only.** Scanned/image-only PDFs require manual entry or an OCR feature not yet available.
- PDF/DOCX extraction is **heuristic**, not AI. It can miss details or misidentify sections, especially in multi-column designs. Always review imported text and verify facts.
- Word export produces a **standard professional document**, not a pixel-perfect replica of the four web templates. Browser printing preserves the selected web layout more closely.
- Advanced pagination, cloud storage, logins, AI rewriting, Arabic, complex tables/graphics and integrated OCR are future features.
- The site uses CDN-based browser libraries (PDF.js, Mammoth.js and docx.js); **internet access is required for import and Word export**, even when opening locally.
- The application does not intentionally transmit profile content to any backend. Third-party library files are downloaded by the browser; organizations should review their policies and dependency security before deploying publicly.
- Browser localStorage isn't encrypted and can be read by others using the same browser profile. Export JSON backups and avoid sensitive identifiers.

## Run locally

Open `index.html` in a recent desktop browser, or run:

```bash
cd AcademicCV-Studio
python -m http.server 8000
```

Then visit `http://localhost:8000/`.

## Publish on GitHub Pages

1. Create a repository **AcademicCV-Studio** under your GitHub account.
2. Upload **index.html**, **styles.css**, **app.js**, **phase2.js** and **README.md** to the repository root.
3. Open **Settings → Pages**, select **Deploy from a branch**, branch **main**, folder **/(root)**.
4. After deployment, the expected link is `https://kayaniyasir.github.io/AcademicCV-Studio/` (not active until GitHub Pages is configured and deployment succeeds).

## Developer notes

Static, zero-build project. CV profile logic resides in `app.js`, import and Word export in `phase2.js`. No server endpoint is included. Test with both DOCX and selectable-text PDFs, including unexpected layouts, before claiming production-ready imports.

**Developed for teachers — AcademicCV Studio.**