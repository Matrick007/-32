window.LabApp = (() => {
  const app = document.getElementById('app');
  const breadcrumb = document.getElementById('breadcrumb');
  const sidebar = document.getElementById('sidebar');
  const mobileMenu = document.getElementById('mobileMenu');

  const categoryNames = {
    mechanics:'Механика',
    physics:'Физика',
    electricity:'Электричество',
    optics:'Оптика',
    thermo:'Термодинамика'
  };
  const categoryOrder=['mechanics','physics','electricity','optics','thermo'];

  const experiments={
    projectile:{title:'Движение тела под углом',category:'mechanics',symbol:'↗',code:'M-01',description:'Траектории, дальность и высота полёта.',render:()=>Projectile.render('app')},
    pendulum:{title:'Математический маятник',category:'mechanics',symbol:'◉',code:'M-02',description:'Периодические колебания механической системы.',render:()=>Pendulum.render('app')},
    freefall:{title:'Свободное падение',category:'mechanics',symbol:'↓',code:'M-03',description:'Ускоренное движение тела в поле тяжести.',render:()=>FreeFall.render('app')},
    hooke:{title:'Закон Гука',category:'mechanics',symbol:'≋',code:'M-04',description:'Деформация и упругие свойства пружины.',render:()=>Hooke.render('app')},
    friction:{title:'Сила трения',category:'mechanics',symbol:'⇆',code:'M-05',description:'Сопротивление движению и момент срыва.',render:()=>Friction.render('app')},
    buoyancy:{title:'Сила Архимеда',category:'mechanics',symbol:'≈',code:'M-06',description:'Выталкивающая сила и баланс тела в жидкости.',render:()=>Buoyancy.render('app')},
    uniform:{title:'Равномерное движение',category:'mechanics',symbol:'→',code:'M-07',description:'Путь тела при постоянной скорости.',render:()=>UniformMotion.render('app')},
    newton:{title:'Второй закон Ньютона',category:'mechanics',symbol:'F',code:'M-08',description:'Связь силы, массы и ускорения.',render:()=>NewtonSecond.render('app')},
    collision:{title:'Столкновение тел',category:'mechanics',symbol:'↔',code:'M-09',description:'Импульс и неупругое столкновение.',render:()=>Collision.render('app')},
    workpower:{title:'Работа и мощность',category:'mechanics',symbol:'W',code:'M-10',description:'Работа силы и скорость передачи энергии.',render:()=>WorkPower.render('app')},
    density:{title:'Определение плотности',category:'physics',symbol:'ρ',code:'P-01',description:'Масса, объём и характеристика вещества.',render:()=>Density.render('app')},
    energy:{title:'Закон сохранения энергии',category:'physics',symbol:'Σ',code:'P-02',description:'Переход потенциальной энергии в кинетическую.',render:()=>Energy.render('app')},
    electricity:{title:'Закон Ома',category:'electricity',symbol:'Ω',code:'E-01',description:'Напряжение, сопротивление и ток.',render:()=>Electricity.render('app')},
    circuit:{title:'Последовательная и параллельная цепь',category:'electricity',symbol:'⊕',code:'E-02',description:'Сравнение способов соединения элементов.',render:()=>Circuit.render('app')},
    optics:{title:'Линза',category:'optics',symbol:'◒',code:'O-01',description:'Построение изображения и ход лучей.',render:()=>Optics.render('app')},
    refraction:{title:'Преломление света',category:'optics',symbol:'∠',code:'O-02',description:'Переход света между оптическими средами.',render:()=>Refraction.render('app')},
    mirror:{title:'Сферическое зеркало',category:'optics',symbol:'◓',code:'O-03',description:'Построение изображения в вогнутом зеркале.',render:()=>Mirror.render('app')},
    heating:{title:'Нагрев тела',category:'thermo',symbol:'Δ',code:'T-01',description:'Температура, мощность и переданная энергия.',render:()=>Heating.render('app')},
    gaslaw:{title:'Закон Бойля — Мариотта',category:'thermo',symbol:'↔',code:'T-02',description:'Давление и объём при постоянной температуре.',render:()=>GasLaw.render('app')},
    thermal:{title:'Тепловое расширение',category:'thermo',symbol:'⇔',code:'T-03',description:'Изменение размеров тела при нагреве.',render:()=>ThermalExpansion.render('app')}
  };

  const experimentDescriptions={
    projectile:['Траектория подчиняется сразу двум движениям: горизонтальному и вертикальному.','Наблюдайте за высотой, дальностью, скоростью и текущей точкой.','Изменение одного параметра меняет всю форму полёта.'],
    pendulum:['Маятник периодически обменивает потенциальную и кинетическую энергию.','Следите за амплитудой, частотой и живым графиком угла.','Длина маятника сильнее всего влияет на его период.'],
    freefall:['Гравитация сообщает телу постоянное ускорение вниз.','Наблюдайте ускорение и зависимость скорости от времени.','Без сопротивления воздуха скорость возрастает равномерно.'],
    hooke:['Пружина сопротивляется растяжению упругой силой.','Меняйте силу и жёсткость и наблюдайте деформацию.','В линейной модели сила прямо пропорциональна удлинению.'],
    friction:['Сначала внешняя сила компенсируется трением.','Следите за моментом срыва бруска и ростом скорости.','После преодоления силы трения возникает ускорение.'],
    buoyancy:['Тело и жидкость взаимодействуют через вес и выталкивающую силу.','Смотрите на положение тела и баланс двух сил.','Сила Архимеда связана с объёмом вытесненной жидкости.'],
    uniform:['Здесь нет ускорения: скорость остаётся постоянной.','Следите за линейным ростом пути и текущей координатой.','Путь при таком движении прямо пропорционален времени.'],
    newton:['Ускорение показывает, насколько быстро меняется скорость тела.','Меняйте массу и силу и наблюдайте результат.','Ускорение прямо пропорционально силе и обратно пропорционально массе.'],
    collision:['Столкновение позволяет наблюдать перераспределение импульса.','Сравнивайте характеристики двух тел до и после контакта.','В идеальной замкнутой системе суммарный импульс сохраняется.'],
    workpower:['Работа показывает передачу энергии силой через перемещение.','Изменяйте силу, путь и время и сравнивайте результат.','Мощность учитывает не только объём работы, но и время.'],
    density:['Плотность связывает массу вещества с занимаемым объёмом.','Сравнивайте расчёт с эталонными материалами.','Это одна из главных физических характеристик вещества.'],
    energy:['Потенциальная энергия постепенно превращается в кинетическую.','Наблюдайте сразу несколько энергетических кривых.','В идеальной модели сумма механических энергий сохраняется.'],
    electricity:['Цепь работает только при наличии замкнутого пути для тока.','Меняйте сопротивление и напряжение и смотрите на показатели.','В простом случае ток определяется законом Ома.'],
    circuit:['Способ соединения полностью меняет поведение цепи.','Переключайте схему и наблюдайте эквивалентное сопротивление.','Последовательная и параллельная схемы дают разные результаты.'],
    optics:['Линза меняет направление световых лучей.','Следите за фокусами, объектом и изображением.','Малое изменение расстояния может существенно изменить результат.'],
    refraction:['Свет меняет направление при переходе между средами.','Меняйте угол падения и показатели преломления.','Угол преломления зависит от обеих сред и угла падения.'],
    mirror:['Главные лучи помогают построить положение изображения.','Перемещайте объект относительно фокуса.','Вогнутое зеркало может давать разные типы изображения.'],
    heating:['Подводимая энергия изменяет внутреннее состояние тела.','Наблюдайте за температурой и кривой нагрева.','Масса и теплоёмкость определяют скорость повышения температуры.'],
    gaslaw:['Газ можно рассматривать как множество движущихся частиц.','Следите за давлением при изменении объёма.','При постоянной температуре произведение P·V остаётся постоянным.'],
    thermal:['Нагрев меняет среднее расстояние между частицами материала.','Сравнивайте начальную длину и новую длину стержня.','При повышении температуры размер тела увеличивается.']
  };

  function start(){
    bindNavigation();
    updateClock();
    setInterval(updateClock,1000);
    window.addEventListener('hashchange',router);
    router();
    mobileMenu.addEventListener('click',()=>sidebar.classList.toggle('open'));
  }

  function bindNavigation(){
    document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{location.hash=btn.dataset.route;sidebar.classList.remove('open')}));
  }

  function updateClock(){const el=document.getElementById('clock');if(el)el.textContent=new Date().toLocaleTimeString([],{hour12:false});}
  function setActive(route){document.querySelectorAll('.nav-item').forEach(btn=>btn.classList.toggle('active',btn.dataset.route===route));}

  function router(){
    const hash=location.hash.replace('#','')||'dashboard';
    const [route,id]=hash.split('/');
    if(experiments[id]){
      setActive('laboratories');
      breadcrumb.textContent=`Лаборатория / ${experiments[id].title}`;
      experiments[id].render();
      decorateExperiment(id);
      return;
    }
    if(route==='laboratories'){
      setActive('laboratories');breadcrumb.textContent='Лаборатория';renderLaboratories();return;
    }
    setActive('dashboard');breadcrumb.textContent='Главная';renderDashboard();
  }

  function renderDashboard(){
    const total=Object.keys(experiments).length;
    const records=LabStorage.read();
    const counts=Object.fromEntries(categoryOrder.map(c=>[c,Object.values(experiments).filter(e=>e.category===c).length]));
    const palette=[
      ['#ddf536','#1c1616'],['#886cff','#ffffff'],['#ea4c3c','#fff6e8'],['#79ca7c','#123013'],
      ['#6c85ec','#f2f5ff'],['#be6a39','#fff2e2'],['#64badf','#07232e'],['#e8538d','#fff0f6'],
      ['#ce9fe7','#2a1233'],['#f8f8ea','#09099b'],['#315a45','#b5d536'],['#f0f3e5','#31668a'],
      ['#98418e','#ffe3f4'],['#1c1616','#ddf536'],['#ef00bf','#fff7e6'],['#ff7a29','#2b1300'],
      ['#9bf6ff','#073b4c'],['#ffd166','#5b2403'],['#06d6a0','#022b22'],['#cdb4db','#3d1d53']
    ];
    const tilts=[-2.2,1.4,-1.1,2.1,-1.8,1.1,-2.5,1.7,-1.4,2.4,-2,1.2,-1.5,2,-1.2,1.8,-2.3,1.5,-1.9,2.2];
    const chipColors={mechanics:'#ea4c3c',physics:'#886cff',electricity:'#ddf536',optics:'#64badf',thermo:'#79ca7c'};
    const ids=Object.keys(experiments);
    app.innerHTML=`
      <section class="page zine-home fade-in">
        <header class="zine-hero">
          <div class="zine-hero-strip"></div>
          <div class="zine-hero-top">
            <span class="zine-hand-note zine-tilt-l">собрано вручную, без шаблонов ↴</span>
            <span class="zine-issue">ВЫПУСК № 01 · ЛОКАЛЬНАЯ ЛАБОРАТОРИЯ · 2026</span>
          </div>
          <div class="zine-hero-main">
            <div class="zine-hero-copy">
              <h1 class="zine-title">
                <span class="zt-row zt-r1">ФИЗИКА,</span>
                <span class="zt-row zt-r2"><i>которую</i> можно</span>
                <span class="zt-row zt-r3"><mark>потрогать</mark><span class="zt-hand">руками!</span>
                  <svg class="zt-scribble" viewBox="0 0 320 26" fill="none" aria-hidden="true"><path d="M6 15 C 45 6, 90 22, 130 13 S 210 5, 250 15 S 300 20, 314 10" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>
                </span>
              </h1>
              <p class="zine-lead">Это не очередной скучный сайт с формулами. Это самодельная лаборатория: крути ползунки, запускай маятники, сталкивай тележки, грей стержни — и смотри, как физика оживает прямо в браузере. Каждый опыт — со своим характером и своим дизайном.</p>
              <div class="zine-cta">
                <button class="zine-btn zine-btn-main" id="openLaboratory">ОТКРЫТЬ ЛАБОРАТОРИЮ<span class="zine-btn-arrow">→</span></button>
                <button class="zine-btn zine-btn-alt" id="randomLab">мне повезёт!</button>
              </div>
            </div>
            <div class="zine-hero-side">
              <div class="zine-sticker zine-sticker-main"><b>${total}</b><span>опытов<br>внутри</span></div>
              <div class="zine-sticker zine-sticker-alt"><span>100%<br>бесплатно</span></div>
              <svg class="zine-doodle-star" viewBox="0 0 60 60" aria-hidden="true"><path d="M30 3 L35 22 L55 20 L39 32 L47 52 L30 39 L13 52 L21 32 L5 20 L25 22 Z" fill="currentColor"/></svg>
              <svg class="zine-doodle-arrow" viewBox="0 0 90 70" fill="none" aria-hidden="true"><path d="M8 8 C 30 30, 55 35, 74 52 M74 52 L58 50 M74 52 L70 36" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>
          <div class="zine-hero-bottom">
            <span>РАБОТАЕТ ОФФЛАЙН</span><i>·</i><span>РАСЧЁТЫ В РЕАЛЬНОМ ВРЕМЕНИ</span><i>·</i><span>БЕЗ РЕГИСТРАЦИИ</span>
          </div>
        </header>

        <div class="zine-marquee" aria-hidden="true">
          <div class="zine-marquee-track">
            ${(ids.concat(ids)).map(id=>`<span>${experiments[id].title}<b>✳</b></span>`).join('')}
          </div>
        </div>

        <div class="zine-stats">
          <div class="zine-stat zine-tilt-l" style="--zc:#ddf536;--zi:#1c1616"><b>${records.length}</b><span>опытов уже проведено<br>на этом компьютере</span></div>
          <div class="zine-stat zine-tilt-r" style="--zc:#886cff;--zi:#ffffff"><b>${total}</b><span>интерактивных стендов<br>с живой физикой</span></div>
          <div class="zine-stat zine-tilt-l2" style="--zc:#ea4c3c;--zi:#fff6e8"><b>05</b><span>разделов науки —<br>от механики до тепла</span></div>
        </div>

        <section class="zine-section">
          <h2 class="zine-h2">как тут всё устроено <small>— спойлер: очень просто</small></h2>
          <div class="zine-notes">
            <div class="zine-note zn-1"><i class="zine-tape"></i><em>шаг 01</em><strong>Выбери опыт</strong><p>Внизу — двадцать стендов. Тыкай в любой, всё равно все интересные.</p></div>
            <div class="zine-note zn-2"><i class="zine-tape"></i><em>шаг 02</em><strong>Покрути параметры</strong><p>Скорость, масса, углы, напряжение — всё двигается и сразу пересчитывается.</p></div>
            <div class="zine-note zn-3"><i class="zine-tape"></i><em>шаг 03</em><strong>Смотри и удивляйся</strong><p>Графики, траектории и лучи обновляются вживую, без перезагрузки.</p></div>
            <div class="zine-note zn-4"><i class="zine-tape"></i><em>шаг 04</em><strong>Сохрани результат</strong><p>Каждый запуск можно записать в журнал — он хранится прямо в браузере.</p></div>
          </div>
        </section>

        <section class="zine-section">
          <h2 class="zine-h2">разделы <small>— выбирай, что ближе</small></h2>
          <div class="zine-chips">
            ${categoryOrder.map((c,i)=>`<button class="zine-chip zine-tilt-${i%2?'r':'l'}" data-cat="${c}" style="--zc:${chipColors[c]}"><b>${categoryNames[c]}</b><span>${counts[c]} стендов</span></button>`).join('')}
          </div>
        </section>

        <section class="zine-section">
          <h2 class="zine-h2">все двадцать опытов <small>— жми на любую карточку</small></h2>
          <div class="zine-grid">
            ${ids.map((id,i)=>{const e=experiments[id];const[bg,ink]=palette[i%palette.length];return `
            <button class="zine-card" data-open="${id}" style="--zc:${bg};--zi:${ink};--tilt:${tilts[i%tilts.length]}deg">
              <span class="zine-card-code">${e.code} · ${categoryNames[e.category]}</span>
              <span class="zine-card-symbol">${e.symbol}</span>
              <span class="zine-card-title">${e.title}</span>
              <span class="zine-card-desc">${e.description}</span>
              <span class="zine-card-go">открыть →</span>
            </button>`;}).join('')}
          </div>
        </section>

        <footer class="zine-footer">
          <span class="zine-footer-hand">сделано руками, с любовью к физике</span>
          <span>HTML · CSS · VANILLA JS · CANVAS — НИ ОДНОГО ФРЕЙМВОРКА</span>
        </footer>
      </section>`;
    document.getElementById('openLaboratory').addEventListener('click',()=>location.hash='laboratories');
    document.getElementById('randomLab').addEventListener('click',()=>location.hash=`laboratories/${ids[Math.floor(Math.random()*ids.length)]}`);
    app.querySelectorAll('.zine-card[data-open]').forEach(btn=>btn.addEventListener('click',()=>location.hash=`laboratories/${btn.dataset.open}`));
    app.querySelectorAll('.zine-chip[data-cat]').forEach(btn=>btn.addEventListener('click',()=>location.hash='laboratories'));
  }

  function renderLaboratories(){
    app.innerHTML=`<section class="page lab-catalog-page fade-in">
      <div class="lab-masthead">
        <div class="lab-masthead-bg">UNKNOWN</div>
        <div><div class="eyebrow">Сектор исследований / доступ открыт</div><h1>Лаборатория</h1><p class="page-subtitle">Перед вами карта исследовательского комплекса. Сектора скрывают экспериментальные стенды с собственной математикой, визуализацией и режимом наблюдения.</p></div>
        <div class="lab-mast-plate"><span>RESEARCH NODE</span><strong>ACTIVE</strong><small>ACCESS LEVEL / OPEN</small><i></i></div>
      </div>
      <div class="lab-intro-line"><div><span class="lab-intro-number">${Object.keys(experiments).length}</span><span>экспериментальных стендов</span></div><div><span class="lab-intro-number">05</span><span>направлений исследований</span></div><div><span class="lab-intro-number">∞</span><span>вариантов параметров</span></div></div>
      <div class="catalog-filter" id="catalogFilter"><button class="catalog-filter-btn active" data-filter="all">Весь комплекс <span>${Object.keys(experiments).length}</span></button>${categoryOrder.map(c=>`<button class="catalog-filter-btn" data-filter="${c}">${categoryNames[c]} <span>${Object.values(experiments).filter(e=>e.category===c).length}</span></button>`).join('')}</div>
      <div id="catalogGroups"></div>
      <div class="lab-bottom-note"><span>ЛАБОРАТОРИЯ / ЛОКАЛЬНЫЙ РЕЖИМ</span><span>ПАРАМЕТРЫ И РАСЧЁТЫ ВЫПОЛНЯЮТСЯ В БРАУЗЕРЕ</span></div>
    </section>`;

    const groups=document.getElementById('catalogGroups');
    const draw=filter=>{
      groups.innerHTML=categoryOrder.filter(c=>filter==='all'||filter===c).map((category,idx)=>{
        const list=Object.entries(experiments).filter(([,e])=>e.category===category);
        return `<section class="sector-section sector-${category}">
          <div class="sector-heading"><div class="sector-code">SECTOR / 0${idx+1}</div><div class="sector-name">${categoryNames[category]}</div><div class="sector-description">${sectorDescription(category)}</div><div class="sector-count">${list.length} СТЕНДОВ</div></div>
          <div class="sector-experiments">${list.map(([id,e])=>catalogCard(id,e)).join('')}</div>
        </section>`;
      }).join('');
      groups.querySelectorAll('[data-open]').forEach(btn=>btn.addEventListener('click',()=>location.hash=`laboratories/${btn.dataset.open}`));
    };
    document.querySelectorAll('.catalog-filter-btn').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.catalog-filter-btn').forEach(x=>x.classList.remove('active'));btn.classList.add('active');draw(btn.dataset.filter)}));
    draw('all');
  }

  function catalogCard(id,e){return `<button class="lab-card lab-card-${e.category}" data-open="${id}"><span class="lab-card-code">${e.code}</span><span class="lab-card-symbol">${e.symbol}</span><span class="lab-card-title">${e.title}</span><span class="lab-card-description">${e.description}</span><span class="lab-card-arrow">ОТКРЫТЬ СТЕНД <b>↗</b></span></button>`;}
  function sectorDescription(c){return {mechanics:'движение · силы · энергия · импульс',physics:'вещество · энергия · измерения',electricity:'цепи · ток · напряжение · сопротивление',optics:'свет · линзы · зеркала · среды',thermo:'температура · газ · тепловые процессы'}[c];}

  function decorateExperiment(id){
    const exp=experiments[id];
    const page=document.querySelector('#app .page');
    if(!page)return;
    page.classList.add(`experiment-page`,`experiment-id-${id}`,`experiment-theme-${exp.category}`);
    page.style.setProperty('--experiment-accent',accentFor(id));
    page.style.setProperty('--experiment-glow',glowFor(id));
    const heading=page.querySelector('.page-heading');
    const layout=page.querySelector('.lab-layout');
    if(!heading||!layout)return;
    const info=experimentDescriptions[id];
    const dossier=document.createElement('div');
    dossier.className='experiment-dossier';
    dossier.innerHTML=`
      <div class="dossier-visual"><div class="dossier-code">${exp.code}</div><div class="dossier-big-symbol">${exp.symbol}</div><div class="dossier-grid"></div><span>EXPERIMENTAL NODE</span></div>
      <div class="dossier-copy">
        <div class="dossier-overline"><span>ИССЛЕДОВАТЕЛЬСКОЕ ДОСЬЕ</span><span>${categoryNames[exp.category]}</span></div>
        <div class="dossier-title-row"><div><h2>${exp.title}</h2><p>Условия наблюдения можно изменить прямо на стенде. Расчёт выполняется в реальном времени.</p></div></div>
        <div class="dossier-observation"><div><small>01 / ЦЕЛЬ</small><p>${info[0]}</p></div><div><small>02 / НАБЛЮДЕНИЕ</small><p>${info[1]}</p></div><div><small>03 / ВЫВОД</small><p>${info[2]}</p></div></div>
      </div>
      <div class="creator-panel">
        <div class="creator-label">КОМАНДА СТЕНДА</div>
        <div class="creator-portraits">
          ${creator('Алексей Морозов','Автор математической модели','lead')}
          ${creator('Елена Воронова','Научный редактор','science')}
          ${creator('Максим Орлов','Инженер симуляции','code')}
        </div>
        <div class="creator-disclaimer">Концептуальные портреты учебной команды интерфейса</div>
      </div>`;
    heading.after(dossier);
  }

  function creator(name,role,kind){
    const initials=name.split(' ').map(x=>x[0]).join('');
    return `<div class="creator-person"><div class="portrait portrait-${kind}"><span>${initials}</span><i></i></div><div><strong>${name}</strong><small>${role}</small></div></div>`;
  }

  function accentFor(id){
    if(['optics','refraction','mirror'].includes(id))return '#9aafff';
    if(['electricity','circuit'].includes(id))return '#62e6c5';
    if(['heating','gaslaw','thermal'].includes(id))return '#f0b36d';
    if(['density','energy'].includes(id))return '#c7c9ff';
    const palette={projectile:'#39d5e7',pendulum:'#6adbf0',freefall:'#62c9ff',hooke:'#8ee0db',friction:'#b7e36c',buoyancy:'#72d7de',uniform:'#62d0ec',newton:'#d7e77a',collision:'#c4a8ff',workpower:'#8cd7ff'};
    return palette[id]||'#39d5e7';
  }

  function glowFor(id){const c=accentFor(id);return `${c}22`;}
  function showToast(message,type='success'){const container=document.getElementById('toastContainer');const toast=document.createElement('div');toast.className=`toast ${type}`;toast.textContent=message;container.appendChild(toast);setTimeout(()=>toast.remove(),2600);}
  function format(value,digits=2){return Number.isFinite(value)?Number(value).toFixed(digits):'—';}
  return {start,showToast,format,experiments,categoryNames};
})();
window.addEventListener('DOMContentLoaded',LabApp.start);
