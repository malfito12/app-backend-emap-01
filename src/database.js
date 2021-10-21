const mongoose = require('mongoose')

const URI = process.env.MONGODB_URI
    ? process.env.MONGODB_URI
    : 'mongodb://localhost/databasetest';

const databasename = 'crud'
mongoose.connect("mongodb://127.0.0.1:27017/" + databasename, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

// mongoose.connect("mongodb+srv://malfito12:vivabraun123@dbcluster.yhudn.mongodb.net/EMAP?retryWrites=true&w=majority",{
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true,
//     useFindAndModify:false
// })

// mongoose.connect(process.env.MONGO_URI,{
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true,
//     useFindAndModify:false
// })

const connection=mongoose.connection

connection.once('open',()=>{
    console.log('DB is connected')
})
module.exports=mongoose