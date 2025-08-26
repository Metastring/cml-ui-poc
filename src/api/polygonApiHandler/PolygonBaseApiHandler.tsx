
const MAP_SEARCH_BASE_URL = process.env.NEXT_PUBLIC_MAP_BASE_URL


export const GetMapSearchBaseApiHandler = (
  url: string,
  options?: RequestInit
) => fetch(`${MAP_SEARCH_BASE_URL}${url}`, options).then((res) => res.json());
