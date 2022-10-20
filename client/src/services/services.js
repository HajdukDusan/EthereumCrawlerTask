
const GetHistory = async (address, fromBlock, toBlock) => {

    const response = await fetch('/api/search?address=' + address + '&fromBlock=' + fromBlock + '&toBlock=' + toBlock);
    const body = await response.json();

    if (response.status !== 200) {
        throw Error(body.message)
    }
    return body;
};

export default GetHistory;