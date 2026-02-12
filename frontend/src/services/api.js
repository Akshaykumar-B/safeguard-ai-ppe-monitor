/**
 * API Service — SafeGuard AI Backend Communication
 * ==================================================
 * Handles all HTTP requests to the Flask backend.
 * Gracefully fails when backend is offline (frontend-only mode).
 */

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn(`API ${endpoint}:`, err.message);
        return null;
    }
}

const api = {
    // Health check
    health: () => request('/health'),

    // Workers
    getWorkers: () => request('/workers'),
    addWorker: (worker) => request('/workers', {
        method: 'POST',
        body: JSON.stringify(worker),
    }),
    deleteWorker: (id) => request(`/workers/${id}`, { method: 'DELETE' }),

    // Violations
    getViolations: () => request('/violations'),
    updateViolation: (id, data) => request(`/violations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    // Alerts
    getAlerts: () => request('/alerts'),
    markAlertRead: (id) => request(`/alerts/${id}/read`, { method: 'PUT' }),
    dismissAlert: (id) => request(`/alerts/${id}`, { method: 'DELETE' }),

    // Settings
    getSettings: () => request('/settings'),
    saveSettings: (settings) => request('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
    }),

    // Detection
    detectPPE: async (imageFile) => {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            const res = await fetch(`${BASE_URL}/detect`, {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            console.warn('PPE detection failed:', err.message);
            return null;
        }
    },

    // Live feed
    liveStreamUrl: `${BASE_URL}/live-feed`,

    // Export URLs
    exportViolationsUrl: `${BASE_URL}/export/violations`,
    exportWorkersUrl: `${BASE_URL}/export/workers`,

    // Stats
    getStats: () => request('/stats'),
    getMetrics: () => request('/metrics'),
};

export default api;
