import React, { useState, useEffect } from 'react';
import { Globe, Download, AlertTriangle, Puzzle, HelpCircle, CheckCircle2, XCircle, List, FileText } from 'lucide-react';
import { fetchUrlContent, scrapeChapterList } from '../services/geminiService';
import JSZip from 'jszip';

interface WebScraperProps {
  isOpen: boolean;
  initialMode?: 'chapter' | 'toc';
  onClose: () => void;
  onContentFetched: (content: string, url: string, selector: string) => void;
  onChapterListFetched: (chapters: {title: string, url: string}[], sourceUrl: string, selector: string) => void;
}

// --- Embedded Extension Source Code ---

const EXT_MANIFEST = JSON.stringify({
  "manifest_version": 3,
  "name": "NovelWeaver Scraper Helper",
  "version": "1.0",
  "description": "Helper extension to bypass CORS for NovelWeaver AI",
  "permissions": [
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "content_scripts": [
    {
      "matches": [
        "<all_urls>"
      ],
      "js": [
        "content.js"
      ],
      "run_at": "document_start"
    }
  ],
  "background": {
    "service_worker": "background.js"
  }
}, null, 2);

const EXT_BACKGROUND = `
// Background script to handle fetch requests from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchUrl") {
    fetch(request.url)
      .then(response => {
        if (!response.ok) throw new Error(\`HTTP error! status: \${response.status}\`);
        return response.text();
      })
      .then(text => sendResponse({ success: true, data: text }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Keep channel open for async response
  }
});
`;

const EXT_CONTENT = `
// Bridge between NovelWeaver Web App and Chrome Extension Background Script

// 1. Listen for requests from the Web App (window.postMessage)
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  // Handle Ping to check if extension is active
  if (event.data.type === "NOVEL_WEAVER_EXTENSION_PING") {
    window.postMessage({ type: "NOVEL_WEAVER_EXTENSION_PONG" }, "*");
  }

  // Handle Fetch Request
  if (event.data.type === "NOVEL_WEAVER_FETCH_REQUEST") {
    const { url, requestId } = event.data;
    
    // Forward to Background Script (which has CORS permissions)
    chrome.runtime.sendMessage({ action: "fetchUrl", url: url }, (response) => {
      // Send result back to Web App
      window.postMessage({
          type: "NOVEL_WEAVER_FETCH_RESPONSE",
          requestId: requestId,
          success: response && response.success,
          html: response ? response.data : null,
          error: response ? response.error : "Unknown extension error"
      }, "*");
    });
  }
});

// Notify that extension is ready immediately upon injection
window.postMessage({ type: "NOVEL_WEAVER_EXTENSION_PONG" }, "*");
console.log("NovelWeaver Scraper Extension Loaded");
`;

const WebScraper: React.FC<WebScraperProps> = ({ 
    isOpen, initialMode = 'chapter', onClose, onContentFetched, onChapterListFetched 
}) => {
  const [mode, setMode] = useState<'chapter' | 'toc'>(initialMode);
  const [url, setUrl] = useState('');
  const [selector, setSelector] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [extensionActive, setExtensionActive] = useState(false);
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
      setMode(initialMode);
  }, [initialMode, isOpen]);

  // Set default selector based on mode
  useEffect(() => {
    if (!selector) {
        setSelector(mode === 'toc' ? '.list-chapters' : 'div.chapter-content');
    }
  }, [mode]);

  // Check for extension on mount and periodically
  useEffect(() => {
    if (isOpen) {
      const checkExtension = () => {
        const handler = (event: MessageEvent) => {
          if (event.data.type === 'NOVEL_WEAVER_EXTENSION_PONG') {
             setExtensionActive(true);
             window.removeEventListener('message', handler);
          }
        };
        window.addEventListener('message', handler);
        window.postMessage({ type: 'NOVEL_WEAVER_EXTENSION_PING' }, '*');
        
        // Timeout cleanup
        setTimeout(() => window.removeEventListener('message', handler), 500);
      };
      
      checkExtension();
      // Re-check every 2 seconds in case user just installed it
      const interval = setInterval(checkExtension, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, checkCount]);

  const handleDownloadExtension = async () => {
    const zip = new JSZip();
    zip.file("manifest.json", EXT_MANIFEST);
    zip.file("background.js", EXT_BACKGROUND);
    zip.file("content.js", EXT_CONTENT);
    
    const content = await zip.generateAsync({ type: "blob" });
    
    const element = document.createElement("a");
    element.href = URL.createObjectURL(content);
    element.download = "NovelWeaver-Extension.zip";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFetch = async () => {
    if (!url) return;
    setIsLoading(true);
    setError('');
    
    try {
      if (mode === 'chapter') {
          const content = await fetchUrlContent(url, selector);
          if (content.startsWith("Error:")) {
            setError(content);
          } else {
            onContentFetched(content, url, selector);
            onClose();
          }
      } else {
          // TOC Mode
          const chapters = await scrapeChapterList(url, selector);
          if (chapters.length === 0) {
              setError("No chapters found. Please check your CSS selector.");
          } else {
              onChapterListFetched(chapters, url, selector);
              onClose();
          }
      }
    } catch (e) {
      setError("Failed to fetch content.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-gray-700 w-full max-w-lg rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Globe className="text-blue-400" /> Web Content Scraper
              </h2>
              <p className="text-xs text-gray-400 mt-1">Extract text or chapter lists directly from URL.</p>
            </div>
            
            {/* Status Badge */}
            <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 border ${extensionActive ? 'bg-green-900/20 text-green-400 border-green-800' : 'bg-red-900/20 text-red-400 border-red-800'}`}>
                {extensionActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                {extensionActive ? 'Ext. Ready' : 'Ext. Missing'}
            </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex p-1 bg-gray-800/50 rounded-lg mb-6 border border-gray-700">
            <button 
                onClick={() => setMode('chapter')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'chapter' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-gray-300'}`}
            >
                <FileText size={14} /> Single Chapter
            </button>
            <button 
                onClick={() => setMode('toc')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-2 transition-all ${mode === 'toc' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-gray-300'}`}
            >
                <List size={14} /> Chapter List (TOC)
            </button>
        </div>

        {/* Extension Installation Guide (if missing) */}
        {!extensionActive && (
          <div className="mb-6 bg-slate-900/50 border border-yellow-800/30 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
               <div className="bg-yellow-900/20 p-2 rounded-lg text-yellow-500">
                 <Puzzle size={20} />
               </div>
               <div>
                 <h3 className="text-sm font-semibold text-gray-200">Extension Required</h3>
                 <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                   To bypass browser security (CORS) and scrape external websites, you need to install the NovelWeaver helper extension.
                 </p>
               </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleDownloadExtension}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={16} /> Download Extension (.zip)
              </button>
            </div>
          </div>
        )}

        {/* Form Inputs */}
        <div className={`space-y-4 transition-opacity ${!extensionActive ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">
                {mode === 'chapter' ? 'Chapter URL' : 'Table of Contents URL'}
            </label>
            <input
              type="url"
              className="w-full bg-background border border-gray-600 rounded px-3 py-2 text-white focus:ring-1 focus:ring-primary outline-none"
              placeholder={mode === 'chapter' ? "https://example.com/novel/chapter-1" : "https://example.com/novel/toc"}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">CSS Selector (Container)</label>
            <input
              type="text"
              className="w-full bg-background border border-gray-600 rounded px-3 py-2 text-white focus:ring-1 focus:ring-primary outline-none"
              placeholder={mode === 'chapter' ? "e.g., .chapter-content" : "e.g., .list-chapters"}
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
            />
            <p className="text-[10px] text-gray-500 mt-1">
                {mode === 'chapter' 
                    ? "Specify the container holding the text to avoid scraping menus/ads."
                    : "Specify the container holding the list of chapter links."}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-xs text-red-300 flex items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-gray-700/50 mt-6">
            <button
            onClick={onClose}
            className="flex-1 py-2 bg-transparent hover:bg-gray-800 text-gray-300 rounded-lg border border-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleFetch}
            disabled={isLoading || !url || !extensionActive}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {isLoading ? 'Fetching...' : <><Download size={16} /> Load Content</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebScraper;