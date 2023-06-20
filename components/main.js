const fs = require('fs');
const path = require('path');

const prompts = require('../prompts/prompts')
const getStep = require('../gpt_calls/getStep')                                                     
const executeCommand = require('./executeCommand') 
const getTasks = require('../gpt_calls/getTasks')              
const progressSummary = require('../gpt_calls/progressSummary')
const checkOutput = require('../gpt_calls/checkOutput')
const getBashCommand = require('../gpt_calls/getBashCommand')
const evalauteSummary = require('../gpt_calls/evaluateSummary')
const getFirstStep = require('../gpt_calls/getFirstStep')
const fixJsonString = require('./fixJsonForOutputCheck')
const writeToLog = require('./handleLogs')
const writeToStatus = require('./handleStatus')
const extractBooleanFromString = require('./extractBooleanFromString')
const updateTask = require('../gpt_calls/updateTask')
const shortOutput = require('./shortOutput')
const countTokens = require('./tokenCount')
const generateReport = require('../gpt_calls/generateReport')



let finalSummary = []


let previousSummary = "";
// Define your objective and initial prompt

async function main(conn, window, target,gptModel, apiKey) {
  writeToStatus('Generating List of tasks....', window)
  let model = gptModel

  const objective = prompts.objectivePrompt(target)
const prompt = prompts.initialPrompt(objective)
    let tasks = await getTasks(prompt,model, apiKey);
    //generate a task list based off the objective

   
    writeToStatus('Task list: ', window)

    for (let i = 0; i < tasks.length; i++) {
      let task = `Task ${i + 1}. ${tasks[i].task}`
      
      writeToStatus(task, window)
    }
    

    


    let firstIteration = true;

    for (let i = 0; i < tasks.length;) {
        if (i > 0) {
    

          // ensuring not first iteration
        
          let task =  await updateTask(tasks[i].task, previousSummary,model, apiKey)
      
          //update old task with new new task containing relevant information
          
          tasks[i].task = task
        }
        let isCommandSuccessful = false
        let nextTask = false

    writeToStatus(`Working on task: ${i+1}/${tasks.length}: ${JSON.stringify(tasks[i].task  ,null, 2)}`, window)
    
  
    let command 
    let output
    let outcomeReason
      



      
      while (!isCommandSuccessful || !nextTask) {
        // use previous task summary to assist in the steps for the new tasks?
        // maybe update the task based off preious task summary
        let step 
     
        // need to handle first iteration but for task > 1
        let firstTaskCheck
        if (i == 0) {
          if (firstIteration) {
            firstTaskCheck = true;
            step = await getFirstStep(tasks[i].task, target,firstTaskCheck,previousSummary,model, apiKey)
            // if task[i] > 1 then not on first task, give getFirstStep previous task summary
            
        } else {
            
          step = await getStep(tasks[i].task, previousSummary, target,model, apiKey)
   
        }
          // firstTaskCheck = true 
     
        } else {
          if (firstIteration) {
            firstTaskCheck = false
            step = await getFirstStep(tasks[i].task, target, firstTaskCheck,previousSummary,model, apiKey)
            
            // if task[i] > 1 then not on first task, give getFirstStep previous task summary
            
        } else {
            
          step = await getStep(tasks[i].task, previousSummary,command,outcomeReason,isCommandSuccessful, target,model, apiKey)
          // console.log(`summary in get step: ${previousSummary}`)
        }
          // firstTaskCheck = false
      
        }

          


        

       

    
       
      
        currentStep = step
     
        writeToStatus(`Working on subtask: ${JSON.stringify(step ,null, 2)}`,window )
    
        // function generate command from first task (agent)
        command = await getBashCommand(step,model, apiKey)
        writeToLog(`Executing command: ${JSON.stringify(command ,null, 2)}` ,window)
    
        // function to execute command
      
        output = await executeCommand(conn ,command)

        // If too many tokens remove some of the output
      
      let serverResponse = output.serverResponse
      let outputTokens = await countTokens(serverResponse, model)
      if (outputTokens > 3950) {
        serverResponse = await shortOutput(output.serverResponse)
        outputTokens = await countTokens(serverResponse)
        let tokensBeforeStrip = await shortOutput(output.serverResponse)
        tokensBeforeStrip = await countTokens(tokensBeforeStrip)
        // writeToLog(`Log ID 4: Token count for stripped output: ${outputTokens} Token count before strip: ${tokensBeforeStrip}`,window)
      } else {
        // writeToLog(`Log ID 4: Token count for output: ${outputTokens}`,window)
      }

        
    
        writeToLog(`Output: ${JSON.stringify(serverResponse ,null, 2)}`,window)
    
        
       
        
    
        






        // function to evaluate the commands success (agent)
        let commandStatus = await checkOutput(command, serverResponse, output.exitCode ,model, apiKey)
        // let commandStatus = await checkOutput(command, output.serverResponse, output.exitCode)
        commandStatus = commandStatus.replace(/'/g, '"');
        let commandStatusParsed = fixJsonString(commandStatus)

        // commandStatus = JSON.parse(commandStatus);
        commandStatus = commandStatusParsed



        isCommandSuccessful = commandStatus.success
        writeToLog(`Command success: ${JSON.stringify(isCommandSuccessful ,null, 2)}`,window)
     
        outcomeReason = commandStatus.reason
        writeToLog(`Reasoning for command status: ${JSON.stringify(outcomeReason ,null, 2)}`,window)
     
    
        if (commandStatus.success) {
          isCommandSuccessful = true
          previousSummary = await progressSummary( command, serverResponse,  tasks[i].task, previousSummary,model, apiKey)
          writeToStatus(`Summary of tasks: ${JSON.stringify(previousSummary ,null, 2)}`,window)
          
          let evaluation = await evalauteSummary(tasks[i].task, previousSummary,model, apiKey)

          // evaluation output not always valid boolean so we convert it 
          evaluation = extractBooleanFromString(evaluation);
          evaluation = JSON.parse(evaluation)
          if (evaluation) {
           nextTask = true; //set to false/ comment if more testing is needed
          
          //push task summary to object array where [{task: currentTask, summary: taskSummary}] to be used later to generate report
          finalSummary.push({task: tasks[i].task, summary: previousSummary})
          i++
          firstIteration = true
          writeToStatus(`Task is completed: ${evaluation}`,window)
       
          } else {
            firstIteration = false
            writeToStatus(`Task is completed: ${evaluation}`,window)
          }
          // if true next loop, if false loop continues, push summary to txt file or var for final report later 
         
     
   
       } else {
        isCommandSuccessful = false
        firstIteration = false
        writeToLog('command failed to execute. Summary will not be updated.',window)
        writeToLog('Regenerating failed command ...', window)
   
       }
       
   


      // function to evaluate summary to check if task is completed (agent)

    }
  
  
    // handle the last iteration where i will be out of range
    if (tasks[i]) {
      tasks[i].status = true
  }
  
  
  
    }
    writeToStatus('Objective completed', window)
    writeToStatus('Generating final summary and report...', window)
    const report = await generateReport(finalSummary,model, apiKey)
    writeToStatus(`Final summary: ${JSON.stringify(finalSummary ,null, 2)}`, window)
    writeToStatus(report, window)
    let lines = report.split('\n');
    let formattedReport = '';
    for(let i = 0; i < lines.length; i++){
        let line = lines[i];
        while(line.length > 200) {
            let pos = line.lastIndexOf(' ', 200);
            formattedReport += line.substring(0, pos) + '\n';
            line = line.substring(pos + 1);
        }
        formattedReport += line + '\n';
    }
    
    let reportPath = path.join(__dirname, '..', 'report.txt');
    fs.writeFile(reportPath, formattedReport, (err) => {
        if(err) {
            return console.log(err);
        }
    
        console.log("The report was saved to report.txt");
    });
  }

  module.exports = main

//   let reportPath = path.join(__dirname, '..', 'report.txt');
//   fs.writeFile(reportPath, report, (err) => {
//     if(err) {
//         return console.log(err);
//     }

//     console.log("The report was saved to report.txt");
// }); 
  // prevent placeholders

  // incomplete tasks being deemed complete

  // issues with vuln scans and grep commands

  



  // when stripping output max important data we can take

  // get step prompt needs more context, maybe provide list of all successful commands already run



  // refine prompts for better steps

  // create variable for gpt model for easy update, figure out what functions need what model





  // empathise need terminal only commands e.g no nano use touch? or whatever

  // figure out if need to switch to interactive shell (if it even works) for certain commands
