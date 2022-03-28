const express = require("express");

const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const authenticate= require("./authenticate.js")
const app = express();

app.use(express.json());


const connect = () => {
    return mongoose.connect("mongodb://127.0.0.1:27017/unit4c4");

};

// user schema

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    versionKey: false,
    tipmestamps: true
});

userSchema.pre("save", function (next) {
    const hash = bcrypt.hashSync(this.password, 8);
    this.password = hash;
    return next();
});
userSchema.methods.checkPassword = function (password) {
    return bcrypt.compareSync(password, this.password); // true
}

// user model

const User = mongoose.model("user", userSchema);

// tode schema

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    }
}, {
    versionKey: false,
    tipmestamps: true
})

// todo model

const Todo = mongoose.model("todo", todoSchema);

app.post("/register", authenticate,async (req, res) => {
    try {
        let user = await User.findOne({
            email: req.body.email
        });

        if (user) {
            return res.status(400).send({
                message: "email is already exist"
            })
        }
        user = await User.create(req.body);
        const token = generateToken(user);
        res.status(200).send({
            user,
            token
        })
    } catch (err) {
        res.status(500).send({
            message: err.message
        })
    }
})

function generateToken(user) {
    return jwt.sign({
        user
    }, process.env.secret_key);
}


// login


app.post("/login",authenticate, async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.email
        });
        if (!user) {
            return res.status(400).send({
                message: "Wrong email or password"
            });

        }
        const match = user.checkPassword(req.body.password);
        if (!match) {
            return res.status(400).send({
                message: "Wrong email or password"
            })
        }
        const token = generateToken(user);
        return res.status(200).send({
            user,
            token
        })
    } catch (err) {
        res.status(400).send({
            message: err.message
        });
    }
})

// todo endpoint

app.get("/todos", async (req, res) => {
    try {
        const todos = await Todo.find().lean().exec();
        return res.status(200).send(todos);
    } catch (err) {
        return res.status(400).send({
            message: err.message
        });
    }
})

app.post("/todos", async (req, res) => {
    req.body.user_id= req.userID;
    try {
        const todos = await Todo.create(req.body);
        return res.status(200).send(todos);
    } catch (err) {
        return res.status(400).send({
            message: err.message
        });
    }
});

app.get("/todos/:id",async(req,res)=>{
    try {
        const todos = await Todo.findById(req.params.id).lean.exec();
        return res.status(200).send(todos);
    } catch (err) {
        return res.status(401).send({
            message: err.message
        });
    }
})

app.patch("/todos/:id",async(req,res)=>{
    try {
        const todos = await Todo.findByIdAndUpdate(req.params.id,req.body, {new:true}).lean.exec();
        return res.status(200).send(todos);
    } catch (err) {
        return res.status(401).send({
            message: err.message
        });
    }
});

app.delete("/todos/:id",async(req,res)=>{
    try {
        const todos = await Todo.findByIdAndDelete(req.params.id).lean.exec();
        return res.status(200).send(todos);
    } catch (err) {
        return res.status(401).send({
            message: err.message
        });
    }
})


app.listen(5000, async () => {
    try {
        await connect();
        console.log("listening on 5000")
    } catch (err) {
        console.error(err)
    }
})