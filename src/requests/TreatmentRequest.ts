import { baseUrl } from "@/EnvVariables";
import { TreatmentResourceApi, TreatmentType } from "@joao.sumi/qdule";

export default async function TreatmentFilter(
  page: number,
  size: number,
  text?: string,
  type?: TreatmentType,
) {
  const treatmentApi = new TreatmentResourceApi(undefined, baseUrl);

  const { data } = await treatmentApi.treatmentsGet({
    page,
    size,
    type,
    text,
  });
  return data;
}
