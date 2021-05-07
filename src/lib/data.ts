import * as fs from 'fs';
import * as path from 'path';
import { Datastore } from '../types/datastore';

const FILE_PATH = path.join(__dirname, '../../data.json');

export const write = (contents: Partial<Datastore>, override: boolean = false) => {
  const existingContents = read();
  const newContents: Partial<Datastore> = override
    ? contents
    : { ...existingContents, ...contents };
  fs.writeFileSync(FILE_PATH, JSON.stringify(newContents, null, 2), {
    mode: 777
  });
  return newContents;
};

export const read = (): Partial<Datastore> => {
  const contents = fs.readFileSync(FILE_PATH);
  return JSON.parse(contents.toString());
};
