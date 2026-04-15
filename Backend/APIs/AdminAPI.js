import exp from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { userModel } from "../models/UserModel.js";
import { articleModel } from "../models/ArticleModel.js";

export const adminApp = exp.Router();

//Modify user status (enable/disable)
adminApp.put("/users", verifyToken("ADMIN"), async (req, res) => {
  //get userId and isUserActive status from req body
  const { userId, isUserActive } = req.body;
  //check user
  const userDocument = await userModel.findOne({ _id: userId });
  //if user not found
  if (!userDocument) {
    return res.status(404).json({ message: "User not found" });
  }
  //check if status is already same
  if (userDocument.isUserActive === isUserActive) {
    return res.status(200).json({
      message: `User is already ${isUserActive ? "active" : "disabled"}`,
    });
  }
  //modify user status
  userDocument.isUserActive = isUserActive;
  //save
  await userDocument.save();
  //convert to object and remove password
  const userData = userDocument.toObject();
  delete userData.password;
  //send res
  res.status(200).json({
    message: "User status updated successfully",
    payload: userData,
  });
});

//Read articles of all authors
adminApp.get("/articles", verifyToken("ADMIN"), async (req, res) => {
  //read articles
  const articlesList = await articleModel.find({ isActive: true });
  //send res
  res.status(200).json({ message: "Article List:", payload: articlesList });
});
