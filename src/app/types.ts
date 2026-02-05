export type TokenStatus = "UNUSED" | "ACTIVE" | "REVOKED";

export interface User {
  id: number;
  email: string;
  token_id: number | null;
  created_at: string;
  is_admin: boolean;
  phone_number: string | null;
  last_name: string | null;
  first_name: string | null;
  token?: {
    status: TokenStatus | null;
    token_value: string | null;
  } | null;
}

export interface Token {
  id: number;
  status: TokenStatus;
  token_value: string;
  created_at: string;
  user_email?: string | null;
}
