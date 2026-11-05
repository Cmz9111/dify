import { readdirSync, readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'

const webRoot = resolve(import.meta.dirname, '..')
const sourceFilePattern = /\.[cm]?[jt]sx?$/
const testFilePattern = /\.(?:spec|test)\.[cm]?[jt]sx?$/
const authRouteDirectories = [
  'app/(auth)',
  'app/(shareLayout)/webapp-signin',
  'app/(shareLayout)/webapp-reset-password',
]
const shellOwnedMarkers = [
  /<main[\s>]/,
  /<header[\s>]/,
  /<footer[\s>]/,
  /\bmin-h-(?:screen|dvh|svh|lvh)\b/,
  /\bmd:px-27\b/,
  /\bmd:w-(?:100|110)\b/,
  /\blg:w-150\b/,
  /LangGenius, Inc\./,
  /auth-shell\/(?:header|locale-menu)/,
]

const collectSourceFiles = (directory: string): string[] => {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : collectSourceFiles(path)
    return sourceFilePattern.test(entry.name) && !testFilePattern.test(entry.name) ? [path] : []
  })
}

describe('auth shell boundary', () => {
  it('keeps the auth page frame, landmarks, column and copyright inside AuthShell', () => {
    const violations = authRouteDirectories
      .flatMap((directory) => collectSourceFiles(resolve(webRoot, directory)))
      .flatMap((file) => {
        const source = readFileSync(file, 'utf8')
        return shellOwnedMarkers
          .filter((marker) => marker.test(source))
          .map((marker) => `${relative(webRoot, file)}: ${marker.source}`)
      })

    expect(violations).toEqual([])
  })
})
