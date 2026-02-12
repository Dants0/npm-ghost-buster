import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import module from 'node:module';
import { BustOptions, GhostReport, PackageJson } from './types.js';
import { ImportScannerStrategy } from '../strategies/base.strategy.js';

export class GhostBuster {
  constructor(private strategy: ImportScannerStrategy) {}

  async bust(rootDir: string, options: BustOptions = {}): Promise<GhostReport> {
    // 1. Load Package.json
    const pkgPath = path.join(rootDir, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      throw new Error('package.json not found in directory');
    }
    
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as PackageJson;
    const declaredDeps = new Set([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
      ...(options.includeOptional ? Object.keys(pkg.optionalDependencies || {}) : []),
      ...(options.includePeer ? Object.keys(pkg.peerDependencies || {}) : []),
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
    const ignoredDeps = new Set((options.ignoredDeps || []).filter(Boolean));
    const normalizedDeclaredDeps = new Set([...declaredDeps].filter(dep => !ignoredDeps.has(dep)));
    const normalizedUsedDeps = new Set([...usedDeps].filter(dep => !ignoredDeps.has(dep)));

    const unused = [...normalizedDeclaredDeps].filter(dep => !normalizedUsedDeps.has(dep));

    // Filter out built-ins from phantoms using Node's official list
    const builtIns = new Set(module.builtinModules.map((name) => name.replace(/^node:/, '')));
    const phantom = [...normalizedUsedDeps].filter(dep => !normalizedDeclaredDeps.has(dep) && !builtIns.has(dep));

    return {
      unused,
      phantom,
      totalFilesScanned: files.length
    };
  }
}
