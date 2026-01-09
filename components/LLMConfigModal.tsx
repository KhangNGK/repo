import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Check, AlertTriangle, Key, ChevronDown, 
  Plus, Download, Settings, Server, Globe, Puzzle, Eye, EyeOff
} from 'lucide-react';

interface LLMConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_MODELS = [
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-3-pro-image-preview',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-pro-preview-tts',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash-image-preview',
  'gemini-2.5-flash-image',
  'gemini-2.5-flash-preview-09-2025',
  'gemini-2.5-flash-lite-preview-09-2025',
  'gemini-2.5-computer-use-preview-10-2025',
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.0-flash-lite-001'
];

const LLMConfigModal: React.FC<LLMConfigModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');
  const [backupKeys, setBackupKeys] = useState<{name: string, key: string}[]>([]);
  const [showBackupInput, setShowBackupInput] = useState(false);
  const [newBackupName, setNewBackupName] = useState('');
  const [newBackupKey, setNewBackupKey] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('nw_global_api_key');
    const savedModel = localStorage.getItem('nw_global_model');
    if (savedKey) setApiKey(savedKey);
    if (savedModel) setSelectedModel(savedModel);
  }, []);

  const handleSave = () => {
    localStorage.setItem('nw_global_api_key', apiKey);
    localStorage.setItem('nw_global_model', selectedModel);
    onClose();
  };

  const handleCheckConnection = () => {
    setIsChecking(true);
    // Simulate API check
    setTimeout(() => {
      setIsChecking(false);
      setConnectionStatus('success');
      setTimeout(() => setConnectionStatus('idle'), 3000);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1e1b2e] border border-gray-700 w-full max-w-2xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-700 bg-[#140e24]">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Settings size={20} className="text-purple-400" />
            Cấu hình LLM
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[#0f0a1e]">
          
          <div className="text-sm text-gray-400 bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl">
            Cấu hình nhà cung cấp LLM mặc định, API key và cài đặt mô hình. Các cài đặt này sẽ được dùng cho tất cả bản dịch.
          </div>

          {/* Provider */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Nhà Cung Cấp</label>
            <div className="relative">
              <select className="w-full bg-[#1e293b] border border-gray-600 rounded-xl px-4 py-3 text-white appearance-none focus:ring-1 focus:ring-purple-500 outline-none">
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI (ChatGPT)</option>
                <option value="anthropic">Anthropic (Claude)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">API Key (Primary)</label>
            <div className="relative group">
              <input 
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-[#1e293b] border border-gray-600 rounded-xl pl-10 pr-10 py-3 text-white focus:ring-1 focus:ring-purple-500 outline-none font-mono text-sm"
                placeholder="sk-..."
              />
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400" size={16} />
              <button 
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] text-yellow-500 bg-yellow-900/10 p-2 rounded-lg border border-yellow-700/30">
              <AlertTriangle size={12} />
              <span>Lỗi 9 giờ trước: API key của bạn được lưu trữ cục bộ trên trình duyệt.</span>
            </div>
            <div className="text-[10px] text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1">
              <Globe size={10} /> Làm sao để lấy API Key?
            </div>
          </div>

          {/* Backup Keys */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
               <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                 <Key size={12} className="text-amber-500" /> API Key Dự Phòng
               </label>
               <button 
                onClick={() => setShowBackupInput(!showBackupInput)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
               >
                 <Download size={12} /> Nhập
               </button>
            </div>
            
            <p className="text-xs text-gray-500">Key dự phòng sẽ tự động được dùng nếu key chính thất bại. Key dự phòng thành công sẽ được đổi thành key chính.</p>
            
            {showBackupInput && (
              <div className="bg-[#1e293b] border border-gray-600 rounded-xl p-3 animate-in slide-in-from-top-2">
                 <input 
                    type="text" 
                    placeholder="Tên (tùy chọn, VD: Production)" 
                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white mb-2 focus:border-purple-500 outline-none"
                    value={newBackupName}
                    onChange={(e) => setNewBackupName(e.target.value)}
                 />
                 <div className="flex gap-2">
                    <input 
                        type="password" 
                        placeholder="API Key dự phòng" 
                        className="flex-1 bg-[#0f172a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none font-mono"
                        value={newBackupKey}
                        onChange={(e) => setNewBackupKey(e.target.value)}
                    />
                    <button className="px-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
                        <Plus size={16} />
                    </button>
                 </div>
              </div>
            )}
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
                 <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Model</label>
                 <button className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1">
                    <RefreshCustomIcon /> Làm mới mô hình
                 </button>
            </div>
            <div className="relative">
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-[#1e293b] border border-gray-600 rounded-xl px-4 py-3 text-white appearance-none focus:ring-1 focus:ring-purple-500 outline-none custom-select"
              >
                {AVAILABLE_MODELS.map(model => (
                    <option key={model} value={model}>{model}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Test Connection */}
          <button 
            onClick={handleCheckConnection}
            disabled={isChecking}
            className={`w-full py-3 rounded-xl border font-medium transition-all flex items-center justify-center gap-2 ${
                connectionStatus === 'success' 
                    ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                    : 'bg-[#2a0a55]/50 border-purple-500/30 text-purple-200 hover:bg-[#2a0a55]'
            }`}
          >
             {isChecking ? (
                 <span className="animate-pulse">Đang kiểm tra...</span>
             ) : connectionStatus === 'success' ? (
                 <><Check size={18} /> Kết nối thành công</>
             ) : (
                 <><Check size={18} /> Kiểm Tra Kết Nối</>
             )}
          </button>

          {/* Tools & Integrations */}
          <div className="space-y-4 pt-4 border-t border-gray-700/50">
             <div className="flex items-center gap-2 text-white font-bold">
                <Puzzle size={18} className="text-blue-400" />
                Công cụ & Tích hợp
             </div>
             <p className="text-xs text-gray-500">Extension trình duyệt và cài đặt MCP</p>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Extension Card */}
                 <div className="bg-[#151120] border border-gray-700 rounded-xl p-4 hover:border-blue-500/30 transition-colors">
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 font-medium text-gray-200 text-sm">
                            <Globe size={14} className="text-blue-400" /> Extension Trình Duyệt
                        </div>
                        <span className="px-1.5 py-0.5 bg-yellow-900/30 text-yellow-500 text-[10px] rounded border border-yellow-700/30">Chưa cài đặt</span>
                     </div>
                     <p className="text-[10px] text-gray-400 mb-4 h-8 line-clamp-2">
                         Cần thiết để vượt Cloudflare và hỗ trợ MCP.
                     </p>
                     <button className="w-full py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors">
                         <Download size={12} /> Tải Extension
                     </button>
                     <div className="mt-2 text-[10px] text-gray-500 hover:text-blue-400 cursor-pointer flex items-center gap-1">
                         <ChevronDown size={10} className="-rotate-90" /> Cách cài đặt?
                     </div>
                 </div>

                 {/* MCP Card */}
                 <div className="bg-[#151120] border border-gray-700 rounded-xl p-4 hover:border-purple-500/30 transition-colors">
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 font-medium text-gray-200 text-sm">
                            <Server size={14} className="text-purple-400" /> MCP Server
                        </div>
                     </div>
                     <p className="text-[10px] text-gray-400 mb-4 h-8 line-clamp-2">
                         Kết nối LLM Agent (Claude Desktop / Antigravity / Cline...) với dữ liệu local.
                     </p>
                     <div className="flex gap-2">
                        <button className="flex-1 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors">
                            <Download size={12} /> File Server
                        </button>
                        <button className="flex-1 py-1.5 bg-gray-700/30 hover:bg-gray-700/50 text-gray-300 border border-gray-600/30 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors">
                             <Settings size={12} /> Config
                        </button>
                     </div>
                     <div className="mt-2 text-[10px] text-gray-500 hover:text-purple-400 cursor-pointer flex items-center gap-1 text-center justify-center">
                         Xem hướng dẫn cài đặt →
                     </div>
                 </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-[#140e24] flex justify-end">
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all transform active:scale-95"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Icon
const RefreshCustomIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
)

export default LLMConfigModal;