/**
 * Sandbox scaffold and workspace files.
 *
 * Following consensus-cowork's pattern:
 * - Scaffold files: Vite+React project structure
 * - Workspace files: CLAUDE.md instructions copied into sandbox
 */

export const SANDBOX_BASE_DIR = "/vercel/sandbox/app";

// ─── Scaffold: Vite+React project ───────────────────────────────

export const packageJson = JSON.stringify(
  {
    name: "agent-widget",
    private: true,
    type: "module",
    scripts: {
      dev: "vite",
    },
    dependencies: {
      react: "^19.0.0",
      "react-dom": "^19.0.0",
    },
    devDependencies: {
      "@vitejs/plugin-react": "^4.5.2",
      vite: "^6.3.5",
    },
  },
  null,
  2,
);

export const viteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
`;

export const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agent Widget</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #0d1117;
        color: #e6edf3;
        min-height: 100vh;
      }
      #root { min-height: 100vh; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

export const mainTsx = `import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);
`;

export const placeholderApp = `export default function App() {
  return (
    <div style={{ padding: 24, textAlign: "center", color: "#8b949e" }}>
      Loading...
    </div>
  );
}
`;

export const tsconfig = JSON.stringify(
  {
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
    },
    include: ["src"],
  },
  null,
  2,
);

export function getScaffoldFiles() {
  return [
    { path: `${SANDBOX_BASE_DIR}/package.json`, content: packageJson },
    { path: `${SANDBOX_BASE_DIR}/vite.config.ts`, content: viteConfig },
    { path: `${SANDBOX_BASE_DIR}/index.html`, content: indexHtml },
    { path: `${SANDBOX_BASE_DIR}/src/main.tsx`, content: mainTsx },
    { path: `${SANDBOX_BASE_DIR}/src/App.tsx`, content: placeholderApp },
    { path: `${SANDBOX_BASE_DIR}/tsconfig.json`, content: tsconfig },
  ];
}

// ─── Workspace files: CLAUDE.md instructions (consensus-cowork pattern) ───

/**
 * CLAUDE.md — Instructions for Claude when running inside the sandbox.
 * Mirrors consensus-cowork's workspace_copy_files/CLAUDE.md pattern.
 */
export const claudeMd = `# CLAUDE.md

## Role
You are a **frontend developer** building a Vite+React dashboard widget inside this workspace.
The project scaffold is already set up at \`${SANDBOX_BASE_DIR}\` with React 19 and Vite.

---

## Non-Negotiable Output Requirement (Highest Priority)

**You MUST write files directly to the filesystem — always.**
This is the most important requirement. The task is NOT complete unless files are written.

---

## What to Generate

You must create/overwrite exactly two files:

1. **\`src/App.tsx\`** — The main React component:
   - Dashboard widget matching the user's request
   - Use inline styles only (no CSS imports, no Tailwind)
   - Dark theme colors:
     - Background: #0d1117
     - Card background: #161b22
     - Border: #30363d
     - Text primary: #e6edf3
     - Text secondary: #8b949e
     - Accent/highlight: #7c3aed (purple)
     - Success: #3fb950
     - Warning: #d29922
     - Danger: #f85149
   - Include a header with title and description
   - Display data in a table or card grid layout
   - Must fill container width with reasonable height

2. **\`src/data.ts\`** — Data module:
   - Export a default array of realistic mock data objects
   - Export an async \`fetchData()\` function returning the array
   - Data should be relevant to the user's request

## Rules

- Do NOT install additional packages — only \`react\` and \`react-dom\` are available
- Do NOT use Tailwind CSS or any CSS framework
- All components must be valid TSX
- Make the widget look polished: rounded corners (8px), subtle borders, padding (16-24px)
- The App component must import and display data from "./data"
`;

export function getWorkspaceFiles() {
  return [
    { path: `${SANDBOX_BASE_DIR}/CLAUDE.md`, content: claudeMd },
  ];
}
