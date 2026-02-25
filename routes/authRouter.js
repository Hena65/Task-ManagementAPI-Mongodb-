const express = require("express");
const authRouter = express.Router();
const user = require("../models/user");
const userschema = require("../validations/user.schema.js");
const { isAuthenticated } = require("../middlewares/auth.middleware.js");

authRouter.post("/register", async (req, res, next) => {
  try {
    const { error, value } = userschema.validate(req.body);
    const [longitude, latitude] = value.location.coordinates;

    if (error) return res.status(400).json({ error: error.details[0].message });
    const newuser = await user.create(value);
    const nearbyusers = await user
      .findOne({
        _id: { $ne: newuser._id },
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: 15000,
          },
        },
      })
      .select("email");
    res.status(201).json(
      {
        message: "User registered successfully",
        user: {
          id: newuser._id,
          name: newuser.name,
          email: newuser.email,
          role: newuser.role,
        },
      },
      nearbyusers,
    );
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const candidate = await user.findOne({ email }).select("+password");
    if (!candidate) return res.status(401).json({ error: "user not existing" });
    const isMatch = await candidate.comparepassword(password);
    if (!isMatch) return res.status(401).json({ error: "invalid credentials" });
    req.session.userid = candidate._id;
    req.session.role = candidate.role;
    res.status(200).json({
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", isAuthenticated, async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "logout failed" });
    res.clearCookie("connect.sid");
    res.json({ message: "logged out successfully" });
  });
});

module.exports = authRouter;
