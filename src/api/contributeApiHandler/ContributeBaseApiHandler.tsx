const BASE_URL = process.env.NEXT_PUBLIC_FEDERATED_BASE_URL;

// ContributeBaseApiHandler.ts
export const PostContributeBaseApiHandler = async (endpoint: string, params: object) => {
  const res = await fetch(BASE_URL + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params), // send all payload as body
  });

  if (!res.ok) throw new Error("Failed to submit data");

  return res.json();
};

/** POST to /dataset-registry with file + dataset_description (multipart/form-data) */
export const PostDatasetRegistryWithFile = async (
  file: File,
  datasetDescription: string
): Promise<{ dataset_id: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("dataset_description", datasetDescription);

  const res = await fetch(BASE_URL + "/dataset-registry", {
    method: "POST",
    body: formData,
    // Do not set Content-Type; browser sets multipart/form-data with boundary
  });

  if (!res.ok) throw new Error("Failed to submit file");

  return res.json();
};
