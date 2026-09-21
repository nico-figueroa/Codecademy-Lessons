import { resetTestDb } from './testDb.js';
import { seedTestData } from './testSeed.js';

export default async function () {
  await resetTestDb();
  await seedTestData();
}
