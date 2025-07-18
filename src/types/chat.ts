export interface Message {
  id: number;
  chat_room_id: number;
  sender: "user" | "assistant";
  body: string;
  created_at: string;
}

export interface ChatRoom {
  id: number;
  user_id: number;
  created_at: string;
  messages: Message[];
}

export interface APIResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
}
