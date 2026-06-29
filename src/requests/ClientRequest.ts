import { baseUrl } from "@/EnvVariables";
import { ClientResourceApi } from "@joao.sumi/qdule";

export async function CreateClient(
  name: string,
  email: string,
  cellPhone: string,
) {
  const clientApi = new ClientResourceApi(undefined, baseUrl);
  const { data } = await clientApi.clientsPost({
    clientCreateRequest: {
      cellPhone,
      email,
      name,
    },
  });

  return data;
}
