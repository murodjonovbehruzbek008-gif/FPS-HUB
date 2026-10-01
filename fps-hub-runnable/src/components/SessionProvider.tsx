'use client';

import { createContext, useContext } from 'react';

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  username: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  avatarUrl: string | null;
  theme: string;
  locale: string;
  classId: string | null;
}

const SessionContext = createContext<SessionUser | null>(null);

export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: React.ReactNode;
}) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionUser | null {
  return useContext(SessionContext);
}

export function useRequiredSession(): SessionUser {
  const s = useContext(SessionContext);
  if (!s) throw new Error('No session');
  return s;
}
