/**
 * Generates a Liam ERD-native JSON file from the Drizzle SQLite schema.
 * Liam ERD's --format drizzle doesn't support SQLite, so we generate
 * the JSON ourselves and use --format liam instead.
 *
 * Enums and column→enum mappings are discovered automatically:
 *   - Enum values: imported dynamically from @stridetime/types
 *   - Column→enum map: parsed from $type<EnumName>() in schema.ts
 *
 * Usage: npx tsx scripts/generate-liam.ts
 * Then:  pnpm dlx @liam-hq/cli erd build --format liam --input ./schema.json
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getTableConfig, SQLiteTable } from 'drizzle-orm/sqlite-core';
import { createTableRelationsHelpers, getTableName, is } from 'drizzle-orm';
import type { SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core';
import type { Relations } from 'drizzle-orm';
import * as schema from '../src/drizzle/schema';
import * as types from '@stridetime/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------------------------------------------------------
// 1. Auto-discover enums from @stridetime/types
// ---------------------------------------------------------------------------

const ENUMS: Record<string, string[]> = {};

for (const [name, value] of Object.entries(types)) {
  // Skip non-objects, arrays, and null
  if (!value || typeof value !== 'object' || Array.isArray(value)) continue;

  const vals = Object.values(value as Record<string, unknown>);

  // An enum-like object has at least 2 values and all values are strings
  if (vals.length >= 2 && vals.every(v => typeof v === 'string')) {
    ENUMS[name] = vals as string[];
  }
}

// ---------------------------------------------------------------------------
// 2. Auto-discover column→enum mappings by parsing schema.ts source
// ---------------------------------------------------------------------------

const COLUMN_ENUM_MAP: Record<string, string> = {};

const schemaPath = resolve(__dirname, '../src/drizzle/schema.ts');
const schemaSource = readFileSync(schemaPath, 'utf8');
const lines = schemaSource.split('\n');

let currentTable: string | null = null;
let pendingSqliteTable = false;

for (const line of lines) {
  // Handle two-line sqliteTable definitions:
  //   export const fooTable = sqliteTable(
  //     'foo',
  if (pendingSqliteTable) {
    const nameMatch = line.match(/^\s*'([^']+)'/);
    if (nameMatch) {
      currentTable = nameMatch[1];
    }
    pendingSqliteTable = false;
    continue;
  }

  // Detect table definitions — name may be on same or next line
  if (line.includes('sqliteTable(')) {
    const sameLineMatch = line.match(/sqliteTable\(\s*'([^']+)'/);
    if (sameLineMatch) {
      currentTable = sameLineMatch[1];
    } else {
      // Table name is on the next line
      pendingSqliteTable = true;
    }
    continue;
  }

  // Detect $type<EnumName>() on columns within a table
  if (currentTable) {
    const typeMatch = line.match(/text\('([^']+)'\).*\.\$type<(\w+)>\(\)/);
    if (typeMatch) {
      const [, columnName, enumName] = typeMatch;
      // Only map if we actually discovered this enum from @stridetime/types
      if (ENUMS[enumName]) {
        COLUMN_ENUM_MAP[`${currentTable}.${columnName}`] = enumName;
      }
    }

    // End of table definition — next export that isn't a sqliteTable
    if (line.match(/^export\s+(const|type|interface)\s/) && !line.includes('sqliteTable')) {
      currentTable = null;
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Collect all tables and relations from the schema exports
// ---------------------------------------------------------------------------

const tables: SQLiteTableWithColumns<any>[] = [];
const relationDefs: { table: SQLiteTableWithColumns<any>; relations: Relations }[] = [];

for (const [key, value] of Object.entries(schema)) {
  if (!key.endsWith('Relations') && is(value as any, SQLiteTable)) {
    tables.push(value as SQLiteTableWithColumns<any>);
  }

  if (
    value &&
    typeof value === 'object' &&
    'table' in value &&
    'config' in value &&
    typeof (value as any).config === 'function' &&
    key.endsWith('Relations')
  ) {
    relationDefs.push({
      table: (value as any).table,
      relations: value as Relations,
    });
  }
}

// ---------------------------------------------------------------------------
// 4. Extract FK relations from Drizzle relation definitions
// ---------------------------------------------------------------------------

interface FKRelation {
  childTable: string;
  childColumns: string[];
  parentTable: string;
  parentColumns: string[];
}

const relationSet = new Set<string>();
const fkRelations: FKRelation[] = [];

for (const { table, relations: relObj } of relationDefs) {
  const helpers = createTableRelationsHelpers(table);
  let relConfig: Record<string, any>;

  try {
    relConfig = (relObj as any).config(helpers);
  } catch {
    continue;
  }

  const sourceTableName = getTableName(table);

  for (const [, rel] of Object.entries(relConfig)) {
    if (rel.constructor.name !== 'One' || !rel.config?.fields?.length) {
      continue;
    }

    const sourceFields: string[] = rel.config.fields.map((f: any) => f.name);
    const refFields: string[] = rel.config.references.map((f: any) => f.name);
    const refTableName: string = rel.referencedTableName;

    let childTable: string;
    let childColumns: string[];
    let parentTable: string;
    let parentColumns: string[];

    if (sourceFields[0] === 'id' && refFields[0] !== 'id') {
      childTable = refTableName;
      childColumns = refFields;
      parentTable = sourceTableName;
      parentColumns = sourceFields;
    } else {
      childTable = sourceTableName;
      childColumns = sourceFields;
      parentTable = refTableName;
      parentColumns = refFields;
    }

    const key = `${childTable}.${childColumns.join(',')}→${parentTable}.${parentColumns.join(',')}`;
    if (relationSet.has(key)) continue;
    relationSet.add(key);

    fkRelations.push({ childTable, childColumns, parentTable, parentColumns });
  }
}

// ---------------------------------------------------------------------------
// 5. Build Liam-native JSON (tables, enums, extensions)
// ---------------------------------------------------------------------------

// Build FK lookup: tableName → FK constraints
const fksByTable = new Map<string, FKRelation[]>();
for (const fk of fkRelations) {
  if (!fksByTable.has(fk.childTable)) fksByTable.set(fk.childTable, []);
  fksByTable.get(fk.childTable)!.push(fk);
}

const liamTables: Record<string, any> = {};

for (const table of tables) {
  const config = getTableConfig(table);

  // Columns — use enum type name where applicable
  const columns: Record<string, any> = {};
  for (const col of config.columns) {
    const enumKey = `${config.name}.${col.name}`;
    const enumName = COLUMN_ENUM_MAP[enumKey];

    const rawType = col.columnType
      .replace('SQLiteText', 'text')
      .replace('SQLiteInteger', 'integer')
      .replace('SQLiteReal', 'real')
      .replace('SQLiteBoolean', 'integer');

    // Add enum values as column comment so they're visible on hover/click
    const comment = enumName ? ENUMS[enumName].join(' | ') : '';

    columns[col.name] = {
      name: col.name,
      type: enumName || rawType,
      default: col.hasDefault && col.default !== undefined ? col.default : null,
      check: null,
      comment,
      notNull: col.notNull,
    };
  }

  // Indexes
  const indexes: Record<string, any> = {};
  for (const idx of config.indexes) {
    const idxName = idx.config.name || '';
    indexes[idxName] = {
      name: idxName,
      unique: idx.config.unique || false,
      columns: idx.config.columns.map((c: any) => c.name),
      type: '',
    };
  }

  // Constraints
  const constraints: Record<string, any> = {};

  // Primary key
  const pkCols = config.columns.filter(col => col.primary);
  if (pkCols.length > 0) {
    const pkName = `${config.name}_pkey`;
    constraints[pkName] = {
      type: 'PRIMARY KEY',
      name: pkName,
      columnNames: pkCols.map(c => c.name),
    };
  }

  // Unique from columns
  for (const col of config.columns) {
    if (col.isUnique) {
      const uqName = `${config.name}_${col.name}_unique`;
      constraints[uqName] = {
        type: 'UNIQUE',
        name: uqName,
        columnNames: [col.name],
      };
    }
  }

  // Unique from indexes
  for (const idx of config.indexes) {
    if (idx.config.unique) {
      const uqName = idx.config.name || `${config.name}_unique`;
      constraints[uqName] = {
        type: 'UNIQUE',
        name: uqName,
        columnNames: idx.config.columns.map((c: any) => c.name),
      };
    }
  }

  // Foreign key constraints
  const tableFKs = fksByTable.get(config.name) || [];
  for (const fk of tableFKs) {
    const fkName = `${fk.childTable}_${fk.childColumns.join('_')}_fk`;
    constraints[fkName] = {
      type: 'FOREIGN KEY',
      name: fkName,
      columnNames: fk.childColumns,
      targetTableName: fk.parentTable,
      targetColumnNames: fk.parentColumns,
      updateConstraint: 'NO_ACTION',
      deleteConstraint: 'NO_ACTION',
    };
  }

  liamTables[config.name] = {
    name: config.name,
    comment: '',
    columns,
    indexes,
    constraints,
  };
}

// Build enums object — only include enums that are actually used by a column
const usedEnumNames = new Set(Object.values(COLUMN_ENUM_MAP));
const liamEnums: Record<string, any> = {};
for (const [name, values] of Object.entries(ENUMS)) {
  if (usedEnumNames.has(name)) {
    liamEnums[name] = {
      name,
      values,
      comment: '',
    };
  }
}

// ---------------------------------------------------------------------------
// 6. Write output
// ---------------------------------------------------------------------------

const output = {
  tables: liamTables,
  enums: liamEnums,
  extensions: {},
  comment: '',
};

const outPath = './schema.json';
writeFileSync(outPath, JSON.stringify(output, null, 2));

const enumColCount = Object.keys(COLUMN_ENUM_MAP).length;
console.log(`✅ Liam JSON generated at ${outPath}`);
console.log(
  `   ${Object.keys(liamTables).length} tables, ${fkRelations.length} relations, ${Object.keys(liamEnums).length} enums (${enumColCount} typed columns)`
);
console.log(
  `   Discovered ${Object.keys(ENUMS).length} enums from @stridetime/types, ${Object.keys(liamEnums).length} used in schema`
);
console.log('');
console.log('To build the ERD:');
console.log('  pnpm dlx @liam-hq/cli erd build --format liam --input ./schema.json');
console.log('  npx serve dist/');
