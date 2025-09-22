# LochPnLTracker
PnL Tracker Assignment

Project was initialized using:
npx express-generator --no-view

Points to consider:
1. Not taking id and timestamp from user instead populating current timestamp in DB.
2. For PnL calculation we will use FIFO as that is the correct method.

How to run the project:
1. You need to have node and npm installed
2. Go inside the project directory and run npm install
3. now run npm start or node ./bin/www to run the project
4. Now if you go to http://localhost:3000/. It should show welcome to express page

How to run Tests:
1. Get Rest Client Extension on VS code
2. Go to the test file that you need to run inside Tests/ folder
3. Hit Ctrl + Alt + R to run the test case