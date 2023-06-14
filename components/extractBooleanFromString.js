function extractBooleanFromString(str) {
    const lowercaseString = str.toLowerCase();
    const trueIndex = lowercaseString.indexOf('true');
    const falseIndex = lowercaseString.indexOf('false');
  
    if (trueIndex !== -1) {
      return 'true';
    } else if (falseIndex !== -1) {
      return 'false';
    } else {
      throw new Error('The input string does not contain "true" or "false".');
    }
  }
  
module.exports = extractBooleanFromString;

  