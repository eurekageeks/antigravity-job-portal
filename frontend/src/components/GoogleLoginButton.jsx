import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { safeJson } from '../utils/api';
import { AlertTriangle, Sparkles } from 'lucide-react';

export default function GoogleLoginButton({ role, onSuccess, onError }) {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const containerRef = useRef(null);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isConfigured = clientId && clientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE';

  // Check if Google script is loaded
  useEffect(() => {
    const checkScript = () => {
      if (window.google?.accounts?.id) {
        setScriptLoaded(true);
      } else {
        setTimeout(checkScript, 100);
      }
    };
    checkScript();
  }, []);

  // Initialize and render Google Button
  useEffect(() => {
    if (!scriptLoaded || !isConfigured || !containerRef.current) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            setError('');
            const res = await fetch('/api/auth/google', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                credential: response.credential,
                role: role, // Used if registering a new user
              }),
            });

            const data = await safeJson(res);
            if (!res.ok) {
              throw new Error(data.message || 'Google authentication failed');
            }

            login(data.token, data.user);
            if (onSuccess) onSuccess(data.user);
          } catch (err) {
            setError(err.message);
            if (onError) onError(err.message);
          }
        },
      });

      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signin_with',
        shape: 'rectangular',
      });
    } catch (err) {
      console.error('Error rendering Google button:', err);
    }
  }, [scriptLoaded, isConfigured, role]);

  // Demo / Mock login for testing before configuring API keys
  const handleDemoLogin = async () => {
    try {
      setError('');
      // Simulate Google OAuth token and authenticate against backend
      // Since it's a demo mode, we can either call the backend with a mock or login with seed accounts.
      // But let's build a clean demo path:
      const name = role === 'candidate' ? 'Google Candidate Demo' : 'Google Employer Demo';
      const email = role === 'candidate' ? 'demo_candidate@gmail.com' : 'demo_employer@gmail.com';
      
      // Let's call our backend API to simulate a successful Google auth
      // For testing, we'll request a simulated mock auth if in demo mode or use a backend endpoint.
      // Wait, we can implement a custom mode or use standard fetch.
      // Let's make a request to /api/auth/google with a special credential parameter "demo-token"
      // and let the backend support "demo-token" for easy testing if GOOGLE_CLIENT_ID is not configured.
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: 'demo-token',
          role: role,
          demoEmail: email,
          demoName: name,
        }),
      });

      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(data.message || 'Demo Login failed');
      }

      login(data.token, data.user);
      if (onSuccess) onSuccess(data.user);
    } catch (err) {
      setError(err.message);
      if (onError) onError(err.message);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {error && (
        <div className="w-full mb-3 text-xs text-red-650 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {isConfigured ? (
        <div ref={containerRef} className="w-full min-h-[44px] flex justify-center" />
      ) : (
        <div className="w-full space-y-3">
          {/* Informative alert about Google Client ID configuration */}
          <div className="p-3 bg-amber-50 border border-amber-250 text-amber-800 rounded-2xl text-xs space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              Google Client ID Needed
            </div>
            <p className="text-slate-650 leading-relaxed">
              To use real Google login, please configure <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[10px]">VITE_GOOGLE_CLIENT_ID</code> in <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[10px]">.env</code> files.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-3 px-4 flex items-center justify-center gap-2 border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/20 text-slate-700 hover:text-indigo-650 font-bold rounded-xl text-sm transition-all shadow-sm group"
          >
            <Sparkles className="h-4 w-4 text-indigo-500 group-hover:animate-pulse" />
            <span>Simulate Google Sign-in ({role === 'candidate' ? 'Candidate' : 'Employer'})</span>
          </button>
        </div>
      )}
    </div>
  );
}
