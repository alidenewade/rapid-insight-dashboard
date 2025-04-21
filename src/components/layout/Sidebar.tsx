
import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, BarChart, TrendingUp, Settings, ChartLine, Database, Clock, Filter } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick }: NavItemProps) => (
  <Button
    variant="ghost"
    onClick={onClick}
    className={cn(
      "w-full justify-start gap-2 mb-1",
      active && "bg-accent text-accent-foreground"
    )}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </Button>
);

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState<string>("dashboard");
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <div
      className={cn(
        "bg-card h-screen border-r p-3 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex items-center justify-between py-2 mb-6">
        {!collapsed && (
          <h2 className="font-semibold text-lg">Market Analytics</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? (
            <ChartLine className="h-4 w-4" />
          ) : (
            <Filter className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="space-y-1">
        <NavItem
          icon={LayoutDashboard}
          label={collapsed ? "" : "Dashboard"}
          active={activeItem === "dashboard"}
          onClick={() => setActiveItem("dashboard")}
        />
        <NavItem
          icon={BarChart}
          label={collapsed ? "" : "Market Data"}
          active={activeItem === "market"}
          onClick={() => setActiveItem("market")}
        />
        <NavItem
          icon={TrendingUp}
          label={collapsed ? "" : "Analytics"}
          active={activeItem === "analytics"}
          onClick={() => setActiveItem("analytics")}
        />
        <NavItem
          icon={Clock}
          label={collapsed ? "" : "Backtest"}
          active={activeItem === "backtest"}
          onClick={() => setActiveItem("backtest")}
        />
        <NavItem
          icon={Database}
          label={collapsed ? "" : "Models"}
          active={activeItem === "models"}
          onClick={() => setActiveItem("models")}
        />
      </div>

      <Separator className="my-4" />

      <div className="mt-auto">
        <NavItem
          icon={Settings}
          label={collapsed ? "" : "Settings"}
          active={activeItem === "settings"}
          onClick={() => setActiveItem("settings")}
        />
      </div>
    </div>
  );
};

export default Sidebar;
