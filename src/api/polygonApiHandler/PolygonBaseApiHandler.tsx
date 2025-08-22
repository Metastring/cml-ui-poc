
const MAP_SEARCH_BASE_URL = process.env.NEXT_PUBLIC_MAP_BASE_URL

export const GetMapSearchBaseApiHandler = (url: string) =>
  fetch(`${MAP_SEARCH_BASE_URL}${url}`).then((res) => res.json())


