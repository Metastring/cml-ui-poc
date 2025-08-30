"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";

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

interface FinalDatasetRegistrationProps {
  datasetId: string | number;
  onSubmit: (data: FinalDatasetForm) => void;
  isSubmitting?: boolean;
  onBackToInitial?: () => void;
}

const FinalDatasetRegistration: React.FC<FinalDatasetRegistrationProps> = ({
  datasetId,
  onSubmit,
  isSubmitting = false,
  onBackToInitial,
}) => {
  // const initialState: KeyValue[][] = [[]];
  const [scopes, setScopes] = useState<Record<string, string>[]>([]);
  const [statistics, setStatistics] = useState<Record<string, string>[]>([]);

  // const [publishers, setPublishers] = useState<[]>([]);
  // const [mappings, setMappings] = useState<[]>([]);
  // const [metrics, setMetrics] = useState<[]>([]);

  const [publisher, setPublisher] = useState<string>("");

  const [contacts, setContacts] = useState<Contact[]>([
    {
      name: "",
      role: "",
      email: "",
      organization: "",
      address: "",
      city: "",
      state: "",
      country: "",
    },
  ]);

  const fields = [
    {
      id: "scopes",
      label: "Scopes",
      value: scopes,
      setter: setScopes,
      singleBox: true,
    },
    {
      id: "statistics",
      label: "Statistics",
      value: statistics,
      setter: setStatistics,
    },
    // { id: "publishers", label: "Publishers", value: publishers, setter: setPublishers },
    // { id: "mappings", label: "Mappings", value: mappings, setter: setMappings },
    // { id: "metrics", label: "Metrics", value: metrics, setter: setMetrics },
  ];

  useEffect(() => {
    if (!String(datasetId ?? "").trim()) {
      toast.error("Invalid dataset ID! Complete initial registration first.");
      onBackToInitial?.();
    }
  }, [datasetId, onBackToInitial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dsIdStr = String(datasetId ?? "").trim();
    if (!dsIdStr)
      return toast.error("Cannot submit final dataset. Invalid dataset ID.");
    onSubmit({
      dataset_id: String(dsIdStr),
      scopes,
      publishers: publisher ? [{ publisher_name: publisher , record_count:""}] : [],
      mappings: [],
      metrics: [],
      statistics,
      contacts,
    });
  };

  // Contacts handlers
  const handleContactChange = (
    index: number,
    field: keyof Contact,
    value: string
  ) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  const addContact = () => {
    const lastContact = contacts[contacts.length - 1];

    // 🔑 check if at least one field is filled
    const isAnyFieldFilled = Object.values(lastContact).some(
      (value) => value && value.trim() !== ""
    );

    if (!isAnyFieldFilled) {
      toast.error("Please fill in the existing Publisher contact.");
      return;
    }

    setContacts([
      ...contacts,
      {
        name: "",
        role: "",
        email: "",
        organization: "",
        address: "",
        city: "",
        state: "",
        country: "",
      },
    ]);
  };

  const removeContact = (index: number) => {
    const newContacts = contacts.filter((_, i) => i !== index);
    setContacts(newContacts);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl w-full mx-auto p-6 bg-white shadow-md rounded-lg h-[80vh] overflow-y-auto"
    >
      <div className="flex flex-wrap gap-x-4 gap-y-3">
        {fields.map(({ id, label, value, setter, singleBox }) => (
          <div key={id} className="w-full sm:w-[48%]  flex-col hidden">
            <Label className="text-sm font-medium text-gray-700 mb-1">
              {label}
            </Label>

            {value.map((obj, objIndex) => (
              <div
                key={objIndex}
                className="border p-2 mb-3 rounded bg-gray-50 flex flex-col gap-2"
              >
                <div className="flex gap-2">
                  <Input
                    placeholder="Key"
                    id={`${id}-key-${objIndex}`}
                    className="w-1/2 bg-white"
                  />
                  <Input
                    placeholder="Value"
                    id={`${id}-value-${objIndex}`}
                    className="w-1/2 bg-white"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const keyEl = document.getElementById(
                        `${id}-key-${objIndex}`
                      ) as HTMLInputElement;
                      const valEl = document.getElementById(
                        `${id}-value-${objIndex}`
                      ) as HTMLInputElement;

                      if (!keyEl.value.trim() || !valEl.value.trim()) {
                        toast.error("Both key and value are required.");
                        return;
                      }

                      const newArr = [...value];
                      newArr[objIndex] = {
                        ...newArr[objIndex],
                        [keyEl.value.trim()]: valEl.value.trim(),
                      };
                      setter(newArr);

                      keyEl.value = "";
                      valEl.value = "";
                    }}
                  >
                    Add
                  </Button>
                </div>

                {/* Show added key/values */}
                {Object.entries(obj).map(([k, v], i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-1 bg-white rounded"
                  >
                    <span className="font-medium w-1/2">{k}</span>
                    <span className="w-1/2">{v}</span>
                    <X
                      className="w-4 h-4 text-red-500 hover:text-red-700 cursor-pointer"
                      onClick={() => {
                        const newArr = [...value];
                        delete newArr[objIndex][k]; // remove the key
                        newArr[objIndex] =
                          Object.keys(newArr[objIndex]).length === 0
                            ? {}
                            : newArr[objIndex];
                        setter(newArr);
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}

            {/* For statistics allow multiple objects, but for scopes only one */}
            {!singleBox && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const lastObj = value[value.length - 1];
                  const isEmpty =
                    Object.keys(lastObj).length === 0 ||
                    Object.values(lastObj).every((v) => !v?.trim());

                  if (isEmpty) {
                    toast.error(
                      `Please fill in the previous ${label.slice(
                        0,
                        -1
                      )} before adding a new one.`
                    );
                    return;
                  }

                  setter([...value, {}]);
                }}
              >
                + Add Another {label.slice(0, -1)}
              </Button>
            )}
          </div>
        ))}

        {/* Contacts Section */}
        <div className="w-full flex flex-col">
          <Label className="text-sm font-medium text-gray-700 mb-1">
            Publisher
          </Label>
          <Input
            placeholder="Name"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
          />
        </div>
        <div className="w-full flex flex-col">
          <Label className="text-sm font-medium text-gray-700 mb-1">
            Publisher Contacts
          </Label>

          {contacts.map((contact, index) => (
            <div
              key={index}
              className="border p-2 mb-3 rounded bg-gray-50 flex flex-col gap-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  placeholder="Name"
                  value={contact.name}
                  onChange={(e) =>
                    handleContactChange(index, "name", e.target.value)
                  }
                  className="bg-white"
                />
                <Input
                  placeholder="Role"
                  value={contact.role}
                  onChange={(e) =>
                    handleContactChange(index, "role", e.target.value)
                  }
                  className="bg-white"
                />
                <Input
                  placeholder="Email"
                  value={contact.email}
                  onChange={(e) =>
                    handleContactChange(index, "email", e.target.value)
                  }
                  className="bg-white"
                />
                <Input
                  placeholder="Organization"
                  value={contact.organization}
                  onChange={(e) =>
                    handleContactChange(index, "organization", e.target.value)
                  }
                  className="bg-white"
                />
                <Input
                  placeholder="Address"
                  value={contact.address}
                  onChange={(e) =>
                    handleContactChange(index, "address", e.target.value)
                  }
                  className="bg-white"
                />
                <Input
                  placeholder="City"
                  value={contact.city}
                  onChange={(e) =>
                    handleContactChange(index, "city", e.target.value)
                  }
                  className="bg-white"
                />
                <Input
                  placeholder="State"
                  value={contact.state}
                  onChange={(e) =>
                    handleContactChange(index, "state", e.target.value)
                  }
                  className="bg-white"
                />
                <Input
                  placeholder="Country"
                  value={contact.country}
                  onChange={(e) =>
                    handleContactChange(index, "country", e.target.value)
                  }
                  className="bg-white"
                />
              </div>
              <div className="flex justify-end mt-2 gap-2">
                {contacts.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeContact(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addContact}
          >
            + Add Contact
          </Button>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-4">
        {onBackToInitial && (
          <Button type="button" variant="outline" onClick={onBackToInitial}>
            Back to Initial
          </Button>
        )}
        <Button
          type="submit"
          className="w-full sm:w-1/3"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Dataset"}
        </Button>
      </div>
    </form>
  );
};

export default FinalDatasetRegistration;
