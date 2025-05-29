
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Check } from "lucide-react";
import { searchCID, CIDCode } from "@/lib/cid-database";
import { cn } from "@/lib/utils";

interface CIDSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onCIDSelect?: (cid: CIDCode) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function CIDSearchInput({ 
  value, 
  onChange, 
  onCIDSelect,
  placeholder = "Digite para buscar CID...",
  label = "CID",
  className 
}: CIDSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<CIDCode[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value && value.length >= 2) {
      const results = searchCID(value);
      setSearchResults(results);
      if (results.length > 0 && !open) {
        setOpen(true);
      }
    } else {
      setSearchResults([]);
      setOpen(false);
    }
  }, [value, open]);

  const handleSelect = (cid: CIDCode) => {
    onChange(cid.codigo);
    if (onCIDSelect) {
      onCIDSelect(cid);
    }
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    if (newValue.length >= 2) {
      setOpen(true);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="cid-search">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              id="cid-search"
              placeholder={placeholder}
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              className="pl-10"
              autoComplete="off"
            />
          </div>
        </PopoverTrigger>
        {searchResults.length > 0 && (
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandList>
                {searchResults.length === 0 ? (
                  <CommandEmpty>Nenhum CID encontrado.</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {searchResults.map((item) => (
                      <CommandItem
                        key={item.codigo}
                        value={item.codigo}
                        onSelect={() => handleSelect(item)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center space-x-2 w-full">
                          <Check 
                            className={cn(
                              "h-4 w-4",
                              value === item.codigo ? "opacity-100" : "opacity-0"
                            )} 
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{item.codigo}</div>
                            <div className="text-sm text-muted-foreground">{item.descricao}</div>
                            <div className="text-xs text-muted-foreground italic">{item.categoria}</div>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}
