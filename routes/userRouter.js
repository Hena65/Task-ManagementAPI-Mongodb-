const express=require('express')
const userRouter=express.Router();
const fs=require('node:fs')
const path=require('path');
const Joi=require('joi')
const userschema=require('../validations/user.schema.js')
const sort=require('../utils/sort')
const filter=require('../utils/filter')
const paginate=require('../utils/paginate')

const userfile=path.join(__dirname,'../data/user.json')

userRouter.get("/user",(req,res,next)=>{
    
    let users = JSON.parse(fs.readFileSync(userfile, 'utf-8'));
    users = filter(users, 'role', req.query.role);
    users = sort(users, req.query.sortBy, req.query.order);
    users = paginate(users, req.query.page, req.query.limit);
    res.json(users);
   

})

userRouter.post('/user', (req, res) => {
    const { error, value } = userschema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    let usersData = [];
    try {
        const fileData = fs.readFileSync(userfile, 'utf-8');
        usersData = fileData ? JSON.parse(fileData) : [];
    } catch (err) {
        return res.status(500).json({ error: 'Error reading users file' });
    }

    const newId = usersData.reduce((maxId, user) => Math.max(maxId, user.id || 0), 0) + 1;
    const newUser = { id: newId, ...value };

    usersData.push(newUser);

    try {
        fs.writeFileSync(userfile, JSON.stringify(usersData, null, 2));
    } catch (err) {
        return res.status(500).json({ error: 'Error writing users file' });
    }

    res.status(201).json(newUser);
});

userRouter.delete("/user/:id",(req,res,next)=>{
    const user=JSON.parse(fs.readFileSync(userfile,'utf-8'))
    const id=parseInt(req.params.id)
    const deleteduser=user.find(item=>item.id===id)
    if(!deleteduser){
        return res.status(404).send("id not found")
    }
    const updateduser=user.filter(item=>item.id!==id)
    if(user.length===updateduser.length){
        return res.status(400).send("id not found")
    }
    fs.writeFileSync(userfile,JSON.stringify(updateduser,null,2))
    res.status(201).json(deleteduser)
})

userRouter.put("/user/:id",(req,res,next)=>{
    const id=parseInt(req.params.id)
    const user=JSON.parse(fs.readFileSync(userfile,'utf-8'))
    const updateduser=user.find(user=>user.id===id)
   if(!updateduser){
    return res.status(404).send("user not found")
   }
    if(req.body.name!==undefined){
        updateduser.name=req.body.name
    }
    if(req.body.email!==undefined){
        updateduser.email=req.body.email
    }
    if(req.body.role!==undefined){
        updateduser.role=req.body.role
    }
    fs.writeFileSync(userfile,JSON.stringify(user,null,2))
    res.status(200).json(updateduser)
})


module.exports=userRouter;