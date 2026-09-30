import { GUIDE_KNOWLEDGE } from "./knowledge";
import type {
  GuideAction,
  GuideContext,
  GuideContextKey,
  GuideKnowledgeEntry,
  GuideReply,
} from "./types";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "can",
  "do",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "please",
  "show",
  "the",
  "this",
  "to",
  "where",
  "with",
]);

const SYNONYMS: Array<[RegExp, string]> = [
  [/\bcustomers?\b/g, "client"],
  [/\bfamilies\b/g, "family"],
  [/\bhouse holds?\b/g, "household"],
  [/\bpayments?\b/g, "transaction"],
  [/\bfiles?\b/g, "document"],
  [/\bappointments?\b/g, "meeting"],
  [/\bto[- ]?dos?\b/g, "task"],
  [/\bfollow[- ]?ups?\b/g, "task"],
  [/\bmsgs?\b/g, "message"],
  [/\bsignin\b/g, "login"],
  [/\bsign in\b/g, "login"],
  [/\bsignup\b/g, "register"],
  [/\bsign up\b/g, "register"],
  [/\bgo to\b/g, "open"],
  [/\btake me to\b/g, "open"],
  [/\bnavigate to\b/g, "open"],
  [/\btransection(s)?\b/g, "transaction"],
  [/\bdoc(s)?\b/g, "document"],
];

const GREETINGS = new Set([
  "hi",
  "hello",
  "hey",
  "good morning",
  "good afternoon",
  "good evening",
  "hello finplan",
  "hi finplan",
]);

const THANKS = new Set(["thanks", "thank you", "thankyou", "great thanks", "ok thanks", "got it thanks"]);

const FOLLOW_UP_MORE = new Set([
  "tell me more",
  "explain more",
  "more",
  "how does that work",
  "how it works",
  "what else",
]);

const FOLLOW_UP_OPEN = new Set([
  "open it",
  "go there",
  "take me there",
  "show me",
  "open page",
  "open that",
]);

function normalize(value: string): string {
  let output = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['\u2019]s\b/g, "")
    .replace(/[^a-z0-9\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  for (const [pattern, replacement] of SYNONYMS) {
    output = output.replace(pattern, replacement);
  }

  return output.replace(/\s+/g, " ").trim();
}

function tokens(value: string): string[] {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost
      );
    }

    for (let j = 0; j <= b.length; j += 1) {
      previous[j] = current[j];
    }
  }

  return previous[b.length];
}

function tokenSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 4 || b.length < 4) return 0;

  const longest = Math.max(a.length, b.length);
  return 1 - levenshtein(a, b) / longest;
}

function entryScore(query: string, entry: GuideKnowledgeEntry, context: GuideContext): number {
  const normalizedQuery = normalize(query);
  const queryTokens = tokens(query);
  const title = normalize(entry.title);

  let score = 0;

  if (normalizedQuery === title) score += 45;
  if (normalizedQuery.includes(title) || title.includes(normalizedQuery)) score += 18;

  for (const keyword of entry.keywords) {
    const normalizedKeyword = normalize(keyword);
    const keywordTokens = tokens(keyword);

    if (normalizedQuery === normalizedKeyword) {
      score += 50;
      continue;
    }

    if (normalizedQuery.includes(normalizedKeyword)) {
      score += 28 + Math.min(keywordTokens.length * 2, 10);
    }

    for (const queryToken of queryTokens) {
      let best = 0;
      for (const keywordToken of keywordTokens) {
        best = Math.max(best, tokenSimilarity(queryToken, keywordToken));
      }

      if (best === 1) score += 5;
      else if (best >= 0.82) score += 2.5;
    }
  }

  if (entry.contextAreas?.includes(context.area)) {
    score += 12;
  }

  return score;
}

