require('dotenv').config();

const databaseCreds = {
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT
};

const apiCreds = {
    key: process.env.API_KEY
};

const port = process.env.PORT || 3000;

module.exports = { databaseCreds, apiCreds, port };