import React from 'react';
import { Plus, Folder, Trash2 } from 'lucide-react';
import { Workspace } from '../types';

interface WorkspaceListProps {
  workspaces: Workspace[];
  activeId: string;
  onSelect: (id: string) => void;
  onOpenCreateModal: () => void;
  onDelete: (id: string) => void;
  className?: string;
}

const WorkspaceList: React.FC<WorkspaceListProps> = ({ 
  workspaces, activeId, onSelect, onOpenCreateModal, onDelete, className 
}) => {
  return (
    <div className={`flex flex-col h-full bg-[#0b1120] border-r border-gray-800 ${className}`}>
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Workspaces</h3>
        
        <button 
          onClick={onOpenCreateModal}
          className="w-full flex items-center gap-2 text-sm text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 p-2 rounded transition-colors"
        >
          <Plus size={16} /> New Workspace
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {workspaces.map(ws => (
          <div 
            key={ws.id}
            className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${activeId === ws.id ? 'bg-primary/20 text-white border border-primary/30' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
            onClick={() => onSelect(ws.id)}
          >
            <div className="flex items-center gap-3 overflow-hidden">
                <Folder size={16} className={activeId === ws.id ? 'text-primary' : 'text-gray-500'} />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm truncate font-medium">{ws.name}</span>
                  {ws.genres && ws.genres.length > 0 && (
                     <span className="text-[10px] text-gray-500 truncate">{ws.genres[0]}</span>
                  )}
                </div>
            </div>
            {workspaces.length > 1 && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(ws.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                >
                    <Trash2 size={14} />
                </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceList;