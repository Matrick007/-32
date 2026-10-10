window.Optics = (() => {
  let state;

  function render(targetId) {
    state = {focal: 10, objectDistance: 25, objectHeight: 6};

    const target=document.getElementById(targetId);
    target.innerHTML=`
      <section class="page fade-in">
        <div class="page-heading">
          <div>
            <div class="eyebrow">Оптика / Геометрические лучи</div>
            <h1>Симуляция линзы</h1>
            <p class="page-subtitle">Меняйте положение объекта и фокусное расстояние, чтобы увидеть изменение положения и увеличения изображения.</p>
          </div>
        </div>

        <div class="lab-layout">
          <div class="lab-main">
            <div class="panel">
              <div class="panel-header"><div class="panel-title">Оптическая скамья</div><span class="badge" id="opticsStatus">ГОТОВО</span></div>
              <div class="panel-body">
                <div class="canvas-wrap">
                  <canvas id="opticsCanvas" width="900" height="430"></canvas>
                  <div class="canvas-hint">CANVAS / ХОД ЛУЧЕЙ ЧЕРЕЗ ЛИНЗУ</div>
                </div>
              </div>
            </div>
          </div>

          <aside class="lab-side">
            <div class="panel">
              <div class="panel-header"><div class="panel-title">Параметры</div></div>
              <div class="panel-body controls">
                ${rangeControl("focalO","Фокусное расстояние",5,20,0.5,10,"cm")}
                ${rangeControl("distanceO","Расстояние до объекта",6,50,0.5,25,"cm")}
                ${rangeControl("heightO","Высота объекта",2,12,0.5,6,"cm")}
                <div class="button-row">
                  <button class="btn btn-primary" id="runO">RUN</button>
                  <button class="btn" id="resetO">RESET</button>
                </div>
                <button class="btn" id="saveO">SAVE RESULT</button>
              </div>
            </div>

            <div class="panel">
              <div class="panel-header"><div class="panel-title">Расчёт изображения</div></div>
              <div class="panel-body">
                <div class="metric-grid">
                  ${metric("Расстояние до изображения","imageDistance")}
                  ${metric("Увеличение","magnification")}
                  ${metric("Высота изображения","imageHeight")}
                  ${metric("Тип изображения","imageType")}
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-header"><div class="panel-title">Формула линзы</div></div>
              <div class="panel-body">
                <div class="formula">1/f = 1/d₀ + 1/dᵢ</div>
                <div class="formula">m = −dᵢ / d₀</div>
                <p class="explanation">Для собирающей линзы используется стандартное уравнение тонкой линзы. На рисунке показана упрощённая геометрическая конструкция лучей.</p>
              </div>
            </div>
          </aside>
        </div>

        <div class="footer-line">
          <span>ЛИНЗА / ОПТИКА</span>
          <span>МОДЕЛЬ: ТОНКАЯ СОБИРАЮЩАЯ ЛИНЗА</span>
        </div>
      </section>
    `;

    bind();
    update();
    draw();
  }

  function rangeControl(id,label,min,max,step,value,unit){
    return `<div class="control-block"><label>${label}</label><div class="control-row"><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}"><input class="control-value" type="number" id="${id}Value" min="${min}" max="${max}" step="${step}" value="${value}"></div><div class="small-note">${unit}</div></div>`;
  }
  function metric(label,id){return `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value" id="${id}">—</div></div>`;}

  function bind(){
    [["focalO","focal"],["distanceO","objectDistance"],["heightO","objectHeight"]].forEach(([id,key])=>{
      const a=document.getElementById(id),b=document.getElementById(id+"Value");
      const sync=v=>{state[key]=Number(v);a.value=v;b.value=v;update();draw();};
      a.addEventListener("input",e=>sync(e.target.value));
      b.addEventListener("input",e=>sync(e.target.value));
    });
    document.getElementById("runO").addEventListener("click",()=>{document.getElementById("opticsStatus").textContent="РАБОТАЕТ";update();draw();});
    document.getElementById("resetO").addEventListener("click",()=>{state={focal:10,objectDistance:25,objectHeight:6};document.getElementById("focalO").value=10;document.getElementById("focalOValue").value=10;document.getElementById("distanceO").value=25;document.getElementById("distanceOValue").value=25;document.getElementById("heightO").value=6;document.getElementById("heightOValue").value=6;document.getElementById("opticsStatus").textContent="ГОТОВО";update();draw();});
    document.getElementById("saveO").addEventListener("click",save);
    window.addEventListener("resize",draw);
  }

  function calculate(){
    const inv=1/state.focal-1/state.objectDistance;
    const di=Math.abs(inv)<1e-9 ? Infinity : 1/inv;
    const m=Number.isFinite(di) ? -di/state.objectDistance : Infinity;
    const hi=Number.isFinite(m) ? state.objectHeight*m : Infinity;
    let type="Virtual";
    if(Number.isFinite(di) && di>0)type="Действительное";
    if(state.objectDistance < state.focal)type="Мнимое / прямое";
    else if(state.objectDistance === state.focal)type="Изображения в конечной точке нет";
    else type="Действительное / inverted";
    return {di,m,hi,type};
  }

  function update(){
    const c=calculate();
    set("imageDistance",Number.isFinite(c.di)?c.di.toFixed(2)+" cm":"∞");
    set("magnification",Number.isFinite(c.m)?c.m.toFixed(2)+"×":"∞");
    set("imageHeight",Number.isFinite(c.hi)?c.hi.toFixed(2)+" cm":"∞");
    set("imageType",c.type);
  }

  function set(id,v){const e=document.getElementById(id);if(e)e.textContent=v;}

  function draw(){
    const canvas=document.getElementById("opticsCanvas");if(!canvas)return;
    const ctx=canvas.getContext("2d"),w=canvas.width,h=canvas.height;
    ctx.clearRect(0,0,w,h);ctx.fillStyle="#0a0e13";ctx.fillRect(0,0,w,h);

    const axisY=h/2, lensX=w/2, scale=5;
    const c=calculate();

    ctx.strokeStyle="#53616f";ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(20,axisY);ctx.lineTo(w-20,axisY);ctx.stroke();

    // focal points
    const fPx=state.focal*scale;
    ctx.strokeStyle="#35555c";
    [lensX-fPx,lensX+fPx].forEach(x=>{ctx.beginPath();ctx.moveTo(x,axisY-12);ctx.lineTo(x,axisY+12);ctx.stroke();});
    ctx.fillStyle="#5f6e7a";ctx.font="9px DM Mono,monospace";
    ctx.fillText("F",lensX-fPx-3,axisY+28);ctx.fillText("F",lensX+fPx-3,axisY+28);

    // lens
    ctx.strokeStyle="#39d5e7";ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(lensX,axisY-150);ctx.quadraticCurveTo(lensX-20,axisY,lensX,axisY+150);
    ctx.quadraticCurveTo(lensX+20,axisY,lensX,axisY-150);ctx.stroke();
    ctx.fillStyle="#667582";ctx.font="9px DM Mono,monospace";ctx.fillText("LENS",lensX-18,axisY-162);

    // object
    const objX=lensX-state.objectDistance*scale;
    const objH=state.objectHeight*scale;
    drawArrow(ctx,objX,axisY,objX,axisY-objH,"#dfe8ee");
    ctx.fillStyle="#667582";ctx.fillText("ОБЪЕКТ",Math.max(10,objX-24),axisY-objH-12);

    if(Number.isFinite(c.di)) {
      const imgX=lensX+c.di*scale;
      const imgH=Math.abs(c.hi)*scale;
      const direction=c.hi >= 0 ? 1 : -1;
      drawArrow(ctx,imgX,axisY,imgX,axisY-direction*imgH,"#39d5e7");
      ctx.fillStyle="#667582";ctx.fillText("ИЗОБРАЖЕНИЕ",Math.min(w-75,imgX+8),axisY-direction*imgH-12);

      // principal ray
      ctx.strokeStyle="#52727a";ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(objX,axisY-objH);ctx.lineTo(lensX,axisY-objH);ctx.lineTo(imgX,axisY-direction*imgH);ctx.stroke();

      // center ray
      ctx.strokeStyle="#365a61";
      ctx.beginPath();ctx.moveTo(objX,axisY-objH);ctx.lineTo(imgX,axisY-direction*imgH);ctx.stroke();
    } else {
      ctx.fillStyle="#c49b5a";ctx.font="10px DM Mono,monospace";ctx.fillText("ИЗОБРАЖЕНИЕ AT INFINITY",lensX+16,axisY-30);
    }

    ctx.fillStyle="#53616f";ctx.font="9px DM Mono,monospace";
    ctx.fillText(`f = ${state.focal.toFixed(1)} cm`,20,24);
    ctx.fillText(`d₀ = ${state.objectDistance.toFixed(1)} cm`,20,41);
  }

  function drawArrow(ctx,x1,y1,x2,y2,color){
    ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    const dir=y2<y1?-1:1;
    ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-5,y2+dir*11);ctx.lineTo(x2+5,y2+dir*11);ctx.closePath();ctx.fill();
  }

  function save(){
    const c=calculate();
    LabStorage.save({
      type:"LENS_SIMULATION",
      name:"Симуляция линзы",
      parameters:{focal:state.focal,objectDistance:state.objectDistance,objectHeight:state.objectHeight},
      results:{imageDistance:Number.isFinite(c.di)?Number(c.di.toFixed(4)):null,magnification:Number.isFinite(c.m)?Number(c.m.toFixed(4)):null,imageHeight:Number.isFinite(c.hi)?Number(c.hi.toFixed(4)):null,type:c.type}
    });
    LabApp.showToast("Результат линзы сохранён");
  }

  return {render};
})();
