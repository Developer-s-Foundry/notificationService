import express,{Request,Response,NextFunction} from 'express'
import dotenv from 'dotenv'
import db from './database'

dotenv.config()
const app = express()

const port =process.env.PORT || 3000

db.connect((err,client,release)=>{
    if (err){
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to database');
    release();
})
app.get('/', (req:Request,res:Response)=>{
    res.send('Hello World')
})
app.use((err: Error, req:Request, res:Response, next:NextFunction)=>{
    console.error(err.stack)
    res.status(500).send('Something broke!')
})
app.listen(port,()=>{
    console.log(`Server running on port ${port}`)
})