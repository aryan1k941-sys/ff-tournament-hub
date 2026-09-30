let token=localStorage.getItem("token");
const $=id=>document.getElementById(id);
async function api(url,opt={}){opt.headers={...(opt.headers||{}),...(token?{Authorization:"Bearer "+token}:{})};if(opt.body&&typeof opt.body!=="string"){opt.headers["Content-Type"]="application/json";opt.body=JSON.stringify(opt.body)};let r=await fetch(url,opt),d=await r.json();if(!r.ok)throw Error(d.error||"Request failed");return d}
async function signup(){try{let d=await api("/api/signup",{method:"POST",body:{name:$("name").value,email:$("email").value,password:$("password").value,referralCode:$("ref").value}});token=d.token;localStorage.token=token;$("authMsg").textContent="Signup successful";load()}catch(e){$("authMsg").textContent=e.message}}
async function login(){try{let d=await api("/api/login",{method:"POST",body:{email:$("email").value,password:$("password").value}});token=d.token;localStorage.token=token;$("authMsg").textContent="Login successful";load()}catch(e){$("authMsg").textContent=e.message}}
async function load(){let ts=await api("/api/tournaments");$("list").innerHTML=ts.length?ts.map(t=>`<div class="tour"><h3>${esc(t.title)}</h3><div class="muted">${esc(t.mode||"")} • ${esc(t.date||"")}</div><p>${esc(t.description||"")}</p><button onclick="join('${t.id}')">Join</button></div>`).join(""):"<p>No tournaments yet.</p>"}
async function join(id){try{alert((await api("/api/tournaments/"+id+"/join",{method:"POST"})).message)}catch(e){alert(e.message)}}
async function createTournament(){try{await api("/api/admin/tournaments",{method:"POST",body:{title:$("atitle").value,mode:$("amode").value,date:$("adate").value,description:$("adesc").value}});alert("Created");load()}catch(e){alert(e.message)}}
async function announce(){try{await api("/api/admin/announcements",{method:"POST",body:{text:$("announcement").value}});alert("Broadcast saved")}catch(e){alert(e.message)}}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
load();
