import type { GuideKnowledgeEntry } from "./types";

export const GUIDE_KNOWLEDGE: GuideKnowledgeEntry[] = [
  {
    id: "what-can-you-do",
    title: "What FinPlan Guide can do",
    keywords: [
      "what can you do",
      "how can you help",
      "what do you know",
      "guide help",
      "assistant help",
      "help me use finplan",
    ],
    answer:
      "I can explain FinPlan features and workflows, answer common product questions, tell you where something is, and give you navigation shortcuts. I am model-free and read-only, so I do not change financial records.",
    actions: [
      { label: "Clients", route: "/advisor-dashboard/clients" },
      { label: "Households", route: "/advisor-dashboard/groups" },
      { label: "Transactions", route: "/advisor-dashboard/transactions" },
    ],
    suggestions: [
      "How do I add a client?",
      "How do households work?",
      "Where are documents?",
      "What financial tools are available?",
    ],
  },
  {
    id: "guide-offline-privacy",
    title: "Is FinPlan Guide offline",
    keywords: [
      "is this offline",
      "offline guide",
      "does guide use internet",
      "does this use ai",
      "is this ai",
      "does guide send data",
      "privacy guide",
      "local assistant",
    ],
    answer:
      "FinPlan Guide itself runs in your browser using curated product knowledge and local matching. It does not call an AI model or an external assistant service. Navigation buttons simply open normal FinPlan pages, which may use your usual FinPlan backend APIs.",
    suggestions: ["What can you do?", "Can you change my data?"],
  },
  {
    id: "guide-read-only",
    title: "Can the guide change data",
    keywords: [
      "can you change data",
      "can you edit for me",
      "can you delete",
      "can you create record",
      "can you move client",
      "can you perform action",
      "are you read only",
    ],
    answer:
      "FinPlan Guide is read-only. I can explain the workflow and take you to the correct page, but I do not create, edit, move, or delete financial or CRM records.",
    suggestions: ["How do I move a client?", "How do I add a client?"],
  },
  {
    id: "dashboard",
    title: "Advisor dashboard",
    keywords: ["dashboard", "advisor home", "main page", "overview", "home dashboard"],
    answer:
      "The Advisor Dashboard is the main workspace for advisor activity and shortcuts into FinPlan modules.",
    actions: [{ label: "Open Dashboard", route: "/advisor-dashboard" }],
    suggestions: ["Open clients", "Open tasks", "Open meetings"],
  },

  // ---------------------------------------------------------------------------
  // CLIENTS
  // ---------------------------------------------------------------------------
  {
    id: "clients",
    title: "Clients",
    keywords: [
      "clients",
      "client list",
      "find clients",
      "manage clients",
      "customers",
      "customer list",
      "client management",
    ],
    answer:
      "The Clients area contains the advisor's client records. From there you can open a client, create a new client, and reach that client's related sections.",
    actions: [
      { label: "Open Clients", route: "/advisor-dashboard/clients" },
      { label: "Add Client", route: "/advisor-dashboard/clients/new" },
    ],
    suggestions: ["How do I add a client?", "How are households created?", "Where are client documents?"],
  },
  {
    id: "add-client",
    title: "Add a client",
    keywords: [
      "add client",
      "create client",
      "new client",
      "register client",
      "add customer",
      "create customer",
      "onboard client",
      "client onboarding",
    ],
    answer:
      "Open Clients and choose Add Client. When a new client is created, FinPlan automatically creates their initial HOUSEHOLD and makes that client the household head and primary household member.",
    actions: [
      { label: "Add Client", route: "/advisor-dashboard/clients/new" },
      { label: "Open Clients", route: "/advisor-dashboard/clients" },
    ],
    suggestions: ["What happens to the household after client creation?", "What client fields are available?"],
  },
  {
    id: "client-fields",
    title: "Client information",
    keywords: [
      "client fields",
      "client information",
      "what client details",
      "personal information",
      "client profile fields",
      "pan aadhaar occupation income net worth",
    ],
    answer:
      "Client profiles include personal and CRM information such as name, contact details, date of birth, gender, marital status, occupation, PAN/Aadhaar fields, address, annual income, net worth, risk profile, notes, and related sections. Some advanced fields are still being connected to their final backend records.",
    actions: [{ label: "Open Clients", route: "/advisor-dashboard/clients" }],
    suggestions: ["How do I edit a client?", "What is risk profile?", "Where are client settings?"],
  },
  {
    id: "edit-current-client",
    title: "Edit this client",
    keywords: [
      "edit this client",
      "edit client",
      "change client details",
      "update client",
      "update customer",
      "change personal details",
    ],
    answer: "Use Edit Client to update the current client's profile information.",
    actions: [
      {
        label: "Edit This Client",
        route: "/advisor-dashboard/clients/:clientId/edit",
        requires: ["clientId"],
      },
      { label: "Open Clients", route: "/advisor-dashboard/clients" },
    ],
    contextAreas: ["client"],
    suggestions: ["Open this client's settings", "Open this client's documents", "Open this client's notes"],
  },
  {
    id: "client-notes",
    title: "Client notes",
    keywords: ["client notes", "this client notes", "notes for client", "advisor notes", "client remarks"],
    answer: "Use the client's Notes section for client-specific notes and remarks available in the client workspace.",
    actions: [
      {
        label: "Open Client Notes",
        route: "/advisor-dashboard/clients/:clientId/notes",
        requires: ["clientId"],
      },
    ],
    contextAreas: ["client"],
    suggestions: ["Open client timeline", "Open client documents"],
  },
  {
    id: "client-documents",
    title: "Client documents",
    keywords: [
      "this client documents",
      "client documents",
      "documents for client",
      "open documents",
      "show documents",
      "client files",
    ],
    answer:
      "Open the client's Documents section to view documents associated with that client. The general Document Center is also available for advisor-wide document management.",
    actions: [
      {
        label: "Open Client Documents",
        route: "/advisor-dashboard/clients/:clientId/documents",
        requires: ["clientId"],
      },
      { label: "All Documents", route: "/advisor-dashboard/documents" },
    ],
    contextAreas: ["client"],
    suggestions: ["How do I upload a document?", "Open client timeline"],
  },
  {
    id: "client-goals",
    title: "Client goals",
    keywords: ["client goals", "this client goals", "financial goals", "goals for client", "goal planning client"],
    answer:
      "The client's Goals section is available from the client workspace. Goal-planning functionality is still being expanded as FinPlan develops.",
    actions: [
      {
        label: "Open Client Goals",
        route: "/advisor-dashboard/clients/:clientId/goals",
        requires: ["clientId"],
      },
      { label: "Public Goal Pages", route: "/goals" },
    ],
    contextAreas: ["client"],
    suggestions: ["Retirement goal", "Education goal", "Goal planner"],
  },
  {
    id: "client-portfolio",
    title: "Client portfolio",
    keywords: ["client portfolio", "this client portfolio", "client holdings", "client investments"],
    answer:
      "The client workspace includes a Portfolio page. Portfolio functionality is still being expanded, so it should not yet be treated as the final production investment model.",
    actions: [
      {
        label: "Open Client Portfolio",
        route: "/advisor-dashboard/clients/:clientId/portfolio",
        requires: ["clientId"],
      },
      { label: "Advisor Portfolio", route: "/advisor-dashboard/portfolio" },
    ],
    contextAreas: ["client"],
    suggestions: ["What is the advisor portfolio page?", "Open client goals"],
  },
  {
    id: "client-timeline",
    title: "Client timeline",
    keywords: ["client timeline", "this client timeline", "client history", "activity timeline", "client activity"],
    answer:
      "Use the client's Timeline section to review timeline-style client activity when available.",
    actions: [
      {
        label: "Open Client Timeline",
        route: "/advisor-dashboard/clients/:clientId/timeline",
        requires: ["clientId"],
      },
    ],
    contextAreas: ["client"],
    suggestions: ["Open client notes", "Open client documents"],
  },
  {
    id: "client-settings",
    title: "Client settings",
    keywords: [
      "client settings",
      "this client settings",
      "risk profile settings",
      "nominee",
      "bank account settings",
      "client preferences",
    ],
    answer:
      "Client-specific settings are available from the client's Settings section. Some settings fields are still being connected to their final backend records.",
    actions: [
      {
        label: "Open Client Settings",
        route: "/advisor-dashboard/clients/:clientId/settings",
        requires: ["clientId"],
      },
    ],
    contextAreas: ["client"],
    suggestions: ["What is risk profile?", "How do I edit this client?"],
  },
  {
    id: "risk-profile",
    title: "Risk profile",
    keywords: ["risk profile", "client risk", "conservative moderate aggressive", "risk category", "risk assessment"],
    answer:
      "Risk profile is a client-level CRM field used to record the client's risk classification. FinPlan also has backend foundations for richer customer risk-profile records, but the final assessment workflow is still evolving.",
    actions: [{ label: "Open Clients", route: "/advisor-dashboard/clients" }],
    suggestions: ["Open client settings", "What client information is stored?"],
  },
  {
    id: "kyc",
    title: "KYC",
    keywords: ["kyc", "know your customer", "kyc status", "kyc verification", "client kyc"],
    answer:
      "FinPlan has backend CRM foundations for customer KYC and KYC history. The complete advisor-facing KYC workflow is still being developed, so I will not claim a dedicated KYC action that is not available in the current interface.",
    suggestions: ["Open client settings", "Where are documents?"],
  },

  // ---------------------------------------------------------------------------
  // HOUSEHOLDS / GROUPS
  // ---------------------------------------------------------------------------
  {
    id: "households",
    title: "Households and groups",
    keywords: [
      "households",
      "groups",
      "family groups",
      "customer groups",
      "client groups",
      "manage households",
      "groups and households",
    ],
    answer:
      "Groups & Households manages relationships around clients. HOUSEHOLD and FAMILY are household-like groups; BUSINESS, INVESTMENT, TRUST, HUF, and OTHER are additional group relationships.",
    actions: [{ label: "Open Households", route: "/advisor-dashboard/groups" }],
    suggestions: ["What group types are supported?", "Can a client join multiple groups?", "How do I move a client?"],
  },
  {
    id: "auto-household",
    title: "Automatic household creation",
    keywords: [
      "automatic household",
      "household created with client",
      "household after client creation",
      "new client household",
      "what happens after client creation",
      "initial household",
    ],
    answer:
      "When a new client is created, FinPlan automatically creates an initial HOUSEHOLD for that client. The new client starts as the household head and primary household member.",
    actions: [
      { label: "Add Client", route: "/advisor-dashboard/clients/new" },
      { label: "Open Households", route: "/advisor-dashboard/groups" },
    ],
    suggestions: ["Can a client belong to HUF too?", "How do I move a client?"],
  },
  {
    id: "household-rule",
    title: "Household membership rule",
    keywords: [
      "how many households",
      "multiple households",
      "household and huf",
      "household and business",
      "can client join multiple groups",
      "one household",
      "group membership rules",
      "can one client be in all groups",
    ],
    answer:
      "A client can have one active HOUSEHOLD/FAMILY membership at a time. The same client may simultaneously belong to multiple BUSINESS, INVESTMENT, TRUST, HUF, and OTHER groups.",
    actions: [{ label: "Open Households", route: "/advisor-dashboard/groups" }],
    suggestions: ["Why only one household?", "What is HUF?", "How do I add a group member?"],
  },
  {
    id: "primary-household",
    title: "Primary household",
    keywords: ["primary household", "primary group", "is primary", "primary member", "set primary household"],
    answer:
      "FinPlan now treats HOUSEHOLD/FAMILY membership as the client's primary household relationship automatically. Advisors do not manually set a BUSINESS, TRUST, HUF, INVESTMENT, or OTHER group as primary.",
    suggestions: ["Can a client be in multiple groups?", "How do I move a client?"],
  },
  {
    id: "group-types",
    title: "Group types",
    keywords: [
      "group types",
      "household family business investment trust huf other",
      "types of groups",
      "what groups are supported",
    ],
    answer:
      "FinPlan supports HOUSEHOLD, FAMILY, BUSINESS, INVESTMENT, TRUST, HUF, and OTHER. Group type is selected when the group is created and is not meant to be changed later.",
    actions: [{ label: "Open Households", route: "/advisor-dashboard/groups" }],
    suggestions: ["What is HUF?", "What is a Trust group?", "Why can't I change group type?"],
  },
  {
    id: "group-type-immutable",
    title: "Why group type cannot be changed",
    keywords: [
      "change group type",
      "why cant change group type",
      "edit group type",
      "household to business",
      "business to household",
    ],
    answer:
      "Group type is intentionally fixed after creation because each type has different membership rules. Allowing a BUSINESS to become a HOUSEHOLD later could bypass household constraints and corrupt relationship history.",
    actions: [{ label: "Open Households", route: "/advisor-dashboard/groups" }],
    suggestions: ["What group types are supported?", "How do I create a group?"],
  },
  {
    id: "create-group",
    title: "Create a group",
    keywords: ["create group", "add group", "new group", "create household", "new household", "add family group"],
    answer:
      "Open Groups & Households and choose Add Group. Select the group type when creating it. If you assign an initial head, FinPlan applies the appropriate household or non-household membership rules.",
    actions: [{ label: "Open Households", route: "/advisor-dashboard/groups" }],
    suggestions: ["What group types are supported?", "Can I change group type later?"],
  },
  {
    id: "add-group-member",
    title: "Add a group member",
    keywords: ["add member", "add group member", "add client to group", "add client to household", "join group", "join household"],
    answer:
      "Open the group and use Add Member. For HOUSEHOLD/FAMILY, FinPlan blocks a second active household membership. BUSINESS, INVESTMENT, TRUST, HUF, and OTHER can have multiple active associations.",
    actions: [
      {
        label: "Open This Group",
        route: "/advisor-dashboard/groups/:groupId",
        requires: ["groupId"],
      },
      { label: "Open Households", route: "/advisor-dashboard/groups" },
    ],
    contextAreas: ["group"],
    suggestions: ["Why can't I add this client?", "How do I move a client instead?"],
  },
  {
    id: "second-household-blocked",
    title: "Why a second household is blocked",
    keywords: [
      "cannot add client household",
      "client already belongs household",
      "second household blocked",
      "already active household",
      "add this client to another family",
      "why cant add client to family",
    ],
    answer:
      "A client may have only one active HOUSEHOLD/FAMILY membership. If the client already has one, use the Move Client Here workflow instead of adding them as a second household member.",
    actions: [{ label: "Open Households", route: "/advisor-dashboard/groups" }],
    suggestions: ["How do I move a client?", "Can the client still join HUF or Business?"],
  },
  {
    id: "move-client-household",
    title: "Move a client to another household",
    keywords: [
      "move client",
      "move a client",
      "move customer",
      "change household",
      "transfer client household",
      "move client here",
      "move to family",
      "move household member",
    ],
    answer:
      "Open the target HOUSEHOLD/FAMILY and use Move Client Here. FinPlan closes the client's old household membership and preserves it in history. If the moving client is the old household head and other members remain, select a replacement head first.",
    actions: [
      { label: "Open Households", route: "/advisor-dashboard/groups" },
      {
        label: "Open This Group",
        route: "/advisor-dashboard/groups/:groupId",
        requires: ["groupId"],
      },
    ],
    contextAreas: ["group"],
    suggestions: ["Why do I need a replacement head?", "What happens to old membership history?"],
  },
  {
    id: "replacement-head",
    title: "Replacement household head",
    keywords: [
      "replacement head",
      "select new head before moving",
      "why replacement head",
      "moving household head",
      "current household head move",
    ],
    answer:
      "If the moving client is the current household head and other active members will remain, FinPlan requires a replacement head. This avoids leaving an occupied household without a responsible head.",
    suggestions: ["How do I change household head?", "How do I move the client?"],
  },
  {
    id: "change-group-head",
    title: "Change group head",
    keywords: ["change household head", "change group head", "new head", "household head", "group head", "karta head"],
    answer:
      "On the Group detail page, choose an active member as the group head. The previous head remains a normal active member unless they are separately moved or removed.",
    actions: [
      {
        label: "Open This Group",
        route: "/advisor-dashboard/groups/:groupId",
        requires: ["groupId"],
      },
      { label: "Open Households", route: "/advisor-dashboard/groups" },
    ],
    contextAreas: ["group"],
    suggestions: ["How do I move the current head?", "What is membership history?"],
  },
  {
    id: "remove-group-member",
    title: "Remove a group member",
    keywords: ["remove member", "remove group member", "remove client from group", "member leave group", "leave household"],
    answer:
      "Removing a member closes the active membership by setting an end date instead of deleting history. If the last member leaves a HOUSEHOLD/FAMILY, the empty household is deactivated.",
    actions: [
      {
        label: "Open This Group",
        route: "/advisor-dashboard/groups/:groupId",
        requires: ["groupId"],
      },
    ],
    contextAreas: ["group"],
    suggestions: ["What is membership history?", "Why was the household deactivated?"],
  },
  {
    id: "group-membership-history",
    title: "Membership history",
    keywords: [
      "membership history",
      "group history",
      "household history",
      "previous members",
      "old memberships",
      "left household",
      "rejoin household history",
    ],
    answer:
      "FinPlan preserves each membership period instead of overwriting it. A client can leave and later rejoin the same group while earlier membership periods remain in history.",
    actions: [
      {
        label: "Open This Group",
        route: "/advisor-dashboard/groups/:groupId",
        requires: ["groupId"],
      },
      { label: "Open Households", route: "/advisor-dashboard/groups" },
    ],
    contextAreas: ["group"],
    suggestions: ["How does rejoining work?", "How do I remove a member?"],
  },
  {
    id: "deactivate-group",
    title: "Deactivate a group",
    keywords: ["deactivate group", "deactivate household", "close group", "inactive household", "disable group"],
    answer:
      "HOUSEHOLD/FAMILY groups cannot be deactivated while active members remain; move or remove members first. BUSINESS, INVESTMENT, TRUST, HUF, and OTHER groups can be deactivated, and their active memberships are closed for history.",
    actions: [{ label: "Open Households", route: "/advisor-dashboard/groups" }],
    suggestions: ["Why can't I deactivate this household?", "How do I remove a member?"],
  },
  {
    id: "huf-group",
    title: "HUF group",
    keywords: ["huf", "belong to huf", "hindu undivided family", "huf group", "karta", "huf member"],
    answer:
      "HUF is treated as a non-household group type in FinPlan. A client can belong to an HUF while also having their normal active HOUSEHOLD/FAMILY. Typical relationship roles may include KARTA or MEMBER.",
    actions: [{ label: "Open Households", route: "/advisor-dashboard/groups" }],
    suggestions: ["Can a client be in Household and HUF?", "What are group types?"],
  },
  {
    id: "trust-group",
    title: "Trust group",
    keywords: ["trust group", "trustee", "beneficiary", "settlor", "trust relationship"],
    answer:
      "TRUST is a non-household group type. A client can belong to one or more trust relationships while still having their normal household. Relationship roles can represent trustee, beneficiary, settlor, or another appropriate role.",
    actions: [{ label: "Open Households", route: "/advisor-dashboard/groups" }],
    suggestions: ["Can a client belong to multiple groups?", "What are group types?"],
  },
  {
    id: "business-group",
    title: "Business group",
    keywords: ["business group", "company group", "director", "partner", "shareholder", "business relationship"],
    answer:
      "BUSINESS is a non-household group type for business relationships such as owner, director, partner, or shareholder. It does not replace the client's normal household.",
    actions: [{ label: "Open Households", route: "/advisor-dashboard/groups" }],
    suggestions: ["Can a client be in Business and Household?", "What are group types?"],
  },
  {
    id: "investment-group",
    title: "Investment group",
    keywords: ["investment group", "investment pool", "investor group", "beneficial owner", "joint investment group"],
    answer:
      "INVESTMENT is a non-household group type for investment-related associations. A client may belong to multiple such groups while retaining their normal household.",
    actions: [{ label: "Open Households", route: "/advisor-dashboard/groups" }],
    suggestions: ["Can a client belong to multiple groups?", "What are group types?"],
  },

  // ---------------------------------------------------------------------------
  // TRANSACTIONS / CRM WORK
  // ---------------------------------------------------------------------------
  {
    id: "transactions",
    title: "Transactions",
    keywords: ["transactions", "client transactions", "transaction list", "payments", "transaction management"],
    answer:
      "The Transactions area lets advisors view and manage client transactions, filter them, open details, and access transaction history.",
    actions: [{ label: "Open Transactions", route: "/advisor-dashboard/transactions" }],
    suggestions: ["How do I add a transaction?", "Where is transaction history?", "How do I edit a transaction?"],
  },
  {
    id: "add-transaction",
    title: "Add a transaction",
    keywords: ["add transaction", "add a transaction", "new transaction", "create transaction", "record transaction", "enter transaction"],
    answer:
      "Open Transactions and use Add Transaction. Select the client and enter the transaction details in the transaction dialog.",
    actions: [{ label: "Open Transactions", route: "/advisor-dashboard/transactions" }],
    suggestions: ["Where is transaction history?", "How do I edit a transaction?"],
  },
  {
    id: "edit-transaction",
    title: "Edit a transaction",
    keywords: ["edit transaction", "update transaction", "change transaction", "correct transaction"],
    answer:
      "Open Transactions, choose the transaction, and use the Edit action. Changes are tracked through transaction history.",
    actions: [{ label: "Open Transactions", route: "/advisor-dashboard/transactions" }],
    suggestions: ["Where is transaction history?", "Can I delete a transaction?"],
  },
  {
    id: "transaction-history",
    title: "Transaction history",
    keywords: ["transaction history", "transaction audit", "transaction changes", "old transaction values", "history transaction"],
    answer:
      "Transaction History shows tracked changes for a transaction. Open Transactions and use the History action on the relevant record.",
    actions: [{ label: "Open Transactions", route: "/advisor-dashboard/transactions" }],
    suggestions: ["How do I edit a transaction?", "How do I view transaction details?"],
  },
  {
    id: "delete-transaction",
    title: "Delete a transaction",
    keywords: ["delete transaction", "remove transaction", "can i delete transaction"],
    answer:
      "The Transactions page currently includes a delete action. Use it carefully because deletion behavior is separate from the transaction-history view.",
    actions: [{ label: "Open Transactions", route: "/advisor-dashboard/transactions" }],
    suggestions: ["Where is transaction history?"],
  },
  {
    id: "meetings",
    title: "Meetings",
    keywords: ["meetings", "appointments", "client meeting", "meeting list", "advisor meetings"],
    answer: "Use Meetings to view advisor meetings, open meeting details, or create a new meeting.",
    actions: [
      { label: "Open Meetings", route: "/advisor-dashboard/meetings" },
      { label: "New Meeting", route: "/advisor-dashboard/meetings/new" },
    ],
    suggestions: ["How do I create a meeting?", "Open tasks"],
  },
  {
    id: "new-meeting",
    title: "Create a meeting",
    keywords: ["new meeting", "create meeting", "schedule meeting", "book meeting", "add meeting"],
    answer: "Use New Meeting from the Meetings area to create a meeting record.",
    actions: [{ label: "New Meeting", route: "/advisor-dashboard/meetings/new" }],
    suggestions: ["Open meetings", "Open tasks"],
  },
  {
    id: "tasks",
    title: "Tasks",
    keywords: ["tasks", "todo", "to do", "follow up", "followup", "reminder task", "work items"],
    answer:
      "Use Tasks for advisor follow-ups and work items. You can open the task list, view task details, or create a new task.",
    actions: [
      { label: "Open Tasks", route: "/advisor-dashboard/tasks" },
      { label: "New Task", route: "/advisor-dashboard/tasks/new" },
    ],
    suggestions: ["How do I create a task?", "Open meetings"],
  },
  {
    id: "new-task",
    title: "Create a task",
    keywords: ["new task", "create task", "create a task", "add task", "new follow up", "create followup"],
    answer: "Use New Task from the Tasks area to create a follow-up or work item.",
    actions: [{ label: "New Task", route: "/advisor-dashboard/tasks/new" }],
    suggestions: ["Open tasks", "Open meetings"],
  },
  {
    id: "messages",
    title: "Messages",
    keywords: ["messages", "client messages", "communication", "message list", "crm messages"],
    answer:
      "The Messages area contains CRM messages. You can open existing messages or create a new message.",
    actions: [
      { label: "Open Messages", route: "/advisor-dashboard/messages" },
      { label: "New Message", route: "/advisor-dashboard/messages/new" },
    ],
    suggestions: ["How do I create a message?", "Open documents"],
  },
  {
    id: "new-message",
    title: "Create a message",
    keywords: ["new message", "create message", "send message", "message client", "compose message"],
    answer: "Use New Message from the Messages area to create a CRM message.",
    actions: [{ label: "New Message", route: "/advisor-dashboard/messages/new" }],
    suggestions: ["Open messages", "Open client documents"],
  },
  {
    id: "documents",
    title: "Documents",
    keywords: ["documents", "files", "document center", "client files", "document management", "all documents"],
    answer:
      "Use Document Center to view CRM documents. You can also open individual documents, edit document details, or use the Upload Document page.",
    actions: [
      { label: "Open Documents", route: "/advisor-dashboard/documents" },
      { label: "Upload Document", route: "/advisor-dashboard/documents/upload" },
    ],
    suggestions: ["How do I upload a document?", "Where are this client's documents?"],
  },
  {
    id: "upload-document",
    title: "Upload a document",
    keywords: ["upload document", "upload documents", "upload file", "add document", "new document", "attach document", "upload client file"],
    answer: "Use Upload Document in the Document Center to add a file to FinPlan.",
    actions: [{ label: "Upload Document", route: "/advisor-dashboard/documents/upload" }],
    suggestions: ["Open documents", "Open client documents"],
  },

  // ---------------------------------------------------------------------------
  // ADVISOR WORKSPACES
  // ---------------------------------------------------------------------------
  {
    id: "reports",
    title: "Reports",
    keywords: ["reports", "client reports", "financial reports", "reporting", "report workspace"],
    answer:
      "The Reports workspace is available from the advisor portal. Reporting is still an evolving FinPlan module, so the guide will not claim report capabilities that are not implemented yet.",
    actions: [{ label: "Open Reports", route: "/advisor-dashboard/reports" }],
    suggestions: ["Open portfolio", "Open documents"],
  },
  {
    id: "portfolio",
    title: "Advisor portfolio",
    keywords: ["portfolio", "holdings", "advisor portfolio", "portfolio page", "portfolio oversight"],
    answer:
      "The advisor Portfolio workspace is available, and individual client portfolio pages also exist. Portfolio functionality is still being expanded and may not yet represent the final production investment model.",
    actions: [
      { label: "Open Portfolio", route: "/advisor-dashboard/portfolio" },
      {
        label: "This Client's Portfolio",
        route: "/advisor-dashboard/clients/:clientId/portfolio",
        requires: ["clientId"],
      },
    ],
    contextAreas: ["client"],
    suggestions: ["Open reports", "What investment pages are available?"],
  },
  {
    id: "notifications",
    title: "Notifications",
    keywords: ["notifications", "alerts", "bell", "notification center", "advisor alerts"],
    answer:
      "The Notifications page is available from the advisor portal. The notification domain is still being developed.",
    actions: [{ label: "Open Notifications", route: "/advisor-dashboard/notifications" }],
    suggestions: ["Open dashboard", "Open tasks"],
  },
  {
    id: "profile",
    title: "Advisor profile",
    keywords: ["profile", "advisor profile", "my profile", "account profile", "advisor account"],
    answer: "Open Profile to view the advisor profile area.",
    actions: [{ label: "Open Profile", route: "/advisor-dashboard/profile" }],
    suggestions: ["Open dashboard", "What can FinPlan Guide do?"],
  },

  // ---------------------------------------------------------------------------
  // AUTH / PUBLIC SITE
  // ---------------------------------------------------------------------------
  {
    id: "login",
    title: "Login",
    keywords: ["login", "sign in", "log in", "advisor login", "access account"],
    answer: "Use the Login page to sign in to FinPlan.",
    actions: [{ label: "Open Login", route: "/login" }],
    suggestions: ["Forgot password", "Register account"],
  },
  {
    id: "register",
    title: "Register",
    keywords: ["register", "sign up", "create account", "new account", "registration"],
    answer: "Use the Register page to create a FinPlan account where registration is available.",
    actions: [{ label: "Open Register", route: "/register" }],
    suggestions: ["Open login", "Forgot password"],
  },
  {
    id: "forgot-password",
    title: "Forgot password",
    keywords: ["forgot password", "reset password", "password reset", "cant login", "cannot login"],
    answer: "Use Forgot Password to start the FinPlan password-reset flow.",
    actions: [{ label: "Reset Password", route: "/forgot-password" }],
    suggestions: ["Open login"],
  },
  {
    id: "pricing",
    title: "Pricing",
    keywords: ["pricing", "plans", "subscription", "cost", "price", "finplan price"],
    answer: "FinPlan has a public Pricing page for plan and pricing information presented on the site.",
    actions: [{ label: "Open Pricing", route: "/pricing" }],
    suggestions: ["Contact FinPlan", "About FinPlan"],
  },
  {
    id: "contact",
    title: "Contact FinPlan",
    keywords: ["contact", "contact finplan", "support", "get in touch", "contact us", "help desk"],
    answer: "Use the Contact page to reach FinPlan through the contact options provided on the site.",
    actions: [{ label: "Open Contact", route: "/contact" }],
    suggestions: ["About FinPlan", "Pricing"],
  },
  {
    id: "company",
    title: "About FinPlan",
    keywords: ["company", "about finplan", "about company", "who is finplan", "company information"],
    answer:
      "The Company section contains public information about FinPlan, including the company overview, story, advisors, and careers pages.",
    actions: [
      { label: "Company", route: "/company" },
      { label: "Our Story", route: "/company/our-story" },
    ],
    suggestions: ["FinPlan advisors", "Careers", "Contact FinPlan"],
  },
  {
    id: "company-advisors",
    title: "FinPlan advisors",
    keywords: ["advisors page", "company advisors", "financial advisors", "meet advisors", "our advisors"],
    answer: "The public Advisors page is available under the Company section.",
    actions: [{ label: "Open Advisors", route: "/company/advisors" }],
    suggestions: ["About FinPlan", "Contact FinPlan"],
  },
  {
    id: "careers",
    title: "Careers",
    keywords: ["careers", "jobs", "work at finplan", "join finplan", "vacancies"],
    answer: "Use the Careers page to view career information published by FinPlan.",
    actions: [{ label: "Open Careers", route: "/company/careers" }],
    suggestions: ["About FinPlan", "Contact FinPlan"],
  },

  // ---------------------------------------------------------------------------
  // PUBLIC GOALS
  // ---------------------------------------------------------------------------
  {
    id: "goals",
    title: "Financial goals",
    keywords: ["goals", "financial goals", "goal planning", "goal pages", "plan goal"],
    answer:
      "FinPlan's public Goals area includes Retirement, Education, Home, and Wealth goal pages.",
    actions: [{ label: "Open Goals", route: "/goals" }],
    suggestions: ["Retirement goal", "Education goal", "Home goal", "Wealth goal"],
  },
  {
    id: "retirement-goal",
    title: "Retirement goal",
    keywords: ["retirement goal", "retirement planning", "plan retirement", "retirement page"],
    answer: "Use the Retirement goal page for FinPlan's public retirement-planning information.",
    actions: [
      { label: "Retirement Goal", route: "/goals/retirement" },
      { label: "Retirement Corpus Calculator", route: "/tools/retirement-corpus" },
    ],
    suggestions: ["Retirement corpus calculator", "Goal planner"],
  },
  {
    id: "education-goal",
    title: "Education goal",
    keywords: ["education goal", "child education", "education planning", "college goal"],
    answer: "Use the Education goal page for FinPlan's public education-planning information.",
    actions: [{ label: "Education Goal", route: "/goals/education" }],
    suggestions: ["Goal planner", "Inflation calculator"],
  },
  {
    id: "home-goal",
    title: "Home goal",
    keywords: ["home goal", "buy house", "house planning", "home purchase goal", "property goal"],
    answer: "Use the Home goal page for FinPlan's public home-purchase planning information.",
    actions: [{ label: "Home Goal", route: "/goals/home" }],
    suggestions: ["Goal planner", "EMI calculator"],
  },
  {
    id: "wealth-goal",
    title: "Wealth goal",
    keywords: ["wealth goal", "wealth creation", "build wealth", "wealth planning"],
    answer: "Use the Wealth goal page for FinPlan's public wealth-creation information.",
    actions: [{ label: "Wealth Goal", route: "/goals/wealth" }],
    suggestions: ["SIP calculator", "Lumpsum calculator", "Goal planner"],
  },

  // ---------------------------------------------------------------------------
  // INVESTMENTS / PROTECTION
  // ---------------------------------------------------------------------------
  {
    id: "investments",
    title: "Investment information",
    keywords: ["investments", "investment pages", "investment options", "learn investments"],
    answer:
      "The public Investments area includes Mutual Funds, Fixed Deposits, and PPF/EPF/NPS information pages.",
    actions: [{ label: "Open Investments", route: "/investments" }],
    suggestions: ["Mutual funds", "Fixed deposits", "PPF EPF NPS"],
  },
  {
    id: "mutual-funds",
    title: "Mutual funds",
    keywords: ["mutual funds", "mutual fund", "mf", "fund investing"],
    answer: "FinPlan has a public Mutual Funds information page in the Investments section.",
    actions: [{ label: "Mutual Funds", route: "/investments/mutual-funds" }],
    suggestions: ["SIP basics", "SIP calculator"],
  },
  {
    id: "fixed-deposits",
    title: "Fixed deposits",
    keywords: ["fixed deposit", "fixed deposits", "fd", "deposit investment"],
    answer: "FinPlan has a public Fixed Deposits information page in the Investments section.",
    actions: [{ label: "Fixed Deposits", route: "/investments/fixed-deposits" }],
    suggestions: ["Open investments", "Tax saving"],
  },
  {
    id: "ppf-epf-nps",
    title: "PPF EPF NPS",
    keywords: ["ppf", "epf", "nps", "ppf epf nps", "pension investment", "provident fund"],
    answer: "FinPlan has a public PPF/EPF/NPS information page in the Investments section.",
    actions: [{ label: "PPF / EPF / NPS", route: "/investments/ppf-epf-nps" }],
    suggestions: ["Retirement goal", "Tax saving"],
  },
  {
    id: "protection",
    title: "Protection planning",
    keywords: ["protection", "insurance information", "protection planning", "health term tax saving"],
    answer:
      "FinPlan's public Protection content includes Health, Term Life, and Tax Saving pages.",
    actions: [
      { label: "Health", route: "/protection/health" },
      { label: "Term Life", route: "/protection/term-life" },
      { label: "Tax Saving", route: "/protection/tax-saving" },
    ],
    suggestions: ["Health protection", "Term life", "Tax saving"],
  },
  {
    id: "health-protection",
    title: "Health protection",
    keywords: ["health protection", "health insurance", "medical insurance", "health page"],
    answer: "Use the Health protection page for FinPlan's public health-protection information.",
    actions: [{ label: "Health Protection", route: "/protection/health" }],
    suggestions: ["Term life", "Tax saving"],
  },
  {
    id: "term-life",
    title: "Term life",
    keywords: ["term life", "term insurance", "life insurance", "life cover"],
    answer: "Use the Term Life page for FinPlan's public term-life information.",
    actions: [{ label: "Term Life", route: "/protection/term-life" }],
    suggestions: ["Health protection", "Tax saving"],
  },
  {
    id: "tax-saving",
    title: "Tax saving",
    keywords: ["tax saving", "save tax", "tax planning", "tax protection"],
    answer:
      "FinPlan has a public Tax Saving page and a Tax Guide in Resources. These pages provide site information and education rather than personalized tax advice.",
    actions: [
      { label: "Tax Saving", route: "/protection/tax-saving" },
      { label: "Tax Guide", route: "/resources/tax-guide" },
    ],
    suggestions: ["Tax guide", "PPF EPF NPS"],
  },

  // ---------------------------------------------------------------------------
  // TOOLS
  // ---------------------------------------------------------------------------
  {
    id: "financial-tools",
    title: "Financial tools",
    keywords: ["tools", "calculators", "financial calculators", "all calculators", "finplan tools"],
    answer:
      "FinPlan's Tools area includes SIP, Step-Up SIP, Lumpsum, Lumpsum + SIP, EMI, Inflation, SWP, XIRR, Retirement Corpus, Goal Planner, Goal Tracker, and Portfolio Review pages.",
    actions: [{ label: "Open Tools", route: "/tools" }],
    suggestions: ["SIP calculator", "EMI calculator", "Retirement corpus", "Goal planner"],
  },
  {
    id: "sip-calculator",
    title: "SIP calculator",
    keywords: ["sip calculator", "calculate sip", "sip tool", "monthly investment calculator", "sip return"],
    answer: "FinPlan has a public SIP Calculator in the Tools area.",
    actions: [{ label: "Open SIP Calculator", route: "/tools/sip-calculator" }],
    suggestions: ["Step-up SIP", "Lumpsum calculator", "SIP basics"],
  },
  {
    id: "step-up-sip",
    title: "Step-Up SIP calculator",
    keywords: ["step up sip", "step-up sip", "increase sip", "sip increase calculator", "growing sip"],
    answer: "Use the Step-Up SIP tool for calculations that increase SIP contributions over time.",
    actions: [{ label: "Step-Up SIP", route: "/tools/step-up-sip" }],
    suggestions: ["SIP calculator", "Goal planner"],
  },
  {
    id: "lumpsum-calculator",
    title: "Lumpsum calculator",
    keywords: ["lumpsum calculator", "lump sum calculator", "one time investment", "lumpsum return"],
    answer: "Use the Lumpsum Calculator for one-time investment calculations.",
    actions: [{ label: "Lumpsum Calculator", route: "/tools/lumpsum-calculator" }],
    suggestions: ["Lumpsum plus SIP", "SIP calculator"],
  },
  {
    id: "lumpsum-plus-sip",
    title: "Lumpsum plus SIP",
    keywords: ["lumpsum plus sip", "lump sum plus sip", "sip with lumpsum", "combined investment calculator"],
    answer: "Use the Lumpsum + SIP tool for a combined one-time and recurring-investment calculation.",
    actions: [{ label: "Lumpsum + SIP", route: "/tools/lumpsum-plus-sip" }],
    suggestions: ["SIP calculator", "Lumpsum calculator"],
  },
  {
    id: "emi-calculator",
    title: "EMI calculator",
    keywords: ["emi calculator", "loan emi", "monthly loan payment", "calculate emi", "loan calculator"],
    answer: "FinPlan has a public EMI Calculator in the Tools area.",
    actions: [{ label: "Open EMI Calculator", route: "/tools/emi-calculator" }],
    suggestions: ["Home goal", "Financial tools"],
  },
  {
    id: "inflation-calculator",
    title: "Inflation calculator",
    keywords: ["inflation calculator", "inflation", "future cost", "inflation adjusted"],
    answer: "Use the Inflation Calculator to explore how inflation affects future costs.",
    actions: [{ label: "Inflation Calculator", route: "/tools/inflation-calculator" }],
    suggestions: ["Education goal", "Retirement goal"],
  },
  {
    id: "swp-calculator",
    title: "SWP calculator",
    keywords: ["swp calculator", "systematic withdrawal plan", "withdrawal calculator", "swp"],
    answer: "FinPlan has a public SWP Calculator in the Tools area.",
    actions: [{ label: "SWP Calculator", route: "/tools/swp-calculator" }],
    suggestions: ["SIP calculator", "Retirement corpus"],
  },
  {
    id: "xirr-calculator",
    title: "XIRR calculator",
    keywords: ["xirr calculator", "xirr", "irregular cash flow return", "annualized return"],
    answer: "FinPlan has a public XIRR Calculator in the Tools area.",
    actions: [{ label: "XIRR Calculator", route: "/tools/xirr-calculator" }],
    suggestions: ["Portfolio review", "Financial tools"],
  },
  {
    id: "retirement-corpus",
    title: "Retirement corpus calculator",
    keywords: ["retirement calculator", "retirement corpus", "retirement corpus calculator", "how much for retirement"],
    answer: "Use the Retirement Corpus calculator for retirement-corpus planning calculations.",
    actions: [
      { label: "Retirement Corpus", route: "/tools/retirement-corpus" },
      { label: "Retirement Goal", route: "/goals/retirement" },
    ],
    suggestions: ["Retirement goal", "Inflation calculator"],
  },
  {
    id: "goal-planner",
    title: "Goal planner",
    keywords: ["goal planner", "plan goal", "goal calculator", "financial goal calculator"],
    answer: "Use the Goal Planner tool to work through goal-planning inputs on the public site.",
    actions: [{ label: "Goal Planner", route: "/tools/goal-planner" }],
    suggestions: ["Goal tracker", "Financial goals"],
  },
  {
    id: "goal-tracker",
    title: "Goal tracker",
    keywords: ["goal tracker", "track goal", "goal progress", "track financial goal"],
    answer: "FinPlan has a Goal Tracker page in the Tools area.",
    actions: [{ label: "Goal Tracker", route: "/tools/goal-tracker" }],
    suggestions: ["Goal planner", "Financial goals"],
  },
  {
    id: "portfolio-review-tool",
    title: "Portfolio review tool",
    keywords: ["portfolio review", "review portfolio", "portfolio review tool", "portfolio checker"],
    answer: "FinPlan has a public Portfolio Review page in the Tools area.",
    actions: [{ label: "Portfolio Review", route: "/tools/portfolio-review" }],
    suggestions: ["XIRR calculator", "Open advisor portfolio"],
  },

  // ---------------------------------------------------------------------------
  // RESOURCES
  // ---------------------------------------------------------------------------
  {
    id: "resources",
    title: "Financial resources",
    keywords: ["resources", "learn", "education", "learning center", "financial education", "resources page"],
    answer:
      "The public Resources area contains educational pages including SIP Basics, Tax Guide, and the Blog.",
    actions: [{ label: "Open Resources", route: "/resources" }],
    suggestions: ["SIP basics", "Tax guide", "Blog"],
  },
  {
    id: "sip-basics",
    title: "SIP basics",
    keywords: ["sip basics", "learn sip", "what is sip", "sip education", "sip guide"],
    answer: "Use SIP Basics in Resources for FinPlan's educational SIP content.",
    actions: [
      { label: "SIP Basics", route: "/resources/sip-basics" },
      { label: "SIP Calculator", route: "/tools/sip-calculator" },
    ],
    suggestions: ["SIP calculator", "Mutual funds"],
  },
  {
    id: "tax-guide",
    title: "Tax guide",
    keywords: ["tax guide", "tax resource", "learn tax", "tax education"],
    answer:
      "Use the Tax Guide in Resources for FinPlan's educational tax content. It is not a substitute for personalized professional tax advice.",
    actions: [{ label: "Tax Guide", route: "/resources/tax-guide" }],
    suggestions: ["Tax saving", "Resources"],
  },
  {
    id: "blog",
    title: "FinPlan blog",
    keywords: ["blog", "articles", "financial articles", "finplan blog", "read articles"],
    answer: "The Blog is available in the Resources section.",
    actions: [{ label: "Open Blog", route: "/resources/blog" }],
    suggestions: ["Resources", "SIP basics", "Tax guide"],
  },

  // ---------------------------------------------------------------------------
  // TROUBLESHOOTING / COMMON QUESTIONS
  // ---------------------------------------------------------------------------
  {
    id: "cant-find-feature",
    title: "Cannot find a feature",
    keywords: ["cant find", "cannot find", "where is feature", "missing menu", "not seeing", "where did it go"],
    answer:
      "Tell me the feature name or what you are trying to do. I can match it to a known FinPlan page or explain when that feature is still under development.",
    actions: [{ label: "Open Dashboard", route: "/advisor-dashboard" }],
    suggestions: ["Clients", "Households", "Transactions", "Documents"],
  },
  {
    id: "feature-not-ready",
    title: "Feature still under development",
    keywords: ["not working yet", "feature incomplete", "coming soon", "under development", "not implemented"],
    answer:
      "Some FinPlan areas are still evolving, especially deeper portfolio, reporting, notification, goal-planning, and advanced financial-account workflows. I will distinguish available pages from features that are not yet complete.",
    suggestions: ["What can you do?", "Open dashboard"],
  },
  {
    id: "financial-advice-boundary",
    title: "Financial advice",
    keywords: [
      "what should i invest",
      "which fund should i buy",
      "buy stock",
      "sell stock",
      "investment recommendation",
      "give financial advice",
    ],
    answer:
      "FinPlan Guide is a product-help assistant, not a personalized investment-advice engine. I can take you to FinPlan's educational pages and calculators, but I do not recommend specific investments for you.",
    actions: [
      { label: "Investment Information", route: "/investments" },
      { label: "Financial Tools", route: "/tools" },
    ],
    suggestions: ["Open investments", "Open tools", "SIP basics"],
  },
];
