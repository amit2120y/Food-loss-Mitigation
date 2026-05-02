// env.js
// Runtime frontend configuration. Copy or edit this file on Vercel if needed.
// - __SOCKET_ENDPOINT__: full URL to backend for Socket.IO (use Render service URL)
// - __API_PREFIX__: prefix to prepend to API calls (leave empty to use relative '/api')

// Default values (update when deploying):
window.__SOCKET_ENDPOINT__ = 'https://annasetu-backend-uz5m.onrender.com';
window.__API_PREFIX__ = ''; // leave empty to use relative '/api/*' (recommended with Vercel rewrites)

// Note: If you host the frontend on Vercel, keep `__API_PREFIX__` empty and
// update `project/annasetu/annasetu_clients/vercel.json` `rewrites.destination`
// to point to your Render backend domain. Socket connections should point
// directly to Render (set __SOCKET_ENDPOINT__ to your Render URL).
