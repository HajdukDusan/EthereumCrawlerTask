
const ethers = require('ethers');
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 5000;

const provider = new ethers.providers.EtherscanProvider(null, process.env.ETHERSCAN_API_KEY);

app.listen(port, () => console.log(`Listening on port ${port}`));


app.get('/api/search', async (req, res) => {

    res.send(await GetHistory(
        req.query.address,
        req.query.fromBlock,
        req.query.toBlock,
        req.query.pageIndex,
        req.query.pageSize
    ));
});


async function GetHistory(address, fromBlock, toBlock, pageIndex, pageSize) {

    try {
        const data = await fetch("https://api.etherscan.io/api?" +
            "module=account" +
            "&action=txlist" +
            "&address=" + address +
            "&startblock=" + fromBlock +
            "&endblock=" + toBlock +
            "&page=" + pageIndex +
            "&offset=" + pageSize +
            "&sort=desc" +
            "&apikey=" + process.env.ETHERSCAN_API_KEY);

        const response = await data.json();
        console.log(response.result.length);
        return response.result;
    } catch (error) {
        console.log(error);
    }

    return [];
}