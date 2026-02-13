export type AgentStatus = "live" | "building" | "paused" | "error";

export interface AgentDataRow {
  cells: string[];
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  status: AgentStatus;
  schedule: string;
  subscribers: number;
  lastRun: string;
  columns: string[];
  rows: AgentDataRow[];
  createdAt: number;
  sandboxId?: string;
  previewUrl?: string;
  errorMessage?: string;
}

const EXAMPLE_AGENTS: Agent[] = [
  {
    id: "narrative-sniffer",
    name: "Narrative Sniffer",
    description: "Detect emerging narratives on US stocks before price moves",
    icon: "TrendingUp",
    iconBg: "bg-success/10",
    iconColor: "text-success",
    status: "live",
    schedule: "Every 6 hours",
    subscribers: 18492,
    lastRun: "3 hours ago",
    columns: ["Ticker", "New Narrative", "Strength", "Price 7d"],
    rows: [
      {
        cells: [
          "HIMS",
          "GLP-1 compounding play, FDA tailwind...",
          "92",
          "+1.2%",
        ],
      },
      { cells: ["IONQ", "Quantum computing govt contracts...", "87", "-0.5%"] },
      { cells: ["RKLB", "Space economy re-rate, Neutron...", "84", "+0.8%"] },
      {
        cells: [
          "CELH",
          "Distribution expansion + Pepsi push...",
          "79",
          "-2.1%",
        ],
      },
    ],
    createdAt: Date.now() - 86400000,
  },
  {
    id: "twitter-sentiment",
    name: "Twitter Stock Sentiment",
    description: "Daily hot tweets about stocks with bull/bear classification",
    icon: "Twitter",
    iconBg: "bg-info/10",
    iconColor: "text-info",
    status: "live",
    schedule: "Every 6 hours",
    subscribers: 12345,
    lastRun: "2 hours ago",
    columns: ["Ticker", "Tweet", "Signal", "Score"],
    rows: [
      {
        cells: [
          "$NVDA",
          "Blackwell demand is insane, datacenter...",
          "BULL",
          "92",
        ],
      },
      {
        cells: [
          "$TSLA",
          "Margins compressing, competition in CN...",
          "BEAR",
          "78",
        ],
      },
      {
        cells: ["$AAPL", "Vision Pro sales beat expectations...", "BULL", "85"],
      },
      { cells: ["$AMD", "MI300X taking share from NVIDIA...", "BULL", "71"] },
    ],
    createdAt: Date.now() - 172800000,
  },
  {
    id: "fund-holdings",
    name: "Fund Holdings Tracker",
    description: "Track 13F filings and portfolio changes from top hedge funds",
    icon: "Building2",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    status: "live",
    schedule: "Daily 9:00 AM",
    subscribers: 9164,
    lastRun: "5 hours ago",
    columns: ["Fund", "Action", "Ticker", "Change"],
    rows: [
      { cells: ["Bridgewater", "BUY", "NVDA", "+2.4M shares"] },
      { cells: ["ARK Invest", "SELL", "TSLA", "-890K shares"] },
      { cells: ["Citadel", "BUY", "META", "+1.1M shares"] },
      { cells: ["Renaissance", "NEW", "PLTR", "+3.2M shares"] },
    ],
    createdAt: Date.now() - 259200000,
  },
];

function generateRandomRows(columns: string[]): AgentDataRow[] {
  const tickers = [
    "NVDA",
    "TSLA",
    "AAPL",
    "MSFT",
    "META",
    "GOOG",
    "AMZN",
    "AMD",
    "PLTR",
    "COIN",
  ];
  const narratives = [
    "AI infrastructure play accelerating...",
    "Revenue growth surpassing estimates...",
    "Market share expanding rapidly...",
    "New product cycle driving momentum...",
    "Institutional accumulation detected...",
    "Earnings revision cycle starting...",
    "Sector rotation favoring position...",
    "Technical breakout confirmed...",
  ];
  const signals = ["BULL", "BEAR", "BULL", "BULL"];
  const changes = [
    "+2.1%",
    "-0.8%",
    "+3.4%",
    "-1.2%",
    "+0.5%",
    "+1.8%",
    "-0.3%",
    "+4.2%",
  ];

  const rowCount = 3 + Math.floor(Math.random() * 2);
  const rows: AgentDataRow[] = [];

  for (let i = 0; i < rowCount; i++) {
    const cells: string[] = columns.map((col) => {
      const colLower = col.toLowerCase();
      if (colLower.includes("ticker") || colLower.includes("symbol")) {
        return tickers[Math.floor(Math.random() * tickers.length)];
      }
      if (
        colLower.includes("narrative") ||
        colLower.includes("tweet") ||
        colLower.includes("take") ||
        colLower.includes("summary")
      ) {
        return narratives[Math.floor(Math.random() * narratives.length)];
      }
      if (
        colLower.includes("signal") ||
        colLower.includes("stance") ||
        colLower.includes("action")
      ) {
        return signals[Math.floor(Math.random() * signals.length)];
      }
      if (colLower.includes("score") || colLower.includes("strength")) {
        return String(60 + Math.floor(Math.random() * 35));
      }
      if (
        colLower.includes("price") ||
        colLower.includes("change") ||
        colLower.includes("24h")
      ) {
        return changes[Math.floor(Math.random() * changes.length)];
      }
      if (
        colLower.includes("fund") ||
        colLower.includes("kol") ||
        colLower.includes("source")
      ) {
        const names = [
          "Bridgewater",
          "ARK Invest",
          "Citadel",
          "Renaissance",
          "Two Sigma",
        ];
        return names[Math.floor(Math.random() * names.length)];
      }
      return "—";
    });
    rows.push({ cells });
  }

  return rows;
}

