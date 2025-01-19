const mongoose = require('mongoose')

const connectDatabse=()=>{
    mongoose.connect(process.env.MONGODB_LOCAL).then(()=>{
        console.log('Database Connected!')
    })
}

//Exporting
module.exports=connectDatabse