# Stock-Yard Web Progress

## Project purpose
Frontend for Stock-Yard, a stock research and market data application.

## Stack
- Next.js
- TypeScript
- React Query
- React Table
- Vitest
- Playwright
- Docker
- Docker Compose

## Local validation completed
- frontend runs locally with `npm run dev`
- app loads successfully in browser
- major UI works from manual testing
- `npm run typecheck` passed
- `npm run test` passed
- `npm run lint` passed with one non-blocking warning

## Fixes completed
- fixed malformed root layout
- replaced font loading approach with Next.js font loader
- removed CSS import pattern that caused parsing failure

## Containerization completed
- added multi-stage `Dockerfile`
- added `.dockerignore`
- built frontend image successfully
- ran frontend container successfully
- added frontend-only `compose.yaml`
- verified `docker compose up --build` works

## Next steps
- deploy frontend container to EC2
- verify frontend works on EC2
- create deployment-level Compose setup for frontend + backend
- later introduce Nginx as reverse proxy
- later add HTTPS