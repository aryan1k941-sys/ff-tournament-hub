const express=require("express");
const path=require("path");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const fs=require("fs");
const app=express();
const PORT=process.env.PORT||10000;
const SECRET=process.env.JWT_SECRET||"CHANGE_THIS_SECRET";

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

const dbFile=path.join(__dirname,"data.json");
let db=fs.existsSync(dbFile)?JSON.parse(fs.readFileSync(dbFile)):{
  users:[], tournaments:[], referrals:[], announcements:[]
};
function save(){fs.writeFileSync(dbFile,JSON.stringify(db,null,2))}
function token(u){return jwt.sign({id:u.id,role:u.role},SECRET,{expiresIn:"7d"})}
function auth(req,res,next){
  try{req.user=jwt.verify((req.headers.authorization||"").replace("Bearer ",""),SECRET);next()}
  catch{return res.status(401).json({error:"Login required"})}
}
function admin(req,res,next){if(req.user.role!=="admin")return res.status(403).json({error:"Admin only"});next()}

app.post("/api/signup",(req,res)=>{
  const {email,password,name,referralCode}=req.body;
  if(!email||!password||!name)return res.status(400).json({error:"Name, email and password required"});
  if(db.users.some(u=>u.email.toLowerCase()===email.toLowerCase()))return res.status(409).json({error:"Email already registered"});
  const u={id:Date.now().toString(),name,email:email.toLowerCase(),password:bcrypt.hashSync(password,10),
    role:"user",referralCode:Math.random().toString(36).slice(2,9).toUpperCase(),createdAt:new Date().toISOString()};
  db.users.push(u);
  if(referralCode){
    const r=db.users.find(x=>x.referralCode===referralCode.toUpperCase());
    if(r)db.referrals.push({id:Date.now().toString(),referrerId:r.id,referredId:u.id,status:"registered"});
  }
  save(); res.json({token:token(u),user:{id:u.id,name:u.name,email:u.email,referralCode:u.referralCode,role:u.role}});
});
app.post("/api/login",(req,res)=>{
  const u=db.users.find(x=>x.email===String(req.body.email||"").toLowerCase());
  if(!u||!bcrypt.compareSync(req.body.password||"",u.password))return res.status(401).json({error:"Invalid email or password"});
  res.json({token:token(u),user:{id:u.id,name:u.name,email:u.email,referralCode:u.referralCode,role:u.role}});
});
app.get("/api/me",auth,(req,res)=>{
  const u=db.users.find(x=>x.id===req.user.id); if(!u)return res.status(404).json({error:"User not found"});
  res.json({id:u.id,name:u.name,email:u.email,referralCode:u.referralCode,role:u.role});
});
app.get("/api/tournaments",(req,res)=>res.json(db.tournaments));
app.post("/api/tournaments/:id/join",auth,(req,res)=>{
  const t=db.tournaments.find(x=>x.id===req.params.id); if(!t)return res.status(404).json({error:"Tournament not found"});
  t.players=t.players||[]; if(!t.players.includes(req.user.id))t.players.push(req.user.id); save();
  res.json({message:"Joined successfully"});
});
app.get("/api/announcements",(req,res)=>res.json(db.announcements));

app.post("/api/admin/tournaments",auth,admin,(req,res)=>{
  const {title,mode,date,description}=req.body;
  const t={id:Date.now().toString(),title,mode,date,description,players:[],status:"upcoming"};
  db.tournaments.push(t);save();res.json(t);
});
app.delete("/api/admin/tournaments/:id",auth,admin,(req,res)=>{
  db.tournaments=db.tournaments.filter(x=>x.id!==req.params.id);save();res.json({ok:true});
});
app.get("/api/admin/users",auth,admin,(req,res)=>{
  res.json(db.users.map(({password,...u})=>u));
});
app.post("/api/admin/announcements",auth,admin,(req,res)=>{
  const a={id:Date.now().toString(),text:req.body.text||"",createdAt:new Date().toISOString()};
  db.announcements.unshift(a);save();res.json(a);
});
app.get("/api/admin/stats",auth,admin,(req,res)=>res.json({
  users:db.users.length,tournaments:db.tournaments.length,referrals:db.referrals.length
}));

app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,()=>console.log("Running on port "+PORT));
