import React from 'react';
import { Download, GitFork, ArrowLeft, BookOpen, User, Calendar } from 'lucide-react';
import { Workspace } from '../types';

interface PublicReaderProps {
  workspace: Workspace;
  onExit: () => void;
  onDownloadEpub: () => void;
  onFork: () => void;
}

const PublicReader: React.FC<PublicReaderProps> = ({ workspace, onExit, onDownloadEpub, onFork }) => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-200 font-sans flex flex-col">
      {/* Public Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={onExit} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                <ArrowLeft size={20} />
             </button>
             <h1 className="font-bold text-white truncate max-w-[200px] sm:max-w-md">{workspace.name}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {workspace.settings.allowEpub && (
                <button 
                    onClick={onDownloadEpub}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-600/30 transition-colors"
                >
                    <Download size={16} /> <span className="hidden sm:inline">Tải EPUB</span>
                </button>
            )}
            
            {workspace.settings.allowContribution && (
                <button 
                    onClick={onFork}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium hover:bg-green-600/30 transition-colors"
                >
                    <GitFork size={16} /> <span className="hidden sm:inline">Tải về & Chỉnh sửa</span>
                </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        
        {/* Novel Info */}
        <div className="flex flex-col sm:flex-row gap-8 mb-12 border-b border-gray-800 pb-8">
            <div className="w-32 sm:w-48 shrink-0 mx-auto sm:mx-0">
                {workspace.coverImage ? (
                    <img src={workspace.coverImage} alt="Cover" className="w-full aspect-[2/3] object-cover rounded shadow-2xl" />
                ) : (
                    <div className="w-full aspect-[2/3] bg-gray-800 rounded flex items-center justify-center">
                        <BookOpen size={48} className="text-gray-600" />
                    </div>
                )}
            </div>
            
            <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-serif font-bold text-white mb-2">{workspace.name}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-400 mb-4">
                    <span className="flex items-center gap-1"><User size={14} /> {workspace.author || 'Unknown'}</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(workspace.lastModified).toLocaleDateString()}</span>
                </div>
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                    {workspace.genres?.map(g => (
                        <span key={g} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300">{g}</span>
                    ))}
                </div>

                <p className="text-gray-400 text-sm leading-relaxed">
                    {workspace.description || 'No description provided.'}
                </p>
            </div>
        </div>

        {/* Text Content */}
        <div className="prose prose-invert prose-lg max-w-none font-serif leading-loose text-gray-300">
            {workspace.translatedText ? (
                workspace.translatedText.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4">{paragraph}</p>
                ))
            ) : (
                <div className="text-center py-20 text-gray-500 italic">
                    Chưa có nội dung bản dịch.
                </div>
            )}
        </div>
        
        {/* Footer */}
        <div className="mt-20 pt-10 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>Powered by NovelWeaver AI</p>
        </div>

      </main>
    </div>
  );
};

export default PublicReader;