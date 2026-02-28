import chalk from 'chalk'
import boxen from 'boxen'

const TERM_WIDTH = Math.min(process.stdout.columns || 80, 90)
const INDENT = '  '

const SAFE_PROTOCOLS = /^(https?:\/\/|mailto:)/

function osc8(url, display) {
  // strict protocol validation — prevents file:// or javascript: URIs in terminal
  if (!SAFE_PROTOCOLS.test(url)) return chalk.cyan.underline(display)
  const clean = url.replace(/^mailto:/, '')
  return `\x1b]8;;${clean}\x1b\\${chalk.cyan.underline(display)}\x1b]8;;\x1b\\`
}

function hr() {
  return chalk.dim(INDENT + '─'.repeat(TERM_WIDTH - 4))
}

function sectionHeading(text) {
  const t = text.toUpperCase()
  return [
    '',
    chalk.yellow.bold(INDENT + t),
    chalk.dim(INDENT + '─'.repeat(Math.min(t.length + 4, TERM_WIDTH - 4))),
  ].join('\n')
}

// CONTACT — label: URL pairs
function renderContact(section) {
  const lines = [sectionHeading(section.heading)]
  for (const item of section.items) {
    const label = chalk.bold(item.label + ':')
    const val   = item.url
      ? osc8(item.url, item.url.replace(/^mailto:/, ''))
      : chalk.white(item.value ?? '')
    lines.push(INDENT + '  ' + chalk.green('▸') + '  ' + label + '  ' + val)
  }
  return lines.join('\n')
}

// TAGS — flat string array, dot-separated
function renderTags(section) {
  const tags = section.items.map(t => chalk.white(t)).join(chalk.dim('  ·  '))
  return [
    sectionHeading(section.heading),
    INDENT + '  ' + tags,
    '',
  ].join('\n')
}

// ENTRIES — title / org / date / bullets (jobs, projects, extensions)
function renderEntries(section) {
  const lines = [sectionHeading(section.heading)]
  for (const entry of section.items) {
    // title line
    let titleLine = INDENT + '  ' + chalk.bold.white(entry.title)
    if (entry.url)  titleLine += '  ' + osc8(entry.url, entry.url)
    if (entry.org)  titleLine += chalk.dim('  at  ') + chalk.bold(entry.org)
    if (entry.date) titleLine += '  ' + chalk.dim('(' + entry.date + ')')
    lines.push(titleLine)

    // bullets
    if (entry.bullets?.length) {
      for (const b of entry.bullets) {
        lines.push(INDENT + '     ' + chalk.dim('·') + '  ' + b)
      }
    }
    lines.push('')
  }
  return lines.join('\n')
}

// LIST — plain bullet list
function renderList(section) {
  const lines = [sectionHeading(section.heading)]
  for (const item of section.items) {
    lines.push(INDENT + '  ' + chalk.green('▸') + '  ' + item)
  }
  lines.push('')
  return lines.join('\n')
}

// TEXT — single paragraph (summary, bio etc)
function renderText(section) {
  return [
    sectionHeading(section.heading),
    INDENT + '  ' + chalk.white(section.content),
    '',
  ].join('\n')
}

const RENDERERS = {
  contact: renderContact,
  tags:    renderTags,
  entries: renderEntries,
  list:    renderList,
  text:    renderText,
}

export function renderResume(resumeJSON, slug) {
  let data
  try {
    data = typeof resumeJSON === 'string' ? JSON.parse(resumeJSON) : resumeJSON
  } catch {
    console.error(chalk.red('\n  error: resume data is corrupted\n'))
    process.exit(1)
  }

  const out = []

  // header
  out.push(boxen(
    chalk.dim('showresume') + '  ' + chalk.yellow.bold(slug),
    { padding: { top: 0, bottom: 0, left: 1, right: 1 }, borderStyle: 'round', borderColor: 'yellow', dimBorder: true }
  ))
  out.push('')

  // name + title
  if (data.name)  out.push(chalk.bold.whiteBright(INDENT + data.name))
  if (data.title) out.push(chalk.dim(INDENT + data.title))
  out.push('')

  // sections
  for (const section of data.sections ?? []) {
    const renderer = RENDERERS[section.type]
    if (renderer) {
      out.push(renderer(section))
    } else {
      // fallback: just dump items as a list
      out.push(renderList({ ...section, type: 'list' }))
    }
  }

  // footer
  out.push(hr())
  out.push(boxen(
    chalk.dim('npx showresume ') + chalk.yellow(slug),
    { padding: { top: 0, bottom: 0, left: 1, right: 1 }, borderStyle: 'round', borderColor: 'yellow', dimBorder: true }
  ))
  out.push('')

  process.stdout.write(out.join('\n') + '\n')
}