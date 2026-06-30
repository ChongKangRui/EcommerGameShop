import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { pool } from "../db";
import {generateToken}from "../utils/jwtHelper"
import type { AuthRequest } from 'src/middleWare/auth';
import {registerDataSchema} from "@ecom/shared/src/registerDataSchema"
import {loginDataSchema } from "@ecom/shared/src/loginDataSchema"

type UserInfo = {
  first_name: string,
  last_name: string,
  email: string,
  address: string,
  role: string
}

function getUserData (query:any) : UserInfo{
const { first_name, last_name, email, address, role } = query;
  
  return { first_name, last_name, email, address, role };
} 

export const register = async (req: Request, res: Response) => {
  try {
    console.log("register route trigger");
    //console.log(req.body);
  
    // pass the validation first
    const validationResult = registerDataSchema.safeParse(req.body);
        //console.log("---------------------register Validation Result------------------");
        //console.log(validationResult);
        if (!validationResult.success) {
          const errors = validationResult.error.issues;
          errors.forEach((err) => {
            console.log(err.path, err.message); 
          });
          return res.status(400).json({
            error: "Validation failed",
            details: validationResult.error.issues,
          });
        }

     const {
      firstName,
      lastName,
      email,
      password,
      streetAddress,
      city,
      postalCode,
    } = req.body;

    // Hash password
    const pepper = process.env.PEPPER;
    const pepperedPassword = password + pepper;
    const passwordHash = await bcrypt.hash(pepperedPassword, 12);
    const address = `${streetAddress}, ${city}, ${postalCode}`
   // console.log(pepperedPassword);
    // Insert user
     await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        firstName,
        lastName,
        email,
        passwordHash,
        address,
        "customer"
      ],
    );

    //const user = result.rows[0];

    res.status(201).json({ message: "Registration successful" });

    // res.send("Good job");
  } catch (e: any) {
    if (e.code === "23505") {
      // PostgreSQL unique violation code
      return res.status(409).json({ error: "Email already registered" });
    }
    console.log(e);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log(req.body);

    const validationResult = loginDataSchema.safeParse(req.body);
       // console.log("---------------------login Validation Result------------------");
        //console.log(validationResult);
        if (!validationResult.success) {
          const errors = validationResult.error.issues;
          errors.forEach((err) => {
            console.log(err.path, err.message); 
          });
          return res.status(400).json({
            error: "Validation failed",
            details: validationResult.error.issues,
          });
        }

    const {email, password, rememberMe}= req.body;

     const result = await pool.query(
      `select * from users where email = $1`, [email]);
      
    const selectedUser = result.rows[0];

    const pepper = process.env.PEPPER;
    const pepperedPassword = password + pepper;
    const match = await bcrypt.compare(pepperedPassword, selectedUser.password);

    // jwt token generated
    const token = generateToken(selectedUser.user_id, selectedUser.role, rememberMe);


    if(match){

        res.status(200).json({user: getUserData(selectedUser), token});
    }
    else{
         res.status(500).json({ error: "Invalid email or password" });
    }

  } catch (e) {
    
    console.log(e);
    res.status(500).json({ error: "Login failed" });
  }
};

export const verifyUser = async (req: AuthRequest, res:Response)=>{

  try{
     const user = await pool.query(
      `select * from users where user_id = $1`, [req.userId]);
      
      if(!user.rows[0]){
        return res.status(401).json({messsage: 'User not found'});
      }

      const selectedUser = user.rows[0];

      return res.json({user: getUserData(selectedUser)});
  }
  catch(e:any){
     return res.status(500).json({messsage: 'Server error'});
  }

 }

 export const updateUserInfo = async (req: AuthRequest, res: Response) => {
  try {

    const userId = req.userId;
   
    const {
      firstName,
      lastName,
      email,
      address
    } = req.body;
    
    // update user
    await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, email = $3, address = $4
       WHERE user_id = $5`,
      [
        firstName,
        lastName,
        email,
        address,
        userId
      ],
    );

    res.status(201).json({ message: "Update Success" });

  } catch (e: any) {
    if (e.code === "23505") {
      // PostgreSQL unique violation code
      return res.status(409).json({ error: "Update userInfo failed" });
    }
    console.log(e);
    res.status(500).json({ error: "Update userInfo failed" });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {

    const userId = req.userId;
   
    const {
     oldPassword,
     newPassword
    } = req.body;

    //get the user
    const user = await pool.query(
      `select * from users where user_id = $1`, [req.userId]);
      
      if(!user.rows[0]){
        return res.status(401).json({messsage: 'User not found'});
      }

    const selectedUser = user.rows[0];

    const pepper = process.env.PEPPER;
    const oldPepperedPassword = oldPassword + pepper;
    const match = await bcrypt.compare(oldPepperedPassword, selectedUser.password);

    if(!match){
      return res.status(401).json({messsage: 'Incorrect password'});
    }
     const newPepperedPassword = newPassword + pepper;
    const newHashPassword = await bcrypt.hash(newPepperedPassword, 12);
    //console.log("Update new password", newPepperedPassword);
    // update user
    await pool.query(
      `UPDATE users 
       SET password = $1
       WHERE user_id = $2`,
      [
        newHashPassword,
        userId
      ],
    );

    res.status(201).json({ message: "Update Success" });

  } catch (e: any) {
    if (e.code === "23505") {
      // PostgreSQL unique violation code
      return res.status(409).json({ error: "Update password failed" });
    }
    console.log(e);
    res.status(500).json({ error: "Update password failed" });
  }
};