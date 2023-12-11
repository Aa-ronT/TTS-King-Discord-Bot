const db = require('./db');

// Function to add or update a channel association in the database
const addChannelAssociation = (guildId, voiceChannelId, userId) => {
    // Prepare an SQL statement for inserting or replacing a channel association
    const stmt = db.prepare('INSERT OR REPLACE INTO channel_association (guild_id, voice_channel_id, user_id) VALUES (?, ?, ?)');   
    stmt.run(guildId, voiceChannelId, userId);
    stmt.finalize();
};

// Function to retrieve a channel association from the database
const getChannelAssociation = (guildId) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM channel_association WHERE guild_id = ?', [guildId], (err, row) => {
            if (err) {
                reject(err); 
            } else {
                resolve(row); 
            }
        });
    });
};

// Function to update the voice channel ID of an existing channel association
const updateVoiceChannelId = (guildId, newVoiceChannelId) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('UPDATE channel_association SET voice_channel_id = ? WHERE guild_id = ?');
        stmt.run(newVoiceChannelId, guildId, function(err) {
            if (err) {
                reject(err); 
            } else {
                resolve(this.changes); 
            }
        });
        stmt.finalize();
    });
};

// Function to remove a channel association from the database
const removeChannelAssociation = (guildId) => {
    const stmt = db.prepare('DELETE FROM channel_association WHERE guild_id = ?');
    stmt.run(guildId);
    stmt.finalize();
};

// Function to set the voice option for a user
const setUserVoiceOption = (userId, voiceOption) => {
    const stmt = db.prepare('INSERT OR REPLACE INTO user_voice (user_id, voice_option) VALUES (?, ?)');
    stmt.run(userId, voiceOption);
    stmt.finalize();
};

// Function to retrieve a user's voice option from the database
const getUserVoiceOption = (userId) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT voice_option FROM user_voice WHERE user_id = ?', [userId], (err, row) => {
            if (err) {
                reject(err); 
            } else {
                resolve(row); 
            }
        });
    });
};

module.exports = {
    addChannelAssociation,
    getChannelAssociation,
    updateVoiceChannelId,
    removeChannelAssociation,
    setUserVoiceOption,
    getUserVoiceOption
};
