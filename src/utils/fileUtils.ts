import fs from 'node:fs';
import path from 'node:path';

/**
 * Lê recursivamente todos os arquivos de uma pasta que terminam com uma das extensões dadas.
 * Usado pelos handlers para carregar comandos, eventos, botões, modais e menus.
 */
export function getAllFiles(dir: string, extensions: string[] = ['.ts', '.js']): string[] {
  if (!fs.existsSync(dir)) return [];

  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...getAllFiles(fullPath, extensions));
      continue;
    }

    if (extensions.some((ext) => entry.name.endsWith(ext)) && !entry.name.endsWith('.d.ts')) {
      results.push(fullPath);
    }
  }

  return results;
}

export function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function ensureFile(filePath: string, defaultContent: string): void {
  ensureDir(path.dirname(filePath));
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultContent, 'utf-8');
  }
}
