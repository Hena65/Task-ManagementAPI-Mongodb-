const mongoose = require("mongoose");

const taskschema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "in progress", "complete"],
      default: "pending",
      index: true,
    },
    assignedto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
taskschema.pre("save", function (next) {
  console.log("saving task: ", this.title);
  next();
});

taskschema.post("save", function (doc) {
  console.log("successfully saved: ", doc.title);
});

taskschema.methods.iscomplete = async function () {
  return this.status === "complete";
};

taskschema.methods.markcomplete = async function () {
  this.status = "complete";
  return await this.save();
};

module.exports = mongoose.model("task", taskschema);
