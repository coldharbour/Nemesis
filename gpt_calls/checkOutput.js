const { Configuration, OpenAIApi } = require("openai");

const prompts = require('../prompts/prompts');

async function checkOutput(command, output, exitCode,model, apiKey) {
  const configuration = new Configuration({ apiKey: apiKey });
const openai = new OpenAIApi(configuration);
  const prompt = prompts.checkOutputPrompt(command, output, exitCode);
  const messages = [{ "role": "user", "content": prompt }];

  while(true) {  // This loop will keep running indefinitely
    try {
      const response = await openai.createChatCompletion({
        model: model,
        messages: messages,
        temperature: 0.2
      });

      return response["data"]["choices"][0]["message"]["content"].trim();

    } catch (error) {
      console.error(`Error on API call, retrying...`, error);

      // Implement a delay before the next retry
      await new Promise(res => setTimeout(res, 1000));  
    }
  }
}

module.exports = checkOutput;
