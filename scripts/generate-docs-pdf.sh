#!/usr/bin/env bash
# Generate PDFs from Markdown docs (requires pandoc: brew install pandoc)
set -e
DOCS_DIR="$(cd "$(dirname "$0")/.." && pwd)/docs"
cd "$DOCS_DIR"

if ! command -v pandoc &>/dev/null; then
  echo "Pandoc is not installed. Install with: brew install pandoc"
  echo "Alternatively, use VS Code 'Markdown PDF' extension or npx md-to-pdf."
  exit 1
fi

for md in SpendSense_Backend_API_Documentation.md SpendSense_Frontend_Pages_and_Flow.md SpendSense_4_Week_Task_Plan.md; do
  if [ -f "$md" ]; then
    pdf="${md%.md}.pdf"
    echo "Generating $pdf ..."
    pandoc "$md" -o "$pdf" -V geometry:margin=1in 2>/dev/null || pandoc "$md" -o "$pdf"
    echo "  -> $pdf"
  fi
done
echo "Done. PDFs are in: $DOCS_DIR"
