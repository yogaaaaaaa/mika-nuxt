'use strict'

/**
 * Telnet command, taken and modified from
 * https://github.com/wez/telnetjs
 */
module.exports.telnetCommands = {
  IAC: 255, // Interpret as command
  DONT: 254, // You are not to use option
  DO: 253, // Please use option
  WONT: 252, // I will not use option
  WILL: 251, // I will use option
  SB: 250, // Sub-negotiation
  GA: 249, // Go-ahead
  EL: 248, // Erase line
  EC: 247, // Erase character
  AYT: 246, // Are you there?
  AO: 245, // Abort output (but let prog finish)
  IP: 244, // Interrupt (permanently)
  BREAK: 243,
  DM: 242, // Data mark
  NOP: 241, // No operation
  SE: 240, // End sub-negotiation
  EOR: 239, // End of record (transparent mode)
  ABORT: 238, // Abort process
  SUSPEND: 237, // Suspend process
  EOF: 236, // End of file
  SYNCH: 242
}

/**
 * Telnet options, taken and modified from
 * https://github.com/wez/telnetjs
 */
module.exports.telnetOptions = {
  BINARY: 0, // RFC 856
  ECHO: 1, // RFC 857
  SUPPRESS_GO_AHEAD: 3, // RFC 858
  STATUS: 5, // RFC 859
  TIMING_MARK: 6, // RFC 860
  TERMINAL_TYPE: 24, // RFC 930, 1091
  WINDOW_SIZE: 31, // RFC 1073
  LINE_MODE: 34, // RFC 1184
  NEW_ENVIRON: 39, // RFC 1572
  COMPRESS2: 86 // http://www.zuggsoft.com/zmud/mcp.htm
}
