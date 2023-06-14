function fixJsonString(jsonString) {
    // Find the start and end indices of the reason field
    let start = jsonString.indexOf('"reason": "') + 11;
    let end = jsonString.length - 2;
  
    // Extract the reason field, excluding the wrapping double quotes
    let reason = jsonString.substring(start, end);

    // Replace the internal double quotes in the reason field with single quotes
    let fixedReason = reason.replace(/"/g, "'");
  
    // Replace the reason field in the original JSON string
    let fixedString = jsonString.substring(0, start) + fixedReason + jsonString.substring(end);
  
    // Parse the fixed string as JSON and return the resulting object
    return JSON.parse(fixedString);
  }
  
  module.exports = fixJsonString;