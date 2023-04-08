const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
// mongoose.connect(process.env.MONGO_URL);

mongoose.connect('mongodb://localhost:27017/registration' , 
{useNewUrlParser:true , useUnifiedTopology:true}).then( () => console.log("connection successful.."))
.catch( (err) => console.log(err));