import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { LogOut, Menu, User, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the system.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-yellow-100 text-yellow-800';
      case 'viewer':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-gray-800">Maintenance Fault System</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">{user?.fullName}</span>
            <Badge className={getRoleBadgeColor(user?.role || '')}>
              {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
