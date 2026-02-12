import { describe, it, expect, vi } from 'vitest';
import { GhostBuster } from './analyzer.js';
import { ImportScannerStrategy } from '../strategies/base.strategy.js';

// 1. Mock da Estratégia (Simples para teste)
class MockStrategy implements ImportScannerStrategy {
  scan(fileContent: string): string[] {
    // Retorna o próprio conteúdo como se fosse o nome da importação achada
    return [fileContent]; 
  }
}

// 2. Mock do FileSystem (fs) e Glob
vi.mock('fs', async () => {
  return {
    default: {
      existsSync: () => true,
      readFileSync: (path: string) => {
        // Se pedir package.json, retornamos um JSON falso
        if (path.includes('package.json')) {
          return JSON.stringify({
            dependencies: { 'react': '18.0.0', 'lodash': '4.0.0' },
            devDependencies: { 'typescript': '5.0.0' }
          });
        }
        // Se ler qualquer outro arquivo, fingimos que o código usa apenas 'react'
        return 'react';
      }
    }
  };
});

vi.mock('glob', () => {
  return {
    glob: () => ['src/app.ts'] // Fingimos que existe 1 arquivo no projeto
  };
});

describe('GhostBuster Core Logic', () => {
  it('deve identificar dependências não usadas (bloat) e ignorar as usadas', async () => {
    // Cenário:
    // package.json tem: react, lodash, typescript
    // código usa: react
    
    const strategy = new MockStrategy();
    const buster = new GhostBuster(strategy);
    
    // Executa a lógica
    const report = await buster.bust('./fake-path');

    // Validações
    // 1. 'lodash' está no package.json mas NÃO no código -> Unused (Ghost)
    expect(report.unused).toContain('lodash');
    
    // 2. 'typescript' está no package.json mas NÃO no código -> Unused (Ghost)
    expect(report.unused).toContain('typescript');
    
    // 3. 'react' está no package.json E no código -> NÃO deve ser Unused
    expect(report.unused).not.toContain('react');
    
    // 4. Phantom deve estar vazio pois 'react' está declarado
    expect(report.phantom).toHaveLength(0);
  });
});