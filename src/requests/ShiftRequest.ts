import { baseUrl } from "@/EnvVariables";
import { api } from "@/lib/api";
import {
  type DayOfWeek,
  type ShiftCreateRequest,
  type ShiftResponse,
  ShiftResourceApi,
  type ShiftStatus,
  type ShiftUpdateRequest,
} from "@joao.sumi/qdule";

const shiftApi = new ShiftResourceApi(undefined, baseUrl, api);

type ShiftListResponse =
  | ShiftResponse[]
  | {
      content?: ShiftResponse[];
      data?: ShiftResponse[] | { workShifts?: ShiftResponse[] };
      shifts?: ShiftResponse[];
      workShifts?: ShiftResponse[];
    };

function normalizeShiftList(data: ShiftListResponse): ShiftResponse[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;

  return (
    data.data?.workShifts ??
    data.workShifts ??
    data.content ??
    data.shifts ??
    []
  );
}

export default async function GetShifts(
  days?: Array<DayOfWeek>,
  status?: ShiftStatus,
): Promise<ShiftResponse[]> {
  const { data } = await shiftApi.shiftsGet({ days, status });

  return normalizeShiftList(data as ShiftListResponse);
}

export async function CreateShift(
  payload: ShiftCreateRequest,
): Promise<ShiftResponse> {
  const { data } = await shiftApi.shiftsPost({
    shiftCreateRequest: payload,
  });

  return data;
}

export async function UpdateShift(
  id: number,
  payload: ShiftUpdateRequest,
): Promise<ShiftResponse> {
  const { data } = await shiftApi.shiftsIdPut({
    id,
    shiftUpdateRequest: payload,
  });

  return data;
}

export async function GetShiftById(id: number): Promise<ShiftResponse> {
  const { data } = await shiftApi.shiftsIdGet({ id });

  return data;
}
