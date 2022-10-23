
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

app.listen(port, () => console.log(`Listening on port ${port}`));



// ENDPOINTS
app.get('/api/search', async (req, res) => {

    const transactions = await GetExternalTransactions(
        req.query.address,
        req.query.fromBlock,
        req.query.toBlock,
        req.query.pageIndex,
        req.query.pageSize,
        "desc"
    );

    if (shouldBreak(transactions)) {
        res.send([]);
        return;
    }
    console.log("external tx num: ", transactions.length)

    try {
        res.send(transactions);
    }
    catch (error) {
        console.log(error)
    }
});
app.get('/api/erc20/available-amount', async (req, res) => {

    const [value, token] = await GetERC20AvailableAmount(
        req.query.address,
        req.query.contractAddress,
        req.query.date,
    )
    res.send({ amount: value, symbol: token });
});
app.get('/api/eth/available-amount', async (req, res) => {

    const value = await GetETHAvailableAmount(
        req.query.address,
        req.query.date,
    )
    res.send({ amount: value, symbol: "ETH" });
});



async function GetETHAvailableAmount(address, date) {

    console.log("Calculating ETH available amount..")

    const timestamp = Date.parse(date) / 1000;
    const latestBlock = await getLatestBlock()
    let result = new Decimal('0')

    // we need to wait 5 sec between api calls to avoid max rate limit error
    await delay(5000)
    const isAddressContract = await checkIfAddressIsContract(address);

    // create wrappers for AccumulateAllTransactions()
    async function fetchExternalTxsWrapper(lastProcessedBlock) {
        const txs = await GetExternalTransactions(address, lastProcessedBlock, latestBlock, 0, 10000, "asc")
        return [txs, "ETH", 18]

    }
    async function fetchInternalTxsWrapper(lastProcessedBlock) {
        const txs = await GetInternalTransactions(address, lastProcessedBlock, latestBlock, 0, 10000, "asc");
        return [txs, "ETH", 18]
    }
    async function accumulateValuesETHWrapper(transactions) {
        return await accumulateValuesETH(transactions, address, timestamp, isAddressContract);
    }

    // accumulate values of all external and internal txs
    console.log("Fetching external txs..")
    result = result.plus((await AccumulateAllTransactions(fetchExternalTxsWrapper, accumulateValuesETHWrapper, latestBlock))[0])
    console.log("Fetching internal txs..")
    result = result.plus((await AccumulateAllTransactions(fetchInternalTxsWrapper, accumulateValuesETHWrapper, latestBlock))[0])

    return result.dividedBy(new Decimal(10).toPower(18));
}

async function GetERC20AvailableAmount(address, contractAddress, date) {

    console.log("Calculating ERC20 available amount..")

    const timestamp = Date.parse(date) / 1000;
    const latestBlock = await getLatestBlock()
    let result = new Decimal('0')

    await delay(5000)

    // create wrappers for AccumulateAllTransactions()
    async function fetchERC20TxWrapper(lastProcessedBlock) {
        return await GetERC20Transactions(address, contractAddress, lastProcessedBlock, latestBlock, 0, 10000, "asc");
    }
    async function accumulateValuesERC20Wrapper(transactions) {
        return await accumulateValuesERC20(transactions, address, timestamp);
    }

    const [amount, symbol, decimals] = await AccumulateAllTransactions(fetchERC20TxWrapper, accumulateValuesERC20Wrapper, latestBlock)

    result = result.plus(amount)

    return [result.dividedBy(new Decimal(10).toPower(decimals)), symbol]
}

async function AccumulateAllTransactions(fetchFunction, accumulateFunction, latestBlock) {

    let result = new Decimal('0')
    let lastBlockTxs = [];
    let lastProcessedBlock = 0;

    let decimalPoints = 18
    let symbol = "";

    while (true) {

        await delay(5000)
        let [transactions, tokenSymbol, tokenDecimals] = await fetchFunction(lastProcessedBlock)
        decimalPoints = tokenDecimals;
        symbol = tokenSymbol;

        if (shouldBreak(transactions)) break;

        const txsOriginalLenght = transactions.length;

        // filter processed txs from the last iteration
        transactions = transactions.filter(tx => !lastBlockTxs.includes(tx.hash));

        console.log("fetched:", txsOriginalLenght, "txs -> filtered", txsOriginalLenght - transactions.length)

        lastBlockTxs = getLastBlockTxs(transactions);

        // update last fetched block number
        lastProcessedBlock = transactions[transactions.length - 1].blockNumber;

        result = result.plus(await accumulateFunction(transactions));

        // last iteration if the fetch did not hit 10k
        if (txsOriginalLenght != 10000) break;
    }

    return [result, symbol, decimalPoints];
}

function getLastBlockTxs(transactions) {
    const result = [];
    let max = -1;

    for (let i = transactions.length - 1; i >= 0; i--) {
        if (max <= transactions[i].blockNumber) {
            max = transactions[i].blockNumber;
            result.push(transactions[i].hash);
        }
        else break;
    }

    return result;
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

// doesnt add up stacked ether (stETH) correctly, dont know why, example:
// erc20 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84
// addr  0xdc24316b9ae028f1497c275eb9192a3ea0f67022
function accumulateValuesERC20(transactions, address, timestamp) {
    address = address.toLowerCase()

    let result = new Decimal('0');

    transactions.every(tx => {

        if (timestamp < tx.timeStamp) return false;

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


// ETHERSCAN API FUNCTIONS
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

    const txs = (await fetchData(url)).result;

    if (!shouldBreak(txs)) {
        return [txs, txs[0].tokenSymbol, txs[0].tokenDecimal]
    }

    return [[], "", 18];
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