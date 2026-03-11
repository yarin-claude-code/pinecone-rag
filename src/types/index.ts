export interface Source {
  name: string;
  detail: string;
  score: number;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
  sources?: Source[];
  generationTime?: number;
}

export interface ChatRequest {
  message: string;
  index: string;
  history: Message[];
}

export interface PineconeMetadata extends Record<string, string> {
  text: string;
  source: string;
}
