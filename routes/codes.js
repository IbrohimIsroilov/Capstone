const express = require("express");
const router = express.Router();
const codes = require("../controllers/codes");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validatecode } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const code = require("../models/code");

router
  .route("/")
  .get(catchAsync(codes.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validatecode,
    catchAsync(codes.createcode)
  );

router.get("/new", isLoggedIn, codes.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(codes.showcode))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validatecode,
    catchAsync(codes.updatecode)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(codes.deletecode));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(codes.renderEditForm));

module.exports = router;
