const { Configuration, OpenAIApi } = require("openai");
const Spinner = require('cli-spinner').Spinner;

async function getTasks(prompt,model, apiKey) {

    const configuration = new Configuration({ apiKey: apiKey });
    const openai = new OpenAIApi(configuration);
    console.log(' ')
    const messages = [{ "role": "user", "content": prompt }];
    let response;

    // start the spinner
    const spinner = new Spinner('Generating List of tasks.... %s');
    spinner.setSpinnerString('|/-\\');
    spinner.setSpinnerDelay(200);  // increase delay 

    while(true) {  // This loop will keep running indefinitely
        try {
            spinner.start();

            response = await openai.createChatCompletion({
                model: model,
                messages: messages,
                temperature: 0
            });

            // stop the spinner
            spinner.stop(true);
           

            return JSON.parse(response["data"]["choices"][0]["message"]["content"].trim());

        } catch (error) {
            console.error(`Error on API call, retrying...`, error);

            // stop the spinner
            spinner.stop(true);
      
            // Implement a delay before the next retry
            await new Promise(res => setTimeout(res, 1000));  
        }
    }
}

module.exports = getTasks;
