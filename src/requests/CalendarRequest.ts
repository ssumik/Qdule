import { baseUrl } from "@/EnvVariables";
import { CalendarResourceApi, type CalendarListResponse } from "@joao.sumi/qdule";

export async function AvaliableSchedules(
  treatmentId: number,
  year: number,
  month: number,
): Promise<CalendarListResponse> {
  const calendarApi = new CalendarResourceApi(undefined, baseUrl);
  const { data } = await calendarApi.calendarYearMonthAvailableGet({
    year,
    month,
    treatmentId,
  });

  return data;
}
