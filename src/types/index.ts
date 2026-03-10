export interface Message {
  role: "user" | "assistant";
  content: string;
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
