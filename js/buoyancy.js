window.Buoyancy = (() => {
  let state;
  function render(targetId) {
    state={densityLiquid:1000,densityBody:600,volume:0.004,gravity:9.81,submerged:.7};
    const target=document.getElementById(targetId);
    target.innerHTML=`
      <section class="page fade-in">
        <div class="page-heading"><div><div class="eyebrow">Механика / Гидростатика</div><h1>Сила Архимеда</h1><p class="page-subtitle">Меняйте плотность жидкости, плотность тела и глубину погружения, чтобы увидеть баланс веса и выталкивающей силы.</p></div></div>
        <div class="lab-layout">
          <div class="lab-main">
            <div class="panel"><div class="panel-header"><div class="panel-title">Тело в жидкости</div><span class="badge">ЖИВАЯ МОДЕЛЬ</span></div><div class="panel-body"><div class="canvas-wrap"><canvas id="buoyancyCanvas" width="900" height="430"></canvas><div class="canvas-hint">CANVAS / БАЛАНС СИЛ</div></div></div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Выталкивающая сила / Погружение</div></div><div class="panel-body"><div class="canvas-wrap"><canvas id="buoyancyChart" width="900" height="250"></canvas></div></div></div>
          </div>
          <aside class="lab-side">
            <div class="panel"><div class="panel-header"><div class="panel-title">Параметры</div></div><div class="panel-body controls">
              ${range("liqD","Плотность жидкости",500,1500,10,1000,"кг/м³")}
              ${range("bodyD","Плотность тела",200,1800,10,600,"кг/м³")}
              ${range("bodyV","Объём тела",.001,.01,.0001,.004,"м³")}
              ${range("subm","Доля погружения",0,1,.01,.7,"0–1")}
              <div class="button-row"><button class="btn btn-primary" id="resetB">СБРОСИТЬ</button><button class="btn" id="saveB">СОХРАНИТЬ</button></div>
            </div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Силы и масса</div></div><div class="panel-body"><div class="metric-grid">${metric("Вес тела","bWeight")}${metric("Архимедова сила","bArch")}${metric("Масса","bMass")}${metric("Результат","bState")}</div></div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Формулы</div></div><div class="panel-body"><div class="formula">Fₐ = ρgVпогр</div><div class="formula">P = mg</div><p class="explanation">Если выталкивающая сила больше веса, тело стремится всплыть. Если меньше — погружается.</p></div></div>
          </aside>
        </div>
        <div class="footer-line"><span>АРХИМЕД / МЕХАНИКА</span><span>МОДЕЛЬ: НЕВЯЗКАЯ ЖИДКОСТЬ</span></div>
      </section>`;
    [["liqD","densityLiquid"],["bodyD","densityBody"],["bodyV","volume"],["subm","submerged"]].forEach(([id,key])=>{const a=document.getElementById(id),b=document.getElementById(id+"Value");const sync=v=>{state[key]=Number(v);a.value=v;b.value=v;update();draw();chart()};a.addEventListener("input",e=>sync(e.target.value));b.addEventListener("input",e=>sync(e.target.value))});
    document.getElementById("resetB").addEventListener("click",()=>{state={densityLiquid:1000,densityBody:600,volume:.004,gravity:9.81,submerged:.7};["liqD","bodyD","bodyV","subm"].forEach((id,i)=>{const v=[1000,600,.004,.7][i];document.getElementById(id).value=v;document.getElementById(id+"Value").value=v});update();draw();chart()});
    document.getElementById("saveB").addEventListener("click",save);update();draw();chart();
  }
  function range(id,label,min,max,step,value,unit){return `<div class="control-block"><label>${label}</label><div class="control-row"><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}"><input class="control-value" type="number" id="${id}Value" min="${min}" max="${max}" step="${step}" value="${value}"></div><div class="small-note">${unit}</div></div>`}
  function metric(label,id){return `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value" id="${id}">—</div></div>`}
  function values(){const mass=state.densityBody*state.volume;const weight=mass*state.gravity;const arch=state.densityLiquid*state.gravity*state.volume*state.submerged;return{mass,weight,arch}}
  function update(){const v=values();set("bWeight",v.weight.toFixed(2)+" Н");set("bArch",v.arch.toFixed(2)+" Н");set("bMass",v.mass.toFixed(3)+" кг");set("bState",v.arch>v.weight?"ВСПЛЫВАЕТ":v.arch<v.weight?"ПОГРУЖАЕТСЯ":"БАЛАНС")}
  function set(id,v){const e=document.getElementById(id);if(e)e.textContent=v}
  function draw(){const c=document.getElementById("buoyancyCanvas"),ctx=c.getContext("2d"),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle="#0a0e13";ctx.fillRect(0,0,w,h);const waterY=225;ctx.fillStyle="rgba(57,213,231,.08)";ctx.fillRect(0,waterY,w,h-waterY);const size=70+state.volume*4000,x=w/2,y=waterY-30+state.submerged*60;ctx.fillStyle="#39d5e7";ctx.fillRect(x-size/2,y-size/2,size,size);const v=values();ctx.fillStyle="#e8f0f4";ctx.font="11px DM Mono,monospace";ctx.fillText(`Fₐ = ${v.arch.toFixed(2)} Н`,20,25);ctx.fillText(`P = ${v.weight.toFixed(2)} Н`,20,43);ctx.fillStyle="#60707c";ctx.fillText("жидкость",20,waterY-12)}
  function chart(){const c=document.getElementById("buoyancyChart"),ctx=c.getContext("2d"),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle="#0a0e13";ctx.fillRect(0,0,w,h);const l=52,r=18,t=18,b=34,max=1.0,lv=state.densityLiquid*state.gravity*state.volume;ctx.strokeStyle="#2a343e";ctx.beginPath();ctx.moveTo(l,t);ctx.lineTo(l,h-b);ctx.lineTo(w-r,h-b);ctx.stroke();ctx.fillStyle="#596874";ctx.font="9px DM Mono,monospace";ctx.fillText("Fₐ (Н)",7,14);ctx.fillText("погружение",w-80,h-10);ctx.strokeStyle="#39d5e7";ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=100;i++){const q=i/100,x=l+(w-l-r)*q,y=h-b-(h-t-b)*Math.min(lv*q,max)/max;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke()}
  function save(){const v=values();LabStorage.save({type:"BUOYANCY",name:"Сила Архимеда",parameters:{densityLiquid:state.densityLiquid,densityBody:state.densityBody,volume:state.volume,submerged:state.submerged},results:{weight:Number(v.weight.toFixed(5)),archimedesForce:Number(v.arch.toFixed(5)),state:v.arch>v.weight?"Всплывает":v.arch<v.weight?"Погружается":"Баланс"}});LabApp.showToast("Результат сохранён")}
  return{render}
})();
