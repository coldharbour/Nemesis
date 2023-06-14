function shortOutput(output) {
    const lines = output.split('\n');
    if (lines.length > 10) {
      const firstLines = lines.slice(0, 5);
      const lastLines = lines.slice(-5);
      return firstLines.concat(['...'], lastLines).join('\n');
    } else {
      return output;
    }
  }
  

module.exports = shortOutput;
