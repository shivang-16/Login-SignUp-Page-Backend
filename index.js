import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
const app = express();
const port =  5000;

mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName:"Login_Signup",
}).then(()=> console.log("Database connected")).catch((e)=> console.log(e))
   
const userSchema = new mongoose.Schema({
    name: String,
    phone: Number,
    email: String,
    password: String,
})
const user = mongoose.model("user", userSchema);


// app.use(express.static(path.resolve('public')))
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//custom middleware
const isAuthenticated = async (req, res, next)=>{
    const {token} = req.cookies;
        if(token){
            const decoded = jwt.verify(token, "khfjhsdfifhweihi");
            
            req.user = await user.findById(decoded._id)
            next()
        }
        else{
            res.render("signup")
        }
}
app.get('/', isAuthenticated, (req, res)=>{
    //    console.log(req.user)
       res.render("logout", {name: req.user.name})
})


//We can also use above code like this if we donot want to create custom middleware

// app.get('/',(req, res)=>{
//     const {token} = req.cookies;
//     if(token){
//         res.render("logout");
//     }
//     else{
//         res.render("login")
//     }
// })
app.post("/signup",async (req, res)=>{
    const{name, phone, email, password} = req.body
    let User= await user.findOne({email});
    if(User){
        return res.render("signup",{message:"Email already exist! Please Login"})
    }
    
    User = await user.create({
        name,
        phone,
        email,
        password,
    });
    const token =jwt.sign({_id: User._id}, "khfjhsdfifhweihi")
    res.cookie('token', token)
    res.redirect('/')
})
app.get("/login",(req, res)=>{
    res.render("login")
})
app.get('/logout',(req, res)=>{
    res.cookie('token', null, {
        expires: new Date(Date.now()),
    })
    res.redirect('/')
})
app.listen(port, ()=>{
    console.log(`Server is running at ${port}`)
})