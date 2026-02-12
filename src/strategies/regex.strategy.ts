import { ImportScannerStrategy } from './base.strategy.js';

export class RegexScannerStrategy implements ImportScannerStrategy {
  private importRegex = [
    /\bimport\s+(?:[^'";]+?\s+from\s+)?['"]([^'"\n]+)['"]/g,
    /\bexport\s+[^'";]+?\s+from\s+['"]([^'"\n]+)['"]/g,
    /\brequire\(\s*['"]([^'"\n]+)['"]\s*\)/g,
    /\bimport\(\s*['"]([^'"\n]+)['"]\s*\)/g,
  ];

  scan(content: string): string[] {
    const imports = new Set<string>();

    for (const regex of this.importRegex) {
      regex.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(content)) != null) {
        let pkg = match[1];

        if (pkg) {
          if (pkg.startsWith('@')) {
            pkg = pkg.split('/').slice(0, 2).join('/');
          } else {
            pkg = pkg.split('/')[0];
          }

          if (!pkg.startsWith('.') && !pkg.startsWith('/')) {
            imports.add(pkg);
          }
        }
      }
    }

    return Array.from(imports);
  }
}
