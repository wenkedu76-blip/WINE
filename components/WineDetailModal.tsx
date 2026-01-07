
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-950/90 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="sticky top-0 bg-white px-4 py-3 sm:px-6 sm:py-4 border-b border-stone-100 flex justify-between items-center z-20">
          <h2 className="serif text-xl sm:text-2xl text-rose-900">品鉴志</h2>
          <div className="flex gap-2">
            <button onClick={() => onSave(edited)} className="bg-rose-800 text-white px-5 py-1.5 rounded-full font-bold text-sm hover:bg-rose-900 transition-colors">完成</button>
            <button onClick={onClose} className="p-2 bg-stone-100 rounded-full text-stone-400 hover:text-stone-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 shadow-inner">
              {edited.imageUrl ? (
                <img src={edited.imageUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300">待添加照片</div>
              )}
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">酒款名称</label>
                <input className="w-full text-xl font-bold text-stone-800 border-b border-transparent focus:border-rose-200 outline-none p-0 transition-all" value={edited.name} onChange={e => setEdited({...edited, name: e.target.value})} />
                <div className="flex gap-1 mt-3">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={() => setEdited({...edited, rating: star})}>
                      <svg className={`w-5 h-5 ${star <= (edited.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <InfoItem label="酒庄" value={edited.winery} onChange={v => setEdited({...edited, winery: v})} />
                <InfoItem label="年份" value={edited.vintage} onChange={v => setEdited({...edited, vintage: v})} />
                <InfoItem label="品种" value={edited.varietal} onChange={v => setEdited({...edited, varietal: v})} />
                <InfoItem label="产区" value={edited.region} onChange={v => setEdited({...edited, region: v})} />
              </div>

              <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                <h4 className="text-[10px] font-bold text-rose-900 uppercase tracking-widest mb-4">酒款架构 (Structure)</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Slider label="酒体" val={edited.characteristics.body} onChange={v => handleSlider('body', v)} />
                  <Slider label="酸度" val={edited.characteristics.acidity} onChange={v => handleSlider('acidity', v)} />
                  <Slider label="单宁" val={edited.characteristics.tannin} onChange={v => handleSlider('tannin', v)} />
                  <Slider label="甜度" val={edited.characteristics.sweetness} onChange={v => handleSlider('sweetness', v)} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">我的私人笔记</label>
              <textarea 
                placeholder="记录开瓶后的香气变化、口感、配餐建议..."
                className="w-full min-h-[160px] bg-stone-50 border border-stone-100 rounded-xl p-4 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-rose-100 transition-all"
                value={edited.userNotes}
                onChange={e => setEdited({...edited, userNotes: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex justify-between">
                <span>AI 专家深度摘要</span>
                <span className="text-rose-700 italic font-normal">基于 Gemini 搜索补全</span>
              </label>
              <div className="w-full min-h-[160px] bg-white border border-stone-100 rounded-xl p-4 text-sm leading-relaxed text-stone-600 overflow-y-auto italic">
                {edited.tastingNotes}
              </div>
              {edited.searchSources && edited.searchSources.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2">
                  {edited.searchSources.slice(0, 3).map((src, i) => (
                    <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] text-rose-800 hover:underline">🔗 {src.title}</a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center pt-6 pb-4">
            <button onClick={() => onDelete(edited.id)} className="text-stone-300 hover:text-rose-600 text-[10px] font-bold uppercase tracking-widest transition-colors">永久从酒窖中移除</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
    <span className="text-[9px] text-stone-400 uppercase block mb-0.5">{label}</span>
    <input className="w-full bg-transparent text-xs font-bold text-stone-700 outline-none" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

const Slider = ({ label, val, onChange }: { label: string, val: number, onChange: (v: number) => void }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-bold text-rose-800">
      <span>{label}</span>
      <span>{val}/5</span>
    </div>
    <input type="range" min="1" max="5" value={val} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full h-1 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-800" />
  </div>
);
