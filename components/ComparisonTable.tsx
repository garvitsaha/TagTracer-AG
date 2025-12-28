
import React, { useMemo, useState } from 'react';
import { Product } from '../types';
import Button from './Button';

interface ComparisonTableProps {
  products: Product[];
  onEditImage: (product: Product) => void;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ products, onEditImage }) => {
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  const minPrice = useMemo(() => {
    if (products.length === 0) return 0;
    const validPrices = products.map(p => p.price).filter(p => p > 0);
    return validPrices.length > 0 ? Math.min(...validPrices) : 0;
  }, [products]);

  const toggleReviews = (id: string) => {
    setExpandedReviews(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStoreIcon = (website: string) => {
    const w = website.toLowerCase();
    if (w.includes('amazon')) return <i className="fa-brands fa-amazon text-[#FF9900]"></i>;
    if (w.includes('flipkart')) return <i className="fa-solid fa-cart-shopping text-[#2874F0]"></i>;
    if (w.includes('croma')) return <i className="fa-solid fa-bolt text-[#00E9BF]"></i>;
    return <i className="fa-solid fa-store text-slate-400"></i>;
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'Positive': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Negative': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
  };

  if (products.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-16 text-center border-dashed border-2 border-slate-700">
        <div className="text-blue-500/50 mb-6">
          <i className="fa-solid fa-sparkles text-6xl animate-pulse"></i>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Ready for Discovery</h3>
        <p className="text-slate-400 max-w-sm mx-auto">Compare any product across Amazon, Flipkart, and Croma with real-time AI fetching.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {products.map((product) => {
        const isLowest = product.price > 0 && product.price === minPrice;
        const isExpanded = expandedReviews[product.id];

        return (
          <div 
            key={product.id} 
            className={`glass-card rounded-2xl flex flex-col relative group overflow-hidden ${isLowest ? 'ring-1 ring-emerald-500/50' : ''}`}
          >
            {isLowest && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl shadow-lg uppercase tracking-widest z-10">
                Best Value
              </div>
            )}
            
            <div className="p-5 flex flex-col md:flex-row items-center gap-6">
              {/* 3D Image Container */}
              <div className="relative shrink-0 perspective-1000">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-32 h-32 rounded-xl object-cover border border-slate-700 shadow-2xl group-hover:rotate-3 transition-transform duration-500 bg-slate-900"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/400x400/0f172a/94a3b8?text=${encodeURIComponent(product.name)}`;
                  }}
                />
                <button 
                  onClick={() => onEditImage(product)}
                  className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-all duration-300"
                >
                  <i className="fa-solid fa-wand-magic-spark text-2xl text-white"></i>
                </button>
              </div>

              {/* Info Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-bold text-slate-400 flex items-center gap-2">
                    {getStoreIcon(product.website)}
                    {product.website}
                  </div>
                  {product.isAiGenerated && (
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-black uppercase">Live</span>
                  )}
                </div>
                <h4 className="text-lg font-bold text-white truncate mb-2 group-hover:text-blue-400 transition-colors">
                  {product.name}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.features.slice(0, 3).map((f, i) => (
                    <span key={i} className="text-[10px] bg-slate-800/50 text-slate-400 px-2 py-1 rounded-md border border-slate-700/50">
                      {f}
                    </span>
                  ))}
                  {product.reviewSummary && (
                    <button 
                      onClick={() => toggleReviews(product.id)}
                      className={`text-[10px] px-2 py-1 rounded-md border flex items-center gap-2 font-bold transition-all ${getSentimentColor(product.reviewSummary.sentiment)}`}
                    >
                      <i className="fa-solid fa-comment-nodes"></i>
                      Review Pulse
                      <i className={`fa-solid fa-chevron-down transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Metrics Section */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 md:border-l border-slate-700/50 md:pl-6">
                <div className="text-right">
                  <p className={`text-2xl font-black ${isLowest ? 'text-emerald-400' : 'text-white'}`}>
                    ₹{product.price > 0 ? product.price.toLocaleString('en-IN') : 'Check Site'}
                  </p>
                  <div className="flex items-center gap-1.5 justify-end mt-1">
                    <span className="text-xs font-bold text-amber-400">{product.rating}</span>
                    <div className="flex text-amber-400 text-[8px]">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`fa-solid fa-star ${i < Math.floor(product.rating) ? '' : 'text-slate-700'}`}></i>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{product.deliveryTime}</span>
                  <a href={product.url} target="_blank" rel="noopener" className="mt-2">
                    <Button 
                      size="sm" 
                      variant={isLowest ? 'primary' : 'outline'} 
                      className="shadow-lg active:scale-95 group/buy"
                      icon={<i className="fa-solid fa-cart-shopping transition-transform group-hover/buy:scale-110"></i>}
                    >
                      Buy Now
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* AI Review Summary Expansion */}
            {isExpanded && product.reviewSummary && (
              <div className="border-t border-slate-800 bg-slate-900/30 p-5 animate-fade-in-down">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Satisfaction Score</div>
                      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${product.reviewSummary.score}%` }}
                        ></div>
                      </div>
                      <div className="text-xs font-black text-blue-400">{product.reviewSummary.score}%</div>
                    </div>
                    <div className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getSentimentColor(product.reviewSummary.sentiment)}`}>
                      Overall {product.reviewSummary.sentiment}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Key Buyer Sentiments</div>
                    <ul className="space-y-2">
                      {product.reviewSummary.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <i className="fa-solid fa-circle-check text-[10px] mt-1 text-blue-500"></i>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 text-[9px] text-slate-600 font-bold italic flex items-center gap-2">
                  <i className="fa-solid fa-brain"></i>
                  Summarized by Lumina Neural Engine
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ComparisonTable;
