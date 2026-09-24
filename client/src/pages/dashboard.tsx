import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Settings,
  Calendar
} from "lucide-react";
import { Link } from "wouter";
import { FaultRecord } from "@shared/schema";

export default function Dashboard() {
  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/statistics'],
  });

  const { data: recentFaults = [], isLoading: faultsLoading } = useQuery<FaultRecord[]>({
    queryKey: ['/api/faults'],
    select: (data) => data.slice(0, 5), // Get latest 5 faults
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-gray-600">Overview of maintenance fault system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Faults</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">
                    {statistics?.totalFaults || 0}
                  </p>
                )}
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Faults</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-yellow-600">
                    {statistics?.openFaults || 0}
                  </p>
                )}
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    {statistics?.resolvedFaults || 0}
                  </p>
                )}
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Repair Time</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">
                    {statistics?.avgRepairTime || 0}h
                  </p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Faults */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Faults</CardTitle>
            <Link href="/faults">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {faultsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentFaults.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No fault records found</p>
              <p className="text-sm text-gray-400">Start by creating a new fault record</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Fault ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Equipment</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Reported</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentFaults.map((fault) => (
                    <tr key={fault.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-800">#{fault.id}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {fault.equipmentType} {fault.equipmentNumber}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{fault.location}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(fault.status)}>
                          {fault.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {getTimeAgo(fault.createdAt.toString())}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
