import { ImportScannerStrategy } from "./base.strategy.js";

export class RegexScannerStrategy implements ImportScannerStrategy {
  private importRegex = /from\s+['"](.*?)['"]|require\(['"](.*?)['"]\)/g;

  scan(content: string): string[] {
    const imports = new Set<string>();
    let match;


    this.importRegex.lastIndex = 0
    while ((match = this.importRegex.exec(content)) != null) {
      let pkg = match[1] || match[2]

      if (pkg) {
        if (pkg.startsWith("@")) {
          pkg = pkg.split("/").slice(0, 2).join("/")
        } else {
          pkg = pkg.split("/")[0]
        }

        if (!pkg.startsWith(".") && !pkg.startsWith("/")) {
          imports.add(pkg)
        }


      }
    }
    return Array.from(imports)
  }
}