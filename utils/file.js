import fs from "fs/promises"

const dbPath = "/home/irfan/todo-practice/data.json"

async function readContent(){
    try {
        let userData = await fs.readFile(dbPath, "utf-8")
        return JSON.parse(userData)
    } catch (error) {
        console.log(error);
        
    }
}

async function writeContent(content){
    try {
        await fs.writeFile(dbPath, JSON.stringify(content, null, 2 ))
    } catch (error) {
        console.log(error);
        
    }
}

export {readContent, writeContent}