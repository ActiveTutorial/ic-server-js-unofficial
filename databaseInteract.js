const { Pool } = require('pg');
const { databaseCreds } = require('./config');

const pool = new Pool(databaseCreds);

async function findResults(type, ...args) {
    const client = await pool.connect();
    let query, values;
    
    if (type === 'emoji' && args.length === 1) {
        query = 'SELECT emoji FROM emojis WHERE item = $1';
        values = [args[0]];
    } else if (type === 'result' && args.length === 2) {
        query = 'SELECT result FROM results WHERE first = $1 AND second = $2';
        values = [args[0], args[1]];
    } else {
        client.release();
        return false;
    }

    const res = await client.query(query, values);
    client.release();
    return res.rows.length > 0 ? res.rows[0][type] : false;
}

async function addRecipe(first, second, result) {
    const client = await pool.connect();
    const query = 'INSERT INTO results (first, second, result) VALUES ($1, $2, $3)';
    const values = [first, second, result];
    
    const res = await client.query(query, values);
    client.release();
    return res.rowCount > 0;
}

async function addItem(item, emoji) {
    const client = await pool.connect();
    const query = 'INSERT INTO emojis (item, emoji) VALUES ($1, $2)';
    const values = [item, emoji];
    
    const res = await client.query(query, values);
    client.release();
    return res.rowCount > 0;
}

async function aliveCheck(item) {
    const client = await pool.connect();
    const query = 'SELECT 1 FROM emojis WHERE item = $1';
    const res = await client.query(query, [item]);
    client.release();
    return res.rows.length > 0;
}

async function findRecipe(first, second, result) {
    const client = await pool.connect();
    const query = 'SELECT 1 FROM results WHERE first = $1 AND second = $2 AND result = $3';
    const values = [first, second, result];
    
    const res = await client.query(query, values);
    client.release();
    return res.rows.length > 0;
}

module.exports = {
    findResults,
    addRecipe,
    addItem,
    aliveCheck,
    findRecipe
};
