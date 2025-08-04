const BASE_URL = process.env.NEXT_PUBLIC_FEDERATED_BASE_URL;


export const PostDBMappingBaseApiHandler = (
  endpoint: string,
  params: Record<string, string>
) => {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${endpoint}?${query}`;

  return fetch(url, {
    method: 'POST',
  }).then((res) => {
    if (!res.ok) throw new Error('Failed to submit');
    return res.json();
  });
};
