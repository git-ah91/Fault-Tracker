import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { insertFaultRecordSchema, type InsertFaultRecord } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutoCompleteInput } from "@/components/forms/autocomplete-input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { RoleGuard } from "@/components/auth/role-guard";

export default function NewFault() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: nextIdData } = useQuery({
    queryKey: ['/api/faults/next-id'],
  });

  const form = useForm<InsertFaultRecord>({
    resolver: zodResolver(insertFaultRecordSchema),
    defaultValues: {
      faultNumber: "",
      dateReported: new Date(),
      timeReported: new Date().toTimeString().slice(0, 5),
      location: "",
      equipmentType: "",
      equipmentNumber: "",
      equipmentClassification: "",
      faultReporter: "",
      faultDescription: "",
      workDone: "",
      correctedBy: "",
      dateOfWorkDone: undefined,
      timeToRepair: undefined,
      downTime: undefined,
      relevantState: "",
      comments: "",
      createdBy: user?.fullName || "",
      status: "open",
    },
  });

  const createFaultMutation = useMutation({
    mutationFn: async (data: InsertFaultRecord) => {
      const response = await apiRequest('POST', '/api/faults', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/faults'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: "Success",
        description: "Fault record created successfully!",
      });
      setLocation("/faults");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create fault record. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: InsertFaultRecord) => {
    // Ensure proper data formatting
    const processedData = {
      ...data,
      dateReported: new Date(data.dateReported),
      dateOfWorkDone: data.dateOfWorkDone ? new Date(data.dateOfWorkDone) : undefined,
      createdBy: user?.fullName || "",
    };
    
    console.log("Submitting fault data:", processedData);
    await createFaultMutation.mutateAsync(processedData);
  };

  return (
    <RoleGuard requiredRoles={['editor', 'admin']}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">New Fault Record</h2>
          <p className="text-gray-600">Record a new maintenance fault</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fault Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Auto-generated Fault ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fault ID
                    </label>
                    <Input
                      value={`#${nextIdData?.nextId || 'Loading...'}`}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  
                  {/* Fault Number */}
                  <FormField
                    control={form.control}
                    name="faultNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fault Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter fault number"
                            {...field}
                            disabled={createFaultMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Date Reported */}
                  <FormField
                    control={form.control}
                    name="dateReported"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Reported</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                            disabled={createFaultMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Time Reported */}
                  <FormField
                    control={form.control}
                    name="timeReported"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Reported</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            disabled={createFaultMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <AutoCompleteInput
                            category="location"
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Enter location"
                            disabled={createFaultMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Equipment Type */}
                  <FormField
                    control={form.control}
                    name="equipmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipment Type</FormLabel>
                        <FormControl>
                          <AutoCompleteInput
                            category="equipmentType"
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Enter equipment type"
                            disabled={createFaultMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Equipment Number */}
                  <FormField
                    control={form.control}
                    name="equipmentNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipment Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter equipment number"
                            {...field}
                            disabled={createFaultMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Equipment Classification */}
                  <FormField
                    control={form.control}
                    name="equipmentClassification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipment Classification</FormLabel>
                        <FormControl>
                          <AutoCompleteInput
                            category="equipmentClassification"
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Enter classification"
                            disabled={createFaultMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Fault Reporter */}
                  <FormField
                    control={form.control}
                    name="faultReporter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fault Reporter</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter reporter name"
                            {...field}
                            disabled={createFaultMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Relevant State */}
                  <FormField
                    control={form.control}
                    name="relevantState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relevant State</FormLabel>
                        <FormControl>
                          <AutoCompleteInput
                            category="relevantState"
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Enter relevant state"
                            disabled={createFaultMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Created By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Created By
                    </label>
                    <Input
                      value={user?.fullName || ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                
                {/* Fault Description */}
                <FormField
                  control={form.control}
                  name="faultDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fault Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the fault in detail"
                          className="h-24"
                          {...field}
                          disabled={createFaultMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Work Done */}
                <FormField
                  control={form.control}
                  name="workDone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Done</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe work performed"
                          className="h-24"
                          {...field}
                          disabled={createFaultMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <FormField
                    control={form.control}
                    name="correctedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Corrected By</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter name"
                            {...field}
                            disabled={createFaultMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dateOfWorkDone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Work Done</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                            disabled={createFaultMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="timeToRepair"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time to Repair (hours)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="0.0"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            disabled={createFaultMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="downTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Down Time (hours)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="0.0"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            disabled={createFaultMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Comments */}
                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional comments"
                          className="h-20"
                          {...field}
                          disabled={createFaultMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/faults")}
                    disabled={createFaultMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createFaultMutation.isPending}
                  >
                    {createFaultMutation.isPending ? "Creating..." : "Create Fault Record"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
