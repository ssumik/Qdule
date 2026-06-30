import { baseUrl } from "@/EnvVariables";
import { api } from "@/lib/api";
import {
  ScheduleExceptionResourceApi,
  type PageResponse,
  type ScheduleExceptionCreateRequest,
  type ScheduleExceptionResponse,
  type ScheduleExceptionUpdateRequest,
} from "@joao.sumi/qdule";

export type ScheduleExceptionPayload = ScheduleExceptionCreateRequest;
export type { ScheduleExceptionResponse };

const scheduleExceptionApi = new ScheduleExceptionResourceApi(
  undefined,
  baseUrl,
  api,
);

function normalizeScheduleExceptionList(
  data: PageResponse,
): ScheduleExceptionResponse[] {
  return (data.content ?? []) as ScheduleExceptionResponse[];
}

export async function GetScheduleExceptions(params?: {
  page?: number;
  size?: number;
}): Promise<ScheduleExceptionResponse[]> {
  const { data } = await scheduleExceptionApi.scheduleExceptionsGet({
    page: params?.page ?? 1,
    size: params?.size ?? 100,
  });

  return normalizeScheduleExceptionList(data);
}

export async function CreateScheduleException(
  payload: ScheduleExceptionCreateRequest,
): Promise<ScheduleExceptionResponse> {
  const { data } = await scheduleExceptionApi.scheduleExceptionsPost({
    scheduleExceptionCreateRequest: payload,
  });

  return data;
}

export async function UpdateScheduleException(
  id: number,
  payload: ScheduleExceptionUpdateRequest,
): Promise<ScheduleExceptionResponse> {
  const { data } = await scheduleExceptionApi.scheduleExceptionsIdPut({
    id,
    scheduleExceptionUpdateRequest: payload,
  });

  return data;
}

export async function DeleteScheduleException(id: number): Promise<void> {
  await scheduleExceptionApi.scheduleExceptionsIdDelete({ id });
}
