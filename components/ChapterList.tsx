import React, { useState, useRef } from 'react';
import { 
  Search, Upload, Globe, ScanLine, Trash2, 
  CheckCircle2, Circle, PenLine, ChevronDown, X,
  FileText, ArrowDown01, ArrowUp01, Settings2, RefreshCcw
} from 'lucide-react';
import { Workspace, Chapter } from '../types';

interface ChapterListProps {
  workspace: Workspace;
  onSelect: (chapterId: string) => void;
  onUpdate: (updates: Partial<Workspace>) => void;
  onImportWeb: () => void;
}

const ChapterList: React.FC<ChapterListProps> = ({ workspace, onSelect, onUpdate, onImportWeb }) => {
  // State for Toolbar & List
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // desc = Newest (High ID), asc = Oldest
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [rangeInput, setRangeInput] = useState('');

  // State for Modals
  const [showConsistencyModal, setShowConsistencyModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  
  // Consistency Scan State
  const [scanStart, setScanStart] = useState(1);
  const [scanEnd, setScanEnd] = useState(Math.min(200, workspace.chapters.length || 200));
  const [scanThreshold, setScanThreshold] = useState(90);

  // Replace State
  const [replaceSearch, setReplaceSearch] = useState('');
  const [replaceWith, setReplaceWith] = useState('');
  const [replaceMode, setReplaceMode] = useState<'text' | 'regex'>('text');
  const [replaceTarget, setReplaceTarget] = useState<'title' | 'content'>('content');
  const [replaceLang, setReplaceLang] = useState<'source' | 'translated'>('translated');

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LOGIC: FILTER & SORT ---
  const filteredChapters = (workspace.chapters || [])
    .filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (c.translatedTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' 
            ? true 
            : filterStatus === 'completed' 
                ? (c.status === 'completed' || c.status === 'translating') 
                : (c.status === 'pending' || c.status === 'error');
        return matchesSearch && matchesStatus;
    })
    .sort((a, b) => sortOrder === 'desc' ? b.index - a.index : a.index - b.index);

  // --- LOGIC: SELECTION ---
  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedChapters);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedChapters(newSet);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          setSelectedChapters(new Set(filteredChapters.map(c => c.id)));
      } else {
          setSelectedChapters(new Set());
      }
  };

  const handleRangeSelect = () => {
    if (!rangeInput.trim()) return;
    const newSet = new Set(selectedChapters);
    
    // Parse input: "1-100" or "50"
    const parts = rangeInput.split('-').map(s => parseInt(s.trim()));
    const start = parts[0];
    const end = parts.length > 1 ? parts[1] : start;

    if (!isNaN(start)) {
        workspace.chapters.forEach(c => {
            if (c.index >= start && c.index <= end) {
                newSet.add(c.id);
            }
        });
        setSelectedChapters(newSet);
        setRangeInput(''); // Clear after select
    }
  };

  // --- LOGIC: ACTIONS ---
  const handleDeleteChapter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa chương này?")) {
      const updatedChapters = workspace.chapters.filter(c => c.id !== id);
      onUpdate({ chapters: updatedChapters });
    }
  };

  const handleDeleteSelected = () => {
      if (selectedChapters.size === 0) return;
      if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedChapters.size} chương đã chọn?`)) {
          const updatedChapters = workspace.chapters.filter(c => !selectedChapters.has(c.id));
          onUpdate({ chapters: updatedChapters });
          setSelectedChapters(new Set());
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
        const newChapters: Chapter[] = Array.from(files).map((f: File, i) => ({
             id: `upload-${Date.now()}-${i}`,
             index: (workspace.chapters.length || 0) + i + 1,
             title: f.name.replace(/\.[^/.]+$/, ""),
             status: 'pending',
             sourceText: "Content uploaded from file...",
             translatedText: '',
             sourceWordCount: 0,
             translatedWordCount: 0,
             lastModified: Date.now()
        }));
        onUpdate({ chapters: [...workspace.chapters, ...newChapters] });
        alert(`Đã tải lên ${files.length} file thành công.`);
    }
  };

  // --- HELPER: UI COMPONENTS ---
  const getStatusBadge = (status: Chapter['status']) => {
    switch(status) {
      case 'completed': return <span className="px-2 py-0.5 rounded text-[10px] bg-green-900/30 text-green-400 border border-green-800">Hoàn tất</span>;
      case 'translating': return <span className="px-2 py-0.5 rounded text-[10px] bg-blue-900/30 text-blue-400 border border-blue-800">Đang dịch</span>;
      case 'error': return <span className="px-2 py-0.5 rounded text-[10px] bg-red-900/30 text-red-400 border border-red-800">Lỗi</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] bg-yellow-600/20 text-yellow-500 border border-yellow-600/30">Chờ dịch</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0a14] text-gray-200 relative">
      
      {/* --- TOOLBAR --- */}
      <div className="p-6 border-b border-white/5 bg-[#140e24] space-y-5">
        
        {/* Row 1: Search & Filters */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <h2 className="text-lg font-bold text-white shrink-0">Danh Sách Chương</h2>
            
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm chương..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-300 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder-gray-600"
                    />
                </div>

                {/* Status Filter Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => setShowStatusMenu(!showStatusMenu)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
                    >
                        {filterStatus === 'all' ? 'Tất cả trạng thái' : filterStatus === 'completed' ? 'Hoàn tất' : 'Chờ dịch'}
                        <ChevronDown size={12} />
                    </button>
                    {showStatusMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
                            <div className="absolute top-full mt-1 right-0 w-40 bg-[#1e293b] border border-gray-700 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
                                <button onClick={() => { setFilterStatus('all'); setShowStatusMenu(false); }} className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white">Tất cả trạng thái</button>
                                <button onClick={() => { setFilterStatus('pending'); setShowStatusMenu(false); }} className="w-full text-left px-4 py-2 text-xs text-yellow-500 hover:bg-white/5">Chờ dịch</button>
                                <button onClick={() => { setFilterStatus('completed'); setShowStatusMenu(false); }} className="w-full text-left px-4 py-2 text-xs text-green-400 hover:bg-white/5">Hoàn tất</button>
                            </div>
                        </>
                    )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
                    >
                        {sortOrder === 'desc' ? 'Mới nhất' : 'Cũ nhất'}
                        <ChevronDown size={12} />
                    </button>
                     {showSortMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                            <div className="absolute top-full mt-1 right-0 w-48 bg-[#1e293b] border border-gray-700 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
                                <button onClick={() => { setSortOrder('desc'); setShowSortMenu(false); }} className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white flex justify-between">
                                    Mới nhất (Lớn → Nhỏ) <ArrowDown01 size={12} />
                                </button>
                                <button onClick={() => { setSortOrder('asc'); setShowSortMenu(false); }} className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white flex justify-between">
                                    Cũ nhất (Nhỏ → Lớn) <ArrowUp01 size={12} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
                
                {/* Range Selector */}
                <div className="flex items-center gap-1">
                     <input 
                        type="text" 
                        value={rangeInput}
                        onChange={(e) => setRangeInput(e.target.value)}
                        placeholder="vd: 1-100"
                        className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder-gray-600"
                    />
                    <button 
                        onClick={handleRangeSelect}
                        className="px-3 py-1.5 bg-purple-900/30 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-medium hover:bg-purple-900/50 transition-colors whitespace-nowrap"
                    >
                        Chọn
                    </button>
                </div>
            </div>
        </div>

        {/* Row 2: Actions */}
        <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2">
                 {selectedChapters.size > 0 && (
                     <button 
                        onClick={handleDeleteSelected}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-900/20 hover:bg-red-900/30 border border-red-800 text-red-400 rounded-lg text-xs font-medium transition-all"
                    >
                        <Trash2 size={14} /> Xóa {selectedChapters.size} mục
                    </button>
                 )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
                <input 
                    ref={fileInputRef} 
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={handleFileUpload}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                >
                    <Upload size={14} /> Upload File
                </button>
                
                <button 
                    onClick={onImportWeb}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                >
                    <Globe size={14} /> Nhập Web
                </button>

                <button 
                    onClick={() => setShowConsistencyModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                >
                    <ScanLine size={14} /> Quét Nhất Quán
                </button>

                <button 
                    onClick={() => setShowReplaceModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                >
                    <PenLine size={14} /> Thay Thế
                </button>
            </div>
        </div>
      </div>

      {/* --- TABLE CONTENT --- */}
      <div className="flex-1 overflow-auto bg-[#0b0a14]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#140e24] sticky top-0 z-10">
            <tr>
              <th className="p-4 w-12 border-b border-white/5">
                <input 
                    type="checkbox" 
                    className="rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                    checked={filteredChapters.length > 0 && selectedChapters.size === filteredChapters.length}
                    onChange={handleSelectAll}
                />
              </th>
              <th className="p-4 border-b border-white/5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Chapter</th>
              <th className="p-4 border-b border-white/5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Trạng Thái</th>
              <th className="p-4 border-b border-white/5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Số Từ</th>
              <th className="p-4 border-b border-white/5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredChapters.length === 0 ? (
                <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500 italic">
                        Không tìm thấy chương nào.
                    </td>
                </tr>
            ) : (
                filteredChapters.map(chapter => (
                    <tr 
                        key={chapter.id} 
                        onClick={() => onSelect(chapter.id)}
                        className={`group hover:bg-white/5 transition-colors cursor-pointer ${selectedChapters.has(chapter.id) ? 'bg-purple-900/10' : ''}`}
                    >
                        <td className="p-4" onClick={(e) => toggleSelection(chapter.id, e)}>
                            <input 
                                type="checkbox" 
                                className="rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                                checked={selectedChapters.has(chapter.id)}
                                readOnly
                            />
                        </td>
                        <td className="p-4">
                            <div className="flex flex-col">
                                <span className={`text-sm font-medium ${chapter.status === 'completed' ? 'text-white' : 'text-gray-300'}`}>
                                    {chapter.title}
                                </span>
                                {chapter.translatedTitle && (
                                    <span className="text-xs text-purple-400 mt-0.5">{chapter.translatedTitle}</span>
                                )}
                            </div>
                        </td>
                        <td className="p-4">
                            {getStatusBadge(chapter.status)}
                        </td>
                        <td className="p-4 text-right text-xs text-gray-400 font-mono">
                            {chapter.status === 'completed' 
                                ? `${chapter.translatedWordCount} words` 
                                : `${chapter.sourceWordCount} words`}
                        </td>
                        <td className="p-4 text-right">
                            <button 
                                onClick={(e) => handleDeleteChapter(chapter.id, e)}
                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                                title="Xóa chương"
                            >
                                <Trash2 size={14} />
                            </button>
                        </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL: Replace --- */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#1e293b] border border-gray-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <RefreshCcw size={16} className="text-purple-400" /> Thay thế hàng loạt
                    </h3>
                    <button onClick={() => setShowReplaceModal(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Tìm kiếm</label>
                        <input 
                            type="text" 
                            className="w-full bg-[#0f172a] border border-gray-600 rounded px-3 py-2 text-white focus:ring-1 focus:ring-purple-500 outline-none"
                            value={replaceSearch}
                            onChange={(e) => setReplaceSearch(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Thay thế bằng</label>
                        <input 
                            type="text" 
                            className="w-full bg-[#0f172a] border border-gray-600 rounded px-3 py-2 text-white focus:ring-1 focus:ring-purple-500 outline-none"
                            value={replaceWith}
                            onChange={(e) => setReplaceWith(e.target.value)}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="text-xs text-gray-400 mb-1 block">Phạm vi</label>
                             <select 
                                className="w-full bg-[#0f172a] border border-gray-600 rounded px-2 py-2 text-white text-xs outline-none"
                                value={replaceTarget}
                                onChange={(e) => setReplaceTarget(e.target.value as any)}
                             >
                                 <option value="content">Nội dung</option>
                                 <option value="title">Tiêu đề</option>
                             </select>
                        </div>
                         <div>
                             <label className="text-xs text-gray-400 mb-1 block">Ngôn ngữ</label>
                             <select 
                                className="w-full bg-[#0f172a] border border-gray-600 rounded px-2 py-2 text-white text-xs outline-none"
                                value={replaceLang}
                                onChange={(e) => setReplaceLang(e.target.value as any)}
                             >
                                 <option value="translated">Bản dịch</option>
                                 <option value="source">Bản gốc</option>
                             </select>
                        </div>
                    </div>

                     <div className="flex items-center gap-4 pt-2">
                        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                            <input type="radio" checked={replaceMode === 'text'} onChange={() => setReplaceMode('text')} /> Text
                        </label>
                        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                            <input type="radio" checked={replaceMode === 'regex'} onChange={() => setReplaceMode('regex')} /> Regex
                        </label>
                     </div>
                </div>
                <div className="p-4 bg-gray-800/50 flex justify-end gap-2">
                    <button onClick={() => setShowReplaceModal(false)} className="px-4 py-2 text-xs text-gray-300 hover:text-white">Hủy</button>
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded shadow-lg">Thực hiện</button>
                </div>
            </div>
        </div>
      )}

       {/* --- MODAL: Consistency --- */}
      {showConsistencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#1e293b] border border-gray-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <ScanLine size={16} className="text-amber-400" /> Kiểm tra nhất quán
                    </h3>
                    <button onClick={() => setShowConsistencyModal(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-400 mb-6">
                        Công cụ này sẽ quét các chương đã dịch để tìm các tên riêng, địa danh không nhất quán so với bảng thuật ngữ (Glossary).
                    </p>
                    
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 mb-1 block">Từ chương</label>
                                <input type="number" value={scanStart} onChange={(e) => setScanStart(Number(e.target.value))} className="w-full bg-[#0f172a] border border-gray-600 rounded px-3 py-2 text-white" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 mb-1 block">Đến chương</label>
                                <input type="number" value={scanEnd} onChange={(e) => setScanEnd(Number(e.target.value))} className="w-full bg-[#0f172a] border border-gray-600 rounded px-3 py-2 text-white" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Độ nhạy (Fuzzy Match Threshold)</label>
                            <input type="range" min="50" max="100" value={scanThreshold} onChange={(e) => setScanThreshold(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                            <div className="text-right text-xs text-amber-400 mt-1">{scanThreshold}%</div>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-800/50 flex justify-end gap-2">
                    <button onClick={() => setShowConsistencyModal(false)} className="px-4 py-2 text-xs text-gray-300 hover:text-white">Hủy</button>
                    <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded shadow-lg">Bắt đầu quét</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default ChapterList;