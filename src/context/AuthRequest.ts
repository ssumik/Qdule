// src/requests/AuthRequest.ts
// POST /auth → { token }

import { api } from "@/lib/api";

export interface AuthRequestBody {
  email: string;
  password: string;
}

export interface AuthResponseBody {
  token: string;
}

export async function loginRequest(
  body: AuthRequestBody
): Promise<AuthResponseBody> {
  const { data } = await api.post<AuthResponseBody>("/auth", body);
  return data;
}