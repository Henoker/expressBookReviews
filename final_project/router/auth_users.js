const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if the username is valid
const isValid = (username) => {
  const validUsers = users.filter((user) => user.username === username);
  return validUsers.length > 0;
};

// Function to check if username and password match the records
const authenticatedUser = (username, password) => {
  const authUsers = users.filter(
    (user) => user.username === username && user.password === password
  );
  return authUsers.length > 0;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: username,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbnParam = req.params.isbn;
  const reviewText = req.body.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (books[isbnParam]) {
    let book = books[isbnParam];
    book.reviews[username] = reviewText;
    return res.status(200).json({ message: "Review successfully added" });
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbnParam} not found` });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbnParam = req.params.isbn;
    const username = req.session.authorization?.username;
  
    if (!username) {
      return res.status(401).json({ message: "User not authenticated" });
    }
  
    if (books[isbnParam]) {
      let book = books[isbnParam];
      if (book.reviews[username]) {
        delete book.reviews[username];
        return res.status(200).json({ message: "Review successfully deleted" });
      } else {
        return res.status(404).json({ message: "Review not found for this user" });
      }
    } else {
      return res.status(404).json({ message: `Book with ISBN ${isbnParam} not found` });
    }
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
