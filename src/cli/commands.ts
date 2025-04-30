import { Command } from 'commander';
import { getAuthUrl, acquireTokenByCode, refreshToken } from '../auth';
import { createPresentation, getPresentation, updateSlide, applyTheme } from '../api-client';
import { listTemplates, addTemplate, removeTemplate } from '../templates';
import { listThemes, createTheme, updateTheme } from '../themes';
import { logger } from '../logging/logger';
import { HttpError } from '../errors/httpError';

export const program = new Command();

program
  .name('powerpoint-cli')
  .description('CLI for PowerPoint operations')
  .option('-t, --access-token <token>', 'Microsoft Graph API access token'); // Global option for access token

// Helper function for command actions with error handling
// Accepts optional accessToken for API calls
async function handleAction(action: (accessToken?: string) => Promise<any>) {
  const options = program.opts(); // Get global options
  const accessToken = options.accessToken;

  // Check if access token is needed for non-auth commands
  const commandPath = program.args.join(':'); // Basic way to identify command path
  const requiresToken = !commandPath.startsWith('auth:'); // Assume non-auth commands need token

  if (requiresToken && !accessToken) {
    logger.error('Access token is required for this command. Use the --access-token option.');
    process.exit(1);
  }

  try {
    // Pass accessToken only if the action requires it
    const result = await action(accessToken); // Pass token regardless for simplicity, functions will ignore if not needed
    if (result !== undefined) {
      // Print result if it's not just a success log message
      if (typeof result === 'object') {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(result);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Command failed: ${error.message}`);
      if (error instanceof HttpError) {
        // Correctly use statusCode
        logger.error(`Status Code: ${error.statusCode}`);
      }
    } else {
      logger.error('An unknown error occurred during command execution.');
    }
    process.exit(1); // Exit with non-zero code on error
  }
}

// --- Authentication Commands ---
const auth = program.command('auth').description('Authentication commands');

auth
  .command('url')
  .description('Prints the authentication URL')
  .action(() => handleAction(getAuthUrl));

auth
  .command('callback <code>')
  .description('Acquires and prints the access token using an authorization code')
  .action((code: string) => handleAction(() => acquireTokenByCode(code)));

auth
  .command('refresh <refreshToken>')
  .description('Refreshes and prints a new access token using a refresh token')
  .action((token: string) => handleAction(() => refreshToken(token)));


// --- Presentation Commands ---
const presentation = program.command('presentation').description('Presentation commands');

presentation
  .command('create [templateId]')
  .description('Creates a new presentation, optionally from a template, and prints the new presentation ID')
  // Pass accessToken from handleAction
  .action((templateId?: string) => handleAction((token) => createPresentation(token!, templateId)));

presentation
  .command('get <id>')
  .description('Gets presentation details and prints the presentation JSON')
  // Pass accessToken from handleAction
  .action((id: string) => handleAction((token) => getPresentation(token!, id)));

presentation
  .command('update-slide <id> <index> <content>')
  .description('Updates a specific slide in a presentation')
  .action((id: string, indexStr: string, content: string) => {
    const index = parseInt(indexStr, 10);
    if (isNaN(index)) {
        logger.error('Invalid slide index provided.');
        process.exit(1);
    }
    // Assuming content is JSON string, parse it. Adjust if it's plain text.
    let slideContent;
    try {
        slideContent = JSON.parse(content);
    } catch (e) {
        logger.error('Invalid JSON content provided for slide update.');
        process.exit(1);
    }
    // Correctly pass token to the inner async function
    return handleAction(async (token) => {
        await updateSlide(token!, id, index, slideContent);
        logger.info(`Successfully updated slide ${index} for presentation ${id}.`);
    });
});


presentation
  .command('apply-theme <id> <themeId>')
  .description('Applies a theme to a presentation')
  // Correctly pass token to the inner async function
  .action((id: string, themeId: string) => handleAction(async (token) => {
      await applyTheme(token!, id, themeId);
      logger.info(`Successfully applied theme ${themeId} to presentation ${id}.`);
  }));

// --- Template Commands ---
const templates = program.command('templates').description('Template management commands');

templates
  .command('list')
  .description('Lists available templates')
  .action(() => handleAction(listTemplates));

templates
  .command('add <templateId> <templateContent>')
  .description('Adds a new template')
  .action((templateId: string, templateContent: string) => {
      // Assuming templateContent is JSON string, parse it.
      let content;
      try {
          content = JSON.parse(templateContent);
      } catch (e) {
          logger.error('Invalid JSON content provided for template.');
          process.exit(1);
      }
      return handleAction(async () => {
          await addTemplate(templateId, content);
          logger.info(`Successfully added template ${templateId}.`);
      });
  });


templates
  .command('remove <templateId>')
  .description('Removes a template')
  .action((templateId: string) => handleAction(async () => {
      await removeTemplate(templateId);
      logger.info(`Successfully removed template ${templateId}.`);
  }));

// --- Theme Commands ---
const themes = program.command('themes').description('Theme management commands');

themes
  .command('list')
  .description('Lists available themes')
  .action(() => handleAction(listThemes));

themes
  .command('create <themeId> <themeDefinition>')
  .description('Creates a new theme')
  .action((themeId: string, themeDefinition: string) => {
      // Assuming themeDefinition is JSON string, parse it.
      let definition;
      try {
          definition = JSON.parse(themeDefinition);
      } catch (e) {
          logger.error('Invalid JSON definition provided for theme.');
          process.exit(1);
      }
      return handleAction(async () => {
          await createTheme(themeId, definition);
          logger.info(`Successfully created theme ${themeId}.`);
      });
  });

themes
  .command('update <themeId> <themeUpdates>')
  .description('Updates an existing theme')
  .action((themeId: string, themeUpdates: string) => {
      // Assuming themeUpdates is JSON string, parse it.
      let updates;
      try {
          updates = JSON.parse(themeUpdates);
      } catch (e) {
          logger.error('Invalid JSON updates provided for theme.');
          process.exit(1);
      }
      return handleAction(async () => {
          await updateTheme(themeId, updates);
          logger.info(`Successfully updated theme ${themeId}.`);
      });
  });