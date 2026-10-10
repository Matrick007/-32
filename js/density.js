window.Density = (() => {
  let state;
  const materials={Вода:1000,Алюминий:2700,Медь:8960,Железо:7870,Дерево:600};
  function render(targetId){
    state={material:"Алюминий",mass:540,volume:200};
    const target=document.getElementById(targetId);
    target.innerHTML=`
      <section class="page fade-in">
        <div class="page-heading"><div><div class="eyebrow">Физика / Вещество</div><h1>Определение плотности</h1><p class="page-subtitle">Изменяйте массу и объём тела, рассчитывайте плотность и сравнивайте результат с известными материалами.</p></div></div>
        <div class="lab-layout">
          <div class="lab-main">
            <div class="panel"><div class="panel-header"><div class="panel-title">Визуализация тела</div><span class="badge" id="densityStatus">ГОТОВО</span></div><div class="panel-body"><div class="canvas-wrap"><canvas id="densityCanvas" width="900" height="430"></canvas><div class="canvas-hint">CANVAS / МОДЕЛЬ ОБЪЁМА И МАССЫ</div></div></div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Сравнение плотностей</div></div><div class="panel-body"><div class="canvas-wrap"><canvas id="densityChart" width="900" height="250"></canvas></div></div></div>
          </div>
          <aside class="lab-side">
            <div class="panel"><div class="panel-header"><div class="panel-title">Параметры</div></div><div class="panel-body controls">
              <div class="control-block"><label>Материал для сравнения</label><select id="material">${Object.keys(materials).map(m=>`<option>${m}</option>`).join("")}</select></div>
              ${range("densityMass","Масса",50,2000,10,540,"г")}
              ${range("densityVolume","Объём",50,1000,10,200,"см³")}
              <div class="button-row"><button class="btn btn-primary" id="runD">РАССЧИТАТЬ</button><button class="btn" id="resetD">СБРОС</button></div>
              <button class="btn" id="saveD">СОХРАНИТЬ РЕЗУЛЬТАТ</button>
            </div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Результат</div></div><div class="panel-body"><div class="metric-grid">${metric("Масса","dm")}${metric("Объём","dv")}${metric("Плотность","dr")}${metric("Материал","dmat")}</div></div></div>
            <div class="panel"><div class="panel-header"><div class="panel-title">Формула</div></div><div class="panel-body"><div class="formula">ρ = m / V</div><p class="explanation">Плотность показывает, какая масса приходится на единицу объёма вещества.</p></div></div>
          </aside>
        </div>
        <div class="footer-line"><span>ПЛОТНОСТЬ / ФИЗИКА</span><span>МОДЕЛЬ: ОДНОРОДНОЕ ТЕЛО</span></div>
      </section>`;
    document.getElementById("material").addEventListener("change",e=>{state.material=e.target.value;document.getElementById("densityStatus").textContent="ГОТОВО";update();draw();});
    [["densityMass","mass"],["densityVolume","volume"]].forEach(([id,key])=>{const a=document.getElementById(id),b=document.getElementById(id+"Value");const sync=v=>{state[key]=Number(v);a.value=v;b.value=v;update();draw()};a.addEventListener("input",e=>sync(e.target.value));b.addEventListener("input",e=>sync(e.target.value));});
    document.getElementById("runD").addEventListener("click",()=>{document.getElementById("densityStatus").textContent="РАССЧИТАНО";update();draw();chart();LabApp.showToast("Плотность рассчитана")});
    document.getElementById("resetD").addEventListener("click",()=>{state={material:"Алюминий",mass:540,volume:200};document.getElementById("material").value="Алюминий";document.getElementById("densityMass").value=540;document.getElementById("densityMassValue").value=540;document.getElementById("densityVolume").value=200;document.getElementById("densityVolumeValue").value=200;document.getElementById("densityStatus").textContent="ГОТОВО";update();draw();chart()});
    document.getElementById("saveD").addEventListener("click",save);update();draw();chart();
  }
  function range(id,label,min,max,step,value,unit){return `<div class="control-block"><label>${label}</label><div class="control-row"><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}"><input class="control-value" type="number" id="${id}Value" min="${min}" max="${max}" step="${step}" value="${value}"></div><div class="small-note">${unit}</div></div>`}
  function metric(label,id){return `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value" id="${id}">—</div></div>`}
  function density(){return state.mass/state.volume*1000}
  function update(){set("dm",state.mass.toFixed(0)+" г");set("dv",state.volume.toFixed(0)+" см³");set("dr",density().toFixed(0)+" кг/м³");set("dmat",state.material)}
  function set(id,v){const e=document.getElementById(id);if(e)e.textContent=v}
  function draw(){const c=document.getElementById("densityCanvas"),ctx=c.getContext("2d"),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle="#0a0e13";ctx.fillRect(0,0,w,h);const size=120+Math.min(120,state.volume/5),cx=w/2,cy=h/2;ctx.strokeStyle="#667582";ctx.lineWidth=2;ctx.strokeRect(cx-size/2,cy-size/2,size,size);ctx.fillStyle="rgba(57,213,231,.16)";ctx.fillRect(cx-size/2+2,cy-size/2+2,size-4,size-4);ctx.fillStyle="#39d5e7";ctx.font="16px DM Mono,monospace";ctx.fillText(`${density().toFixed(0)} кг/м³`,cx-70,cy+5);ctx.fillStyle="#61717d";ctx.font="10px DM Mono,monospace";ctx.fillText(`m = ${state.mass.toFixed(0)} г`,cx-size/2,cy+size/2+25);ctx.fillText(`V = ${state.volume.toFixed(0)} см³`,cx-size/2,cy+size/2+41)}
  function chart(){const c=document.getElementById("densityChart"),ctx=c.getContext("2d"),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle="#0a0e13";ctx.fillRect(0,0,w,h);const arr=Object.entries(materials),max=Math.max(...arr.map(([,v])=>v));ctx.fillStyle="#596874";ctx.font="9px DM Mono,monospace";arr.forEach(([name,value],i)=>{const y=30+i*38;ctx.fillText(name,20,y+10);ctx.fillStyle="#24323b";ctx.fillRect(110,y,w-150,18);ctx.fillStyle="#39d5e7";ctx.fillRect(110,y,(w-150)*(value/max),18);ctx.fillStyle="#7b8a96";ctx.fillText(String(value)+" кг/м³",Math.min(w-125,115+(w-150)*(value/max)),y+12)})}
  function save(){LabStorage.save({type:"DENSITY",name:"Определение плотности",parameters:{material:state.material,mass:state.mass,volume:state.volume},results:{density:Number(density().toFixed(3))}});LabApp.showToast("Результат по плотности сохранён")}
  return {render}
})();
