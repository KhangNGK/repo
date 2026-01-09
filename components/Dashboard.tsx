import React from 'react';
import { Plus, Search, BookOpen, ChevronDown, Cloud, ArrowLeft } from 'lucide-react';
import WorkspaceCard from './WorkspaceCard';
import { Workspace } from '../types';

interface DashboardProps {
  workspaces: Workspace[];
  onSelect: (id: string) => void;
  onCreate: () => void;
  onBack?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ workspaces, onSelect, onCreate, onBack }) => {
  return (
    <div className="w-full h-full flex flex-col">
       {/* Dashboard Header */}
       <header className="px-6 h-16 flex items-center gap-4 border-b border-white/5 bg-[#1a0b2e]/50 backdrop-blur-sm shrink-0">
          {onBack && (
              <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors mr-2">
                  <ArrowLeft size={20} />
              </button>
          )}

          <div className="flex items-center gap-3">
              <button className="px-3 py-1.5 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-500 text-xs font-bold uppercase rounded border border-yellow-600/30 flex items-center gap-1.5 transition-colors">
                  <span>👑</span> Nâng cấp ngay
              </button>
              
              <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-white/10 cursor-pointer">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" alt="User" />
              </div>
              
              <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium transition-colors">
                  <Cloud size={16} /> <span className="hidden sm:inline">Tải từ Đám mây</span>
              </button>

              <button 
                onClick={onCreate}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-purple-500/20 transition-colors"
              >
                  <Plus size={16} /> Tạo Workspace
              </button>
          </div>
       </header>

       {/* Main Content */}
       <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-6xl mx-auto">
              
              {/* Title Section */}
              <div className="mb-8">
                  <h1 className="text-2xl font-bold text-white mb-2">Workspace</h1>
                  <p className="text-gray-400 text-sm">
                      Workspace của bạn được lưu trữ cục bộ. Đăng ký để đồng bộ hóa lên đám mây.
                  </p>
              </div>

              {/* Search Bar */}
              <div className="mb-8 max-w-sm relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                      type="text" 
                      placeholder="Tìm kiếm workspace..." 
                      className="w-full bg-[#1e1b2e] border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                  />
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Workspace Cards */}
                  {workspaces.map(ws => (
                      <WorkspaceCard 
                          key={ws.id} 
                          workspace={ws} 
                          onClick={() => onSelect(ws.id)} 
                      />
                  ))}

                  {/* Create New Placeholder Card */}
                  <button
                    onClick={onCreate}
                    className="group relative w-full aspect-[16/10] rounded-2xl border border-dashed border-gray-600/50 hover:border-purple-500/50 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex flex-col items-center justify-center gap-3 cursor-pointer"
                  >
                      <div className="w-12 h-12 rounded-xl bg-gray-800/50 group-hover:bg-purple-500/20 flex items-center justify-center transition-colors">
                          <Plus size={24} className="text-gray-400 group-hover:text-purple-400" />
                      </div>
                      <span className="text-gray-400 group-hover:text-purple-300 font-medium text-sm">Tạo Workspace</span>
                  </button>
              </div>

          </div>
       </div>
    </div>
  );
};

export default Dashboard;