import exp from "express";
import { userModel } from "../models/UserModel.js";
import { compare, hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middlewares/verifyToken.js";
const { sign } = jwt;
export const commonApp = exp.Router();
import { upload } from "../config/multer.js";
import { uploadToCloudinary } from "../config/cloudinaryUpload.js";
import cloudinary from "../config/cloudinary.js";

//Router for registration
commonApp.post(
  "/users",
  upload.single("profileImageUrl"),
  async (req, res, next) => {
    let cloudinaryResult = null;
    try {
      const allowedROles = ["USER", "AUTHOR"];
      const newUser = req.body;
      if (!allowedROles.includes(newUser.role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      //upload image to cloudinary from memoryStorage
      if (req.file) {
        cloudinaryResult = await uploadToCloudinary(req.file.buffer);
        newUser.profileImageUrl = cloudinaryResult?.secure_url;
      }
      // Create document first
      const newUserDocument = userModel(newUser);
      // Validate
      await newUserDocument.validate();
      // Hash password
      const hashedPassword = await hash(newUser.password, 10);
      newUserDocument.password = hashedPassword;
      // Save
      await newUserDocument.save({ validateBeforeSave: false });
      res.status(201).json({ message: "User created" });
    } catch (err) {
      //delete image from cloudinary
      if (cloudinaryResult?.public_id) {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id);
      }
      next(err);
    }
  },
);

//Router for Login
commonApp.post("/login", async (req, res) => {
  //get creds from the req
  const { email, password } = req.body;
  //find user by email
  const user = await userModel.findOne({ email: email });
  //if user not found
  if (!user) {
    return res.status(400).json({ message: "Invalid email" });
  }
  //compare password
  const isMatched = await compare(password, user.password);
  //if password isnt matched
  if (!isMatched) {
    return res.status(400).json({ message: "Invalid password" });
  }
  //create jwt
  const signedToken = sign(
    {
      id: user._id,
      email: email,
      role: user.role,
      firstName: user.firstName,
      profileImageUrl: user.profileImageUrl,
    },
    process.env.SECRET_KEY,
    { expiresIn: "1h" },
  );
  res.cookie("token", signedToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  //remove user password
  const userObj = user.toObject();
  delete userObj.password;
  //send res
  res.status(200).json({ message: "Login success", payload: userObj });
});

// Route for Logout
commonApp.get("/logout", (req, res) => {
  //delete token fromm cookie storage
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  //send res
  res.status(200).json({ message: "Logout success" });
});

//Page Refresh
commonApp.get(
  "/check-auth",
  verifyToken("USER", "AUTHOR", "ADMIN"),
  (req, res) => {
    res.status(200).json({ message: "Authenticated", payload: req.user });
  },
);

//change password
commonApp.put(
  "/password",
  verifyToken("USER", "AUTHOR", "ADMIN"),
  async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    //check if both passwords are same
    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "The new password is the same as the current password",
      });
    }
    //get user id from token
    const userId = req.user?.id;
    //find user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    //verify current password
    const verifiedPassword = await compare(currentPassword, user.password);
    if (!verifiedPassword) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    //hash new password
    const updatedPassword = await hash(newPassword, 10);
    //update password
    user.password = updatedPassword;
    //save
    await user.save();
    res.status(200).json({ message: "Password successfully changed" });
  },
);
