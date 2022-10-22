
const ethers = require('ethers');
const express = require('express');
const fetch = require('node-fetch');
const Decimal = require('decimal.js');
const res = require('express/lib/response');
Decimal.set({ precision: 124, rounding: 4 })

const app = express();
const port = process.env.PORT || 5000;

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

// const provider = new ethers.getDefaultProvider();

app.listen(port, () => console.log(`Listening on port ${port}`));


app.get('/api/search', async (req, res) => {

    const transactions = await GetExternalTransactions(
        req.query.address,
        req.query.fromBlock,
        req.query.toBlock,
        req.query.pageIndex,
        req.query.pageSize,
        "desc"
    );

    if (shouldBreak(transactions)) res.send([]);
    console.log("external tx num: ", transactions.length)

    try {
        res.send(transactions);
    }
    catch (error) {
        console.log(error)
    }
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

    const latestBlock = await getLatestBlock()

    // we need to wait 5 sec between api calls to avoid max rate limit error
    await delay(5000)

    const externalTx = await GetExternalTransactions(address, 0, latestBlock, 0, 10000, "asc")

    await delay(5000)

    const internalTx = await GetInternalTransactions(address, 0, latestBlock, 0, 10000, "asc")
    if (shouldBreak(externalTx) && shouldBreak(internalTx)) return "0";

    console.log("external tx num: ", externalTx.length)
    console.log("internal tx num: ", internalTx.length)

    await delay(5000)
    const isAddressContract = await checkIfAddressIsContract(address);

    result = result.plus(await accumulateValuesETH(externalTx, address, timestamp, isAddressContract));
    result = result.plus(await accumulateValuesETH(internalTx, address, timestamp, isAddressContract));


    return result.dividedBy(new Decimal(10).toPower(18))
}

// only up to 10k txs
async function GetERC20AvailableAmount(address, contractAddress, date) {

    const timestamp = Date.parse(date) / 1000;

    const latestBlock = await getLatestBlock()

    await delay(5000)

    const transactions = await GetERC20Transactions(address, contractAddress, 0, latestBlock, 0, 10000, "asc")
    if (shouldBreak(transactions)) return "0";

    const decimals = transactions[0].tokenDecimal;
    console.log("tx num: ", transactions.length)

    let result = await accumulateValuesERC20(transactions, address, timestamp);

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

async function accumulateValuesETH(transactions, address, timestamp, isAddressContract) {
    address = address.toLowerCase()

    let result = new Decimal('0');

    transactions.every(tx => {

        if (timestamp < tx.timeStamp) return false;

        // if tx is a contract it cant pay for gas (it is a internal tx)
        if (tx.from === address && !isAddressContract) {
            const gasCost = (new Decimal(tx.gasPrice)).times(tx.gasUsed)
            result = result.minus(gasCost)
        }

        // if tx was reverted value is not sent!
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

    return (await fetchData(url)).result;
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

    return (await fetchData(url)).result;
}

async function GetExternalTransactions(address, fromBlock, toBlock, pageIndex, pageSize, order) {
    return await GetTransactions("txlist", address, fromBlock, toBlock, pageIndex, pageSize, order)
}

async function GetInternalTransactions(address, fromBlock, toBlock, pageIndex, pageSize, order) {
    return await GetTransactions("txlistinternal", address, fromBlock, toBlock, pageIndex, pageSize, order)
}

async function GetTransactions(action, address, fromBlock, toBlock, pageIndex, pageSize, order) {

    const url = "https://api.etherscan.io/api?" +
        "module=account" +
        "&action=" + action +
        "&address=" + address +
        "&startblock=" + fromBlock +
        "&endblock=" + toBlock +
        "&page=" + pageIndex +
        "&offset=" + pageSize +
        "&sort=" + order +
        "&apikey=" + process.env.ETHERSCAN_API_KEY

    return (await fetchData(url)).result;
}

async function getAddressCode(address) {
    const url = "https://api.etherscan.io/api" +
        "?module=proxy" +
        "&action=eth_getCode" +
        "&address=" + address +
        "&tag=latest" +
        "&apikey=" + process.env.ETHERSCAN_API_KEY;

    return (await fetchData(url)).result;
}

async function getLatestBlock() {
    const url = "https://api.etherscan.io/api?" +
        "module=proxy" +
        "&action=eth_blockNumber" +
        "&apikey=" + process.env.ETHERSCAN_API_KEY;

    return parseInt((await fetchData(url)).result, 16);
}

async function checkIfAddressIsContract(address) {
    const code = await getAddressCode(address)

    if (code !== '0x') return true;

    return false;
}

async function fetchData(url) {

    try {
        const data = await fetch(url);
        return await data.json();
    } catch (error) {
        console.log(error);
    }

    return [];
}