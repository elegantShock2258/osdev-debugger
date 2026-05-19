import * as fs from "fs";
import * as path from "path";
import { SpecialKeys } from "../types/KeyboardModifiers";

type LogEntry =
  | { type: "message"; message: string }
  | {
      type: "framebuffer";
      title: string;
      height: number;
      width: number;
      data: Uint8Array;
    }
  | {
      type: "keyboard";
      char: number;
      scancode: number;
      modifiers?: SpecialKeys;
    };

// export function parseLogEntries(buffer: Uint8Array): LogEntry[] {
//   const entries: LogEntry[] = [];

//   let i = 0;
//   const decoder = new TextDecoder();

//   while (i < buffer.length) {
//     // Look for the next [LOG]: start
//     const startIndex = buffer.indexOf(0x5b /* [ */, i); // look for '['
//     if (startIndex === -1 || decoder.decode(buffer.slice(startIndex, startIndex + 7)) !== '[LOG]:') {
//       break;
//     }

//     i = startIndex;

//     // Try to read next few hundred characters to see if it's an FB or message
//     const lookahead = decoder.decode(buffer.slice(i, i + 200));

//     if (lookahead.startsWith('[LOG]: [FB]:')) {
//       const fbMatch = lookahead.match(/^\[LOG\]: \[FB\]: ([^\s]+) (\d+)x(\d+)/);
//       if (!fbMatch) break;

//       const [, title, heightStr, widthStr] = fbMatch;
//       const height = parseInt(heightStr, 10);
//       const width = parseInt(widthStr, 10);
//       const pixelCount = height * width;

//       const header = `[LOG]: [FB]: ${title} ${height}x${width}`;
//       const headerBytes = new TextEncoder().encode(header);
//       const dataStart = i + headerBytes.length;

//       const fbData = buffer.slice(dataStart, dataStart + pixelCount);
//       entries.push({
//         type: 'framebuffer',
//         title,
//         height,
//         width,
//         data: fbData,
//       });

//       i = dataStart + pixelCount;
//     } else {
//       // Just a regular log message: find end of this message
//       const nextLogStart = buffer.indexOf(0x5b /* [ */, i + 7);
//       const end = nextLogStart === -1 ? buffer.length : nextLogStart;

//       const logMessage = decoder.decode(buffer.slice(i + 7, end)).trim();
//       entries.push({
//         type: 'message',
//         message: logMessage,
//       });

//       i = end;
//     }
//   }

//   return entries;
// }

// export type LogEntry =
//   | { type: 'message'; message: string }
//   | { type: 'framebuffer'; title: string; height: number; width: number; data: string };
// export function parseLogEntries(buffer: string): LogEntry[] {
//   const entries: LogEntry[] = [];
//   let i = 0;

//   while (i < buffer.length) {
//     const startIndex = buffer.indexOf("[LOG]:", i);
//     if (startIndex === -1) break;

//     const rest = buffer.slice(startIndex);

//     if (rest.startsWith("[LOG]: [FB]:")) {
//       const fbMatch = rest.match(/^\[LOG\]: \[FB\]: ([^\s]+) (\d+)x(\d+)/);
//       if (!fbMatch) break;

//       const [, title, heightStr, widthStr] = fbMatch;
//       const height = parseInt(heightStr, 10);
//       const width = parseInt(widthStr, 10);
//       const pixelCount = height * width;

//       const header = `[LOG]: [FB]: ${title} ${height}x${width}`;
//       const headerLength = header.length;

//       const dataStart = startIndex + headerLength;
//       const dataEnd = dataStart + pixelCount;

//       const dataSlice = buffer.slice(dataStart, dataEnd);
//       const data = new Uint8Array(pixelCount);
//       for (let j = 0; j < pixelCount; j++) {
//         data[j] = dataSlice.charCodeAt(j) || 0;
//       }

//       entries.push({
//         type: "framebuffer",
//         title,
//         height,
//         width,
//         data,
//       });

//       i = dataEnd;
//     } else if (rest.startsWith("[LOG]: [KEYBOARD]:")) {
//       const end = buffer.indexOf("[LOG]:", startIndex + 1);
//       const logEnd = end === -1 ? buffer.length : end;

//       const fullLine = buffer.slice(startIndex, logEnd);
//       const keyboardMatch = fullLine.match(/\[KEYBOARD\]: (\d+)\s+(\d+)/);
//       if (keyboardMatch) {
//         const [, scancodeStr, charStr] = keyboardMatch;
//         entries.push({
//           type: "keyboard",
//           scancode: parseInt(scancodeStr, 10),
//           char: parseInt(charStr, 10),
//         });
//       }

//       i = logEnd;
//     } else {
//       const end = buffer.indexOf("[LOG]:", startIndex + 1);
//       const logEnd = end === -1 ? buffer.length : end;

//       const message = buffer.slice(startIndex + "[LOG]:".length, logEnd).trim();

//       entries.push({
//         type: "message",
//         message,
//       });

//       i = logEnd;
//     }
//   }

//   return entries;
// }
export function parseLogEntries(buffer: string): LogEntry | undefined {
  if (!buffer.startsWith("[LOG]:")) return undefined;

  const rest = buffer.slice("[LOG]:".length).trim();

  if (rest.startsWith("[FB]:")) {
    const fbMatch = rest.match(/^\[FB\]: ([^\s]+) (\d+)x(\d+)([\s\S]*)/);
    if (!fbMatch) return undefined;

    const [, title, heightStr, widthStr, rawData] = fbMatch;
    const height = parseInt(heightStr, 10);
    const width = parseInt(widthStr, 10);
    const pixelCount = height * width;

    const data = new Uint8Array(pixelCount);
    for (let i = 0; i < pixelCount; i++) {
      data[i] = rawData.charCodeAt(i) || 0;
    }

    return {
      type: "framebuffer",
      title,
      height,
      width,
      data,
    };
  }

  if (rest.startsWith("[KEYBOARD]:")) {
    const kbMatch = rest.match(/^\[KEYBOARD\]: (\d+)\s+(\d+)/);
    if (!kbMatch) return undefined;

    const [, scancodeStr, charStr] = kbMatch;
    return {
      type: "keyboard",
      scancode: parseInt(scancodeStr, 10),
      char: parseInt(charStr, 10),
    };
  }

  // Otherwise, it's a simple message
  return {
    type: "message",
    message: rest,
  };
}
