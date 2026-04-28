# Repo Split Output

The Stage 3 codebase has been split into three standalone repositories inside this folder:

- `insighta-backend`
- `insighta-cli`
- `insighta-web-portal`

Each repo includes:

- its own `.git` history with an initial conventional commit
- its own CI workflow under `.github/workflows`
- validated local checks via `npm run check`

## Next step: push to GitHub

From each repo folder:

1. Create an empty GitHub repository.
2. Add remote:
   - `git remote add origin <YOUR_NEW_REPO_URL>`
3. Push:
   - `git push -u origin main`

## Submission URLs needed

- Backend repo URL
- CLI repo URL
- Web portal repo URL
- Live backend URL
- Live web portal URL
