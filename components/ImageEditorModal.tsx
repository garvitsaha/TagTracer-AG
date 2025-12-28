
import React, { useState } from 'react';
import { Product } from '../types';
import { editProductImage, generateFreshProductImage } from '../services/geminiService';
import Button from './Button';

interface ImageEditorModalProps {
  product: Product;
  onClose: () => void;
  onSave: (newUrl: string) => void;
}

const PRESETS = [
  "Add a clean white studio background",
  "Place on a luxury marble countertop",
  "Change the color to Midnight Black",
  "Show in a professional office setting",
  "Enhance with cinematic lighting",
  "Add soft bokeh background"
];

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ product, onClose, onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(product.imageUrl);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'refine' | 'fresh'>('refine');

  const handleAction = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setError(null);

    try {
      let resultUrl: string | null = null;

      if (mode === 'refine') {
        // Fetch current image to convert to base64 for refinement
        // NOTE: This may fail due to CORS if the source doesn't allow it.
        const resp = await fetch(previewUrl, { mode: 'cors' }).catch(() => null);
        
        if (!resp || !resp.ok) {
          throw new Error("Source image protected by CORS. Try 'Fresh Generation' mode instead.");
        }

        const blob = await resp.blob();
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64data = reader.result as string;
            resolve(base64data.split(',')[1]);
          };
        });
        reader.readAsDataURL(blob);
        const base64 = await base64Promise;
        resultUrl = await editProductImage(base64, prompt);
      } else {
        // Completely fresh generation from text
        const fullPrompt = `A high-resolution product photography of ${product.name}: ${prompt}`;
        resultUrl = await generateFreshProductImage(fullPrompt);
      }

      if (resultUrl) {
        setPreviewUrl(resultUrl);
      } else {
        throw new Error("The AI was unable to process your request.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to process image. Try a different prompt or mode.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-card w-full max-w-4xl rounded-[32px] overflow-hidden flex flex-col md:flex-row border border-white/10 shadow-2xl">
        
        {/* Left: Preview Panel */}
        <div className="md:w-1/2 bg-slate-900/50 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-white/5">
          <div className="relative group w-full aspect-square flex items-center justify-center bg-slate-950 rounded-2xl overflow-hidden border border-white/5 shadow-inner">
            <img 
              src={previewUrl} 
              alt="Edit Preview" 
              className={`max-w-full max-h-full object-contain transition-transform duration-700 ${isProcessing ? 'scale-90 blur-sm opacity-50' : 'group-hover:scale-105'}`}
            />
            
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] animate-pulse">Neural Rendering...</p>
              </div>
            )}
            
            {/* Status Badge */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Preview
              </span>
            </div>
          </div>
          
          <div className="mt-6 text-center">
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              Target: {product.name}
             </p>
          </div>
        </div>
        
        {/* Right: Controls Panel */}
        <div className="md:w-1/2 p-8 flex flex-col bg-slate-900/20">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-black text-white italic tracking-tighter uppercase mb-1 flex items-center gap-2">
                <i className="fa-solid fa-wand-sparkles text-blue-500"></i>
                Lumina Studio
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Image Refinement Engine</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white transition-colors bg-white/5 rounded-full border border-white/5">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="flex-1 space-y-8">
            {/* Mode Selector */}
            <div className="flex p-1 bg-slate-950/50 rounded-xl border border-white/5">
              <button 
                onClick={() => setMode('refine')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'refine' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Refine Existing
              </button>
              <button 
                onClick={() => setMode('fresh')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'fresh' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Fresh Start
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Direct Instructions</label>
                <button 
                  onClick={() => setPrompt('')}
                  className="text-[8px] font-black text-slate-600 uppercase tracking-widest hover:text-red-500 transition-colors"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'refine' ? "e.g. 'Add a clean white studio background'..." : "e.g. 'Show the product sitting on a desk with a laptop'..."}
                className="w-full h-24 p-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-xs text-slate-200 placeholder-slate-700 font-medium"
              />
            </div>

            {/* Presets */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Smart Presets</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => { setPrompt(p); if(mode !== 'refine') setMode('refine'); }}
                    className="text-[9px] px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 font-bold hover:bg-blue-600/10 hover:border-blue-500/30 hover:text-blue-400 transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl flex items-start gap-3">
                <i className="fa-solid fa-triangle-exclamation text-red-500 text-xs mt-0.5"></i>
                <p className="text-[10px] text-red-400 font-bold leading-relaxed">{error}</p>
              </div>
            )}
          </div>

          <div className="mt-10 flex gap-4">
            <Button 
              className="flex-1 rounded-2xl" 
              variant="outline" 
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            {previewUrl !== product.imageUrl && !isProcessing ? (
              <Button 
                variant="primary"
                className="flex-1 rounded-2xl shadow-blue-500/20 shadow-lg"
                onClick={() => onSave(previewUrl)}
              >
                Apply Result
              </Button>
            ) : (
              <Button 
                className="flex-2 rounded-2xl shadow-blue-500/20 shadow-lg" 
                onClick={handleAction}
                isLoading={isProcessing}
                disabled={!prompt.trim()}
              >
                {mode === 'refine' ? 'Refine' : 'Generate Fresh'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditorModal;
