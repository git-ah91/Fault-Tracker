import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleGuard } from "@/components/auth/role-guard";
import { History, User, Calendar, MapPin, Eye, Edit, Trash2, Plus } from "lucide-react";

interface ActivityLogEntry {
  id: number;
  userId: number;
  action: string;
  target: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  userName: string;
}

export default function ActivityLog() {
  const { data: activities = [], isLoading } = useQuery<ActivityLogEntry[]>({
    queryKey: ['/api/activity'],
  });

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'post':
        return <Plus className="h-4 w-4" />;
      case 'put':
      case 'patch':
        return <Edit className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      case 'get':
        return <Eye className="h-4 w-4" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'post':
        return 'bg-green-100 text-green-800';
      case 'put':
      case 'patch':
        return 'bg-yellow-100 text-yellow-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'get':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action.toLowerCase()) {
      case 'post':
        return 'CREATE';
      case 'put':
      case 'patch':
        return 'UPDATE';
      case 'delete':
        return 'DELETE';
      case 'get':
        return 'VIEW';
      default:
        return action.toUpperCase();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTargetDisplay = (target: string) => {
    // Convert API paths to more readable format
    if (target.includes('/api/faults')) {
      return target.replace('/api/faults', 'Fault Records');
    }
    if (target.includes('/api/users')) {
      return target.replace('/api/users', 'User Management');
    }
    if (target.includes('/api/autocomplete')) {
      return target.replace('/api/autocomplete', 'Configuration');
    }
    return target;
  };

  return (
    <RoleGuard requiredRoles={['admin']}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Activity Log</h2>
          <p className="text-gray-600">Track all user activities in the system</p>
        </div>

        {/* Activity Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Activities</p>
                  <p className="text-2xl font-bold text-gray-800">{activities.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <History className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {new Set(activities.map(a => a.userId)).size}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <User className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Activities</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {activities.filter(a => {
                      const today = new Date().toDateString();
                      return new Date(a.timestamp).toDateString() === today;
                    }).length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Log Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="h-5 w-5 mr-2" />
              System Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[300px]" />
                      <Skeleton className="h-3 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No activity log entries found</p>
                <p className="text-sm text-gray-400">User activities will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Timestamp</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Target</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Details</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {activities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-800">
                          {formatTimestamp(activity.timestamp)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            {activity.userName}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getActionColor(activity.action)}>
                            <div className="flex items-center">
                              {getActionIcon(activity.action)}
                              <span className="ml-1">{getActionLabel(activity.action)}</span>
                            </div>
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {getTargetDisplay(activity.target)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {activity.details}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            {activity.ipAddress}
                          </div>
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
    </RoleGuard>
  );
}
