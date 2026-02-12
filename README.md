# 👻 npm-ghost-buster

> **Who you gonna call?** cleanup your `package.json` with confidence.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-729B1B?style=for-the-badge&logo=vitest&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**npm-ghost-buster** is a CLI tool designed to hunt down "dead" dependencies and "phantom" imports in your Node.js/TypeScript projects. Keep your project lean, fast, and bug-free.

## 🧐 What are the Ghosts?

We classify dependency issues into two types of ghosts:

1. 👻 **The Unused Ghost (Bloat):**
   Dependencies listed in your `package.json` that are **never imported** in your code.

2. 😱 **The Phantom Ghost (Dangerous):**
   Packages you import and use in your code, but **forgot to install** (they are missing from `package.json`).

---

## 🚀 Installation

Run directly with `npx` (recommended):

```bash
npx npm-ghost-buster
```

## 🧪 Usage

```bash
npx npm-ghost-buster --path .
```

### CLI options

- `-p, --path <path>`: Project root to scan.
- `--include-optional`: Include `optionalDependencies` in checks.
- `--include-peer`: Include `peerDependencies` in checks.
- `--ignore <deps>`: Comma-separated dependency names to ignore.
- `--json`: Output machine-readable JSON.
- `--fail-on-ghosts`: Exit with code `1` if unused/phantom dependencies are found.
- `--no-interactive`: Disable the interactive uninstall prompt (Good for CI).

### Example

```bash
npx npm-ghost-buster --include-peer --ignore typescript,eslint --json
```

```bash
npx npm-ghost-buster --fail-on-ghosts --no-interactive
```

```bash
npx npm-ghost-buster --ignore typescript,eslint-plugin-react,@types/node
```

## 🪄 Interactive Mode (Zap)

```bash
? Select unused packages to uninstall automatically:
 › [x] lodash
   [ ] moment
   [x] request
```

## 🔍 What gets scanned

- ESM `import ... from 'pkg'`
- Side-effect imports `import 'pkg'`
- Exports: `export { foo } from 'bar'`
- CommonJS `require('pkg')`
- Dynamic imports `import('pkg')`

## 🤝 Contributing

Pull requests are welcome!

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'feat: Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

## License

Distributed under the MIT License. See LICENSE for more information.