export function getGuideContext(pathname: string): GuideContext {
  const clientMatch = pathname.match(/^\/advisor-dashboard\/clients\/(\d+)(?:\/|$)/);
  if (clientMatch) {
    return { pathname, area: "client", clientId: clientMatch[1] };
  }

  const groupMatch = pathname.match(/^\/advisor-dashboard\/groups\/(\d+)(?:\/|$)/);
  if (groupMatch) {
    return { pathname, area: "group", groupId: groupMatch[1] };
  }

  const meetingMatch = pathname.match(/^\/advisor-dashboard\/meetings\/(\d+)(?:\/|$)/);
  if (meetingMatch) {
    return { pathname, area: "meeting", meetingId: meetingMatch[1] };
  }

  const taskMatch = pathname.match(/^\/advisor-dashboard\/tasks\/(\d+)(?:\/|$)/);
  if (taskMatch) {
    return { pathname, area: "task", taskId: taskMatch[1] };
  }

  const documentMatch = pathname.match(/^\/advisor-dashboard\/documents\/(\d+)(?:\/|$)/);
  if (documentMatch) {
    return { pathname, area: "document", documentId: documentMatch[1] };
  }

  if (pathname.startsWith("/advisor-dashboard")) {
    return { pathname, area: "advisor" };
  }

  return { pathname, area: "public" };
}

function actionIsAvailable(action: GuideAction, context: GuideContext): boolean {
  return (action.requires ?? []).every((key) => Boolean(context[key]));
}

function resolveRoute(route: string, context: GuideContext): string {
  const replacements: Partial<Record<GuideContextKey, string | undefined>> = {
    clientId: context.clientId,
    groupId: context.groupId,
    meetingId: context.meetingId,
    taskId: context.taskId,
    documentId: context.documentId,
  };

  let resolved = route;

  for (const [key, value] of Object.entries(replacements)) {
    if (value) {
      resolved = resolved.replace(`:${key}`, value);
    }
  }

  return resolved;
}

function resolveEntry(entry: GuideKnowledgeEntry, context: GuideContext, confidence: number): GuideReply {
  const actions = (entry.actions ?? [])
    .filter((action) => actionIsAvailable(action, context))
    .map((action) => ({
      label: action.label,
      route: resolveRoute(action.route, context),
    }));

  return {
    answer: entry.answer,
    actions,
    suggestions: entry.suggestions ?? [],
    matchedEntryId: entry.id,
    confidence,
  };
}

function currentPageReply(context: GuideContext): GuideReply {
  if (context.area === "client") {
    return {
      answer: `You are in Client #${context.clientId}. I can help you open this client's Edit, Documents, Goals, Notes, Portfolio, Settings, or Timeline pages.`,
      actions: [
        { label: "Client Overview", route: `/advisor-dashboard/clients/${context.clientId}` },
        { label: "Edit Client", route: `/advisor-dashboard/clients/${context.clientId}/edit` },
      ],
      suggestions: ["Open this client's documents", "Open this client's notes", "Open this client's goals"],
      confidence: 1,
    };
  }

  if (context.area === "group") {
    return {
      answer: `You are in Group #${context.groupId}. I can explain membership rules, moving clients, membership history, and group-head changes.`,
      actions: [{ label: "This Group", route: `/advisor-dashboard/groups/${context.groupId}` }],
      suggestions: ["How do I move a client?", "Change household head", "Membership history"],
      confidence: 1,
    };
  }

  if (context.area === "meeting") {
    return {
      answer: `You are viewing Meeting #${context.meetingId}.`,
      actions: [
        { label: "Meeting", route: `/advisor-dashboard/meetings/${context.meetingId}` },
        { label: "Edit Meeting", route: `/advisor-dashboard/meetings/${context.meetingId}/edit` },
      ],
      suggestions: ["Open meetings", "Create a meeting"],
      confidence: 1,
    };
  }

  if (context.area === "task") {
    return {
      answer: `You are viewing Task #${context.taskId}.`,
      actions: [
        { label: "Task", route: `/advisor-dashboard/tasks/${context.taskId}` },
        { label: "Edit Task", route: `/advisor-dashboard/tasks/${context.taskId}/edit` },
      ],
      suggestions: ["Open tasks", "Create a task"],
      confidence: 1,
    };
  }

  if (context.area === "document") {
    return {
      answer: `You are viewing Document #${context.documentId}.`,
      actions: [
        { label: "Document", route: `/advisor-dashboard/documents/${context.documentId}` },
        { label: "Edit Document", route: `/advisor-dashboard/documents/${context.documentId}/edit` },
      ],
      suggestions: ["Open documents", "Upload a document"],
      confidence: 1,
    };
  }

  if (context.area === "advisor") {
    return {
      answer: "You are inside the Advisor Dashboard. I can help you navigate Clients, Households, Transactions, Meetings, Tasks, Messages, Documents, Reports, Portfolio, Notifications, and Profile.",
      actions: [{ label: "Advisor Dashboard", route: "/advisor-dashboard" }],
      suggestions: ["Open clients", "Open households", "Open transactions", "Open documents"],
      confidence: 1,
    };
  }

  return {
    answer: "You are on the public FinPlan site. I can help you find Goals, Investments, Protection, Tools, Resources, Pricing, Company, Contact, Login, and Register pages.",
    actions: [{ label: "FinPlan Home", route: "/" }],
    suggestions: ["Open tools", "Open investments", "Pricing", "Contact FinPlan"],
    confidence: 1,
  };
}

