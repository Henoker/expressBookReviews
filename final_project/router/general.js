const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

function getAllBooks() {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
}

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const allBooks = await getAllBooks();
    res.send(JSON.stringify(allBooks));
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  try {
    const book = await books[req.params.isbn];
    if (book) {
      res.json(book);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error: book list is not available" });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  try {
    getAllBooks()
      .then((ent) => Object.values(ent))
      .then((books) => books.filter((book) => book.author === author))
      .then((result) => res.send(result));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error: book details based on author is not available",
    });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  try {
    getAllBooks()
      .then((ent) => Object.values(ent))
      .then((books) => books.filter((book) => book.title === title))
      .then((result) => res.send(result));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error: all books based on title is not available" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  try {
    const book = books[req.params.isbn];

    if (book) {
      const reviews = book.reviews;
      res.json(reviews);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error: book reviews are not available" });
  }
});

// Registration
public_users.post("/register", (req, res) => {
  const username = req.query.username;
  const password = req.query.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });

      return res
        .status(200)
        .json({ message: "User is successfully registred!" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res
    .status(404)
    .json({ message: "Error: something went wrong, please try again later." });
});

module.exports.general = public_users;