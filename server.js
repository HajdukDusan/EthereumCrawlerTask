
const ethers = require('ethers');
const express = require('express');
const fetch = require('node-fetch');
const Decimal = require('decimal.js');
Decimal.set({ precision: 124, rounding: 4 })

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

app.get('/api/erc20/available-amount', async (req, res) => {

    res.send(await GetERC20AvailableAmount(
        req.query.address,
        req.query.contractAddress,
        req.query.date,
    ));
});

app.get('/api/eth/available-amount', async (req, res) => {

    res.send(await GetHistory(
        req.query.address,
        req.query.date,
    ));
});

async function GetERC20AvailableAmount(address, contractAddress, date) {

    address = address.toLowerCase()

    try {
        const timestamp = Date.parse(date)/1000;

        const data = await fetch("https://api.etherscan.io/api?" +
            "module=account" +
            "&action=tokentx" +
            "&contractaddress=" + contractAddress +
            "&address=" + address +
            "&page=" + 0 +
            "&offset=" + 10000 +
            "&sort=asc" +
            "&apikey=" + process.env.ETHERSCAN_API_KEY);

        const response = await data.json();

        let result = new Decimal('0');
        let decimals = 0;

        response.result.every(tx => {

            if(timestamp < tx.timeStamp) return false;

            decimals = tx.tokenDecimal

            if (tx.to === tx.from === address) return true;

            if (tx.to === address) {
                result = result.plus(tx.value)
            }
            else if (tx.from === address) {
                result = result.minus(tx.value)
            }

            return true;
        });

        return result.dividedBy(new Decimal(10).toPower(decimals))

    } catch (error) {
        console.log(error);
    }
}

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

        return response.result;
    } catch (error) {
        console.log(error);
    }

    return [];
}