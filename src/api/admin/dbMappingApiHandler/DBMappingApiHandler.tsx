import { useMutation } from '@tanstack/react-query';
import { PostDBMappingBaseApiHandler } from './DBMappingBaseApiHandler';

interface MappingPayload {
  endpoint: string;
  params: Record<string, string>;
}

export const usePostDBMapping = () => {
  return useMutation({
    mutationFn: ({ endpoint, params }: MappingPayload) =>
      PostDBMappingBaseApiHandler(endpoint, params),
  });
};

