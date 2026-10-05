import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { postSmartSearch } from "./SmartSearchBaseApiHandler";
import {
  SmartSearchPayload,
  SmartSearchResponse,
} from "@/types/api/smartSearch.types";

export const useMutateSmartSearch = () => {
  const mutation = useMutation<SmartSearchResponse, Error, SmartSearchPayload>({
    mutationKey: ["smartSearch"],
    mutationFn: (payload) => postSmartSearch(payload),
    retry: false,
    onError: (error) => {
      toast.error(error.message || "Smart search failed. Please try again.");
    },
  });

  return {
    data: mutation.data,
    error: mutation.error,
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isMutating: mutation.isPending,
    isError: mutation.isError,
    reset: mutation.reset,
  };
};
