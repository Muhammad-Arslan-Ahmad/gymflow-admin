import { neon } from '@neondatabase/serverless';
import pg from 'pg';

const NullishQueryFunction = () => {
  throw new Error(
    'No database connection string was provided to `neon()`. Perhaps process.env.DATABASE_URL has not been set'
  );
};
NullishQueryFunction.transaction = () => {
  throw new Error(
    'No database connection string was provided to `neon()`. Perhaps process.env.DATABASE_URL has not been set'
  );
};

function buildQuery(stringsOrQuery, values) {
  if (Array.isArray(stringsOrQuery) && stringsOrQuery.raw) {
    // Tagged template literal: sql`SELECT * FROM foo WHERE id = ${id}`
    let query = '';
    stringsOrQuery.forEach((str, i) => {
      query += str;
      if (i < values.length) {
        query += `$${i + 1}`;
      }
    });
    return { text: query, params: values };
  }
  // Regular function call: sql(queryString, [params])
  return { text: stringsOrQuery, params: values[0] || [] };
}

function createQueryFn(queryable) {
  return async (stringsOrQuery, ...values) => {
    const { text, params } = buildQuery(stringsOrQuery, values);
    const result = await queryable.query(text, params);
    return result.rows;
  };
}

function createLocalSql() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  const fn = createQueryFn(pool);

  fn.transaction = async (callback) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(createQueryFn(client));
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  };

  return fn;
}

const useLocalDb = process.env.USE_LOCAL_DB === 'true'
  || (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('neon.tech'));

const sql = process.env.DATABASE_URL
  ? (useLocalDb ? createLocalSql() : neon(process.env.DATABASE_URL))
  : NullishQueryFunction;

export default sql;
