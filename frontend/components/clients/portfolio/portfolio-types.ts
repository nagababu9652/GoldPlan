export interface Holding {
  id: string;

  fundName: string;

  category: string;

  folioNumber: string;

  units: number;

  nav: number;

  currentValue: number;

  investedValue: number;

  gain: number;

  gainPercent: number;
}