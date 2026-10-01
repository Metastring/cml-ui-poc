const BASE_URL = process.env.NEXT_PUBLIC_FEDERATED_BASE_URL;

/** FastAPI returns `{ detail: ... }` on failure — surface it instead of a generic message. */
const toErrorMessage = async (res: Response, fallback: string) => {
  try {
    const body = await res.json();
    const detail = body?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) {
      /* A 422's `loc` is ["body", "mappings", 0, "field_name"] — its tail names
         the field that failed, which the message on its own doesn't. */
      const loc = Array.isArray(detail[0].loc)
        ? detail[0].loc.slice(1).join(".")
        : "";
      return loc ? `${loc}: ${detail[0].msg}` : String(detail[0].msg);
    }
  } catch {
    /* response had no JSON body */
  }
  return `${fallback} (${res.status})`;
};

const sendJson = async (method: "POST" | "PATCH", endpoint: string, params?: object) => {
  const res = await fetch(BASE_URL + endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params ?? {}),
  });

  if (!res.ok) throw new Error(await toErrorMessage(res, "Request failed"));

  return res.json();
};

// ContributeBaseApiHandler.ts
export const PostContributeBaseApiHandler = (endpoint: string, params?: object) =>
  sendJson("POST", endpoint, params);

export const PatchContributeBaseApiHandler = (endpoint: string, params: object) =>
  sendJson("PATCH", endpoint, params);

export const GetContributeBaseApiHandler = async (endpoint: string) => {
  const res = await fetch(BASE_URL + endpoint);

  if (!res.ok) throw new Error(await toErrorMessage(res, "Request failed"));

  return res.json();
};
