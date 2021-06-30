const chalk = require('chalk');
const { createLogger, format, transports } = require('winston');

const { combine, timestamp } = format;

class Logger {
  constructor() {
    this.console = createLogger({
      transports: [new transports.Console()],
      format: combine(
        timestamp(),
        format.printf(log => {
          if (log.level === 'info') {
            return `${chalk.hex('#5865f2')(`[${log.level.toUpperCase()}]`)} - ${
              log.message
            }`;
          }
          return `${chalk.hex('#f00')(`[${log.level.toUpperCase()}]`)} - ${
            log.message
          }`;
        })
      )
    });
  }

  log(text) {
    this.console.log({
      level: 'info',
      message: text
    });
  }

  logError(text) {
    this.console.log({
      level: 'error',
      message: text
    });
  }
}

module.exports = Logger;
