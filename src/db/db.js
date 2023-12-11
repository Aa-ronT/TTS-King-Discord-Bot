const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Resolving the path to the SQLite database file.
const dbPath = path.resolve(__dirname, 'ttsbot.db');

// Creating a new SQLite database connection.
let db = new sqlite3.Database(dbPath, (err) => {
    // Error handling for database connection.
    if (err) {
        console.error(err.message);
        throw err; // Throwing an error if connection fails.
    } else {
        // Logging a message on successful database connection.
        console.log('Connected to the SQLite database.');
        // Creating a new table for channel association if it does not already exist.
        db.run(`CREATE TABLE IF NOT EXISTS channel_association (
            guild_id TEXT PRIMARY KEY, // Primary key for the guild.
            voice_channel_id TEXT, // ID of the associated voice channel.
            user_id TEXT // ID of the associated user.
        )`, (err) => {
            if (err) {
                throw err
            } else {
                throw new Error('Db could not create table')
            }
        });

        // Creating a new table for user voice options if it does not already exist.
        db.run(`CREATE TABLE IF NOT EXISTS user_voice (
            user_id TEXT PRIMARY KEY, // Primary key for the user.
            voice_option INTEGER // Integer representing the user's chosen voice option.
        )`, (err) => {
            if (err) {
                throw err
            } else {
                throw new Error('Db could not create table')
            }
        });
    }
});

module.exports = db;
