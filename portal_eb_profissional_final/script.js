
const toggle=document.getElementById("menuToggle");
const nav=document.getElementById("mainNav");
if(toggle&&nav){
  toggle.addEventListener("click",()=>{
    const open=nav.classList.toggle("open");
    toggle.textContent=open?"✕":"☰";
    toggle.setAttribute("aria-expanded",String(open));
  });
  nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{
    nav.classList.remove("open");toggle.textContent="☰";toggle.setAttribute("aria-expanded","false");
  }));
}

// Smooth page transitions for internal navigation
document.body.classList.add("page-entering");
window.addEventListener("pageshow",()=>document.body.classList.remove("page-leaving"));
document.querySelectorAll('a[href]').forEach(link=>{
  link.addEventListener("click",event=>{
    const href=link.getAttribute("href");
    if(!href||href.startsWith("#")||link.target==="_blank"||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    let target;try{target=new URL(href,location.href)}catch{return}
    if(target.origin!==location.origin||target.pathname===location.pathname)return;
    event.preventDefault();document.body.classList.remove("page-entering");document.body.classList.add("page-leaving");
    setTimeout(()=>location.href=target.href,390);
  });
});

// Reveal content as it enters the viewport
const revealTargets=document.querySelectorAll(".content h2,.content>p,.cards,.card,.dark-panel,.feature-strip,.notice-item,.faq,footer");
revealTargets.forEach(el=>el.classList.add("reveal"));
if("IntersectionObserver"in window){
  const observer=new IntersectionObserver((entries,obs)=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");obs.unobserve(entry.target)}});
  },{threshold:.1});
  revealTargets.forEach(el=>observer.observe(el));
}else revealTargets.forEach(el=>el.classList.add("visible"));

// Current year and back-to-top button
const year=document.getElementById("year");if(year)year.textContent=new Date().getFullYear();
const back=document.createElement("button");back.className="back-top";back.type="button";back.setAttribute("aria-label","Voltar ao topo");back.textContent="↑";document.body.appendChild(back);
window.addEventListener("scroll",()=>back.classList.toggle("show",window.scrollY>450),{passive:true});
back.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));

// Promotion registration: local demo only, no Roblox API or server integration
const form=document.getElementById("promotionForm");
if(form){
  const ranks=["Recruta","Soldado","Cabo","3º Sargento","2º Sargento","1º Sargento","Subtenente","Aspirante","2º Tenente","1º Tenente","Capitão","Major","Tenente-Coronel","Coronel","General de Brigada","General de Divisão","General de Exército"];
  const current=document.getElementById("currentRank"),next=document.getElementById("newRank");
  ranks.forEach(rank=>{current.add(new Option(rank,rank));next.add(new Option(rank,rank))});
  const result=document.getElementById("promotionResult");
  const history=document.getElementById("promotionHistory");
  function renderHistory(){
    if(!history)return;
    let list=[];try{list=JSON.parse(localStorage.getItem("ebPromotionRecords")||"[]")}catch{}
    history.innerHTML="";
    if(!list.length){const empty=document.createElement("div");empty.className="empty-state";empty.textContent="Nenhum registro salvo neste navegador.";history.appendChild(empty);return}
    list.slice(0,10).forEach(item=>{
      const row=document.createElement("div");row.className="history-item";
      row.textContent=`${item.user}: ${item.oldRank} → ${item.nextRank} | Responsável: ${item.promoter} | ${item.date}`;
      history.appendChild(row);
    });
  }
  renderHistory();
  form.addEventListener("submit",event=>{
    event.preventDefault();
    const user=document.getElementById("robloxUser").value.trim();
    const oldRank=current.value,newRank=next.value;
    const promoter=document.getElementById("promoter").value.trim();
    const reason=document.getElementById("promotionReason").value.trim();
    if(!user||!oldRank||!newRank||!promoter)return;
    if(ranks.indexOf(newRank)<=ranks.indexOf(oldRank)){alert("A nova patente precisa estar acima da patente atual.");return}
    const record={user,oldRank,nextRank:newRank,promoter,reason,date:new Date().toLocaleString("pt-BR")};
    let records=[];try{records=JSON.parse(localStorage.getItem("ebPromotionRecords")||"[]")}catch{}
    records.unshift(record);
    try{localStorage.setItem("ebPromotionRecords",JSON.stringify(records.slice(0,100)))}catch{alert("Não foi possível salvar neste navegador.");return}
    result.hidden=false;
    result.textContent=`REGISTRO PREPARADO\\n\\nIntegrante: ${user}\\nPatente anterior: ${oldRank}\\nNova patente: ${newRank}\\nResponsável: ${promoter}\\nData: ${record.date}${reason?"\\nObservações: "+reason:""}`;
    const copy=document.createElement("button");copy.type="button";copy.textContent="Copiar registro";
    copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(result.textContent);copy.textContent="Copiado!"}catch{copy.textContent="Falha ao copiar"}});
    result.append(document.createElement("br"),copy);
    renderHistory();form.reset();
  });
}
