const { Configuration, OpenAIApi } = require("openai");
const prompts = require('../prompts/prompts');

async function updateTask(task, summary,model, apiKey) {
    const configuration = new Configuration({ apiKey: apiKey });
    const openai = new OpenAIApi(configuration);
    const updateTaskPrompt = prompts.updateTask(task, summary);

    while(true) {  // This loop will keep running indefinitely
        try {
            const updateTask = await openai.createChatCompletion({
                model: model,
                messages: [{ "role": "user", "content": updateTaskPrompt }],
                temperature: 0
            });

            return updateTask["data"]["choices"][0]["message"]["content"].trim();

        } catch (error) {
            console.error(`Error on API call, retrying...`, error);
      
            // Implement a delay before the next retry
            await new Promise(res => setTimeout(res, 1000));  
        }
    }
} 

module.exports = updateTask;
