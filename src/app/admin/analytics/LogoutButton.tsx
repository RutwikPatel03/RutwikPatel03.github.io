'use client';

import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const logout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    window.location.reload();
  };

  return (
    <button
      onClick={logout}
      title="Sign out"
      className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