export function getGuideQuickQuestions(pathname: string): string[] {
  const context = getGuideContext(pathname);

  if (context.area === "client") {
    return [
      "Edit this client",
      "Open this client's documents",
      "Open this client's notes",
      "Open this client's goals",
    ];
  }

  if (context.area === "group") {
    return [
      "How do I move a client?",
      "Change household head",
      "Membership history",
      "Can a client belong to HUF too?",
    ];
  }

  if (context.area === "public") {
    return ["What tools are available?", "Show investments", "Show financial goals", "Contact FinPlan"];
  }

  return [
    "How do I add a client?",
    "How do households work?",
    "Open transactions",
    "Where do I upload documents?",
  ];
}

export function matchGuideQuery(
  query: string,
  pathname: string,
  previousEntryId?: string
): GuideReply {
  const cleaned = normalize(query);
  const context = getGuideContext(pathname);

  if (!cleaned) {
    return {
      answer: "Ask me where something is or how a FinPlan workflow works.",
      actions: [],
      suggestions: getGuideQuickQuestions(pathname),
      confidence: 0,
    };
  }

  if (GREETINGS.has(cleaned)) {
    return {
      answer: "Hi! I'm FinPlan Guide. Ask me how a FinPlan feature works, where to find something, or use one of the shortcuts below.",
      actions: [],
      suggestions: getGuideQuickQuestions(pathname),
      confidence: 1,
    };
  }

  if (THANKS.has(cleaned)) {
    return {
      answer: "You're welcome. Ask me another FinPlan question whenever you need help.",
      actions: [],
      suggestions: getGuideQuickQuestions(pathname),
      confidence: 1,
    };
  }

  if (
    cleaned === "where am i" ||
    cleaned === "what page am i on" ||
    cleaned === "what is this page" ||
    cleaned === "current page" ||
    cleaned === "explain this page"
  ) {
    return currentPageReply(context);
  }

  if (previousEntryId && (FOLLOW_UP_MORE.has(cleaned) || FOLLOW_UP_OPEN.has(cleaned))) {
    const previousEntry = GUIDE_KNOWLEDGE.find((entry) => entry.id === previousEntryId);
    if (previousEntry) {
      const resolved = resolveEntry(previousEntry, context, 1);
      if (FOLLOW_UP_OPEN.has(cleaned)) {
        return {
          ...resolved,
          answer: resolved.actions.length
            ? "Sure — use the shortcut below."
            : "That topic does not have a direct navigation shortcut from the current page, but I can still explain it.",
        };
      }
      return resolved;
    }
  }

  const ranked = GUIDE_KNOWLEDGE
    .map((entry) => ({ entry, score: entryScore(cleaned, entry, context) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];

  if (!best || best.score < 9) {
    return {
      answer:
        "I couldn't match that to a FinPlan help topic yet. Try asking about Clients, Households, Transactions, Meetings, Tasks, Messages, Documents, Reports, Portfolio, Tools, Goals, Investments, Login, Pricing, or a specific workflow.",
      actions: [
        { label: "Clients", route: "/advisor-dashboard/clients" },
        { label: "Households", route: "/advisor-dashboard/groups" },
        { label: "Dashboard", route: "/advisor-dashboard" },
      ],
      suggestions: getGuideQuickQuestions(pathname),
      confidence: 0,
    };
  }

  return resolveEntry(best.entry, context, Math.min(best.score / 60, 1));
}
