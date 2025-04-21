
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

const DashboardLayout = ({ children, className }: DashboardLayoutProps) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className={cn("flex-1 overflow-auto p-4 md:p-6", className)}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
