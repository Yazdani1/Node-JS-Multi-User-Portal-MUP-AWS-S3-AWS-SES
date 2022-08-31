var slugify = require("slugify");
const Category = require("../model/Category");
const Post = require("../model/Post");

// to create category

exports.createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName) {
      return res.status(422).json({ error: "please add a category name" });
    }

    const slug = slugify(categoryName);

    const alreadyExist = await Category.findOne({ categoryName });

    if (alreadyExist) {
      return res
        .status(422)
        .json({ error: "Category name already exist. try a new name" });
    }

    const category_details = Category({ categoryName, slug });

    const create_category = await Category.create(category_details);

    res.status(201).json(create_category);
  } catch (error) {
    return res.status(400).json({ error: "something went wrong" });
  }
};

// to get category lists

exports.getCategoryList = async (req, res) => {
  try {
    const list_of_category = await Category.find({}).sort({ date: "DESC" });
    res.status(200).json(list_of_category);
  } catch (error) {
    return res.status(400).json({ error: "something went wrong" });
  }
};

// to delete category

exports.deleteCategory = async (req, res) => {
  try {
    const delete_query = { _id: req.params.id };

    const delete_category = await Category.findByIdAndDelete(delete_query);

    return res.status(200).json(delete_category);
  } catch (error) {
    return res.status(400).json({ error: "Something went wrong" });
  }
};

// to get category info

exports.getCategoryDetails = async (req, res) => {
  try {
    const category_query = { slug: req.params.slug };

    const categoryInfo = await Category.findOne(category_query);

    return res.status(200).json(categoryInfo);
  } catch (error) {
    return res
      .status(404)
      .json({ error: "Something went wrong. could not found category" });
  }
};

// to get posts by category

exports.getPostsByCategory = async (req, res) => {
  try {
    const category_query = { slug: req.params.slug };

    const single_category = await Category.findOne(category_query);

    const postsbycategory = await Post.find({ categoryBy: single_category._id })
      .sort({ date: "DESC" })
      .populate("categoryBy", "_id categoryName slug date")
      .populate("postedBy", "_id name date slug");

    return res.status(200).json(postsbycategory);
  } catch (error) {
    return res.status(400).json({ error: "Something went wrong" });
  }
};
