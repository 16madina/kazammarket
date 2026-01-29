import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export const PhoneInput = ({
  value,
  onChange,
  placeholder = "Numéro de téléphone",
  disabled = false,
  error,
}: PhoneInputProps) => {
  const [open, setOpen] = useState(false);

  // Extraire le préfixe et le numéro de la valeur actuelle
  const extractPhoneData = (phoneValue: string) => {
    // Chercher un préfixe correspondant
    for (const country of allCountries) {
      if (phoneValue.startsWith(country.dialCode)) {
        return {
          dialCode: country.dialCode,
          number: phoneValue.slice(country.dialCode.length).trim(),
          country,
        };
      }
    }
    // Si pas de préfixe trouvé, retourner le numéro tel quel avec Côte d'Ivoire par défaut
    const defaultCountry = westAfricanCountries.find(c => c.code === "CI")!;
    return {
      dialCode: defaultCountry.dialCode,
      number: phoneValue.replace(/^\+\d+\s*/, ""),
      country: defaultCountry,
    };
  };

  const phoneData = extractPhoneData(value);
  const [selectedCountry, setSelectedCountry] = useState<Country>(phoneData.country);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    // Reconstruire le numéro avec le nouveau préfixe
    const currentNumber = phoneData.number;
    onChange(`${country.dialCode} ${currentNumber}`);
    setOpen(false);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/[^\d\s]/g, "");
    onChange(`${selectedCountry.dialCode} ${newNumber}`);
  };

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        {/* Sélecteur de préfixe */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn(
                "w-[120px] justify-between font-normal shrink-0",
                error && "border-destructive"
              )}
            >
              <span className="flex items-center gap-1.5 truncate">
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-sm">{selectedCountry.dialCode}</span>
              </span>
              <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0 bg-popover" align="start">
            <Command>
              <CommandInput placeholder="Rechercher un pays..." />
              <CommandList>
                <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
                
                {/* Pays d'Afrique de l'Ouest en premier */}
                <CommandGroup heading="Afrique de l'Ouest">
                  {westAfricanCountries.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={`${country.name} ${country.dialCode}`}
                      onSelect={() => handleCountrySelect(country)}
                      className="flex items-center gap-2"
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="flex-1 truncate">{country.name}</span>
                      <span className="text-muted-foreground text-sm">{country.dialCode}</span>
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          selectedCountry.code === country.code
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
                        value={`${country.name} ${country.dialCode}`}
                        onSelect={() => handleCountrySelect(country)}
                        className="flex items-center gap-2"
                      >
                        <span className="text-lg">{country.flag}</span>
                        <span className="flex-1 truncate">{country.name}</span>
                        <span className="text-muted-foreground text-sm">{country.dialCode}</span>
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0",
                            selectedCountry.code === country.code
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

        {/* Champ de numéro */}
        <Input
          type="tel"
          value={phoneData.number}
          onChange={handleNumberChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("flex-1", error && "border-destructive")}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
