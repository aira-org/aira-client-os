import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { getApiClient } from '../../api/apiClient';
import { ApexTasksResponseSchema } from '../../schemas';
import type { ApexTask, SubmitApexTaskRequest } from '../../schemas';
import { useIsAuthenticated } from '../../stores';

export const APEX_TASKS_QUERY_KEY = ['dashboard', 'apex-tasks'] as const;

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export class FileSizeError extends Error {
  constructor(fileType: string) {
    super(`${fileType} file exceeds ${MAX_FILE_SIZE_MB}MB limit`);
    this.name = 'FileSizeError';
  }
}

export const useApexTasks = (): UseQueryResult<ApexTask[], Error> => {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: APEX_TASKS_QUERY_KEY,
    queryFn: async (): Promise<ApexTask[]> => {
      const apiClient = getApiClient();
      return apiClient.get<ApexTask[]>('/v1/dashboard/apex-tasks', ApexTasksResponseSchema);
    },
    enabled: isAuthenticated,
    refetchOnMount: 'always',
  });
};

// Helper to check if a value is a File object (web) vs a URI reference (React Native)
const isFile = (value: unknown): value is File => {
  return typeof File !== 'undefined' && value instanceof File;
};

export const useSubmitApexTask = (): UseMutationResult<unknown, Error, SubmitApexTaskRequest> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SubmitApexTaskRequest) => {
      const formData = new FormData();

      if (request.message) {
        formData.append('message', request.message);
      }

      if (request.image) {
        if (isFile(request.image)) {
          // Web: File object
          if (request.image.size > MAX_FILE_SIZE_BYTES) {
            throw new FileSizeError('Image');
          }
          formData.append('image', request.image);
        } else {
          // React Native: URI reference
          if (request.image.uri) {
            const response = await fetch(request.image.uri);
            const blob = await response.blob();
            if (blob.size > MAX_FILE_SIZE_BYTES) {
              throw new FileSizeError('Image');
            }
          }
          formData.append('image', {
            uri: request.image.uri,
            name: request.image.name,
            type: request.image.type,
          } as unknown as Blob);
        }
      }

      if (request.audio) {
        if (isFile(request.audio)) {
          // Web: File object
          if (request.audio.size > MAX_FILE_SIZE_BYTES) {
            throw new FileSizeError('Audio');
          }
          formData.append('audio', request.audio);
        } else {
          // React Native: URI reference
          if (request.audio.uri) {
            const response = await fetch(request.audio.uri);
            const blob = await response.blob();
            if (blob.size > MAX_FILE_SIZE_BYTES) {
              throw new FileSizeError('Audio');
            }
          }
          formData.append('audio', {
            uri: request.audio.uri,
            name: request.audio.name,
            type: request.audio.type,
          } as unknown as Blob);
        }
      }

      const apiClient = getApiClient();
      return await apiClient.postFormData(`/v1/dashboard/apex-task/${request.taskId}`, formData);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: APEX_TASKS_QUERY_KEY });
    },
  });
};
