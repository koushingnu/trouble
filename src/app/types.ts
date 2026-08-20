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
  company_serial_number: string | null;
  acquisition_source: string | null;
  last_name_kana: string | null;
  first_name_kana: string | null;
  postal_code: string | null;
  address: string | null;
  token?: {
    status: TokenStatus | null;
    token_value: string | null;
    registered_at: string | null;
    cancelled_at: string | null;
    company?: { name: string } | null;
  } | null;
}

export interface Token {
  id: number;
  status: TokenStatus;
  token_value: string;
  created_at: string;
  registered_at?: string | null;
  cancelled_at?: string | null;
  user_email?: string | null;
  company_name?: string | null;
}

export interface Company {
  id: number;
  code: string;
  name: string;
  cancellation_url: string;
  created_at: string;
  token_count?: number;
}
