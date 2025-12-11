import { auth } from '@clerk/nextjs/server';
import { getDashboardStats } from '@/lib/services/dashboard';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const { userId } = await auth();
  
  // Graceful fallback for demo/dev if auth fails or isn't set up locally
  const ownerId = userId || 'demo-user-123';
  
  const stats = await getDashboardStats(ownerId);

  return <DashboardClient data={stats} />;
}
