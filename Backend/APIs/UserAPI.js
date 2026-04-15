import exp from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { articleModel } from "../models/ArticleModel.js";
export const userApp = exp.Router();

//Read articles of all authors
userApp.get("/articles", verifyToken("USER"), async (req, res) => {
  //read articles
  const articlesList = await articleModel.find({ isActive: true });
  //send res
  res.status(200).json({ message: "Article List:", payload: articlesList });
});

//Add comment to an article
userApp.put("/articles", verifyToken("USER"), async (req, res) => {
  //get body from req
  const { articleId, comment } = req.body;
  //check article
  const articleDocument = await articleModel
    .findOne({
      _id: articleId,
      isActive: true,
    })
    .populate("comments.user");
  //if article not found
  if (!articleDocument) {
    return res.status(404).json({ message: "Article not found" });
  }
  //get user id
  const userId = req.user?.id;
  //add comment to comments array of articleDocument
  articleDocument.comments.push({ user: userId, comment: comment });
  //save
  await articleDocument.save();
  //re-populate so response includes commenter email
  await articleDocument.populate("comments.user");
  //send res
  res
    .status(200)
    .json({ message: "Comment added successfullt", payload: articleDocument });
});
