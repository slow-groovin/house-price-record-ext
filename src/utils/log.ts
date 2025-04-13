// --- Logger Setup (e.g., in a logger.js module) ---

const _realLog = console.log.bind(console);
const _realWarn = console.warn.bind(console);
const _realError = console.error.bind(console);
const _noop = () => {}; // Function that does nothing

let _loggingEnabled = import.meta.env.DEV && true; // Default state, can be changed

// Your actual logger object that the rest of your code will use
export const logger = {
  log: _loggingEnabled ? _realLog : _noop,
  warn: _loggingEnabled ? _realWarn : _noop,
  error: _loggingEnabled ? _realError : _noop,
};
