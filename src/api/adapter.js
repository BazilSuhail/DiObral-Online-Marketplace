import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "./client";

export function useApiQuery(url, params, options = {}) {
  return useQuery({
    queryKey: params ? [url, params] : [url],
    queryFn: () => apiCall(url, "GET", null, { params }),
    ...options,
  });
}

export function useApiMutation(url, method = "POST", options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiCall(url, method, data),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    ...options,
  });
}
