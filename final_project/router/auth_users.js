const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  const validUsers = users.filter((user) => user.username === username);
  return validUsers.length > 0;
};

const authenticatedUser = (username, password) => {
  const authUsers = users.filter(
    (user) => user.username === username && user.password === password
  );
  return authUsers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.query.username;
  const password = req.query.password;

  if (!username || !password) {
    return res
      .status(404)
      .json({ message: "Error: check user name and password" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Error: Invalid Login!" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbnParam = req.params.isbn;
  const reviewText = req.body.review;
  const username = req.session.authorization.username;
  if (books[isbnParam]) {
    let book = books[isbnParam];
    book.reviews[username] = reviewText;
    return res.status(200).send("Success: Review is added");
  } else {
    return res.status(404).json({ message: `# ${isbn} is not found` });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbnParam = req.params.isbn;
  const username = req.session.authorization.username;
  if (books[isbnParam]) {
    let book = books[isbnParam];
    delete book.reviews[username];
    return res.status(200).send("Success: Review is deleted");
  } else {
    return res.status(404).json({ message: `# ${isbn} is not found` });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;