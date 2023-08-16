import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import useragent from 'useragent'

import users from "../models/auth.js";

export const signup = async (req, res) => {
  const userAgentString = req.headers['user-agent'];
  const agent = useragent.parse(userAgentString);
  const browser = agent.family; 
  const os = agent.os.toString();  
  const systemType = agent.isMobile ? 'mobile' : 'desktop';
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  const { name, email, password } = req.body;
  try {
    const existinguser = await users.findOne({ email });
    if (existinguser) {
      return res.status(404).json({ message: "User already Exist." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await users.create({
      name,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ result: newUser, token });
    updateInfo(email,browser,os,systemType,ipAddress);
  } catch (error) {
    res.status(500).json("Something went worng...");
  }
};

export const login = async (req, res) => {
  const userAgentString = req.headers['user-agent'];
  const agent = useragent.parse(userAgentString);
  const browser = agent.family; 
  const os = agent.os.toString();  
  const systemType = agent.isMobile ? 'mobile' : 'desktop';
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const { email, password} = req.body;
  try {
    const existinguser = await users.findOne({ email });
    if (!existinguser) {
      return res.status(404).json({ message: "User don't Exist." });
    }
    const isPasswordCrt = await bcrypt.compare(password, existinguser.password);
    if (!isPasswordCrt) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { email: existinguser.email, id: existinguser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    await updateInfo(email,browser,os,systemType,ipAddress);
    res.status(200).json({ result: existinguser, token });
  } catch (error) {
    console.log("wer");
    res.status(500).json("Something went worng...");
  }
};

const updateInfo = async (email,browser,os,systemType,ipAddress) => {
  try {
    await users.findOneAndUpdate(
      {email},
      {$addToSet: {loginInformation : [{Browser:browser,Operating_System:os,Type_Of_System:systemType,IP_Address:ipAddress }] },
    });
  } catch (error) {
    console.log(error);
  }
};