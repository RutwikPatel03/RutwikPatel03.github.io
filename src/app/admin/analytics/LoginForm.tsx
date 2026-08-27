'use client';

import { useState, FormEvent } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LoginForm({ configured }: { configured: boolean }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (response.ok) {
        window.location.reload();
        return;
      }
      const data = await response.json().catch(() => ({}));
      setError(data.error || 'Incorrect token');
    } catch {
      setError('Could not reach the server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-semibold text-foreground">Analytics</h1>
            <p className="text-xs text-muted-foreground">Private dashboard</p>
          </div>
        </div>

        {configured ? (
          <form onSubmit={onSubmit} className="space-y-3">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Access token"
              autoFocus
              className="w-full px-4 py-3 rounded-lg border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={submitting || !token}>
              {submitting ? 'Checking...' : 'Unlock'}
            </Button>
          </form>
        ) : (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-sm text-foreground font-medium">No access token configured</p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Set <code className="font-mono text-amber-500">ANALYTICS_ADMIN_TOKEN</code> in your
              environment and redeploy. Until then this dashboard stays closed rather than open.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
