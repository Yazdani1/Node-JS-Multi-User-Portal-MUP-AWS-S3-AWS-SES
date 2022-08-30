const router = require("express").Router();

const {userRegistration,userLogin,getAllUsers,deleteUser} = require("../controller/user");
const { requireLogin } = require("../middleware/auth");



// user authentication

router.post("/registration",userRegistration);
router.post("/login",userLogin);


// to get user list

router.get("/all-user-lists",getAllUsers);

// to delete user

router.delete("/delete-user/:id",deleteUser);






module.exports = router;
