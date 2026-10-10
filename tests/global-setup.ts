import { migrate } from '../scripts/migrate';
import { seed } from '../scripts/seed';

export default async function globalSetup() {
  await migrate(); // applies schema.sql + 002_extras.sql on a fresh test DB
  await seed(); // refuses to run unless DATABASE_URL points at a "*test*" database
}
