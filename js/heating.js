window.Heating = (() => {
  let state, animation;
  function render(targetId){
    state={running:false,t:0,mass:1,specificHeat:900,initialTemperature:20,environment:20,power:500};
    const target=document.getElementById(targetId);
    target.innerHTML=`
      <section class="page fade-in">
        <div class="page-heading"><div><div class="eyebrow">Термодинамика / Нагрев</div><h1>Нагрев тела</h1><p class="page-subtitle">Подавайте тепловую мощность и наблюдайте, как температура объекта меняется со временем.</p></div></div>
        <div class="lab-layout">
          <div class="lab-main">
            <div class="panel"><div class="panel-header"><div class="panel-title">Симуляция нагрева</div><span class="badge" id="heatStatus">ГОТОВО</span></div><div class="panel-body"><div class="canvas-wrap"><canvas id="heatCanvas" width="900" height="430"></canvas><div class="canvas-hint">CANVAS / ТЕПЛОВАЯ МОДЕЛЬ</div></div></div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Температура / Время</div></div><div class="panel-body"><div class="canvas-wrap"><canvas id="heatChart" width="900" height="250"></canvas></div><div class="graph-caption"><span>Температура пересчитывается каждый кадр</span><span>T(t)</span></div></div></div>
          </div>
          <aside class="lab-side">
            <div class="panel"><div class="panel-header"><div class="panel-title">Параметры</div></div><div class="panel-body controls">
              ${range("heatMass","Масса",0.2,5,.1,1,"кг")}
              ${range("heatSpecific","Удельная теплоёмкость",300,4000,50,900,"Дж/(кг·°C)")}
              ${range("heatInitial","Начальная температура",0,100,1,20,"°C")}
              ${range("heatPower","Мощность нагрева",50,2000,10,500,"Вт")}
              <div class="button-row"><button class="btn btn-primary" id="runT">ЗАПУСК</button><button class="btn" id="pauseT">ПАУЗА</button><button class="btn" id="resetT">СБРОС</button></div>
              <button class="btn" id="saveT">СОХРАНИТЬ РЕЗУЛЬТАТ</button>
            </div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Текущие значения</div></div><div class="panel-body"><div class="metric-grid">${metric("Температура","thTemp")}${metric("Время","thTime")}${metric("Полученное тепло","thQ")}${metric("Мощность","thPower")}</div></div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Формулы</div></div><div class="panel-body"><div class="formula">Q = Pt</div><div class="formula">Q = cmΔT</div><div class="formula">ΔT = Pt / cm</div><p class="explanation">Модель идеализирована: потери тепла в окружающую среду не учитываются.</p></div></div>
          </aside>
        </div>
        <div class="footer-line"><span>НАГРЕВ / ТЕРМОДИНАМИКА</span><span>МОДЕЛЬ: БЕЗ ТЕПЛОВЫХ ПОТЕРЬ</span></div>
      </section>`;
    [["heatMass","mass"],["heatSpecific","specificHeat"],["heatInitial","initialTemperature"],["heatPower","power"]].forEach(([id,key])=>{const a=document.getElementById(id),b=document.getElementById(id+"Value");const sync=v=>{state[key]=Number(v);a.value=v;b.value=v;reset()};a.addEventListener("input",e=>sync(e.target.value));b.addEventListener("input",e=>sync(e.target.value));});
    document.getElementById("runT").addEventListener("click",run);document.getElementById("pauseT").addEventListener("click",pause);document.getElementById("resetT").addEventListener("click",reset);document.getElementById("saveT").addEventListener("click",save);
    reset();
  }
  function range(id,label,min,max,step,value,unit){return `<div class="control-block"><label>${label}</label><div class="control-row"><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}"><input class="control-value" type="number" id="${id}Value" min="${min}" max="${max}" step="${step}" value="${value}"></div><div class="small-note">${unit}</div></div>`}
  function metric(label,id){return `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value" id="${id}">—</div></div>`}
  function temperature(){return state.initialTemperature + state.power*state.t/(state.mass*state.specificHeat)}
  function reset(){if(animation)cancelAnimationFrame(animation);state.running=false;state.t=0;set("heatStatus","ГОТОВО");update();draw();chart()}
  function run(){if(state.running)return;state.running=true;set("heatStatus","РАБОТАЕТ");let last=performance.now();const tick=now=>{if(!state.running)return;const dt=Math.min((now-last)/1000,.04);last=now;state.t+=dt;update();draw();chart();animation=requestAnimationFrame(tick)};animation=requestAnimationFrame(tick)}
  function pause(){state.running=false;if(animation)cancelAnimationFrame(animation);set("heatStatus","ПАУЗА")}
  function set(id,v){const e=document.getElementById(id);if(e)e.textContent=v}
  function update(){set("thTemp",temperature().toFixed(2)+" °C");set("thTime",state.t.toFixed(1)+" с");set("thQ",(state.power*state.t).toFixed(1)+" Дж");set("thPower",state.power.toFixed(0)+" Вт")}
  function draw(){const c=document.getElementById("heatCanvas"),ctx=c.getContext("2d"),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle="#0a0e13";ctx.fillRect(0,0,w,h);const T=Math.min(temperature(),200),ratio=Math.max(0,Math.min(1,(T-20)/180));ctx.fillStyle=`rgba(57,213,231,${.10+ratio*.35})`;ctx.fillRect(250,110,400,210);ctx.strokeStyle="#73818e";ctx.strokeRect(250,110,400,210);ctx.fillStyle="#dfe8ee";ctx.font="18px DM Mono,monospace";ctx.fillText(`${T.toFixed(1)} °C`,390,220);ctx.fillStyle="#5d6e79";ctx.font="10px DM Mono,monospace";ctx.fillText(`Q = ${(state.power*state.t).toFixed(0)} Дж`,20,25);ctx.fillText(`t = ${state.t.toFixed(1)} с`,20,42)}
  function chart(){const c=document.getElementById("heatChart"),ctx=c.getContext("2d"),w=c.width,h=c.height,l=52,r=18,t=18,b=34;ctx.clearRect(0,0,w,h);ctx.fillStyle="#0a0e13";ctx.fillRect(0,0,w,h);ctx.strokeStyle="#2a343e";ctx.beginPath();ctx.moveTo(l,t);ctx.lineTo(l,h-b);ctx.lineTo(w-r,h-b);ctx.stroke();ctx.fillStyle="#596874";ctx.font="9px DM Mono,monospace";ctx.fillText("T (°C)",6,14);ctx.fillText("t (с)",w-35,h-10);const maxT=Math.max(state.t,10),maxTemp=Math.max(temperature(),40);ctx.strokeStyle="#39d5e7";ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=120;i++){const time=maxT*i/120,temp=state.initialTemperature+state.power*time/(state.mass*state.specificHeat);const x=l+(w-l-r)*time/maxT,y=h-b-(h-t-b)*(temp/maxTemp);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke()}
  function save(){LabStorage.save({type:"HEATING",name:"Нагрев тела",parameters:{mass:state.mass,specificHeat:state.specificHeat,initialTemperature:state.initialTemperature,power:state.power},results:{temperature:Number(temperature().toFixed(3)),time:Number(state.t.toFixed(3)),heat:Number((state.power*state.t).toFixed(3))}});LabApp.showToast("Результат нагрева сохранён")}
  return {render}
})();
