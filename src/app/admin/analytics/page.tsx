import type { Metadata } from 'next';
import { getSnapshot } from '@/lib/analytics';
import { isAuthenticated, isConfigured } from '@/lib/admin-auth';
import LoginForm from './LoginForm';
import Dashboard from './Dashboard';

// Reads cookies and live Redis, so it can never be statically rendered.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Analytics',
  robots: { index: false, follow: false, nocache: true },
};

const ALLOWED_WINDOWS = [7, 30, 90];
const DEFAULT_WINDOW = 7;

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { days?: string };
}) {
  if (!isAuthenticated()) {
    return <LoginForm configured={isConfigured()} />;
  }

  // The window sizes the pipeline fan-out, so it is picked from a fixed list
  // rather than parsed from the query string.
  const requested = Number(searchParams.days);
  const days = ALLOWED_WINDOWS.includes(requested) ? requested : DEFAULT_WINDOW;

  const snapshot = await getSnapshot(days);

  return <Dashboard snapshot={snapshot} />;
}
