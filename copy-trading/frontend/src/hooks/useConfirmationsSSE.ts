import { useEffect, useRef, useState, useCallback } from 'react';
import { TradeConfirmation } from '@/types/alphaengine';

export type SSEConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseConfirmationsSSEOptions {
  onMessage?: (confirmation: TradeConfirmation) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: SSEConnectionStatus) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  filterByAddress?: string;
}

interface UseConfirmationsSSEReturn {
  status: SSEConnectionStatus;
  isConnected: boolean;
  error: Error | null;
  reconnect: () => void;
  disconnect: () => void;
  lastMessage: TradeConfirmation | null;
}

export function useConfirmationsSSE({
  onMessage,
  onError,
  onStatusChange,
  autoReconnect = true,
  reconnectInterval = 1000,
  maxReconnectAttempts = 5,
  filterByAddress
}: UseConfirmationsSSEOptions = {}): UseConfirmationsSSEReturn {
  const [status, setStatus] = useState<SSEConnectionStatus>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  const [lastMessage, setLastMessage] = useState<TradeConfirmation | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManuallyDisconnected = useRef(false);

  const updateStatus = useCallback((newStatus: SSEConnectionStatus) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data: TradeConfirmation = JSON.parse(event.data);
      
      // Filter by address if specified
      if (filterByAddress && 
          data.alphaConsumerAddress?.toLowerCase() !== filterByAddress.toLowerCase()) {
        return;
      }

      setLastMessage(data);
      onMessage?.(data);
    } catch (err) {
      console.error('Failed to parse SSE message:', err);
      const parseError = new Error('Failed to parse SSE message');
      setError(parseError);
      onError?.(parseError);
    }
  }, [filterByAddress, onMessage, onError]);

  // Forward declare connect function type
  const connectRef = useRef<(() => void) | null>(null);

  const handleError = useCallback((event: Event) => {
    console.error('SSE connection error:', event);
    const connectionError = new Error('SSE connection error');
    setError(connectionError);
    updateStatus('error');
    onError?.(connectionError);

    // Cleanup current connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Attempt reconnection if enabled and not manually disconnected
    if (autoReconnect && !isManuallyDisconnected.current) {
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const backoffDelay = Math.min(
          reconnectInterval * Math.pow(2, reconnectAttemptsRef.current),
          30000 // Max 30 seconds
        );

        console.log(`Reconnecting in ${backoffDelay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);

        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connectRef.current?.();
        }, backoffDelay);
      } else {
        console.error('Max reconnection attempts reached');
        updateStatus('disconnected');
      }
    }
  }, [autoReconnect, reconnectInterval, maxReconnectAttempts, onError, updateStatus]);

  const connect = useCallback(() => {
    // Clear any existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Don't connect if manually disconnected
    if (isManuallyDisconnected.current) {
      return;
    }

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    updateStatus('connecting');
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_ALPHAENGINE_API_URL || 'http://localhost:3001';
      const eventSource = new EventSource(`${apiUrl}/api/confirmations/stream`);
      
      eventSource.onopen = () => {
        console.log('SSE connection established');
        updateStatus('connected');
        reconnectAttemptsRef.current = 0;
      };

      eventSource.onmessage = handleMessage;
      eventSource.onerror = handleError;

      // Handle specific event types if needed
      eventSource.addEventListener('confirmation', handleMessage);
      
      // Handle heartbeat/ping messages
      eventSource.addEventListener('ping', () => {
        console.debug('SSE heartbeat received');
      });

      eventSourceRef.current = eventSource;
    } catch (err) {
      console.error('Failed to create EventSource:', err);
      const initError = err instanceof Error ? err : new Error('Failed to create EventSource');
      setError(initError);
      updateStatus('error');
      onError?.(initError);
    }
  }, [handleMessage, handleError, updateStatus, onError]);

  // Set the connect ref after defining connect
  connectRef.current = connect;

  const disconnect = useCallback(() => {
    isManuallyDisconnected.current = true;
    
    // Clear any reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close the EventSource
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    updateStatus('disconnected');
    setError(null);
    reconnectAttemptsRef.current = 0;
  }, [updateStatus]);

  const reconnect = useCallback(() => {
    isManuallyDisconnected.current = false;
    reconnectAttemptsRef.current = 0;
    disconnect();
    setTimeout(connect, 100); // Small delay to ensure clean reconnection
  }, [connect, disconnect]);

  // Setup and cleanup
  useEffect(() => {
    connect();

    return () => {
      isManuallyDisconnected.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]); // Connect on mount

  return {
    status,
    isConnected: status === 'connected',
    error,
    reconnect,
    disconnect,
    lastMessage
  };
}