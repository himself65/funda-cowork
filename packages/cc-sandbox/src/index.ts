import { Sandbox as VercelSandbox } from '@vercel/sandbox'
import { readdir, readFile, stat } from 'node:fs/promises'
import { resolve } from 'node:path'

const SANDBOX_BASE_DIR = '/vercel/sandbox/app'

async function run (): Promise<void> {
  const sandbox = await VercelSandbox.create({
    ports: [5173],
    runtime: 'node22'
  })

  process.on('beforeExit', () => {
    sandbox.stop()
  })

  const cliInstall = await sandbox.runCommand({
    cmd: 'npm',
    args: ['install', '-g', '@anthropic-ai/claude-code'],
    sudo: true
  })

  console.log(cliInstall)

  // init scaford

  const templateDir = resolve(import.meta.dirname, '../template')

  async function initScaffold () {
    const files: Array<{ path: string; content: Buffer }> = []

    async function walkDirectory (dir: string, baseDir: string): Promise<void> {
      const entries = await readdir(dir)

      for (const entry of entries) {
        if (entry === 'node_modules') continue

        const fullPath = `${dir}/${entry}`
        const fileStat = await stat(fullPath)

        if (fileStat.isFile()) {
          const relativePath = fullPath.replace(baseDir + '/', '')
          files.push({
            path: `${SANDBOX_BASE_DIR}/${relativePath}`,
            content: await readFile(fullPath)
          })
        } else if (fileStat.isDirectory()) {
          await walkDirectory(fullPath, baseDir)
        }
      }
    }

    await walkDirectory(templateDir, templateDir)
    await sandbox.writeFiles(files)
  }

  await initScaffold()


  const installResult = await sandbox.runCommand({
    cmd: 'npm',
    args: ['install'],
    cwd: SANDBOX_BASE_DIR
  })

  console.log(installResult)

  const devCmd = await sandbox.runCommand({
    cmd: 'npm',
    args: ['run', 'dev'],
    cwd: SANDBOX_BASE_DIR,
    detached: true
  })

  for await (const log of devCmd.logs()) {
    if (log.stream === 'stdout') {
      console.log('devlog', log.data)
      if (log.data.includes('Local:')) {
        break
      }
    } else if (log.stream === 'stderr') {
      console.error('deverror', log.data)
    }
  }

  const domain = sandbox.domain(5173)
  console.log('domain', domain)

  // run claude code
  const claudeCmd = await sandbox.runCommand({
    cmd: 'claude',
    args: [
      '-p',
      `Build a widget: "Top Reddit posts about crypto each day" 

- App.ts: React widget UI for the user
- data.json: mock data for mock UI
`,
      '--verbose',
      '--output-format=stream-json',
      '--dangerously-skip-permissions',
      '--disallowedTools=AskUserQuestion'
    ],
    cwd: SANDBOX_BASE_DIR,
    env: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY! },
    detached: true
  })

  for await (const log of claudeCmd.logs()) {
    if (log.stream === 'stdout') {
      console.log('cclog', log.data)
    } else if (log.stream === 'stderr') {
      console.error('ccerror', log.data)
    }
  }

  // download code
}

export {
  run
}
