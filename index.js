const axios = require("axios");
const express = require("express");
const app = express();

const BSCSCAN_API_KEY = "NSE24ZP8DHCMS6UVSAUKPGEINMDM1634YY";
const USDT_BEP20_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

app.get("/usdt/trc20", async (req, res) => {
  try {
    const result = await axios.get("https://apilist.tronscan.org/api/token_trc20/transfers?limit=1");
    const data = result.data;
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
    const result = await axios.get(
      `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${USDT_BEP20_ADDRESS}&page=1&offset=1&sort=desc&apikey=${BSCSCAN_API_KEY}`
    );
    const data = result.data;


    if (data.status !== "1") {
      throw new Error("API returned an error");
    }

    const txid = data.result[0].hash;
    const amount = parseInt(data.result[0].value) / 10**18; // USDT has 18 decimals on BSC
    const currency = "USDT";

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
          network: 'BSC (BEP20)'
        }
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      results: {
        error: "An error occurred in getting the txid, Send error to @bahdboi_kingstar on telegram",
        data: 'null'
      }
    });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log("Running on port: " + port);
});