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

const allowedHosts = process.env.ALLOWED_HOSTS ?
    process.env.ALLOWED_HOSTS.split(',') :
    [
        'http://localhost:3000', // local dev
        'https://neal.fun', // normal site
        'https://beta.neal.fun' // beta site
    ];

module.exports = { databaseCreds, apiCreds, port, allowedHosts };