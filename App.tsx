import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Globe, PanelLeftClose, PanelLeft, ImageIcon, 
  Save, ArrowLeft, LayoutGrid, FileText, Settings, Share2, 
  GitFork, Users, Network, Download, Cloud, ChevronDown,
  Edit2, X, Search, Sparkles, Upload, Plus, Trash2, Filter,
  LogOut, Star, Crown, User as UserIcon, RefreshCw
} from 'lucide-react';
import GlossaryManager from './components/GlossaryManager';
import TranslationLayout from './components/TranslationLayout';
import WorkspaceList from './components/WorkspaceList';
import ImageStudio from './components/ImageStudio';
import WebScraper from './components/WebScraper';
import CreateWorkspaceModal from './components/CreateWorkspaceModal';
import Dashboard from './components/Dashboard';
import WorkspaceOverview from './components/WorkspaceOverview';
import PublicReader from './components/PublicReader';
import CollaborationPanel from './components/CollaborationPanel';
import WorkspaceSettings from './components/WorkspaceSettings';
import ChapterList from './components/ChapterList';
import LandingPage from './components/LandingPage';
import LLMConfigModal from './components/LLMConfigModal';
import { generateTranslationStream } from './services/geminiService';
import { generateEpub } from './services/epubService';
import { TranslationConfig, ModelProvider, SUPPORTED_LANGUAGES, Workspace, Chapter, GlossaryItem, Character, Relationship } from './types';

// Tab Definitions based on the provided image
type WorkspaceTab = 'overview' | 'chapters' | 'glossary' | 'characters' | 'relationships' | 'collaboration' | 'settings' | 'export';

// Helper to count words
const countWords = (text: string) => text.trim().split(/\s+/).filter(w => w.length > 0).length;

