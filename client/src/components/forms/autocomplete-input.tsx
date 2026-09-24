import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoCompleteInputProps {
  category: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AutoCompleteInput({ category, value, onValueChange, placeholder, disabled }: AutoCompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const { data: items = [] } = useQuery({
    queryKey: ['/api/autocomplete', category],
    enabled: !disabled,
  });

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredItems = items.filter((item: any) =>
    item.value.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setInputValue(selectedValue);
    setOpen(false);
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onValueChange(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <input
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none"
            disabled={disabled}
          />
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Search ${category}...`} />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>
            {filteredItems.map((item: any) => (
              <CommandItem
                key={item.id}
                value={item.value}
                onSelect={() => handleSelect(item.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === item.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {item.value}
                {item.usage_count > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.usage_count}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
