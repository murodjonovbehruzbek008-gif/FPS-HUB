import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { SessionProvider } from '@/components/SessionProvider';
import { Sidebar } from '@/components/shell/Sidebar';
import { MobileBottomNav } from '@/components/shell/MobileNav';
import { MobileHeader } from '@/components/shell/MobileHeader';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/login');

  return (
    <SessionProvider user={user}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <MobileHeader />
          <main className="flex-1 pb-20 md:pb-0">
            {children}
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </SessionProvider>
  );
}
