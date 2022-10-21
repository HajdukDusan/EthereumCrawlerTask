
const GetHistory = async (address, fromBlock, toBlock, pageIndex, pageSize) => {

    const response = await fetch(
        '/api/search?address=' + address +
        '&fromBlock=' + fromBlock +
        '&toBlock=' + toBlock +
        '&pageIndex=' + pageIndex +
        '&pageSize=' + pageSize);

    const body = await response.json();

    if (response.status !== 200) {
        throw Error(body.message)
    }
    return body;
};

const GetAvailableERC20Value = async (address, contractAddress, date) => {

    const response = await fetch(
        '/api/erc20/available-amount?' +
        'address=' + address +
        '&contractAddress=' + contractAddress +
        '&date=' + date
    );

    const body = await response.json();

    if (response.status !== 200) {
        throw Error(body.message)
    }
    return body;
};

const GetAvailableETHValue = async (address, date) => {

    const response = await fetch(
        '/api/eth/available-amount?' +
        'address=' + address +
        '&date=' + date
    );

    const body = await response.json();

    if (response.status !== 200) {
        throw Error(body.message)
    }
    return body;
};

export {
    GetHistory,
    GetAvailableERC20Value,
    GetAvailableETHValue
}
