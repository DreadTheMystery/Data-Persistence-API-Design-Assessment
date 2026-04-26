# Insighta CLI (Stage 3 Scaffold)

This folder is a scaffold for extracting the CLI into its own repository.

## Required commands
- insighta login
- insighta logout
- insighta whoami
- insighta profiles list [filters]
- insighta profiles get <id>
- insighta profiles search "query"
- insighta profiles create --name "Name"
- insighta profiles export --format csv

## Credential storage
Store tokens at:
`~/.insighta/credentials.json`

## Notes
- Use GitHub OAuth with PKCE against backend `/auth/github` + `/auth/github/cli/exchange`.
- Auto-refresh access token using `/auth/refresh`.
