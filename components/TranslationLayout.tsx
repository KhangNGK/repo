import React, { useRef, useEffect } from 'react';
import { Copy, RefreshCw, XCircle } from 'lucide-react';

interface TranslationLayoutProps {
  sourceText: string;
  setSourceText: (text: string) => void;
  translatedText: string;
  isTranslating: boolean;
  onTranslate: () => void;
  onClear: () => void;
}

const TranslationLayout: React.FC<TranslationLayoutProps> = ({
  sourceText,
  setSourceText,
  translatedText,
  isTranslating,
  onTranslate,
  onClear,
}) => {
  const outputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of translation during streaming
  useEffect(() => {
    if (isTranslating && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [translatedText, isTranslating]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)] min-h-[500px]">
      {/* Source Column */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-center px-1">
          <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Original Text</span>
          {sourceText && (
            <button onClick={onClear} className="text-gray-500 hover:text-red-400 text-xs flex items-center gap-1 transition-colors">
              <XCircle size={14} /> Clear
            </button>
          )}
        </div>
        <textarea
          className="flex-1 w-full bg-surface border border-gray-700 rounded-xl p-5 text-gray-200 resize-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-serif leading-relaxed text-lg placeholder-gray-600"
          placeholder="Paste your web novel chapter here..."
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
        />
      </div>

      {/* Action / Divider for Mobile */}
      <div className="flex lg:flex-col items-center justify-center gap-4 py-2 lg:py-0">
        <button
          onClick={onTranslate}
          disabled={isTranslating || !sourceText}
          className={`
            h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95
            ${isTranslating 
              ? 'bg-gray-700 cursor-wait' 
              : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white'
            }
            ${!sourceText ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}
          `}
        >
          {isTranslating ? (
            <RefreshCw size={24} className="animate-spin text-gray-400" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
          )}
        </button>
      </div>

      {/* Target Column */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-center px-1">
          <span className="text-primary text-sm font-medium uppercase tracking-wider">Translation</span>
           {translatedText && (
            <button onClick={copyToClipboard} className="text-gray-500 hover:text-primary text-xs flex items-center gap-1 transition-colors">
              <Copy size={14} /> Copy
            </button>
          )}
        </div>
        <div className="relative flex-1">
          <textarea
            ref={outputRef}
            readOnly
            className="w-full h-full bg-[#162032] border border-gray-700/50 rounded-xl p-5 text-gray-100 resize-none focus:outline-none font-serif leading-relaxed text-lg shadow-inner"
            placeholder="Translation will appear here..."
            value={translatedText}
          />
          {isTranslating && (
             <div className="absolute bottom-4 right-4">
               <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslationLayout;