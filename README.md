# Deep Diver

Financial documents (10-Ks, 10-Qs, 8-Ks, earnings transcripts) are dense, lengthy, and full of cross-references that make them hard to read and even harder to analyze systematically. A single 10-K can run over 200 pages, and comparing disclosures across companies or time periods is tedious manual work.

Deep Diver is an agent-powered research workbench for understanding company financial documents. It pulls filings directly from SEC EDGAR, renders them in a built-in viewer, and lets you have AI-assisted conversations about the content. Instead of switching between a PDF reader, a spreadsheet, and a chatbot, everything lives in one workspace.

## Features

- **SEC EDGAR integration**: Search for companies by ticker or name and download their filings (10-K, 10-Q, 8-K) directly into your workspace
- **Document viewer**: Read HTML and PDF filings in-app with dark mode support, adjustable zoom, and section navigation for 10-K filings
- **AI chat**: Ask questions about documents using either Claude (Anthropic) or GPT-4o (OpenAI) as the backing model
- **Research folders**: Organize documents, notes, and chat threads into research projects
- **Notes**: Take notes alongside your documents, linked to specific filings

## Tech Stack

- Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- SQLite via Drizzle ORM
- Vercel AI SDK with Anthropic Claude or OpenAI GPT-4o

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API key (ANTHROPIC_API_KEY or OPENAI_API_KEY) and AUTH_PASSWORD
# Set AI_PROVIDER=openai to use OpenAI instead of Claude (default)

# Initialize the database
npx tsx src/lib/db/migrate.ts

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to get started.

## Project Structure

```
src/
  app/            # Next.js pages and API routes
  components/     # UI components (document viewer, chat, layout, etc.)
  lib/
    ai/           # AI provider config and prompts
    db/           # Database schema and migrations
    edgar/        # SEC EDGAR API client and parser
    documents/    # Document storage and chunking
  types/          # TypeScript type definitions
```
