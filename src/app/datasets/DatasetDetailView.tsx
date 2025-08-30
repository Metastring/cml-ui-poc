"use client";

import { useGetDatasetDetails } from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import React from "react";



const DatasetDetailView = ({
  categoryName,
  datasetTitle,
}: {
  categoryName: string;
  datasetTitle: string;
}) => {
  const {
    data: details,
    isLoading,
    error,
  } = useGetDatasetDetails(categoryName, datasetTitle);

  const renderValue = (value: string | number | boolean | null) => {
    if (value === null) return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  if (isLoading) return <div>Loading dataset details...</div>;
  if (error)
    return <div className="text-red-500">Error: Something went wrong</div>;
  if (!details)
    return <div className="italic">No data found for this dataset.</div>;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div>
          <strong>Category Name:</strong> {renderValue(details.category_name)}
        </div>
        <div>
          <strong>Dataset Title:</strong> {renderValue(details.dataset_title)}
        </div>
        <div>
          <strong>Description:</strong> {renderValue(details.description)}
        </div>
        <div>
          <strong>Citation:</strong> {renderValue(details.citation)}
        </div>
        <div>
          <strong>DOI:</strong> {renderValue(details.doi)}
        </div>
        <div>
          <strong>Language:</strong> {renderValue(details.language)}
        </div>
        <div>
          <strong>Data Language:</strong> {renderValue(details.data_language)}
        </div>
        <div>
          <strong>License:</strong> {renderValue(details.license)}
        </div>
        <div>
          <strong>Publication Date:</strong>{" "}
          {renderValue(details.publication_date)}
        </div>
        <div>
          <strong>Last Updated:</strong> {renderValue(details.last_updated)}
        </div>
        <div>
          <strong>Registration Date:</strong>{" "}
          {renderValue(details.registration_date)}
        </div>
        <div>
          <strong>Is Active:</strong> {renderValue(details.is_active)}
        </div>
        <div>
          <strong>Keywords:</strong> {renderValue(details.keywords)}
        </div>
        <div>
          <strong>Dataset Type:</strong> {renderValue(details.dataset_type)}
        </div>
      </div>

      <div>
        <strong>Contacts:</strong>
        {details.contacts.length ? (
          details.contacts.map((c, i) => (
            <div key={i} className="ml-4">
              Name: {renderValue(c.name)}, Role: {renderValue(c.role)}, Email:{" "}
              {renderValue(c.email)}, Organization:{" "}
              {renderValue(c.organization)}, Address: {renderValue(c.address)},
              City: {renderValue(c.city)}, State: {renderValue(c.state)},
              Country: {renderValue(c.country)}
            </div>
          ))
        ) : (
          <div className="ml-4">N/A</div>
        )}
      </div>

      <div>
        <strong>Publishers:</strong>
        {details.publishers.length ? (
          details.publishers.map((p, i) => (
            <div key={i} className="ml-4">
              Publisher Name: {renderValue(p.publisher_name)}, Country:{" "}
              {renderValue(p.country)}, Record Count:{" "}
              {renderValue(p.record_count)}
            </div>
          ))
        ) : (
          <div className="ml-4">N/A</div>
        )}
      </div>

      <div>
        <strong>Scopes:</strong>
        {details.scopes.length ? (
          details.scopes.map((s, i) => (
            <div key={i} className="ml-4">
              Temporal Start Date: {renderValue(s.temporal_start_date)},
              Temporal End Date: {renderValue(s.temporal_end_date)}, Geographic
              Scope: {renderValue(s.geographic_scope)}, Taxonomic Scope:{" "}
              {renderValue(s.taxonomic_scope)}, Taxonomic Authority:{" "}
              {renderValue(s.taxonomic_authority)}
            </div>
          ))
        ) : (
          <div className="ml-4">N/A</div>
        )}
      </div>

      <div>
        <strong>Fields:</strong>
        {details.fields.length ? (
          details.fields.map((f, i) => (
            <div key={i} className="ml-4">
              Field Name: {renderValue(f.field_name)},{" "}
               {/* Ontology Mapping:{" "}{renderValue(f.ontology_mapping)}, */}
               Data Type:{" "}{renderValue(f.data_type)}
            </div>
          ))
        ) : (
          <div className="ml-4">N/A</div>
        )}
      </div>

      <div>
        <strong>Statistics:</strong>
        {details.statistics.length ? (
          details.statistics.map((st, i) => (
            <div key={i} className="ml-4">
               {renderValue(st.stat_name ?? "Stat Name")}{" : "}{renderValue(st.stat_value)}, Measurement Date:{" "}
              {renderValue(st.measurement_date)}
            </div>
          ))
        ) : (
          <div className="ml-4">N/A</div>
        )}
      </div>
    </div>
  );
};

export default DatasetDetailView;
