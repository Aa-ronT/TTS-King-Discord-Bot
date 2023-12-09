const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');
const { addChannelAssociation, getUserVoiceOption, updateVoiceChannelId } = require('../db/dbHelpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tts')
        .setDescription('Translates text to speech in the channel the command is typed.'),
    async execute(interaction) {
        // Ensure the command is used in a server context
        if (!interaction.guild) {
            await interaction.reply("This command can only be used in a server.");
            return;
        }

        // Ensure the user is in a voice channel
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply("You must be in a voice channel to use this command.");
            return;
        }

        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        // Attempt to retrieve the user's voice settings
        let voiceOptions;
        try {
            voiceOptions = await getUserVoiceOption(userId) || 1;
        } catch {
            await interaction.reply("Unable to get the user's voice settings");
            return;
        }

        // Get the existing voice connection for the guild
        let connection = getVoiceConnection(guildId);

        // If a connection exists but is in a different channel, destroy it
        if (connection && connection.joinConfig.channelId !== voiceChannel.id) {
            connection.destroy();
            connection = null;
        }
        
        // If there is no connection, create a new one
        if (!connection) {
            connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guildId,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            // Attach event listeners to the new connection
            await applyConnectionListeners(connection, guildId);

            // Notify the user that the bot is joining the channel
            await interaction.reply(`Joining ${voiceChannel}`);
        } else {
            // Notify the user that the bot is already in the channel
            await interaction.reply(`Bot is now speaking on behalf of <@${interaction.user.id}>`);
        }

        // Update the channel association in the database
        addChannelAssociation(guildId, voiceChannel.id, userId);
    }
};

async function applyConnectionListeners(connection, guildId) {
    // Remove any existing listeners to avoid duplicate handlers
    connection.removeAllListeners();

    // Listener for when the connection is ready
    connection.on(VoiceConnectionStatus.Ready, () => {
        setTimeout(() => {
            updateVoiceChannelId(guildId, connection.joinConfig.channelId);
        }, 1000);
    });

    // Listener for when the connection gets disconnected
    connection.on(VoiceConnectionStatus.Disconnected, () => {
        setTimeout(() => {
            if (connection.state.status === VoiceConnectionStatus.Disconnected) {
                connection.destroy();
            }
        }, 1000);
    });

    // Listener for when the connection is destroyed
    connection.on(VoiceConnectionStatus.Destroyed, () => {
        connection.removeAllListeners();
    });
}