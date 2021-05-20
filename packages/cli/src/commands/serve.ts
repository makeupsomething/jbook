import path from 'path';
import { Command } from 'commander';
import { serve } from 'local-api';

const isProduction = process.env.NODE_ENV === 'production';

export const serveCommand = new Command()
  .command('serve [filename]')
  .description('Open a file for editing')
  .option('-p --port <number>', 'port to run server on', '4005')
  .action(async (filename = 'notebook.js', options) => {
    try {
      const dir = path.join(process.cwd(), path.dirname(filename));

      await serve(+options.port, path.basename(filename), dir, !isProduction);

      console.log(`Opened ${filename} at http://localhost:${options.port}`);
    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        console.log(
          `The port ${options.port} is already in use`,
          error.message,
        );
      } else {
        console.log(
          'Could not determine the issue, error message',
          error.message,
        );
      }

      process.exit(1);
    }
  });
