const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
//@desc Get all contacts 
//@route GET /api/contacts/
//@access private
const registerUser = asyncHandler(async (req, res) => {
    const  {name, email, password} = req.body;
    if(!name || !email || !password){
        res.status(400);
        throw new Error("All fields are mandatory.");
    }
    const userAvailable = await userModel.findOne({email});
    if(userAvailable){
        res.status(400);
        throw new Error("User already exists.");
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("The hashed password is ", hashedPassword);
    const user = await userModel.create({
        name,
        email,
        password: hashedPassword,
    });
    if (user){
        res.status(201).json({_id: user.id, email: user.email});
    }else{
        res.status(400);
        throw new Error("User data is not valid");
    }
    console.log("The user is ", user);
    res.status(200).json({ message: "Register the user." });
});
//@desc Get all contacts 
//@route GET /api/contacts/
//@access private
const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        res.status(400);
        throw new Error("All fields are mandatory.");
    }
    const user = await userModel.findOne({email});
    //compare password with hashed password
    
    if(user && (await bcrypt.compare(password, user.password))){
        const accessToken = jwt.sign({
            user: {
                name: user.name,
                email: user.email,
                id:user.id,
            },

        }, process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: "15m"}
        );
        res.status(200).json({ accessToken })
    }else{
        res.status(401);
        throw new Error("Email or password is not valid");
    }
});
//@desc Get all contacts 
//@route GET /api/contacts/
//@access private
const currentUser = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

module.exports = {registerUser, loginUser, currentUser};