import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <Sidebar />
      <main className="pl-64 pt-16">
        {children}
      </main>
    </div>
  );
} 