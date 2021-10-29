const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const fetch = require("cross-fetch");
const fs = require("fs");

var secretData = "";
fs.readFile("secret.txt", "utf-8", (err, data) => {
  if (err) throw err;

  secretData = data.split(" ");
  console.log(secretData[0]);
});

mailchimp.setConfig({
  apiKey: secretData[0],
  server: secretData[1],
});

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port 3000.");
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", (req, res) => {
  var firstName = req.body.fName;
  var lastName = req.body.lName;
  var email = req.body.email;
  console.log(lastName);

  const url = "https://us5.api.mailchimp.com/3.0/";

  const run = async () => {
    const response = await mailchimp.lists.batchListMembers("a635943b70", {
      members: [
        {
          email_address: email,
          status: "subscribed",
          merge_fields: {
            FNAME: firstName,
            LNAME: lastName,
          },
        },
      ],
    });
    console.log(response);
    if (response.error_count === 0) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }
  };

  run();
});

app.post("/failure", (req, res) => {
  res.redirect("/");
});
