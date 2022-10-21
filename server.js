
const ethers = require('ethers');
const express = require('express');
const fetch = require('node-fetch');
const Decimal = require('decimal.js');
const res = require('express/lib/response');
Decimal.set({ precision: 124, rounding: 4 })

const app = express();
const port = process.env.PORT || 5000;


const provider = new ethers.getDefaultProvider();

app.listen(port, () => console.log(`Listening on port ${port}`));


app.get('/api/search', async (req, res) => {

    res.send(await GetTransactions(
        req.query.address,
        req.query.fromBlock,
        req.query.toBlock,
        req.query.pageIndex,
        req.query.pageSize,
        "desc"
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

    res.send(await GetETHAvailableAmount(
        req.query.address,
        req.query.date,
    ));

});

// only up to 10k txs
async function GetETHAvailableAmount(address, date) {

    const timestamp = Date.parse(date) / 1000;
    let result = new Decimal('0')

    const latestBlock = await provider.getBlock("latest")

    const transactions = await GetTransactions(address, 0, latestBlock, 0, 10000, "asc")
    if (shouldBreak(transactions)) return [];

    console.log(transactions.length)

    result = result.plus(accumulateValuesETH(transactions, address, timestamp));

    return result.dividedBy(new Decimal(10).toPower(18))
}

// only up to 10k txs
async function GetERC20AvailableAmount(address, contractAddress, date) {

    const timestamp = Date.parse(date) / 1000;
    const latestBlock = await provider.getBlock("latest")

    const transactions = await GetERC20Transactions(address, contractAddress, 0, latestBlock, 0, 10000, "asc")

    if (shouldBreak(transactions)) return []

    const decimals = transactions[0].decimals;
    console.log(transactions.length)

    let result = accumulateValuesERC20(transactions, address, timestamp);

    return result.dividedBy(new Decimal(10).toPower(decimals))
}

function shouldBreak(transactions) {
    if (!Array.isArray(transactions)) {
        console.log(transactions)
        return true
    }
    if (transactions.length == 0) return true
    return false
}

function accumulateValuesETH(transactions, address, timestamp) {
    address = address.toLowerCase()

    let result = new Decimal('0');

    transactions.every(tx => {

        if (timestamp < tx.timeStamp) return false;

        if (tx.from === address) {
            const gasCost = (new Decimal(tx.gasPrice)).times(tx.gasUsed)
            result = result.minus(gasCost)
        }

        // if error value is not sent!
        if (tx.isError != 0) return true;

        if (tx.to === address) {
            result = result.plus(tx.value)
        }

        if (tx.from === address) {
            result = result.minus(tx.value)
        }

        return true;
    });

    return result;
}


function accumulateValuesERC20(transactions, address, timestamp) {
    address = address.toLowerCase()

    let result = new Decimal('0');

    transactions.every(tx => {

        if (timestamp < tx.timeStamp) return false;

        if (tx.to === tx.from === address) return true;

        if (tx.to === address) {
            result = result.plus(tx.value)
        }
        else if (tx.from === address) {
            result = result.minus(tx.value)
        }

        console.log(result)

        return true;
    });

    return result;
}

async function GetERC20Transactions(address, contractAddress, fromBlock, toBlock, pageIndex, pageSize, order) {

    const url = "https://api.etherscan.io/api?" +
        "module=account" +
        "&action=tokentx" +
        "&contractaddress=" + contractAddress +
        "&address=" + address +
        "&startblock=" + fromBlock +
        "&endblock=" + toBlock +
        "&page=" + pageIndex +
        "&offset=" + pageSize +
        "&sort=" + order +
        "&apikey=" + process.env.ETHERSCAN_API_KEY

    return await fetchFromEtherscan(url);
}

async function GetTransactions(address, fromBlock, toBlock, pageIndex, pageSize, order) {

    const url = "https://api.etherscan.io/api?" +
        "module=account" +
        "&action=txlist" +
        "&address=" + address +
        "&startblock=" + fromBlock +
        "&endblock=" + toBlock +
        "&page=" + pageIndex +
        "&offset=" + pageSize +
        "&sort=" + order +
        "&apikey=" + process.env.ETHERSCAN_API_KEY

    return await fetchFromEtherscan(url);
}

async function fetchFromEtherscan(url) {

    try {
        const data = await fetch(url);
        const response = await data.json();

        return response.result;
    } catch (error) {
        console.log(error);
    }

    return [];
}