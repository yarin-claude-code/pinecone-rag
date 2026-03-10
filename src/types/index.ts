export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  index: string;
  history: Message[];
}

export interface PineconeMetadata {
  text: string;
  source: string;
}
