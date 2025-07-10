export interface User {
  id: number;
  email: string;
  token_id?: number;
  token_value?: string;
  status?: string;
  created_at: string;
}

export interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  id?: number;
}
