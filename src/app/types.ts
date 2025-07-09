export interface ApiResponse {
  message?: string;
  error?: string;
  id?: number;
  success?: boolean;
  data?: unknown;
  details?: string;
}

export interface User {
  id: number;
  email: string;
  token_id: number | null;
  token_value: string | null;
  status: string | null;
  created_at: string;
}

export interface Token {
  id: number;
  token_value: string;
  status: "unused" | "active" | "inactive" | "expired" | "invalid";
  assigned_to: number | null;
  user_email?: string;
  created_at: string;
}

export interface ChatRoom {
  id: number;
  user_id: number;
  created_at: string;
}

export interface Message {
  id: number;
  chat_room_id: number;
  sender: string;
  body: string;
  created_at: string;
}

export interface AccessLog {
  id: number;
  user_id: number;
  event: string;
  created_at: string;
}
