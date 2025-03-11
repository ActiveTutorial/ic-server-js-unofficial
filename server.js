const express = require('express');
const dotenv = require('dotenv');
const { port } = require('./logic/config');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Routes
const checkRoute = require('./endpoints/check');
const pairRoute = require('./endpoints/pair');
app.use('/api/infinite-craft/check', checkRoute);
app.use('/api/infinite-craft/pair', pairRoute);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});