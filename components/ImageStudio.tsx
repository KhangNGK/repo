import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Wand2, Upload, Loader2, Download } from 'lucide-react';
import { analyzeImage, generateNovelImage } from '../services/geminiService';
import { AspectRatio } from '../types';

interface ImageStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

const ASPECT_RATIOS: AspectRatio[] = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];

const ImageStudio: React.FC<ImageStudioProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'generate'>('analyze');
  const [isLoading, setIsLoading] = useState(false);
  
  // Analysis State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string>('image/jpeg');
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generation State
  const [genPrompt, setGenPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedImage(ev.target?.result as string);
        setSelectedImageMime(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsLoading(true);
    try {
      // Remove data URL prefix for API
      const base64Data = selectedImage.split(',')[1];
      const result = await analyzeImage(base64Data, selectedImageMime, analysisPrompt);
      setAnalysisResult(result || "No description generated.");
    } catch (e) {
      setAnalysisResult("Error analyzing image.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!genPrompt) return;
    setIsLoading(true);
    setGeneratedImage(null);
    try {
      const imgData = await generateNovelImage(genPrompt, aspectRatio);
      setGeneratedImage(imgData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface border border-gray-700 w-full max-w-4xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header / Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('analyze')}
            className={`flex-1 p-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'analyze' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
          >
            <ImageIcon size={18} /> Analyze Image
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 p-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'generate' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
          >
            <Wand2 size={18} /> Generate Art
          </button>
          <button onClick={onClose} className="px-6 border-l border-gray-700 text-gray-400 hover:text-white hover:bg-red-500/20">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#0f172a]">
          {activeTab === 'analyze' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {/* Left: Input */}
              <div className="flex flex-col gap-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-700 hover:border-primary rounded-xl flex flex-col items-center justify-center min-h-[300px] cursor-pointer bg-surface/50 transition-colors relative overflow-hidden group"
                >
                  {selectedImage ? (
                    <img src={selectedImage} alt="Upload" className="w-full h-full object-contain absolute inset-0 p-2" />
                  ) : (
                    <div className="text-center p-6">
                      <Upload size={48} className="mx-auto text-gray-600 mb-2 group-hover:text-primary" />
                      <p className="text-gray-400">Click to upload image</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </div>
                
                <textarea
                  className="w-full bg-surface border border-gray-700 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none resize-none"
                  placeholder="Ask a question about the image (e.g., 'Describe the character's clothing for a novel description')..."
                  rows={3}
                  value={analysisPrompt}
                  onChange={(e) => setAnalysisPrompt(e.target.value)}
                />
                
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedImage || isLoading}
                  className="w-full py-3 bg-primary hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <ImageIcon size={18} />} Analyze
                </button>
              </div>

              {/* Right: Output */}
              <div className="bg-surface/30 rounded-xl border border-gray-700 p-4 overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Analysis Result</h3>
                <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {analysisResult || <span className="text-gray-600 italic">Result will appear here...</span>}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {/* Left: Configuration */}
              <div className="flex flex-col gap-6">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Prompt</label>
                  <textarea
                    className="w-full bg-surface border border-gray-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-primary outline-none h-32 resize-none"
                    placeholder="Describe the scene (e.g., 'A cyberpunk city at night with neon lights, anime style')..."
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Aspect Ratio</label>
                  <div className="grid grid-cols-4 gap-2">
                    {ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`py-2 px-3 rounded-md text-xs font-medium border ${aspectRatio === ratio ? 'bg-primary text-white border-primary' : 'bg-surface border-gray-700 text-gray-400 hover:border-gray-500'}`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!genPrompt || isLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />} Generate Image
                </button>
              </div>

              {/* Right: Result */}
              <div className="bg-surface/30 rounded-xl border border-gray-700 flex items-center justify-center relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                {isLoading ? (
                  <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-primary mx-auto mb-4" />
                    <p className="text-gray-400 animate-pulse">Dreaming up your image...</p>
                  </div>
                ) : generatedImage ? (
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    <img src={generatedImage} alt="Generated" className="max-w-full max-h-full rounded-lg shadow-2xl" />
                    <a 
                      href={generatedImage} 
                      download="gemini-generated.png"
                      className="absolute bottom-6 right-6 p-3 bg-black/70 hover:bg-black text-white rounded-full backdrop-blur-md transition-colors"
                      title="Download"
                    >
                      <Download size={20} />
                    </a>
                  </div>
                ) : (
                  <div className="text-center text-gray-600">
                    <Wand2 size={48} className="mx-auto mb-2 opacity-20" />
                    <p>Enter a prompt to start</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;