const { Configuration, OpenAIApi } = require("openai");

const prompts = require('../prompts/prompts');

async function getFirstStep(task, target, firstTaskCheck, previousSummary, model, apiKey) {
    const configuration = new Configuration({ apiKey: apiKey });
const openai = new OpenAIApi(configuration);
    const firstStepPrompt = prompts.getFirstStep(task, target, firstTaskCheck, previousSummary);

    while(true) {  // This loop will keep running indefinitely
        try {
            const firstStep = await openai.createChatCompletion({
                model: model,
                messages: [{ "role": "user", "content": firstStepPrompt }],
                temperature: 0
            });

            return firstStep["data"]["choices"][0]["message"]["content"].trim();

        } catch (error) {
            console.error(`Error on API call, retrying...`, error);
      
            // Implement a delay before the next retry
            await new Promise(res => setTimeout(res, 1000));  
        }
    }
} 

module.exports = getFirstStep;
