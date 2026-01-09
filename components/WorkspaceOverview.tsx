import React, { useRef, useState, useEffect } from 'react';
import { 
  BarChart2, Image as ImageIcon, Edit2, Cloud, Upload, RefreshCw, 
  Globe, Download, Users, Copy, Trash2, ExternalLink, FileText, Save, X, HardDrive
} from 'lucide-react';
import { Workspace } from '../types';

interface WorkspaceOverviewProps {
  workspace: Workspace;
  onUpdate: (updates: Partial<Workspace>) => void;
  onViewPublic: () => void;
  onDownloadEpub: () => void;
}

const WorkspaceOverview: React.FC<WorkspaceOverviewProps> = ({ workspace, onUpdate, onViewPublic, onDownloadEpub }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onUpdate({ coverImage: ev.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const StatRow = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded transition-colors">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white font-bold">{value}</span>
    </div>
  );

  const ToggleRow = ({ 
    icon: Icon, title, description, checked, onChange, children 
  }: { 
    icon: any, title: string, description?: string, checked: boolean, onChange: (v: boolean) => void, children?: React.ReactNode 
  }) => (
    <div className="flex flex-col p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${checked ? 'bg-primary/20 text-primary' : 'bg-gray-800 text-gray-400'}`}>
            <Icon size={20} />
            </div>
            <div>
            <h4 className="text-sm font-medium text-white">{title}</h4>
            {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
            </div>
        </div>
        <button
            onClick={() => onChange(!checked)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-primary' : 'bg-gray-700'}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      </div>
      {checked && children && (
          <div className="mt-2 pl-14">
              {children}
          </div>
      )}
    </div>
  );

  const EditableField = ({ 
    label, 
    value, 
    onSave, 
    placeholder, 
    multiline = false 
  }: { 
    label: string, 
    value: string, 
    onSave: (val: string) => void, 
    placeholder: string, 
    multiline?: boolean 
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    // Sync tempValue when prop value changes (e.g. from cloud sync)
    useEffect(() => {
        if (!isEditing) setTempValue(value);
    }, [value, isEditing]);

    const handleSave = () => {
        onSave(tempValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempValue(value);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="w-full animate-in fade-in duration-200">
                <div className="flex justify-between items-center mb-2 px-1">
                    <h4 className="text-sm font-bold text-white tracking-wide">{label}</h4>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleSave}
                            className="text-green-500 hover:text-green-400 transition-colors p-1" 
                            title="Save"
                        >
                            <Save size={14} />
                        </button>
                        <button 
                            onClick={handleCancel}
                            className="text-gray-500 hover:text-gray-300 transition-colors p-1" 
                            title="Cancel"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
                <div className="bg-[#1e293b]/60 border border-purple-500/30 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/20 rounded-xl overflow-hidden transition-all shadow-lg shadow-purple-900/10">
                    {multiline ? (
                        <textarea 
                            className="w-full bg-transparent border-none p-4 text-gray-200 focus:ring-0 resize-none h-32 placeholder-gray-600 leading-relaxed text-sm"
                            placeholder={placeholder}
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            autoFocus
                        />
                    ) : (
                        <input 
                            type="text"
                            className="w-full bg-transparent border-none p-4 text-gray-200 focus:ring-0 placeholder-gray-600 text-sm font-medium"
                            placeholder={placeholder}
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter') handleSave() }}
                            autoFocus
                        />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="group w-full py-1">
             <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-white mb-1.5">{label}</h4>
                    <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {value || <span className="text-gray-500 italic text-xs">{placeholder}</span>}
                    </div>
                </div>
                <button 
                    onClick={() => setIsEditing(true)}
                    className="text-gray-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100"
                    title="Edit"
                >
                    <Edit2 size={14} />
                </button>
            </div>
        </div>
    );
  };

  const isDrive = workspace.settings.cloudProvider === 'google_drive';

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Section: Stats & Cover */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Stats Card - Transparent style based on feedback */}
          <div className="md:col-span-7">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart2 size={24} className="text-primary" /> Thống Kê
            </h3>
            <div className="bg-[#1e1b2e]/40 backdrop-blur-sm rounded-2xl p-2 border border-white/5">
                <div className="p-2 space-y-1">
                    <StatRow label="Tổng số chương" value={workspace.chapterProgress.total} />
                    <StatRow label="Đã dịch" value={workspace.chapterProgress.current} />
                    <StatRow label="Thuật ngữ" value={workspace.glossary.length} />
                    <StatRow label="Nhân vật" value={workspace.glossary.filter(g => g.type === 'name').length} />
                    <StatRow label="Lượt thích" value={workspace.stats.likes} />
                    <StatRow label="Bình luận" value={workspace.stats.comments} />
                </div>
            </div>
          </div>

          {/* Cover Image Card */}
          <div className="md:col-span-5 bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center relative group">
            <h3 className="absolute top-6 left-6 text-lg font-bold text-white z-10">Ảnh bìa</h3>
            
            <div className="mt-8 relative w-48 aspect-[2/3] bg-black/40 rounded-lg overflow-hidden border-2 border-dashed border-gray-700 group-hover:border-primary transition-colors flex items-center justify-center shadow-2xl">
              {workspace.coverImage ? (
                <>
                  <img src={workspace.coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-white hover:text-primary text-xs flex items-center gap-1"
                     >
                        <Edit2 size={12} /> Change
                     </button>
                     <button 
                        onClick={() => onUpdate({ coverImage: undefined })}
                        className="text-white hover:text-red-400 text-xs flex items-center gap-1"
                     >
                        <Trash2 size={12} /> Remove
                     </button>
                  </div>
                </>
              ) : (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 text-gray-500 cursor-pointer p-4 text-center"
                >
                  <ImageIcon size={32} />
                  <span className="text-xs">Upload Cover</span>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            {workspace.coverImage && (
                <button onClick={() => onUpdate({ coverImage: undefined })} className="mt-4 text-xs text-red-400 hover:text-red-300">
                    Xóa ảnh
                </button>
            )}
          </div>
        </div>

        {/* Info Section: Author & Description (Redesigned) */}
        <div className="grid grid-cols-1 gap-6 p-6 rounded-2xl border border-white/5 bg-white/5">
          <EditableField 
            label="Tác giả"
            value={workspace.author || ''}
            onSave={(val) => onUpdate({ author: val })}
            placeholder="Nhập tên tác giả..."
          />
          
          <div className="h-px bg-white/5 w-full" />

          <EditableField 
            label="Mô tả"
            value={workspace.description || ''}
            onSave={(val) => onUpdate({ description: val })}
            placeholder="Chưa có mô tả..."
            multiline
          />
        </div>

        {/* Sync Section */}
        <div className={`bg-gradient-to-br border rounded-2xl p-6 transition-colors ${isDrive ? 'from-blue-900/20 to-[#1e1b4b]/30 border-blue-500/20' : 'from-[#1e293b]/50 to-[#1e1b4b]/30 border-white/10'}`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                   Đồng bộ & Xuất bản
                   {isDrive && <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">Google Drive</span>}
                </h3>
                <span className="text-xs text-gray-400">
                    Last synced: {new Date(workspace.lastModified).toLocaleString()}
                </span>
            </div>

            <div className="bg-black/20 rounded-xl p-6 mb-6">
                 <div className="flex items-center gap-2 mb-4">
                    {isDrive ? (
                         <div className="p-1 bg-white rounded-md"><img src="https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo_%282020%29.svg" className="w-4 h-4" /></div>
                    ) : (
                         <Cloud size={16} className="text-cyan-400" />
                    )}
                    <span className={`text-sm font-bold ${isDrive ? 'text-blue-400' : 'text-cyan-400'}`}>
                        {isDrive ? `Drive: ${workspace.settings.googleDriveEmail}` : 'NovelWeaver Cloud Status'}
                    </span>
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                        <div className="text-xs text-gray-400 mb-1">Total Chapters</div>
                        <div className="text-lg font-bold text-white">{workspace.chapterProgress.total}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 mb-1">Translated</div>
                        <div className="text-lg font-bold text-white">{workspace.chapterProgress.current}</div>
                    </div>
                 </div>
            </div>

            <div className="flex gap-4">
                <button className="px-4 py-2 bg-[#1e293b] hover:bg-gray-700 border border-gray-600 rounded-lg text-sm text-white font-medium flex items-center gap-2 transition-colors">
                    <Upload size={16} /> Tải từ {isDrive ? 'Drive' : 'Cloud'}
                </button>
                <button className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border ${isDrive ? 'bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/50 text-blue-300' : 'bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/50 text-indigo-300'}`}>
                    <RefreshCw size={16} /> Đồng bộ thay đổi
                </button>
            </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4">
            <ToggleRow 
                icon={Globe}
                title="Truy cập công khai"
                description="Bất kỳ ai có liên kết đều có thể xem workspace này"
                checked={workspace.settings.publicAccess}
                onChange={(v) => onUpdate({ settings: { ...workspace.settings, publicAccess: v } })}
            >
                <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg text-xs text-gray-300 font-mono mb-2">
                    <span className="truncate flex-1">https://novelweaver.ai/share/{workspace.id}</span>
                    <button 
                        onClick={() => navigator.clipboard.writeText(`https://novelweaver.ai/share/${workspace.id}`)}
                        className="text-gray-500 hover:text-white"
                        title="Copy Link"
                    >
                        <Copy size={14} />
                    </button>
                    <button
                        onClick={onViewPublic}
                        className="text-primary hover:text-indigo-400 flex items-center gap-1 ml-2 font-sans font-bold"
                    >
                        <ExternalLink size={14} /> Open
                    </button>
                </div>
            </ToggleRow>

            <ToggleRow 
                icon={Download}
                title="Cho phép tải EPUB"
                description="Khách có thể tải nội dung đã dịch dưới dạng EPUB"
                checked={workspace.settings.allowEpub}
                onChange={(v) => onUpdate({ settings: { ...workspace.settings, allowEpub: v } })}
            >
                <button 
                    onClick={onDownloadEpub}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-medium border border-blue-500/30 transition-colors"
                >
                    <FileText size={14} /> Generate & Download .EPUB
                </button>
            </ToggleRow>

            <ToggleRow 
                icon={Users}
                title="Cho phép đóng góp"
                description="Người khác có thể gửi bản dịch đóng góp vào workspace này"
                checked={workspace.settings.allowContribution}
                onChange={(v) => onUpdate({ settings: { ...workspace.settings, allowContribution: v } })}
            />
        </div>

      </div>
    </div>
  );
};

export default WorkspaceOverview;