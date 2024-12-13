import Parser from 'npm:node-sql-parser';
import { createConnection } from 'npm:mysql2/promise';


const cache = new Map<string, any>();
const queryTableMap = new Map<string, Set<string>>(); // Maps cache keys to table names

const PROXY_PORT = 3307; // Port for the proxy server
const MYSQL_HOST = "localhost"; // Host of the actual MySQL server
const MYSQL_PORT = 3306; // Port of the actual MySQL server

const parser = new Parser.Parser();
const dbConfig = {
  port: MYSQL_PORT,
  host: MYSQL_HOST,
  user: 'root',
  password: 'password',
  database: 'test',
};


async function startMySQLProxyServer() {
  const server = Deno.listen({ port: PROXY_PORT });
  console.log(`MySQL Proxy Server is running on port ${PROXY_PORT}`);

  for await (const clientConn of server) {
    console.log("New connection received");

    const mysqlConn = await Deno.connect({ hostname: MYSQL_HOST, port: MYSQL_PORT });
    console.log("Connected to MySQL server");

    // Forward data from client to MySQL server
    clientConn.readable.pipeTo(mysqlConn.writable).catch((err) => {
      console.error("Error forwarding data from client to MySQL server:", err);
    });

    // Forward data from MySQL server to client
    mysqlConn.readable.pipeTo(clientConn.writable).catch((err) => {
      console.error("Error forwarding data from MySQL server to client:", err);
    });

    // Close connections when done
    clientConn.closed.catch(() => {
      mysqlConn.close();
    });
    mysqlConn.closed.catch(() => {
      clientConn.close();
    });
  }
}


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

