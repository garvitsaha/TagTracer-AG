
import React from 'react';
import { Product } from '../types';

interface SimilarRecommendationsProps {
  recommendations: Product[];
  isLoading?: boolean;
  onRecommendationClick?: (name: string) => void;
}

const SimilarRecommendations: React.FC<SimilarRecommendationsProps> = ({ 
  recommendations, 
  isLoading, 
  onRecommendationClick 
}) => {
  if (!isLoading && recommendations.length === 0) return null;

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-indigo-400"></i>
            Neural Alternatives
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            {isLoading ? 'Synthesizing recommendations...' : 'Selected for your profile'}
          </p>
        </div>
        <div className="flex gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-indigo-500 animate-bounce' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]'}`}></div>
          <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-indigo-500 animate-bounce [animation-delay:0.2s]' : 'bg-slate-800'}`}></div>
          <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-indigo-500 animate-bounce [animation-delay:0.4s]' : 'bg-slate-800'}`}></div>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-hide -mx-2 px-2 scroll-smooth">
        {isLoading ? (
          // Skeleton Loading State
          [1, 2, 3, 4].map((n) => (
            <div key={n} className="glass-card min-w-[220px] max-w-[220px] rounded-2xl p-4 flex flex-col animate-pulse">
              <div className="relative mb-4 aspect-square rounded-xl bg-slate-800/50"></div>
              <div className="h-3 w-3/4 bg-slate-800/50 rounded mb-2"></div>
              <div className="h-3 w-1/2 bg-slate-800/50 rounded mb-4"></div>
              <div className="mt-auto flex justify-between">
                <div className="h-4 w-1/3 bg-slate-800/50 rounded"></div>
                <div className="h-8 w-8 rounded-full bg-slate-800/50"></div>
              </div>
            </div>
          ))
        ) : (
          recommendations.map((item) => (
            <div 
              key={item.id} 
              className="glass-card min-w-[220px] max-w-[220px] rounded-2xl p-4 flex flex-col group relative overflow-hidden shrink-0 border-indigo-500/10 hover:border-indigo-500/30 cursor-pointer"
              onClick={() => onRecommendationClick?.(item.name)}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative mb-4 aspect-square rounded-xl overflow-hidden border border-slate-800 shadow-xl transform group-hover:scale-105 transition-transform duration-500">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-indigo-400 uppercase border border-indigo-500/20">
                  {item.category}
                </div>
              </div>

              <h4 className="text-[11px] font-bold text-slate-200 line-clamp-2 mb-3 h-8 group-hover:text-white transition-colors">
                {item.name}
              </h4>

              <div className="mt-auto flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-white">₹{item.price.toLocaleString('en-IN')}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <i className="fa-solid fa-star text-[8px] text-amber-500"></i>
                    <span className="text-[9px] font-bold text-slate-500">{item.rating}</span>
                  </div>
                </div>
                <button 
                  title="Compare this item"
                  className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all"
                >
                  <i className="fa-solid fa-magnifying-glass-plus text-[10px]"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SimilarRecommendations;