export function refreshAgentData(agent: Agent): Agent {
  return {
    ...agent,
    rows: generateRandomRows(agent.columns),
    lastRun: "Just now",
  };
}

export function getExampleAgents(): Agent[] {
  return EXAMPLE_AGENTS;
}

export interface AgentMetadata {
  name: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  description: string;
  columns: string[];
}

export function deriveAgentMetadata(prompt: string): AgentMetadata {
  const lowerPrompt = prompt.toLowerCase();

  let name = "Custom Agent";
  let icon = "Bot";
  let iconBg = "bg-primary/10";
  let iconColor = "text-primary";
  let columns = ["Ticker", "Summary", "Signal", "Score"];

  if (
    lowerPrompt.includes("twitter") ||
    lowerPrompt.includes("tweet") ||
    lowerPrompt.includes("sentiment")
  ) {
    name = "Twitter Sentiment Tracker";
    icon = "Twitter";
    iconBg = "bg-info/10";
    iconColor = "text-info";
    columns = ["Ticker", "Tweet", "Signal", "Score"];
  } else if (
    lowerPrompt.includes("reddit") ||
    lowerPrompt.includes("wallstreetbets") ||
    lowerPrompt.includes("wsb")
  ) {
    name = "Reddit Sentiment Monitor";
    icon = "MessageCircle";
    iconBg = "bg-warning/10";
    iconColor = "text-warning";
    columns = ["Ticker", "Post Summary", "Sentiment", "Mentions"];
  } else if (lowerPrompt.includes("sec") || lowerPrompt.includes("filing")) {
    name = "SEC Filing Analyzer";
    icon = "FileText";
    iconBg = "bg-warning/10";
    iconColor = "text-warning";
    columns = ["Company", "Filing Type", "Summary", "Date"];
  } else if (lowerPrompt.includes("whale") || lowerPrompt.includes("wallet")) {
    name = "Whale Wallet Tracker";
    icon = "Wallet";
    iconBg = "bg-chart-4/10";
    iconColor = "text-[hsl(var(--chart-4))]";
    columns = ["Wallet", "Token", "Action", "Amount"];
  } else if (
    lowerPrompt.includes("macro") ||
    lowerPrompt.includes("indicator") ||
    lowerPrompt.includes("cpi")
  ) {
    name = "Macro Indicator Dashboard";
    icon = "BarChart3";
    iconBg = "bg-success/10";
    iconColor = "text-success";
    columns = ["Indicator", "Value", "Change", "Trend"];
  } else if (lowerPrompt.includes("crypto")) {
    name = "Crypto Alpha Scanner";
    icon = "Bitcoin";
    iconBg = "bg-warning/10";
    iconColor = "text-warning";
    columns = ["Token", "Signal", "Volume 24h", "Change"];
  } else if (
    lowerPrompt.includes("narrative") ||
    lowerPrompt.includes("story") ||
    lowerPrompt.includes("alpha")
  ) {
    name = "Narrative Sniffer";
    icon = "TrendingUp";
    iconBg = "bg-success/10";
    iconColor = "text-success";
    columns = ["Ticker", "Narrative", "Strength", "Price 7d"];
  } else {
    const words = prompt.split(" ").slice(0, 4).join(" ");
    name =
      words.length > 30
        ? `${words.substring(0, 30)}...`
        : words || "Custom Agent";
  }

  return {
    name,
    icon,
    iconBg,
    iconColor,
    description:
      prompt.length > 100 ? `${prompt.substring(0, 100)}...` : prompt,
    columns,
  };
}

export function createAgentFromPrompt(prompt: string): Agent {
  const metadata = deriveAgentMetadata(prompt);

  return {
    id: `agent-${Date.now()}`,
    ...metadata,
    status: "building",
    schedule: "Every 6 hours",
    subscribers: Math.floor(Math.random() * 5000),
    lastRun: "Building...",
    rows: [],
    createdAt: Date.now(),
  };
}
