import React, { useState } from 'react';
import { UploadCloud, GitPullRequest, CheckCircle2, AlertCircle } from 'lucide-react';
import { Workspace } from '../types';

interface CollaborationPanelProps {
  workspace: Workspace;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ workspace }) => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSendContribution = () => {
    setStatus('sending');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="p-6 lg:p-12 overflow-y-auto h-full">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="bg-[#1e293b] border border-gray-800 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <GitPullRequest size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Đóng góp bản dịch</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Bạn đã chỉnh sửa xong? Hãy gửi bản cập nhật của bạn lại cho chủ sở hữu workspace để họ xem xét và hợp nhất.
            </p>

            {status === 'success' ? (
                <div className="bg-green-500/20 border border-green-500/50 text-green-400 p-4 rounded-xl flex items-center justify-center gap-2">
                    <CheckCircle2 size={20} />
                    <span>Đã gửi đóng góp thành công! Cảm ơn bạn.</span>
                </div>
            ) : (
                <button 
                    onClick={handleSendContribution}
                    disabled={status === 'sending'}
                    className="px-8 py-3 bg-primary hover:bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                >
                    {status === 'sending' ? (
                        <>Đang gửi...</>
                    ) : (
                        <>
                            <UploadCloud size={20} /> Gửi bản chỉnh sửa
                        </>
                    )}
                </button>
            )}
        </div>

        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Lịch sử đóng góp</h3>
            <div className="bg-[#1e293b]/50 border border-gray-800 rounded-xl p-6 text-center text-gray-500 italic">
                Chưa có lịch sử đóng góp nào.
            </div>
        </div>

        <div className="bg-yellow-900/10 border border-yellow-700/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-500 mt-0.5 shrink-0" />
            <div className="text-sm text-gray-400">
                <p className="font-bold text-yellow-500 mb-1">Lưu ý về quy trình</p>
                <p>
                    Đây là tính năng mô phỏng. Trong thực tế, hệ thống sẽ tạo ra một "Pull Request" chứa sự khác biệt (diff) giữa bản dịch gốc và bản chỉnh sửa của bạn.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default CollaborationPanel;