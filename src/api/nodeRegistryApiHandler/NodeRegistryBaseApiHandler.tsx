const BASE_URL = process.env.NEXT_PUBLIC_FEDERATED_BASE_URL;

export const GetNodeRegistryBaseApiHandler = async (endpoint: string) => {
  const res = await fetch(`${BASE_URL}${endpoint}`);

  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

  return res.json();
};

export const PostNodeRegistryBaseApiHandler = async (
  endpoint: string,
  body?: unknown
) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    ...(body === undefined
      ? {}
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
  });

  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

  return res.json();
};
