require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

/* DB */
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log(err));

/* MODELS */
const User = mongoose.model("User", {
  name: String,
  email: String,
  password: String
});

const Issue = mongoose.model("Issue", {
  title: String,
  description: String,
  status: { type: String, default: "Open" },
  priority: String,
  assignedTo: String,
  createdAt: { type: Date, default: Date.now }
});

/* AUTH */
app.post("/register", async (req,res)=>{
  const hashed = await bcrypt.hash(req.body.password,10);
  const user = await User.create({...req.body,password:hashed});
  res.json(user);
});

app.post("/login", async (req,res)=>{
  const user = await User.findOne({email:req.body.email});
  if(!user) return res.send("User not found");

  const valid = await bcrypt.compare(req.body.password,user.password);
  if(!valid) return res.send("Invalid password");

  const token = jwt.sign({id:user._id},"secret");
  res.json({token});
});

/* CREATE ISSUE */
app.post("/issues", async (req,res)=>{
  const issue = await Issue.create(req.body);
  res.json(issue);
});

/* GET ISSUES */
app.get("/issues", async (req,res)=>{
  const issues = await Issue.find();
  res.json(issues);
});

/* UPDATE STATUS */
app.put("/issues/:id", async (req,res)=>{
  const updated = await Issue.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

/* DELETE ISSUE */
app.delete("/issues/:id", async (req,res)=>{
  await Issue.findByIdAndDelete(req.params.id);
  res.send("Deleted");
});

app.listen(5000, ()=>console.log("Server running on 5000"));
// DELETE bug
app.delete('/bugs/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await Bug.findByIdAndDelete(id);
        res.json({ message: "Bug deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting bug" });
    }
});
app.get('/bugs', async (req, res) => {
    const bugs = await Bug.find();
    res.json(bugs);
});