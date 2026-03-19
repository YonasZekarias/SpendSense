# SpendSense Documentation

This folder contains project documentation derived from the **SpendSense Ethiopia SRS**.

## Documents (Markdown)

| File | Description |
|------|-------------|
| **SpendSense_Backend_API_Documentation.md** | Backend API reference: auth, users, market, finance, e-commerce, admin, real-time. |
| **SpendSense_Frontend_Pages_and_Flow.md** | Frontend pages, routes, and user flows (scenarios). |
| **SpendSense_4_Week_Task_Plan.md** | 4-week implementation task breakdown. |

## Generating PDFs

You can turn the Markdown files into PDFs in any of these ways:

### Option 1: VS Code extension (easiest)

1. Install the **Markdown PDF** extension in VS Code.
2. Open each `.md` file.
3. Right-click in the editor → **Markdown PDF: Export (pdf)**.
4. PDFs are created in the same folder.

### Option 2: Pandoc (command line)

If you have [Pandoc](https://pandoc.org/) installed (e.g. `brew install pandoc` on macOS):

```bash
cd docs
pandoc SpendSense_Backend_API_Documentation.md -o SpendSense_Backend_API_Documentation.pdf
pandoc SpendSense_Frontend_Pages_and_Flow.md -o SpendSense_Frontend_Pages_and_Flow.pdf
pandoc SpendSense_4_Week_Task_Plan.md -o SpendSense_4_Week_Task_Plan.pdf
```

### Option 3: npm (md-to-pdf)

From the repo root or this folder:

```bash
npx md-to-pdf docs/SpendSense_Backend_API_Documentation.md
npx md-to-pdf docs/SpendSense_Frontend_Pages_and_Flow.md
npx md-to-pdf docs/SpendSense_4_Week_Task_Plan.md
```

PDFs are created next to each `.md` file.

### Option 4: Print to PDF from browser

1. Open the `.md` file in a viewer that renders Markdown (e.g. GitHub, VS Code preview, or [Markdown Viewer](https://chrome.google.com/webstore) in Chrome).
2. Use **Print → Save as PDF** (or **Export as PDF**).

---

After generating, you will have:

- **SpendSense_Backend_API_Documentation.pdf** — for backend/API work.
- **SpendSense_Frontend_Pages_and_Flow.pdf** — for frontend/pages and flows.
- **SpendSense_4_Week_Task_Plan.pdf** — for sprint and task planning.

### Week 1 completed (backend)

- **SpendSense_Backend_Week1_Completed.md** — List of what was completed on the backend in Week 1.
- **SpendSense_Backend_Week1_Completed.html** — Same content as HTML. **To get a PDF:** open in Chrome/Safari → **File → Print → Save as PDF**.

### Database schema

- **SpendSense_Database_Schema.md** — Full DB schema (tables, columns, FKs) from Django models.
- **SpendSense_Database_Schema.html** — Same as HTML. **To get a PDF:** open in Chrome/Safari → **File → Print → Save as PDF**.
