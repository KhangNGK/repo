import React, { useState } from 'react';
import { 
  Cloud, RefreshCw, Settings as SettingsIcon, Radio, Save, 
  Trash2, CheckCircle2, Activity, Eye, EyeOff, ExternalLink, HardDrive, Server
} from 'lucide-react';
import { Workspace } from '../types';

interface WorkspaceSettingsProps {
  workspace: Workspace;
  onUpdate: (updates: Partial<Workspace>) => void;
  onDelete: () => void;
}

const WorkspaceSettings: React.FC<WorkspaceSettingsProps> = ({ workspace, onUpdate, onDelete }) => {
  const [webhookUrl, setWebhookUrl] = useState(workspace.settings.webhookUrl || '');
  const [webhookKey, setWebhookKey] = useState(workspace.settings.webhookKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // Mock connecting to Google Drive
  const handleConnectDrive = () => {
    // In a real app, this would trigger OAuth
    if (workspace.settings.googleDriveEmail) {
        // Disconnect
        onUpdate({ 
            settings: { 
                ...workspace.settings, 
                googleDriveEmail: undefined,
                cloudProvider: 'internal' 
            } 
        });
    } else {
        // Connect
        const mockEmail = "user@gmail.com";
        onUpdate({ 
            settings: { 
                ...workspace.settings, 
                googleDriveEmail: mockEmail,
                cloudProvider: 'google_drive' 
            } 
        });
    }
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onUpdate({ lastModified: Date.now() });
      setIsSyncing(false);
    }, 2000);
  };

  const handleSaveWebhook = () => {
    setIsSavingWebhook(true);
    setTimeout(() => {
      onUpdate({ 
        settings: { 
          ...workspace.settings, 
          webhookUrl, 
          webhookKey 
        } 
      });
      setIsSavingWebhook(false);
    }, 1000);
  };

  const handleTestWebhook = () => {
    setIsTestingWebhook(true);
    setTimeout(() => setIsTestingWebhook(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-12 bg-[#0b1120]">
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-xl font-bold text-white mb-6">Cài Đặt</h2>

        {/* 1. Cloud Sync Card */}
        <div className="bg-[#1e293b]/60 border border-gray-700/50 rounded-2xl p-6 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="flex items-center gap-2 mb-6">
            <Cloud className="text-gray-400" size={20} />
            <h3 className="font-bold text-white">Cloud Sync & Backup</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 text-sm">Trạng thái đồng bộ</span>
              <span className="flex items-center gap-1.5 text-cyan-400 text-sm font-medium">
                <CheckCircle2 size={14} /> 
                {workspace.settings.cloudProvider === 'google_drive' ? 'Đã đồng bộ Google Drive' : 'Đã đồng bộ NovelWeaver Cloud'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 text-sm">Đồng bộ lần cuối</span>
              <span className="text-gray-300 text-sm font-mono">
                {new Date(workspace.lastModified).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div>
                <div className="text-white text-sm font-medium">Tự động đồng bộ</div>
                <div className="text-gray-500 text-xs mt-0.5">Tự động sao lưu dữ liệu khi có thay đổi</div>
              </div>
              <button
                onClick={() => onUpdate({ settings: { ...workspace.settings, autoSync: !workspace.settings.autoSync } })}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${workspace.settings.autoSync ? 'bg-primary' : 'bg-gray-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${workspace.settings.autoSync ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

             {/* Provider Selection */}
             <div className="mt-6 border-t border-gray-700/50 pt-4">
                <h4 className="text-sm font-bold text-white mb-3">Tích hợp lưu trữ</h4>
                <div className="space-y-3">
                    {/* NovelWeaver Cloud (Default) */}
                    <div 
                        onClick={() => onUpdate({ settings: { ...workspace.settings, cloudProvider: 'internal' } })}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${workspace.settings.cloudProvider === 'internal' ? 'bg-primary/10 border-primary' : 'bg-[#0f172a] border-gray-700 hover:bg-[#1e293b]'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300">
                                <Server size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">NovelWeaver Cloud</div>
                                <div className="text-xs text-gray-500">Lưu trữ mặc định tốc độ cao</div>
                            </div>
                        </div>
                        {workspace.settings.cloudProvider === 'internal' && <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>}
                    </div>

                    {/* Google Drive */}
                    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${workspace.settings.cloudProvider === 'google_drive' ? 'bg-blue-500/10 border-blue-500/50' : 'bg-[#0f172a] border-gray-700'}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden p-2">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo_%282020%29.svg" alt="Google Drive" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">Google Drive</div>
                                {workspace.settings.googleDriveEmail ? (
                                    <div className="text-xs text-green-400 flex items-center gap-1">
                                        Đã kết nối: {workspace.settings.googleDriveEmail}
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-500">Đồng bộ file .json và .epub</div>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={handleConnectDrive}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${workspace.settings.googleDriveEmail ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20' : 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30'}`}
                        >
                            {workspace.settings.googleDriveEmail ? 'Ngắt kết nối' : 'Kết nối'}
                        </button>
                    </div>
                </div>
            </div>

            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full mt-4 py-3 bg-[#2b3544] hover:bg-[#334155] text-cyan-400 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors border border-dashed border-gray-600 hover:border-cyan-500/50"
            >
              <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} /> 
              {isSyncing ? "Đang đồng bộ..." : "Đẩy thay đổi ngay"}
            </button>
          </div>
        </div>

        {/* 2. LLM Configuration Card */}
        <div className="bg-[#1e293b]/60 border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="text-gray-400" size={20} />
            <h3 className="font-bold text-white">Cấu hình LLM</h3>
          </div>
          
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Cấu hình nhà cung cấp LLM mặc định, API key và cài đặt mô hình. Các cài đặt này sẽ được dùng cho tất cả bản dịch trong workspace này.
          </p>

          <button className="px-4 py-2 bg-[#2b3544] hover:bg-[#334155] text-gray-300 text-sm font-medium rounded-lg transition-colors border border-gray-600">
            Đi tới Cài đặt chung
          </button>
        </div>

        {/* 3. Webhook Configuration Card */}
        <div className="bg-[#1e293b]/60 border border-gray-700/50 rounded-2xl p-6 relative">
          <div className="flex items-center gap-2 mb-6">
            <Radio className="text-gray-400" size={20} />
            <h3 className="font-bold text-white">Cấu hình Webhook</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Webhook URL</label>
              <input 
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://website-cua-ban.com/api/webhook"
                className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none transition-all placeholder-gray-600"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Webhook API Key (Tùy chọn)</label>
              <div className="relative">
                <input 
                  type={showKey ? "text" : "password"}
                  value={webhookKey}
                  onChange={(e) => setWebhookKey(e.target.value)}
                  placeholder="Secret Key"
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none transition-all placeholder-gray-600 pr-10"
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 gap-4">
               <button className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                 <ExternalLink size={12} /> Xem dữ liệu mẫu
               </button>

               <div className="flex gap-3">
                 <button 
                    onClick={handleTestWebhook}
                    disabled={isTestingWebhook}
                    className="px-4 py-2 bg-transparent hover:bg-white/5 text-gray-400 text-sm font-medium rounded-lg transition-colors border border-gray-700 flex items-center gap-2"
                 >
                    <Activity size={14} /> 
                    {isTestingWebhook ? "Testing..." : "Kiểm tra kết nối"}
                 </button>
                 <button 
                    onClick={handleSaveWebhook}
                    disabled={isSavingWebhook}
                    className="px-4 py-2 bg-gradient-to-r from-primary to-indigo-600 hover:to-indigo-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                 >
                    <Save size={14} /> 
                    {isSavingWebhook ? "Saving..." : "Lưu thay đổi"}
                 </button>
               </div>
            </div>
          </div>
        </div>

        {/* 4. Danger Zone */}
        <div className="bg-red-900/10 border border-red-500/20 rounded-2xl p-6">
          <h3 className="font-bold text-red-400 mb-2">Vùng nguy hiểm</h3>
          <p className="text-sm text-red-400/60 mb-6">
            Khi bạn xóa workspace, không thể khôi phục lại. Hãy chắc chắn.
          </p>

          <button 
            onClick={() => {
              if (window.confirm("Bạn có chắc chắn muốn xóa workspace này không? Hành động này không thể hoàn tác.")) {
                onDelete();
              }
            }}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 size={14} /> Xóa Workspace
          </button>
        </div>

      </div>
    </div>
  );
};

export default WorkspaceSettings;