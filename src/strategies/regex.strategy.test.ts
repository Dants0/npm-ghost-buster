import { describe, expect, it } from 'vitest';
import { RegexScannerStrategy } from './regex.strategy.js';

describe('RegexScannerStrategy', () => {
  it('captura import, export from, require e dynamic import', () => {
    const scanner = new RegexScannerStrategy();
    const code = `
      import React from 'react';
      import 'zod';
      export { something } from '@scope/pkg/utils';
      const fs = require('node:fs');
      const x = import('lodash/map');
      import localThing from './local';
    `;

    const imports = scanner.scan(code);

    expect(imports).toContain('react');
    expect(imports).toContain('zod');
    expect(imports).toContain('@scope/pkg');
    expect(imports).toContain('node:fs');
    expect(imports).toContain('lodash');
    expect(imports).not.toContain('./local');
  });
});
