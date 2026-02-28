#!/usr/bin/env node

import { fetchResume } from '../src/fetch.js'
import { renderResume } from '../src/render.js'
import ora from 'ora'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { version } = require('../package.json')

const SLUG_REGEX = /^[a-z0-9-]{1,50}$/
const args = process.argv.slice(2)
const slug = args[0]

if (slug === '--version' || slug === '-v') {
    console.log(version)
    process.exit(0)
}

if (!slug || slug === '--help' || slug === '-h') {
    console.log(`
  showresume v${version}

  usage:   npx showresume <username>
  example: npx showresume visalan

  options:
    --help     show this message
    --version  show version
  `)
    process.exit(slug ? 0 : 1)
}

if (args.length > 1) {
    console.error(`\n  too many arguments — did you mean: npx showresume ${slug}\n`)
    process.exit(1)
}

if (!SLUG_REGEX.test(slug)) {
    console.error(`\n  invalid username "${slug}"`)
    console.error('  usernames can only contain lowercase letters, numbers, and hyphens\n')
    process.exit(1)
}

const spinner = ora({ text: `fetching resume for ${slug}`, color: 'yellow' }).start()

try {
    const resumeText = await fetchResume(slug)
    spinner.stop()
    renderResume(resumeText, slug)
} catch (err) {
    spinner.fail(err?.message ?? String(err))
    process.exit(1)
}