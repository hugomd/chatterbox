const axios = require("axios");
const { SlashCommandBuilder } = require("discord.js");

const generate = async (input) => {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: input,
        },
      ],
      max_tokens: 256,
      temperature: 1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data.choices[0].message.content;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chat")
    .setDescription("Forwards prompts to ChatGPT")
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("The input to send to ChatGPT")
        .setRequired(true),
    ),
  async execute(interaction) {
    const prompt = await interaction.options.getString("input");
    if (!prompt || prompt === "") {
      // Question is empty.
      interaction.reply({ content: "Input cannot be empty", ephemeral: true });
    } else {
      await interaction.deferReply();
      const result = await generate(prompt);
      await interaction.editReply(
        `Prompt: \`${prompt}\`\n\nResponse: ${result}`,
      );
    }
  },
};
