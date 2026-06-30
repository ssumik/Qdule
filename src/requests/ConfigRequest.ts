import { api } from "@/lib/api";

export interface ConfigResponse {
  id?: number;
  sendEmail?: string;
  contactLink?: string;
}

export interface ConfigUpdateRequest {
  sendEmail: string;
  contactLink: string;
}

type ConfigApiResponse = ConfigResponse | { data?: ConfigResponse };

function isWrappedConfigResponse(
  data: ConfigApiResponse,
): data is { data?: ConfigResponse } {
  return "data" in data;
}

function normalizeConfigResponse(data: ConfigApiResponse): ConfigResponse {
  if (isWrappedConfigResponse(data)) {
    return data.data ?? {};
  }

  return data;
}

export async function GetConfig(): Promise<ConfigResponse> {
  const { data } = await api.get<ConfigApiResponse>("/configs");

  return normalizeConfigResponse(data);
}

export async function UpdateConfig(
  payload: ConfigUpdateRequest,
): Promise<ConfigResponse> {
  const { data } = await api.put<ConfigApiResponse>("/configs", payload);

  return normalizeConfigResponse(data);
}
