import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { insertFaultRecordSchema, type InsertFaultRecord } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AutoCompleteInput } from "@/components/forms/autocomplete-input";

interface FaultFormProps {
  onSubmit: (data: InsertFaultRecord) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<InsertFaultRecord>;
  nextFaultId?: number;
}

export function FaultForm({ onSubmit, onCancel, isLoading = false, initialData, nextFaultId }: FaultFormProps) {
  const { user } = useAuth();

  const form = useForm<InsertFaultRecord>({
    resolver: zodResolver(insertFaultRecordSchema),
    defaultValues: {
      faultNumber: initialData?.faultNumber || "",
      dateReported: initialData?.dateReported || new Date(),
      timeReported: initialData?.timeReported || new Date().toTimeString().slice(0, 5),
      location: initialData?.location || "",
      equipmentType: initialData?.equipmentType || "",
      equipmentNumber: initialData?.equipmentNumber || "",
      equipmentClassification: initialData?.equipmentClassification || "",
      faultReporter: initialData?.faultReporter || "",
      faultDescription: initialData?.faultDescription || "",
      workDone: initialData?.workDone || "",
      correctedBy: initialData?.correctedBy || "",
      dateOfWorkDone: initialData?.dateOfWorkDone || undefined,
      timeToRepair: initialData?.timeToRepair || undefined,
      downTime: initialData?.downTime || undefined,
      relevantState: initialData?.relevantState || "",
      comments: initialData?.comments || "",
      createdBy: initialData?.createdBy || user?.fullName || "",
      status: initialData?.status || "open",
    },
  });

  const handleSubmit = (data: InsertFaultRecord) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Auto-generated Fault ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fault ID
            </label>
            <Input
              value={nextFaultId ? `#${nextFaultId}` : 'Loading...'}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                  disabled={isLoading}
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
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Fault Record"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
