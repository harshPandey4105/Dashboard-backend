const express = require('express');
const cors = require('cors');
const userModel = require('./db/user');
const productModel = require('./db/product')
const Jwt=require('jsonwebtoken');
const key="secretkey";
require("./db/config");

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const verifyToken=(req,res,next)=>{
  let token=req.headers['authentication'];
  if(token){
    Jwt.verify(token,key,(err,valid)=>{
      if(err){
        res.send("Please add valid token");
      }
      next();
    })
  }
  else{
    res.send("Please add token");
  }
}

app.post('/signup',async (req, res) => {
  const data = new userModel(req.body);
  let user = await data.save();
  user = user.toObject();
  delete user.password
  Jwt.sign({user},key,{expiresIn:'24h'},(err,token)=>{
    if(err){
      res.send("Something went wrong");
    }
    res.send({user,auth:token});
  })
})

app.post('/login',async (req, res) => {
  if (req.body.email && req.body.password) {
    let user = await userModel.findOne(req.body).select('-password');
    if(user){
      Jwt.sign({user},key,{expiresIn:'24h'},(err,token)=>{
          if(err){
              res.send("Something went wrong");
          }
          res.send({user,auth:token});
      })
    }
  }
  else {
    res.send('Wrong email and password');
  }
})

app.post('/add-product', async (req, res) => {

  if (req.body.name != '' && req.body.name != null) {
    let productData = new productModel(req.body);
    let result = await productData.save();
    res.send(result);
  }
  else {
    console.log('please enter proper data');
  }
})

app.get('/products',verifyToken, async (req, res) => {
  const products = await productModel.find();
  if (products.length < 1) {
    res.send({ result: 'No product is found' });
  }
  else {
    res.send(products);
  }
})

app.delete('/delete/:id',verifyToken, async (req, res) => {
  const result = await productModel.deleteOne({ _id: req.params.id });
  res.send(result);
})

app.get('/products-update-list/:id',verifyToken, async (req, res) => {
  const result = await productModel.findOne({ _id: req.params.id });
  if (result) {
    res.send(result);
  }
  else {
    res.send("No result found in database");
  }
})

app.put('/product-update/:id',verifyToken,async (req, res) => {
  const result = await productModel.updateOne(
    { _id: req.params.id }, { $set: req.body }
  )
  res.send(result);
})

app.get('/search/:key',verifyToken,async (req, res) => {
  const result = await productModel.find({
    "$or": [
      { name: { $regex: req.params.key } },
      { price: { $regex: req.params.key } },
      { company: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
    ]
  })
  res.send(result);
})

app.listen(port, () => {
  console.log(`api is running on port ${port}`);
})