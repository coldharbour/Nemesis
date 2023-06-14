SETUP:

Ensure remote kali machine has SSH setup with root enabled, currently the application cannot handle interative terminals and therefore cannot enter a password for sudo requiring root as a bypass. 

If GPT4 is ticked make sure you hae acess to the GPT4 API.

If 'Setup failed' is error message, one or more inputs were missing or incorrect

If 'SSH Failed' is error message please check/ restart the kali machine. Often ending the connect abruptly requeires an SSH service restart on the Kali machine. 

Virtual Machines are recommended, Obviously do not use against machines/networks you do not own or have permission to test. Likewise it is not recommended to test against production/ commerical systems as this is a POC only and root access is enabled. 

This is a Node.js application with a UI built in Electron. 

The information in the generated report may not be 100% accurate. 

Currently not very responsive so toolbar might be janky on laptop

GPT4 is far superior to GPT3.5-turbo which tends to make stuff up more. 

Needs functionality to adjust token checker for different models currently set as 3.5-tubro.

Currently there is a slim chance the main summary exceeds token limits, grep midigates this usually but not 100%.
