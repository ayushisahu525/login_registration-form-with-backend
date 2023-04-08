require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs"); //partial files ka btana hoga express ko
const port = process.env.PORT || 8000;
require("./db/conn");
const Register = require("./models/registers");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');

const static_path = path.join(__dirname, "../public")
const template_path = path.join(__dirname, "../template/views")  //ab views ka path ye h ab hume express ko btana hoga
const partials_path = path.join(__dirname, "../template/partials")
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false})); 
 //form ke data ko get kr rhe yha postman nhi use ho rha

// app.use(express.static(static_path)) //iski vjah se index.html file show ho rha jo ki static h 


app.set('view engine', "hbs")
app.set("views", template_path);
// app.get("/", (req, res) => {
//     res.send("hello")
// });
hbs.registerPartials(partials_path);

// console.log(process.env.SECRET_KEY);


app.get("/", (req, res) => {
     res.render("index");
 });

//auth is middleware
 app.get("/secret", auth, (req, res) => {

    // console.log(`this is the cookie ${req.cookies.jwt}`);   //req.cookies.jwt is used to get the token from the cookie
    res.render("secret");
});

 app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/logout", auth , async(req, res) => {
    try {
        //for single logout
        // req.user.tokens = req.user.tokens.filter((currElement) => {
        //     return currElement.token != req.token      //req.token humara current token h jo login krte waqt generate hua or vo delete ho jayega database me se
        // })




        //logout from all devices, database se saare tokens hat jaynge

        req.user.tokens = [];



    
        res.clearCookie("jwt");
        console.log("logout successfully")

        await req.user.save();
        res.render("login");



    } catch (error) {
        res.status(500).send(error);
    }

})


 app.get("/register", (req, res) => {
    res.render("register");
});

//create a new user in our database
app.post("/register", async(req, res) => {

        try{
        const password = req.body.password; //req.body.name h input field ka
        const cpassword = req.body.confirmpassword

        //registerEmployee collection nhi h ye Register collection ka ek instance h

        if(password == cpassword){
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword
            })

            const token = await registerEmployee.generateAuthToken()
            console.log(" the token part  " + token);
            
            //res.cookie() function is used to set the cookie name to value.
            // the value parameter may be a string or object converted to json 
            //syntax res.cookie(name, value, [options])

            //adding token to cookie

            
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 600000),
                httpOnly: true
            });

            




            //password hash
            const registered = await registerEmployee.save()
            res.status(201).render("index");

        }
        else{
            res.send("invalid details")
        }
    
        }
        catch(e){
            res.status(400).send(e);
        }
});

app.post("/login", async(req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({email:email});
        // res.send(useremail);
        // res.send(useremail.password);
        const isMatch = await bcrypt.compare(password, useremail.password);
        const token = await useremail.generateAuthToken();
        console.log(" the token part  " + token);

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 600000),
            httpOnly: true
        });

        


        if(isMatch){
            res.status(201).render("index");
        }
        else{
            res.send("invalid details");
        }



        // if(useremail.password === password){
        //     res.status(201).render("index");
        // }
        // else{
        //     res.send("password are not matching");
        // }
//hume password is noot matching nhi likhna h kyuki koi ananoymous insaan login kr rha hoga to usko pta lg jayega ki email sahi hai

        //check krna hai ki vo email id registered h ki nhi database me jo register kiye honge vhi login kar skte hai
    } catch (e) {
        res.status(400).send("invalid details");
    }
    
});


// bcrypt ek hashing algorithm hai 
// ye hashing one way communication hai isko koi dcrypt nhi kr skta


// const bcrypt = require('bcryptjs');

// const securePassword = async (password) =>{
//     const passwordHash = await bcrypt.hash(password, 10);
//     console.log(passwordHash);

//     const passwordmatch = await bcrypt.compare("thapa89", passwordHash );
//     console.log(passwordmatch);

//thapa89 vo password h jo login form me enter kr rha person


// }
// securePassword("thappa@123");


//jb user register krta h to ek token id generate krte h hum authentiation ke liye taki dubara vo user aay to pta lg jaye ki ye vhi user hai
// jaise ki amazon me login krke agr hm kuch add to cart krte h to dubara aane pr vhi milta h kyuki vo hmari cookies me store ho jata h history ki tarah ab hume vhi chiz milti h jo hm previously chhod rakhe hote h, ye sb authentication ki vjah se hota h, token verify hota h, same user aaya h ki nhi uske liye authentication hota h
// expiry time bhi add kr skte h to us typ k bad automatically logout ho jayega or waps login krna hoga
// const jwt = require('jsonwebtoken');

// const createToken = async() => {
//    const token = await jwt.sign({_id: "63a2be2777347d2d2373c00b"}, "mynameisayushisahuiamstudyinginjssatencollegenoida", {
//     expiresIn: "2 seconds"
//    });
//    console.log(token);

//    const userVer = await jwt.verify(token, "mynameisayushisahuiamstudyinginjssatencollegenoida");
//    console.log(userVer);


// }
// createToken();
    


app.listen(port, () => {
    console.log(`listening on port ${port}`);
})

