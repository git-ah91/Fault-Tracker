import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { canEdit, canAdmin } from "@/lib/auth";
import { RoleGuard } from "@/components/auth/role-guard";
import { FaultRecord } from "@shared/schema";
import { 
  Search, 
  Download, 
  FileText, 
  Eye, 
  Edit, 
  Trash2,
  AlertCircle
} from "lucide-react";

export default function FaultRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: faults = [], isLoading } = useQuery<FaultRecord[]>({
    queryKey: ['/api/faults', { search: searchQuery, status: statusFilter, location: locationFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (locationFilter !== 'all') params.append('location', locationFilter);
      
      const response = await fetch(`/api/faults?${params}`, { credentials: 'include' });
      return response.json();
    },
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['/api/autocomplete/location'],
  });

  const deleteFaultMutation = useMutation({
    mutationFn: async (faultId: number) => {
      await apiRequest('DELETE', `/api/faults/${faultId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/faults'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: "Success",
        description: "Fault record deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete fault record.",
        variant: "destructive",
      });
    },
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

  const handleDeleteFault = async (faultId: number) => {
    if (window.confirm("Are you sure you want to delete this fault record?")) {
      await deleteFaultMutation.mutateAsync(faultId);
    }
  };

  const handleExportExcel = async () => {
    try {
      const { exportFaultData } = await import("@/lib/export");
      await exportFaultData({
        format: 'excel',
        data: faults,
        title: 'Fault Records Export',
        filters: {
          ...(searchQuery && { search: searchQuery }),
          ...(statusFilter !== 'all' && { status: statusFilter }),
          ...(locationFilter !== 'all' && { location: locationFilter }),
        }
      });
      toast({
        title: "Export successful",
        description: "Excel file has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export to Excel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      const { exportFaultData } = await import("@/lib/export");
      await exportFaultData({
        format: 'pdf',
        data: faults,
        title: 'Fault Records Report',
        filters: {
          ...(searchQuery && { search: searchQuery }),
          ...(statusFilter !== 'all' && { status: statusFilter }),
          ...(locationFilter !== 'all' && { location: locationFilter }),
        }
      });
      toast({
        title: "Export successful",
        description: "PDF report has been generated.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export to PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Fault Records</h2>
        <p className="text-gray-600">View and manage all fault records</p>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search faults..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location: any) => (
                    <SelectItem key={location.id} value={location.value}>
                      {location.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleExportExcel}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button
                onClick={handleExportPDF}
                className="bg-red-600 hover:bg-red-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
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
          ) : faults.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No fault records found</p>
              <p className="text-sm text-gray-400">
                {searchQuery || statusFilter !== 'all' || locationFilter !== 'all'
                  ? "Try adjusting your search criteria"
                  : "Start by creating a new fault record"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Fault ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Equipment</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Reporter</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Repair Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {faults.map((fault) => (
                    <tr key={fault.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-800">
                        #{fault.id}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {fault.equipmentType} {fault.equipmentNumber}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{fault.location}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{fault.equipmentType}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{fault.faultReporter}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(fault.status)}>
                          {fault.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {fault.timeToRepair ? `${fault.timeToRepair}h` : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(fault.dateReported.toString())}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Details"
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <RoleGuard requiredRoles={['editor', 'admin']}>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit"
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </RoleGuard>
                          <RoleGuard requiredRoles={['admin']}>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteFault(fault.id)}
                              disabled={deleteFaultMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </RoleGuard>
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
  );
}
