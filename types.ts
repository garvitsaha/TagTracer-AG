
export interface Product {
  id: string;
  name: string;
  website: string;
  price: number;
  features: string[];
  rating: number;
  deliveryTime: string;
  url: string;
  imageUrl: string;
  category: string;
  isAiGenerated?: boolean;
  reviewSummary?: {
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    highlights: string[];
    score: number; // 0-100 score representing overall customer satisfaction
  };
}

export interface ComparisonResult {
  products: Product[];
  bestDealId: string;
}

export enum SortOption {
  PRICE_LOW_HIGH = 'price_asc',
  PRICE_HIGH_LOW = 'price_desc',
  RATING_HIGH_LOW = 'rating_desc',
  DELIVERY_FASTEST = 'delivery_fast'
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; uri: string }>;
  isThinking?: boolean;
}
