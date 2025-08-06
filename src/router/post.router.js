const express = require("express");
const ImageKit = require("imagekit");
const multer = require("multer");
const postModel = require("../model/post.model");
require("dotenv").config();

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const imagekit = new ImageKit({
  publicKey: process.env.PUBLICKEY,
  privateKey: process.env.PRIVATEKEY,
  urlEndpoint: process.env.URLENDPOINT,
});

router.get("/detail/:id", async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (!post) return res.status(404).send("Not found");
    res.render("postDetail", { post });
  } catch {
    res.status(500).send("Error");
  }
});

router.get("/update/:id", async (req, res) => {
  try {
    const post = await postModel.findById(req.params.id);
    if (!post) return res.status(404).send("Not found");
    res.render("postUpdate", { post });
  } catch {
    res.status(500).send("Error");
  }
});

router.post("/update/:id", upload.single("image"), async (req, res) => {
  const { title, author, category, content } = req.body;
  const updateData = { title, author, category, content };

  if (req.file) {
    try {
      const result = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: "/blog-posts",
      });
      updateData.image = result.url;
    } catch {
      return res.status(500).send("Image error");
    }
  }

  try {
    await postModel.findByIdAndUpdate(req.params.id, updateData);
    res.redirect(`/posts/detail/${req.params.id}`);
  } catch {
    res.status(500).send("Error");
  }
});

router.get("/delete/:id", async (req, res) => {
  try {
    await postModel.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch {
    res.status(500).send("Error");
  }
});

router.get("/add", (req, res) => {
  res.render("postForm");
});

router.post("/add", upload.single("image"), async (req, res) => {
  const { title, author, category, content } = req.body;

  try {
    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: "/blog-posts",
    });

    const post = new postModel({
      title,
      author,
      category,
      content,
      image: result.url,
      date: new Date(),
    });

    await post.save();
    res.redirect("/");
  } catch {
    res.status(500).send("Image error");
  }
});

module.exports = router;
