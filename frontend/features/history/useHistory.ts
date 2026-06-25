import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';

export const useHistory = (page = 1, limit = 50) => {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ['history', page, limit],
    queryFn: () => apiService.getHistory(page, limit),
  });

  const deleteEntryMutation = useMutation({
    mutationFn: apiService.deleteHistoryEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: apiService.clearHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  return {
    history: historyQuery.data || [],
    isLoading: historyQuery.isLoading,
    error: historyQuery.error,
    refetch: historyQuery.refetch,

    deleteEntry: deleteEntryMutation.mutateAsync,
    isDeletingEntry: deleteEntryMutation.isPending,

    clearHistory: clearHistoryMutation.mutateAsync,
    isClearing: clearHistoryMutation.isPending,
  };
};
