const BASE_URL = process.env.NEXT_PUBLIC_FEDERATED_BASE_URL;


// ContributeBaseApiHandler.ts
export const PostContributeBaseApiHandler = async (endpoint: string, params: object) => {
  const res = await fetch(BASE_URL+endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params), // send all payload as body
  });

  if (!res.ok) throw new Error("Failed to submit data");

  return res.json();
};
