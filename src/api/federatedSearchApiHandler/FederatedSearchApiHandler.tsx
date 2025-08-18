import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetFederatedSearchBaseApiHandler,
  GetFederatedSearchByPayload,
} from "./FederatedSearchBaseApiHandler";



interface Dataset {
  dataset_title: string;
}

interface Category {
  category_name: string;
  datasets?: Dataset[];
}



export interface Contact {
  name: string | null;
  role: string | null;
  email: string | null;
  organization: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

export interface Publisher {
  publisher_name: string | null;
  country: string | null;
  record_count: number | null;
}

export interface Scope {
  temporal_start_date: string | null;
  temporal_end_date: string | null;
  geographic_scope: string | null;
  taxonomic_scope: string | null;
  taxonomic_authority: string | null;
}

export interface Field {
  field_name: string | null;
  ontology_mapping: string | null;
  data_type: string | null;
}

export interface Statistic {
  stat_name: string | null;
  stat_value: string | null;
  measurement_date: string | null;
}

export interface DatasetDetail {
  category_name: string;
  dataset_title: string;
  description: string | null;
  citation: string | null;
  doi: string | null;
  language: string | null;
  data_language: string | null;
  license: string | null;
  publication_date: string | null;
  last_updated: string | null;
  registration_date: string | null;
  is_active: boolean;
  keywords: string | null;
  dataset_type: string | null;
  contacts: Contact[];
  publishers: Publisher[];
  scopes: Scope[];
  fields: Field[];
  statistics: Statistic[];
}
type DataItem = {
  // define fields for each table row here
  id: string;
  name: string;
  // ...more
};

type FederatedSearchData = {
  results?: Record<
    string,
    {
      field_results?: {
        vernacular_name_common_names?: {
          results?: DataItem[];
        };
      };
    }
  >;
};

export const useMutateFederatedSearch = () => {
  const queryClient = useQueryClient();

  const queryKey = ["federatedSearchResult"];

  const queryResult = useQuery<FederatedSearchData>({
    queryKey,
    queryFn: () => {
      const cachedData = queryClient.getQueryData<FederatedSearchData>(queryKey);
      return Promise.resolve(cachedData ?? {});
    },
    enabled: true,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: ({
      search_text,
      category,
      dataset,
      fields,
    }: {
      search_text: string;
      category: string[];
      dataset: string[];
      fields: string[];
    }) =>
      GetFederatedSearchByPayload("/federated-search", {
        search_text,
        category,
        dataset,
        fields,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
  });

  return {
    ...queryResult,
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isMutating: mutation.isPending,
  };
};

export const useGetFilterData = () => {
  const { data, error, isLoading, isFetching, refetch } = useQuery<Category[]>({
    queryKey: ["metadata"],
    queryFn: () =>
      GetFederatedSearchBaseApiHandler(`/categories-with-datasets`),
    enabled: true,
  });
  return { data, error, isLoading, isFetching, refetch };
};

export const useGetIndicatorsByCategoryAndDatasets = (
  category: string,
  datasets: string[]
) => {
  const query = new URLSearchParams({
    category,
    datasets: datasets.join(","),
  });

  return useQuery<unknown[]>({
    queryKey: ["metadata", category, datasets],
    queryFn: () =>
      GetFederatedSearchBaseApiHandler(`/api/indicators?${query.toString()}`),
    enabled: !!category && datasets.length > 0,
  });
};





export const useGetDatasetDetails = (categoryName: string, datasetTitle: string) => {
  return useQuery<DatasetDetail>({
    queryKey: ["dataset-details", categoryName, datasetTitle],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_FEDERATED_BASE_URL}/metadata?title=${datasetTitle}&category_name=${categoryName}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch dataset details");
      }
      return res.json();
    },
    enabled: Boolean(categoryName && datasetTitle),
  });
};