
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

export default GetHistory;