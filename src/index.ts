#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts'; 
import { execSync } from 'child_process'; 
import fs from 'fs'; 
import path from 'path';
import { GhostBuster } from './core/analyzer.js';
import { RegexScannerStrategy } from './strategies/regex.strategy.js';

const program = new Command();

program
  .name('npm-ghost-buster')
  .description('👻 Find dead dependencies and phantom imports in your project')
  .version('1.0.0')
  .option('-p, --path <path>', 'Path to project root', process.cwd())
  .option('--include-optional', 'Include optionalDependencies in the analysis', false)
  .option('--include-peer', 'Include peerDependencies in the analysis', false)
  .option('--ignore <deps>', 'Comma-separated list of dependencies to ignore', '')
  .option('--json', 'Output report as JSON', false)
  .option('--fail-on-ghosts', 'Exit with code 1 when any ghost is found', false)
  .option('--no-interactive', 'Disable interactive mode', false) // <--- Nova flag para CI/CD
  .action(async (options) => {
    const spinner = ora('Hunting for ghosts...').start();

    try {
      const ignoredDeps = options.ignore
        .split(',')
        .map((dep: string) => dep.trim())
        .filter(Boolean);

      const analyzer = new GhostBuster(new RegexScannerStrategy());
      const report = await analyzer.bust(options.path, {
        includeOptional: options.includeOptional,
        includePeer: options.includePeer,
        ignoredDeps,
      });

      spinner.stop();

      // MODO JSON (Sem interação)
      if (options.json) {
        console.log(JSON.stringify(report, null, 2));
        if (options.failOnGhosts && (report.unused.length > 0 || report.phantom.length > 0)) {
          process.exit(1);
        }
        return;
      }

      // MODO VISUAL
      console.log(chalk.bold.magenta('\n👻 NPM GHOST BUSTER REPORT 👻\n'));
      console.log(chalk.gray(`Scanned ${report.totalFilesScanned} files.\n`));

      if (report.unused.length) {
        console.log(chalk.yellow.bold('📉 UNUSED Dependencies (Bloat):'));
        report.unused.forEach((d) => console.log(chalk.red(`   ✖ ${d}`)));
      } else {
        console.log(chalk.green('✅ No unused dependencies. Clean!'));
      }

      console.log('\n' + '-'.repeat(30) + '\n');

      if (report.phantom.length) {
        console.log(chalk.red.bold('😱 PHANTOM Dependencies (Dangerous):'));
        report.phantom.forEach((d) => console.log(chalk.yellow(`   ⚠️  ${d}`)));
      } else {
        console.log(chalk.green('✅ No phantom dependencies. Safe!'));
      }

      if (ignoredDeps.length) {
        console.log(chalk.gray(`\nIgnored dependencies: ${ignoredDeps.join(', ')}`));
      }
      console.log('');

      // --- AQUI COMEÇA A INTERAÇÃO (ITEM 3) ---
      // Só pergunta se: tiver não usados, não for modo JSON, e interativo estiver ligado
      if (report.unused.length > 0 && options.interactive) {
        const response = await prompts({
          type: 'multiselect',
          name: 'trash',
          message: 'Select unused packages to uninstall automatically:',
          choices: report.unused.map(dep => ({ title: dep, value: dep })),
          hint: '- Space to select. Return to submit',
          instructions: false
        });

        if (response.trash && response.trash.length > 0) {
          const spinnerZap = ora('Zapping ghosts...').start();
          try {
            // Detecta qual gerenciador o usuário usa
            const manager = detectPackageManager(options.path);
            
            // Monta o comando correto (npm uninstall, yarn remove, etc)
            const command = manager === 'npm' ? 'uninstall' : 'remove';
            
            // Executa
            execSync(`${manager} ${command} ${response.trash.join(' ')}`, { 
              stdio: 'ignore', 
              cwd: options.path 
            });
            
            spinnerZap.succeed(chalk.green(`Successfully removed ${response.trash.length} ghosts using ${manager}!`));
          } catch (e) {
            spinnerZap.fail('Failed to uninstall packages.');
            console.error(chalk.red('Make sure you have permissions and the package manager is installed.'));
          }
        }
      }

      // Exit code para CI/CD
      if (options.failOnGhosts && (report.unused.length > 0 || report.phantom.length > 0)) {
        process.exit(1);
      }

    } catch (error: any) {
      spinner.fail('Busting failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Helper simples para detectar gerenciador de pacotes
function detectPackageManager(cwd: string): string {
  if (fs.existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(cwd, 'bun.lockb'))) return 'bun';
  return 'npm';
}

program.parse();