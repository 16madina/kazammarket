import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { allCountries, westAfricanCountries, Country } from "@/data/westAfricaData";

interface CountrySelectProps {
  value: string;
  onChange: (country: Country) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export const CountrySelect = ({
  value,
  onChange,
  placeholder = "Sélectionner un pays",
  disabled = false,
  error,
}: CountrySelectProps) => {
  const [open, setOpen] = useState(false);

  // Trouver le pays sélectionné
  const selectedCountry = allCountries.find(
    (country) => country.name.toLowerCase() === value.toLowerCase()
  );

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal",
              !selectedCountry && "text-muted-foreground",
              error && "border-destructive"
            )}
          >
            {selectedCountry ? (
              <span className="flex items-center gap-2">
                <span className="text-xl">{selectedCountry.flag}</span>
                <span>{selectedCountry.name}</span>
              </span>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-popover" align="start">
          <Command>
            <CommandInput placeholder="Rechercher un pays..." />
            <CommandList>
              <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
              
              {/* Pays d'Afrique de l'Ouest en premier */}
              <CommandGroup heading="Afrique de l'Ouest">
                {westAfricanCountries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={country.name}
                    onSelect={() => {
                      onChange(country);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-xl">{country.flag}</span>
                    <span className="flex-1">{country.name}</span>
                    <Check
                      className={cn(
                        "h-4 w-4",
                        selectedCountry?.code === country.code
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>

              {/* Autres pays */}
              <CommandGroup heading="Autres pays">
                {allCountries
                  .filter(
                    (country) =>
                      !westAfricanCountries.some((wc) => wc.code === country.code)
                  )
                  .map((country) => (
                    <CommandItem
                      key={country.code}
                      value={country.name}
                      onSelect={() => {
                        onChange(country);
                        setOpen(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-xl">{country.flag}</span>
                      <span className="flex-1">{country.name}</span>
                      <Check
                        className={cn(
                          "h-4 w-4",
                          selectedCountry?.code === country.code
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
