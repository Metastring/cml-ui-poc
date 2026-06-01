"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Database, MapPin, Search, Table2 } from "lucide-react";
import FederatedSearchBar from "@/app/federated_search/FederatedSearchBar";
import InstructionPopover from "@/element/popover/InstructionPopover";
import {
  useGetFilterData,
  useMutateFederatedSearch,
  useMutatePreFederatedSearch,
} from "@/api/federatedSearchApiHandler/FederatedSearchApiHandler";
import { useFederatedSearchStore } from "@/store/federated_search_store/useFederatedSearchStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PreFederatedSearchPayload } from "@/types/api/federatedSearch.types";

type DatasetDataComposition = {
  tabular: boolean;
  map?: Array<"points" | "polygons">;
};

type DatasetOverviewCard = {
  datasetKey: string;
  datasetName: string;
  resultCount: number;
  matchedFields: string[];
  matchedIndicatorLabels: string[];
  dataComposition: DatasetDataComposition;
};

function resolveSearchFields(
  matchedFields: string[],
  selected: string[]
): string[] {
  if (matchedFields.length > 0) return matchedFields;
  return selected;
}

function hasDistributionData(composition: DatasetDataComposition): boolean {
  return Boolean(composition.map?.length);
}

const OverviewPage = () => {
  const router = useRouter();
  const {
    query,
    categories,
    datasets,
    indicators: selectedIndicators,
  } = useFederatedSearchStore();
  const { data: filterData } = useGetFilterData();
  const { data: preData, mutate: mutatePre, isMutating } =
    useMutatePreFederatedSearch();
  const { mutate: mutateFederated, isMutating: isFetchingDetails } =
    useMutateFederatedSearch();
  const [expandingKey, setExpandingKey] = useState<string | null>(null);

  const searchTerm = (preData?.search_text || query).trim();
  const selected = selectedIndicators.filter(Boolean);

  const indicatorLabelByValue = useMemo(() => {
    const map = new Map<string, string>();
    filterData?.forEach((category) => {
      category.datasets?.forEach((ds) => {
        (
          (ds as { fields?: { ontology_mapping: string; ontology_mapping_to_display?: string }[] })
            .fields ?? []
        ).forEach((field) => {
          if (field.ontology_mapping) {
            map.set(
              field.ontology_mapping,
              field.ontology_mapping_to_display ?? field.ontology_mapping
            );
          }
        });
      });
    });
    return map;
  }, [filterData]);

  const datasetCards = useMemo((): DatasetOverviewCard[] => {
    if (!preData?.datasets) return [];

    return preData.datasets
      .filter((ds) => ds.available && ds.count > 0)
      .map((ds) => {
        const matchedIndicatorLabels = ds.matched_fields.map(
          (field) => indicatorLabelByValue.get(field) ?? field.replace(/_/g, " ")
        );

        const hasMap = ds.is_occurance_available;

        return {
          datasetKey: ds.dataset_name,
          datasetName: ds.display_name || ds.dataset_name,
          resultCount: ds.count,
          matchedFields: ds.matched_fields,
          matchedIndicatorLabels,
          dataComposition: {
            tabular: true,
            map: hasMap ? ["points"] : undefined,
          },
        };
      });
  }, [preData?.datasets, indicatorLabelByValue]);

  const totalResultCount = useMemo(
    () => datasetCards.reduce((sum, c) => sum + c.resultCount, 0),
    [datasetCards]
  );

  const hasOverviewData = datasetCards.length > 0;

  const buildFederatedPayload = (
    datasetList: string[],
    fields: string[]
  ): PreFederatedSearchPayload => ({
    category: categories,
    dataset: datasetList,
    search_text: searchTerm,
    fields,
  });

  const fetchFederatedAndGo = (
    payload: PreFederatedSearchPayload,
    href: string,
    loadingKey: string | null
  ) => {
    setExpandingKey(loadingKey);
    mutateFederated(payload, {
      onSuccess: () => {
        setExpandingKey(null);
        router.push(href);
      },
      onError: () => {
        setExpandingKey(null);
        toast.error("Failed to load records. Please try again.");
      },
    });
  };

  const handleExpandRecords = (item: DatasetOverviewCard) => {
    const fields = resolveSearchFields(item.matchedFields, selected);
    if (!fields.length) {
      toast.error("No indicator fields available for this dataset.");
      return;
    }
    const params = new URLSearchParams({ table: "1", dataset: item.datasetKey });
    fetchFederatedAndGo(
      buildFederatedPayload([item.datasetKey], fields),
      `/federated_search?${params.toString()}`,
      item.datasetKey
    );
  };

  const handleExpandDistribution = (item: DatasetOverviewCard) => {
    const fields = resolveSearchFields(item.matchedFields, selected);
    if (!fields.length) {
      toast.error("No indicator fields available for this dataset.");
      return;
    }
    const params = new URLSearchParams({
      table: "1",
      dataset: item.datasetKey,
      map: "1",
    });
    fetchFederatedAndGo(
      buildFederatedPayload([item.datasetKey], fields),
      `/federated_search?${params.toString()}`,
      `${item.datasetKey}-map`
    );
  };

  useEffect(() => {
    if (preData?.datasets?.length) return;
    if (!categories.length || !datasets.length || !query.trim()) return;

    mutatePre({
      category: categories,
      dataset: datasets,
      search_text: query.trim(),
      fields: selected.length > 0 ? selected : [],
    });
  }, [
    preData?.datasets?.length,
    categories,
    datasets,
    query,
    selected,
    mutatePre,
  ]);

  useEffect(() => {
    if (isMutating) return;
    if (!hasOverviewData) router.replace("/federated_search");
  }, [hasOverviewData, isMutating, router]);

  if (isMutating && !hasOverviewData) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading overview…
      </div>
    );
  }

  if (!hasOverviewData) return null;

  return (
    <div className="h-screen flex">
      <div className="w-[350px] shrink-0 border-r border-border bg-card flex flex-col min-h-0 overflow-hidden">
        <header className="shrink-0 border-b border-border bg-muted/20 px-3 py-2.5">
          <InstructionPopover title="Explore Datasets" icon={<Search className="h-4 w-4" />}>
            <p>
              Explore Datasets queries multiple remote databases and returns
              unified results in a single view.
            </p>
          </InstructionPopover>
        </header>
        <FederatedSearchBar mutate={mutateFederated} />
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="shrink-0 border-b border-border border-l-4 border-l-primary bg-primary/5 flex flex-wrap items-center gap-3 px-4 py-3">
          <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
            <Link href="/federated_search">← Back to search</Link>
          </Button>
          <span className="text-sm text-foreground">
            Results for{" "}
            <span className="font-semibold text-primary">
              &quot;{searchTerm || "—"}&quot;
            </span>
            {" · "}
            <strong>{totalResultCount.toLocaleString()}</strong> records
          </span>
        </header>

        <div className="flex-1 overflow-auto bg-muted/20 p-4">
          <div className="mx-auto max-w-6xl space-y-3">
            <p className="text-sm text-muted-foreground px-1">
              <span className="font-medium text-primary">
                &quot;{searchTerm || "—"}&quot;
              </span>{" "}
              — {totalResultCount} matches across {datasetCards.length} datasets.
            </p>

            <ul className="grid gap-3 sm:grid-cols-2">
              {datasetCards.map((item) => (
                <li key={item.datasetKey}>
                  <article className="rounded-lg border border-border bg-card p-4 shadow-sm flex flex-col gap-2.5 h-full">
                    <div className="flex gap-2 min-w-0">
                      <Database className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                      <h3 className="text-base font-semibold text-foreground leading-snug line-clamp-2 min-w-0">
                        {item.datasetName}
                      </h3>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Total records found{" "}
                      <strong className="font-semibold text-foreground tabular-nums">
                        {item.resultCount.toLocaleString()}
                      </strong>
                    </p>

                    {item.matchedIndicatorLabels.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.matchedIndicatorLabels.map((indicator) => (
                          <span
                            key={indicator}
                            className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/15"
                          >
                            {indicator}
                          </span>
                        ))}
                      </div>
                    )}

                    <div
                      className={`flex gap-1.5 mt-auto pt-1 ${
                        hasDistributionData(item.dataComposition)
                          ? "flex-col sm:flex-row"
                          : ""
                      }`}
                    >
                      {item.dataComposition.tabular && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5 text-sm"
                          disabled={isFetchingDetails}
                          onClick={() => handleExpandRecords(item)}
                          aria-label={`Expand tabular records for ${item.datasetName}`}
                        >
                          <Table2 className="h-4 w-4 shrink-0" />
                          {expandingKey === item.datasetKey
                            ? "Loading…"
                            : "Expand records"}
                        </Button>
                      )}
                      {hasDistributionData(item.dataComposition) && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5 text-sm"
                          disabled={isFetchingDetails}
                          onClick={() => handleExpandDistribution(item)}
                          aria-label={`Expand distribution map for ${item.datasetName}`}
                        >
                          <MapPin className="h-4 w-4 shrink-0" />
                          {expandingKey === `${item.datasetKey}-map`
                            ? "Loading…"
                            : "Expand distribution"}
                        </Button>
                      )}
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
