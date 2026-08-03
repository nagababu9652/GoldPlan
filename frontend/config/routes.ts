// config/routes.ts

export const routes = {
  home: "/",

  dashboard: "/dashboard",

  customers: {
    root: "/customers",
    list: "/customers/list",
    add: "/customers/add",
    groups: "/customers/groups",
    merge: "/customers/merge",
    import: "/customers/import",
  },

  portfolio: {
    root: "/portfolio",
    holdings: "/portfolio/holdings",
    transactions: "/portfolio/transactions",
    performance: "/portfolio/performance",
  },

  transactions: {
    root: "/transactions",
    list: "/transactions/list",
    add: "/transactions/add",
  },

  insurance: {
    root: "/insurance",
    policies: "/insurance/policies",
    claims: "/insurance/claims",
  },

  mutualFunds: {
    root: "/mutual-funds",
    list: "/mutual-funds/list",
    add: "/mutual-funds/add",
  },

  sip: {
    root: "/sip",
    list: "/sip/list",
    add: "/sip/add",
  },

  swp: {
    root: "/swp",
    list: "/swp/list",
    add: "/swp/add",
  },

  stp: {
    root: "/stp",
    list: "/stp/list",
    add: "/stp/add",
  },

  users: {
    root: "/users",
    list: "/users/list",
    add: "/users/add",
  },

  roles: {
    root: "/roles",
    list: "/roles/list",
    add: "/roles/add",
  },

  branches: {
    root: "/branches",
    list: "/branches/list",
    add: "/branches/add",
  },

  products: {
    root: "/products",
    list: "/products/list",
    add: "/products/add",
  },

  reports: {
    root: "/reports",
    sip: "/reports/sip",
    valuation: "/reports/valuation",
    taxation: "/reports/taxation",
  },

  audit: {
    root: "/audit",
    logs: "/audit/logs",
    trail: "/audit/trail",
  },

  notifications: {
    root: "/notifications",
    list: "/notifications/list",
    settings: "/notifications/settings",
  },

  leads: {
    root: "/leads",
    list: "/leads/list",
    add: "/leads/add",
  },

  prospects: {
    root: "/prospects",
    list: "/prospects/list",
    add: "/prospects/add",
  },

  tasks: {
    root: "/tasks",
    list: "/tasks/list",
    add: "/tasks/add",
  },

  meetings: {
    root: "/meetings",
    list: "/meetings/list",
    schedule: "/meetings/schedule",
  },

  admin: {
    root: "/admin",

    organization: {
      branches: "/admin/organization/branches",
      employees: "/admin/organization/employees",
      associates: "/admin/organization/associates",
      agencies: "/admin/organization/agencies",
      arn: "/admin/organization/arn-holders",
    },

    settings: "/admin/settings",

    customerLogin: "/admin/customer-login",

    alerts: "/admin/alerts",

    subscription: "/admin/subscription",

    logs: "/admin/logs",
  },
} as const;