let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let cors = require('cors')
let dotenv = require('dotenv');
dotenv.config()
let port = process.env.PORT || 9870;
let mongo = require('mongodb');
const { application } = require('express');
let MongoClient = mongo.MongoClient;
//  let mongoUrl = process.env.MongoUrl;
let mongoUrl = process.env.MongoLiveUrl;
let db;

// let authKey = "96"

// function auth(key){
//   if(authKey == key){
//     return true
//   }else{
//     return false
//   }
// }
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cors())

app.get('/',(req,res) => {
    res.send("Express Default")
}) 

app.get('/items/:collections',(req,res) => {
  db.collection(req.params.collections).find().toArray((err,result) => {
    if(err) throw err;
    res.send(result)
  })
})

app.get('/location',(req,res) => {
  db.collection('location').find().toArray((err,result) => {
    if(err) throw err;
    res.send(result)
  })
})





app.get('/filter/:mealId',(req,res)=>{
  let sort = {cost:1}
  let mealId = Number(req.params.mealId)
  let cuisineId = Number(req.query.cuisineId)
  let lcost = Number(req.query.lcost)
  let hcost = Number(req.query.hcost)
  let query={}
  if(req.query.sort){
    sort={cost:req.query.sort}
  }
  else if(lcost && hcost && cuisineId){
    query={
      "mealTypes.mealtype_id":mealId,
      $and:[{cost:{$gt:lcost,$lt:hcost}}],
      "cuisines.cuisine_id":cuisineId
   }
  }
  else if(lcost && hcost){
    query={
      "mealTypes.mealtype_id":mealId,
      $and:[{cost:{$gt:lcost,$lt:hcost}}]
   }
  }
  else if(cuisineId){
  query = {
  "mealTypes.mealtype_id":mealId,
  "cuisines.cuisine_id":cuisineId
  }
  }else{
  query={
  "mealTypes.mealtype_id":mealId
  }
}
  db.collection('restaurants').find(query).sort(sort).toArray((err,result) => {
  // db.collection('mealtype').find().toArray((err,result) => {  
    if(err) throw err;
    res.send(result)
  })
})

app.get('/restaurants',(req,res)=>{
  let stateId = Number(req.query.stateId)
  let mealId = Number(req.query.mealId)
  let query = {}
  if(stateId && mealId){
    query = {state_id:stateId,'mealTypes.mealtype_id':mealId}
  }
  else if(stateId){
    query={state_id:stateId}
 }else if(mealId){
   query={'mealTypes.mealtype_id':mealId}
 }
  db.collection('restaurants').find(query).toArray((err,result) => {
    if(err) throw err;
    res.send(result)
  })
})

app.get('/menu',(req,res) => {
  db.collection('menu').find().toArray((err,result) => {
    if(err) throw err;
    res.send(result)
  })
})
  
  // let id = req.params.id;
  // let state = req.query.state
  // let country = req.query.country
  // console.log('>>>>State>>>>',state)
  // console.log('>>>>Country>>>>',country)
  // res.send(id)

app.get('/quicksearch',(req,res) => {
  db.collection('mealtype').find().toArray((err,result) => {
    if(err) throw err;
    res.send(result)
  })
})

// app.get('/details/:id',(req,res)=>{
//   let id=mongo.ObjectId(req.params.id)
//   db.collection('restaurants').find({_id:id}).toArray((err,result)=>{
//         if(err)throw err;
//          res.send(result)
//   })
// })
  // 
  // app.get('/details',(req,res)=>{
  //   let Id = Number(req.query.Id)
  //   let query = {}
  //   if(Id){
  //     query = {restaurant_id:Id}
  //   }
  //  db.collection('restaurants').find(query).toArray((err,result)=>{
  //     if(err)throw err;
  //     res.send(result)
  //  })
  // })                                  I
  app.get('/details/:id',(req,res)=>{
    let id = Number(req.params.id)
   db.collection('restaurants').find({restaurant_id:id}).toArray((err,result)=>{
      if(err)throw err;
      res.send(result)
   })
  })
  
  app.get('/menu/:id',(req,res) => {
    let id = Number(req.params.id)
    db.collection('menu').find({restaurant_id:id}).toArray((err,result) => {
      if(err) throw err;
      res.send(result)
    })
  })

  app.post('/menuItem',(req,res) => {
    if(Array.isArray(req.body)){
    db.collection('menu').find({menu_id:{$in:req.body}}).toArray((err,result) => {
      if(err) throw err;
      res.send(result)
    })
    
  }else{
    res.send("Invalid Input")
  }
  })
  

  app.get('/orders',(req,res) => {
    let email = req.query.email;
    let query = {}
    if(email){
      //query = {email:email}
      query = {email}
    }
    db.collection('order').find(query).toArray((err,result) => {
      if(err) throw err;
      res.send(result)
    })
  })

    app.post('/placeOrder',(req,res)=>{
      console.log(req.body)
      db.collection('order').insert(req.body,(err,result)=>{
        if(err)throw err;
        res.send(result)
      })
    })

    app.put('/UpdateOrder/:id',(req,res)=>{
      let oid = Number(req.params.id);
      db.collection('order').updateOne(
        {orderId:oid},
        {
          $set:{
            "status":req.body.status,
            "bank_name":req.body.bank_name,
            "date":req.body.date
          }
        },(err,result)=>{
          if(err) throw err;
          res.send('Order Updated')
        }
      )
    })

    app.delete('/deleteOrder/:id',(req,res)=>{
      let oid = mongo.ObjectId(req.params.id)
      db.collection('order').remove({_id:oid},(err,result)=>{
        if(err)throw err;
        res.send('Order Deleted')
      })
    })
    



//Connection with db
MongoClient.connect(mongoUrl,(err,client) => {
  if(err) console.log('Error While Connecting');
  db = client.db('febintern');
  // db = client.db('internfeb');
  app.listen(port,(err)=>{
      if(err)throw err;
      console.log(`Express Server listening on port${port}`)
  })
})





