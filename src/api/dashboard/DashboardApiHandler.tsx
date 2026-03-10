import { useQuery } from "@tanstack/react-query";
import { GetDashboardBaseApiHandler } from "./DashboardBaseApiHandler";
import type { PlatformStatistics } from "../../types/api/dashboard.types";

export const useGetPlatformStatistics = () => {
  return useQuery<PlatformStatistics>({
    queryKey: ["platform-statistics"],
    queryFn: () => GetDashboardBaseApiHandler("/platform-statistics"),
    staleTime: 1000 * 60 * 5,
  });
};

