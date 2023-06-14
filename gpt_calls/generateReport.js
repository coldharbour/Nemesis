const { Configuration, OpenAIApi } = require("openai");
const prompts = require('../prompts/prompts');

async function generateReport(summary ,model, apiKey) {
  const configuration = new Configuration({ apiKey: apiKey });
  const openai = new OpenAIApi(configuration);
  summary = JSON.stringify(summary);
  const reportPrompt = prompts.writeReport(summary);

  while(true) {  // This loop will keep running indefinitely
    try {
      const generateReport = await openai.createChatCompletion({
        model: model,
        messages: [{ "role": "user", "content": reportPrompt }],
        temperature: 0
      });

      return generateReport["data"]["choices"][0]["message"]["content"].trim();

    } catch (error) {
      console.error(`Error on API call, retrying...`, error);

      // Implement a delay before the next retry
      await new Promise(res => setTimeout(res, 1000));  
    }
  }
}

module.exports = generateReport;
