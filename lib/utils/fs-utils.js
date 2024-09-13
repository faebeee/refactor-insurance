import fs from "fs";

export const cleanupFolder = (dir) => fs.promises.rm(dir, { recursive: true });
export const ensureFolder = (folder) => fs.promises.mkdir(folder, { recursive: true });

export const doesFileExist = async (file) => {
    try {
        const fileAlreadyExists = await fs.promises.stat(file);
        return !!fileAlreadyExists;
    } catch {

    }
    return false
}
