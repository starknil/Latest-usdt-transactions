const express = require("express");
const { Web3 } = require("web3");
const app = express();

let BSC_RPC_URL = "https://rpc.ankr.com/bsc/a7f0d40be4bdaf75bb028f6cf58a3268052b88810aab42c0ff8bd70f9c37794a";

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
          owner: '@gill_728 on telegram',
          network: 'TRON (TRC20)'
        }
      }
    });
  } catch (error) {
    console.error('TRC20 Error:', error.message);
    res.status(500).send({
      results: {
        error: "An error occurred in getting the txid, Send error to @gill_728 on telegram",
        data: 'null'
      }
    });
  }
});



app.get("/usdt/bep20", async (req, res) => {
  try {
    
    const latestBlockBigInt = await web3.eth.getBlockNumber();

    const latestBlock = Number(latestBlockBigInt);

    const events = await usdtContract.getPastEvents("Transfer", {
      fromBlock: latestBlock - 1,
      toBlock: latestBlock
    });

    console.log(events.length);

    if (!events || events.length === 0) {
      throw new Error("No recent transactions found");
    }

    const latestTransfer = events[events.length - 1];

    const txid = latestTransfer.transactionHash;

    const amountRaw = latestTransfer.returnValues.value;

    const amountBigInt = BigInt(amountRaw);
    const decimals = BigInt(10**18);
    const amount = Number(amountBigInt) / Number(decimals);

    res.status(200).send({
      results: {
        error: "ok",
        currency: "USDT",
        data: {
          transaction: {
            txid: txid,
            amount: amount
          },
          owner: '@gill_728 on telegram',
          network: 'BSC (BEP20)'
        }
      }
    });
  } catch (error) {
    console.error('BEP20 Error:', error);
    res.status(500).send({
      results: {
        error: `An error occurred: ${error.message}. Contact @gill_728 on telegram`,
        data: 'null'
      }
    });
  }
});


module.exports = app;


if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log("Running on port: " + port);
  });
}
