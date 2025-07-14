const BASE_URL = ""
export const GetFederatedSearchBaseApiHandler = (url: string) =>
  fetch(`${BASE_URL}${url}`).then((res) => res.json())
