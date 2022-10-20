
const ethers = require('ethers');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

const provider = new ethers.providers.EtherscanProvider(null, process.env.REACT_APP_ETHERSCAN_API_KEY);

app.listen(port, () => console.log(`Listening on port ${port}`));


app.get('/api/search', async (req, res) => {

    res.send(await GetHistory(
        req.query.address,
        req.query.fromBlock,
        req.query.toBlock
    ));
});


async function GetHistory(address, fromBlock, toBlock) {
    const txs = await provider.getHistory(address, fromBlock, toBlock)
    console.log(txs.length)
    return txs;
}