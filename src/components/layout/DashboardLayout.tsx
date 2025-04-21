import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardLayout = ({ children, className }: DashboardLayoutProps) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className={cn("flex-1 overflow-auto p-4 md:p-6 flex flex-col", className)}>
        <header className="flex justify-end mb-4">
          <ThemeToggle />
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
