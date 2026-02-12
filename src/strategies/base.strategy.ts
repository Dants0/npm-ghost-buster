export interface ImportScannerStrategy {
  scan(fileContent: string): string[]
}