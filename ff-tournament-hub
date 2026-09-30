import os, textwrap, zipfile, json

root="/mnt/data/ff_tournament_hub"
os.makedirs(root, exist_ok=True)
files={
"package.json": r'''{
  "name":"ff-tournament-hub",
  "version":"1.0.0",
  "private":true,
  "scripts":{"start":"node server.js"},
  "dependencies":{"bcryptjs":"^2.4.3","express":"^4.21.2","jsonwebtoken":"^9.0.2"}
}''',
"server.js": r'''const express=require("express");
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
''',
"public/index.html": r'''<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>FF Tournament Hub</title><link rel="stylesheet" href="style.css"></head>
<body>
<header><b>🔥 FF Tournament Hub</b><nav><a href="#home">Home</a><a href="#tournaments">Tournaments</a><a href="#login">Login</a><a href="#admin">Admin</a></nav></header>
<main>
<section id="home" class="hero"><h1>Free Fire Tournament Hub</h1><p>Join tournaments, build teams and track results.</p><button onclick="location.hash='tournaments'">View Tournaments</button></section>
<section id="login" class="card"><h2>Login / Signup</h2><input id="name" placeholder="Name (signup)"><input id="email" placeholder="Email"><input id="password" type="password" placeholder="Password"><input id="ref" placeholder="Referral code (optional)"><div><button onclick="signup()">Signup</button><button onclick="login()">Login</button></div><p id="authMsg"></p></section>
<section id="tournaments"><h2>Upcoming Tournaments</h2><div id="list"></div></section>
<section id="admin" class="card"><h2>Admin Panel</h2><p>Login using the admin account created during setup, then manage tournaments and announcements.</p>
<input id="atitle" placeholder="Tournament title"><input id="amode" placeholder="Solo / Duo / Squad"><input id="adate" placeholder="Date & time"><input id="adesc" placeholder="Description"><button onclick="createTournament()">Create Tournament</button>
<input id="announcement" placeholder="Announcement"><button onclick="announce()">Broadcast</button><pre id="stats"></pre></section>
</main><script src="app.js"></script></body></html>''',
"public/style.css": r'''*{box-sizing:border-box}body{margin:0;font-family:Arial;background:#0b1020;color:#eee}header{padding:16px 6%;display:flex;justify-content:space-between;gap:20px;align-items:center;background:#11182d;position:sticky;top:0}nav a{color:#fff;text-decoration:none;margin:0 8px}.hero{padding:80px 8%;text-align:center;background:linear-gradient(135deg,#171f3b,#101426)}h1{font-size:42px}main{max-width:1100px;margin:auto}.card,#tournaments{margin:25px 6%;padding:25px;background:#151d35;border-radius:16px}input{display:block;width:100%;max-width:500px;padding:13px;margin:10px 0;border-radius:8px;border:1px solid #394566;background:#0c1224;color:#fff}button{padding:12px 18px;margin:6px;border:0;border-radius:8px;cursor:pointer;background:#5b6cff;color:white}.tour{padding:18px;margin:12px 0;background:#0e1529;border-radius:12px}.muted{color:#9da8c7}@media(max-width:700px){header{display:block}nav{margin-top:12px}h1{font-size:32px}}''',
"public/app.js": r'''let token=localStorage.getItem("token");
const $=id=>document.getElementById(id);
async function api(url,opt={}){opt.headers={...(opt.headers||{}),...(token?{Authorization:"Bearer "+token}:{})};if(opt.body&&typeof opt.body!=="string"){opt.headers["Content-Type"]="application/json";opt.body=JSON.stringify(opt.body)};let r=await fetch(url,opt),d=await r.json();if(!r.ok)throw Error(d.error||"Request failed");return d}
async function signup(){try{let d=await api("/api/signup",{method:"POST",body:{name:$("name").value,email:$("email").value,password:$("password").value,referralCode:$("ref").value}});token=d.token;localStorage.token=token;$("authMsg").textContent="Signup successful";load()}catch(e){$("authMsg").textContent=e.message}}
async function login(){try{let d=await api("/api/login",{method:"POST",body:{email:$("email").value,password:$("password").value}});token=d.token;localStorage.token=token;$("authMsg").textContent="Login successful";load()}catch(e){$("authMsg").textContent=e.message}}
async function load(){let ts=await api("/api/tournaments");$("list").innerHTML=ts.length?ts.map(t=>`<div class="tour"><h3>${esc(t.title)}</h3><div class="muted">${esc(t.mode||"")} • ${esc(t.date||"")}</div><p>${esc(t.description||"")}</p><button onclick="join('${t.id}')">Join</button></div>`).join(""):"<p>No tournaments yet.</p>"}
async function join(id){try{alert((await api("/api/tournaments/"+id+"/join",{method:"POST"})).message)}catch(e){alert(e.message)}}
async function createTournament(){try{await api("/api/admin/tournaments",{method:"POST",body:{title:$("atitle").value,mode:$("amode").value,date:$("adate").value,description:$("adesc").value}});alert("Created");load()}catch(e){alert(e.message)}}
async function announce(){try{await api("/api/admin/announcements",{method:"POST",body:{text:$("announcement").value}});alert("Broadcast saved")}catch(e){alert(e.message)}}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
load();''',
"README.md": r'''# FF Tournament Hub

## Local run
1. Install Node.js 18+
2. Run `npm install`
3. Set `JWT_SECRET` to a long random secret.
4. Create an admin user by editing `data.json` after first signup: change that user's `"role"` from `"user"` to `"admin"`.
5. Run `npm start`
6. Open http://localhost:10000

## Render
Create a Web Service from this GitHub repository.
Build command: `npm install`
Start command: `npm start`
Add environment variable:
`JWT_SECRET` = a long random value.

## Important
This starter uses a JSON file for demonstration. For production, migrate users/tournaments to PostgreSQL and use proper email verification, password reset, rate limiting, secure secrets, backups, and server-side authorization.

Payment/UPI fields are intentionally not implemented as real-money processing in this starter. Add a compliant payment provider only after its requirements and applicable rules are checked.
''',
".gitignore": "node_modules/\n.env\ndata.json\n"
}
for rel,content in files.items():
    p=os.path.join(root,rel);os.makedirs(os.path.dirname(p),exist_ok=True)
    open(p,"w",encoding="utf-8").write(content)

zip_path="/mnt/data/ff_tournament_hub.zip"
with zipfile.ZipFile(zip_path,"w",zipfile.ZIP_DEFLATED) as z:
    for base,_,names in os.walk(root):
        for n in names:
            p=os.path.join(base,n);z.write(p,os.path.relpath(p,root))
print(zip_path)
