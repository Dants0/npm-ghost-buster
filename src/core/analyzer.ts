import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { GhostReport, PackageJson } from './types.js';
import { ImportScannerStrategy } from '../strategies/base.strategy.js';

export class GhostBuster {
  constructor(private strategy: ImportScannerStrategy) {}

  async bust(rootDir: string): Promise<GhostReport> {
    // 1. Load Package.json
    const pkgPath = path.join(rootDir, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      throw new Error('package.json not found in directory');
    }
    
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as PackageJson;
    const declaredDeps = new Set([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ]);

    // 2. Find Files
    const files = await glob('**/*.{ts,tsx,js,jsx,mjs,cjs}', { 
        cwd: rootDir, 
        ignore: ['node_modules/**', 'dist/**', 'build/**'] 
    });

    // 3. Scan Imports
    const usedDeps = new Set<string>();
    
    for (const file of files) {
      const content = fs.readFileSync(path.join(rootDir, file), 'utf-8');
      const fileImports = this.strategy.scan(content);
      fileImports.forEach(dep => usedDeps.add(dep));
    }

    // 4. Calculate Diff (The Busting)
    const unused = [...declaredDeps].filter(dep => !usedDeps.has(dep));
    
    // Filter out built-ins from phantoms (simple check)
    const builtIns = new Set(['fs', 'path', 'os', 'util', 'events', 'http', 'https', 'stream', 'crypto']);
    const phantom = [...usedDeps].filter(dep => !declaredDeps.has(dep) && !builtIns.has(dep));

    return {
      unused,
      phantom,
      totalFilesScanned: files.length
    };
  }
}