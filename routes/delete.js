const express=require('express');
const app=express();

app.use(express());



app.listen(4000,()=>{
    console.log("Api is running on port 4000");
})