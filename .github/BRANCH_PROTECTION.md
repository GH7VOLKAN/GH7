# Branch Protection Setup

Go to GitHub -> Settings -> Branches -> Add rule for `main`:
- [x] Require pull request reviews before merging
- [x] Require status checks to pass (CI workflow)
- [x] Require branches to be up to date
- [ ] Do NOT allow force pushes

This prevents broken code from reaching production.
