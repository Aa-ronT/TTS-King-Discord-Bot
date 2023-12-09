const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// Function to push commands to the Discord API
function pushCommands(client, clientId, guildId, token) {
    // Setting up the path to the commands folder
    const commandsPath = path.join(__dirname, 'commands');

    // Reading all command files from the commands directory
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    // Looping through each command file and setting them in the client
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        client.commands.set(command.data.name, command);
    }

    // Creating a new REST client for Discord API interactions
    const rest = new REST({ version: '9' }).setToken(token);

    // Immediately-invoked function to register commands
    (async () => {
        try {
            console.log('Started refreshing application (/) commands.');
            
            // Registering commands to a specific guild
            // Note: To register commands globally (for all guilds), replace the Routes.applicationGuildCommands
            // with Routes.applicationCommands and remove guildId
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: Array.from(client.commands.values()).map(command => command.data.toJSON()) }
            );
            
            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error('Error refreshing application (/) commands:', error);
        }
    })();
}

module.exports = { pushCommands }
