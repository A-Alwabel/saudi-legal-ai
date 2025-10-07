const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=====================================');
console.log('  MongoDB Password Update Tool');
console.log('=====================================\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function updatePassword() {
  console.log('This tool will help you update your MongoDB password.\n');
  
  // Ask for username
  console.log('Current username: aalwabel');
  const changeUser = await question('Do you want to change the username? (y/n): ');
  
  let username = 'aalwabel';
  if (changeUser.toLowerCase() === 'y') {
    username = await question('Enter new username: ');
  }
  
  // Ask for new password
  const password = await question('Enter your new MongoDB password: ');
  
  if (!password) {
    console.log('❌ Password cannot be empty!');
    process.exit(1);
  }
  
  // Build new connection string
  const connectionString = `mongodb+srv://${username}:${password}@cluster0.qih14yv.mongodb.net/saudi-legal-ai?retryWrites=true&w=majority&appName=Cluster0`;
  
  console.log('\n📝 New connection string:');
  console.log(connectionString.replace(password, '****'));
  
  // Update db-server.js
  const dbServerPath = path.join(__dirname, 'server', 'db-server.js');
  
  try {
    let content = fs.readFileSync(dbServerPath, 'utf8');
    
    // Find and replace the MONGODB_URI line
    const oldLine = /const MONGODB_URI = 'mongodb\+srv:\/\/.*'/;
    const newLine = `const MONGODB_URI = '${connectionString}'`;
    
    content = content.replace(oldLine, newLine);
    
    fs.writeFileSync(dbServerPath, content);
    console.log('\n✅ Successfully updated server/db-server.js');
    
    // Update db-server-test.js too
    const testPath = path.join(__dirname, 'server', 'db-server-test.js');
    if (fs.existsSync(testPath)) {
      let testContent = fs.readFileSync(testPath, 'utf8');
      
      // Update the first connection in the test file
      testContent = testContent.replace(
        /uri: 'mongodb\+srv:\/\/aalwabel:Bi123123/,
        `uri: '${connectionString.replace(/'/g, "\\'")}`
      );
      
      fs.writeFileSync(testPath, testContent);
      console.log('✅ Successfully updated server/db-server-test.js');
    }
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Test the connection:');
    console.log('   cd server && node db-server-test.js\n');
    console.log('2. If test passes, run the server:');
    console.log('   cd server && node db-server.js\n');
    
  } catch (error) {
    console.error('❌ Error updating files:', error.message);
  }
  
  rl.close();
}

updatePassword().catch(console.error);
