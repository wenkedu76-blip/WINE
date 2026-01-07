
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
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-stone-200"
    >
      <div className="h-48 bg-stone-100 relative">
        {wine.imageUrl ? (
          <img src={wine.imageUrl} alt={wine.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400">
             <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-bold text-rose-900 shadow-sm">
          {wine.vintage}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg truncate leading-tight mb-1">{wine.name}</h3>
        <p className="text-stone-500 text-sm mb-2">{wine.winery}</p>
        <div className="flex flex-wrap gap-1">
          <span className="text-[10px] uppercase tracking-wider bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-medium">
            {wine.varietal}
          </span>
          <span className="text-[10px] uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium">
            {wine.region}
          </span>
        </div>
      </div>
    </div>
  );
};
