import { createContext, useContext, useState, ReactNode } from "react";

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // rate relative to USD
}

export const currencies: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", rate: 1 },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.92 },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 149.5 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 1.36 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.53 },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", rate: 0.88 },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", rate: 7.24 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 83.1 },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", rate: 4.97 },
  { code: "MXN", symbol: "Mex$", name: "Mexican Peso", rate: 17.15 },
  { code: "KRW", symbol: "₩", name: "South Korean Won", rate: 1330 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", rate: 1.34 },
  { code: "ZAR", symbol: "R", name: "South African Rand", rate: 18.6 },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", rate: 3.67 },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", rate: 3.75 },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", rate: 1550 },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound", rate: 30.9 },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", rate: 30.2 },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", rate: 10.45 },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convert: (amountUSD: number) => number;
  format: (amountUSD: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(currencies[0]);

  const convert = (amountUSD: number) => amountUSD * currency.rate;

  const format = (amountUSD: number) => {
    const converted = convert(amountUSD);
    return `${currency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
}
