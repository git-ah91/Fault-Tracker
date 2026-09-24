import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

// Pages
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import NewFault from "@/pages/new-fault";
import FaultRecords from "@/pages/fault-records";
import Reports from "@/pages/reports";
import UserManagement from "@/pages/user-management";
import Configuration from "@/pages/configuration";
import ActivityLog from "@/pages/activity-log";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onToggleSidebar={toggleSidebar} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        
        <main className="flex-1 min-h-screen">
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/faults" component={FaultRecords} />
            <Route path="/new-fault" component={NewFault} />
            <Route path="/reports" component={Reports} />
            <Route path="/users" component={UserManagement} />
            <Route path="/configuration" component={Configuration} />
            <Route path="/activity" component={ActivityLog} />
            <Route path="/" component={Dashboard} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
        <Skeleton className="h-4 w-32 mx-auto mb-2" />
        <Skeleton className="h-3 w-24 mx-auto" />
      </div>
    </div>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Login />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
