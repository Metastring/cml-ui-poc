import { ReactNode } from "react";


//MetadataPage.tsx
export interface AccordionProps {
  label?: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}


//DatasetDetailView.tsx

export interface DatasetDetailViewProps {
    categoryName: string;
  datasetTitle: string;
}

