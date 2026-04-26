# Insighta Web Portal (Stage 3 Scaffold)

This folder is a scaffold for extracting the web portal into its own repository.

## Required pages
- Login
- Dashboard
- Profiles list
- Profile detail
- Search
- Account

## Security requirements
- HTTP-only cookies for tokens
- CSRF protection
- Uses backend auth flow `/auth/github` and callback

## Deployment
Deploy independently and configure `WEB_PORTAL_URL` in backend environment.
