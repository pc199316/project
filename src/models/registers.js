
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
const res = require("express/lib/response");
const schema = mongoose.Schema;

const userSchema = new schema({
    firstname: {
        type: String,
        required: true,
        minlength: 3
    },
    lastname: {
        type: String,
        required: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        validator(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email ID")
            }
        }
    },
    gender: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
        min: 10,

    },
    password: {
        type: String,
        required: true,
        min: 8
    },
    confirmpassword: {
        type: String,
        required: true,
        min: 8
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

userSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id.toString() }, process.env.secret_key);
        this.tokens = this.tokens.concat({ token: token })
        return token
        await this.save();

        // console.log(token)
    } catch (error) {
        res.send('the error part' + error);
        console.log('the error part' + error)
    }
}




userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        // const passwordHash = await bcrypt.hash(password, 10);
        // console.log(`the current password is ${this.password}`);
        this.password = await bcrypt.hash(this.password, 10);
        this.confirmpassword = await bcrypt.hash(this.password, 10);
    }
    next();
})




const Register = new mongoose.model('Register', userSchema);
module.exports = Register;