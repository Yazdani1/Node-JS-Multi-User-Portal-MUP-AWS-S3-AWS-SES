const AWS = require("aws-sdk");
const { uuid } = require("uuidv4");
const slugify = require("slugify");

const Post = require("../model/Post");
require("dotenv").config();

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID_INFO,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_kEY_INFO,
  region: process.env.AWS_REGION_INFO,
  apiVersion: process.env.AWS_API_VERSION_INFO,
  correctClockSkew: true,
};

const S3 = new AWS.S3(awsConfig);

// to upload image to AWS S3

exports.uploadImage = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) return res.status(400).send("No Image");

    // prepare the image

    const base64Data = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const typess = image.split(";")[0].split("/")[1];

    // image params

    const params = {
      Bucket: "news-note",
      Key: `${uuid()}.${typess}`,
      Body: base64Data,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${typess}`,
    };

    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }
      res.send(data);
    });
  } catch (error) {
    return res.status(400).json({ error: "No Image" });
  }
};

// to create post

exports.createPost = async (req, res) => {
  try {
    const { title, des, image, categoryBy } = req.body;

    if (!title) {
      return res.status(422).json({ error: "Title is required" });
    }
    if (!categoryBy) {
      return res.status(422).json({ error: "Category is required" });
    }

    if (!image) {
      return res.status(422).json({ error: "Image is required" });
    }

    if (!des) {
      return res.status(422).json({ error: "Description is required" });
    }

    // to add slug for the post

    const slug = slugify(title);

    const title_already_exist = await Post.findOne({ title });

    if (title_already_exist) {
      return res
        .status(403)
        .json({ error: "Title already exist. try a new title" });
    }

    const post_details = Post({
      title,
      des,
      image,
      slug,
      categoryBy,
      postedBy: req.user,
    });

    const create_post = await Post.create(post_details);

    return res.status(201).json(create_post);
  } catch (error) {
    return res.status(400).json(error);
  }
};

// to get all user posts

exports.getAllUserPosts = async (req, res) => {
  try {
    const allPosts = await Post.find({})
      .sort({ date: "DESC" })
      .populate("categoryBy", "_id categoryName slug date")
      .populate("postedBy", "_id name date");

    return res.status(200).json(allPosts);
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Something went wrong, Could not load posts" });
  }
};

// to get logedin user post lists

exports.getLogedInUserPosts = async (req, res) => {
  try {
    const allPosts = await Post.find({ postedBy: req.user })
      .sort({ date: "DESC" })
      .populate("categoryBy", "_id categoryName slug date")
      .populate("postedBy", "_id name date");

    return res.status(200).json(allPosts);
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Something went wrong, Could not load posts" });
  }
};

// to delete post

exports.deletePosts = async (req, res) => {
  try {

    const delete_query = {_id: req.params.id}

    const delete_post = await Post.findByIdAndDelete(delete_query);

    return res.status(200).json({delete_post,message:"Post Deleted Successfully"})

  } catch (error) {
    return res
      .status(404)
      .json({ error: "Something went wrong, Could not find post id" });
  }
};
