const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const slugify = require("slugify");
const User = require("../model/User");
const Post = require("../model/Post");

require("dotenv").config();

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID_INFO,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_kEY_INFO,
  region: process.env.AWS_REGION_INFO,
  apiVersion: process.env.AWS_API_VERSION_INFO,
  correctClockSkew: true,
};

const SES = new AWS.SES(awsConfig);

// to register

exports.userRegistration = async (req, res) => {
  try {
    const { name, email, profession, password } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Please Add Your Full Name" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ error: "Please Add Your valid E-mail Address" });
    }

    if (!profession) {
      return res.status(400).json({ error: "Please select profession" });
    }

    if (!password) {
      return res.status(400).json({ error: "Please Add Your Password" });
    }

    const slug = slugify(name);

    const alreadyExist = await User.findOne({ name });

    if (alreadyExist) {
      return res
        .status(422)
        .json({ error: "User name already exist. try a different name" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exist" });
    }
    const hash_password = await bcrypt.hash(password, 10);

    userDetails = new User({
      name,
      email,
      slug,
      profession,
      password: hash_password,
    });

    const params = {
      Source: process.env.EMAIL_FROM_INFO,
      Destination: {
        ToAddresses: [process.env.EMAIL_FROM_INFO],
      },
      ReplyToAddresses: [email],
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
              <html>
                <h1 style={{color:"red"}}>You have Successfully Registered to This Multiuser Portal APP</h1>
                <p>Log in to your profile now</p>
              </html>
              `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Welcome : " + name,
        },
      },
    };

    const emailSent = SES.sendEmail(params).promise();

    const createUserAccount = await User.create(userDetails);

    res
      .status(201)
      .json({ createUserAccount, message: "Account Created Successfully" });
  } catch (err) {
    return res.status(400).json({ error: "Account could not create" });
  }
};

// to log in

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: "add your register email" });
    }

    if (!password) {
      return res.status(400).json({ error: "add your password" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Account could not found " });
    }

    const isMatchData = await bcrypt.compare(password, user.password);
    if (!isMatchData) {
      return res.status(400).json({ error: "Wrong password" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // to send email using aws service

    const params = {
      Source: process.env.EMAIL_FROM_INFO,
      Destination: {
        ToAddresses: [process.env.EMAIL_FROM_INFO],
      },
      ReplyToAddresses: [email],
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
              <html>
                <h1 style={{color:"red"}}>You have Signed In to this account</h1>
                <p>Visit your profile</p>
              </html>
              `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Welcome Back: " + email,
        },
      },
    };

    const emailSent = SES.sendEmail(params).promise();

    user.password = undefined;
    user.expireToken = undefined;
    user.resetToken = undefined;

    return res.status(200).json({ token, user });
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Something Went Wrong, Could not Log In" });
  }
};

// to get all user lists

exports.getAllUsers = async (req, res) => {
  try {
    const userlists = await User.find({})
      .sort({ date: "DESC" })
      .select("-password");

    return res.status(200).json(userlists);
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Something Went Wrong, Could not find users" });
  }
};

// to delete user list

exports.deleteUser = async (req, res) => {
  try {
    const deleteQuery = { _id: req.params.id };

    const deleteuser = await User.findByIdAndDelete(deleteQuery);

    return res.status(200).json(deleteuser);
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Something Went Wrong, Could not find users" });
  }
};

// to get single user list

exports.getSingleUserDetails = async (req, res) => {
  try {
    const user_query = { slug: req.params.slug };

    const userdetails = await User.findOne(user_query).select("-password");

    return res.status(200).json(userdetails);
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Something Went Wrong, Could not find user" });
  }
};

// single user all posts

exports.getSingleUserAllPosts = async (req, res) => {
  try {
    const user_query = { slug: req.params.slug };

    const userinfo = await User.findOne(user_query);

    const userposts = await Post.find({ postedBy: userinfo._id })
      .sort({ date: "DESC" })
      .populate("categoryBy", "_id categoryName slug date")
      .populate("postedBy", "_id name date slug");

    return res.status(200).json(userposts);
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Something Went Wrong, Could not find posts" });
  }
};
