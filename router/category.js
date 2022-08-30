const router = require("express").Router();

const {
  createCategory,
  getCategoryList,
  deleteCategory,
  getPostsByCategory,
  getCategoryDetails
} = require("../controller/category");
const { requireLogin } = require("../middleware/auth");

// dashboard

router.post("/create-category", requireLogin, createCategory);
router.get("/category-list", getCategoryList);
router.delete("/delete-category/:id", requireLogin, deleteCategory);

// to get posts by category

router.get("/posts-by-category/:slug", getPostsByCategory);

// to get category info

router.get("/category-details/:slug",getCategoryDetails);

module.exports = router;
