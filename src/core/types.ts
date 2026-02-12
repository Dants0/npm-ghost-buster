export type DependencyTypes = 'dependencies' | 'devDependencies';

export interface GhostReport {
  unused: string[]
  phantom: string[]
  totalFilesScanned: number;
}

export interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}