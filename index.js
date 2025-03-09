const express = require("express");
const { Web3 } = require("web3");
const app = express();

const BSC_RPC_URL = "https://rpc.ankr.com/bsc";
const USDT_BEP20_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const USDT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "from", "type": "address" },
      { "indexed": true, "name": "to", "type": "address" },
      { "indexed": false, "name": "value", "type": "uint256" }
    ],
    "name": "Transfer",
    "type": "event"
  }
];

const web3 = new Web3(BSC_RPC_URL);
const usdtContract = new web3.eth.Contract(USDT_ABI, USDT_BEP20_ADDRESS);

app.get("/usdt/trc20", async (req, res) => {
  try {
    const result = await fetch("https://apilist.tronscan.org/api/token_trc20/transfers?limit=1");
    const data = await result.json();
    const txid = data.token_transfers[0].transaction_id;
    const amount = data.token_transfers[0].trigger_info.parameter._value / 1000000;
    const currency = data.token_transfers[0].tokenInfo.tokenAbbr;

    res.status(200).send({
      results: {
        error: "ok",
        currency: currency,
        data: {
          transaction: {
            txid: txid,
            amount: amount
          },
          owner: '@bahdboi_kingstar on telegram',
          network: 'TRON (TRC20)'
        }
      }
    });
  } catch (error) {
    console.error('TRC20 Error:', error.message);
    res.status(500).send({
      results: {
        error: "An error occurred in getting the txid, Send error to @bahdboi_kingstar on telegram",
        data: 'null'
      }
    });
  }
});

app.get("/usdt/bep20", async (req, res) => {
  try {
    // Handle BigInt for block number
    const latestBlockBigInt = await web3.eth.getBlockNumber();
    console.log('Latest Block Type:', typeof latestBlockBigInt, 'Value:', latestBlockBigInt);
    const latestBlock = Number(latestBlockBigInt);

    const events = await usdtContract.getPastEvents("Transfer", {
      fromBlock: latestBlock - 10,
      toBlock: latestBlock
    });

    if (!events || events.length === 0) {
      throw new Error("No recent transactions found");
    }

    const latestTransfer = events[events.length - 1];
    /*
    console.log('Latest Transfer:', JSON.stringify(latestTransfer, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    */

    const txid = latestTransfer.transactionHash;
    console.log('Transaction Hash:', txid);

    // Ensure value is properly handled
    const amountRaw = latestTransfer.returnValues.value;
    console.log('Raw Amount Type:', typeof amountRaw, 'Value:', amountRaw);

    // Convert BigInt to number safely
    const amountBigInt = BigInt(amountRaw);
    const decimals = BigInt(10**18);
    const amount = Number(amountBigInt) / Number(decimals);
    console.log('Calculated Amount:', amount);

    res.status(200).send({
      results: {
        error: "ok",
        currency: "USDT",
        data: {
          transaction: {
            txid: txid,
            amount: amount
          },
          owner: '@bahdboi_kingstar on telegram',
          network: 'BSC (BEP20)'
        }
      }
    });
  } catch (error) {
    console.error('BEP20 Error:', error.message);
    res.status(500).send({
      results: {
        error: `An error occurred: ${error.message}. Contact @bahdboi_kingstar on telegram`,
        data: 'null'
      }
    });
  }
});

// Export for Vercel
module.exports = app;

console.log(process.env.NODE_ENV);
// Local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log("Running on port: " + port);
  });
}