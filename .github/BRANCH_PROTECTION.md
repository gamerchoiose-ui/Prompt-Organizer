# 🛡️ Branch Protection Guide

To prevent accidental force-pushes, direct commits, or breaking code on the `main` (or `master`) branch, you can configure Branch Protection rules directly in your GitHub repository settings.

## Step-by-Step Instructions

1. **Go to your GitHub Repository**: Navigate to your repository on [GitHub](https://github.com).
2. **Access Repository Settings**: Click on the **Settings** tab at the top of your repository.
3. **Navigate to Branches**: In the left sidebar, click on **Code and automation** -> **Branches**.
4. **Add Branch Protection Rule**:
   - Click the **Add branch protection rule** button.
   - In **Branch name pattern**, enter `main` (or `master`).
5. **Configure Recommended Protections**:
   - ☑️ **Require a pull request before merging**:
     - ☑️ Require approvals (e.g., at least 1 approval).
     - ☑️ Dismiss stale pull request approvals when new commits are pushed.
     - ☑️ Require review from Code Owners.
   - ☑️ **Require status checks to pass before merging**:
     - Check this box and select required status checks such as:
       - `Validate, Lint & Test` (from `.github/workflows/ci.yml`)
       - `CodeQL` (from `.github/workflows/codeql.yml`)
   - ☑️ **Require conversation resolution before merging**
   - ☑️ **Do not allow bypassing the above settings** (applies to administrators as well).
   - ☑️ **Restrict who can push to matching branches** (optional).
   - ☒ **Allow force pushes**: Ensure this is **UNCHECKED** to prevent force-pushes that could overwrite commit history.
   - ☒ **Allow deletions**: Ensure this is **UNCHECKED** to prevent branch deletion.
6. **Save Changes**: Click **Create** or **Save changes** at the bottom of the page.

---

## Automated Enforcement in CI

In addition to GitHub UI branch protection rules, this repository includes automated CI workflows (`.github/workflows/ci.yml` and `codeql.yml`) that run on every pull request and push to verify:
- TypeScript type safety and linting (`npm run lint`)
- Vitest unit tests (`npm test`)
- Security vulnerability analysis (CodeQL & Dependabot)
