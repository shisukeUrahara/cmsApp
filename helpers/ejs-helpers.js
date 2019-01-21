const moment=require("moment");
module.exports={

select:function(param1){
    console.log(param1);
    // return 'Private';
},
generateDate:function(date,format){
    return moment(date).format(format);
}

}