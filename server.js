
const ethers = require('ethers');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

const provider = new ethers.providers.EtherscanProvider(null, process.env.REACT_APP_ETHERSCAN_API_KEY);

// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`)); //Line 6

// create a GET route
app.get('/api/search', async (req, res) => {

    res.send(await GetHistory(
        req.query.address,
        req.query.fromBlock,
        req.query.toBlock
    ));
});

async function GetHistory(address, fromBlock, toBlock) {
    const txs = await provider.getHistory(address, fromBlock, toBlock)
    return txs;
}