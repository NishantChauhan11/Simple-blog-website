const express = require("express");
const postModel = require("../model/post.model");

const router = express.Router();

router.get("/", async (req, res) => {
  const filter = {};
  const selectedCategory = req.query.category;

  if (selectedCategory) {
    filter.category = { $regex: new RegExp("^" + selectedCategory + "$", "i") };
  }

  const posts = await postModel.find(filter).sort({ date: -1 });

  res.render("home.ejs", {
    posts,
    decode: null,
    queryCategory: selectedCategory
  });
});

module.exports = router;
