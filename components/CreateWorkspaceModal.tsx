import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES, TranslationConfig, ModelProvider } from '../types';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; author: string; genres: string[]; sourceLang: string; targetLang: string }) => void;
}

const GENRES = [
  "Tiên Hiệp", "Võ Hiệp", "Huyền Huyễn",
  "Đô Thị", "Lịch Sử", "Xuyên Không",
  "Ngôn Tình", "Đam Mỹ", "Bách Hợp", "Fantasy",
  "LitRPG", "Isekai", "Viễn Tưởng", "Hệ Thống",
  "Tận Thế", "Kinh Dị", "Hành Động", "Hài Hước",
  "Đời Thường", "Harem", "Trinh Thám", "Khác"
];

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('vi');

  if (!isOpen) return null;

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      name,
      author,
      genres: selectedGenres,
      sourceLang,
      targetLang
    });
    // Reset form
    setName('');
    setAuthor('');
    setSelectedGenres([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-gray-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Scrollable Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <h2 className="text-xl font-bold text-white mb-6">Tạo Workspace</h2>
          
          <div className="space-y-4">
            {/* Story Name */}
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Tên Truyện</label>
              <input
                type="text"
                className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Nhập tên truyện"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Genres */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Thể loại</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(genre => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedGenres.includes(genre)
                        ? 'bg-primary text-white border-primary shadow-md shadow-indigo-500/20'
                        : 'bg-[#1e293b] text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Author */}
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Tác Giả</label>
              <input
                type="text"
                className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                placeholder="Nhập tên tác giả"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            {/* Languages */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Ngôn Ngữ Gốc</label>
                <div className="relative">
                  <select
                    className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-4 py-2.5 text-white appearance-none focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Ngôn Ngữ Đích</label>
                <div className="relative">
                  <select
                    className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-4 py-2.5 text-white appearance-none focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                  >
                     {SUPPORTED_LANGUAGES.filter(l => l.code !== 'auto').map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 flex gap-3 mt-auto shrink-0 border-t border-gray-800 bg-[#0f172a] z-10">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-indigo-500/30 transition-all font-medium"
          >
            Tạo Workspace
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;