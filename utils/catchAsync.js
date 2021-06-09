module.exports = (func) => {
  return (req, res, next) => {
    // console.log("error", err);
    func(req, res, next).catch(next);
  };
};
