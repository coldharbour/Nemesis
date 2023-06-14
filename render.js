document.getElementById("startAppButton").addEventListener("click", () => {
  api.invoke('start-ssh-connection');
});

api.on('setup-message', (message) => {
  console.log('event fired!'); // step 1
  
  console.log('message:', message); // step 2
  console.log('element:', document.getElementById('setupMessage')); // step 3
  const setupMessageElement = document.getElementById('setupMessage');
  setupMessageElement.textContent = message;
});

api.on('log-message', (data) => {
  const logElement = document.createElement('div');
  logElement.classList.add('single-log');
  logElement.textContent = data;
  const displayLogs = document.getElementById('display-logs');
  displayLogs.appendChild(logElement);
  displayLogs.scrollTop = displayLogs.scrollHeight;
});

api.on('status-message', (data) => {
  const statusElement = document.createElement('div');
  statusElement.classList.add('single-status');
  statusElement.textContent = data;
  const displayStatus = document.getElementById('display-status');
  displayStatus.appendChild(statusElement);
  displayStatus.scrollTop = displayStatus.scrollHeight;
});


document.getElementById('targetInput').addEventListener('input', (event) => {
  const target = event.target.value;
  api.invoke('set-target', { target });
});


document.getElementById('hostInput').addEventListener('input', (event) => {
  const host = event.target.value;
  api.invoke('update-ssh-credentials', { host });
});

document.getElementById('userInput').addEventListener('input', (event) => {
  const user = event.target.value;
  api.invoke('update-ssh-credentials', { user });
});

document.getElementById('passwordInput').addEventListener('input', (event) => {
  const password = event.target.value;
  api.invoke('update-ssh-credentials', { password });
});

document.getElementById('apiKeyInput').addEventListener('input', (event) => {
  const apiKey = event.target.value;
  api.invoke('update-api-key', { apiKey });
});

document.getElementById('toggleButton').addEventListener('input', (event) => {
  let gptModel;
  
  if (event.target.checked) {
    gptModel = 'gpt-4';  // Checkbox is checked, use GPT-4
  } else {
    gptModel = 'gpt-3.5-turbo';  // Checkbox is not checked, use GPT-3.5 Turbo
  }

  api.invoke('update-gpt-model', { gptModel });
});

 // Initialize the variables with empty values

 
 document.getElementById('downloadButton').addEventListener('click', () => {
  api.invoke('download-file');
});
