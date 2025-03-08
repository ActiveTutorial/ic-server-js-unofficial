# Unofficial Infinite Craft Backend

This is an unofficial backend server for Infinite Craft by Neal,
from neal.fun: https://neal.fun/infinite-craft/

This is my attempt to translate my PHP version to JS.

My (propably) currently running private server:

```
https://ic-server-js-unofficial-425171697594.us-central1.run.app/api/infinite-craft/pair?first={first}&second={second}&ref=app
```

## Setup Instructions

1. **Download Files**
   - Clone this repository

2. **Configure API Key and Database Credentials**
   - Set up enviroment variables.

   ```env
   # Postgress credentials
   PG_HOST=your_host
   PG_USER=your_user
   PG_PASSWORD=your_password
   PG_DATABASE=your_database
   PG_PORT=your_port

   # together.ai credentials
   API_KEY=your_api_key

   # Misc config
   PORT=3000
   ```

3. **Optional Configuration**
   - If needed, update the allowed hosts in `endpoints/pair.js`.

4. **Database Setup**
   - Before running the backend, execute the following SQL commands to set up the necessary tables in your pg database:

   ```sql
   CREATE TABLE results (
     id SERIAL PRIMARY KEY,
     first TEXT NOT NULL,
     second TEXT NOT NULL,
     result TEXT NOT NULL
   );
   
   CREATE TABLE emojis (
     id SERIAL PRIMARY KEY,
     item TEXT NOT NULL UNIQUE,
     emoji TEXT NOT NULL
   );
   ```

   - Then insert the following data into the `results` and `emojis` tables:

   ```sql
   INSERT INTO results (first, second, result) VALUES
   ('Water', 'Water', 'Lake'),
   ('Earth', 'Earth', 'Mountain'),
   ('Fire', 'Water', 'Steam'),
   ('Wind', 'Wind', 'Tornado'),
   ('Earth', 'Water', 'Plant');

   INSERT INTO emojis (item, emoji) VALUES
   ('Earth', '🌍'),
   ('Fire', '🔥'),
   ('Water', '💧'),
   ('Wind', '💨');
   ```

5. **Run the Backend**
   - After completing the setup, the backend should be ready to run.
   ```bash
   npm i
   npm start
   ```

## Troubleshooting

@activetutorial on Discord – DM me ~~or ask in the Discord server~~.
Also, if the emojis are off, that's because Neal doesn’t use together.ai for those. Nobody knows for sure what the prompt is.

## License

Read LICENSE (MIT)

