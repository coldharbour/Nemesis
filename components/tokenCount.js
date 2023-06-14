const { Tiktoken } = require("@dqbd/tiktoken/lite");
const { load } = require("@dqbd/tiktoken/load");
const registry = require("@dqbd/tiktoken/registry.json");
const models = require("@dqbd/tiktoken/model_to_encoding.json");

// Importing model name from the config file
let model = null;

async function initializeModel(modelName) {
    if(!model) {
        model = await load(registry[models[modelName]]);
    }
}

async function countTokens(text, modelName) {
    if(!model) {
        await initializeModel(modelName);
    }
    
    const encoder = new Tiktoken(
        model.bpe_ranks,
        model.special_tokens,
        model.pat_str
    );
    const tokens = encoder.encode(text);
    encoder.free();
    return tokens.length;
}

module.exports = countTokens