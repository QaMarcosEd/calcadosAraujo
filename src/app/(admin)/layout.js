// app/(admin)/layout.jsx
import Sidebar from '@/components/layout/SideBar';
import MainContent from '@/components/layout/MainContent';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <MainContent>{children}</MainContent>
    </div>
  );
}