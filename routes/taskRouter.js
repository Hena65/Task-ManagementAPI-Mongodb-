const express=require('express')
const taskRouter=express.Router();
const Joi=require('joi')
const path=require('path')
const fs=require('node:fs')
const taskschema=require('../validations/task.schema.js')
const sort=require('../utils/sort')
const filter=require('../utils/filter')
const paginate=require('../utils/paginate')
const taskfile=path.join(__dirname,'../data/task.json')
const userfile=path.join(__dirname,'../data/user.json')
const projectfile=path.join(__dirname,'../data/project.json')


taskRouter.get('/task',(req,res,next)=>{
    let task=JSON.parse(fs.readFileSync(taskfile,'utf-8'))
    task=filter(task,'assignedto',req.query.assignedto)
    task=sort(task,req.query.sortBy,req.query.order)
    task=paginate(task,req.query.page,req.query.limit)

    res.json(task)
})

taskRouter.post("/task",(req,res,next)=>{
    const {error,value}=taskschema.validate(req.body)
    if(error){
        return res.status(400).json({error:error.details[0].message})
    }

      let tasks = [];
    try {
        const fileData = fs.readFileSync(taskfile, 'utf-8');
        tasks = fileData ? JSON.parse(fileData) : [];
    } catch {
        return res.status(500).json({ error: 'Error reading tasks file' });
    }


    const users = JSON.parse(fs.readFileSync(userfile, 'utf-8'));
    if (!users.find(u => u.id == value.assignedto)) {
        return res.status(400).json({ error: 'Assigned user does not exist' });
    }
    const projects = JSON.parse(fs.readFileSync(projectfile, 'utf-8'));
    if (!projects.find(p => p.id === value.projectId)) {
        return res.status(400).json({ error: 'Project does not exist' });
    }

    
    const newId = tasks.reduce((maxId, task) => Math.max(maxId, task.id || 0), 0) + 1;

    const newTask = { id: newId, ...value };
    tasks.push(newTask)
    fs.writeFileSync(taskfile, JSON.stringify(tasks, null, 2));

    res.status(201).json(newTask);
    
})

taskRouter.put("/task/:id",(req,res)=>{
    const task=JSON.parse(fs.readFileSync(taskfile,'utf-8'))
    const id=parseInt(req.params.id)
    const updatedtask=task.find(task=>task.id===id)
    if(!updatedtask){
        return res.status(404).send("task not found")
    }
    if(req.body.title!==undefined){
        updatedtask.title=req.body.title
    }
    if(req.body.status!==undefined){
        updatedtask.status=req.body.status
    }
    if(req.body.assignedto!==undefined){
        updatedtask.assignedto=req.body.assignedto
    }
    fs.writeFileSync(taskfile,JSON.stringify(task,null,2))
    res.status(200).send(updatedtask)
})


taskRouter.delete("/task/:id",(req,res)=>{
    const task=JSON.parse(fs.readFileSync(taskfile,'utf-8'))
    const id=parseInt(req.params.id)
    const deletedtask=task.find(item=>item.id===id)
    if(!deletedtask){
        return res.status(404).send("id not found")
    }

    const updatedtask=task.filter(item=>item.id!==id)
    // if(task.length===updatedtask.length){
    //     return res.status(400).send("id not found")
    // }
    fs.writeFileSync(taskfile,JSON.stringify(updatedtask,null,2))
    res.status(201).json(deletedtask)
})

module.exports=taskRouter;












