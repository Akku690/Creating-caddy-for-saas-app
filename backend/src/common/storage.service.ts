import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileStorageService {
  private dataDir = path.join(__dirname, '../../data');

  readJSON(filename: string) {
    const filePath = path.join(this.dataDir, `${filename}.json`);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }

  writeJSON(filename: string, data: any) {
    const filePath = path.join(this.dataDir, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  findById(filename: string, id: number) {
    const data = this.readJSON(filename);
    return data.find((item: any) => item.id === id);
  }

  create(filename: string, item: any) {
    const data = this.readJSON(filename);
    const maxId = data.length > 0 ? Math.max(...data.map((i: any) => i.id)) : 0;
    item.id = maxId + 1;
    data.push(item);
    this.writeJSON(filename, data);
    return item;
  }
}
