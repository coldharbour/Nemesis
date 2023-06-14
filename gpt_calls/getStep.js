require('dotenv').config();
const prompts = require('../prompts/prompts');
const { Configuration, OpenAIApi } = require("openai");

async function getStep(task, summary, command, failReason, isCommandSuccessful, target,model, apiKey) {
  const configuration = new Configuration({ apiKey: apiKey });
  const openai = new OpenAIApi(configuration);
  let response;

  if (!isCommandSuccessful) {
    //intial command failed
    const newPrompt = prompts.getUpdatedStepPrompt(task, command, failReason);

    while(true) {  // This loop will keep running indefinitely
      try {
        response = await openai.createChatCompletion({
          model: model,
          messages: [{ "role": "user", "content": newPrompt }],
          temperature: 0
        });

        return response["data"]["choices"][0]["message"]["content"].trim();

      } catch (error) {
        console.error(`Error on API call, retrying...`, error);

        // Implement a delay before the next retry
        await new Promise(res => setTimeout(res, 1000));  
      }
    }
  }

  const prompt = prompts.getStepPrompt(task, summary, target);
  const messages = [{ "role": "user", "content": prompt }];

  while(true) {  // This loop will keep running indefinitely
    try {
      response = await openai.createChatCompletion({
        model: model,
        messages: messages,
        temperature: 0
      });

      return response["data"]["choices"][0]["message"]["content"].trim();

    } catch (error) {
      console.error(`Error on API call, retrying...`, error);
      

      // Implement a delay before the next retry
      await new Promise(res => setTimeout(res, 1000));  
    }
  }
}

module.exports = getStep;
