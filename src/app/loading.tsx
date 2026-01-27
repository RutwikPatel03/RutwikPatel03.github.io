import { Spinner } from '@/components/ui/Spinner';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Spinner size="lg" />
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  );
}

