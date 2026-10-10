window.Pendulum = (() => {
  let state;
  let animation;

  function render(targetId) {
    state = {
      running: false,
      time: 0,
      angle: Math.PI / 6,
      angularVelocity: 0,
      params: {length: 2.0, mass: 1.0, gravity: 9.81, initialAngle: 30},
      data: []
    };

    const target = document.getElementById(targetId);
    target.innerHTML = `
      <section class="page fade-in">
        <div class="page-heading">
          <div>
            <div class="eyebrow">Механика / Колебания</div>
            <h1>Математический маятник</h1>
            <p class="page-subtitle">Наблюдайте за колебаниями маятника и исследуйте, как длина и гравитация влияют на период.</p>
          </div>
        </div>

        <div class="lab-layout">
          <div class="lab-main">
            <div class="panel">
              <div class="panel-header">
                <div class="panel-title">Симуляция маятника</div>
                <span class="badge" id="pendulumStatus">ГОТОВО</span>
              </div>
              <div class="panel-body">
                <div class="canvas-wrap">
                  <canvas id="pendulumCanvas" width="900" height="430"></canvas>
                  <div class="canvas-hint">CANVAS / МОДЕЛЬ МАЯТНИКА</div>
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-header">
                <div class="panel-title">Угол / Время</div>
                <div class="chart-legend">ДАННЫЕ В РЕАЛЬНОМ ВРЕМЕНИ</div>
              </div>
              <div class="panel-body">
                <div class="canvas-wrap"><canvas id="pendulumChart" width="900" height="250"></canvas></div><div class="graph-caption"><span>График показывает последние измерения угла</span><span>θ(t)</span></div>
              </div>
            </div>
          </div>

          <aside class="lab-side">
            <div class="panel">
              <div class="panel-header"><div class="panel-title">Параметры</div></div>
              <div class="panel-body controls">
                ${rangeControl("length", "Длина", 0.5, 4, 0.1, 2, "м")}
                ${rangeControl("mass", "Масса", 0.2, 5, 0.1, 1, "кг")}
                ${rangeControl("gravity", "Гравитация", 1, 20, 0.01, 9.81, "м/с²")}
                ${rangeControl("initialAngle", "Начальный угол", 5, 60, 1, 30, "°")}
                <div class="button-row">
                  <button class="btn btn-primary" id="runP">ЗАПУСК</button>
                  <button class="btn" id="pauseP">ПАУЗА</button>
                  <button class="btn" id="resetP">СБРОС</button>
                </div>
                <button class="btn" id="saveP">СОХРАНИТЬ РЕЗУЛЬТАТ</button>
              </div>
            </div>

            <div class="panel">
              <div class="panel-header"><div class="panel-title">Текущие значения</div></div>
              <div class="panel-body">
                <div class="metric-grid">
                  ${metric("Период", "period")}
                  ${metric("Частота", "frequency")}
                  ${metric("Текущий угол", "angleNow")}
                  ${metric("Угловая скорость", "omega")}
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-header"><div class="panel-title">Формула</div></div>
              <div class="panel-body">
                <div class="formula">T = 2π√(L / g)</div>
                <p class="explanation">Для небольших углов период математического маятника в основном зависит от длины и ускорения свободного падения, а не от массы.</p>
              </div>
            </div>
          </aside>
        </div>

        <div class="footer-line">
          <span>МАЯТНИК / МЕХАНИКА</span>
          <span>МОДЕЛЬ: НЕЛИНЕЙНОЕ ДВИЖЕНИЕ</span>
        </div>
      </section>
    `;

    bind();
    reset();
  }

  function rangeControl(id, label, min, max, step, value, unit) {
    return `
      <div class="control-block">
        <label>${label}</label>
        <div class="control-row">
          <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}">
          <input class="control-value" type="number" id="${id}Value" min="${min}" max="${max}" step="${step}" value="${value}">
        </div>
        <div class="small-note">${unit}</div>
      </div>
    `;
  }

  function metric(label, id) {
    return `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value" id="${id}">—</div></div>`;
  }

  function bind() {
    ["length", "mass", "gravity", "initialAngle"].forEach(id => {
      const range = document.getElementById(id);
      const number = document.getElementById(id + "Value");
      const sync = value => {
        const safe = Number(value);
        if (!Number.isFinite(safe)) return;
        state.params[id] = safe;
        range.value = safe;
        number.value = safe;
        reset();
      };
      range.addEventListener("input", e => sync(e.target.value));
      number.addEventListener("input", e => sync(e.target.value));
    });

    document.getElementById("runP").addEventListener("click", run);
    document.getElementById("pauseP").addEventListener("click", pause);
    document.getElementById("resetP").addEventListener("click", reset);
    document.getElementById("saveP").addEventListener("click", save);
  }

  function period() {
    return 2 * Math.PI * Math.sqrt(state.params.length / state.params.gravity);
  }

  function reset() {
    if (animation) cancelAnimationFrame(animation);
    state.running = false;
    state.time = 0;
    state.angle = state.params.initialAngle * Math.PI / 180;
    state.angularVelocity = 0;
    state.data = [];

    setText("pendulumStatus", "ГОТОВО");
    updateMetrics();
    draw();
    drawChart();
  }

  function run() {
    if (state.running) return;
    state.running = true;
    setText("pendulumStatus", "РАБОТАЕТ");
    let last = performance.now();

    const tick = now => {
      if (!state.running) return;

      const dt = Math.min((now - last) / 1000, 0.03);
      last = now;

      const {gravity, length} = state.params;
      const acceleration = -(gravity / length) * Math.sin(state.angle);

      state.angularVelocity += acceleration * dt;
      state.angle += state.angularVelocity * dt;
      state.time += dt;

      if (!state.data.length || state.time - state.data[state.data.length - 1].t >= 0.035) {
        state.data.push({t: state.time, angle: state.angle * 180 / Math.PI});
      }

      updateMetrics();
      draw();
      drawChart();
      animation = requestAnimationFrame(tick);
    };

    animation = requestAnimationFrame(tick);
  }

  function pause() {
    state.running = false;
    if (animation) cancelAnimationFrame(animation);
    setText("pendulumStatus", "ПАУЗА");
  }

  function updateMetrics() {
    setText("period", period().toFixed(2) + " с");
    setText("frequency", (1 / period()).toFixed(3) + " Гц");
    setText("angleNow", (state.angle * 180 / Math.PI).toFixed(1) + " °");
    setText("omega", state.angularVelocity.toFixed(3) + " рад/с");
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function draw() {
    const canvas = document.getElementById("pendulumCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0a0e13";
    ctx.fillRect(0, 0, w, h);

    const centerX = w / 2;
    const top = 72;
    const lengthPx = Math.min(280, state.params.length * 85);
    const bobX = centerX + Math.sin(state.angle) * lengthPx;
    const bobY = top + Math.cos(state.angle) * lengthPx;

    ctx.strokeStyle = "#2f3b46";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, top);
    ctx.lineTo(w - 20, top);
    ctx.stroke();

    ctx.strokeStyle = "#778692";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 70, top);
    ctx.lineTo(centerX + 70, top);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, top);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    ctx.fillStyle = "#e2ebf0";
    ctx.beginPath();
    ctx.arc(centerX, top, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#39d5e7";
    ctx.beginPath();
    ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(57,213,231,.35)";
    ctx.beginPath();
    ctx.arc(bobX, bobY, 27, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#64737f";
    ctx.font = "10px DM Mono, monospace";
    ctx.fillText(`L = ${state.params.length.toFixed(1)} м`, 18, 25);
    ctx.fillText(`θ = ${(state.angle * 180 / Math.PI).toFixed(1)}°`, 18, 42);
  }

  function drawChart() {
    const canvas = document.getElementById("pendulumChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0a0e13";
    ctx.fillRect(0, 0, w, h);

    const left = 52, right = 18, top = 18, bottom = 34;

    ctx.strokeStyle = "#2a343e";
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, h - bottom);
    ctx.lineTo(w - right, h - bottom);
    ctx.stroke();

    ctx.fillStyle = "#596874";
    ctx.font = "9px DM Mono, monospace";
    ctx.fillText("угол", 10, 14);
    ctx.fillText("t (с)", w - 37, h - 10);

    if (!state.data.length) {
      ctx.fillText("Нажмите «ЗАПУСК», чтобы построить график", left + 12, h / 2);
      return;
    }

    const visible = state.data.slice(-180);
    const maxTime = Math.max(visible[visible.length - 1].t, 1);
    const maxAngle = Math.max(state.params.initialAngle + 5, 10);

    ctx.strokeStyle = "#39d5e7";
    ctx.lineWidth = 2;
    ctx.beginPath();

    visible.forEach((point, index) => {
      const x = left + (w - left - right) * (point.t / maxTime);
      const y = h - bottom - (h - top - bottom) * ((point.angle + maxAngle) / (2 * maxAngle));
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  }

  function save() {
    LabStorage.save({
      type: "PENDULUM",
      name: "Математический маятник",
      parameters: {...state.params},
      results: {
        period: Number(period().toFixed(3)),
        frequency: Number((1 / period()).toFixed(4)),
        currentAngle: Number((state.angle * 180 / Math.PI).toFixed(2))
      }
    });
    LabApp.showToast("Результат маятника сохранён");
  }

  return {render};
})();
