import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { canEdit, canAdmin } from "@/lib/auth";
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Plus, 
  BarChart3, 
  Users, 
  Settings, 
  History,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["viewer", "editor", "admin"] },
    { path: "/faults", label: "Fault Records", icon: AlertTriangle, roles: ["viewer", "editor", "admin"] },
    { path: "/new-fault", label: "New Fault", icon: Plus, roles: ["editor", "admin"] },
    { path: "/reports", label: "Reports", icon: BarChart3, roles: ["viewer", "editor", "admin"] },
  ];

  const adminItems = [
    { path: "/users", label: "User Management", icon: Users, roles: ["admin"] },
    { path: "/configuration", label: "Configuration", icon: Settings, roles: ["admin"] },
    { path: "/activity", label: "Activity Log", icon: History, roles: ["admin"] },
  ];

  const canAccess = (roles: string[]) => {
    return user && roles.includes(user.role);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <nav className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white shadow-sm border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:static lg:z-auto"
      )}>
        <div className="p-4">
          {/* Mobile close button */}
          <div className="flex justify-end lg:hidden mb-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {menuItems.map((item) => {
              if (!canAccess(item.roles)) return null;
              
              const isActive = location === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors cursor-pointer",
                      isActive 
                        ? "text-primary bg-blue-50" 
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={onClose}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
            
            {canAdmin(user) && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Admin
                </p>
                {adminItems.map((item) => {
                  const isActive = location === item.path;
                  const Icon = item.icon;
                  
                  return (
                    <Link key={item.path} href={item.path}>
                      <div
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors cursor-pointer",
                          isActive 
                            ? "text-primary bg-blue-50" 
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                        onClick={onClose}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
