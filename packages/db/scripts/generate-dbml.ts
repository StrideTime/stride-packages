import { sqliteGenerate } from 'drizzle-dbml-generator';
import * as schema from '../src/drizzle/schema';

const out = './schema.dbml';

sqliteGenerate({
  schema,
  out,
  relational: true,
});

console.log(`✅ DBML generated at ${out}`);
console.log('Paste contents into https://dbdiagram.io to visualize');
