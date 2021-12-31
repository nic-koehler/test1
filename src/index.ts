import type { HttpFunction } from '@google-cloud/functions-framework/build/src/functions';
import { readFileSync } from 'fs';
import mysql from 'promise-mysql';

// [START cloud_sql_mysql_mysql_create_socket]
const createUnixSocketPool = async (config: any) => {
    const caPath = process.env.DB_SSL_CA || '/foo1/mariadb-ca-cert';
    const certPath = process.env.DB_SSL_CERT || '/foo2/mariadb-client-cert';
    const keyPath = process.env.DB_SSL_KEY || '/foo3/mariadb-client-key';
  
    // Establish a connection to the database
    return await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER, // e.g. 'my-db-user'
      password: process.env.DB_PASS, // e.g. 'my-db-password'
      database: process.env.DB_NAME, // e.g. 'my-database'
      // Specify additional properties here.
      ssl: {
          ca: readFileSync( caPath ),
          cert: readFileSync( certPath ),
          key: readFileSync( keyPath )
      },
      ...config,
    });
};
// [END cloud_sql_mysql_mysql_create_socket]
  
const createPool = async () => {
    const config = {
      // [START cloud_sql_mysql_mysql_limit]
      // 'connectionLimit' is the maximum number of connections the pool is allowed
      // to keep at once.
      connectionLimit: 5,
      // [END cloud_sql_mysql_mysql_limit]
  
      // [START cloud_sql_mysql_mysql_timeout]
      // 'connectTimeout' is the maximum number of milliseconds before a timeout
      // occurs during the initial connection to the database.
      connectTimeout: 10000, // 10 seconds
      // 'acquireTimeout' is the maximum number of milliseconds to wait when
      // checking out a connection from the pool before a timeout error occurs.
      acquireTimeout: 10000, // 10 seconds
      // 'waitForConnections' determines the pool's action when no connections are
      // free. If true, the request will queued and a connection will be presented
      // when ready. If false, the pool will call back with an error.
      waitForConnections: true, // Default: true
      // 'queueLimit' is the maximum number of requests for connections the pool
      // will queue at once before returning an error. If 0, there is no limit.
      queueLimit: 0, // Default: 0
      // [END cloud_sql_mysql_mysql_timeout]
  
      // [START cloud_sql_mysql_mysql_backoff]
      // The mysql module automatically uses exponential delays between failed
      // connection attempts.
      // [END cloud_sql_mysql_mysql_backoff]
    };
    return await createUnixSocketPool(config);
  
};
  
const ensureSchema = async (pool: any) => {
    // Wait for tables to be created (if they don't already exist).
    // await pool.query(
    //   `CREATE TABLE IF NOT EXISTS votes
    //     ( vote_id SERIAL NOT NULL, time_cast timestamp NOT NULL,
    //     candidate CHAR(6) NOT NULL, PRIMARY KEY (vote_id) );`
    // );
    console.log("Ensured that table 'votes' exists");
};
  
const createPoolAndEnsureSchema = async () =>
    await createPool()
      .then(async pool => {
        await ensureSchema(pool);
        return pool;
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  
// Set up a variable to hold our connection pool. It would be safe to
// initialize this right away, but we defer its instantiation to ease
// testing different configurations.
let pool: any;

export const test1: HttpFunction = async (req, res) => {
    pool = pool || (await createPoolAndEnsureSchema());
    res.json({
        message: await pool.query( 'select * from pet' )
    });
}