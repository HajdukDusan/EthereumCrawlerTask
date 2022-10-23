# Ethereum Crawler Task

Program needs to wait 5 seconds between Etherscan API calls to avoid "max rate limit" error, so processing a large number of txs can take some time before returning a response to the client.

    Calculating ERC20 available amount..
    fetched: 10000 txs -> filtered 0
    fetched: 10000 txs -> filtered 1
    fetched: 10000 txs -> filtered 1
    fetched: 10000 txs -> filtered 1
    fetched: 10000 txs -> filtered 1
    fetched: 2313 txs -> filtered 1

## Setup

Clone the repository and open the terminal from the repository folder.
Type the next line in the terminal:

    npm install

After the installation is complete create a .env folder and copy paste the .dev.env content into the .env folder

Add your Etherscan API key in the .env folder:

    ETHERSCAN_API_KEY = your_key_goes_here


Now run the backend with the next command:

    npm start

Now open a new terminal, locate to the client folder and run the client app:

    cd .\client\
    npm start