const express=require("express");
const Post=require("../../models/Post");
const Comment=require("../../models/Comment");
const {userAuthenticated} = require('../../helpers/authenticate-helper');
const router=express.Router();

// router.all('/*',userAuthenticated,(req, res, next)=>{

// });

router.get('/',(req,res)=>{
    // populating the comments section wirth only the comments that this user has done
    Comment.find({user:req.user.id}).populate('user')
    .then((comments)=>{
        res.render('admin/comments/index',{comments:comments});

    })
    
})

router.post("/",(req,res)=>{

    // finding on which the comment is made on
    Post.findOne({_id:req.body.id}).then((post)=>{

        console.log(post)
        // make a new comment using the comment form that was submitted
        const newComment=new Comment({
            user:req.user.id,
            body:req.body.body
        })

        // saving this comment in the comments array of post on which the comment is made
        post.comments.push(newComment);

        // save the modified post as it has now been commented on
        post.save().then((savedPost)=>{
            // saving the comment
            newComment.save().then((savedComment)=>{
                res.redirect(`/post/${post.id}`)
            })
        })





    })



    // res.send("comment submission works...")


})

router.delete("/:id",(req,res)=>{
    Comment.deleteOne({_id:req.params.id}).then((deletedComment)=>{

        // deleting comments from the post's comments array too
        Post.findOneAndUpdate({comments:req.params.id},{$pull:{comemnts:req.params.id}},(err,data)=>{
            if(err){
                return err;
            }
            res.redirect("/admin/comments");
        })
       
    })
    // res.send("DELETE COMMENTS WORKS...")
})

module.exports=router;