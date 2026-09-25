import { Holding } from "./portfolio-types";

export const holdings: Holding[] = [
  {
    id: "1",
    fundName: "Axis Bluechip Fund",
    category: "Large Cap",
    folioNumber: "12345678",
    units: 120.55,
    nav: 65.23,
    investedValue: 65000,
    currentValue: 78622,
    gain: 13622,
    gainPercent: 20.96,
  },
  {
    id: "2",
    fundName: "Parag Parikh Flexi Cap",
    category: "Flexi Cap",
    folioNumber: "88991234",
    units: 96.42,
    nav: 92.11,
    investedValue: 75000,
    currentValue: 88804,
    gain: 13804,
    gainPercent: 18.40,
  },
];