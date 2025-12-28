
import React, { useState, useEffect, useMemo } from 'react';
import { Product, SortOption } from './types';
import { MOCK_PRODUCTS, APP_NAME, SHEETS_API_URL } from './constants';
import ComparisonTable from './components/ComparisonTable';
import SmartAssistant from './components/SmartAssistant';
import Button from './components/Button';
import ImageEditorModal from './components/ImageEditorModal';
import LoginPage from './components/LoginPage';
import PriceComparisonChart from './components/PriceComparisonChart';
import SimilarRecommendations from './components/SimilarRecommendations';
import { searchAndCompareAnyProduct, getSimilarRecommendations } from './services/geminiService';

const App: React.FC = () => {
  const [username, setUsername] = useState<string | null>(localStorage.getItem('tracer_user'));
  const [allProducts, setAllProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>(SortOption.PRICE_LOW_HIGH);
  const [isLoading, setIsLoading] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchSources, setSearchSources] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    if (!username) return;
    const fetchSheetsData = async () => {
      if (!SHEETS_API_URL) return;
      setIsLoading(true);
      try {
        const response = await fetch(SHEETS_API_URL);
        const data = await response.json();
        if (Array.isArray(data)) setAllProducts(data);
      } catch (error) {
        console.error("Sheets sync failed", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSheetsData();
  }, [username]);

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case SortOption.PRICE_LOW_HIGH:
        result.sort((a, b) => a.price - b.price);
        break;
      case SortOption.PRICE_HIGH_LOW:
        result.sort((a, b) => b.price - a.price);
        break;
      case SortOption.RATING_HIGH_LOW:
        result.sort((a, b) => b.rating - a.rating);
        break;
      case SortOption.DELIVERY_FASTEST:
        result.sort((a, b) => {
          const getDays = (s: string) => parseInt(s.split(' ')[0]) || 999;
          return getDays(a.deliveryTime) - getDays(b.deliveryTime);
        });
        break;
    }
    return result;
  }, [allProducts, searchTerm, sortBy]);

  const performGlobalSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsGlobalLoading(true);
    setSearchSources([]);
    setRecommendations([]); 
    try {
      // Parallel fetch for comparison and recommendations
      const [searchRes, recRes] = await Promise.all([
        searchAndCompareAnyProduct(query),
        getSimilarRecommendations(query)
      ]);

      if (searchRes.products.length > 0) {
        setAllProducts(prev => {
          const nonAi = prev.filter(p => !p.isAiGenerated);
          return [...searchRes.products, ...nonAi];
        });
        setSearchSources(searchRes.sources);
      }
      setRecommendations(recRes);
    } catch (error) {
      console.error("Global search failed", error);
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const handleGlobalSearch = () => performGlobalSearch(searchTerm);

  const handleRecommendationClick = (productName: string) => {
    setSearchTerm(productName);
    performGlobalSearch(productName);
    // Smooth scroll back to top to see results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateImageUrl = (newUrl: string) => {
    if (!editingProduct) return;
    setAllProducts(prev => prev.map(p => 
      p.id === editingProduct.id ? { ...p, imageUrl: newUrl } : p
    ));
    setEditingProduct(null);
  };

  const handleLogin = (name: string) => {
    localStorage.setItem('tracer_user', name);
    setUsername(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('tracer_user');
    setUsername(null);
  };

  if (!username) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen relative">
      {/* Dynamic Glass Header */}
      <header className="sticky top-0 z-50 transition-all duration-300">
        <div className="bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] rotate-3">
              <i className="fa-solid fa-cube text-white"></i>
            </div>
            <h1 className="text-2xl font-black lumina-text tracking-tighter uppercase italic">
              {APP_NAME}
            </h1>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <span className="flex items-center gap-2 hover:text-blue-400 cursor-default transition-colors">
                <i className="fa-brands fa-amazon"></i> Amazon.in
              </span>
              <span className="flex items-center gap-2 hover:text-blue-400 cursor-default transition-colors">
                <i className="fa-solid fa-cart-shopping"></i> Flipkart
              </span>
              <span className="flex items-center gap-2 hover:text-blue-400 cursor-default transition-colors">
                <i className="fa-solid fa-bolt"></i> Croma
              </span>
            </div>
            <div className="h-4 w-px bg-slate-800"></div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{username}</span>
                <button onClick={handleLogout} className="text-[8px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors">Logout</button>
              </div>
              <div className="flex items-center gap-3 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* 3D Search Portal */}
            <div className="glass-card rounded-[32px] p-8 md:p-10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1 group/search search-glow rounded-2xl transition-all">
                    <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-blue-400 transition-colors"></i>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
                      placeholder="Fetch prices for any product..."
                      className="w-full pl-14 pr-6 py-5 bg-slate-950/40 border border-slate-800 rounded-2xl focus:outline-none text-white text-lg placeholder-slate-700 transition-all font-medium"
                    />
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={handleGlobalSearch}
                    isLoading={isGlobalLoading}
                    className="md:w-48 py-5 rounded-2xl text-base font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.4)] transform active:scale-95 transition-all"
                  >
                    Compare Live
                  </Button>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/50 pt-6">
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Matrix Filters</span>
                    <div className="flex gap-3">
                      {[
                        { label: 'Cheapest', val: SortOption.PRICE_LOW_HIGH, icon: 'fa-tags' },
                        { label: 'Elite Rated', val: SortOption.RATING_HIGH_LOW, icon: 'fa-star' },
                        { label: 'Hyper Fast', val: SortOption.DELIVERY_FASTEST, icon: 'fa-bolt-lightning' }
                      ].map(opt => (
                        <button 
                          key={opt.val}
                          onClick={() => setSortBy(opt.val)}
                          className={`flex items-center gap-2 text-[10px] px-4 py-2 rounded-xl font-black uppercase tracking-widest transition-all border ${
                            sortBy === opt.val 
                              ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20 scale-105' 
                              : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          <i className={`fa-solid ${opt.icon}`}></i>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {searchSources.length > 0 && (
              <div className="flex flex-wrap gap-3 items-center px-4 animate-fade-in">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2 flex items-center gap-2">
                  <i className="fa-solid fa-link-slash text-emerald-500"></i>
                  Validated Sources
                </span>
                {searchSources.map((s, idx) => (
                  <a key={idx} href={s.uri} target="_blank" className="text-[10px] font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-md">
                    <i className="fa-solid fa-shield-halved text-[8px] text-blue-400"></i>
                    {s.title}
                  </a>
                ))}
              </div>
            )}

            {/* Results Engine */}
            <div className="relative">
              {(isLoading || isGlobalLoading) && (
                <div className="absolute inset-0 z-40 bg-slate-950/60 backdrop-blur-md flex items-center justify-center rounded-[32px] min-h-[500px]">
                  <div className="flex flex-col items-center gap-8 text-center p-12 glass-card rounded-[40px] max-w-sm border-white/5">
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border-r-4 border-indigo-500 rounded-full animate-spin [animation-duration:1.5s]"></div>
                      <div className="absolute inset-4 border-b-4 border-purple-500 rounded-full animate-spin [animation-duration:2s]"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <i className="fa-solid fa-microchip text-2xl text-blue-400 animate-pulse"></i>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">Syncing Data</h4>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">
                        Lumina is currently crawling the web to bring you authentic prices from <strong className="text-blue-400">Amazon</strong>, <strong className="text-blue-400">Flipkart</strong>, and <strong className="text-blue-400">Croma</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <ComparisonTable 
                products={filteredProducts} 
                onEditImage={setEditingProduct}
              />
            </div>

            {/* Recommendations Section */}
            <SimilarRecommendations 
              recommendations={recommendations} 
              isLoading={isGlobalLoading}
              onRecommendationClick={handleRecommendationClick}
            />

            {/* Price Visualization Help */}
            <PriceComparisonChart products={filteredProducts} />

          </div>

          {/* Right Column: AI Core */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-28 space-y-8">
              <SmartAssistant currentProducts={filteredProducts} />
              
              <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -translate-y-16 translate-x-16 blur-3xl"></div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-circle-info text-blue-500"></i>
                  Lumina Insights
                </h3>
                <p className="text-xs text-slate-500 leading-loose">
                  TagTracer uses advanced neural search grounding. Unlike static lists, our engine creates a <strong>dynamic real-time bridge</strong> between you and the major retailers, ensuring 100% price accuracy at the moment of search.
                </p>
                <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Global Ops: Normal</div>
                  <div className="flex -space-x-2">
                    {[1,2,3].map(n => <div key={n} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px]"><i className="fa-solid fa-bolt text-blue-500"></i></div>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Futuristic Footer */}
      <footer className="relative border-t border-white/5 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                <i className="fa-solid fa-tags text-xs text-blue-500"></i>
              </div>
              <span className="text-xl font-black text-white tracking-tighter uppercase italic">TagTracer</span>
            </div>
            <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Neural Comparison Engine &copy; 2024</p>
          </div>
          
          <div className="flex gap-10">
            <div className="text-center md:text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Core Technology</p>
              <p className="text-sm font-bold lumina-text">Gemini 3 Pro + Search Grounding</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-32 bg-gradient-to-t from-blue-900/10 to-transparent blur-3xl opacity-50"></div>
      </footer>

      {/* Modal */}
      {editingProduct && (
        <ImageEditorModal 
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleUpdateImageUrl}
        />
      )}
    </div>
  );
};

export default App;
