import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { GhostBuster } from './core/analyzer.js';
import { RegexScannerStrategy } from './strategies/regex.strategy.js';

const program = new Command();

program
  .name('npm-ghost-buster')
  .description('👻 Find dead dependencies and phantom imports in your project')
  .version('1.0.0')
  .option('-p, --path <path>', 'Path to project root', process.cwd())
  .action(async (options) => {
    const spinner = ora('Hunting for ghosts...').start();
    
    try {
      // Dependency Injection: Injecting the Regex Strategy
      const analyzer = new GhostBuster(new RegexScannerStrategy());
      const report = await analyzer.bust(options.path);

      spinner.stop();

      console.log(chalk.bold.magenta('\n👻 NPM GHOST BUSTER REPORT 👻\n'));
      console.log(chalk.gray(`Scanned ${report.totalFilesScanned} files.\n`));

      if (report.unused.length) {
        console.log(chalk.yellow.bold('📉 UNUSED Dependencies (Bloat):'));
        report.unused.forEach(d => console.log(chalk.red(`   ✖ ${d}`)));
      } else {
        console.log(chalk.green('✅ No unused dependencies. clean!'));
      }

      console.log('\n' + '-'.repeat(30) + '\n');

      if (report.phantom.length) {
        console.log(chalk.red.bold('😱 PHANTOM Dependencies (Dangerous):'));
        report.phantom.forEach(d => console.log(chalk.yellow(`   ⚠️  ${d}`)));
      } else {
        console.log(chalk.green('✅ No phantom dependencies. Safe!'));
      }
      
      console.log(''); // New line at end

    } catch (error: any) {
      spinner.fail('Busting failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program.parse();