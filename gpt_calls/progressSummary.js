

const prompts = require('../prompts/prompts');
const { Configuration, OpenAIApi } = require("openai");

async function progressSummary(command, output, task, previousSummary,model, apiKey){
  const configuration = new Configuration({ apiKey: apiKey });
  const openai = new OpenAIApi(configuration);
  let summaryPrompt = prompts.summaryPrompt(command, output, task, previousSummary);

  while(true) {  // This loop will keep running indefinitely
    try {
      const getSummary = await openai.createChatCompletion({
        model: model,
        messages: [{ "role": "user", "content": summaryPrompt }],
        temperature: 0
      });

      let summary = getSummary["data"]["choices"][0]["message"]["content"].trim();
      return summary;

    } catch (error) {
      console.error(`Error on API call, retrying...`, error);
      
      // Implement a delay before the next retry
      await new Promise(res => setTimeout(res, 1000));  
    }
  }
}

module.exports = progressSummary;
