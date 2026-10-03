import express from "express"
import { readContent, writeContent } from "./utils/file.js"
import { read, readFile } from "node:fs"
import { resolveSoa } from "node:dns"

const app = express()

app.use(express.json())

app.get("/health", (req,res) =>{
    res.status(200).json({
        "msg" : "helo"
    })
})

app.post("/create-user", async (req,res) =>{
    try {
        let incomingData = req.body
        let existingData = await readContent()

        if(existingData.find((item) => item.id == existingData.id)){
            return res.status(400).json({
                "msg" : "user already exist"
            })
        }
        existingData.push(incomingData)
        await writeContent(existingData)
        res.status(201).json({
            "msg" : "user created successfully"
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            "msg" : "internal server error"
        })
    }
})

app.post("/create-todo/:id", async (req,res) =>{
    try {
        let userID = req.params.id
        let newTodo = req.body
        let database = await readContent()
        let existingUser = database.find((item) => item.id == userID)
        if(existingUser){
            if (!Array.isArray(existingUser.todos)) {
                existingUser.todos = [existingUser.todos]
            }
            existingUser.todos.push(newTodo)
            await writeContent(database)
            return res.status(201).json({
                "msg" : "todo added successfully"
            })
        }
        res.status(404).json({
            "msg" : "user not found"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "msg" : "internal server error"
        })
        
    }
})

app.get("/get-all-users", async (req,res) =>{
    try {
        let database = await readContent()
        res.status(200).json(database)
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "msg" : "internal server error"
        })
        
    }
})

app.get("/get-user/:id", async (req,res) =>{
    try {
        let userID = req.params.id
        let database = await readContent()
        let existingUser = database.find((item) => item.id == userID)
        if(existingUser){
         return res.status(200).json(existingUser)
        }
        res.status(404).json({
            "msg" : "user not found"
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            "msg" : "internal server error"
        })
        
    }
})

app.get("/get-all-todos/:id", async (req,res) =>{
    try {
        let userID = req.params.id
        let database = await readContent()
        let existingUser = database.find((item) => item.id == userID)
        if(existingUser){
         return res.status(200).json(existingUser.todos)
        }
        res.status(404).json({
            "msg" : "user not found"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "msg" : "internal server error"
        })
        
    }
})

app.get("/get-todo/:userID/:todoID", async (req,res) =>{
    try {
        let userID = req.params.userID
        let todoID = req.params.todoID
        let database = await readContent()
        let existingUser = database.find((item) => item.id == userID)
        let existingTodo = existingUser.todos.find((item) => item.id == todoID)
        if(existingUser){
        return res.status(200).json(existingTodo)
        }
        res.status(404).json({
            "msg" : "user not found"
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            "msg" : "internal server error"
        })
        
    }
})

app.delete("/delete-all-users" , async (req,res) =>{
    try {
        let database = await readContent()
        if(database.length != 0 ){
            await writeContent([])
         return res.status(200).json({
            "msg" : "database deleted"
        })
    }
    res.status(404).json({
        "msg" : "database is already empty"
    })
    } catch (error) {
        res.status(500).json({
            "msg" : "internal server error"
        })
    }
})

app.delete("/delete-user/:id" , async (req,res) =>{
    try {
        let userID = req.params.id
        let database = await readContent()
        let existingUser = database.find((item) => item.id == userID)
        if(existingUser){
         let finalData = database.filter((item) => item.id != userID)
            await writeContent(finalData)
           return res.status(200).json({
                "msg" : "user deleted successfully"
            })
        }
        res.status(404).json({
            "msg" : "user not found"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "msg" : "internal server error"
        })
        
    }
})

app.delete("/delete-all-todos/:id" , async (req,res) =>{
    try {
        let userID = req.params.id
        let database = await readContent()
        let existingUser = database.find((item) => item.id == userID)
        if(existingUser){
            existingUser.todos = []
            await writeContent(database)
            return res.status(200).json({
                "msg" : "all todos deleted"
            })
        }
        res.status(404).json({
            "msg" : "user not found"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "msg" : "internal server error"
        })
        
    }
})

app.delete("/delete-todo/:userID/:todoID", async (req, res) => {
    try {
        let userID = req.params.userID
        let todoID = req.params.todoID
        let database = await readContent()
        let existingUser = database.find((item) => item.id == userID)

        if (!existingUser) {
            return res.status(404).json({
                msg: "user not found"
            })
        }

        let existingTodo = existingUser.todos.find((item) => item.id == todoID)

        if (!existingTodo) {
            return res.status(404).json({
                msg: "todo not found"
            })
        }

        existingUser.todos = existingUser.todos.filter(
            (item) => item.id != todoID
        )
        await writeContent(database)

        return res.status(200).json({
            msg: "todo deleted successfully"
        })

    } catch (error) {
        console.log(error)

        return res.status(500).json({
            msg: "internal server error"
        })
    }
})

app.patch("/update-user/:id" , async (req,res) =>{
    try {
        let userID = req.params.id
        let database = await readContent()
        let updated = req.body
        let existingUser = database.find((item) => item.id == userID)
        if(!existingUser){
            return res.status(404).json({
                "msg" : "user not found"
            })
        }
        Object.assign(existingUser, updated)
        await writeContent(database)
        res.status(200).json({
            "msg" : "user updated succeessfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "msg" : "internal server error"
        })
    }
})

app.patch("/update-todo/:id" , async (req,res) =>{
    try {
        let userID = req.params.id
        let updatedTodo = req.body
        let todoID = req.body.id
        let database = await readContent()
        let existingUser = database.find((item) => item.id == userID)
        if(!existingUser){
            return res.status(404).json({
                "msg" : "user not found"
            })
        }
        let existingTodo = existingUser.todos.find((item) => item.id == todoID)
        if(!existingTodo){
            return res.status(404).json({
                "msg" : "todo not found"
            })
        }

        Object.assign(existingTodo, updatedTodo)
        await writeContent(database)
        res.status(200).json({
            "msg" : "todo updated successfully"
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            "msg" : "internal server error"
        })
        
    }
})

app.listen(5000, ()=>{
    console.log("server is running on port 5000");
    
})