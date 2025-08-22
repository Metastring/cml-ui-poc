import { useMutation } from '@tanstack/react-query';
import { PostContributeBaseApiHandler } from './ContributeBaseApiHandler';

interface MappingPayload {
  endpoint: string;
  params: Record<string, string>;
}

export const usePostDBMapping = () => {
  return useMutation({
    mutationFn: ({ endpoint, params }: MappingPayload) =>
      PostContributeBaseApiHandler(endpoint, params),
  });
};

