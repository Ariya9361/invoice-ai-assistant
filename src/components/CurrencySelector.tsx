import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { currencies, useCurrency } from "@/contexts/CurrencyContext";
import { Globe } from "lucide-react";

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select
        value={currency.code}
        onValueChange={(code) => {
          const found = currencies.find((c) => c.code === code);
          if (found) setCurrency(found);
        }}
      >
        <SelectTrigger className="w-[140px] h-8 text-xs bg-card border-border text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {currencies.map((c) => (
            <SelectItem key={c.code} value={c.code} className="text-xs">
              {c.symbol} {c.code} – {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
