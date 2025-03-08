const axios = require("axios");
const express = require("express");
const app = express();

app.get("/usdt", async (req, res) => {
  try {
    const result = await axios.get(
      "https://apilist.tronscan.org/api/token_trc20/transfers?limit=1",
    );
    const data = result.data;
    const txid = data.token_transfers[0].transaction_id;
    const amount =
      data.token_transfers[0].trigger_info.parameter._value / 1000000;
    const currency = data.token_transfers[0].tokenInfo.tokenAbbr;

    res.status(200).send({
      results: {
        error: "ok",
        currency: currency,
        data: {
          transaction: {
            txid: txid,
            amount: amount,
          },
          owner: "@bahdboi_kingstar on telegram",
        },
      },
    });
  } catch (error) {
    res.status(500).send({
      results: {
        error:
          "An error occurred in getting the txid, Send error to @bahdboi_kingstar on telegram",
        data: "null",
      },
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
