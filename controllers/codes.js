const code = require("../models/code");
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const codes = await code.find({}).populate("popupText");
  res.render("codes/index", { codes });
};

module.exports.renderNewForm = (req, res) => {
  res.render("codes/new");
};

module.exports.createcode = async (req, res, next) => {
  const code = new code(req.body.code);
  code.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  code.author = req.user._id;
  await code.save();
  console.log(code);
  req.flash("success", "Successfully made a new code!");
  res.redirect(`/codes/${code._id}`);
};

module.exports.showcode = async (req, res) => {
  const code = await code
    .findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!code) {
    req.flash("error", "Cannot find that code!");
    return res.redirect("/codes");
  }
  res.render("codes/show", { code });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const code = await code.findById(id);
  if (!code) {
    req.flash("error", "Cannot find that code!");
    return res.redirect("/codes");
  }
  res.render("codes/edit", { code });
};

module.exports.updatecode = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const code = await code.findByIdAndUpdate(id, {
    ...req.body.code,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  code.images.push(...imgs);
  await code.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await code.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated code!");
  res.redirect(`/codes/${code._id}`);
};

module.exports.deletecode = async (req, res) => {
  const { id } = req.params;
  await code.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted code");
  res.redirect("/codes");
};
