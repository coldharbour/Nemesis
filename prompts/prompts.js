// evaluate command success and why it failed/ succeeded
grep = '\\"Keyword\\"'
function checkOutputPrompt(command, output, exitCode) {
    return "Given the command: " + command + " that was executed and its output in the terminal: " + output + 
    " with an exit code of: " + exitCode + " ,Does it seem like the command executed properly? You are only evalauting if the command was executed properly in a technial sense, so if the command is to search for something and there are 0 results for example, that does not mean the command itself failed.  Take into account a command like 'cd' would yield no terminal response if successful. Now please respond with a JSON object where 'success': is true or false (in lowercase) and 'reason' is your reasoning for the decision. Ensure reasoning explanation is technial and specific wrap the 'reason' value in double quotes but do NOT use double quotes anywhere else in the response, this is very important. If you want to highlight something like a variable use single qoutes only. In the 'reasoning' please include an evaluation of the output in addition to the reasoning behind the true or false. Like this example for a successful command{'success': true, 'reason': 'The output shows the command executed correctly'}";
}

// for memory management create a summary and keep updating it, maybe only add successful command summaries?

function summaryPrompt(command, output, task, previousSummary) {
    const summary1 = 'Please condense this information into a small but informtive summary about the current status of the linux task: ' + task + 'A command has been entered: ' + command + 'with the output being: ' + output + `combine this new summary with the previous summary: ${previousSummary} so we slowly create a summary of all events, if the previous summary is empty then just work with the information you have`
const summary2 = `Your role is to create or update an existing technical summary.
 If the existing technical summary is empty then simply create a  summary with the information given.

  I will first give you the existing summary then the information to update it with. Here is the summary: ${previousSummary}.
   Here is the information. task: ${task}. command executed: ${command}. output in terminal: ${output}.
    Only include the technical information, this is very important. The summary should only contain
    the technical information, all of it. do not leave any out. Keep it short by not using unnecessary words. Remove any duplicate information.`
    console.log(summary2)
    return summary2
}

// objective to complete given by the user
function objectivePrompt(target) {
   // create prompt for defensive scan i.e the system we are connected to
    const prompt1 = `Please conduct a full vulnrebility assessement on this IP address that belongs to you: ${target} 
        We want to improve the seurity of the system so we need to find every possible vulnrebility. It is very important the tasks 
        we create are ones a user could complete with only a NON interactive terminal in kali linux. This means we can use tools only in a non
        interactive way. 
        Remember to
         include the provided target IP address in your tasks.`
      const prompt2 = ` Using only a kali linux terminal you need to get root access to this machine: ${target}
      The tasks must be ones you could complete with a non interactive terminal. 
       You are root user. Remember the target is ${target} and use the target in your tasks. Use the exact target and not a placeholder` 

       const prompt3 = `Conduct a vulnrebility assessement on this IP address that belongs to you: ${target}.
       its is very important you understand all of this will be done using a NON interactive terminal/shell. This means only
       tasks than can be done in a non interactive way, meaning no user input. Remember we are not exploiting the system itself just looking for vulnrebilities.
       just running scans to gather information. Keep your tasks general and not specific as we handle that later. More of a general guideline. Include the target in your tasks.`
        const prompt4 = `Conduct a full vulnrebility assessement on this IP address that belongs to you: ${target}. You can ONLY use nmap with non interactive commands. 
        You should start with scans that gather information about the OS and service versions then move on to more advanced enumaration and vulnrebility script scans with nmap. 
        This means for the vuln scanning using nmaps powerful scripting engine to condut the vulnrebility scan which needs to be the final scan.
        The tasks 
        should not be overlly specific as the actual commands we run will depend on the information we gather along the way. Please mention 'using nmap' in the tasks. 
        We need to gather as much information as possible from the host using nmap. This needs to be a deep scan.`    
       return prompt4;
}


// initial prompt for set up. Consider multiple for drastically different objectives? e.g red team / blue team
function initialPrompt(objective) {
    let prompt = `You are Damocles, an AI that creates a list of tasks based on a given objective. Here is your 
    objective: ${objective} please format the response as a javascript array of JSON objects with task: (the task) 
     and a status with a default of false. Please ensure the tasks are more general and act as a guideline to the objective.  `
     console.log(prompt)
     console.log('-'.repeat(100));
    return prompt;
}

// due to limiations (or poor coding skills) a first step needed to be generated to create the data for the while loop. 
function getFirstStep(task, target,  firstTaskCheck,previousSummary) {
   //check firstTaskCheck
  const firstTaskPrompt = `Based on the task: ${task} please suggest a step in the process to completing the task. 
  Please make sure this step will be able to be carried out with a single bash command so do not suggest multiple steps. 
  If you ping include a maximum. Include the target '${target}' Make your step about the task and that you only use nmap.
  Do NOT write the output to a text file, grep ${grep} the important information directly instead! Grep for multiple keywords for effiecency.`
  const firstIterationPrompt = `Based on the task: ${task} please suggest a step in the process to completing the task. 
  Please make sure this step will be able to be carried out with a single bash command so do not suggest multiple steps. 
 Include the target '${target}' Take into account the previous tasks summary: ${previousSummary} to ensure 
  we are not repeating steps which is a waste of resources and time. Make your step about the task and that you only use nmap.
  Do NOT write the output to a text file, grep ${grep} the important information directly instead! Grep for multiple keywords for effiecency.
  Do NOT use placeholders, use information from the summary.`
  if (firstTaskCheck == true) {
    console.log(firstTaskPrompt)
    console.log('-'.repeat(100));
    return firstTaskPrompt
  } else {
    console.log(firstIterationPrompt)
    console.log('-'.repeat(100));
    return firstIterationPrompt
  }

}

