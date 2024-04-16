const axios = require("axios");
const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");

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

const imageBuffer = async (url) => {
    const result = await axios({
        method: 'get',
        url: url,
        responseType: 'stream'
    });

    return result.data;
}

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

      const stream = await imageBuffer(result.url);
      const file = new AttachmentBuilder(stream);

      await interaction.editReply({ content: `Original prompt: \`${prompt}\`\nRevised prompt: \`${result.revised_prompt}\``, files: [file] });
    }
  },
};
