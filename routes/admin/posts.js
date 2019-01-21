const express=require('express');
const Post=require("../../models/Post");
const fs=require("fs");
const Category=require("../../models/Category");
const {userAuthenticated}=require('../../helpers/authenticate-helper');
const router=express.Router();

// using helper functions
const {isEmpty,uploadDir}=require('../../helpers/upload-helper');
// router.locals.isEmpty=isEmpty;

// router.all("/*",userAuthenticated,(req,res,next)=>{
    
// })

// get routes
router.get('/',(req,res)=>{
    // getting all posts from the database
     Post.find({}).populate('category').then((posts)=>{
        res.render('admin/posts/index',{posts:posts});
        // console.log(posts);
    
     }).catch((err)=>{
         res.send("ERROR IN LOADING POSTS")
     })
     
    // // rendering all the posts on screen
    // res.render('admin/posts');
})

// wtaching only those posts thjat the logged in user have posted
router.get("/my-posts",(req,res)=>{

    Post.find({user:req.user.id})
    .populate('category').then((posts)=>{
        // console.log(posts);
        res.render('admin/posts/my-posts',{posts:posts});
     }).catch((err)=>{
         res.send("ERROR IN LOADING POSTS");
     })
     

})

// router.get('/',(req,res)=>{
//     res.render('admin/posts/showPosts')
// })


router.get('/create',(req,res)=>{
    // getting all categories and passing them to create form select tag
    Category.find({}).then((categories)=>{
        res.render('admin/posts/create',{errors:[],categories:categories});

    })
   
})

router.get('/edit/:id',(req,res)=>{
    // res.send(req.params.id);

    // finding all posts and rendering them
    Post.findOne({_id:req.params.id}).then((post)=>{


        Category.find({}).then((categories)=>{
            res.render('admin/posts/edit',{post:post,categories:categories});
        })
    
    })

})

// post routes

router.post('/create',(req,res)=>{


    // validation for create post form
    let errors=[];
    //  validation for ythe title
    if(!req.body.title){
        errors.push({message:"PLEASE ADD A TITLE"});
    }
    if(!req.body.body){
        errors.push({message:"PLEASE ADD A DESCRIPTION"});
    }
    
    

    if(errors.length>0){
        // if there are errors  do this
        res.render("admin/posts/create",{errors:errors})
    }
    else{
        let fileName="No Image";

    if(!isEmpty(req.files)){
        let file=req.files.file;
         fileName=Date.now()+"_"+file.name;
    file.mv('./public/uploads/'+fileName,(err)=>{
        if(err){
            throw err;
        }
    })
    }
    else{
        console.log("FILE IS EMPTY");
    }
    // allow comments is a string and hence would be on or off and not true or false so we have to convert it to boolean
    let allowComments=false;
    if(req.body.allowComments){
        allowComments=true;
    }else{
        allowComments=false;
    }

    // creating a new post using the Post model we have made
    const newPost=new Post({
        user:req.user.id,
        title:req.body.title,
        status:req.body.status,
        allowComments:allowComments,
        body:req.body.body,
        file:fileName,
        category:req.body.category
    });

    // saving the new made post
    newPost.save().then((savedPost)=>{

        req.flash('success_message',`post ${savedPost.title} was created successfully`);
        res.redirect('/admin/posts');
    }).catch((err)=>{
        console.log("COULD NOT SAVE POST...");
        res.send("COULD NOT SAVE POSTS...");
    })



    }




  
})

// PUT ROUTES
router.put('/edit/:id',(req,res)=>{

    Post.findOne({_id:req.params.id}).then((post)=>{
        // changing allowComments yes or no string value to Boolean
        let allowComments=false;
    if(req.body.allowComments){
        allowComments=true;
    }else{
        allowComments=false;
    };
    // updating the database
    post.user=req.user.id;
    post.title=req.body.title;
    post.status=req.body.status;
    post.allowComments=allowComments;
    post.body=req.body.body;
    post.category=req.body.category;

    // editing the image
    let fileName="No Image";

    if(!isEmpty(req.files)){
        let file=req.files.file;
         fileName=Date.now()+"_"+file.name;
         post.file=fileName;
    file.mv('./public/uploads/'+fileName,(err)=>{
        if(err){
            throw err;
        }
    })
    }
    // Saving the post
    post.save().then((updatedPost)=>{
        // res.send("POST UPDATED...");
        req.flash('update_message',`post ${updatedPost.title} was updated successfully`);
        res.redirect('/admin/posts/my-posts');
    }).catch((err)=>{
        console.log(err)
        res.send("COULD NOT UPDATE THE POST ");
    })


    }).catch((err)=>{
        console.log("ERROR FINDING THE POST IN DATABASE ",err);
    })

    // res.send("SUBMITTING EDITTED FORM WORKS");
})



// DELETE ROUTES
router.delete('/:id',(req,res)=>{
//    populate is to delete corresponding comments along with the post
    Post.findOne({_id:req.params.id}).populate('comments')
    .then ((post)=>{


        // deleting the corresponding image from the uploads folder
        fs.unlink(uploadDir+post.file,(err)=>{

            // check if this post has comments
            if(post.comments.length>0){
                // loop through comments array and delete all comments
                post.comments.forEach((comment)=>{
                    comment.delete();

                })
            }

            // deleting the corresponding picture
            post.delete();
            req.flash("success_message","Post was successfully deleted");
            res.redirect("/admin/posts/my-posts");
        })
      
    }).catch((err)=>{
        res.send("COULD NOT DELETE POST....",err);
    })
})
module.exports=router;