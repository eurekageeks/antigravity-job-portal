const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const initDatabase = async () => {
  console.log('Starting MySQL Database initialization...');

  // Create connection without database specified first (to create database if not exists)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    // Read schema.sql and seed.sql files
    const schemaSql = fs.readFileSync(path.join(__dirname, '../../schema.sql'), 'utf8');
    const seedSql = fs.readFileSync(path.join(__dirname, '../../seed.sql'), 'utf8');

    // Helper to execute multi-statement SQL text
    const executeQueries = async (sqlText) => {
      // Split queries by semicolon, taking care not to split inside JSON strings
      // A simple regex approach or sequential query splitter
      const queries = sqlText
        .split(/;\s*$/m) // Split by semicolon at the end of lines
        .map(q => q.trim())
        .filter(q => q.length > 0);

      for (const query of queries) {
        // Clean up queries (e.g. remove comments)
        const cleanedQuery = query
          .split('\n')
          .filter(line => !line.trim().startsWith('--'))
          .join('\n')
          .trim();

        if (cleanedQuery) {
          try {
            await connection.query(cleanedQuery);
          } catch (err) {
            // Ignore database select errors during dropdowns, but log others
            console.error(`Error executing query: ${cleanedQuery.substring(0, 100)}...`);
            console.error(err.message);
          }
        }
      }
    };

    console.log('Executing schema.sql queries...');
    await executeQueries(schemaSql);

    console.log('Executing seed.sql queries...');
    await executeQueries(seedSql);

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    await connection.end();
  }
};

initDatabase();
