import { promises as fsp } from "fs";

const { utimes, open } = fsp;

export const touch = async (filepath: string): Promise<void> => {
  try {
    const time = new Date();
    await utimes(filepath, time, time);
  } catch (err) {
    const filehandle = await open(filepath, "w");
    await filehandle.close();
  }
};
