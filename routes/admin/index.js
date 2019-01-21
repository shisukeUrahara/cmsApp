const express=require('express');
const faker=require("faker");
const Post=require("../../models/Post");
const router=express.Router();

// const {userAuthenticated}=require('../../helpers/authenticate-helper');
// router.all("/*",userAuthenticated,(req,res,next)=>{
    
// })

// making the admin routes
router.get('/',(req,res)=>{
// res.render('admin/index');
res.render('layouts/admin');

});

// POST routes
router.post("/generate-fake-posts",(req,res)=>{
    // taking the user input and creating that many fake posts
    for(let i=0;i<parseInt(req.body.amount);i++){
        // console.log("HELLO")
        // creating blueprint of new post
    let newPost=new Post();

    // generating  fake new post
    newPost.title=faker.name.title();
    newPost.status="public";
    newPost.allowComments=faker.random.boolean();
    newPost.body=faker.lorem.sentence();

    // saving the post
    newPost.save((err)=>{
        if(err){
            throw err;
            // res.send("COULD NOT CREATE POSTS...");
        }
    })

    }
    
    res.redirect('/admin/posts');
})

module.exports=router;