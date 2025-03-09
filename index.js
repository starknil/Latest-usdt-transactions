const express = require("express");
const Web3 = require("web3");
const app = express();

// BSC public RPC endpoint (you could use your own node instead)
const BSC_RPC_URL = "https://bsc-dataseed.binance.org/";
// USDT BEP20 contract address
const USDT_BEP20_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
// Minimal USDT ABI for Transfer event
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

// Initialize Web3
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
    // Get latest block number
    const latestBlock = await web3.eth.getBlockNumber();
    
    // Get past Transfer events (last 100 blocks as an example)
    const events = await usdtContract.getPastEvents("Transfer", {
      fromBlock: latestBlock - 100,
      toBlock: latestBlock
    });

    if (!events || events.length === 0) {
      throw new Error("No recent transactions found");
    }

    // Get the most recent transfer
    const latestTransfer = events[events.length - 1];
    const txid = latestTransfer.transactionHash;
    const amount = parseInt(latestTransfer.returnValues.value) / 1e18;

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

// Local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log("Running on port: " + port);
  });
}