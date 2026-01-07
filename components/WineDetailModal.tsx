
import React, { useState, useEffect } from 'react';
import { WineNote } from '../types';

interface WineDetailModalProps {
  wine: WineNote;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: WineNote) => void;
  onDelete: (id: string) => void;
}

export const WineDetailModal: React.FC<WineDetailModalProps> = ({ wine, isOpen, onClose, onSave, onDelete }) => {
  const [edited, setEdited] = useState<WineNote>(wine);

  useEffect(() => {
    setEdited(wine);
  }, [wine]);

  if (!isOpen) return null;

  const handleSlider = (key: keyof WineNote['characteristics'], val: number) => {
    setEdited({ ...edited, characteristics: { ...edited.characteristics, [key]: val } });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white w-full h-full md:h-auto md:max-w-4xl md:rounded-3xl shadow-2xl md:my-8 flex flex-col">
        <div className="sticky top-0 bg-white/90 backdrop-blur px-6 py-4 border-b border-stone-100 flex justify-between items-center z-20">
          <h2 className="serif text-2xl">品酒记录</h2>
          <div className="flex gap-2">
            <button onClick={() => onSave(edited)} className="bg-rose-800 text-white px-6 py-2 rounded-full font-bold text-sm">保存</button>
            <button onClick={onClose} className="p-2 bg-stone-100 rounded-full"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-10 flex-1 overflow-y-auto">
          {/* 基础信息 */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-stone-100 shadow-inner">
              {edited.imageUrl ? (
                <img src={edited.imageUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300">暂无照片</div>
              )}
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">酒名 & 评分</label>
                <input className="w-full text-2xl font-bold border-none outline-none focus:ring-0 p-0" value={edited.name} onChange={e => setEdited({...edited, name: e.target.value})} />
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={() => setEdited({...edited, rating: star})}>
                      <svg className={`w-6 h-6 ${star <= (edited.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span className="text-[10px] text-stone-400 uppercase block">酒庄</span>
                  <input className="w-full bg-transparent text-sm font-medium outline-none" value={edited.winery} onChange={e => setEdited({...edited, winery: e.target.value})} />
                </div>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span className="text-[10px] text-stone-400 uppercase block">年份</span>
                  <input className="w-full bg-transparent text-sm font-medium outline-none" value={edited.vintage} onChange={e => setEdited({...edited, vintage: e.target.value})} />
                </div>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span className="text-[10px] text-stone-400 uppercase block">产区</span>
                  <input className="w-full bg-transparent text-sm font-medium outline-none" value={edited.region} onChange={e => setEdited({...edited, region: e.target.value})} />
                </div>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span className="text-[10px] text-stone-400 uppercase block">风格分类</span>
                  <select 
                    className="w-full bg-transparent text-sm font-medium outline-none"
                    value={edited.style}
                    onChange={e => setEdited({...edited, style: e.target.value})}
                  >
                    <option value="Red">干红 (Red)</option>
                    <option value="White">干白 (White)</option>
                    <option value="Rosé">桃红 (Rosé)</option>
                    <option value="Sparkling">起泡 (Sparkling)</option>
                    <option value="Sweet">甜酒 (Dessert)</option>
                    <option value="Fortified">加强 (Fortified)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* 结构分析 */}
          <section className="bg-rose-50/50 p-8 rounded-3xl border border-rose-100">
            <h4 className="text-sm font-bold text-rose-900 uppercase tracking-widest mb-6">酒款架构分析 (结构平衡)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {Object.entries(edited.characteristics).map(([key, val]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-rose-800">
                    <span className="capitalize">{key === 'body' ? '酒体 (Body)' : key === 'tannin' ? '单宁 (Tannin)' : key === 'acidity' ? '酸度 (Acidity)' : '甜度 (Sweetness)'}</span>
                    <span>{val}/5</span>
                  </div>
                  <input type="range" min="1" max="5" value={val} onChange={(e) => handleSlider(key as any, parseInt(e.target.value))} className="w-full accent-rose-800" />
                </div>
              ))}
            </div>
          </section>

          {/* 笔记区域 */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">我的私人笔记</label>
              <textarea 
                placeholder="记录这次品鉴的心得、配餐或是开瓶状态..."
                className="w-full min-h-[200px] bg-stone-50 border border-stone-100 rounded-2xl p-5 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-rose-200"
                value={edited.userNotes}
                onChange={e => setEdited({...edited, userNotes: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest flex justify-between">
                <span>AI 专家摘要</span>
                <span className="text-rose-700 italic">由 Gemini 分析</span>
              </label>
              <div className="w-full min-h-[200px] bg-white border border-stone-100 rounded-2xl p-5 text-sm leading-relaxed text-stone-500 overflow-y-auto">
                {edited.tastingNotes}
              </div>
            </div>
          </section>

          <div className="flex justify-center pt-8 border-t border-stone-100">
            <button onClick={() => onDelete(edited.id)} className="text-stone-300 hover:text-rose-500 text-xs font-medium transition-colors">永久删除此条笔记</button>
          </div>
        </div>
      </div>
    </div>
  );
};
