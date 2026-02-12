export type DependencyTypes = 'dependencies' | 'devDependencies';

export interface BustOptions {
  includeOptional?: boolean;
  includePeer?: boolean;
  ignoredDeps?: string[];
}

export interface GhostReport {
  unused: string[]
  phantom: string[]
  totalFilesScanned: number;
}

export interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}
