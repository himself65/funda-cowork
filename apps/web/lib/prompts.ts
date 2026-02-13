/**
 * Build the prompt passed to Claude CLI (-p flag) inside the sandbox.
 * The CLAUDE.md workspace file provides the system-level instructions;
 * this function creates the user-facing task prompt.
 */
export function buildAgentPrompt(userPrompt: string): string {
  return (
    `Build a dashboard widget for: "${userPrompt}"\n\n` +
    `Follow the instructions in CLAUDE.md. ` +
    `Write src/App.tsx and src/data.ts with realistic mock data. ` +
    `Do NOT install any additional packages.`
  );
}
