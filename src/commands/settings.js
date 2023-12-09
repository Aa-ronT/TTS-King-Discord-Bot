const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
    // Setting up the slash command using SlashCommandBuilder
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Provides a settings menu for the user.'),
    async execute(interaction) {
        // Ensure the command is used in a server context
        if (!interaction.guild) {
            await interaction.reply("This command can only be used in a server.");
            return;
        }

        // Create a select menu for voice settings
        const select = new StringSelectMenuBuilder()
            .setCustomId('settings') // Set a custom ID for identifying the select menu interaction
            .setPlaceholder(`Choose a voice ${interaction.user.username}`) // Set a placeholder text showing the user's name
            // Adding options to the select menu, each representing a different voice type
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Alloy')
                    .setDescription('The Alloy voice type.')
                    .setValue('1'), // Setting a value that will be used to identify the selection
                new StringSelectMenuOptionBuilder()
                    .setLabel('Echo')
                    .setDescription('The Echo voice type.')
                    .setValue('2'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Fable')
                    .setDescription('The Fable voice type.')
                    .setValue('3'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Onyx')
                    .setDescription('The Onyx voice type.')
                    .setValue('4'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Nova')
                    .setDescription('The Nova voice type.')
                    .setValue('5'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Shimmer')
                    .setDescription('The Shimmer voice type.')
                    .setValue('6')
            );

        // Wrapping the select menu in an action row
        const row = new ActionRowBuilder()
            .addComponents(select);

        // Sending the reply with the action row (which includes the select menu)
        await interaction.reply({
            components: [row]
        });
    }
}
