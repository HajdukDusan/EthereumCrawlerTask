import { ethers } from 'ethers';

let address = "0x545b446C21583Bae74a9b3C2d427e01e473C7C0A";
let etherscanProvider = new ethers.providers.EtherscanProvider();

async function GetHistory() {
    
    const provider = new ethers.providers.EtherscanProvider(null, process.env.REACT_APP_ETHERSCAN_API_KEY);

    console.log(await provider.getBlockNumber())
    console.log(await provider.getBalance(address))
    await provider.getHistory(address).then((history) => {
        history.forEach((tx) => {
            console.log(tx);
        })
    });

    return true;
}

export default GetHistory;
