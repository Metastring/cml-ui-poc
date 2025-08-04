const BASE_URL = process.env.NEXT_PUBLIC_FEDERATED_BASE_URL

export const GetFederatedSearchByPayload = (url: string, payload: unknown) =>
  fetch(`${BASE_URL}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).then((res) => res.json());


export const GetFederatedSearchBaseApiHandler = (url: string) =>
  fetch(`${BASE_URL}${url}`).then((res) => res.json())
