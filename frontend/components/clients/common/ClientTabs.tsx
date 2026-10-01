"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    label: "Overview",
    href: "",
  },
  {
    label: "Portfolio",
    href: "/portfolio",
  },
  {
    label: "Accounts",
    href: "/accounts",
  },
  {
    label: "Transactions",
    href: "/transactions",
  },
  {
    label: "Goals",
    href: "/goals",
  },
  {
    label: "Documents",
    href: "/documents",
  },
  {
    label: "Tasks",
    href: "/tasks",
  },
  {
    label: "KYC",
    href: "/kyc",
  },
  {
    label: "Service Team",
    href: "/service-team",
  },
  {
    label: "Notes",
    href: "/notes",
  },
  {
    label: "Timeline",
    href: "/timeline",
  },
  {
    label: "Settings",
    href: "/settings",
  },
];

interface ClientTabsProps {
  clientId: string;
}

export default function ClientTabs({
  clientId,
}: ClientTabsProps) {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto">
      <nav className="flex min-w-max gap-2 border-b">
        {tabs.map((tab) => {
          const href = `/advisor-dashboard/clients/${clientId}${tab.href}`;

          const active = pathname === href;

          return (
            <Link
              key={tab.label}
              href={href}
              className={[
                "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
