/* ==========================================================
   МАТЕМАТИКА — ВИЗУАЛЬНАЯ МАСТЕРСКАЯ
   Чистый Vanilla JavaScript. Все элементы ввода управляются
   собственной экранной клавиатурой.
   ========================================================== */
window.MathLab = (() => {
  const METHODS = {
    arithmetic: {group:'АРИФМЕТИКА', code:'A-01', symbol:'∑', title:'Арифметические выражения', desc:'Соберите выражение визуально и получите решение с промежуточными шагами.'},
    fractions: {group:'АРИФМЕТИКА', code:'A-02', symbol:'⅟', title:'Обыкновенные дроби', desc:'Складывайте, вычитайте, умножайте и делите дроби с автоматическим сокращением.'},
    powers: {group:'АЛГЕБРА', code:'B-01', symbol:'xⁿ', title:'Степени и корни', desc:'Работайте со степенями, квадратными и произвольными корнями.'},
    linear: {group:'АЛГЕБРА', code:'B-02', symbol:'x', title:'Линейные уравнения', desc:'Решайте уравнения вида ax + b = c несколькими способами.'},
    quadratic: {group:'АЛГЕБРА', code:'B-03', symbol:'x²', title:'Квадратные уравнения', desc:'Находите корни через дискриминант и исследуйте количество решений.'},
    systems: {group:'АЛГЕБРА', code:'B-04', symbol:'≡', title:'Системы уравнений', desc:'Решайте систему 2×2 методом подстановки или сложения.'},
    matrices: {group:'МАТРИЦЫ', code:'C-01', symbol:'▦', title:'Матрицы', desc:'Вводите матрицы кнопками и вычисляйте определители и сумму.'},
    percent: {group:'ПРИКЛАДНАЯ МАТЕМАТИКА', code:'D-01', symbol:'%', title:'Проценты и пропорции', desc:'Решайте задачи на процент от числа, увеличение и уменьшение.'},
    geometry: {group:'ГЕОМЕТРИЯ', code:'G-01', symbol:'△', title:'Прямоугольный треугольник', desc:'Находите стороны, площадь, периметр и углы через теорему Пифагора.'}
  };

  function renderCatalog(targetId='app') {
    const app=document.getElementById(targetId);
    const groups=[...new Set(Object.values(METHODS).map(x=>x.group))];
    app.innerHTML=`<section class="page math-page math-catalog fade-in">
      <div class="math-masthead">
        <div class="math-mast-bg">∑</div>
        <div>
          <div class="eyebrow math-eyebrow">ВТОРОЙ СЕКТОР / ФОРМАЛЬНЫЕ МОДЕЛИ</div>
          <h1>Математика</h1>
          <p class="page-subtitle">Не печатайте формулы обычным текстом. Собирайте их на визуальной клавиатуре — с дробями, степенями, корнями, матрицами и знаками, как в настоящей математической записи.</p>
        </div>
        <div class="math-terminal"><span>MODULE</span><strong>02</strong><small>MATHEMATICAL ENGINE</small><i></i></div>
      </div>

      <div class="math-statement">
        <span>ПРИНЦИП</span><strong>ВЫБРАТЬ СПОСОБ → СОБРАТЬ ПРИМЕР → РЕШИТЬ → ПРОВЕРИТЬ ШАГИ</strong>
      </div>

      ${groups.map((g,i)=>`<section class="math-method-group">
        <div class="math-group-head"><div><small>СЕКЦИЯ / 0${i+1}</small><h2>${g}</h2></div><span>${Object.values(METHODS).filter(m=>m.group===g).length} МЕТОДА</span></div>
        <div class="math-method-grid">${Object.entries(METHODS).filter(([,m])=>m.group===g).map(([id,m])=>methodCard(id,m)).join('')}</div>
      </section>`).join('')}

      <div class="math-note-grid">
        <div><span>01</span><strong>Визуальная запись</strong><p>Дробь остаётся дробью, степень — степенью, матрица — матрицей.</p></div>
        <div><span>02</span><strong>Экранная клавиатура</strong><p>Числа и знаки добавляются кнопками, а не обычным текстовым вводом.</p></div>
        <div><span>03</span><strong>Пошаговое решение</strong><p>После вычисления показывается логика решения, а не только ответ.</p></div>
      </div>
    </section>`;
    app.querySelectorAll('[data-math-method]').forEach(btn=>btn.addEventListener('click',()=>location.hash=`math/${btn.dataset.mathMethod}`));
  }

  function methodCard(id,m){
    return `<button class="math-method-card" data-math-method="${id}">
      <span class="math-card-code">${m.code}</span><span class="math-card-symbol">${m.symbol}</span>
      <strong>${m.title}</strong><p>${m.desc}</p><span class="math-card-open">ОТКРЫТЬ СПОСОБ <b>↗</b></span>
    </button>`;
  }

  function openMethod(id) {
    if (!METHODS[id]) return renderCatalog();
    const renderers={arithmetic, fractions, powers, linear, quadratic, systems, matrices, percent, geometry};
    renderers[id]();
  }

  // ---------- Common UI helpers ----------
  function pageShell(meta, body){
    document.getElementById('app').innerHTML=`<section class="page math-page math-workspace math-${meta.code.toLowerCase()} fade-in">
      <div class="math-workspace-top">
        <button class="math-back" id="mathBack">← МАТЕМАТИКА</button>
        <div class="math-location"><span>${meta.group}</span><b>${meta.code}</b></div>
      </div>
      <div class="math-title-block"><div class="math-symbol-large">${meta.symbol}</div><div><div class="eyebrow math-eyebrow">${meta.group} / ${meta.code}</div><h1>${meta.title}</h1><p class="page-subtitle">${meta.desc}</p></div></div>
      ${body}
    </section>`;
    document.getElementById('mathBack').addEventListener('click',()=>location.hash='mathematics');
  }

  function keypad(targetId, options={}) {
    const root=document.getElementById(targetId);
    const keys=options.keys||['7','8','9','÷','4','5','6','×','1','2','3','−','0','.','⌫','+'];
    root.innerHTML=`<div class="math-keyboard">
      ${keys.map(k=>`<button class="math-key ${['÷','×','−','+','=','√','x²','xⁿ','(',')','/'].includes(k)?'operator':''}" data-key="${escapeAttr(k)}">${k}</button>`).join('')}
      ${options.extra||''}
    </div>`;
    return root;
  }

  function escapeAttr(v){return String(v).replace(/"/g,'&quot;')}
  function setText(id,v){const e=document.getElementById(id);if(e)e.textContent=v}
  function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

  function visualTokens(expr){
    const chars=[];
    for(let i=0;i<expr.length;i++){
      const ch=expr[i];
      if(ch==='^'){
        let sup=''; i++;
        while(i<expr.length && /[0-9]/.test(expr[i])){sup+=expr[i];i++}
        i--;
        chars.push(`<sup>${sup}</sup>`);
      } else if(ch==='*') chars.push('×');
      else if(ch==='/') chars.push('÷');
      else if(ch==='sqrt') chars.push('√');
      else chars.push(escapeHtml(ch));
    }
    return chars.join('');
  }

  // A small safe expression parser. Supports + - * / ^ and parentheses.
  function evaluateExpression(input){
    let s=input.replaceAll('×','*').replaceAll('÷','/').replace(/√\s*(\d+(?:\.\d+)?)/g,'Math.sqrt($1)').replace(/\s+/g,'');
    const tokens=s.match(/Math\.sqrt|\d+(?:\.\d+)?|[()+\-*/^]/g);
    if(!tokens || tokens.join('')!==s.replace(/Math\.sqrt/g,'Math.sqrt')) throw new Error('Некорректное выражение');
    let pos=0;
    function primary(){
      const tok=tokens[pos];
      if(tok==='('){pos++;const v=addSub();if(tokens[pos]!==')')throw new Error('Скобка не закрыта');pos++;return v}
      if(tok==='-'){pos++;return -primary()}
      if(/^\d/.test(tok||'')){pos++;return Number(tok)}
      if(tok==='Math.sqrt'){pos++;if(tokens[pos]==='('){pos++;const v=addSub();if(tokens[pos]!==')')throw new Error('Корень');pos++;return Math.sqrt(v)}throw new Error('Корень')}
      throw new Error('Ожидалось число');
    }
    function power(){let a=primary();while(tokens[pos]==='^'){pos++;const b=power();a=Math.pow(a,b)}return a}
    function mulDiv(){let a=power();while(tokens[pos]==='*'||tokens[pos]==='/'){const op=tokens[pos++],b=power();if(op==='*')a*=b;else{if(b===0)throw new Error('Деление на ноль');a/=b}}return a}
    function addSub(){let a=mulDiv();while(tokens[pos]==='+'||tokens[pos]==='-'){const op=tokens[pos++],b=mulDiv();a=op==='+'?a+b:a-b}return a}
    const value=addSub();if(pos!==tokens.length)throw new Error('Лишние символы');return value;
  }

  function arithmetic(){
    const m=METHODS.arithmetic;
    pageShell(m,`<div class="math-layout">
      <div class="math-main-panel">
        <div class="math-panel-head"><span>ВИЗУАЛЬНЫЙ РЕДАКТОР</span><b>EXPRESSION BUILDER</b></div>
        <div class="math-expression-zone"><div class="math-expression-label">ВАШ ПРИМЕР</div><div class="math-expression" id="arithDisplay"><span class="math-caret">▌</span></div></div>
        <div class="math-live-answer"><span>ОТВЕТ</span><strong id="arithAnswer">—</strong><small id="arithStatus">Добавляйте числа кнопками</small></div>
        <div class="math-step-panel"><div class="math-panel-mini-title">ХОД РЕШЕНИЯ</div><div id="arithSteps" class="math-steps"><div class="math-empty-step">После вычисления здесь появится разбор выражения.</div></div></div>
      </div>
      <aside class="math-sidebar-panel"><div class="math-panel-head"><span>МАТЕМАТИЧЕСКАЯ КЛАВИАТУРА</span></div><div id="arithKeys"></div><div class="math-keyboard-special"><button data-special="sqrt">√</button><button data-special="square">x²</button><button data-special="left">(</button><button data-special="right">)</button><button data-special="clear">AC</button><button data-special="solve">=</button></div><div class="math-help"><strong>Подсказка</strong><p>Например: нажмите 2 → + → 3 → × → 4 → x² → =. Вы никогда не вводите «^» вручную.</p></div></aside>
    </div>`);
    let expr=''; const keys=keypad('arithKeys');
    keys.addEventListener('click',e=>{const k=e.target.closest('[data-key]')?.dataset.key;if(!k)return; if(k==='⌫')expr=expr.slice(0,-1);else expr+=k;refresh()});
    document.querySelectorAll('.math-keyboard-special [data-special]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.special;if(k==='clear')expr='';if(k==='sqrt')expr+='√';if(k==='square')expr+='^2';if(k==='left')expr+='(';if(k==='right')expr+=')';if(k==='solve')solve();refresh()}));
    function refresh(){document.getElementById('arithDisplay').innerHTML=visualTokens(expr)+ '<span class="math-caret">▌</span>';if(!expr)setText('arithStatus','Добавляйте числа кнопками')}
    function solve(){try{const v=evaluateExpression(expr);setText('arithAnswer',Number.isFinite(v)?v.toFixed(6).replace(/\.0+$/,''):'—');setText('arithStatus','Вычисление выполнено');const parts=expr.split(/([+\-×÷])/).filter(Boolean);document.getElementById('arithSteps').innerHTML=`<div class="math-step"><span>01</span><p>Исходное выражение: <strong>${visualTokens(expr)}</strong></p></div><div class="math-step"><span>02</span><p>Сначала выполняются скобки, степени и операции умножения/деления.</p></div><div class="math-step"><span>03</span><p>Результат: <strong>${v}</strong></p></div>`}catch(err){setText('arithAnswer','Ошибка');setText('arithStatus',err.message);document.getElementById('arithSteps').innerHTML='<div class="math-error-step">Проверьте последовательность чисел и операций.</div>'}}
  }

  function fractionField(id,label){return `<div class="frac-field-wrap"><span>${label}</span><div class="frac-field" id="${id}"></div></div>`}
  function fractions(){
    const m=METHODS.fractions;
    pageShell(m,`<div class="math-layout fraction-layout">
      <div class="math-main-panel"><div class="math-panel-head"><span>ДРОБНЫЙ КОНСТРУКТОР</span><b>FRACTION BUILDER</b></div>
        <div class="fraction-work"><div class="fraction-group">${fractionField('fA_num','Числитель A')}${fractionField('fA_den','Знаменатель A')}</div><div class="fraction-op" id="fractionOp">+</div><div class="fraction-group">${fractionField('fB_num','Числитель B')}${fractionField('fB_den','Знаменатель B')}</div><div class="fraction-equals">=</div><div class="fraction-result" id="fractionResult">—</div></div>
        <div class="fraction-actions"><button class="math-action active" data-op="+">Сложение</button><button class="math-action" data-op="-">Вычитание</button><button class="math-action" data-op="*">Умножение</button><button class="math-action" data-op="/">Деление</button></div>
        <div class="math-step-panel"><div class="math-panel-mini-title">ПОШАГОВО</div><div id="fractionSteps" class="math-steps"><div class="math-empty-step">Введите две дроби кнопками справа.</div></div></div>
      </div><aside class="math-sidebar-panel"><div class="math-panel-head"><span>ВВОД ЧИСЕЛ</span><b id="fractionActive">A: ЧИСЛИТЕЛЬ</b></div><div class="fraction-selected-info" id="fractionSlots"><button data-slot="fA_num" class="active">A числ.</button><button data-slot="fA_den">A знам.</button><button data-slot="fB_num">B числ.</button><button data-slot="fB_den">B знам.</button></div><div id="fractionKeys"></div><div class="math-keyboard-special"><button data-fclear="all">AC</button><button data-fclear="one">⌫</button><button data-fsolve="1">=</button></div></aside>
    </div>`);
    const state={fA_num:'1',fA_den:'2',fB_num:'1',fB_den:'3'};let active='fA_num';let op='+';const keys=keypad('fractionKeys',{keys:['7','8','9','4','5','6','1','2','3','0','⌫']});
    document.querySelectorAll('[data-slot]').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.slot;document.querySelectorAll('[data-slot]').forEach(x=>x.classList.remove('active'));b.classList.add('active');setText('fractionActive',slotName(active));}));
    keys.addEventListener('click',e=>{const k=e.target.closest('[data-key]')?.dataset.key;if(!k)return;if(k==='⌫')state[active]=state[active].slice(0,-1);else{state[active]=(state[active]==='0'?'':state[active])+k}renderSlots();calculate()});
    document.querySelectorAll('[data-op]').forEach(b=>b.addEventListener('click',()=>{op=b.dataset.op;document.querySelectorAll('[data-op]').forEach(x=>x.classList.toggle('active',x===b));setText('fractionOp',op==='*'?'×':op==='/'?'÷':op);calculate()}));
    document.querySelector('[data-fclear="all"]').addEventListener('click',()=>{Object.keys(state).forEach(k=>state[k]='');renderSlots();calculate()});
    document.querySelector('[data-fclear="one"]').addEventListener('click',()=>{state[active]=state[active].slice(0,-1);renderSlots();calculate()});
    document.querySelector('[data-fsolve]').addEventListener('click',calculate);renderSlots();calculate();
    function slotName(s){return s==='fA_num'?'A: ЧИСЛИТЕЛЬ':s==='fA_den'?'A: ЗНАМЕНАТЕЛЬ':s==='fB_num'?'B: ЧИСЛИТЕЛЬ':'B: ЗНАМЕНАТЕЛЬ'}
    function renderSlots(){['fA_num','fA_den','fB_num','fB_den'].forEach(id=>{const e=document.getElementById(id);e.innerHTML=`<strong>${escapeHtml(state[id]||'')}</strong><i></i>`;e.classList.toggle('selected',id===active)})}
    function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){const t=a%b;a=b;b=t}return a||1}
    function calculate(){const an=parseInt(state.fA_num),ad=parseInt(state.fA_den),bn=parseInt(state.fB_num),bd=parseInt(state.fB_den);if(![an,ad,bn,bd].every(Number.isFinite)||ad===0||bd===0){setText('fractionResult','—');return}let n=0,d=1;if(op==='+'){n=an*bd+bn*ad;d=ad*bd}else if(op==='-'){n=an*bd-bn*ad;d=ad*bd}else if(op==='*'){n=an*bn;d=ad*bd}else{if(bn===0){setText('fractionResult','Ошибка');return}n=an*bd;d=ad*bn}const g=gcd(n,d);n/=g;d/=g;setText('fractionResult',`${n}/${d}`);document.getElementById('fractionSteps').innerHTML=`<div class="math-step"><span>01</span><p>${an}/${ad} ${op==='*'?'×':op==='/'?'÷':op} ${bn}/${bd}</p></div><div class="math-step"><span>02</span><p>${op==='+'||op==='-'?'Приводим дроби к общему знаменателю и выполняем операцию.':'Перемножаем числители и знаменатели по правилу выбранной операции.'}</p></div><div class="math-step"><span>03</span><p>Сокращение на НОД: <strong>${n}/${d}</strong></p></div>`}
  }

  function numericVisualBuilder(meta, title, equation, slots, onChange, extras=''){
    const slotHtml=slots.map(s=>`<button class="math-slot" data-slot-id="${s.id}">${s.label}</button>`).join('');
    pageShell(meta, `<div class="math-layout"><div class="math-main-panel"><div class="math-panel-head"><span>${title}</span><b>ВИЗУАЛЬНАЯ ФОРМУЛА</b></div><div class="equation-display" id="equationDisplay">${equation}</div><div class="slot-strip">${slotHtml}</div>${extras}${meta.code==='B-02'?'<div class="solver-method-tabs"><button class="math-action active" data-linear-method="transfer">Перенос членов</button><button class="math-action" data-linear-method="balance">Баланс</button></div>':''}${meta.code==='B-03'?'<div class="solver-method-tabs"><button class="math-action active" data-quad-method="disc">Дискриминант</button><button class="math-action" data-quad-method="viet">Виет</button></div>':''}<div class="math-step-panel"><div class="math-panel-mini-title">РЕШЕНИЕ ПО ШАГАМ</div><div id="solverSteps" class="math-steps"><div class="math-empty-step">Измените коэффициенты справа.</div></div></div></div><aside class="math-sidebar-panel"><div class="math-panel-head"><span>КЛАВИАТУРА</span><b id="activeSlotName">—</b></div><div id="solverKeys"></div><div class="math-keyboard-special"><button data-cmd="minus">±</button><button data-cmd="clear">AC</button><button data-cmd="back">⌫</button><button data-cmd="solve">РЕШИТЬ</button></div><div class="math-help"><strong>Ввод</strong><p>Нажмите на нужный элемент формулы, затем используйте цифровую клавиатуру.</p></div></aside></div>`);
    const data={};slots.forEach(s=>data[s.id]=String(s.value??0));let active=slots[0].id;const keys=keypad('solverKeys',{keys:['7','8','9','4','5','6','1','2','3','0','⌫']});
    document.querySelectorAll('[data-slot-id]').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.slotId;document.querySelectorAll('.math-slot').forEach(x=>x.classList.toggle('active',x.dataset.slotId===active));setText('activeSlotName',slots.find(s=>s.id===active).label);render()}));
    keys.addEventListener('click',e=>{const k=e.target.closest('[data-key]')?.dataset.key;if(!k)return;if(k==='⌫')data[active]=data[active].slice(0,-1);else data[active]=(data[active]==='0'?'':data[active])+k;render();onChange({...data})});
    document.querySelectorAll('[data-linear-method]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-linear-method]').forEach(x=>x.classList.toggle('active',x===b));onChange({...data},true)}));
    document.querySelectorAll('[data-quad-method]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-quad-method]').forEach(x=>x.classList.toggle('active',x===b));onChange({...data},true)}));
    document.querySelector('[data-cmd="minus"]').addEventListener('click',()=>{data[active]=data[active].startsWith('-')?data[active].slice(1):'-'+data[active];render();onChange({...data})});
    document.querySelector('[data-cmd="clear"]').addEventListener('click',()=>{data[active]='';render();onChange({...data})});
    document.querySelector('[data-cmd="back"]').addEventListener('click',()=>{data[active]=data[active].slice(0,-1);render();onChange({...data})});
    document.querySelector('[data-cmd="solve"]').addEventListener('click',()=>onChange({...data},true));
    setText('activeSlotName',slots[0].label);document.querySelector('.math-slot').classList.add('active');
    function render(){document.getElementById('equationDisplay').innerHTML=typeof equation==='function'?equation(data):equation;slots.forEach(s=>{const b=document.querySelector(`[data-slot-id="${s.id}"]`);if(b)b.innerHTML=`<span>${s.label}</span><strong>${escapeHtml(data[s.id]||'')}</strong>`})}
    return data;
  }

  function linear(){
    const m=METHODS.linear;
    numericVisualBuilder(m, 'ЛИНЕЙНОЕ УРАВНЕНИЕ',d=>`<span class="equation-part"><b>${escapeHtml(d.a||'')}</b>x + <b>${escapeHtml(d.b||'')}</b> = <b>${escapeHtml(d.c||'')}</b></span>`,[
      {id:'a',label:'Коэффициент a',value:2},{id:'b',label:'Свободный член b',value:4},{id:'c',label:'Правая часть c',value:10,meta:m}
    ],(d,force=false)=>{
      const a=Number(d.a),b=Number(d.b),c=Number(d.c);const box=document.getElementById('solverSteps');
      if(!Number.isFinite(a)||a===0||!Number.isFinite(b)||!Number.isFinite(c)){box.innerHTML='<div class="math-error-step">Введите a, b и c. Коэффициент a не должен быть равен нулю.</div>';return}
      const x=(c-b)/a;const method=document.querySelector('[data-linear-method].active')?.dataset.linearMethod||'transfer';box.innerHTML=`<div class="math-step"><span>01</span><p>${a}x + ${b} = ${c}</p></div><div class="math-step"><span>02</span><p>${method==='balance'?'Выполняем одинаковое действие с обеими частями: вычитаем '+b+' и сохраняем равенство.':'Переносим свободный член: <strong>'+a+'x = '+(c-b)+'</strong>'}</p></div><div class="math-step"><span>03</span><p>Делим обе части на ${a}: <strong>x = ${x}</strong></p></div><div class="math-result-step">ОТВЕТ: x = ${x}</div>`;
    }, '')
  }

  function quadratic(){
    const m=METHODS.quadratic;
    numericVisualBuilder(m, 'КВАДРАТНОЕ УРАВНЕНИЕ',d=>`<span class="equation-part"><b>${escapeHtml(d.a||'')}</b>x<sup>2</sup> + <b>${escapeHtml(d.b||'')}</b>x + <b>${escapeHtml(d.c||'')}</b> = 0</span>`,[
      {id:'a',label:'Коэффициент a',value:1},{id:'b',label:'Коэффициент b',value:-5},{id:'c',label:'Коэффициент c',value:6,meta:m}
    ],(d)=>{
      const a=Number(d.a),b=Number(d.b),c=Number(d.c),box=document.getElementById('solverSteps');if(!Number.isFinite(a)||a===0||!Number.isFinite(b)||!Number.isFinite(c)){box.innerHTML='<div class="math-error-step">Введите корректные коэффициенты.</div>';return}const D=b*b-4*a*c;const quadMethod=document.querySelector('[data-quad-method].active')?.dataset.quadMethod||'disc';
      let result='Нет действительных корней';if(D>0){const x1=(-b+Math.sqrt(D))/(2*a),x2=(-b-Math.sqrt(D))/(2*a);result=`x₁ = ${x1.toFixed(4)}, x₂ = ${x2.toFixed(4)}`}else if(D===0){result=`x = ${(-b/(2*a)).toFixed(4)}`}const methodText=quadMethod==='viet'?'Метод Виета: сумма корней равна −b/a, произведение — c/a; для подходящих коэффициентов корни можно подобрать по этим двум условиям.':'Используем дискриминант и формулу корней.';box.innerHTML=`<div class="math-step"><span>01</span><p>Уравнение: <strong>${a}x² + ${b}x + ${c} = 0</strong></p></div><div class="math-step"><span>02</span><p>${quadMethod==='viet'?methodText:'Дискриминант: D = b² − 4ac = <strong>'+D+'</strong>'}</p></div><div class="math-step"><span>03</span><p>${D>0?'D > 0 → два действительных корня.':D===0?'D = 0 → один корень.':'D < 0 → действительных корней нет.'}</p></div><div class="math-result-step">${result}</div>`
    });
  }

  function powers(){
    const m=METHODS.powers;
    pageShell(m,`<div class="math-layout"><div class="math-main-panel"><div class="math-panel-head"><span>СТЕПЕНЬ / КОРЕНЬ</span><b>POWER TOOL</b></div><div class="power-switch"><button class="math-action active" data-pmode="power">Степень</button><button class="math-action" data-pmode="root">Корень</button></div><div class="power-equation" id="powerEquation">2<sup>3</sup> = <strong>8</strong></div><div class="power-result-card"><span>РЕЗУЛЬТАТ</span><strong id="powerResult">8</strong><small id="powerExplain">2 × 2 × 2</small></div><div class="math-step-panel"><div class="math-panel-mini-title">ОБЪЯСНЕНИЕ</div><div id="powerSteps" class="math-steps"></div></div></div><aside class="math-sidebar-panel"><div class="math-panel-head"><span>КЛАВИАТУРА</span></div><div class="power-inputs"><label>Основание <input id="powerBase" value="2" readonly></label><label id="powerSecondLabel">Показатель <input id="powerSecond" value="3" readonly></label></div><div id="powerKeys"></div><div class="math-keyboard-special"><button data-pclear="1">AC</button><button data-psolve="1">РЕШИТЬ</button></div><div class="math-help"><strong>Как вводить?</strong><p>Выберите поле «Основание» или «Показатель», затем нажимайте цифры. Никакой записи вида 2^3 вручную.</p></div></aside></div>`);
    let active='base',base='2',second='3',mode='power';const keys=keypad('powerKeys',{keys:['7','8','9','4','5','6','1','2','3','0','⌫']});
    document.querySelectorAll('[data-pmode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.pmode;document.querySelectorAll('[data-pmode]').forEach(x=>x.classList.toggle('active',x===b));document.getElementById('powerSecondLabel').firstChild.textContent=mode==='power'?'Показатель':'Индекс корня';calculate()}));
    ['powerBase','powerSecond'].forEach(id=>document.getElementById(id).addEventListener('click',()=>active=id==='powerBase'?'base':'second'));
    keys.addEventListener('click',e=>{const k=e.target.closest('[data-key]')?.dataset.key;if(!k)return;if(k==='⌫'){if(active==='base')base=base.slice(0,-1);else second=second.slice(0,-1)}else if(active==='base')base+=k;else second+=k;renderInputs();calculate()});
    document.querySelector('[data-pclear]').addEventListener('click',()=>{base='';second='';renderInputs();calculate()});document.querySelector('[data-presolve]').addEventListener('click',calculate);
    function renderInputs(){document.getElementById('powerBase').value=base;document.getElementById('powerSecond').value=second}
    function calculate(){const b=Number(base),n=Number(second);if(!Number.isFinite(b)||!Number.isFinite(n)){return}let val,ex; if(mode==='power'){val=Math.pow(b,n);ex=Array.from({length:Math.min(Math.max(n,1),12)},()=>b).join(' × ')}else{val=Math.pow(b,1/n);ex=`число, которое в степени ${n} даёт ${b}`;}setText('powerResult',Number.isFinite(val)?val.toFixed(6).replace(/\.0+$/,''):'—');setText('powerExplain',ex);document.getElementById('powerEquation').innerHTML=mode==='power'?`${b}<sup>${n}</sup> = <strong>${val.toFixed(4)}</strong>`:`<sup>${n}</sup>√${b} = <strong>${val.toFixed(4)}</strong>`;document.getElementById('powerSteps').innerHTML=mode==='power'?`<div class="math-step"><span>01</span><p>Записываем степень: <strong>${b}<sup>${n}</sup></strong>.</p></div><div class="math-step"><span>02</span><p>Умножаем число ${b} само на себя ${n} раз.</p></div><div class="math-result-step">${b}<sup>${n}</sup> = ${val}</div>`:`<div class="math-step"><span>01</span><p>Ищем число, для которого x<sup>${n}</sup> = ${b}.</p></div><div class="math-result-step">Ответ: ${val}</div>`}
  }

  function systems(){
    const m=METHODS.systems;
    pageShell(m,`<div class="math-layout"><div class="math-main-panel"><div class="math-panel-head"><span>СИСТЕМА 2 × 2</span><b>LINEAR SYSTEM</b></div><div class="system-equation" id="systemEq"></div><div class="system-methods"><button class="math-action active" data-sys="sub">Подстановка</button><button class="math-action" data-sys="add">Сложение</button></div><div class="math-step-panel"><div class="math-panel-mini-title">ПОШАГОВОЕ РЕШЕНИЕ</div><div id="systemSteps" class="math-steps"></div></div></div><aside class="math-sidebar-panel"><div class="math-panel-head"><span>КОЭФФИЦИЕНТЫ</span><b id="sysActive">a₁</b></div><div class="matrix-visual-input" id="sysSlots"></div><div id="sysKeys"></div><div class="math-keyboard-special"><button data-syscmd="minus">±</button><button data-syscmd="back">⌫</button><button data-syscmd="clear">AC</button></div></aside></div>`);
    const values={a1:'2',b1:'1',c1:'5',a2:'1',b2:'-1',c2:'1'};let active='a1',method='sub';
    const labels={a1:'a₁',b1:'b₁',c1:'c₁',a2:'a₂',b2:'b₂',c2:'c₂'};
    renderInputs();const keys=keypad('sysKeys',{keys:['7','8','9','4','5','6','1','2','3','0','⌫']});
    document.querySelectorAll('[data-sys]').forEach(b=>b.addEventListener('click',()=>{method=b.dataset.sys;document.querySelectorAll('[data-sys]').forEach(x=>x.classList.toggle('active',x===b));solve()}));
    keys.addEventListener('click',e=>{const k=e.target.closest('[data-key]')?.dataset.key;if(!k)return;if(k==='⌫')values[active]=values[active].slice(0,-1);else values[active]=(values[active]==='0'?'':values[active])+k;renderInputs();solve()});
    document.querySelector('[data-syscmd="minus"]').addEventListener('click',()=>{values[active]=values[active].startsWith('-')?values[active].slice(1):'-'+values[active];renderInputs();solve()});
    document.querySelector('[data-syscmd="back"]').addEventListener('click',()=>{values[active]=values[active].slice(0,-1);renderInputs();solve()});
    document.querySelector('[data-syscmd="clear"]').addEventListener('click',()=>{Object.keys(values).forEach(k=>values[k]='');renderInputs();solve()});
    function renderInputs(){document.getElementById('sysSlots').innerHTML=Object.keys(values).map(k=>`<button class="system-slot ${k===active?'active':''}" data-sys-slot="${k}"><span>${labels[k]}</span><strong>${escapeHtml(values[k])}</strong></button>`).join('');document.querySelectorAll('[data-sys-slot]').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.sysSlot;setText('sysActive',labels[active]);renderInputs()}));document.getElementById('systemEq').innerHTML=`<div>${values.a1||'0'}x + ${values.b1||'0'}y = ${values.c1||'0'}</div><div>${values.a2||'0'}x + ${values.b2||'0'}y = ${values.c2||'0'}</div>`}
    function solve(){const a=+values.a1,b=+values.b1,c=+values.c1,d=+values.a2,e=+values.b2,f=+values.c2;const den=a*e-b*d,box=document.getElementById('systemSteps');if(![a,b,c,d,e,f].every(Number.isFinite)||den===0){box.innerHTML='<div class="math-error-step">Для единственного решения определитель системы не должен быть равен нулю.</div>';return}const x=(c*e-b*f)/den,y=(a*f-c*d)/den;box.innerHTML=method==='sub'?`<div class="math-step"><span>01</span><p>Из первого уравнения выражаем x или y.</p></div><div class="math-step"><span>02</span><p>Подставляем выражение во второе уравнение.</p></div><div class="math-step"><span>03</span><p>Получаем <strong>x = ${x.toFixed(4)}</strong>, затем <strong>y = ${y.toFixed(4)}</strong>.</p></div><div class="math-result-step">x = ${x.toFixed(4)} · y = ${y.toFixed(4)}</div>`:`<div class="math-step"><span>01</span><p>Умножаем уравнения на подходящие коэффициенты.</p></div><div class="math-step"><span>02</span><p>Складываем уравнения и исключаем одну переменную.</p></div><div class="math-result-step">x = ${x.toFixed(4)} · y = ${y.toFixed(4)}</div>`}
  }

  function matrices(){
    const m=METHODS.matrices;
    pageShell(m,`<div class="math-layout"><div class="math-main-panel"><div class="math-panel-head"><span>МАТРИЧНЫЙ СТАНД</span><b id="matrixOperation">DETERMINANT</b></div><div class="matrix-operation-tabs"><button class="math-action active" data-matrix-op="det">Определитель</button><button class="math-action" data-matrix-op="sum">Сумма матриц</button></div><div class="matrix-stage" id="matrixStage"></div><div class="matrix-result" id="matrixResult">—</div><div class="math-step-panel"><div class="math-panel-mini-title">ОБЪЯСНЕНИЕ</div><div id="matrixSteps" class="math-steps"></div></div></div><aside class="math-sidebar-panel"><div class="math-panel-head"><span>РАЗМЕР</span></div><div class="matrix-size-buttons"><button class="math-action active" data-size="2">2 × 2</button><button class="math-action" data-size="3">3 × 3</button></div><div class="math-panel-head"><span>АКТИВНАЯ МАТРИЦА</span><b id="matrixTarget">A</b></div><div class="matrix-target-buttons"><button class="math-action active" data-target="A">A</button><button class="math-action" data-target="B">B</button></div><div class="math-panel-head"><span>ВВОД</span><b id="matrixActive">a₁₁</b></div><div id="matrixKeys"></div><div class="math-keyboard-special"><button id="matrixMinus">±</button><button id="matrixBack">⌫</button><button id="matrixClear">AC</button></div></aside></div>`);

    let n=2,operation='det',target='A',active=0;
    let A=Array.from({length:3},()=>Array(3).fill(''));
    let B=Array.from({length:3},()=>Array(3).fill(''));
    for(let i=0;i<3;i++)for(let j=0;j<3;j++){A[i][j]=i===j?'1':'0';B[i][j]=i===j?'1':'0'}

    const keys=keypad('matrixKeys',{keys:['7','8','9','4','5','6','1','2','3','0','⌫']});
    document.querySelectorAll('[data-size]').forEach(btn=>btn.addEventListener('click',()=>{n=Number(btn.dataset.size);active=0;document.querySelectorAll('[data-size]').forEach(x=>x.classList.toggle('active',x===btn));render();calculate()}));
    document.querySelectorAll('[data-target]').forEach(btn=>btn.addEventListener('click',()=>{target=btn.dataset.target;active=0;document.querySelectorAll('[data-target]').forEach(x=>x.classList.toggle('active',x===btn));setText('matrixTarget',target);setText('matrixActive',`${target==='A'?'a':'b'}₁₁`);render();calculate()}));
    document.querySelectorAll('[data-matrix-op]').forEach(btn=>btn.addEventListener('click',()=>{operation=btn.dataset.matrixOp;document.querySelectorAll('[data-matrix-op]').forEach(x=>x.classList.toggle('active',x===btn));setText('matrixOperation',operation==='det'?'DETERMINANT':'MATRIX SUM');render();calculate()}));
    keys.addEventListener('click',e=>{const k=e.target.closest('[data-key]')?.dataset.key;if(!k)return;const M=target==='A'?A:B;const i=Math.floor(active/n),j=active%n;if(k==='⌫')M[i][j]=M[i][j].slice(0,-1);else M[i][j]=(M[i][j]==='0'?'':M[i][j])+k;render();calculate()});
    document.getElementById('matrixMinus').addEventListener('click',()=>{const M=target==='A'?A:B,i=Math.floor(active/n),j=active%n;M[i][j]=M[i][j].startsWith('-')?M[i][j].slice(1):'-'+M[i][j];render();calculate()});
    document.getElementById('matrixBack').addEventListener('click',()=>{const M=target==='A'?A:B,i=Math.floor(active/n),j=active%n;M[i][j]=M[i][j].slice(0,-1);render();calculate()});
    document.getElementById('matrixClear').addEventListener('click',()=>{(target==='A'?A:B).forEach(row=>row.fill(''));render();calculate()});
    render();calculate();

    function render(){
      const stage=document.getElementById('matrixStage');
      const matrix=(target==='A'?A:B);
      const colorName=target==='A'?'a':'b';
      const aHtml=`<div class="matrix-block"><span class="matrix-caption">МАТРИЦА A</span><div class="matrix-grid" style="--n:${n}">${Array.from({length:n*n},(_,idx)=>{const i=Math.floor(idx/n),j=idx%n;return `<button class="matrix-cell ${target==='A'&&idx===active?'active':''}" data-matrix-cell="A-${idx}"><span>a${i+1}${j+1}</span><strong>${escapeHtml(A[i][j])}</strong></button>`}).join('')}</div></div>`;
      const bHtml=operation==='sum'?`<div class="matrix-block"><span class="matrix-caption">МАТРИЦА B</span><div class="matrix-grid" style="--n:${n}">${Array.from({length:n*n},(_,idx)=>{const i=Math.floor(idx/n),j=idx%n;return `<button class="matrix-cell ${target==='B'&&idx===active?'active':''}" data-matrix-cell="B-${idx}"><span>b${i+1}${j+1}</span><strong>${escapeHtml(B[i][j])}</strong></button>`}).join('')}</div></div>`:'';
      stage.innerHTML=`<div class="matrix-pair">${aHtml}${operation==='sum'?'<div class="matrix-plus">+</div>':''}${bHtml}</div>`;
      stage.querySelectorAll('[data-matrix-cell]').forEach(btn=>btn.addEventListener('click',()=>{const [which,idx]=btn.dataset.matrixCell.split('-');target=which;active=Number(idx);document.querySelectorAll('[data-target]').forEach(x=>x.classList.toggle('active',x.dataset.target===target));setText('matrixTarget',target);setText('matrixActive',`${target==='A'?'a':'b'}${Math.floor(active/n)+1}${active%n+1}`);render()}));
    }
    function determinant(M){if(M.length===2)return M[0][0]*M[1][1]-M[0][1]*M[1][0];return M[0][0]*(M[1][1]*M[2][2]-M[1][2]*M[2][1])-M[0][1]*(M[1][0]*M[2][2]-M[1][2]*M[2][0])+M[0][2]*(M[1][0]*M[2][1]-M[1][1]*M[2][0])}
    function calculate(){
      const MA=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>Number(A[i][j]||0)));
      if(operation==='det'){
        const d=determinant(MA);setText('matrixResult',`det A = ${d}`);document.getElementById('matrixSteps').innerHTML=`<div class="math-step"><span>01</span><p>Берём матрицу A размером ${n}×${n}.</p></div><div class="math-step"><span>02</span><p>Выполняем вычисление определителя.</p></div><div class="math-result-step">det A = ${d}</div>`;
      } else {
        const MB=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>Number(B[i][j]||0)));
        const C=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>MA[i][j]+MB[i][j]));
        setText('matrixResult',`A + B = ${C.map(row=>'[ '+row.join('   ')+' ]').join('  ')}`);document.getElementById('matrixSteps').innerHTML=`<div class="math-step"><span>01</span><p>Складываем элементы A и B, стоящие на одинаковых позициях.</p></div><div class="math-step"><span>02</span><p>Например: c₁₁ = a₁₁ + b₁₁ = ${MA[0][0]} + ${MB[0][0]} = ${C[0][0]}.</p></div><div class="math-result-step">Получена матрица A + B.</div>`;
      }
    }
  }

  function percent(){
    const m=METHODS.percent;pageShell(m,`<div class="math-layout"><div class="math-main-panel"><div class="math-panel-head"><span>ПРОЦЕНТНЫЙ КОНСТРУКТОР</span><b>PERCENT</b></div><div class="percent-question"><strong id="percentVisual">20% от 150</strong><span>=</span><strong id="percentResult">30</strong></div><div class="percent-methods"><button class="math-action active" data-pct="part">Процент от числа</button><button class="math-action" data-pct="increase">Увеличение</button><button class="math-action" data-pct="decrease">Уменьшение</button></div><div class="math-step-panel"><div class="math-panel-mini-title">ПОШАГОВО</div><div id="percentSteps" class="math-steps"></div></div></div><aside class="math-sidebar-panel"><div class="math-panel-head"><span>ЧИСЛА</span><b>КЛАВИАТУРА</b></div><label class="math-large-input">Процент <input id="pctA" value="20" readonly></label><label class="math-large-input">Число <input id="pctB" value="150" readonly></label><div id="percentKeys"></div><div class="math-keyboard-special"><button id="pctActiveA">Выбрать %</button><button id="pctActiveB">Выбрать число</button><button id="pctClear">AC</button></div></aside></div>`);
    let A='20',B='150',active='A',mode='part';const keys=keypad('percentKeys',{keys:['7','8','9','4','5','6','1','2','3','0','⌫']});
    document.getElementById('pctActiveA').addEventListener('click',()=>active='A');document.getElementById('pctActiveB').addEventListener('click',()=>active='B');document.getElementById('pctClear').addEventListener('click',()=>{A='';B='';refresh()});keys.addEventListener('click',e=>{const k=e.target.closest('[data-key]')?.dataset.key;if(!k)return;if(active==='A')A=k==='⌫'?A.slice(0,-1):A+k;else B=k==='⌫'?B.slice(0,-1):B+k;refresh()});document.querySelectorAll('[data-pct]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.pct;document.querySelectorAll('[data-pct]').forEach(x=>x.classList.toggle('active',x===b));refresh()}));refresh();
    function refresh(){const p=Number(A),n=Number(B);document.getElementById('pctA').value=A;document.getElementById('pctB').value=B;if(!Number.isFinite(p)||!Number.isFinite(n))return;let r=0,text='';if(mode==='part'){r=n*p/100;text=`${p}% / 100 × ${n} = ${r}`}else if(mode==='increase'){r=n*(1+p/100);text=`${n} × (1 + ${p}/100) = ${r}`}else{r=n*(1-p/100);text=`${n} × (1 − ${p}/100) = ${r}`}document.getElementById('percentResult').textContent=r.toFixed(4).replace(/\.0+$/,'');document.getElementById('percentVisual').textContent=mode==='part'?`${p}% от ${n}`:mode==='increase'?`${n} + ${p}%`:`${n} − ${p}%`;document.getElementById('percentSteps').innerHTML=`<div class="math-step"><span>01</span><p>${text}</p></div><div class="math-result-step">Ответ: ${r}</div>`}
  }

  function geometry(){
    const m=METHODS.geometry;pageShell(m,`<div class="math-layout"><div class="math-main-panel"><div class="math-panel-head"><span>ТРЕУГОЛЬНИК</span><b>GEOMETRY</b></div><div class="geometry-stage"><canvas id="geometryCanvas" width="760" height="420"></canvas></div><div class="geometry-results"><div><span>Гипотенуза</span><strong id="geoC">5</strong></div><div><span>Площадь</span><strong id="geoS">6</strong></div><div><span>Периметр</span><strong id="geoP">12</strong></div></div></div><aside class="math-sidebar-panel"><div class="math-panel-head"><span>КАТЕТЫ</span><b>КЛАВИАТУРА</b></div><label class="math-large-input">Катет a<input id="geoA" value="3" readonly></label><label class="math-large-input">Катет b<input id="geoB" value="4" readonly></label><div class="geo-active"><button id="geoPickA" class="active">A</button><button id="geoPickB">B</button></div><div id="geoKeys"></div><div class="math-keyboard-special"><button id="geoClear">AC</button></div><div class="math-help"><strong>Формула</strong><p>c = √(a² + b²). Затем рассчитываются площадь и периметр.</p></div></aside></div>`);
    let A='3',B='4',active='A';const keys=keypad('geoKeys',{keys:['7','8','9','4','5','6','1','2','3','0','⌫']});document.getElementById('geoPickA').addEventListener('click',()=>{active='A';document.getElementById('geoPickA').classList.add('active');document.getElementById('geoPickB').classList.remove('active')});document.getElementById('geoPickB').addEventListener('click',()=>{active='B';document.getElementById('geoPickB').classList.add('active');document.getElementById('geoPickA').classList.remove('active')});keys.addEventListener('click',e=>{const k=e.target.closest('[data-key]')?.dataset.key;if(!k)return;if(active==='A')A=k==='⌫'?A.slice(0,-1):A+k;else B=k==='⌫'?B.slice(0,-1):B+k;update()});document.getElementById('geoClear').addEventListener('click',()=>{A='';B='';update()});update();
    function update(){const a=Number(A),b=Number(B);document.getElementById('geoA').value=A;document.getElementById('geoB').value=B;if(!Number.isFinite(a)||!Number.isFinite(b))return;const c=Math.sqrt(a*a+b*b),s=a*b/2,p=a+b+c;setText('geoC',c.toFixed(3));setText('geoS',s.toFixed(3));setText('geoP',p.toFixed(3));draw(a,b,c)}
    function draw(a,b,c){const canvas=document.getElementById('geometryCanvas'),ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#0a0e13';ctx.fillRect(0,0,w,h);const scale=Math.min(250/Math.max(a,1),220/Math.max(b,1)),x=170,y=310;ctx.strokeStyle='#71808b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+a*scale,y);ctx.lineTo(x,y-b*scale);ctx.closePath();ctx.stroke();ctx.fillStyle='#5fcfe6';ctx.font='14px DM Mono,monospace';ctx.fillText(`a = ${a}`,x+a*scale/2,y+30);ctx.fillText(`b = ${b}`,x-65,y-b*scale/2);ctx.fillText(`c = ${c.toFixed(2)}`,x+a*scale/2-10,y-b*scale/2);ctx.fillStyle='#5b6b77';ctx.font='10px DM Mono,monospace';ctx.fillText('∠C = 90°',x+10,y-10)}
  }

  return {renderCatalog,openMethod};
})();
