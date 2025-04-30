# PowerPoint MCP Server

MCP Server for integrating with the Microsoft 365 PowerPoint API.

## Project Structure

- `package.json`: Project metadata and dependencies.
- `tsconfig.json`: TypeScript compiler configuration.
- `.gitignore`: Specifies intentionally untracked files that Git should ignore.
- `README.md`: This file.
- `src/`: Source code directory.
  - `auth/`: Authentication module (OAuth).
  - `api-client/`: Client for interacting with the PowerPoint API.
  - `templates/`: Presentation template management.
  - `themes/`: Presentation theme customization.
  - `rest/`: REST API server (Express).
  - `cli/`: Command-line interface (commander.js).
  - `logging/`: Logging configuration (winston).
  - `errors/`: Custom error handling.
  - `index.ts`: Main server bootstrap file.
- `Dockerfile`: Docker configuration for building the container image.
- `docker-compose.yml`: Docker Compose configuration for local development.
- `.github/workflows/ci.yml`: GitHub Actions workflow for continuous integration.