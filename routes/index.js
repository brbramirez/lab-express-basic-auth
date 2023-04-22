const router = require("express").Router();
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard");

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/userProfile", isLoggedIn, (req, res, next) => {
  res.render("users/user-profile", { user: req.session.currentUser });
});

module.exports = router;
