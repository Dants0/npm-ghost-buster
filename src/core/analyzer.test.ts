import { describe, it, expect, vi } from 'vitest';
import { GhostBuster } from './analyzer.js';
import { ImportScannerStrategy } from '../strategies/base.strategy.js';

class MockStrategy implements ImportScannerStrategy {
  scan(fileContent: string): string[] {
    return [fileContent];
  }
}

vi.mock('fs', async () => {
  return {
    default: {
      existsSync: () => true,
      readFileSync: (path: string) => {
        if (path.includes('package.json')) {
          return JSON.stringify({
            dependencies: { react: '18.0.0', lodash: '4.0.0' },
            devDependencies: { typescript: '5.0.0' },
            optionalDependencies: { fsevents: '2.3.0' },
            peerDependencies: { vite: '7.0.0' },
          });
        }
        return 'react';
      },
    },
  };
});

vi.mock('glob', () => {
  return {
    glob: () => ['src/app.ts'],
  };
});

describe('GhostBuster Core Logic', () => {
  it('identifica dependências não usadas e ignora as usadas', async () => {
    const strategy = new MockStrategy();
    const buster = new GhostBuster(strategy);

    const report = await buster.bust('./fake-path');

    expect(report.unused).toContain('lodash');
    expect(report.unused).toContain('typescript');
    expect(report.unused).not.toContain('react');
    expect(report.phantom).toHaveLength(0);
  });

  it('respeita includeOptional/includePeer e ignoredDeps', async () => {
    const strategy = new MockStrategy();
    const buster = new GhostBuster(strategy);

    const report = await buster.bust('./fake-path', {
      includeOptional: true,
      includePeer: true,
      ignoredDeps: ['lodash', 'vite'],
    });

    expect(report.unused).toContain('typescript');
    expect(report.unused).toContain('fsevents');
    expect(report.unused).not.toContain('lodash');
    expect(report.unused).not.toContain('vite');
  });
});
