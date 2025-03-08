const { Pool } = require('pg');
const { databaseCreds } = require('./config');

const pool = new Pool(databaseCreds);

async function findResults(type, ...args) {
    const client = await pool.connect();
    let query, values;
    
    switch (type) {
        case 'emoji':
            query = 'SELECT emoji FROM emojis WHERE item = $1';
            values = [args[0]];
            break;
        case 'result':
            query = 'SELECT result FROM results WHERE first = $1 AND second = $2';
            values = [args[0], args[1]];
            break;
        default:
            client.release();
            return false;
    }

    const res = await client.query(query, values);
    client.release();
    // Return result
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
    // Make sure the item is unique, if not, update the emoji
    const query = `
        INSERT INTO emojis (item, emoji) VALUES ($1, $2)
        ON CONFLICT (item) DO UPDATE SET emoji = $2
    `;
    const values = [item, emoji];
    
    const res = await client.query(query, values);
    client.release();
    return res.rowCount > 0;
}

async function itemExists(item) {
    const client = await pool.connect();
    // Search if the item exists
    const query = 'SELECT 1 FROM emojis WHERE item = $1';
    const res = await client.query(query, [item]);
    client.release();
    return res.rows.length > 0;
}

async function findRecipe(first, second, result) {
    const client = await pool.connect();
    // Search if the recipe exists
    const query = 'SELECT 1 FROM results WHERE first = $1 AND second = $2 AND result = $3';
    const values = [first, second, result];
    
    const res = await client.query(query, values);
    client.release();
    return res.rows.length > 0;
}

// Export functions
module.exports = {
    findResults,
    addRecipe,
    addItem,
    itemExists,
    findRecipe
};
