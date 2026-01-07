
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { WineNote, WineAnalysis, SortOption } from './types';
import { WineCard } from './components/WineCard';
import { WineDetailModal } from './components/WineDetailModal';
import { analyzeWineLabel, researchWineInfo } from './services/geminiService';

const App: React.FC = () => {
  const [wines, setWines] = useState<WineNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWine, setSelectedWine] = useState<WineNote | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date_added');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sommelier_wines_v3');
    if (saved) setWines(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('sommelier_wines_v3', JSON.stringify(wines));
  }, [wines]);

  const sortedWines = useMemo(() => {
    const list = [...wines];
    switch (sortBy) {
      case 'vintage': return list.sort((a, b) => b.vintage.localeCompare(a.vintage));
      case 'rating': return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'region': return list.sort((a, b) => a.region.localeCompare(b.region));
      default: return list.sort((a, b) => b.createdAt - a.createdAt);
    }
  }, [wines, sortBy]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const { data } = await analyzeWineLabel(base64);
        addNewWine(data, base64);
      } catch (err) {
        console.error(err);
        alert("未能识别该酒标，请尝试手动搜索或上传更清晰的照片。");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setIsSearching(false);
    try {
      const { data, sources } = await researchWineInfo(searchQuery);
      addNewWine(data, undefined, sources);
      setSearchQuery('');
    } catch (err) {
      console.error(err);
      alert("搜索失败，请检查网络或更换关键词。");
    } finally {
      setLoading(false);
    }
  };

  const addNewWine = (data: WineAnalysis, imageUrl?: string, sources?: any[]) => {
    const newWine: WineNote = {
      id: Date.now().toString(),
      name: data.name || "未知酒款",
      winery: data.winery || "未知酒庄",
      varietal: data.varietal || "未知品种",
      region: data.region || "未知产区",
      vintage: data.vintage || "N/V",
      tastingNotes: data.summary || "暂无AI笔记",
      userNotes: "",
      rating: 5,
      style: data.style || "Red",
      characteristics: data.characteristics || { body: 3, acidity: 3, tannin: 3, sweetness: 1 },
      imageUrl,
      createdAt: Date.now(),
      searchSources: sources
    };
    setWines(prev => [newWine, ...prev]);
    setSelectedWine(newWine);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 wine-gradient rounded-lg flex items-center justify-center text-white shadow-lg">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h1 className="serif text-xl font-bold text-stone-900 tracking-tight">酒闻录</h1>
          </div>
          <button 
            onClick={() => setIsSearching(true)}
            className="p-2 text-stone-400 hover:text-rose-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex overflow-x-auto gap-2 no-scrollbar pb-2">
          {[
            { id: 'date_added', label: '最近添加' },
            { id: 'rating', label: '按评分' },
            { id: 'vintage', label: '按年份' },
            { id: 'region', label: '按产区' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id as SortOption)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${sortBy === opt.id ? 'bg-rose-900 border-rose-900 text-white shadow-sm' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto px-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-rose-50 border-t-rose-800 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-rose-800 rounded-full animate-ping"></div>
              </div>
            </div>
            <div className="text-center">
              <p className="serif text-lg text-stone-800 mb-1 animate-pulse">正在唤醒 AI 酒评师...</p>
              <p className="text-xs text-stone-400">正在检索全球数据库并深度分析酒款结构</p>
            </div>
          </div>
        )}

        {!loading && sortedWines.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {sortedWines.map(wine => (
              <WineCard key={wine.id} wine={wine} onClick={setSelectedWine} />
            ))}
          </div>
        ) : !loading && (
          <div className="text-center py-32 space-y-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-stone-100">
               <svg className="w-10 h-10 text-stone-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
            </div>
            <div>
              <p className="serif text-xl text-stone-800">虚位以待</p>
              <p className="text-sm text-stone-400 mt-1">拍摄酒标或输入酒名，开始您的品味之旅</p>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-3 px-8 py-4 wine-gradient text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group"
        >
          <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span className="font-bold tracking-widest text-sm">识酒标</span>
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept="image/*" 
        capture="environment" 
      />

      {/* Search Overlay */}
      {isSearching && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="serif text-2xl text-stone-900 mb-2">手动检索</h3>
            <p className="text-stone-400 text-xs mb-6 font-medium">输入您手中的酒款信息，AI 将为您补全档案</p>
            <form onSubmit={handleManualSearch} className="space-y-4">
              <input 
                type="text" autoFocus placeholder="例如: 啸鹰 2018 卡本内苏维翁"
                className="w-full text-lg border-2 border-stone-50 bg-stone-50 rounded-2xl px-6 py-4 focus:bg-white focus:border-rose-400 outline-none transition-all placeholder:text-stone-300"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="w-full wine-gradient text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all">开始探索</button>
              <button type="button" onClick={() => setIsSearching(false)} className="w-full text-stone-400 py-2 text-xs font-bold uppercase tracking-widest">取消</button>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedWine && (
        <WineDetailModal 
          wine={selectedWine}
          isOpen={!!selectedWine}
          onClose={() => setSelectedWine(null)}
          onSave={(u) => {
            setWines(prev => prev.map(w => w.id === u.id ? u : w));
            setSelectedWine(null);
          }}
          onDelete={(id) => {
            if (confirm('确定要删除这瓶酒的记录吗？')) {
              setWines(prev => prev.filter(w => w.id !== id));
              setSelectedWine(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default App;
