import { baseUrl } from "@/EnvVariables";
import {
  TreatmentResourceApi,
  type TreatmentResourceApiTreatmentsGetRequest,
} from "@joao.sumi/qdule";

export default async function TreatmentFilter(
  request: TreatmentResourceApiTreatmentsGetRequest,
) {
  const treatmentApi = new TreatmentResourceApi(undefined, baseUrl);

  const { data } = await treatmentApi.treatmentsGet({
    page: request.page,
    size: request.size,
    type: request.type,
    text: request.text,
  });
  return data;
}
