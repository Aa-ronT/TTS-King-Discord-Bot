const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { pushCommands } = require('./commands');
const { getChannelAssociation, setUserVoiceOption } = require('./db/dbHelpers');
const { getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const { generateAudio } = require('./ttsGenerator');
const { Readable } = require('stream');
require('dotenv').config(); // Load environment variables

// Retrieving environment variables
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;
const token = process.env.DISCORD_BOT_TOKEN;

// Initialize Discord client with all gateway intents
const client = new Client({
    intents: Object.keys(GatewayIntentBits).map((a) => {
        return GatewayIntentBits[a];
    }),
});

// Initialize a new collection for commands
client.commands = new Collection();

// Load commands into the client
pushCommands(client, clientId, guildId, token);

// Event listener for when the bot is ready
client.once('ready', () => {
    console.log('Bot is ready!');
});

// Event listener for interactions (commands and select menus)
client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        await handleCommandInteraction(interaction);
    } else if (interaction.isSelectMenu()) {
        await handleSelectMenuInteraction(interaction);
    }
});

// Event listener for new messages
client.on('messageCreate', async message => {
    await handleMessageCreate(message);
});

// Log in the client using the bot token
client.login(token);

// Function to handle command interactions
async function handleCommandInteraction(interaction) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
    }
}

// Function to handle select menu interactions
async function handleSelectMenuInteraction(interaction) {
    if (interaction.customId === 'settings') {
        const selectedValue = interaction.values[0];
        setUserVoiceOption(interaction.user.id, parseInt(selectedValue, 10));
        await interaction.deferUpdate(); // Acknowledge the interaction without sending a message
    }
}

// Function to handle message creation
async function handleMessageCreate(message) {
    try {
        const channelAssociation = await getChannelAssociation(message.guild.id);
        if (!channelAssociation || channelAssociation['voice_channel_id'] !== message.channelId || channelAssociation['user_id'] !== message.author.id) return;

        const audioData = await generateAudio(message.author.id, message.content);
        await playAudioInVoiceChannel(message.guildId, audioData);
    } catch (err) {
        console.error('Error:', err);
    }
}

// Function to play audio in a voice channel
async function playAudioInVoiceChannel(guildId, audioData) {
    const connection = getVoiceConnection(guildId);
    if (!connection) {
        console.log('Bot is not connected to any voice channel in this guild.');
        return;
    }

    const audioStream = Readable.from(audioData);
    const resource = createAudioResource(audioStream, { inputType: StreamType.Arbitrary });
    const player = createAudioPlayer();
    player.play(resource);
    connection.subscribe(player); // Subscribe the connection to the audio player
}