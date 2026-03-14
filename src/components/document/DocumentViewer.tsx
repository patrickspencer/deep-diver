"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import type { Document as DocType } from "@/types";

const FONT_SIZE_STEPS = [80, 90, 100, 110, 120, 140, 160, 200, 250, 300];
const DEFAULT_FONT_SIZE_INDEX = 2; // 100%
const ZOOM_STYLE_ID = "deep-diver-zoom";
const ZOOM_STORAGE_KEY = "deep-diver-zoom-prefs";

function getSavedZoomIndex(docType: string): number {
  try {
    const prefs = JSON.parse(localStorage.getItem(ZOOM_STORAGE_KEY) || "{}");
    const idx = prefs[docType];
    if (typeof idx === "number" && idx >= 0 && idx < FONT_SIZE_STEPS.length) return idx;
  } catch {}
  return DEFAULT_FONT_SIZE_INDEX;
}

function saveZoomIndex(docType: string, index: number) {
  try {
    const prefs = JSON.parse(localStorage.getItem(ZOOM_STORAGE_KEY) || "{}");
    prefs[docType] = index;
    localStorage.setItem(ZOOM_STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

interface Section {
  id: string;
  title: string;
}

interface DocumentViewerProps {
  document: DocType;
  onTextSelection: (text: string) => void;
}

export function DocumentViewer({
  document,
}: DocumentViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { theme } = useTheme();
  const [fontSizeIndex, setFontSizeIndex] = useState(() => getSavedZoomIndex(document.type));
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const ext = document.filePath.split(".").pop()?.toLowerCase() ?? "";
  const isHtml = ext === "html" || ext === "htm";

  useEffect(() => {
    if (!isHtml) return;
    fetch(`/api/documents/sections?path=${encodeURIComponent(document.filePath)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSections(data);
      })
      .catch(() => {});
  }, [document.filePath, isHtml]);

  // Reset state when document changes, restoring saved zoom for this doc type
  useEffect(() => {
    setFontSizeIndex(getSavedZoomIndex(document.type));
    setSelectedSection("");
    setIframeLoaded(false);
  }, [document.filePath, document.type]);

  // Find the element currently visible at the top of the iframe viewport
  const getAnchorElement = useCallback(() => {
    const iframeDoc = iframeRef.current?.contentDocument;
    const iframeWin = iframeRef.current?.contentWindow;
    if (!iframeDoc || !iframeWin) return null;

    // Sample a point a little below the top to avoid hitting margins/padding
    const x = iframeWin.innerWidth / 2;
    const y = 20;
    const el = iframeDoc.elementFromPoint(x, y);
    if (!el || el === iframeDoc.body || el === iframeDoc.documentElement) return null;
    return el;
  }, []);

  // Apply zoom, using an anchor element to preserve scroll position
  const applyZoom = useCallback((index: number, preservePosition: boolean) => {
    const iframeDoc = iframeRef.current?.contentDocument;
    if (!iframeDoc) return;
    const zoom = FONT_SIZE_STEPS[index] / 100;

    // Bookmark: find element at top of viewport and its offset before zoom
    const anchor = preservePosition ? getAnchorElement() : null;
    const rectBefore = anchor?.getBoundingClientRect();

    let styleEl = iframeDoc.getElementById(ZOOM_STYLE_ID) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = iframeDoc.createElement("style");
      styleEl.id = ZOOM_STYLE_ID;
      (iframeDoc.head || iframeDoc.documentElement).appendChild(styleEl);
    }
    styleEl.textContent = `body { zoom: ${zoom} !important; }`;

    // Restore: scroll so the anchor element returns to its previous viewport position
    if (anchor && rectBefore) {
      const rectAfter = anchor.getBoundingClientRect();
      const scrollEl = iframeDoc.documentElement || iframeDoc.body;
      scrollEl.scrollTop += rectAfter.top - rectBefore.top;
    }
  }, [getAnchorElement]);


  const iframeSrc = `/api/documents/file?path=${encodeURIComponent(document.filePath)}&theme=${theme}`;

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    applyZoom(fontSizeIndex, false);
  };

  const handleSectionChange = (sectionId: string) => {
    setSelectedSection(sectionId);
    if (sectionId) {
      const iframeDoc = iframeRef.current?.contentDocument;
      const target = iframeDoc?.getElementById(sectionId);
      target?.scrollIntoView();
    }
  };

  const fontSize = FONT_SIZE_STEPS[fontSizeIndex];

  return (
    <div className="relative flex h-full flex-col">
      {isHtml && (
        <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-3 py-1.5 text-sm shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const next = Math.max(0, fontSizeIndex - 1);
                setFontSizeIndex(next);
                saveZoomIndex(document.type, next);
                applyZoom(next, true);
              }}
              disabled={fontSizeIndex === 0}
              className="px-1.5 py-0.5 rounded hover:bg-muted disabled:opacity-30 font-medium"
              title="Decrease font size"
            >
              A−
            </button>
            <span className="text-muted-foreground w-10 text-center tabular-nums">
              {fontSize}%
            </span>
            <button
              onClick={() => {
                const next = Math.min(FONT_SIZE_STEPS.length - 1, fontSizeIndex + 1);
                setFontSizeIndex(next);
                saveZoomIndex(document.type, next);
                applyZoom(next, true);
              }}
              disabled={fontSizeIndex === FONT_SIZE_STEPS.length - 1}
              className="px-1.5 py-0.5 rounded hover:bg-muted disabled:opacity-30 font-medium text-base"
              title="Increase font size"
            >
              A+
            </button>
          </div>

          {sections.length > 0 && (
            <>
              <div className="w-px h-4 bg-border" />
              <select
                value={selectedSection}
                onChange={(e) => handleSectionChange(e.target.value)}
                className="flex-1 min-w-0 bg-transparent border border-border rounded px-2 py-0.5 text-sm truncate focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Jump to section…</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      )}
      <iframe
        ref={iframeRef}
        key={`${document.filePath}-${theme}`}
        src={iframeSrc}
        className="flex-1 w-full h-full border-0"
        title={document.title}
        sandbox="allow-same-origin"
        onLoad={handleIframeLoad}
      />
    </div>
  );
}
