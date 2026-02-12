const express=require('express')

const userRouter=require('./routes/userRouter')
const projectRouter=require('./routes/projectRouter')
const taskRouter=require('./routes/taskRouter')
const errorHandler=require('./middlewares/error.middleware')
const app=express();
app.use(express.json())

app.use(userRouter)
app.use(projectRouter)
app.use(taskRouter)
app.use(errorHandler)

const port=3000;

app.listen(port,()=>{
    console.log(`server running at http://localhost:${port}`)
})