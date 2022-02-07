require('dotenv').config()
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
require("./src/db/conn");
const Register = require("./src/models/registers")
const app = express();
const hbs = require("hbs");
const cookieparser = require("cookie-parser");
const auth = require("./src/middleware/auth")
const { registerPartials } = require("hbs");
const exp = require("constants");
const async = require("hbs/lib/async");
const { default: isMobilePhone } = require("validator/lib/isMobilePhone");
const { cookie } = require('express/lib/response');


const port = process.env.PORT || 3000;

//setting the path
const staticpath = path.join(__dirname, "./public");
const templatepath = path.join(__dirname, "./templates/views");
const partialpath = path.join(__dirname, "./templates/partials");


app.use('/css', express.static(path.join(__dirname, "../node_modules/bootstrap/dist/css")));
app.use('/js', express.static(path.join(__dirname, "../node_modules/bootstrap/dist/js")));
app.use('/jq', express.static(path.join(__dirname, "../node_modules/jquery/dist")));
app.use(express.json());
app.use(cookieparser());

app.use(express.urlencoded({ extended: false }))
app.use(express.static(staticpath));
app.set("view engine", "hbs");
app.set("views", templatepath);
hbs.registerPartials(partialpath);





app.get("/", (req, res) => {
    res.render("index");
})

app.get("/secret", auth, (req, res) => {
    // console.log(`this is the cookie${req.cookies.jwt}`);
    res.render("secret");
})

app.get("/Logout", auth, async (req, res) => {
    try {
        res.clearCookie("jwt");
        console.log("logout successfully")
        await req.user.save();

    } catch (error) {
        res.status(401).send(error);
    }
    res.render("index");
})


// app.get("/contact", (req, res) => {
//     res.render("contact");
// })

app.get("/about", (req, res) => {
    res.render("index");
})

app.get("/service", (req, res) => {
    res.render("service");

})

app.get("/register", (req, res) => {
    res.render("register");
})

app.get("/login", (req, res) => {
    res.render("login");
})

app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        if (password === cpassword) {
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword
            })
            // console.log("the success part" + registerEmployee);
            const token = await registerEmployee.generateAuthToken();

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 60000),
                httpOnly: true
            })

            console.log(cookie);

            // console.log("the token part" + token)
            const registered = await registerEmployee.save();
            // console.log("the page part" + registered)
            res.status(201).render("index");

        } else {
            res.send("password not matching")
        }

    } catch (error) {
        res.status(400).send(error)
    }
})

app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({ email: email });
        const isMatch = await bcrypt.compare(password, useremail.password);

        const token = await useremail.generateAuthToken();
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 80000),
            httpOnly: true
        })


        if (isMatch) {
            res.status(201).render("profile");
        } else {
            res.send("login credentials not matching")
        }


        // if (useremail.password === password) {
        //     res.status(201).render("profile");
        // } else {
        //     res.send("login credentials not matching")
        // }
        // res.send(useremail.password);
        // console.log(useremail)
        // res.status(201).render("index");
    } catch (error) {
        res.status(400).send("login credentials not matching")
    }
})







// app.post("/contact", async (req, res) => {
//     try {
//         // res.send(req.body)
//         const userData = new User(req.body);
//         await userData.save();
//         // res.send(req.body);
//         res.status(201).render("index");

//     } catch (error) {
//         res.status(500).send(error);

//     }

// })

// app.get("/register", async (req, res) => {
//     // try {
//     // res.send(req.body)
//     // const userData = new User(req.body);
//     // await userData.save();
//     // res.send(req.body);
//     res.status(201).render("index");

//     // } catch (error) {
//     //     res.status(500).send(error);

//     // }

// })



app.listen(port, () => {
    console.log(`listening to port number ${port}`);
})