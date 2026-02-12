# 👻 npm-ghost-buster

> **Who you gonna call?** cleanup your `package.json` with confidence.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-729B1B?style=for-the-badge&logo=vitest&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**npm-ghost-buster** is a CLI tool designed to hunt down "dead" dependencies and "phantom" imports in your Node.js/TypeScript projects. Keep your project lean, fast, and bug-free.

## 🧐 What are the Ghosts?

We classify dependency issues into two types of ghosts:

1.  👻 **The Unused Ghost (Bloat):**
    Dependencies listed in your `package.json` that are **never imported** in your code. They slow down installation and bloat your `node_modules`.

2.  😱 **The Phantom Ghost (Dangerous):**
    Packages you import and use in your code, but **forgot to install** (they are missing from `package.json`). These cause "Module not found" errors in production or CI/CD pipelines.

---

## 🚀 Installation

You can run it directly using `npx` (recommended):

```bash
npx npm-ghost-buster
```