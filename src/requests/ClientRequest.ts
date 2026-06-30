import { baseUrl } from "@/EnvVariables";
import { api } from "@/lib/api";
import { ClientResourceApi } from "@joao.sumi/qdule";

export async function CreateClient(
  name: string,
  email: string,
  cellPhone: string,
) {
  const clientApi = new ClientResourceApi(undefined, baseUrl, api);
  const { data } = await clientApi.clientsPost({
    clientCreateRequest: {
      cellPhone,
      email,
      name,
    },
  });

  return data;
}

export async function ClientById(id: number) {
  const clientApi = new ClientResourceApi(undefined, baseUrl, api);

  const { data } = await clientApi.clientsIdGet({
    id,
  });

  return data;
}