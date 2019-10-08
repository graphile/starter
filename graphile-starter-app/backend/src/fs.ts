import { promisify } from "util";
import * as fs from "fs";

export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);
export const utimes = promisify(fs.utimes);
export const close = promisify(fs.close);
export const open = promisify(fs.open);

export const touch = async (filepath: string): Promise<void> => {
  try {
    const time = new Date();
    await utimes(filepath, time, time);
  } catch (err) {
    await close(await open(filepath, "w"));
  }
};
