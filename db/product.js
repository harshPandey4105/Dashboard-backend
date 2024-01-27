const mongoose=require('mongoose');
const schema=new mongoose.Schema({
    name:String,
    userId:String,
    company:String,
    price:String,
    category:String
});
const productModel=mongoose.model('products',schema);

module.exports=productModel;