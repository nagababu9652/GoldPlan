import {
  Calculator,
  TrendingUp,
  PiggyBank,
  Target,
  Home,
  BarChart3,
  DollarSign,
  LineChart,
  RefreshCw,
  GraduationCap,
  Combine,
  type LucideIcon,
} from 'lucide-react';

export type ToolInfo = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  category: 'investment' | 'loan' | 'goal';
  color: string;
};

export const tools: ToolInfo[] = [
  {
    id: 'sip-calculator',
    title: 'SIP Calculator',
    description: 'Estimate returns on your Systematic Investment Plan. Calculate future value, total investment, and expected returns.',
    href: '/tools/sip-calculator',
    icon: TrendingUp,
    category: 'investment',
    color: 'text-antique-dark',
  },
  {
    id: 'lumpsum-plus-sip',
    title: 'Lumpsum + SIP',
    description: 'Combine a one-time lumpsum investment with monthly SIP contributions to maximize wealth.',
    href: '/tools/lumpsum-plus-sip',
    icon: Combine,
    category: 'investment',
    color: 'text-rose-700',
  },
  {
    id: 'lumpsum-calculator',
    title: 'Lumpsum Calculator',
    description: 'Calculate the future value of a one-time investment with compound interest over any period.',
    href: '/tools/lumpsum-calculator',
    icon: DollarSign,
    category: 'investment',
    color: 'text-emerald-700',
  },
  {
    id: 'step-up-sip',
    title: 'Step-Up SIP Calculator',
    description: 'Plan SIPs with annual increases to beat inflation and accelerate wealth creation.',
    href: '/tools/step-up-sip',
    icon: BarChart3,
    category: 'investment',
    color: 'text-blue-700',
  },
  {
    id: 'retirement-corpus',
    title: 'Retirement Corpus Calculator',
    description: 'Calculate how much you need to save monthly to build your ideal retirement corpus.',
    href: '/tools/retirement-corpus',
    icon: PiggyBank,
    category: 'goal',
    color: 'text-purple-700',
  },
  {
    id: 'swp-calculator',
    title: 'SWP Calculator',
    description: 'Plan your Systematic Withdrawal Strategy — calculate monthly withdrawals from your corpus.',
    href: '/tools/swp-calculator',
    icon: RefreshCw,
    category: 'investment',
    color: 'text-teal-700',
  },
  {
    id: 'emi-calculator',
    title: 'EMI Calculator',
    description: 'Calculate monthly installments for home, car, or personal loans with amortization schedule.',
    href: '/tools/emi-calculator',
    icon: Home,
    category: 'loan',
    color: 'text-red-700',
  },
  {
    id: 'goal-planner',
    title: 'Goal Planner',
    description: 'Set a financial goal and find out exactly how much to invest each month to reach it.',
    href: '/tools/goal-planner',
    icon: Target,
    category: 'goal',
    color: 'text-orange-700',
  },
  {
    id: 'inflation-calculator',
    title: 'Inflation Calculator',
    description: 'See how inflation erodes your purchasing power. Calculate the future value of money.',
    href: '/tools/inflation-calculator',
    icon: LineChart,
    category: 'goal',
    color: 'text-amber-700',
  },
  {
    id: 'xirr-calculator',
    title: 'XIRR Calculator',
    description: 'Calculate accurate returns for irregular cash flows like SIPs, SWPs, and multi-year investments.',
    href: '/tools/xirr-calculator',
    icon: Calculator,
    category: 'investment',
    color: 'text-indigo-700',
  },
];