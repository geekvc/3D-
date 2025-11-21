import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from '../types';

// Initialize the client with the API key from the environment.
// As per instructions, we assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an image using the 'nano-banana' (gemini-2.5-flash-image) model.
 * Supports text-only or text-and-image input.
 */
export const generateFigureImage = async (
  prompt: string,
  aspectRatio: AspectRatio = AspectRatio.Landscape,
  referenceImageBase64?: string
): Promise<string> => {
  try {
    // "nano-banana" maps to 'gemini-2.5-flash-image'
    const modelId = 'gemini-2.5-flash-image';

    const parts: any[] = [];

    // If a reference image is provided, add it to the content parts
    if (referenceImageBase64) {
      // base64 string usually comes as "data:image/png;base64,..."
      // We need to extract the data and the mime type
      const match = referenceImageBase64.match(/^data:(.+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    // Add the text prompt
    parts.push({
      text: prompt,
    });

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
        // Note: responseMimeType and responseSchema are NOT supported for nano banana image generation.
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned from the model.");
    }

    const content = response.candidates[0].content;
    if (!content || !content.parts) {
      throw new Error("No content parts returned.");
    }

    // Iterate through parts to find the inline image data.
    // The API may return text parts alongside image parts.
    for (const part of content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const base64Data = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${base64Data}`;
      }
    }

    throw new Error("No image data found in the response.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};