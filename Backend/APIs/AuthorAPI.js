import exp from "express";
import { userModel } from "../models/UserModel.js";
import { articleModel } from "../models/ArticleModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";
export const authorApp = exp.Router();

//Write Article
authorApp.post("/articles", verifyToken("AUTHOR"), async (req, res) => {
  try {
    const articleObj = req.body;
    const user = req.user;

    // 🔒 BEST PRACTICE: take author from token, NOT frontend
    const authorId = user?.id;

    if (!authorId) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    // 🔍 Find author in DB
    const author = await userModel.findById(authorId);

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // 📝 Attach author to article
    articleObj.author = authorId;

    // 💾 Save article
    const articleDocument = new articleModel(articleObj);
    await articleDocument.save();

    // ✅ Success response
    res.status(201).json({ message: "Article published successfully" });

  } catch (err) {
    console.error("POST /articles ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

//Read own Articles
authorApp.get("/articles", verifyToken("AUTHOR"), async (req, res) => {
  //get the user from req token
  const authorIdOfToken = req.user?.id;
  //get articles from author id
  const articlesList = await articleModel.find({ author: authorIdOfToken });
  if (!articlesList) {
    return res.status(404).json({ message: "Articles not found" });
  }
  //send res
  res.status(200).json({ message: "Articles", payload: articlesList });
});

//Edit Articles
authorApp.put("/articles", verifyToken("AUTHOR"), async (req, res) => {
  //get author id from decoded token
  const authorIdOfToken = req.user?.id;
  //get the updatedArticle from the req
  const { articleId, title, category, content } = req.body;
  //find and update the article from article db
  const modifiedArticle = await articleModel.findOneAndUpdate(
    { _id: articleId, author: authorIdOfToken },
    { $set: { title, category, content } },
    { new: true },
  );
  if (!modifiedArticle) {
    return res
      .status(403)
      .json({ message: "You are not authorized to edit this article" });
  }
  res
    .status(200)
    .json({ message: "updated the article", payload: modifiedArticle });
});
//Delete Articles(Soft delete)
authorApp.patch("/articles", verifyToken("AUTHOR"), async (req, res) => {
  //get user id from decodedToken
  const authorIdOfToken = req.user?.id;
  //get body from request
  const { articleId, isArticleActive } = req.body;
  //get article by id
  const articleOfDB = await articleModel.findOne({
    _id: articleId,
    author: authorIdOfToken,
  });
  //chech status
  if (isArticleActive === articleOfDB.isActive) {
    return res
      .status(200)
      .json({ message: "Article already in the same state" });
  }
  articleOfDB.isActive = isArticleActive;
  await articleOfDB.save();
  //send res
  res.status(200).json({ message: "Article Modified", payload: articleOfDB });
});