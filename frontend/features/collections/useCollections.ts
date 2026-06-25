import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';

export const useCollections = () => {
  const queryClient = useQueryClient();

  const collectionsQuery = useQuery({
    queryKey: ['collections'],
    queryFn: apiService.getCollections,
  });

  const createCollectionMutation = useMutation({
    mutationFn: apiService.createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });

  const updateCollectionMutation = useMutation({
    mutationFn: ({ id, name, description }: { id: string; name: string; description?: string }) => 
      apiService.updateCollection(id, { name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: apiService.deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });

  const saveRequestMutation = useMutation({
    mutationFn: ({ collectionId, data }: { collectionId: string; data: any }) => 
      apiService.saveRequest(collectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: any }) => 
      apiService.updateRequest(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: apiService.deleteRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });

  return {
    collections: collectionsQuery.data || [],
    isLoading: collectionsQuery.isLoading,
    error: collectionsQuery.error,
    refetch: collectionsQuery.refetch,

    createCollection: createCollectionMutation.mutateAsync,
    isCreating: createCollectionMutation.isPending,

    updateCollection: updateCollectionMutation.mutateAsync,
    isUpdating: updateCollectionMutation.isPending,

    deleteCollection: deleteCollectionMutation.mutateAsync,
    isDeleting: deleteCollectionMutation.isPending,

    saveRequest: saveRequestMutation.mutateAsync,
    isSavingRequest: saveRequestMutation.isPending,

    updateRequest: updateRequestMutation.mutateAsync,
    isUpdatingRequest: updateRequestMutation.isPending,

    deleteRequest: deleteRequestMutation.mutateAsync,
    isDeletingRequest: deleteRequestMutation.isPending,
  };
};
