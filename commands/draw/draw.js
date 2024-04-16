const axios = require("axios");
const { SlashCommandBuilder } = require("discord.js");

const draw = async (input) => {
  const response = await axios.post(
    "https://api.openai.com/v1/images/generations",
    {
      model: "dall-e-3",
      prompt: input,
      n: 1,
      size: "1024x1024",
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data.data[0];
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("draw")
    .setDescription("Draws something based on the prompt")
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("The input to draw")
        .setRequired(true),
    ),
  async execute(interaction) {
    const prompt = await interaction.options.getString("input");
    if (!prompt || prompt === "") {
      // Prompt is empty.
      interaction.reply({ content: "Input cannot be empty", ephemeral: true });
    } else {
      await interaction.deferReply();

      const result = await draw(prompt);

      const embed = {
        title: prompt,
        description: result.revised_prompt,
        image: {
          url: result.url,
        },
      };

      await interaction.editReply({ embeds: [embed] });
    }
  },
};
