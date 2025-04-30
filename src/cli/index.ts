// Entry point for the CLI application
import { program } from './commands';

// Parse command line arguments and execute the corresponding action
program.parseAsync(process.argv).catch(error => {
  // Log unexpected errors during parsing/execution setup
  // Individual command errors are handled within handleAction
  console.error("An unexpected error occurred:", error);
  process.exit(1);
});