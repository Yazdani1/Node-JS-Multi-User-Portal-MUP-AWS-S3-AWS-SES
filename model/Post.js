const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

var postSchema = mongoose.Schema({
  title: {
    type: String,
  },
  des: {
    type: String,
  },

  slug: {
    type: String,
    lowercase: true,
    unique: true,
    index: true,
  },

  image: {},

  categoryBy: {
    type: ObjectId,
    ref: "Category",
  },

  postedBy: {
    type: ObjectId,
    ref: "User",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", postSchema);
