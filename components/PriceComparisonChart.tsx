
import React, { useMemo } from 'react';
import { Product } from '../types';

interface PriceComparisonChartProps {
  products: Product[];
}

const PriceComparisonChart: React.FC<PriceComparisonChartProps> = ({ products }) => {
  const chartData = useMemo(() => {
    if (products.length === 0) return [];
    
    // Group by website to show comparison clearly
    const data = products
      .filter(p => p.price > 0)
      .map(p => ({
        name: p.name,
        website: p.website,
        price: p.price
      }))
      .sort((a, b) => a.price - b.price);

    const maxPrice = Math.max(...data.map(d => d.price));
    const minPrice = Math.min(...data.map(d => d.price));

    return data.map(d => ({
      ...d,
      percentage: (d.price / maxPrice) * 100,
      isLowest: d.price === minPrice
    }));
  }, [products]);

  if (chartData.length === 0) return null;

  return (
    <div className="glass-card rounded-[32px] p-8 mt-10 relative overflow-hidden group animate-fade-in-up">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
            <i className="fa-solid fa-chart-simple text-blue-500"></i>
            Price Delta Analysis
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Retailer Price Variance</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            Best Deal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Standard
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {chartData.map((item, index) => (
          <div key={`${item.website}-${index}`} className="group/bar">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{item.website}</span>
                <span className="text-[9px] text-slate-600 font-medium truncate max-w-[150px]">— {item.name}</span>
              </div>
              <span className={`text-xs font-black ${item.isLowest ? 'text-emerald-400' : 'text-slate-400'}`}>
                ₹{item.price.toLocaleString('en-IN')}
              </span>
            </div>
            
            <div className="h-3 w-full bg-slate-900/50 rounded-full border border-slate-800 overflow-hidden relative">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                  item.isLowest 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                    : 'bg-gradient-to-r from-blue-700 to-blue-500'
                }`}
                style={{ width: `${item.percentage}%` }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800/50 flex items-center justify-center">
        <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] italic">
          Visualization powered by Lumina Real-time Engine
        </p>
      </div>
    </div>
  );
};

export default PriceComparisonChart;
