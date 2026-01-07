
import React from 'react';
import { WineNote } from '../types';

interface WineCardProps {
  wine: WineNote;
  onClick: (wine: WineNote) => void;
}

export const WineCard: React.FC<WineCardProps> = ({ wine, onClick }) => {
  return (
    <div 
      onClick={() => onClick(wine)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-stone-100"
    >
      <div className="h-40 sm:h-52 bg-stone-100 relative group">
        {wine.imageUrl ? (
          <img src={wine.imageUrl} alt={wine.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-bold text-rose-900 shadow-sm">
          {wine.vintage}
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-sm sm:text-base truncate mb-0.5">{wine.name}</h3>
        <p className="text-stone-400 text-[10px] sm:text-xs truncate mb-2">{wine.winery}</p>
        <div className="flex flex-wrap gap-1">
          <span className="text-[9px] uppercase tracking-wider bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-bold">
            {wine.style}
          </span>
          <span className="text-[9px] uppercase tracking-wider bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">
            {wine.region?.split(',')[0]}
          </span>
        </div>
      </div>
    </div>
  );
};
