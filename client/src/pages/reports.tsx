import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FaultRecord } from "@shared/schema";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar,
  Download,
  FileText,
  Filter
} from "lucide-react";

export default function Reports() {
  const [reportType, setReportType] = useState("summary");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");

  const { data: faults = [] } = useQuery<FaultRecord[]>({
    queryKey: ['/api/faults'],
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['/api/autocomplete/location'],
  });

  const { data: statistics } = useQuery({
    queryKey: ['/api/statistics'],
  });

  const filteredFaults = faults.filter(fault => {
    const faultDate = new Date(fault.dateReported);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    if (fromDate && faultDate < fromDate) return false;
    if (toDate && faultDate > toDate) return false;
    if (locationFilter !== "all" && fault.location !== locationFilter) return false;
    
    return true;
  });

  const generateReport = () => {
    // TODO: Implement actual report generation
    console.log("Generating report:", { reportType, dateFrom, dateTo, locationFilter });
  };

  const exportExcel = async () => {
    try {
      const { exportFaultData } = await import("@/lib/export");
      await exportFaultData({
        format: 'excel',
        data: filteredFaults,
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        filters: {
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo }),
          ...(locationFilter !== 'all' && { location: locationFilter }),
        }
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const exportPDF = async () => {
    try {
      const { exportFaultData } = await import("@/lib/export");
      await exportFaultData({
        format: 'pdf',
        data: filteredFaults,
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        filters: {
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo }),
          ...(locationFilter !== 'all' && { location: locationFilter }),
        }
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Calculate analytics data
  const equipmentTypeStats = faults.reduce((acc, fault) => {
    acc[fault.equipmentType] = (acc[fault.equipmentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const locationStats = faults.reduce((acc, fault) => {
    acc[fault.location] = (acc[fault.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusStats = faults.reduce((acc, fault) => {
    acc[fault.status] = (acc[fault.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Reports & Analytics</h2>
        <p className="text-gray-600">Generate comprehensive fault reports and statistics</p>
      </div>

      {/* Report Generator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Generate Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Report</SelectItem>
                  <SelectItem value="performance">Performance Report</SelectItem>
                  <SelectItem value="trend">Trend Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue />
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
          </div>
          
          <div className="flex space-x-4">
            <Button onClick={generateReport} className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button onClick={exportExcel} className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={exportPDF} className="bg-red-600 hover:bg-red-700">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Equipment Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(equipmentTypeStats).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{type}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(count / faults.length) * 100}%` }}
                      />
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Location Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(locationStats).map(([location, count]) => (
                <div key={location} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{location}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(count / faults.length) * 100}%` }}
                      />
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statusStats).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{status.replace('_', ' ')}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${(count / faults.length) * 100}%` }}
                      />
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Summary Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Faults</span>
                <Badge variant="outline">{statistics?.totalFaults || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Open Faults</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {statistics?.openFaults || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Resolved Faults</span>
                <Badge className="bg-green-100 text-green-800">
                  {statistics?.resolvedFaults || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Avg. Repair Time</span>
                <Badge variant="outline">{statistics?.avgRepairTime || 0}h</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