const App: React.FC = () => {
  // --- Workspace State Management ---
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    try {
      const saved = localStorage.getItem('nw_workspaces');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load workspaces from storage", e);
    }
    // Empty initial state as requested
    return [];
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    return localStorage.getItem('nw_active_id') || '';
  });

  // Navigation State
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard' | 'workspace' | 'public_read'>('landing');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed in workspace view

  // User Menu State
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Title Editing State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  // Modals
  const [glossaryOpen, setGlossaryOpen] = useState(false); // Legacy modal, kept for now
  const [imageStudioOpen, setImageStudioOpen] = useState(false);
  const [scraperOpen, setScraperOpen] = useState(false);
  const [scraperMode, setScraperMode] = useState<'chapter' | 'toc'>('chapter');
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [llmConfigOpen, setLlmConfigOpen] = useState(false);
  
  // Translation State
  const [isTranslating, setIsTranslating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Refs for Auto-save
  const workspacesRef = useRef(workspaces);
  const activeIdRef = useRef(activeWorkspaceId);

  // Derived active workspace
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];
  const activeChapter = activeWorkspace?.chapters?.find(c => c.id === activeChapterId);

  useEffect(() => {
    workspacesRef.current = workspaces;
    activeIdRef.current = activeWorkspaceId;
  }, [workspaces, activeWorkspaceId]);

  // Redirect to dashboard if no active workspace in workspace mode
  useEffect(() => {
    if (viewMode === 'workspace' && !activeWorkspace) {
      setViewMode('dashboard');
    }
  }, [viewMode, activeWorkspace]);

  // Auto-save Interval
  useEffect(() => {
    const saveToStorage = () => {
      localStorage.setItem('nw_workspaces', JSON.stringify(workspacesRef.current));
      localStorage.setItem('nw_active_id', activeIdRef.current);
      setLastSaved(new Date());
    };

    const intervalId = setInterval(saveToStorage, 2 * 60 * 1000);
    window.addEventListener('beforeunload', saveToStorage);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', saveToStorage);
    };
  }, []);

  // Helpers
  const updateWorkspace = (id: string, updates: Partial<Workspace>) => {
    setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, ...updates, lastModified: Date.now() } : w));
  };

  const updateChapter = (workspaceId: string, chapterId: string, updates: Partial<Chapter>) => {
      setWorkspaces(prev => prev.map(w => {
          if (w.id !== workspaceId) return w;
          const updatedChapters = w.chapters?.map(c => c.id === chapterId ? { ...c, ...updates, lastModified: Date.now() } : c) || [];
          return { ...w, chapters: updatedChapters, lastModified: Date.now() };
      }));
  };

  const updateActiveConfig = (updates: Partial<TranslationConfig>) => {
    if (!activeWorkspaceId) return;
    updateWorkspace(activeWorkspaceId, { config: { ...activeWorkspace.config, ...updates } });
  };

  const switchToWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
    setViewMode('workspace');
    setActiveTab('overview'); // Default to overview when opening
    setActiveChapterId(null);
  };

  const goHome = () => {
    setViewMode('dashboard');
  };

  const handleStartEditingTitle = () => {
      if (!activeWorkspace) return;
      setTempTitle(activeWorkspace.name);
      setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
      if (tempTitle.trim()) {
          updateWorkspace(activeWorkspaceId, { name: tempTitle });
      }
      setIsEditingTitle(false);
  };

  // --- Handlers for New Features (Glossary, Characters, Relationships) ---

  const handleAddGlossaryItem = () => {
      const newItem: GlossaryItem = {
          id: Date.now().toString(),
          term: 'Thuật ngữ mới',
          translation: '',
          type: 'term',
          context: ''
      };
      updateWorkspace(activeWorkspaceId, { glossary: [newItem, ...(activeWorkspace.glossary || [])] });
  };

  const handleUpdateGlossaryItem = (id: string, field: keyof GlossaryItem, value: string) => {
      const updatedGlossary = activeWorkspace.glossary.map(item => 
          item.id === id ? { ...item, [field]: value } : item
      );
      updateWorkspace(activeWorkspaceId, { glossary: updatedGlossary });
  };

  const handleDeleteGlossaryItem = (id: string) => {
      updateWorkspace(activeWorkspaceId, { glossary: activeWorkspace.glossary.filter(i => i.id !== id) });
  };

  const handleAddCharacter = () => {
    const newChar: Character = {
        id: Date.now().toString(),
        originalName: 'Tên gốc',
        translatedName: '',
        gender: 'unknown',
        role: 'supporting',
        description: ''
    };
    updateWorkspace(activeWorkspaceId, { characters: [newChar, ...(activeWorkspace.characters || [])] });
  };

  const handleUpdateCharacter = (id: string, field: keyof Character, value: string) => {
      const updatedChars = (activeWorkspace.characters || []).map(c => 
          c.id === id ? { ...c, [field]: value } : c
      );
      updateWorkspace(activeWorkspaceId, { characters: updatedChars });
  };

  const handleDeleteCharacter = (id: string) => {
      updateWorkspace(activeWorkspaceId, { characters: (activeWorkspace.characters || []).filter(c => c.id !== id) });
  };

  const handleAddRelationship = () => {
      const newRel: Relationship = {
          id: Date.now().toString(),
          charAId: '',
          charBId: '',
          relation: 'Quan hệ',
          callAtoB: 'ta',
          callBtoA: 'ngươi',
          chapterRange: '1-End'
      };
      updateWorkspace(activeWorkspaceId, { relationships: [newRel, ...(activeWorkspace.relationships || [])] });
  };
  
  const handleUpdateRelationship = (id: string, field: keyof Relationship, value: string) => {
    const updatedRels = (activeWorkspace.relationships || []).map(r => 
        r.id === id ? { ...r, [field]: value } : r
    );
    updateWorkspace(activeWorkspaceId, { relationships: updatedRels });
  };

  const handleDeleteRelationship = (id: string) => {
    updateWorkspace(activeWorkspaceId, { relationships: (activeWorkspace.relationships || []).filter(r => r.id !== id) });
  };


  // Handlers (Original)
  const handleTranslate = async () => {
    if (!activeChapter || !activeChapter.sourceText.trim()) return;

    setIsTranslating(true);
    updateChapter(activeWorkspaceId, activeChapter.id, { translatedText: '', status: 'translating' });

    if (activeWorkspace.config.model !== ModelProvider.GEMINI) {
        const mockText = `[Simulation] Connected to ${activeWorkspace.config.model}...\n\n Translating: ${activeChapter.sourceText.substring(0, 50)}...`;
        updateChapter(activeWorkspaceId, activeChapter.id, { 
            translatedText: mockText,
            translatedWordCount: countWords(mockText),
            status: 'completed'
        });
        setIsTranslating(false);
      return;
    }

    try {
      const stream = await generateTranslationStream(
        activeChapter.sourceText, 
        activeWorkspace.config, 
        activeWorkspace.glossary
      );
      
      let currentText = '';
      if (stream) {
        for await (const chunk of stream) {
          const chunkText = chunk.text; // Fixed: GenerateContentResponse.text is a property, not a method
          if (chunkText) {
            currentText += chunkText;
            updateChapter(activeWorkspaceId, activeChapter.id, { translatedText: currentText });
          }
        }
      }
      updateChapter(activeWorkspaceId, activeChapter.id, { 
          status: 'completed',
          translatedWordCount: countWords(currentText)
      });
    } catch (error) {
      console.error("Translation failed", error);
      updateChapter(activeWorkspaceId, activeChapter.id, { 
          translatedText: "Error: Failed to generate translation.",
          status: 'error'
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCreateWorkspaceSubmit = (data: { name: string; author: string; genres: string[]; sourceLang: string; targetLang: string }) => {
    const newWs: Workspace = {
        id: Date.now().toString(),
        name: data.name,
        author: data.author,
        genres: data.genres,
        sourceText: '',
        translatedText: '',
        chapters: [],
        glossary: [],
        characters: [],
        relationships: [],
        config: { 
            sourceLang: data.sourceLang,
            targetLang: data.targetLang,
            model: ModelProvider.GEMINI,
            temperature: 0.7
        },
        settings: {
            publicAccess: false,
            allowEpub: true,
            allowContribution: false,
            autoSync: true,
            cloudProvider: 'internal'
        },
        stats: {
            likes: 0,
            comments: 0
        },
        createdAt: Date.now(),
        lastModified: Date.now(),
        chapterProgress: { current: 0, total: 0 } 
    };
    setWorkspaces([...workspaces, newWs]);
    setActiveWorkspaceId(newWs.id);
    setViewMode('workspace');
    setActiveTab('overview');
  };

  const handleDeleteWorkspace = (id: string) => {
    const newlist = workspaces.filter(w => w.id !== id);
    setWorkspaces(newlist);
    if (activeWorkspaceId === id) {
        if (newlist.length > 0) {
            setActiveWorkspaceId(newlist[0].id);
        } else {
            setViewMode('dashboard');
        }
    }
  };

  const handleScrapedContent = (content: string, url: string, selector: string) => {
      // Create new chapter from scraped content
      const newIndex = (activeWorkspace.chapters?.length || 0) + 1;
      const newChapter: Chapter = {
          id: Date.now().toString(),
          index: newIndex,
          title: `Scraped Chapter ${newIndex}`,
          status: 'pending',
          sourceText: content,
          sourceUrl: url,
          translatedText: '',
          sourceWordCount: countWords(content),
          translatedWordCount: 0,
          lastModified: Date.now()
      };

      updateWorkspace(activeWorkspaceId, { 
          chapters: [newChapter, ...(activeWorkspace.chapters || [])],
          scrapedUrl: url,
          cssSelector: selector
      });
      setActiveChapterId(newChapter.id);
      setActiveTab('chapters'); 
  };

  const handleChapterListFetched = (chapters: {title: string, url: string}[], sourceUrl: string, selector: string) => {
    if (chapters.length === 0) return;

    // Convert to Chapter objects
    const newChapters: Chapter[] = chapters.map((c, i) => ({
      id: `scraped-${Date.now()}-${i}`,
      index: i + 1,
      title: c.title,
      sourceUrl: c.url,
      status: 'pending',
      sourceText: '',
      translatedText: '',
      sourceWordCount: 0,
      translatedWordCount: 0,
      lastModified: Date.now()
    }));

    // Add to workspace
    updateWorkspace(activeWorkspaceId, {
      chapters: [...(activeWorkspace.chapters || []), ...newChapters],
      scrapedUrl: sourceUrl,
      cssSelector: selector,
      chapterProgress: {
        ...activeWorkspace.chapterProgress,
        total: (activeWorkspace.chapters?.length || 0) + newChapters.length
      }
    });

    // Don't switch tab or active chapter immediately, just refresh the list view
    setActiveTab('chapters');
    setActiveChapterId(null);
  };

  const handleDownloadEpub = async () => {
      if (!activeWorkspace) return;
      try {
          const blob = await generateEpub(activeWorkspace);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${activeWorkspace.name.replace(/\s+/g, '_')}.epub`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
      } catch (e) {
          console.error("Failed to generate EPUB", e);
          alert("Could not generate EPUB. Please try again.");
      }
  };

  const handleForkWorkspace = () => {
    if (!activeWorkspace) return;
    const blob = new Blob([JSON.stringify(activeWorkspace)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeWorkspace.name.replace(/\s+/g, '_')}_contrib.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("Workspace data downloaded! You can now edit it and send it back to the owner.");
  };

  // --- RENDER LANDING PAGE ---
  if (viewMode === 'landing') {
    return <LandingPage onEnter={() => setViewMode('dashboard')} />;
  }

  // --- RENDER PUBLIC READ ---
  if (viewMode === 'public_read' && activeWorkspace) {
      return (
          <PublicReader 
            workspace={activeWorkspace} 
            onExit={() => setViewMode('workspace')}
            onDownloadEpub={handleDownloadEpub}
            onFork={handleForkWorkspace}
          />
      );
  }

  // --- RENDER DASHBOARD ---
  // Default to dashboard if no workspace selected OR explicit dashboard mode
  if (viewMode === 'dashboard' || !activeWorkspace) {
    return (
      <div className="min-h-screen bg-background text-gray-100 flex font-sans overflow-hidden">
         {/* Sidebar removed as requested */}

         {/* Updated Background Gradient */}
         <div className="flex-1 bg-gradient-to-br from-[#2a0a55] via-[#150a2e] to-[#0f0a1e]">
            <Dashboard 
                workspaces={workspaces}
                onSelect={switchToWorkspace}
                onCreate={() => setCreateWorkspaceOpen(true)}
                onBack={() => setViewMode('landing')}
            />
         </div>

         <CreateWorkspaceModal
            isOpen={createWorkspaceOpen}
            onClose={() => setCreateWorkspaceOpen(false)}
            onSubmit={handleCreateWorkspaceSubmit}
         />
      </div>
    );
  }

  // --- RENDER WORKSPACE ---
  // Apply purple theme and background image based on image reference
  const bgImage = activeWorkspace.coverImage || "https://images.unsplash.com/photo-1614726365723-49cfae96a6d6?q=80&w=2600&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-[#0f0a1e] text-gray-100 flex font-sans overflow-hidden">
      
      {/* Sidebar (Optional overlay or permanent based on state) */}
      <div 
        className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden border-r border-white/5 bg-[#1a0b2e] relative shrink-0`}
      >
        <div className="p-4 flex items-center gap-2 border-b border-white/5 mb-2">
            <button onClick={goHome} className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={16} />
            </button>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dashboard</span>
        </div>
        <WorkspaceList 
            workspaces={workspaces}
            activeId={activeWorkspaceId}
            onSelect={setActiveWorkspaceId}
            onOpenCreateModal={() => setCreateWorkspaceOpen(true)}
            onDelete={handleDeleteWorkspace}
            className="w-64"
        />
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Background Layer for the whole page */}
        <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-[#0f0a1e] z-0" />
             <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-[#2a0a55]/40 to-[#0f0a1e] z-0" />
        </div>
          
        {/* Workspace Header (Seamless) */}
        <header className="relative pt-4 pb-0 shrink-0 z-50 min-h-[120px] flex flex-col justify-end bg-[#0f0a1e]/80 backdrop-blur-md border-b border-white/5">
            
            {/* Content Layer */}
            <div className="relative z-10 px-6 mb-2 flex items-end justify-between">
                {/* Left: Title & Info */}
                <div className="flex items-start gap-4 mb-1 flex-1 min-w-0 mr-4">
                     <button onClick={goHome} className="p-2 hover:bg-white/10 rounded-full text-gray-300 transition-colors shrink-0 mt-1">
                        <ArrowLeft size={20} />
                     </button>
                     <div className="min-w-0 flex-1">
                        {isEditingTitle ? (
                            <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                                <input 
                                    type="text" 
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    className="bg-[#2a0a55]/90 border border-purple-500 text-white text-xl font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400 w-full max-w-2xl shadow-lg shadow-purple-900/50"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveTitle();
                                        if (e.key === 'Escape') setIsEditingTitle(false);
                                    }}
                                />
                                <button onClick={handleSaveTitle} className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg border border-green-500/30 transition-colors shadow-lg">
                                    <Save size={18} />
                                </button>
                                <button onClick={() => setIsEditingTitle(false)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg border border-red-500/30 transition-colors shadow-lg">
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="group flex items-center gap-3">
                                <h1 
                                    className="text-2xl font-bold text-white leading-tight shadow-black drop-shadow-md line-clamp-1 cursor-pointer hover:text-purple-200 transition-colors border-b border-transparent hover:border-purple-400/50 pb-0.5" 
                                    onClick={handleStartEditingTitle}
                                    title="Click to edit title"
                                >
                                    {activeWorkspace.name}
                                </h1>
                                <button 
                                    onClick={handleStartEditingTitle}
                                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white"
                                >
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-gray-300 mt-2">
                            <BookOpen size={14} className="text-gray-400" />
                            <span>{activeWorkspace.genres?.[0] || 'Fantasy'}</span>
                        </div>
                     </div>
                </div>
                
                {/* Right: Actions & Stats */}
                <div className="flex flex-col items-end gap-3 pb-1 shrink-0">
                     <div className="flex items-center gap-4">
                         <button className="hidden sm:flex px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border border-blue-400/30 rounded-lg text-xs font-medium backdrop-blur-md transition-all items-center gap-1.5">
                             <Cloud size={14} /> Lưu trữ Cloud
                         </button>
                         <div className="text-right">
                             <div className="text-sm font-bold text-white drop-shadow-md">
                                {activeWorkspace.chapterProgress.total > 0 
                                    ? ((activeWorkspace.chapterProgress.current / activeWorkspace.chapterProgress.total) * 100).toFixed(1) 
                                    : 0}% 
                                 <span className="text-xs text-gray-300 font-normal ml-1">
                                     ({activeWorkspace.chapterProgress.current}/{activeWorkspace.chapterProgress.total})
                                 </span>
                             </div>
                             <div className="w-32 h-1.5 bg-gray-700/50 rounded-full mt-1 overflow-hidden backdrop-blur-sm border border-white/10">
                                 <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400" style={{ width: `${activeWorkspace.chapterProgress.total > 0 ? (activeWorkspace.chapterProgress.current / activeWorkspace.chapterProgress.total) * 100 : 0}%` }}></div>
                             </div>
                         </div>
                     </div>
                     
                     <div className="flex items-center gap-3 relative">
                         <button className="px-4 py-1.5 bg-gradient-to-r from-yellow-600/80 to-amber-600/80 hover:from-yellow-500 hover:to-amber-500 text-white border border-yellow-400/30 rounded-lg text-xs font-bold uppercase shadow-lg shadow-amber-900/20 backdrop-blur-md flex items-center gap-1.5 transition-all">
                            <span>👑</span> Upgrade
                         </button>
                         <div 
                             onClick={() => setUserMenuOpen(!userMenuOpen)}
                             className="flex items-center gap-2 px-2 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-md hover:bg-white/20 cursor-pointer transition-colors"
                         >
                             <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden">
                                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeWorkspace.author}`} alt="User" />
                             </div>
                             <ChevronDown size={12} className="text-gray-300 mr-1" />
                         </div>

                         {/* User Dropdown Menu */}
                         {userMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)}></div>
                                <div className="absolute top-full right-0 mt-2 w-64 bg-[#1e1b2e] border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                    {/* Profile Header */}
                                    <div className="p-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-b border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden border border-white/20">
                                                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeWorkspace.author}`} alt="User" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="text-sm font-bold text-white truncate">nguyentrikhangngk</div>
                                                <div className="text-xs text-gray-400 truncate">nguyentrikhangngk@gmail.com</div>
                                            </div>
                                        </div>
                                        <div className="mt-3 inline-block px-2 py-0.5 rounded-full bg-[#3b2d5f] border border-purple-500/30 text-[10px] text-purple-300 font-medium">
                                            free plan
                                        </div>
                                    </div>
                                    
                                    {/* Menu Items */}
                                    <div className="p-2 space-y-1">
                                        <button className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                            <UserIcon size={16} /> Hồ Sơ
                                        </button>
                                        <button className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-yellow-400 hover:bg-white/5 rounded-lg transition-colors">
                                            <Star size={16} /> Yêu thích
                                        </button>
                                        <button 
                                            onClick={() => { setUserMenuOpen(false); setLlmConfigOpen(true); }}
                                            className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            <Settings size={16} /> Cài đặt
                                        </button>
                                        <button className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                            <LayoutGrid size={16} /> Workspace
                                        </button>
                                        <button className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors font-medium">
                                            <Crown size={16} /> Gói đăng ký
                                        </button>
                                    </div>
                                    
                                    <div className="border-t border-gray-700 p-2">
                                        <button className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                            <LogOut size={16} /> Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </>
                         )}
                     </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="relative z-10 px-6 flex gap-6 overflow-x-auto custom-scrollbar">
                {[
                  { id: 'overview', label: 'Tổng Quan', icon: LayoutGrid },
                  { id: 'chapters', label: 'Chương', icon: BookOpen },
                  { id: 'glossary', label: 'Từ Điển', icon: BookOpen },
                  { id: 'characters', label: 'Nhân Vật', icon: Users },
                  { id: 'relationships', label: 'Quan Hệ', icon: Network },
                  { id: 'collaboration', label: 'Hợp tác', icon: Share2 },
                  { id: 'settings', label: 'Cài Đặt', icon: Settings },
                  { id: 'export', label: 'Xuất File', icon: Download }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id as WorkspaceTab); setActiveChapterId(null); }}
                        className={`pb-3 text-xs font-medium flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap px-1 ${activeTab === tab.id ? 'text-white border-purple-400' : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-white/10'}`}
                    >
                        <tab.icon size={14} /> {tab.label}
                    </button>
                ))}
            </div>
        </header>

        {/* Content Area - Changed to Flex Col for Proper Scroll Filling */}
        <div className="flex-1 bg-transparent overflow-hidden relative flex flex-col z-10">
            {activeTab === 'overview' && (
                <WorkspaceOverview 
                    workspace={activeWorkspace}
                    onUpdate={(updates) => updateWorkspace(activeWorkspaceId, updates)}
                    onViewPublic={() => setViewMode('public_read')}
                    onDownloadEpub={handleDownloadEpub}
                />
            )}

            {activeTab === 'glossary' && (
                 <div className="flex-1 flex flex-col h-full bg-[#0b0a14]/80 p-6 overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <div className="flex items-center gap-2 text-xl font-bold text-white">
                            <span>Từ Điển</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm thuật ngữ..." 
                                    className="w-full bg-[#1e1b2e] border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <button className="px-3 py-2 bg-[#1e1b2e] border border-gray-700 hover:bg-[#2a2640] rounded-lg text-xs font-medium text-gray-300 flex items-center gap-2">
                                <Sparkles size={14} className="text-purple-400" /> Trích xuất AI
                            </button>
                            <button className="px-3 py-2 bg-[#1e1b2e] border border-gray-700 hover:bg-[#2a2640] rounded-lg text-xs font-medium text-gray-300 flex items-center gap-2">
                                <Upload size={14} /> Import JSON
                            </button>
                            <button 
                                onClick={handleAddGlossaryItem}
                                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-purple-900/20"
                            >
                                <Plus size={14} /> Thêm Thuật Ngữ
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto rounded-xl border border-gray-800 bg-[#151120]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#1a1625] sticky top-0 z-10 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 border-b border-gray-800 w-16 text-center">#</th>
                                    <th className="p-4 border-b border-gray-800">Thuật Ngữ Gốc</th>
                                    <th className="p-4 border-b border-gray-800">Bản Dịch</th>
                                    <th className="p-4 border-b border-gray-800 w-40">Phân Loại</th>
                                    <th className="p-4 border-b border-gray-800">Ngữ Cảnh</th>
                                    <th className="p-4 border-b border-gray-800 w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {activeWorkspace.glossary.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500 italic">Chưa có thuật ngữ nào.</td>
                                    </tr>
                                ) : (
                                    activeWorkspace.glossary.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4 text-center text-gray-500 text-xs">{index + 1}</td>
                                            <td className="p-4">
                                                <input 
                                                    type="text" 
                                                    value={item.term}
                                                    onChange={(e) => handleUpdateGlossaryItem(item.id, 'term', e.target.value)}
                                                    className="bg-transparent text-white font-medium focus:outline-none w-full"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <input 
                                                    type="text" 
                                                    value={item.translation}
                                                    onChange={(e) => handleUpdateGlossaryItem(item.id, 'translation', e.target.value)}
                                                    className="bg-transparent text-purple-300 focus:outline-none w-full"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <select 
                                                    value={item.type}
                                                    onChange={(e) => handleUpdateGlossaryItem(item.id, 'type', e.target.value as any)}
                                                    className="bg-[#0f0a1e] border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none"
                                                >
                                                    <option value="term">Chung</option>
                                                    <option value="name">Tên riêng</option>
                                                    <option value="location">Vị trí</option>
                                                    <option value="skill">Kỹ năng</option>
                                                    <option value="item">Vật phẩm</option>
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                 <input 
                                                    type="text" 
                                                    value={item.context || ''}
                                                    onChange={(e) => handleUpdateGlossaryItem(item.id, 'context', e.target.value)}
                                                    placeholder="Thêm ngữ cảnh..."
                                                    className="bg-transparent text-gray-500 text-sm focus:outline-none w-full placeholder-gray-700"
                                                />
                                            </td>
                                            <td className="p-4 text-center">
                                                <button 
                                                    onClick={() => handleDeleteGlossaryItem(item.id)}
                                                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
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
                 </div>
            )}

            {activeTab === 'characters' && (
                <div className="flex-1 flex flex-col h-full bg-[#0b0a14]/80 p-6 overflow-hidden">
                     {/* Toolbar */}
                     <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <div className="flex items-center gap-2 text-xl font-bold text-white">
                            <span>Nhân Vật</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-56">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm nhân vật..." 
                                    className="w-full bg-[#1e1b2e] border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <select className="bg-[#1e1b2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
                                    <option value="">Tất cả giới tính</option>
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                </select>
                                <select className="bg-[#1e1b2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
                                    <option value="">Tất cả vai trò</option>
                                    <option value="main">Chính</option>
                                    <option value="supporting">Phụ</option>
                                </select>
                            </div>
                            <button 
                                onClick={handleAddCharacter}
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-blue-900/20"
                            >
                                <Plus size={14} /> Thêm Nhân Vật
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto rounded-xl border border-gray-800 bg-[#151120]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#1a1625] sticky top-0 z-10 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 border-b border-gray-800 w-16 text-center">#</th>
                                    <th className="p-4 border-b border-gray-800">Tên Gốc</th>
                                    <th className="p-4 border-b border-gray-800">Tên Dịch</th>
                                    <th className="p-4 border-b border-gray-800 w-32">Giới Tính</th>
                                    <th className="p-4 border-b border-gray-800 w-32">Vai Trò</th>
                                    <th className="p-4 border-b border-gray-800">Mô Tả</th>
                                    <th className="p-4 border-b border-gray-800 w-16"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {(activeWorkspace.characters || []).length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500 italic">Chưa có nhân vật nào.</td>
                                    </tr>
                                ) : (
                                    (activeWorkspace.characters || []).map((char, index) => (
                                        <tr key={char.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4 text-center text-gray-500 text-xs">{index + 1}</td>
                                            <td className="p-4">
                                                <input 
                                                    type="text" 
                                                    value={char.originalName}
                                                    onChange={(e) => handleUpdateCharacter(char.id, 'originalName', e.target.value)}
                                                    className="bg-transparent text-white font-medium focus:outline-none w-full"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <input 
                                                    type="text" 
                                                    value={char.translatedName}
                                                    onChange={(e) => handleUpdateCharacter(char.id, 'translatedName', e.target.value)}
                                                    className="bg-transparent text-purple-300 focus:outline-none w-full"
                                                />
                                            </td>
                                            <td className="p-4">
                                                 <select 
                                                    value={char.gender}
                                                    onChange={(e) => handleUpdateCharacter(char.id, 'gender', e.target.value as any)}
                                                    className="bg-[#0f0a1e] border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none w-full"
                                                >
                                                    <option value="male">Nam</option>
                                                    <option value="female">Nữ</option>
                                                    <option value="other">Khác</option>
                                                    <option value="unknown">?</option>
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <select 
                                                    value={char.role}
                                                    onChange={(e) => handleUpdateCharacter(char.id, 'role', e.target.value as any)}
                                                    className={`bg-[#0f0a1e] border border-gray-700 rounded px-2 py-1 text-xs focus:outline-none w-full ${char.role === 'main' ? 'text-yellow-400' : 'text-gray-400'}`}
                                                >
                                                    <option value="main">Nhân Vật Chính</option>
                                                    <option value="supporting">Nhân Vật Phụ</option>
                                                    <option value="villain">Phản Diện</option>
                                                    <option value="mob">Quần Chúng</option>
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <input 
                                                    type="text" 
                                                    value={char.description || ''}
                                                    onChange={(e) => handleUpdateCharacter(char.id, 'description', e.target.value)}
                                                    placeholder="VD: Tự xưng: ta; Gọi người lạ: các hạ"
                                                    className="bg-transparent text-gray-500 text-sm focus:outline-none w-full placeholder-gray-700 italic"
                                                />
                                            </td>
                                            <td className="p-4 text-center">
                                                <button 
                                                    onClick={() => handleDeleteCharacter(char.id)}
                                                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
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
                </div>
            )}

            {activeTab === 'relationships' && (
                <div className="flex-1 flex flex-col h-full bg-[#0b0a14]/80 p-6 overflow-hidden">
                     {/* Toolbar */}
                     <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                         <div className="flex items-center gap-3">
                             <div className="flex gap-1">
                                <button className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-l-lg border-r border-purple-500">Danh Sách</button>
                                <button className="px-4 py-2 bg-[#1e1b2e] border border-gray-700 text-gray-400 hover:text-white text-xs font-bold rounded-r-lg">Đồ Thị</button>
                             </div>
                             <div className="relative w-64 ml-4">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm..." 
                                    className="w-full bg-[#1e1b2e] border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                            <button className="px-3 py-2 bg-[#1e1b2e] border border-gray-700 hover:bg-[#2a2640] rounded-lg text-xs font-medium text-gray-300 flex items-center gap-2">
                                <Sparkles size={14} className="text-purple-400" /> Tự động tạo
                            </button>
                            <button 
                                onClick={handleAddRelationship}
                                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-purple-900/20"
                            >
                                <Plus size={14} /> Thêm Quan Hệ
                            </button>
                         </div>
                     </div>

                     {/* Table */}
                     <div className="flex-1 overflow-auto rounded-xl border border-gray-800 bg-[#151120]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#1a1625] sticky top-0 z-10 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 border-b border-gray-800 w-1/5">Nhân vật A</th>
                                    <th className="p-4 border-b border-gray-800 w-1/6">Quan Hệ</th>
                                    <th className="p-4 border-b border-gray-800 w-1/5">Nhân vật B</th>
                                    <th className="p-4 border-b border-gray-800">A → B (Tự xưng/Gọi)</th>
                                    <th className="p-4 border-b border-gray-800">B → A (Tự xưng/Gọi)</th>
                                    <th className="p-4 border-b border-gray-800 w-24">Chương</th>
                                    <th className="p-4 border-b border-gray-800 w-16 text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {(activeWorkspace.relationships || []).length === 0 ? (
                                     <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500 italic">Chưa có mối quan hệ nào.</td>
                                    </tr>
                                ) : (
                                    (activeWorkspace.relationships || []).map(rel => (
                                        <tr key={rel.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4">
                                                <input 
                                                    type="text" 
                                                    value={rel.charAId}
                                                    onChange={(e) => handleUpdateRelationship(rel.id, 'charAId', e.target.value)}
                                                    className="bg-transparent text-white font-medium focus:outline-none w-full"
                                                    placeholder="Tên A"
                                                />
                                            </td>
                                            <td className="p-4">
                                                 <input 
                                                    type="text" 
                                                    value={rel.relation}
                                                    onChange={(e) => handleUpdateRelationship(rel.id, 'relation', e.target.value)}
                                                    className="bg-transparent text-purple-400 focus:outline-none w-full"
                                                />
                                            </td>
                                            <td className="p-4">
                                                 <input 
                                                    type="text" 
                                                    value={rel.charBId}
                                                    onChange={(e) => handleUpdateRelationship(rel.id, 'charBId', e.target.value)}
                                                    className="bg-transparent text-white font-medium focus:outline-none w-full"
                                                    placeholder="Tên B"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <input 
                                                    type="text" 
                                                    value={rel.callAtoB}
                                                    onChange={(e) => handleUpdateRelationship(rel.id, 'callAtoB', e.target.value)}
                                                    className="bg-transparent text-cyan-400 text-sm focus:outline-none w-full"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <input 
                                                    type="text" 
                                                    value={rel.callBtoA}
                                                    onChange={(e) => handleUpdateRelationship(rel.id, 'callBtoA', e.target.value)}
                                                    className="bg-transparent text-cyan-400 text-sm focus:outline-none w-full"
                                                />
                                            </td>
                                            <td className="p-4 text-gray-400 text-xs font-mono">
                                                <input 
                                                    type="text" 
                                                    value={rel.chapterRange}
                                                    onChange={(e) => handleUpdateRelationship(rel.id, 'chapterRange', e.target.value)}
                                                    className="bg-transparent text-gray-400 text-xs focus:outline-none w-full"
                                                />
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="text-gray-500 hover:text-white"><Edit2 size={14} /></button>
                                                    <button 
                                                        onClick={() => handleDeleteRelationship(rel.id)}
                                                        className="text-gray-500 hover:text-red-400"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                     </div>
                </div>
            )}

            {activeTab === 'export' && (
                <div className="flex-1 flex flex-col h-full bg-[#0b0a14]/80 p-6 lg:p-12 overflow-y-auto">
                    <h2 className="text-xl font-bold text-white mb-8">Xuất/Nhập</h2>
                    
                    <div className="max-w-4xl space-y-6">
                        {/* Export Chapters */}
                        <div className="bg-[#1e1b2e] border border-gray-700/50 rounded-xl p-8 hover:border-purple-500/30 transition-colors group">
                             <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">Xuất Chương</h3>
                             <p className="text-sm text-gray-400 mb-6">Xuất các chương truyện thành file EPUB để đọc offline hoặc TXT để lưu trữ.</p>
                             <button 
                                onClick={handleDownloadEpub}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-purple-900/20 flex items-center gap-2"
                             >
                                <Download size={16} /> Xuất Chương
                             </button>
                        </div>

                        {/* Export Workspace */}
                         <div className="bg-[#1e1b2e] border border-gray-700/50 rounded-xl p-8 hover:border-purple-500/30 transition-colors group">
                             <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">Dữ Liệu Workspace</h3>
                             <p className="text-sm text-gray-400 mb-6">Sao lưu hoặc khôi phục dữ liệu bổ trợ (thuật ngữ, nhân vật, quan hệ) dưới dạng JSON.</p>
                             <button 
                                onClick={handleForkWorkspace}
                                className="px-6 py-2.5 bg-[#2a2640] hover:bg-[#353050] text-gray-200 border border-gray-600 hover:border-gray-500 text-sm font-bold rounded-lg flex items-center gap-2 transition-colors"
                             >
                                <RefreshCw size={16} /> Quản Lý Dữ Liệu
                             </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'collaboration' && (
                <CollaborationPanel workspace={activeWorkspace} />
            )}
            
            {activeTab === 'settings' && (
                <WorkspaceSettings 
                    workspace={activeWorkspace}
                    onUpdate={(updates) => updateWorkspace(activeWorkspaceId, updates)}
                    onDelete={() => handleDeleteWorkspace(activeWorkspaceId)}
                />
            )}

            {activeTab === 'chapters' && !activeChapterId && (
                <ChapterList 
                    workspace={activeWorkspace}
                    onSelect={setActiveChapterId}
                    onUpdate={(updates) => updateWorkspace(activeWorkspaceId, updates)}
                    onImportWeb={() => {
                    setScraperMode('toc');
                    setScraperOpen(true);
                    }}
                />
            )}

            {activeTab === 'chapters' && activeChapterId && activeChapter && (
                <div className="h-full flex flex-col bg-[#0b0a14]">
                    {/* Editor Sub-Header */}
                    <div className="border-b border-white/5 bg-[#140e24] shrink-0">
                        <div className="px-4 py-3 flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setActiveChapterId(null)}
                                    className="mr-2 p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-gray-300 transition-colors"
                                >
                                    <ArrowLeft size={14} />
                                </button>
                                <span className="text-sm font-bold text-white max-w-[200px] truncate">{activeChapter.title}</span>

                                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white ml-2">
                                    {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
                                </button>
                                <button 
                                    onClick={() => setImageStudioOpen(true)}
                                    className="flex items-center gap-2 px-3 py-1 bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 rounded-lg border border-purple-500/30 text-xs font-medium"
                                >
                                    <ImageIcon size={14} /> Image Studio
                                </button>
                                <button 
                                    onClick={() => {
                                    setScraperMode('chapter');
                                    setScraperOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-3 py-1 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 rounded-lg border border-blue-500/30 text-xs font-medium"
                                >
                                    <Globe size={14} /> Import URL
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                                    <span>{activeWorkspace.config.sourceLang}</span>
                                    <span>→</span>
                                    <span>{activeWorkspace.config.targetLang}</span>
                                </div>
                                <select 
                                    value={activeWorkspace.config.model}
                                    onChange={(e) => updateActiveConfig({ model: e.target.value as ModelProvider })}
                                    className="bg-[#1e1b2e] border border-gray-700 text-xs text-white rounded px-2 py-1 focus:outline-none"
                                >
                                    <option value={ModelProvider.GEMINI}>Gemini 2.0 Flash</option>
                                    <option value={ModelProvider.CHATGPT}>GPT-4o</option>
                                    <option value={ModelProvider.OLLAMA}>Ollama (Local)</option>
                                    <option value={ModelProvider.LM_STUDIO}>LM Studio</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <main className="flex-1 p-4 lg:p-6 overflow-hidden relative">
                        <TranslationLayout 
                            sourceText={activeChapter.sourceText}
                            setSourceText={(text) => updateChapter(activeWorkspaceId, activeChapterId, { sourceText: text, sourceWordCount: countWords(text) })}
                            translatedText={activeChapter.translatedText}
                            isTranslating={isTranslating}
                            onTranslate={handleTranslate}
                            onClear={() => updateChapter(activeWorkspaceId, activeChapterId, { sourceText: '', sourceWordCount: 0 })}
                        />
                    </main>
                </div>
            )}
        </div>

      </div>

      {/* Modals */}
      <GlossaryManager 
        isOpen={glossaryOpen} 
        onClose={() => setGlossaryOpen(false)}
        items={activeWorkspace.glossary}
        onUpdate={(newItems) => updateWorkspace(activeWorkspaceId, { glossary: newItems })}
      />
      
      <ImageStudio 
        isOpen={imageStudioOpen}
        onClose={() => setImageStudioOpen(false)}
      />

      <WebScraper
        isOpen={scraperOpen}
        initialMode={scraperMode}
        onClose={() => setScraperOpen(false)}
        onContentFetched={handleScrapedContent}
        onChapterListFetched={handleChapterListFetched}
      />

      <CreateWorkspaceModal
        isOpen={createWorkspaceOpen}
        onClose={() => setCreateWorkspaceOpen(false)}
        onSubmit={handleCreateWorkspaceSubmit}
      />

      <LLMConfigModal
        isOpen={llmConfigOpen}
        onClose={() => setLlmConfigOpen(false)}
      />
    </div>
  );
};

export default App;