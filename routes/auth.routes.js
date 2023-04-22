const router = require("express").Router();
const User = require("../models/User.model");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const saltRounds = 10;
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard");

router.get("/signup", isLoggedOut, (req, res) => res.render("auth/signup.hbs"));

router.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);
    if (!username || !password) {
      res.render('auth/signup', { errorMessage: 'All fields are mandatory. Please provide your username, email and password.' });
      return;
    }
    const regex = /^.{6,}$/;
    if (!regex.test(password)) {
      res
        .status(500)
        .render('auth/signup', { errorMessage: 'Password needs to have at least 6 chars' });
      return;
    }
    
    try{
        const salt = await bcryptjs.genSalt(saltRounds);
        const hashedPassword = await bcryptjs.hash(password, salt)
        console.log(`Password hash: ${hashedPassword}`);
        const newUser = await User.create({
            username,
            password: hashedPassword,
        });
        console.log(`User created: ${newUser}`);
        res.redirect("/");
    }
    catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render('auth/signup', { errorMessage: error.message });
      } else if (error.code === 11000) {
        res.status(500).render('auth/signup', {
           errorMessage: 'This username already exists'
        });
      } else {
        next(error);
      }
    }
})

router.get('/login', isLoggedOut, (req, res) => res.render('auth/login'));

router.post('/login', (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password ) {
      res.render('auth/login', {
        errorMessage: 'Please enter both, username and password to login.'
      });
      return;
    }
   
    User.findOne({ username })
      .then(user => {
        if (!user) {
          res.render('auth/login', { errorMessage: 'Username is not registered. Try with other username.' });
          return;
        } else if (bcryptjs.compareSync(password, user.password)) {
          req.session.currentUser = user;
          res.redirect('/userProfile');
        } else {
          res.render('auth/login', { errorMessage: 'Incorrect password.' });
        }
      })
      .catch(error => next(error));
  });
  
router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) next(err);
    res.redirect("/");
  });
});

module.exports = router;