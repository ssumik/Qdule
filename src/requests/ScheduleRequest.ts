import { baseUrl } from "@/EnvVariables";
import { ScheduleResourceApi, ScheduleStatus } from "@joao.sumi/qdule";
import { CreateClient } from "./ClientRequest";

export async function CreateSchedule(
  treatmentId: number,
  clientName: string,
  clientEmail: string,
  clientNumber: string,
  startDateTime: string,
  endDateTime: string,
  status: ScheduleStatus,
) {
  const client = await CreateClient(clientName, clientEmail, clientNumber);

  const scheduleApi = new ScheduleResourceApi(undefined, baseUrl);
  const { data } = await scheduleApi.schedulesPost({
    scheduleCreateRequest: {
      treatmentId,
      clientId: client.id,
      startDateTime,
      endDateTime,
      reason: "",
      status,
    },
  });

  return data;
}
