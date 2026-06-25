import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { useTabStore } from '../../store/tabStore';
import { useEnvironmentStore } from '../../store/environmentStore';

export const useSendRequest = () => {
  const queryClient = useQueryClient();
  const { activeTabId, setResponse, setLoadingState } = useTabStore();
  const { activeEnvironmentId } = useEnvironmentStore();

  const sendMutation = useMutation({
    mutationFn: async () => {
      const { tabs, activeTabId } = useTabStore.getState();
      if (!activeTabId) throw new Error('No active request tab');

      const activeTab = tabs.find((t) => t.id === activeTabId);
      if (!activeTab || !activeTab.unsaved_state) {
        throw new Error('Active tab has no request state');
      }

      const state = activeTab.unsaved_state;
      
      setLoadingState(activeTabId, true);
      setResponse(activeTabId, null);

      try {
        const result = await apiService.sendRequest({
          method: state.method,
          url: state.url,
          headers: state.headers.filter(h => h.key.trim() !== ''),
          params: state.params.filter(p => p.key.trim() !== ''),
          body: state.body,
          auth: state.auth,
          environment_id: activeEnvironmentId,
        });
        
        setResponse(activeTabId, result);
        return result;
      } catch (err: any) {
        const errorResponse = {
          error: err.message || 'Request failed',
        };
        setResponse(activeTabId, errorResponse);
        throw err;
      } finally {
        setLoadingState(activeTabId, false);
      }
    },
    onSuccess: () => {
      // Invalidate history query so that the sidebar is updated immediately
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  return {
    sendRequest: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
    error: sendMutation.error,
  };
};
