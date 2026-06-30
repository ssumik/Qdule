import { baseUrl } from "@/EnvVariables";
import { api } from "@/lib/api";
import {
  EmailResourceApi,
  EmailType,
  ScheduleResourceApi,
  ScheduleStatus,
  type PageResponse,
  type ScheduleResponse,
  type ScheduleUpdateRequest,
} from "@joao.sumi/qdule";

const publicScheduleApi = new ScheduleResourceApi(undefined, baseUrl);
const authenticatedScheduleApi = new ScheduleResourceApi(
  undefined,
  baseUrl,
  api,
);
const emailResourceApi = new EmailResourceApi(undefined, baseUrl, api);

function normalizeScheduleList(data: PageResponse): ScheduleResponse[] {
  return (data.content ?? []) as ScheduleResponse[];
}

export async function CreateSchedule(
  treatmentId: number,
  clientName: string,
  clientEmail: string,
  clientNumber: string,
  startDateTime: string,
  endDateTime: string,
  status: ScheduleStatus,
) {
  const { data } = await publicScheduleApi.schedulesPost({
    scheduleCreateRequest: {
      treatmentId,
      client: {
        name: clientName,
        email: clientEmail,
        cellPhone: clientNumber,
      },
      startDateTime,
      endDateTime,
      reason: "",
      status,
    },
  });

  await emailResourceApi.sendPost({
    emailSendRequest: {
      clientId: data.clientId,
      emailType: EmailType.ScheduleCreated,
      scheduleId: data.id,
    },
  });

  return data;
}

export async function GetSchedules(params?: {
  page?: number;
  size?: number;
  start?: string;
  end?: string;
  status?: ScheduleStatus;
}): Promise<ScheduleResponse[]> {
  const { data } = await authenticatedScheduleApi.schedulesGet({
    page: params?.page ?? 1,
    size: params?.size ?? 500,
    start: params?.start,
    end: params?.end,
    status: params?.status,
  });

  return normalizeScheduleList(data);
}

export async function CancelSchedule(
  id: number,
  scheduleUpdateRequest: ScheduleUpdateRequest,
): Promise<ScheduleResponse> {
  const { data } = await authenticatedScheduleApi.schedulesIdPut({
    id: id,
    scheduleUpdateRequest: {
      startDateTime: scheduleUpdateRequest.startDateTime,
      endDateTime: scheduleUpdateRequest.endDateTime,
      reason: scheduleUpdateRequest.reason ?? "",
      status: ScheduleStatus.Canceled,
    },
  });

  await emailResourceApi.sendPost({
    emailSendRequest: {
      clientId: data.clientId,
      emailType: EmailType.ScheduleCanceled,
      scheduleId: data.id,
    },
  });

  return data;
}
