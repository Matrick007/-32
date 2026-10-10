window.GasLaw = (() => {
  let state;
  function render(targetId){
    state={pressure:101.3,volume:10};
    const target=document.getElementById(targetId);
    target.innerHTML=`
      <section class="page fade-in">
        <div class="page-heading"><div><div class="eyebrow">Термодинамика / Газ</div><h1>Закон Бойля — Мариотта</h1><p class="page-subtitle">Сжимайте или расширяйте идеализированный газ и наблюдайте обратную связь между давлением и объёмом.</p></div></div>
        <div class="lab-layout">
          <div class="lab-main">
            <div class="panel"><div class="panel-header"><div class="panel-title">Сосуд с газом</div><span class="badge">T = CONST</span></div><div class="panel-body"><div class="canvas-wrap"><canvas id="gasCanvas" width="900" height="430"></canvas><div class="canvas-hint">CANVAS / ИДЕАЛИЗИРОВАННЫЙ ГАЗ</div></div></div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Давление / Объём</div><span class="chart-legend">P·V = CONST</span></div><div class="panel-body"><div class="canvas-wrap"><canvas id="gasChart" width="900" height="250"></canvas></div></div></div>
          </div>
          <aside class="lab-side">
            <div class="panel"><div class="panel-header"><div class="panel-title">Параметры</div></div><div class="panel-body controls">
              ${range("gasV","Объём",2,20,.1,10,"л")}
              ${range("gasP","Давление",20,500,1,101.3,"кПа")}
              <div class="button-row"><button class="btn btn-primary" id="runG">ПРИМЕНИТЬ</button><button class="btn" id="resetG">СБРОС</button></div>
              <button class="btn" id="saveG">СОХРАНИТЬ РЕЗУЛЬТАТ</button>
            </div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Расчёты</div></div><div class="panel-body"><div class="metric-grid">${metric("Давление","gPressure")}${metric("Объём","gVolume")}${metric("P · V","gProduct")}${metric("Относительное изменение","gRatio")}</div></div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Формула</div></div><div class="panel-body"><div class="formula">P₁V₁ = P₂V₂</div><div class="formula">P ∝ 1/V</div><p class="explanation">При постоянной температуре уменьшение объёма приводит к росту давления.</p></div></div>
          </aside>
        </div>
        <div class="footer-line"><span>БОЙЛЬ — МАРИОТТ / ТЕРМОДИНАМИКА</span><span>МОДЕЛЬ: T = CONST</span></div>
      </section>`;
    [["gasV","volume"],["gasP","pressure"]].forEach(([id,key])=>{const a=document.getElementById(id),b=document.getElementById(id+"Value");const sync=v=>{state[key]=Number(v);a.value=v;b.value=v;update();draw();chart()};a.addEventListener("input",e=>sync(e.target.value));b.addEventListener("input",e=>sync(e.target.value))});
    document.getElementById("runG").addEventListener("click",()=>{update();draw();chart();LabApp.showToast("Параметры газа применены")});
    document.getElementById("resetG").addEventListener("click",()=>{state={pressure:101.3,volume:10};document.getElementById("gasV").value=10;document.getElementById("gasVValue").value=10;document.getElementById("gasP").value=101.3;document.getElementById("gasPValue").value=101.3;update();draw();chart()});
    document.getElementById("saveG").addEventListener("click",save);update();draw();chart();
  }
  function range(id,label,min,max,step,value,unit){return `<div class="control-block"><label>${label}</label><div class="control-row"><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}"><input class="control-value" type="number" id="${id}Value" min="${min}" max="${max}" step="${step}" value="${value}"></div><div class="small-note">${unit}</div></div>`}
  function metric(label,id){return `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value" id="${id}">—</div></div>`}
  function update(){set("gPressure",state.pressure.toFixed(1)+" кПа");set("gVolume",state.volume.toFixed(1)+" л");set("gProduct",(state.pressure*state.volume).toFixed(1)+" кПа·л");set("gRatio",(state.pressure/101.3).toFixed(2)+"×")}
  function set(id,v){const e=document.getElementById(id);if(e)e.textContent=v}
  function draw(){const c=document.getElementById("gasCanvas"),ctx=c.getContext("2d"),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle="#0a0e13";ctx.fillRect(0,0,w,h);const left=270,top=80,width=Math.max(130,Math.min(360,state.volume*18)),height=245;ctx.strokeStyle="#6d7c87";ctx.strokeRect(left,top,width,height);const n=Math.round(15+state.pressure/10);for(let i=0;i<n;i++){const x=left+15+((i*47)%Math.max(30,width-30)),y=top+20+((i*83)%Math.max(30,height-40));ctx.fillStyle="#39d5e7";ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill()}ctx.fillStyle="#e2ebef";ctx.font="16px DM Mono,monospace";ctx.fillText(`${state.pressure.toFixed(1)} кПа`,30,30);ctx.fillText(`${state.volume.toFixed(1)} л`,30,52);ctx.fillStyle="#5d6d78";ctx.font="10px DM Mono,monospace";ctx.fillText("ИДЕАЛИЗИРОВАННЫЕ ЧАСТИЦЫ",30,h-24)}
  function chart(){const c=document.getElementById("gasChart"),ctx=c.getContext("2d"),w=c.width,h=c.height,l=52,r=18,t=18,b=34;ctx.clearRect(0,0,w,h);ctx.fillStyle="#0a0e13";ctx.fillRect(0,0,w,h);ctx.strokeStyle="#2a343e";ctx.beginPath();ctx.moveTo(l,t);ctx.lineTo(l,h-b);ctx.lineTo(w-r,h-b);ctx.stroke();ctx.fillStyle="#596874";ctx.font="9px DM Mono,monospace";ctx.fillText("P (кПа)",6,14);ctx.fillText("V (л)",w-33,h-10);const K=state.pressure*state.volume,maxP=500;ctx.strokeStyle="#39d5e7";ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=120;i++){const V=2+18*i/120,P=Math.min(maxP,K/V),x=l+(w-l-r)*(V-2)/18,y=h-b-(h-t-b)*P/maxP;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke();const x=l+(w-l-r)*(state.volume-2)/18,y=h-b-(h-t-b)*Math.min(state.pressure,maxP)/maxP;ctx.fillStyle="#edf3f8";ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(57,213,231,.4)";ctx.beginPath();ctx.arc(x,y,12,0,Math.PI*2);ctx.stroke()}
  function save(){LabStorage.save({type:"GAS_LAW",name:"Закон Бойля — Мариотта",parameters:{pressure:state.pressure,volume:state.volume},results:{product:Number((state.pressure*state.volume).toFixed(4))}});LabApp.showToast("Результат сохранён")}
  return{render}
})();
