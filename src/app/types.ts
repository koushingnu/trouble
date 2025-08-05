export interface User {
  id: number;
  email: string;
  created_at: string;
  is_admin: boolean;
  token?: {
    id: number;
    status: string;
    token_value: string;
    created_at: string;
  } | null;
}

export interface Token {
  id: number;
  status: string;
  token_value: string;
  created_at: string;
  user_email?: string | null;
}