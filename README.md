# LochPnLTracker
PnL Tracker Assignment

The project was initialized using:
*npx express-generator --no-view*

Points to consider:
1. Not taking ID and timestamp from the user, instead populating the current timestamp in the DB.
2. For P&L calculation, we will use FIFO as that is the correct method.
3. Using SQLite3 DB as it doesn't require any configs(username, password, port or host etc to run)
4. Trades are stored inside trades table to keep history of all trades
5. Current holdings are stored inside holdings table
6. PnL table has current realized profit. Calculated sell price - buy price
7. Unrealized profit/loss is calculated current price(HardCoded) - buy price

How to run the project:
1. You need to have Node and npm installed
2. Go inside the project directory and run *npm install*
3. Now run *npm start* or *node ./bin/www* to run the project
4. Now, if you go to http://localhost:3000/. It should show *Welcome to express* page

Alternatively you can run using docker:
1. docker build -t my-node-app .
2. docker run -p 3000:3000 my-node-app


How to run Tests:
1. Get Rest Client Extension on VS Code
2. Go to the test file that you need to run inside the Tests/ folder
3. Hit Ctrl + Alt + R to run the test case
