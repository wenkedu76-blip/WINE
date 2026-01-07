
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
    const saved = localStorage.getItem('sommelier_wines_v2');
    if (saved) setWines(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('sommelier_wines_v2', JSON.stringify(wines));
  }, [wines]);

  const sortedAndGroupedWines = useMemo(() => {
    const list = [...wines];
    switch (sortBy) {
      case 'vintage':
        return list.sort((a, b) => b.vintage.localeCompare(a.vintage));
      case 'region':
        return list.sort((a, b) => a.region.localeCompare(b.region));
      case 'rating':
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'style':
        return list.sort((a, b) => (a.style || '').localeCompare(b.style || ''));
      default:
        return list.sort((a, b) => b.createdAt - a.createdAt);
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
      } catch (error) {
        alert("识别失败，请检查 API Key 或尝试手动输入。");
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
    try {
      const { data, sources } = await researchWineInfo(searchQuery);
      addNewWine(data, undefined, sources);
      setIsSearching(false);
      setSearchQuery('');
    } catch (error) {
      alert("搜索失败，请检查网络或 API Key。");
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

  const updateWine = (updated: WineNote) => {
    setWines(prev => prev.map(w => w.id === updated.id ? updated : w));
    setSelectedWine(null);
  };

  const deleteWine = (id: string) => {
    if (confirm('确认删除这条笔记吗？')) {
      setWines(prev => prev.filter(w => w.id !== id));
      setSelectedWine(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:px-8 bg-stone-50 min-h-screen pb-24">
      <header className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 wine-gradient rounded-2xl flex items-center justify-center text-white shadow-xl">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h1 className="serif text-3xl font-bold">酒闻录 <span className="text-sm font-sans font-normal text-stone-400">Sommelier AI</span></h1>
          </div>
          <button onClick={() => setIsSearching(true)} className="p-3 bg-stone-900 text-white rounded-full shadow-lg"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
        </div>

        <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
          {[
            { id: 'date_added', label: '最近添加' },
            { id: 'vintage', label: '按年份' },
            { id: 'region', label: '按产区' },
            { id: 'style', label: '按风格' },
            { id: 'rating', label: '按评分' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id as SortOption)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${sortBy === opt.id ? 'bg-rose-800 text-white shadow-md' : 'bg-white text-stone-500 border border-stone-200'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </header>

      <main>
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-800 rounded-full animate-spin"></div>
            <p className="text-stone-500 italic animate-pulse text-sm">正在深度解析酒款信息...</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedAndGroupedWines.map(wine => (
            <WineCard key={wine.id} wine={wine} onClick={setSelectedWine} />
          ))}
        </div>

        {!loading && wines.length === 0 && (
          <div className="text-center py-32">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
            </div>
            <p className="text-stone-400 font-medium">您的酒窖还是空的</p>
            <p className="text-stone-300 text-sm mt-1">拍摄酒标或手动搜索来添加第一瓶酒</p>
          </div>
        )}
      </main>

      {/* 底部固定拍照按钮 */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-3 px-8 py-4 wine-gradient text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span className="font-bold tracking-wide">拍照识酒</span>
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

      {isSearching && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="serif text-2xl mb-6">查找酒款信息</h3>
            <form onSubmit={handleManualSearch} className="space-y-4">
              <input 
                type="text" autoFocus placeholder="输入酒名、年份或产区..."
                className="w-full text-lg border-2 border-stone-100 rounded-2xl px-6 py-4 focus:border-rose-400 outline-none transition-all"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold shadow-lg active:scale-[0.98] transition-all">开始探索</button>
              <button type="button" onClick={() => setIsSearching(false)} className="w-full text-stone-400 py-2 text-sm">放弃搜索</button>
            </form>
          </div>
        </div>
      )}

      {selectedWine && (
        <WineDetailModal 
          wine={selectedWine}
          isOpen={!!selectedWine}
          onClose={() => setSelectedWine(null)}
          onSave={updateWine}
          onDelete={deleteWine}
        />
      )}
    </div>
  );
};

export default App;
