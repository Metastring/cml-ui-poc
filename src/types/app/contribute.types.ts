
// InitialDatasetRegistration
export interface InitialDatasetForm {
  title: string;
  description: string;
  citation: string;
  doi: string;
  language: string;
  data_language: string;
  license: string;
  publication_date: Date;
  metadata_modified_date: Date;
  registration_date: Date;
  is_active: boolean;
  keywords: string;
  dataset_type: string;
  category_id: string;
}

export interface InitialDatasetRegistrationProps {
  onNext: (data: InitialDatasetForm) => void;
  isSubmitting?: boolean;
}


//FinalDatasetRegistration
export interface KeyValue {
  key: string;
  value: string;
}

export interface Contact {
  name: string;
  role: string;
  email: string;
  organization: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface FinalDatasetForm {
  dataset_id: string;
  scopes: Record<string, string>[];
  publishers: Record<string, string>[];
  mappings: Record<string, string>[];
  metrics: Record<string, string>[];
  statistics: Record<string, string>[];
  contacts: Contact[];
}

export interface FinalDatasetRegistrationProps {
  datasetId: string | number;
  onSubmit: (data: FinalDatasetForm) => void;
  isSubmitting?: boolean;
  onBackToInitial?: () => void;
}



//dataset registration

export interface InitialDatasetResponse {
  dataset_id: string;
}
