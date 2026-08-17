import * as chrono from "chrono-node";

export function parseDate(input: string): Date {
  const result = chrono.parseDate(input, new Date(), {
    forwardDate: true,
  });

  if (!result) {
    throw new Error(`Could not understand date: "${input}"`);
  }

  return result;
}
