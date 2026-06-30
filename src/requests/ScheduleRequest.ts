import { baseUrl } from "@/EnvVariables";
import { ScheduleResourceApi, ScheduleStatus } from "@joao.sumi/qdule";

export async function CreateSchedule(
  treatmentId: number,
  clientName: string,
  clientEmail: string,
  clientNumber: string,
  startDateTime: string,
  endDateTime: string,
  status: ScheduleStatus,
) {
  const scheduleApi = new ScheduleResourceApi(undefined, baseUrl);
  const { data } = await scheduleApi.schedulesPost({
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

  return data;
}
