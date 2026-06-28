// src/requests/TreatmentAdminRequests.ts
// Usa a instância axios central (src/lib/api.ts) que já injeta o Bearer token

import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TreatmentStatus = "ACTIVE" | "INACTIVE";
export type TreatmentType = "FACIAL" | "BODY" | "MASSAGE_THERAPY";

export interface TreatmentPayload {
  name: string;
  description: string;
  /** ISO-8601 duration – ex: "PT45M" para 45 minutos */
  duration: string;
  price: number;
  imagePath: string;
  status: TreatmentStatus;
  type: TreatmentType;
}

export interface TreatmentResponse {
  id: number;
  name: string;
  description: string;
  /** Duração em minutos (o back retorna em segundos ou ISO; ajuste conforme sua API) */
  duration: number;
  price: number;
  imagePath: string;
  status: TreatmentStatus;
  type: TreatmentType;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converte minutos → ISO-8601 duration string esperada pelo backend.
 * Ex: 45 → "PT45M"
 */
export function minutesToDuration(minutes: number): string {
  return `PT${minutes}M`;
}

/**
 * Converte ISO-8601 duration ou segundos brutos → minutos para exibição.
 * Suporta: "PT45M", "PT1H30M", ou número (segundos).
 */
export function durationToMinutes(duration: string | number): number {
  if (typeof duration === "number") return Math.round(duration / 60);
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] ?? "0");
  const m = parseInt(match[2] ?? "0");
  const s = parseInt(match[3] ?? "0");
  return h * 60 + m + Math.round(s / 60);
}

// ─── API functions (usadas nos mutations/queries do react-query) ──────────────

/** GET /treatments?page=&size=&type= */
export async function fetchTreatments(params?: {
  page?: number;
  size?: number;
  type?: TreatmentType;
}): Promise<PageResponse<TreatmentResponse>> {
  // Remove keys com valor undefined para não enviar "type=" vazio ao Spring
  const queryParams: Record<string, string | number> = {
    page: params?.page ?? 1,
    size: params?.size ?? 50,
  };
  if (params?.type) queryParams.type = params.type;

  const { data } = await api.get<PageResponse<TreatmentResponse>>(
    "/treatments",
    { params: queryParams }
  );
  return data;
}

/** POST /treatments */
export async function createTreatment(
  payload: TreatmentPayload
): Promise<TreatmentResponse> {
  const { data } = await api.post<TreatmentResponse>("/treatments", payload);
  return data;
}

/** PUT /treatments/{id} */
export async function updateTreatment(
  id: number,
  payload: TreatmentPayload
): Promise<TreatmentResponse> {
  const { data } = await api.put<TreatmentResponse>(
    `/treatments/${id}`,
    payload
  );
  return data;
}

/** DELETE /treatments/{id} */
export async function deleteTreatment(id: number): Promise<void> {
  await api.delete(`/treatments/${id}`);
}