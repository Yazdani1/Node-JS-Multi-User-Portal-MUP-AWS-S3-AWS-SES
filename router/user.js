const router = require("express").Router();

const {userRegistration,userLogin} = require("../controller/user");

router.post("/registration",userRegistration);
router.post("/login",userLogin);



module.exports = router;
