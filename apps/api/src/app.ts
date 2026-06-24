import express from "express";
import cors from "cors"

import userRouters from './routes/user';
import { Response, Request,NextFunction } from "express";
import ExpressError from "./utils/expressError";

const app = express();
app.use(express.json());

// if we are running in development, we can access .env anywhere
if (process.env.NODE_ENV != 'production') {
    require('dotenv').config({ quiet: true });
}



app.use(cors({
  origin: "http://localhost:5173",
}))





 app.get("/", async (req, res) => {
  
   res.json({ message: "Server is working!" });
 });


app.use('/', userRouters);

//==========================================
// error handling

// for this all, order is important here
// because it will only run when no route matched
app.all('/{*path}', (req:Request, res:Response, next: NextFunction) => {
    next(new ExpressError('Something went wrong, please try again', 404));
})

// express 5 know that this err parameter is for error handle 
// and it will automatically handle error 
app.use((err:ExpressError, req:Request, res:Response, next: NextFunction) => {
    const { status = 500 } = err;
    if (!err.message) {
        err.message = 'Something went wrong, please try again';
    }

   res.status(status).json({ error: err.message });
})

 

app.listen(3000, () => {
    console.log("Listening on port 3000");
});

console.log("HEllo!!!");