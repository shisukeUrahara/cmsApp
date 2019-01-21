const express=require('express');
const ejs=require('ejs');
const path=require('path');
const fs=require('fs');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const methodOverride=require("method-override");
const upload=require('express-fileupload');
const session =require('express-session');
const flash=require('connect-flash');
const {mongoDbUrl}=require("./config/database");
const passport=require('passport');
const localStrategy=require('passport-local').Strategy;

// connecting to database
mongoose.connect(mongoDbUrl,{useNewUrlParser:true}).then((db)=>{
    console.log("CONNECTED TO DATABASE.....");
}).catch((err)=>{
    console.log("COULDNOT CONNECT TO DATABASE.....",err);
})


const app=express();

// using middlewares

app.use(session({

    secret:"senbonzakuraKageyoshi",
    resave:true,
    saveUninitialized:true
}));

app.use(flash());

// Passport initializing
app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next)=>{
    //  req.user is a session that we can access anywhere
    res.locals.user=req.user||null;
    // this message is flashed when password is wrong
    res.locals.error=req.flash("error");


    res.locals.success_message=req.flash("success_message");
    res.locals.update_message=req.flash("update_message");
    res.locals.delete_message=req.flash("delete_message");
    res.locals.validate_message=req.flash("validate_message");
   
    next();
})

app.use(express.static(path.join(__dirname,'./public')));
app.use(upload());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// using helper functions
const {select}=require('./helpers/ejs-helpers');
const {generateDate}=require('./helpers/ejs-helpers');
app.locals.select=select;
app.locals.generateDate=generateDate;





app.listen(8000,()=>{
    console.log('SERVER IS RUNNING...');
})

// setting view engines
app.set('view engine','ejs')
// loading routes
const home=require('./routes/home/index');
const admin=require('./routes/admin/index');
const posts=require('./routes/admin/posts');
const categories=require('./routes/admin/categories');
const comments=require('./routes/admin/comments');
//  home and admin routes as middlewares

// loading routes
app.use('/',home);
app.use('/admin',admin);
app.use('/admin/posts',posts);
app.use('/admin/categories',categories);
app.use('/admin/comments',comments);

// using routes

app.get('/admin',(req,res)=>{
    res.render('layouts/admin');
})

// using categories