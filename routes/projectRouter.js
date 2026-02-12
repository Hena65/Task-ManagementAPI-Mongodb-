const express=require('express')
const projectRouter=express.Router();
const path=require('path')
const fs=require('node:fs')
const Joi=require('joi')
const projectschema=require('../validations/project.schema.js')
const userfile=path.join(__dirname,'../data/user.json')
const projectfile=path.join(__dirname,'../data/project.json')
const sort=require('../utils/sort')
const filter=require('../utils/filter')
const paginate=require('../utils/paginate')


projectRouter.get("/project",(req,res,next)=>{
    try{
        let project=JSON.parse(fs.readFileSync(projectfile,'utf-8'))
        project=paginate(project,req.query.page,req.query.limit)
        project=sort(project,req.user.sortBy,req.query.order)
        project=filter(project,'title',req.query.title)
        res.json(project)
    }catch(err){
        res.status(500).json({error:'error reading project file'})
    }


})

projectRouter.post("/project",(req,res,next)=>{
    const {error,value}=projectschema.validate(req.body)
    if(error){
        return res.status(400).json({error:error.details[0].message})
    }
    const project=JSON.parse(fs.readFileSync(projectfile,'utf-8'))
     const newId = project.length > 0 
        ? project[project.length - 1].id + 1 
        : 1;
    const newproject={
        id:newId,
        ...value
    }

    project.push(newproject)
    fs.writeFileSync(projectfile,JSON.stringify(project,null,2))
    res.status(201).json(newproject)
})

projectRouter.put("/project/:id",(req,res)=>{
    const project=JSON.parse(fs.readFileSync(projectfile,'utf-8'))
    const id=parseInt(req.params.id)
    const updatedproject=project.find(project=>project.id===id)
    if(!updatedproject){
        return res.status(404).send("project not found")
    }
    if(req.body.name!==undefined){
        updatedproject.name=req.body.name
    }
    if(req.body.description!==undefined){
        updatedproject.description=req.body.description
    }
    if(req.body.managerId!==undefined){
        updatedproject.managerId=req.body.managerId
    }
    fs.writeFileSync(projectfile,JSON.stringify(project,null,2))
    res.status(200).send(updatedproject)
})


projectRouter.delete("/project/:id",(req,res)=>{
    const project=JSON.parse(fs.readFileSync(projectfile,'utf-8'))
    const id=parseInt(req.params.id)
    const deletedrecord=project.find(item=>item.id===id)
    const updatedproject=project.filter(item=>item.id!==id)
    if(project.length===updatedproject.length){
        return res.status(400).send("id not found")
    }
    fs.writeFileSync(projectfile,JSON.stringify(updatedproject,null,2))
    res.status(201).json(deletedrecord)
})


module.exports=projectRouter;


