const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const User = require("../model/User");

require("dotenv").config();

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID_INFO,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_kEY_INFO,
  region: process.env.AWS_REGION_INFO,
  apiVersion: process.env.AWS_API_VERSION_INFO,
  correctClockSkew: true
  
};

const SES = new AWS.SES(awsConfig);


exports.userRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Please Add Your Full Name" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ error: "Please Add Your valid E-mail Address" });
    }
    if (!password) {
      return res.status(400).json({ error: "Please Add Your Password" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exist" });
    }
    const hash_password = await bcrypt.hash(password, 10);

    userDetails = new User({
      name,
      email,
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
          Data: "Welcome : "+name,
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
          Data: "Welcome Back: "+email,
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
