import { Injectable } from '@nestjs/common';
import { access, readFile, writeFile, rename } from 'node:fs/promises';
import * as path from 'node:path';

@Injectable()
export class FileStorageService {
  private readonly dataDir = path.join(__dirname, '../../data');
  private writeQueue: Promise<void> = Promise.resolve();

  async readJSON(filename: string) {
    const filePath = path.join(this.dataDir, `${filename}.json`);
    try {
      await access(filePath);
    } catch {
      return [];
    }
    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data);
  }

  async writeJSON(filename: string, data: any) {
    const filePath = path.join(this.dataDir, `${filename}.json`);
    const tempPath = `${filePath}.tmp`;
    this.writeQueue = this.writeQueue.then(async () => {
      await writeFile(tempPath, JSON.stringify(data, null, 2));
      await rename(tempPath, filePath);
    });
    return this.writeQueue;
  }

  async findById(filename: string, id: number) {
    const data = await this.readJSON(filename);
    return data.find((item: any) => item.id === id);
  }

  async create(filename: string, item: any) {
    const data = await this.readJSON(filename);
    const maxId = data.length > 0 ? Math.max(...data.map((i: any) => i.id)) : 0;
    item.id = maxId + 1;
    data.push(item);
    await this.writeJSON(filename, data);
    return item;
  }
}
