
export interface WineNote {
  id: string;
  name: string;
  winery: string;
  varietal: string;
  region: string;
  vintage: string;
  tastingNotes: string; // AI 抓取的笔记
  userNotes?: string;   // 用户自己的记录
  rating?: number;      // 1-5 星
  style?: string;       // 风格分类：红、白、起泡等
  characteristics: {
    body: number; 
    tannin: number;
    acidity: number;
    sweetness: number;
  };
  imageUrl?: string;
  createdAt: number;
  searchSources?: { title: string; uri: string }[];
}

export interface WineAnalysis {
  name: string;
  winery: string;
  varietal: string;
  region: string;
  vintage: string;
  summary: string;
  style?: string;
  characteristics: {
    body: number;
    tannin: number;
    acidity: number;
    sweetness: number;
  };
}

export type SortOption = 'date_added' | 'vintage' | 'region' | 'style' | 'rating';
