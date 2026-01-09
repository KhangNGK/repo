import React from 'react';
import { ArrowRight, BookOpen, Globe, Sparkles, Zap, Shield, Feather, Cloud, LayoutGrid, Users, Network, Settings, Download, Share2 } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-[#0f0a1e] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] right-[20%] w-[20%] h-[20%] bg-pink-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer" onClick={onEnter}>
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
            <BookOpen size={18} className="text-white" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">NovelWeaver</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
           <button onClick={onEnter} className="hidden sm:block text-sm font-medium text-gray-400 hover:text-white transition-colors">
             Tính năng
           </button>
           <button onClick={onEnter} className="hidden sm:block text-sm font-medium text-gray-400 hover:text-white transition-colors">
             Cộng đồng
           </button>
           <button 
             onClick={onEnter}
             className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-all backdrop-blur-sm flex items-center gap-2 group"
           >
             <span>My Workspaces</span> <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
           </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 sm:pt-24 pb-32 flex flex-col items-center text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-8 backdrop-blur-md hover:bg-purple-500/20 transition-colors cursor-default">
          <Sparkles size={12} />
          <span>AI-Powered Web Novel Translation v2.0</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
          <span className="text-white drop-shadow-2xl">
            Dịch Truyện Với Sức Mạnh
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg">
            Trí Tuệ Nhân Tạo
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
          Nền tảng dịch thuật chuyên nghiệp dành cho Web Novel. 
          Tự động hóa quy trình với Gemini, quản lý thuật ngữ thông minh và giữ nguyên văn phong gốc.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto z-20">
          <button 
            onClick={onEnter}
            className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-purple-900/30 transition-all transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            Bắt đầu ngay 
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
             onClick={onEnter}
             className="w-full sm:w-auto px-8 py-4 bg-[#1e293b]/40 hover:bg-[#1e293b]/60 text-white border border-white/10 rounded-xl font-bold text-lg backdrop-blur-md transition-all flex items-center justify-center gap-2 hover:border-white/20"
          >
            <Globe size={20} className="text-gray-400" /> Khám phá thư viện
          </button>
        </div>

        {/* Visual Mockup - Replicating the Dashboard Header Image */}
        <div className="mt-20 relative w-full max-w-5xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 animate-pulse"></div>
            <div className="relative aspect-[16/10] sm:aspect-[21/9] bg-[#0f0a1e] rounded-xl border border-white/10 shadow-2xl overflow-hidden group flex flex-col">
                
                {/* Header Mockup */}
                <div className="bg-gradient-to-r from-[#2a0a55] to-[#3b1a6b] p-4 sm:p-6 border-b border-white/5 relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        {/* Title Section */}
                        <div className="flex gap-4 items-start max-w-2xl">
                             <div className="mt-1 p-1 hover:bg-white/10 rounded cursor-pointer transition-colors">
                                 <ArrowRight className="rotate-180 text-gray-300" size={20} />
                             </div>
                             <div>
                                 <div className="text-white font-bold text-lg sm:text-xl leading-tight mb-1">
                                     Quỷ thần không cách nào thu nhận? Trước hết để cho ta lướt qua hai phần
                                 </div>
                                 <div className="text-xs text-gray-400 font-medium">Fantasy</div>
                             </div>
                        </div>

                        {/* Actions Section */}
                        <div className="hidden sm:flex flex-col items-end gap-3">
                            <div className="flex items-center gap-4">
                                <div className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded text-xs border border-blue-500/30 flex items-center gap-2">
                                    <Cloud size={12} /> Lưu trữ Cloud
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-bold text-xs">
                                        15.4% <span className="text-gray-500 font-normal">(40/260)</span>
                                    </div>
                                    <div className="w-24 h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden border border-white/5">
                                        <div className="w-[15%] h-full bg-gradient-to-r from-blue-400 to-purple-400"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1.5 bg-yellow-600/20 text-yellow-500 rounded text-xs border border-yellow-500/30 uppercase font-bold flex items-center gap-1">
                                    <span>👑</span> Upgrade
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden border border-white/20">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Mockup */}
                    <div className="flex gap-6 sm:gap-8 overflow-hidden text-xs sm:text-sm font-medium text-gray-400">
                         <div className="text-white border-b-2 border-purple-400 pb-3 flex items-center gap-2">
                             <LayoutGrid size={14} /> Tổng Quan
                         </div>
                         <div className="hover:text-gray-200 pb-3 flex items-center gap-2">
                             <BookOpen size={14} /> Chương
                         </div>
                         <div className="hover:text-gray-200 pb-3 flex items-center gap-2">
                             <BookOpen size={14} /> Từ Điển
                         </div>
                         <div className="hover:text-gray-200 pb-3 flex items-center gap-2">
                             <Users size={14} /> Nhân Vật
                         </div>
                         <div className="hover:text-gray-200 pb-3 flex items-center gap-2">
                             <Network size={14} /> Quan Hệ
                         </div>
                         <div className="hover:text-gray-200 pb-3 flex items-center gap-2">
                             <Share2 size={14} /> Hợp tác
                         </div>
                         <div className="hover:text-gray-200 pb-3 flex items-center gap-2">
                             <Settings size={14} /> Cài Đặt
                         </div>
                         <div className="hover:text-gray-200 pb-3 flex items-center gap-2">
                             <Download size={14} /> Xuất File
                         </div>
                    </div>
                </div>
                
                {/* Body Fake Content */}
                <div className="flex-1 bg-[#0b0a14] relative overflow-hidden">
                     {/* Abstract Content Grid */}
                     <div className="absolute inset-0 p-6 grid grid-cols-12 gap-6 opacity-30 pointer-events-none">
                         <div className="col-span-8 bg-[#1e293b] rounded-xl h-40 border border-white/5"></div>
                         <div className="col-span-4 bg-[#1e293b] rounded-xl h-40 border border-white/5"></div>
                         <div className="col-span-12 bg-[#1e293b] rounded-xl h-64 border border-white/5"></div>
                     </div>

                     {/* Floating AI Analysis Card - The "Magic" */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1e293b]/90 backdrop-blur-xl border border-purple-500/30 p-6 rounded-2xl shadow-2xl transform transition-all duration-700 group-hover:scale-105 max-w-lg z-20">
                        <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                             <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                 <Feather size={16} />
                             </div>
                             <div>
                                 <div className="text-sm font-bold text-white">Phân tích ngữ cảnh</div>
                                 <div className="text-xs text-gray-400">Gemini 2.0 Flash processing...</div>
                             </div>
                        </div>
                        <div className="space-y-3 font-serif">
                            <div className="text-gray-400 text-sm">Original: <span className="text-white italic">"Huynh đệ, ngươi đi đâu vậy?"</span></div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">pronoun: Brother</span>
                                <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">tone: casual</span>
                            </div>
                            <div className="text-purple-300 text-base border-l-2 border-purple-500 pl-3">
                                "Bro, where are you going?"
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </main>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
         <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Tại sao chọn NovelWeaver?</h2>
            <p className="text-gray-400">Công cụ tối ưu cho dịch giả và người sáng tạo nội dung</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { icon: Zap, color: "text-yellow-400", title: "Tốc độ cực nhanh", desc: "Dịch hàng trăm chương truyện trong tích tắc với Gemini 1.5 Flash và GPT-4o." },
                { icon: Sparkles, color: "text-purple-400", title: "Văn phong tự nhiên", desc: "AI hiểu ngữ cảnh, giữ nguyên sắc thái biểu cảm và thuật ngữ chuyên ngành (Tu tiên, Kiếm hiệp...)." },
                { icon: Shield, color: "text-green-400", title: "Riêng tư & An toàn", desc: "Dữ liệu của bạn được lưu trữ cục bộ hoặc trên Cloud cá nhân của bạn." }
            ].map((feature, idx) => (
                <div key={idx} className="group p-8 rounded-2xl bg-[#151b2b] border border-white/5 hover:border-purple-500/30 hover:bg-[#1a2033] transition-all hover:-translate-y-1">
                    <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                        <feature.icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
                </div>
            ))}
         </div>
      </section>
      
      {/* Footer Simple */}
      <footer className="py-8 text-center text-gray-600 text-sm border-t border-white/5 bg-[#0b0c14]">
        <p>© 2024 NovelWeaver AI. Built for Web Novel Enthusiasts.</p>
      </footer>

    </div>
  );
};

export default LandingPage;