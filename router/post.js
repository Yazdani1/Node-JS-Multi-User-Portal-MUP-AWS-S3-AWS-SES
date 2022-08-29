const router = require("express").Router();

const {uploadImage,createPost,getAllUserPosts,getLogedInUserPosts,deletePosts,getDetailsPost} = require("../controller/post");
const { requireLogin } = require("../middleware/auth");


// to upload image to aws s3 
router.post("/upload-image",requireLogin,uploadImage);

// to create post

router.post("/create-post",requireLogin,createPost);

// to get all the user post lists
router.get("/get-all-posts",getAllUserPosts);

// to get loged in user post lists

router.get("/logedin-user-posts",requireLogin,getLogedInUserPosts);

// to delete post
router.delete("/delete-post/:id",requireLogin,deletePosts);

// details post, related post by category and more posts by the same user

router.get("/details-post/:slug",getDetailsPost);

module.exports = router;
