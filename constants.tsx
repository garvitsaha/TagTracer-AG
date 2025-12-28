
import { Product } from './types';

export const APP_NAME = "TagTracer";
export const SHEETS_API_URL = ""; 

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'AirPods Pro (2nd Gen)',
    website: 'Amazon India',
    price: 24900,
    features: ['Active Noise Cancellation', 'Transparency Mode', 'Spatial Audio'],
    rating: 4.8,
    deliveryTime: 'Same Day',
    url: 'https://amazon.in',
    imageUrl: 'https://picsum.photos/seed/pods1/400/400',
    category: 'Audio'
  },
  {
    id: '2',
    name: 'AirPods Pro (2nd Gen)',
    website: 'Flipkart',
    price: 23999,
    features: ['MagSafe Case (USB-C)', 'H2 Chip', 'Up to 6hrs battery'],
    rating: 4.7,
    deliveryTime: '2 Days',
    url: 'https://flipkart.com',
    imageUrl: 'https://picsum.photos/seed/pods2/400/400',
    category: 'Audio'
  },
  {
    id: '3',
    name: 'Nike Air Max 270',
    website: 'Myntra',
    price: 13995,
    features: ['Knit Upper', 'Large Air unit', 'Lightweight'],
    rating: 4.5,
    deliveryTime: '4 Days',
    url: 'https://myntra.com',
    imageUrl: 'https://picsum.photos/seed/nike1/400/400',
    category: 'Footwear'
  },
  {
    id: '4',
    name: 'Sony WH-1000XM5',
    website: 'Croma',
    price: 29990,
    features: ['Industry leading NC', '30hr battery', 'Multipoint connection'],
    rating: 4.9,
    deliveryTime: '1 Day',
    url: 'https://croma.com',
    imageUrl: 'https://picsum.photos/seed/sony1/400/400',
    category: 'Audio'
  },
  {
    id: '5',
    name: 'DeLonghi Dedica Espresso Maker',
    website: 'Tata CLiQ Luxury',
    price: 21500,
    features: ['15 Bar Pressure', 'Slim Design', 'Manual Milk Frother'],
    rating: 4.6,
    deliveryTime: '5 Days',
    url: 'https://tatacliq.com',
    imageUrl: 'https://picsum.photos/seed/coffee1/400/400',
    category: 'Kitchen'
  }
];
