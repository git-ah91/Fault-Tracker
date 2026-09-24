import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertAutoCompleteItemSchema, type InsertAutoCompleteItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { RoleGuard } from "@/components/auth/role-guard";
import { 
  Settings, 
  Plus, 
  Trash2, 
  AlertTriangle,
  Download,
  Database
} from "lucide-react";

export default function Configuration() {
  const [newItems, setNewItems] = useState({
    equipmentType: "",
    location: "",
    equipmentClassification: "",
    relevantState: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const categories = [
    { key: "equipmentType", label: "Equipment Types", icon: Settings },
    { key: "location", label: "Locations", icon: Database },
    { key: "equipmentClassification", label: "Equipment Classifications", icon: Badge },
    { key: "relevantState", label: "Relevant States", icon: AlertTriangle },
  ];

  const { data: autoCompleteData = {}, isLoading } = useQuery({
    queryKey: ['/api/autocomplete/all'],
    queryFn: async () => {
      const data: Record<string, any[]> = {};
      for (const category of categories) {
        const response = await fetch(`/api/autocomplete/${category.key}`, { 
          credentials: 'include' 
        });
        data[category.key] = await response.json();
      }
      return data;
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (data: InsertAutoCompleteItem) => {
      const response = await apiRequest('POST', '/api/autocomplete', data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/autocomplete/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/autocomplete', variables.category] });
      setNewItems(prev => ({ ...prev, [variables.category]: "" }));
      toast({
        title: "Success",
        description: "Item added successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item.",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest('DELETE', `/api/autocomplete/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/autocomplete/all'] });
      categories.forEach(category => {
        queryClient.invalidateQueries({ queryKey: ['/api/autocomplete', category.key] });
      });
      toast({
        title: "Success",
        description: "Item deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete item.",
        variant: "destructive",
      });
    },
  });

  const deleteAllRecordsMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/faults');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/faults'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: "Success",
        description: "All fault records deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete all records.",
        variant: "destructive",
      });
    },
  });

  const handleAddItem = async (category: string) => {
    const value = newItems[category as keyof typeof newItems];
    if (!value.trim()) return;

    await addItemMutation.mutateAsync({
      category,
      value: value.trim(),
      usage_count: 0,
    });
  };

  const handleDeleteItem = async (itemId: number) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteItemMutation.mutateAsync(itemId);
    }
  };

  const handleDeleteAllRecords = async () => {
    if (window.confirm("Are you sure you want to delete ALL fault records? This action cannot be undone.")) {
      await deleteAllRecordsMutation.mutateAsync();
    }
  };

  const handleInputChange = (category: string, value: string) => {
    setNewItems(prev => ({ ...prev, [category]: value }));
  };

  const handleExportData = () => {
    toast({
      title: "Export initiated",
      description: "System data export will be available shortly.",
    });
    // TODO: Implement actual export functionality
  };

  return (
    <RoleGuard requiredRoles={['admin']}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Configuration</h2>
          <p className="text-gray-600">Manage auto-complete lists and system settings</p>
        </div>

        {/* Auto-complete Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {categories.map((category) => {
            const Icon = category.icon;
            const items = autoCompleteData[category.key] || [];
            
            return (
              <Card key={category.key}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Icon className="h-5 w-5 mr-2" />
                    {category.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {isLoading ? (
                      [...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-8 w-8 rounded" />
                        </div>
                      ))
                    ) : (
                      items.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700">{item.value}</span>
                            {item.usage_count > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {item.usage_count}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={deleteItemMutation.isPending}
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                    
                    <div className="flex space-x-2">
                      <Input
                        placeholder={`Add ${category.label.toLowerCase().slice(0, -1)}`}
                        value={newItems[category.key as keyof typeof newItems]}
                        onChange={(e) => handleInputChange(category.key, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddItem(category.key);
                          }
                        }}
                        disabled={addItemMutation.isPending}
                      />
                      <Button
                        onClick={() => handleAddItem(category.key)}
                        disabled={addItemMutation.isPending}
                        className="flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* System Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              System Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-md">
                <div>
                  <h4 className="font-medium text-red-800">Delete All Records</h4>
                  <p className="text-sm text-red-600">
                    Permanently delete all fault records from the system
                  </p>
                </div>
                <Button
                  onClick={handleDeleteAllRecords}
                  disabled={deleteAllRecordsMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteAllRecordsMutation.isPending ? "Deleting..." : "Delete All"}
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div>
                  <h4 className="font-medium text-blue-800">Export System Data</h4>
                  <p className="text-sm text-blue-600">
                    Export all system data for backup purposes
                  </p>
                </div>
                <Button
                  onClick={handleExportData}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
