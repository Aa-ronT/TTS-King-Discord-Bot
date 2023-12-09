const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Disconnects the bot from VC.'),
        async execute(interaction) {       
            if (!interaction.guild) {
                await interaction.reply("This command can only be used in a server.");
                return;
            }

             // Get the guild ID from the interaction
            const guildId = interaction.guildId;

            // Get the voice connection for the guild
            const connection = getVoiceConnection(guildId);

            if (connection) {
                // Disconnect the bot from the voice channel
                connection.destroy();

                // Send a confirmation message
                await interaction.reply('The bot has been disconnected from the voice channel.');
            } else {
                // Send a message if the bot is not connected to a voice channel
                await interaction.reply('The bot is not connected to any voice channel in this server.');
            }
        }
    }