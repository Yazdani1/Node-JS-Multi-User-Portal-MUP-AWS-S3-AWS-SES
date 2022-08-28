const router = require("express").Router();

const {createCategory,getCategoryList,deleteCategory} = require("../controller/category");
const { requireLogin } = require("../middleware/auth");

// dashboard

router.post("/create-category",requireLogin,createCategory);
router.get("/category-list",requireLogin,getCategoryList);
router.delete("/delete-category/:id",requireLogin,deleteCategory);

module.exports = router;
