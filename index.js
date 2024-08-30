const express = require("express");
const app = express();
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const accounts = {
  pizzadog: {
    password:
      "a2020fad44e446cd630af0f22dfb4790871fbb1175d0a814f7e4b41492579ddf",
    perms: "1",
  },
  hihihi: {
    password:
      "22828652b25b4fdfe563c9a9027d3f8b0ff0c33343c5b9904c99e568710c2874",
    perms: "2",
  },
};

let requests = [];

const keys = {};

// error middle warehouse
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// middle ware warehouse :) haha silly
app.use(express.urlencoded({ extended: true }));

// { text: "middle ware warehouse :)", haha: "silly" }
app.use(express.json());

// key & account making
app.use("/", express.static(path.join(__dirname, "make")));

app.use("/admin", (req, res, next) => {
  const key = req.query.key;
  if (!(key && keys[key] && keys[key].perms <= 2)) {
    res.status(401).send("unauthorized");
  } else {
    next()
  }
});

app.use("/admin", express.static(path.join(__dirname, "admin")));

app.get("/requests-list", (req, res) => {
  const key = req.query.key;
  if (!(key && keys[key] && keys[key].perms <= 2)) {
    res.status(401).send("unauthorized");
  } else {
    res.json(requests);
  }
});

app.post("/make-account", (req, res) => {
  const key = req.query.key;
  if (!(key && keys[key] && keys[key].perms <= 2)) {
    res.status(401).send("unauthorized");
  } else {
    let data = req.body;
    accounts[data.user] = {password: data.pass, perms: data.perms}
  }
})

app.post("/req", (req, res) => {
  requests.push(req.body);
  // Send a response back to acknowledge the POST request
  res.send(
    "Request received. It may take some time for admins to accept your account."
  );
});

app.get("/make-key", (req, res) => {
  const user = accounts[req.query.username];
  if (user) {
    if (user.password === req.query.password) {
      let rperms = req.query.perms || user.perms;
      if (user.perms <= rperms) {
        let uuid = uuidv4();
        const { daysSince2000: ds2k } = require("./days");
        keys[uuid] = {
          user: req.query.username,
          perms: rperms,
          lastOk: ds2k + (req.query.length || 0),
        };
        res.json({
          success: true,
          key: {
            id: uuid,
            perms: rperms,
          },
        });
      } else {
        res.json({
          success: false,
          message: "perms too high for user",
        });
      }
    } else {
      res.json({
        success: false,
        message: "incorrect password",
      });
    }
  } else {
    res.json({
      success: false,
      message: "User not found",
    });
  }
});

app.get("/main", (req, res) => {
  if (req.query.key) {
    const keyDetails = keys[req.query.key];
    if (keyDetails) {
      const { daysSince2000: ds2k } = require("./days");
      if (keyDetails.lastOk <= ds2k) {
        // Serve content
        res.send("<p>Content served.</p>"); // Example response
      } else {
        return res
          .status(401)
          .send(
            '<p>Key expired. Go <a href="/">here</a> to get another key.</p>'
          );
      }
    } else {
      return res
        .status(401)
        .send('<p>Key not found. Go <a href="/">here</a> to get a key.</p>');
    }
  } else {
    return res
      .status(401)
      .send(
        '<p>Unauthorized. Go <a href="/">here</a> to get a key/account.</p>'
      );
  }
});

const port = 3000;
const host = "0.0.0.0";

// host will make it also on local network (same wifi) using ip:port
app.listen(port, host, () => {
  console.log(`Server running at http://localhost:${port}`);
});
