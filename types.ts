export enum AspectRatio {
  Square = "1:1",
  Portrait = "3:4",
  Landscape = "4:3",
  Wide = "16:9",
  Tall = "9:16",
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  imageUrl: string | null;
  prompt: string;
}