// based off previous results/output/summary create then next command for working towards goal 
function getStepPrompt(task, summary, target) {
    const prompt1 = `We are working on this task: "${task}", Here is a summary of the progress so far: '${summary}', 
    Based on the summary what would you suggest we do next to work towards completing the task? Please provide a single step. 

    Do not suggest a task that is not relative to ${task}.  
    Remember this step needs to be able to be done in a kali linux terminal. 
     Include ${target} in your step, this is important. You have access to kali linux however only a non interactive terminal so ensure your step
     can be completed in a non interactive terminal. Some interative tools can be used non interactivly with arguements. This is okay. Keep everything on the command line. Do not use placeholders either.
      Use the information in the summary to provide a task relevant next step and make sure we are not double handling steps, use the data in the summary to work towards completing 
      the task one step at a time. Please do not use openvas`
      
      const prompt2 = `We are working on this task: "${task}", Here is a summary of the progress so far: '${summary}', 
      Based on the summary what would you suggest we do next to work towards completing the task? Please provide a single step. 
      Do not suggest a task that is not relative to ${task}.  
      Remember this step needs to be able to be completed with nmap. Please ensure you only suggest a single step. It must be able to be acheived with a single command.
       Include ${target} in your step, this is important. use the data in the summary to work towards completing 
        the task one step at a time. Consider the information in the summary, your step should be what we do next so please do not suggest anything that the summary already
        contains. This is a waste of time and resources. Remember the target is our only target. Do NOT use placeholders. 
        If the preious summary suggests the host is up do NOT perform a ping scan, get straight to the task.
         Do NOT write the output to a text file, grep ${grep} the important information directly instead! You can grep as many keywords as you need.
         Grep for multiple keywords for effiecency. Only NMAP commands. Do not use placeholders, use the information you have. Placeholders will cause an error.
         Remember we dont want to be repeating commands we have already. This means do not use the previous summaries commands. We need a new, better one.`;
         console.log(prompt2)
         console.log('-'.repeat(100));
    return prompt2

}

// if a command fails pass the releant information on to get a new command that *should* work
function getUpdatedStepPrompt(task, command, failReason) {
    
    let prompt = `the command for task: ${task} was unsuccessful.
    Here is the command: ${command} and the reason it failed: ${failReason} Please suggest a new step more aligned with the task. Remember the step
    needs to be for a non interactive terminal, doNOT USE PLACEHOLDERS this is very important. Use the information provided by the task.`
    console.log('failed command prompt:', prompt)
    return prompt
}

// based off the step generated from the task a single bash command is created, to be executed through ssh
function getBashCommand(step) {
    let prompt =`Given the step: "${step}", please provide a single bash command to execute it. do not use sudo as user is root.
    Do not include backticks or give any context. Simply repsond with a bash command using the step, Do NOT use placeholders.`
    console.log(prompt)
    console.log('-'.repeat(100));
    return prompt;
}

function evaluationPrompt(task, summary) {
    let prompt =  `We are working on a task and I need you to decide if the task is complete based on the summary of information. 
    All you need to do is consider the objective of the task, and evalaute the summary to decide if the task is complete.
    It is crucial you consider the task and the provided information to determine if the task is completed to its best. If you think even a tiny bit of extra
    information would be useful you should absolutely consider the task incomplete. This includes
    scenarios where the task cannot be completed which in this case, we move on and respond with true. 
    Here is the task: ${task}. and here is the summary: ${summary}
      After analysis you simply respond with true or false 
       If you deem the task completed respond with true, otherwise respond with false 
       Do not provide any context or reasoning simply the boolean value. 
       it is important you understand that I require a boolean value as your answer so either true or false on its own lowercase
        respond with true or false without any context or punctuation.`
        console.log(prompt)
        console.log('-'.repeat(100));
    return prompt
}

function updateTask(task, summary) {
    let prompt1 = `This is the task we have: ${task}. Here is a summary of the previously completed task: ${summary}.
     Please update the current task to use information from the previous one so we avoid repeating things.
      Remember you are updating, not replacing!`
      console.log(prompt1)
      console.log('-'.repeat(100));
    return prompt1
}

function writeReport(report) {
    let prompt = `I need you to write me a comprehensive report on the outcome of this vulnrebility assessment. Be technical and specific. 
    It is very important you are technical and specific. Based on the system configuration please talk about any CVEs you think apply.
    First talk about the report itself and the target and its configuration, It is very important you desribe the process of events from the summary. 
    Discuss what happened and then talk about these topics in this order: Found vulnrebilities, The severity of the vulnrebilities,
    The potential impact and finally your reccomendations / mitigations. Include ALL information in this report as the output is no 
    longer accessable. If there is nothing in the vulnrebility report make a judegment based off your information on the CVEs the the found
    services will be vulnreable to. Here is the raw data: ${report}`
    console.log(prompt)
    console.log('-'.repeat(100));
    return prompt
}

module.exports = {
    checkOutputPrompt,
    summaryPrompt,
    objectivePrompt,
    initialPrompt,
    getFirstStep,
    getStepPrompt,
    getUpdatedStepPrompt,
    getBashCommand,
    evaluationPrompt,
    updateTask,
    writeReport
} 
