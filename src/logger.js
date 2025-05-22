const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = './logs';
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level.toUpperCase()}: ${message}\n`;
  }

  writeLog(level, message) {
    const logFile = path.join(this.logDir, `${level}.log`);
    const formattedMessage = this.formatMessage(level, message);

    // Write to file
    fs.appendFileSync(logFile, formattedMessage);

    // Also log to console
    if (level === 'error') {
      console.error(formattedMessage.trim());
    } else {
      console.log(formattedMessage.trim());
    }
  }

  info(message) {
    this.writeLog('info', message);
  }

  error(message) {
    this.writeLog('error', message);
  }

  warn(message) {
    this.writeLog('warn', message);
  }

  debug(message) {
    this.writeLog('debug', message);
  }
}

module.exports = new Logger();