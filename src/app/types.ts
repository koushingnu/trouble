export interface User {
  id: number;
  name: string;
  email: string;
}

export interface ApiResponse {
  message?: string;
  error?: string;
  id?: number;
}
