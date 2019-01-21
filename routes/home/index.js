const express=require('express');
const Post=require("../../models/Post");
const Category=require("../../models/Category");
const User=require("../../models/User");
const bcrypt=require("bcryptjs");
const passport=require('passport');
const localStrategy=require('passport-local').Strategy;
const router=express.Router();

router.get('/',(req,res)=>{
    //  creating a session
    // req.session.shisuke="shisuke";
    // console.log(`we found ${req.session.shisuke}`);
    

    //  getting all the posts and displaying them on screen
    Post.find({}).then((posts)=>{
        Category.find({}).then((categories)=>{
           
            res.render("layouts/home",{posts:posts,categories:categories});
            // res.render("home/index")
        })
    }).catch((err)=>{
        console.log("ERROR DUE TO ",err);
        res.send("COULD NOT FIND HOME PAGE");
    })
    // res.render("layouts/home",{posts:posts});
    
    })
    

    
    router.get('/about',(req,res)=>{
        res.render('home/about');
    })
    


    router.get('/home',(req,res)=>{
        res.render('layouts/home')
    })
    


    router.get('/login',(req,res)=>{
        res.render('home/login');
    })
    


    router.get('/register',(req,res)=>{
        res.render('home/register',{errors:[]});
    })


    router.get('/post/:id',(req,res)=>{
        // searching the database for that particular route
        Post.findOne({_id:req.params.id})
        .populate({path:"comments",populate:{path:"user",model:"users"}})
        .populate("user")
        .then((post)=>{
            console.log(post);

            Category.find({}).then((categories)=>{
                res.render("home/post",{post:post,categories:categories});

            });
 
           
        })
        // res.render("home/post");
    });

    router.get('/logout',(req,res)=>{
        req.logout();
        res.redirect('/login');
    })

    // POST ROUTES

    // submitting the registration form
    router.post("/register",(req,res)=>{

        // doind validation on the server side
        let errors=[];
        // HNADLING THE ERRORS

        if(!req.body.firstName){
            errors.push({message:"Please enter your first name"});
        }
       else if(!req.body.lastName){
            errors.push({message:"Please enter your last name"});
        }
       else if(!req.body.email){
            errors.push({message:"Please enter your email"});
        }
       else if(!req.body.password){
            errors.push({message:"Please enter your password"});
        }
       else if(!req.body.passwordConfirm){
            errors.push({message:"This field cannot be blank"});
        }
       else if(req.body.password!=req.body.passwordConfirm){
            errors.push({message:"The password fields cannot be blank"});
        }
        // responding to errors
        if(errors.length>0){
            // init={
            //     firstName:req.body.firstName,
            //     lastName:req.body.lastName,
            //     email:req.body.email
            // },
            
            res.render('home/register',{
                errors:errors,
                
            });
        }
        else{


            // Finding if the given user already exists
            User.findOne({email:req.body.email}).then((user)=>{
                // if the user is not present, register the user
                if(!user){
                         // creating a new user
        let newUser=new User({
            firstName:req.body.firstName,
            lastName:req.body.lastName,
            email:req.body.email,
            password:req.body.password
        });

        // hashing te password
        bcrypt.genSalt(10,(err,salt)=>{

            // creating the hash using theb generated salt
            bcrypt.hash(newUser.password,salt,(err,hash)=>{
                newUser.password=hash;
                  // saving the user
        newUser.save().then((savedUser)=>{
            req.flash("success_message",'You are now registered, please login')
            res.redirect('/login');
        }).catch((err)=>{
            res.send("USE COULDNOT REGISTER...")
        })
            })
        })
                }
                else{
                    // else user already has an account 
                    req.flash("validate_message",'This email is already taken, please try another email')
                    res.redirect('/register');
                }
            })
        }
    });
    //  serializing data
    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });

    // submitting the login form

    // using the password module

    // by default password module authenticates username , we have to change it so that it authenticates email by busing usernamefield
    passport.use(new localStrategy({usernameField:'email'},(email,password,done)=>{
        console.log(password);

        User.findOne({email:email}).then((user)=>{
            if(!user){
                return done(null,false,{message:"No user found..."});
                
            }

            // if user email is present in database then check if password is correct
            bcrypt.compare(password,user.password,(err,matchedUser)=>{
                if(err){
                    return err;
                }

                if(matchedUser){
                    return done(null,user);
                }
                else{
                    return done(null,false,{message:"Incorrect Password..."});
                }
            })

       
        // user.test();
            
        }).catch((err)=>{
            console.log("Couldnot login due to ",err);
        })

    }))

    router.post('/login',(req,res,next)=>{

        // using password module and password-local strategy to login
        passport.authenticate('local',{
            successRedirect:'/admin',
            failureRedirect:'/login',
            failureFlash:true
        })(req,res,next);
        // res.send("LOGIN POST WORKS")

    })

    module.exports=router;
    
    