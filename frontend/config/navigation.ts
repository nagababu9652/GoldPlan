import {
  Bell,
  Briefcase,
  Building2,
  CreditCard,
  Database,
  FileBarChart2,
  FolderKanban,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

import { routes } from "./routes";

export interface NavigationItem {
  id: string;
  title: string;

  href?: string;

  icon?: LucideIcon;

  badge?: string | number;

  permission?: string;

  children?: NavigationItem[];
}

export const navigation: NavigationItem[] = [
  // Dashboard
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    href: routes.dashboard,
  },

  // Customer Management
  {
    id: "customers",
    title: "Customer Management",
    icon: Users,

    children: [
      {
        id: "customer-list",
        title: "Customers",
        href: routes.customers.list,
      },
      {
        id: "customer-groups",
        title: "Customer Groups",
        href: routes.customers.groups,
      },
      {
        id: "customer-add",
        title: "Add Customer",
        href: routes.customers.add,
      },
      {
        id: "customer-merge",
        title: "Merge Customers",
        href: routes.customers.merge,
      },
      {
        id: "customer-import",
        title: "Import Customers",
        href: routes.customers.import,
      },
    ],
  },

  // Portfolio
  {
    id: "portfolio",
    title: "Portfolio",
    icon: Briefcase,

    children: [
      {
        id: "holdings",
        title: "Holdings",
        href: routes.portfolio.holdings,
      },
      {
        id: "transactions",
        title: "Transactions",
        href: routes.portfolio.transactions,
      },
      {
        id: "performance",
        title: "Performance",
        href: routes.portfolio.performance,
      },
    ],
  },

  // Insurance
  {
    id: "insurance",
    title: "Insurance",
    icon: ShieldCheck,

    children: [
      {
        id: "policies",
        title: "Policies",
        href: routes.insurance.policies,
      },
      {
        id: "claims",
        title: "Claims",
        href: routes.insurance.claims,
      },
    ],
  },

  // Mutual Funds
  {
    id: "mutual-funds",
    title: "Mutual Funds",
    icon: Briefcase,
    href: routes.mutualFunds.root,
  },

  // SIP
  {
    id: "sip",
    title: "SIP",
    icon: Briefcase,
    href: routes.sip.root,
  },

  // SWP
  {
    id: "swp",
    title: "SWP",
    icon: Briefcase,
    href: routes.swp.root,
  },

  // STP
  {
    id: "stp",
    title: "STP",
    icon: Briefcase,
    href: routes.stp.root,
  },

  // Leads
  {
    id: "leads",
    title: "Leads",
    icon: Users,
    href: routes.leads.root,
  },

  // Prospects
  {
    id: "prospects",
    title: "Prospects",
    icon: Users,
    href: routes.prospects.root,
  },

  // Tasks
  {
    id: "tasks",
    title: "Tasks",
    icon: FolderKanban,
    href: routes.tasks.root,
  },

  // Meetings
  {
    id: "meetings",
    title: "Meetings",
    icon: Users,
    href: routes.meetings.root,
  },

  // Reports
  {
    id: "reports",
    title: "Reports",
    icon: FileBarChart2,

    children: [
      {
        id: "sip-report",
        title: "SIP Reports",
        href: routes.reports.sip,
      },
      {
        id: "valuation",
        title: "Valuation",
        href: routes.reports.valuation,
      },
      {
        id: "taxation",
        title: "Tax Reports",
        href: routes.reports.taxation,
      },
    ],
  },

  // Administration
  {
    id: "admin",
    title: "Administration",
    icon: Settings,

    children: [
      {
        id: "organization",
        title: "Organization Setup",
        icon: Building2,

        children: [
          {
            id: "branches",
            title: "Branches",
            href: routes.admin.organization.branches,
          },
          {
            id: "employees",
            title: "Employees",
            href: routes.admin.organization.employees,
          },
          {
            id: "associates",
            title: "Associates",
            href: routes.admin.organization.associates,
          },
          {
            id: "agencies",
            title: "Agencies",
            href: routes.admin.organization.agencies,
          },
          {
            id: "arn",
            title: "ARN Holders",
            href: routes.admin.organization.arn,
          },
        ],
      },

      {
        id: "customer-login",
        title: "Customer Login",
        icon: UserCog,
        href: routes.admin.customerLogin,
      },

      {
        id: "alerts",
        title: "Alerts & Notifications",
        icon: Bell,
        href: routes.admin.alerts,
      },

      {
        id: "subscription",
        title: "Subscription",
        icon: CreditCard,
        href: routes.admin.subscription,
      },

      {
        id: "settings",
        title: "Settings",
        icon: Settings,
        href: routes.admin.settings,
      },

      {
        id: "masters",
        title: "Masters",
        icon: FolderKanban,

        children: [
          {
            id: "area-master",
            title: "Area Master",
            href: "/admin/master/area",
          },
          {
            id: "holiday-master",
            title: "Holiday Master",
            href: "/admin/master/holiday",
          },
        ],
      },

      {
        id: "logs",
        title: "System Logs",
        icon: Database,
        href: routes.admin.logs,
      },
    ],
  },
];