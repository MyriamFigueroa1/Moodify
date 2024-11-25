
const openAI = require("openai");
require('dotenv').config();

const openai = new openAI.OpenAI({
    apiKey: process.env.OPENAI_KEY
});

module.exports = {
    chatGPT: async (consulta) => {
      try {
        // Realiza la consulta al modelo
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo", 
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: consulta }, 
          ],
        });
        console.log(completion.choices[0].message.content);
        return JSON.parse(completion.choices[0].message.content);
      } catch (error) {
        console.error("Error al llamar a la API:", error.message);
        throw error; 
      }
    },
};