const BASE_URL = process.env.NEXT_PUBLIC_FEDERATED_BASE_URL

export const GetFederatedSearchBaseApiHandler = (url: string) =>
  fetch(`${BASE_URL}${url}`).then((res) => res.json())
