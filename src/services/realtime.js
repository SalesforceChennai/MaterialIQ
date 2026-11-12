/**
 * MaterialIQ Real-Time Service
 * Architecture prepared for:
 * React Frontend -> WebSocket / SSE -> FastAPI -> Neo4j
 * Currently operates on frontend event bus & storage listeners.
 */

class RealtimeService {
  constructor() {
    this.listeners = new Set();
    this.wsConnection = null;
    this.sseConnection = null;

    if (typeof window !== 'undefined') {
      window.addEventListener('materialiq_storage_updated', (e) => {
        this.notify({ type: 'GRAPH_UPDATE', payload: e?.detail });
      });
      window.addEventListener('materialiq_realtime_event', (e) => {
        if (e.detail) {
          this.notify(e.detail);
        }
      });
    }
  }

  /**
   * Subscribe to real-time events (graph changes, new events, trace updates)
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all local subscribers
   */
  notify(event) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Realtime listener error:', err);
      }
    });
  }

  /**
   * Broadcast an event when new entity or event is created
   */
  emitEvent(eventType, payload) {
    const eventObj = { type: eventType, payload, timestamp: new Date().toISOString() };
    this.notify(eventObj);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('materialiq_realtime_event', { detail: eventObj })
      );
    }
  }

  /**
   * Placeholder hook for future FastAPI WebSocket connection:
   * ws://localhost:8000/ws/graph
   */
  connectWebSocket(url = 'ws://localhost:8000/ws/genealogy') {
    console.info('[Realtime] WebSocket connection endpoint prepared for FastAPI:', url);
  }

  /**
   * Placeholder hook for future Server-Sent Events:
   * http://localhost:8000/api/v1/events/stream
   */
  connectSSE(url = 'http://localhost:8000/api/v1/events/stream') {
    console.info('[Realtime] SSE stream endpoint prepared for FastAPI:', url);
  }
}

export const realtime = new RealtimeService();
