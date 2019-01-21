 const path=require('path');

 module.exports={
    uploadDir: path.join(__dirname, '../public/uploads/'),
     isEmpty:function(obj){
        //  loop through object and find if it has any properties
        // if object is empty return true else false
        
    
        for(let key in obj){
            if(obj.hasOwnProperty(key)){
                return false;
            }

        }
        return true;
     }
 }