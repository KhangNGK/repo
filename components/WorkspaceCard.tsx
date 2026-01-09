import React from 'react';
import { User, Cloud, Globe, BookOpen } from 'lucide-react';
import { Workspace, SUPPORTED_LANGUAGES } from '../types';

interface WorkspaceCardProps {
  workspace: Workspace;
  onClick: () => void;
}

const WorkspaceCard: React.FC<WorkspaceCardProps> = ({ workspace, onClick }) => {
  const getLangName = (code: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang ? lang.name : code;
  };
  
  // Custom helper for language display text based on image
  const getLangDisplay = () => {
    const source = workspace.config.sourceLang === 'zh' ? 'Tiếng Trung (中文)' : getLangName(workspace.config.sourceLang);
    const target = workspace.config.targetLang === 'vi' ? 'Tiếng Việt' : getLangName(workspace.config.targetLang);
    return `${source} → ${target}`;
  };

  const progressPercent = workspace.chapterProgress.total > 0 
    ? (workspace.chapterProgress.current / workspace.chapterProgress.total) * 100 
    : 0;
  
  // Date formatting
  const dateStr = new Date(workspace.lastModified).toLocaleDateString('vi-VN');

  return (
    <div 
      onClick={onClick}
      className="group relative w-full aspect-[16/10] bg-[#1a1625] rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-purple-900/10 transition-all border border-gray-800 hover:border-purple-500/30 flex flex-col"
    >
      {/* Top Image Section (approx 55%) */}
      <div className="relative h-[55%] w-full overflow-hidden">
         {workspace.coverImage ? (
             <img src={workspace.coverImage} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
         ) : (
             <div className="w-full h-full bg-gradient-to-br from-[#2a0a55] to-[#1a0b2e] flex items-center justify-center">
                 <BookOpen size={32} className="text-white/20" />
             </div>
         )}
         
         {/* Overlays */}
         <div className="absolute inset-0 bg-gradient-to-t from-[#1a1625] to-transparent opacity-90" />

         {/* Author Badge (Top Left) */}
         <div className="absolute top-4 left-4 flex items-center gap-2">
             <div className="flex items-center gap-1.5 text-xs text-white font-medium drop-shadow-md">
                 <User size={12} className="text-gray-300" />
                 {workspace.author || 'Unknown'}
             </div>
         </div>

         {/* Sync Status Badge (Top Right) */}
         <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/5">
            <Cloud size={10} className="text-cyan-400" />
            <span className="text-[10px] text-cyan-400 font-medium">Đã đồng bộ</span>
            <span className="text-[10px] text-gray-400">• 9m trước</span>
         </div>

         {/* Genre Badge (Bottom Left of Image Area) */}
         <div className="absolute bottom-2 left-4 flex items-center gap-2">
            <BookOpen size={12} className="text-gray-400" />
            <span className="text-xs text-gray-200 font-medium">{workspace.genres?.[0] || 'Fantasy'}</span>
         </div>
      </div>

      {/* Bottom Info Section */}
      <div className="flex-1 p-4 pt-1 flex flex-col justify-between bg-[#1a1625]">
          <div>
              <h3 className="text-white font-bold text-base leading-snug line-clamp-2 mb-2 group-hover:text-purple-300 transition-colors">
                  {workspace.name}
              </h3>
              <div className="text-xs text-gray-500 mb-3">
                  {getLangDisplay()}
              </div>
          </div>

          <div>
              {/* Progress Bar Header */}
              <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs text-gray-500">Tiến độ</span>
                  <span className="text-xs text-gray-400 font-medium">{workspace.chapterProgress.current}/{workspace.chapterProgress.total || '?'} chương</span>
              </div>
              
              {/* Bar */}
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                    style={{ width: `${progressPercent}%` }}
                  />
              </div>

              {/* Footer Meta */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                  <div className="flex items-center gap-1.5 text-green-500">
                      <Globe size={12} />
                      <span className="text-[10px] font-medium">Đã xuất bản</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-400/80">
                       <Cloud size={12} />
                       <span className="text-[10px]">Đồng bộ {dateStr}</span>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default WorkspaceCard;