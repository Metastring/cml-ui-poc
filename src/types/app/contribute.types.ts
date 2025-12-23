/* =========================================================
   INITIAL DATASET REGISTRATION (STEP 1)
   ========================================================= */

export interface Category {
  category_id: number;
  category_name: string;
}

export interface Scope {
  temporal_start_date: Date;
  temporal_end_date: Date;
  geographic_scope: string;
  taxonomic_scope: string;
  taxonomic_authority: string;
}

export interface Publisher {
  publisher_name: string;
  record_count: number;
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

export interface Source {
  source_name: string;
  base_url: string;
  description: string;
}

export interface Statistic {
  stat_name: string;
  stat_value: string;
  measurement_date: Date;
}

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

  scopes: Scope[];
  publishers: Publisher[];
  contacts: Contact[];
  sources: Source[];
  statistics: Statistic[];
}

/* =========================================================
   INITIAL DATASET SUBMIT PAYLOAD (STEP 1 → API)
   ========================================================= */

export interface InitialDatasetSubmitPayload {
  category: {
    category_id: string;
    category_name: string;
  };

  title: string;
  description: string;
  citation: string;
  doi: string;
  language: string;
  data_language: string;
  license: string;
  dataset_type: string;

  is_active: boolean;
  keywords: string;

  publishers: {
    publisher_name: string;
    record_count: string | number;
  }[];

  contacts: Contact[];
  sources: Source[];
  statistics: {
    stat_name: string;
    stat_value: string;
  }[];
}

export interface InitialDatasetRegistrationProps {
  onNext: (payload: InitialDatasetSubmitPayload) => void;
  isSubmitting?: boolean;
}


/* =========================================================
   FINAL DATASET REGISTRATION (STEP 2)
   ========================================================= */

/**
 * Payload sent to /dataset-mapping-update
 * (matches your FinalDatasetRegistration component exactly)
 */
export interface FinalDatasetForm {
  dataset_id: string;
  mappings: {
    field_name: string;
    ontology_mapping: string;
  }[];
}

export interface FinalDatasetRegistrationProps {
  datasetId: string | number;
  onSubmit: (data: FinalDatasetForm) => void;
  isSubmitting?: boolean;
  onBackToInitial?: () => void;
}

/* =========================================================
   DATASET REGISTRATION RESPONSE
   ========================================================= */

export interface InitialDatasetResponse {
  dataset_id: string;
}
