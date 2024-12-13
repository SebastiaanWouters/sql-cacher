import Parser from 'npm:node-sql-parser';
import { createConnection } from 'npm:mysql2/promise';


const cache = new Map<string, any>();
const queryTableMap = new Map<string, Set<string>>(); // Maps cache keys to table names

const parser = new Parser.Parser();
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'test',
};

// Function to execute query and manage caching
async function executeQuery(query: string) {
  const ast = parser.astify(query, { database: 'MySQL' }); // Parse query
  const tableList = parser.tableList(query); // Extract affected tables
  const queryType = ast.type; // Query type (select, insert, update, etc.)

  if (queryType === 'select') {
    // Check if query result is cached
    if (cache.has(query)) {
      console.log('Cache hit');
      return cache.get(query);
    }

    // Forward the query to the database
    const dbConnection = await createConnection(dbConfig);
    const [results] = await dbConnection.execute(query);
    await dbConnection.end();

    // Cache results and map query to tables
    cache.set(query, results);
    queryTableMap.set(query, new Set(tableList));

    return results;
  } else if (['insert', 'update', 'delete'].includes(queryType)) {
    // Invalidate cache for affected tables
    console.log('Invalidating cache...');
    for (const [cachedQuery, tables] of queryTableMap.entries()) {
      if ([...tables.values()].some((table: string) => tableList.includes(table))) {
        cache.delete(cachedQuery);
        queryTableMap.delete(cachedQuery);
      }
    }

    // Forward the query to the database
    const dbConnection = await createConnection(dbConfig);
    const [results] = await dbConnection.execute(query);
    await dbConnection.end();

    return results;
  } else {
    throw new Error(`Unsupported query type: ${queryType}`);
  }
}

// Example usage
(async () => {
  // Read query (caches result)
  const selectQuery = 'SELECT id, name FROM students WHERE age > 18';
  const results1 = await executeQuery(selectQuery);
  console.log(results1);

  const updateQuery = 'UPDATE students SET age = 20 WHERE id = 1';
  const results2 = await executeQuery(updateQuery);
  console.log(results2);

  // Repeat read query (cache miss after invalidation)
  const results3 = await executeQuery(selectQuery);
  console.log(results3);
})();

