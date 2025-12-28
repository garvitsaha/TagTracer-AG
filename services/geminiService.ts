
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Product } from "../types";

// Always initialize GoogleGenAI with a named parameter and direct reference to process.env.API_KEY.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Provides a deep-thinking analysis of products using gemini-3-pro-preview.
 */
export const getSmartAdvice = async (query: string, products: any[]) => {
  const ai = getAI();
  const context = JSON.stringify(products);
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `User is asking: "${query}". Based on these products: ${context}, provide a deep-thinking analysis of the best value for money. Consider features, delivery, and ratings. Compare specific aspects like warranty, brand reliability, and price per feature. Respond in clear markdown.`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  
  return response.text;
};

/**
 * Performs a real-time web search using googleSearch grounding to find more deals and returns a text summary with sources.
 * Fixes the missing member error in SmartAssistant.tsx.
 */
export const searchLiveDeals = async (query: string): Promise<{ text: string, sources: any[] }> => {
  const ai = getAI();
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The user is looking for deal comparisons: "${query}". Search for current prices and availability across major Indian retailers and provide a comprehensive summary.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const text = response.text || "";
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Retailer Source',
    uri: chunk.web?.uri || '#'
  })) || [];

  return { text, sources };
};

/**
 * Specifically targets Amazon.in, Flipkart, and Croma to find live prices, ratings, and summarize reviews for ANY product.
 */
export const searchAndCompareAnyProduct = async (query: string): Promise<{ products: Product[], sources: any[] }> => {
  const ai = getAI();
  
  const prompt = `Perform a real-time web search for the product: "${query}".
  Locate this product on these three specific Indian retailers: 
  1. amazon.in
  2. flipkart.com
  3. croma.com
  
  For EACH store, extract:
  - The exact full product name.
  - The current price in INR (numeric value only).
  - The user rating (out of 5).
  - At least 3 key specifications or features.
  - Estimated delivery time.
  - The direct URL to the product page.
  - A direct link to the product image (imageUrl).
  - A summary of user reviews.

  Format the output ONLY as a JSON array of objects with keys: 
  "name", "website", "price", "features", "rating", "deliveryTime", "url", "imageUrl", "reviewSummary".`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const text = response.text || "";
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Verified Retailer Source',
    uri: chunk.web?.uri || '#'
  })) || [];

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const products: Product[] = parsed.map((item: any, idx: number) => ({
        id: `live-${item.website.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${idx}`,
        name: item.name || query,
        website: item.website || 'Retailer',
        price: Number(item.price) || 0,
        features: Array.isArray(item.features) ? item.features : [],
        rating: Number(item.rating) || 4.0,
        deliveryTime: item.deliveryTime || 'Varies',
        url: item.url || '#',
        imageUrl: item.imageUrl || `https://images.weserv.nl/?url=${encodeURIComponent(item.url)}&w=400&h=400&fit=cover`,
        category: 'Live Comparison',
        isAiGenerated: true,
        reviewSummary: item.reviewSummary
      }));
      return { products, sources };
    }
  } catch (e) {
    console.error("Failed to extract data from retailer search", e);
  }

  return { products: [], sources };
};

/**
 * Finds 4 similar products using Google Search grounding.
 */
export const getSimilarRecommendations = async (query: string): Promise<Product[]> => {
  const ai = getAI();
  const prompt = `Based on the product "${query}", find 4 similar products available in Indian online stores. Provide as JSON array.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const text = response.text || "";
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((item: any, idx: number) => ({
        id: `rec-${idx}-${Date.now()}`,
        name: item.name,
        website: item.website,
        price: Number(item.price) || 0,
        features: [],
        rating: Number(item.rating) || 4.0,
        deliveryTime: 'Check Store',
        url: item.url || '#',
        imageUrl: item.imageUrl || `https://placehold.co/400x400?text=${encodeURIComponent(item.name)}`,
        category: item.category || 'Related',
        isAiGenerated: true
      }));
    }
  } catch (e) {
    console.error("Failed to parse recommendations", e);
  }
  return [];
};

/**
 * Refines an existing image using Gemini 2.5 Flash Image.
 */
export const editProductImage = async (base64Image: string, prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/png'
          }
        },
        { text: prompt }
      ]
    }
  });

  // Iterating through all parts to find the image part as recommended.
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

/**
 * Generates a completely new image using Gemini 2.5 Flash Image.
 */
export const generateFreshProductImage = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  // Iterating through all parts to find the image part as recommended.
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
