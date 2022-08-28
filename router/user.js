const router = require("express").Router();

const {userRegistration,userLogin,logedInuser} = require("../controller/user");
const { requireLogin } = require("../middleware/auth");

router.post("/registration",userRegistration);
router.post("/login",userLogin);

// to get loged in user informtion

router.get("/loged-inuser",requireLogin,logedInuser)



module.exports = router;
