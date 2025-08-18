"use client";

import React, { useState, useMemo, ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import useIndicatorStore from "@/store/map_indicatore_store/useIndicatorStore";
import useRecentIndicatorStore from "@/store/map_indicatore_store/useRecentIndicatorStore";
import { useFetchHHMLayers } from "@/api/layerApiHandler/LayerApiHandler";

// ---------- Types ----------
type RawLayerData = {
  "indicator.id": string;
  "indicator.Category": string;
  "indicator.Sub-Category": string;
  "source.id": string;
};

type Indicator = {
  indicator: string;
  sources: string[];
};

type SubCategory = {
  subCategory: string;
  indicatorsMap: Record<string, Indicator>;
  indicators?: Indicator[];
};

type CategoryGroup = {
  category: string;
  subcategories: SubCategory[];
};

// ---------- Transform Layer Data ----------
const transformData = (data: RawLayerData[] | undefined): CategoryGroup[] => {
  if (!Array.isArray(data)) return [];

  const result: CategoryGroup[] = [];

  for (const item of data) {
    const indicatorId = item["indicator.id"];
    const category = item["indicator.Category"];
    const subCategory = item["indicator.Sub-Category"];
    const sourceId = item["source.id"];

    if (!indicatorId || !category || !subCategory) continue;

    let catGroup = result.find((c) => c.category === category);
    if (!catGroup) {
      catGroup = { category, subcategories: [] };
      result.push(catGroup);
    }

    let subGroup = catGroup.subcategories.find((s) => s.subCategory === subCategory);
    if (!subGroup) {
      subGroup = { subCategory, indicatorsMap: {} };
      catGroup.subcategories.push(subGroup);
    }

    if (!subGroup.indicatorsMap[indicatorId]) {
      subGroup.indicatorsMap[indicatorId] = {
        indicator: indicatorId,
        sources: [],
      };
    }

    if (sourceId && !subGroup.indicatorsMap[indicatorId].sources.includes(sourceId)) {
      subGroup.indicatorsMap[indicatorId].sources.push(sourceId);
    }
  }

  return result.map((cat) => ({
    ...cat,
    subcategories: cat.subcategories.map((sub) => ({
      ...sub,
      indicators: Object.values(sub.indicatorsMap),
    })),
  }));
};

// ---------- Accordion Section ----------
interface AccordionProps {
  title: string;
  children: ReactNode;
  level?: 1 | 2;
}

const AccordionSection: React.FC<AccordionProps> = ({ title, children, level = 1 }) => {
  const [open, setOpen] = useState(false);

  const levelStyle: Record<number, string> = {
    1: "bg-blue-200 hover:bg-blue-300 px-4 py-2 font-semibold",
    2: "bg-blue-100 hover:bg-blue-200 px-3 py-1 font-medium ml-3 mt-2",
  };

  return (
    <div className={`rounded ${level > 1 ? "ml-2 mt-2" : "mb-2"}`}>
      <div
        className={`cursor-pointer rounded flex justify-between items-center select-none ${levelStyle[level]}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{title}</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
};

// ---------- Main Component ----------
const Indicators: React.FC = () => {
  const { selectedSources, setSelectedSources } = useIndicatorStore();
  const setRecentIndicator = useRecentIndicatorStore((state) => state.setRecentIndicator);

  const { data } = useFetchHHMLayers();
  const nestedData = useMemo(() => transformData(data), [data]);

  const toggleSource = (indicatorId: string, sourceId: string) => {
    setSelectedSources((prev) => {
      const current = prev[indicatorId] || [];
      const isAlreadySelected = current.includes(sourceId);

      const updated = isAlreadySelected
        ? current.filter((s) => s !== sourceId)
        : [...current, sourceId];

      if (!isAlreadySelected) {
        setRecentIndicator({ indicatorId, sourceId });
      }

      return {
        ...prev,
        [indicatorId]: updated,
      };
    });
  };

  const isSelected = (indicatorId: string, sourceId: string) => {
    return selectedSources[indicatorId]?.includes(sourceId);
  };

  return (
    <div className="w-full overflow-y-auto max-h-full flex-1">
      {nestedData.map((cat, catIndex) => (
        <AccordionSection key={catIndex} title={cat.category} level={1}>
          {cat.subcategories.map((sub, subIndex) => (
            <AccordionSection key={subIndex} title={sub.subCategory} level={2}>
              {sub.indicators?.map((ind, iIndex) => (
                <div
                  key={iIndex}
                  className="ml-4 mt-2 bg-sky-50 rounded px-3 py-1 text-sm"
                >
                  {ind.sources.length === 1 ? (
                    <label className="text-sky-900 font-medium flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="min-h-4 min-w-4"
                        checked={!!isSelected(ind.indicator, ind.sources[0])}
                        onChange={() =>
                          toggleSource(ind.indicator, ind.sources[0])
                        }
                      />
                      <span>
                        {ind.indicator} ({ind.sources[0]})
                      </span>
                    </label>
                  ) : (
                    <>
                      <div className="text-sky-900 font-medium">{ind.indicator}</div>
                      <div className="flex flex-col gap-1 mt-1">
                        {ind.sources.map((source, sIndex) => (
                          <label
                            key={sIndex}
                            className="flex items-center cursor-pointer font-medium"
                          >
                            <input
                              type="checkbox"
                              className="min-h-4 min-w-4"
                              checked={!!isSelected(ind.indicator, source)}
                              onChange={() =>
                                toggleSource(ind.indicator, source)
                              }
                            />
                            <span className="px-3 py-1 rounded text-sky-950">
                              {"Source : " + source}
                            </span>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </AccordionSection>
          ))}
        </AccordionSection>
      ))}
    </div>
  );
};

export default Indicators;
