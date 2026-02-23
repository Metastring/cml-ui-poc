export type SearchResultItem = {
  dataset_id: number;
  dataset_title: string;
  description: string;
  category_id: number;
  category_name: string;
};

export type SearchMetadataResponse = {
  query: string;
  results: SearchResultItem[];
};
