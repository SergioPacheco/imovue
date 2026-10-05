import { readFile } from 'node:fs/promises'
import ts from 'typescript'

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    specifier = new URL(`../src/${specifier.slice(2)}`, import.meta.url).href
  }
  if ((specifier.startsWith('.') || specifier.startsWith('file:')) && !/\.[a-z]+$/i.test(specifier)) {
    specifier += '.ts'
  }
  return nextResolve(specifier, context)
}

export async function load(url, context, nextLoad) {
  if (!url.endsWith('.ts')) return nextLoad(url, context)
  const source = await readFile(new URL(url), 'utf8')
  return {
    format: 'module', shortCircuit: true,
    source: ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
      fileName: url,
    }).outputText,
  }
}
