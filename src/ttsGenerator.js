const https = require('https')
const { getUserVoiceOption } = require('./db/dbHelpers');
require('dotenv').config()

// Retrieve the OpenAI API key from environment variables
const openai_api_key = process.env.OPENAI_API_KEY

// Setup the HTTP request options for the OpenAI API
const options = {
  hostname: 'api.openai.com',
  path: '/v1/audio/speech',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + openai_api_key,
    'Content-Type': 'application/json'
  }
};

// Define a mapping of voice options to voice types
const voiceTypes = {
    1: "alloy",
    2: "echo",
    3: "fable",
    4: "onyx",
    5: "nova",
    6: "shimmer"
};

// Function to generate audio from text using OpenAI's API
async function generateAudio(userId, text) {

    // Attempt to retrieve the user's voice option from the database
    try {
        var voiceOptions = await getUserVoiceOption(userId)
        if(!voiceOptions) return
    } catch {
        return 
    }

    // Return a new promise that handles the OpenAI API request
    return new Promise((resolve, reject) => {

        // Create an HTTPS request to the OpenAI API
        const req = https.request(options, function (res) {

            const chunks = [];
            
            // Collect data chunks from the response
            res.on('data', function (chunk) {
              chunks.push(chunk);
            });
            
            // Concatenate all chunks and resolve the promise when the response ends
            res.on('end', function () {
              const body = Buffer.concat(chunks);
              resolve(body)
            });
          });
          
          // Handle request errors
          req.on('error', function (error) {
            console.error('Error with the request:', error);
            reject(error);
          });

          // Log the selected voice type for debugging
          console.log(voiceTypes[voiceOptions.voice_option])

          // Write the request data and end the request
          req.write(JSON.stringify({
            'model': 'tts-1',
            'input': text,
            'voice': voiceTypes[voiceOptions.voice_option]
          }));
          
          req.end();
    })
}

module.exports = { generateAudio }
