const { Pool, Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config()

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:basepassword@localhost:5432/lab2',
    ssl: process.env.DATABASE_URL ? true : false,
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'lab2',
    password: process.env.DB_PASSWORD,
    port: 5432,
})

module.exports = {
    query: (text, params) => {
        const start = Date.now();
        return pool.query(text, params)
            .then(res => {
                const duration = Date.now() - start;
                //console.log('executed query', {text, params, duration, rows: res.rows});
                return res;
            });
    },
    pool: pool
}


