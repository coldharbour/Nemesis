const prompts = require('../prompts/prompts');
const { Configuration, OpenAIApi } = require("openai");


async function evaluateSummary(task, summary,model, apiKey) {
  const configuration = new Configuration({ apiKey: apiKey });
  const openai = new OpenAIApi(configuration);
  const evaluationPrompt = prompts.evaluationPrompt(task, summary);

  while(true) {  // This loop will keep running indefinitely
    try {
      const isTaskComplete = await openai.createChatCompletion({
        model: model,
        messages: [{ "role": "user", "content": evaluationPrompt }],
        temperature: 0
      });

      // need to strip away anything thats not a boolean
      return isTaskComplete["data"]["choices"][0]["message"]["content"].trim();

    } catch (error) {
      console.error(`Error on API call, retrying...`, error);

      // Implement a delay before the next retry
      await new Promise(res => setTimeout(res, 1000));  
    }
  }

  // check summary against objective and decide if more information is needed. If task is completed, move to next loop
}

module.exports = evaluateSummary;
