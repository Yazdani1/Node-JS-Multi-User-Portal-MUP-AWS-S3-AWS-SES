const router = require("express").Router();

const {
  userRegistration,
  userLogin,
  getAllUsers,
  deleteUser,
  getSingleUserDetails,
  getSingleUserAllPosts,
} = require("../controller/user");
const { requireLogin } = require("../middleware/auth");

// user authentication

router.post("/registration", userRegistration);
router.post("/login", userLogin);

// to get user list

router.get("/all-user-lists", getAllUsers);

// to delete user

router.delete("/delete-user/:id", deleteUser);

// to get single user details

router.get("/user-details/:slug", getSingleUserDetails);

// to get single user published post

router.get("/user-posts/:slug", getSingleUserAllPosts);

module.exports = router;
