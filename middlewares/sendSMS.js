const axios = require("axios").default;
const AWS = require("aws-sdk");
require("dotenv").config();

AWS.config.update({
  region: "ap-south-1",
  accessKeyId: "AKIAUAOO3TQIW5KTS4FF",
  secretAccessKey: "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",
});
exports.sendSmsKaleyra = (mobileno, randmno) =>
  new Promise((resolve) => {
    const hash = "%3C%23%3E";
    var config = {
      method: "get",
      url: `https://api-alerts.kaleyra.com/v4/?api_key=Ab88f593551f9cc7ffd97e582a803fed5&method=sms&message=${hash} GOGAME: Your verification code is ${randmno} gPDdbiyxcxh&to=${mobileno}&sender=GOGAME`,
      headers: {},
    };

    axios(config)
      .then(function (response) {
        resolve(response);
      })
      .catch(function (error) {
        resolve(error);
      });
  });

exports.sendSmsSNS = (mobileno, randomno) =>
  new Promise((resolve) => {
    var params = {
      Message: "<#> Jobpakado: Your verification code is " + randomno + ".",
      PhoneNumber: mobileno,
    };
    new AWS.SNS({ apiVersion: "2020–03–31" })
      .publish(params)
      .promise()
      .then((message) => {
        resolve(message);
      })
      .catch((err) => {
        resolve(err);
      });
  });