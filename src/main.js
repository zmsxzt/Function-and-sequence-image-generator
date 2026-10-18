import './style.css';
import { sample, validateRange } from './math.js';
const colors = ['#5268e8','#e99b36','#32a491','#d46eaa'];
let mode = 'function', curves = [{id:1,expression:'sin(x)',color:colors[0],visible:true},{id:2,expression:'cos(x)',color:colors[1],visible:true}], nextId=3;
let view={xmin:-10,xmax:10,ymin:-3,ymax:3}, parameter=1, grid=true, connect=false;
const $=s=>document.querySelector(s);
$('#app').innerHTML=`
<header><a class="brand" href="./"><span class="brand-icon">∿</span>序绘<span class="brand-tag">MATH STUDIO</span></a><div class="header-right"><span class="local-dot"></span> 在浏览器中自由探索 <a href="#" id="help">使用指南 ↗</a></div></header>
<main><div class="intro"><div><div class="eyebrow">MAKE MATH VISIBLE</div><h1>让每一个公式，都有迹可循<span>。</span></h1><p>从函数的起伏，到数列的规律。把抽象的数学，变成直观的图像。</p></div><button class="export primary" id="export">↓ <span>导出图片</span></button></div>
<div class="workspace"><aside><div class="tabs"><button class="active" data-mode="function">ƒ 函数图像</button><button data-mode="sequence">∑ 数列图像</button></div>
<section class="expressions"><div class="section-title"><h2 id="expression-title">函数表达式</h2><span id="curve-count">2 条曲线</span></div><div id="curves"></div><button id="add" class="add">＋ 添加表达式</button><p class="hint" id="syntax-hint">支持 sin(x)、x^2、sqrt(x)、log(x)</p></section>
<section><div class="section-title"><h2>坐标范围</h2><button class="text-button" id="reset">重置</button></div><div class="range-grid"><label><span id="x-label">X 轴</span><div><input id="xmin" type="number" value="-10" step="any" aria-label="X 轴最小值"><span>至</span><input id="xmax" type="number" value="10" step="any" aria-label="X 轴最大值"></div></label><label><span>Y 轴</span><div><input id="ymin" type="number" value="-3" step="any" aria-label="Y 轴最小值"><span>至</span><input id="ymax" type="number" value="3" step="any" aria-label="Y 轴最大值"></div></label></div></section>
<section><div class="section-title"><h2>参数探索</h2><span class="badge">a</span></div><div class="parameter"><label for="parameter">参数 a</label><output id="parameter-value">1.0</output></div><input id="parameter" type="range" min="-5" max="5" step="0.1" value="1"><div class="range-labels"><span>−5</span><span>0</span><span>5</span></div><p class="hint">在表达式中加入 a，拖动滑块观察变化</p></section>
<section class="display-section"><h2>显示设置</h2><label class="toggle-row">显示网格<input id="grid" type="checkbox" checked role="switch"></label><label class="toggle-row" id="connect-row" hidden>连接数列点<input id="connect" type="checkbox" role="switch"></label></section>
<div class="sidebar-bottom"><span>✦</span><p>数学的美，藏在每一次探索里。</p></div></aside>
<div class="plot-area"><div class="plot-top"><div><span class="status-dot"></span><strong id="plot-title">函数画布</strong><span class="plot-subtitle">实时绘制</span></div><div class="plot-tools"><button id="zoom-in" title="放大" aria-label="放大">＋</button><button id="zoom-out" title="缩小" aria-label="缩小">−</button><button id="fit" title="恢复视图" aria-label="恢复视图">⌖</button></div></div><div class="canvas-wrap"><canvas id="plot" aria-label="函数与数列坐标图"></canvas><div class="canvas-watermark">序绘 <span> / MATH STUDIO</span></div><div id="coordinates">移动鼠标查看坐标</div></div><div class="plot-bottom"><div id="legend"></div><span id="plot-info">弧度制 · 笛卡尔坐标系</span></div><div id="error" role="alert" hidden></div></div></div>
<div class="presets"><div class="preset-heading"><span>灵感起点</span><p>选一个例子，开始探索</p></div><div id="preset-list"></div></div>
<footer><span>序绘 · 为好奇心而作</span><span>无需安装 · 本地计算 · 自由导出</span></footer></main>
<dialog id="help-dialog"><h2>从一个公式开始</h2><p>输入表达式即可实时绘制，最多同时比较 4 条曲线。函数使用 x，数列使用 n（从第 1 项开始）。</p><p>支持 + − * / ^、π（写作 pi）、e，以及 sin、cos、tan、sqrt、abs、log、exp 等函数。三角函数使用弧度。</p><p>例如 a*sin(x)、x^2、(-1)^n/n。拖动参数 a 观察图像变化；鼠标滚轮可缩放，拖动画布可平移。导出按钮会保存当前画布为 PNG 图片。</p><button id="close-help" class="primary">开始探索</button></dialog>`;
const presets={function:[['正弦与余弦','周期之美',['sin(x)','cos(x)'],[-10,10,-3,3],'∿'],['二次函数','抛物线的轨迹',['a*x^2'],[-5,5,-2,12],'∪'],['反比例函数','无限接近',['1/x'],[-8,8,-5,5],'⌁'],['振幅探索','让参数动起来',['a*sin(x)'],[-10,10,-6,6],'≈']],sequence:[['等差数列','有序的步伐',['2*n+1'],[0,20,0,45],'⋰'],['等比数列','增长的力量',['1.2^n'],[0,20,0,45],'↗'],['交错数列','正负之间',['(-1)^n/n'],[0,30,-1.2,1.2],'⋯'],['收敛数列','趋近一个答案',['1/n'],[0,30,-0.1,1.2],'↘']]};
function renderCurves(){
 $('#curves').innerHTML=curves.map((c,i)=>`<div class="curve-card" style="--curve:${c.color}"><div class="curve-meta"><label><input type="checkbox" ${c.visible?'checked':''} data-visible="${c.id}" aria-label="显示第 ${i+1} 条曲线"><span class="curve-dot"></span>${mode==='function'?'f'+(i+1)+'(x)':'a'+(i+1)+'(n)'}</label><button data-remove="${c.id}" aria-label="删除第 ${i+1} 条曲线">×</button></div><div class="formula"><span>${mode==='function'?'y':'aₙ'} =</span><input data-expression="${c.id}" aria-label="第 ${i+1} 个表达式" spellcheck="false"></div><div class="curve-error" id="error-${c.id}"></div></div>`).join('');
 curves.forEach(c=>$(`[data-expression="${c.id}"]`).value=c.expression);
 $('#curve-count').textContent=`${curves.length} 条${mode==='function'?'曲线':'数列'}`;
 $('#add').disabled=curves.length>=4;
 $('#curves').querySelectorAll('[data-expression]').forEach(el=>el.addEventListener('input',()=>{curves.find(c=>c.id===+el.dataset.expression).expression=el.value;draw();}));
 $('#curves').querySelectorAll('[data-visible]').forEach(el=>el.addEventListener('change',()=>{curves.find(c=>c.id===+el.dataset.visible).visible=el.checked;draw();}));
 $('#curves').querySelectorAll('[data-remove]').forEach(el=>el.addEventListener('click',()=>{curves=curves.filter(c=>c.id!==+el.dataset.remove);renderCurves();draw();}));
}
function renderPresets(){ $('#preset-list').innerHTML=presets[mode].map((p,i)=>`<button class="preset" data-preset="${i}"><span class="preset-icon">${p[4]}</span><span><strong>${p[0]}</strong><small>${p[1]}</small></span><span class="preset-arrow">↗</span></button>`).join(''); $('#preset-list').querySelectorAll('button').forEach(el=>el.onclick=()=>{const p=presets[mode][+el.dataset.preset];curves=p[2].map((expression,i)=>({id:nextId++,expression,color:colors[i],visible:true}));[view.xmin,view.xmax,view.ymin,view.ymax]=p[3];syncRange();renderCurves();draw();}); }
const canvas=$('#plot'),ctx=canvas.getContext('2d');let width=0,height=0;
const padding={left:48,right:28,top:30,bottom:38};
function metrics(){return {w:width-padding.left-padding.right,h:height-padding.top-padding.bottom};}
function transform(x,y){const {w,h}=metrics();return [padding.left+(x-view.xmin)/(view.xmax-view.xmin)*w,padding.top+(view.ymax-y)/(view.ymax-view.ymin)*h];}
function tickStep(range){const raw=range/9,base=10**Math.floor(Math.log10(raw));return [1,2,5,10].map(n=>n*base).find(n=>n>=raw);}
function format(n){return Math.abs(n)<1e-10?'0':Number(n.toPrecision(5)).toString();}
function showError(message=''){ $('#error').textContent=message;$('#error').hidden=!message; }
function draw(){
 if(!width||!height)return;
 ctx.clearRect(0,0,width,height);ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);
 const {w,h}=metrics(); const xs=tickStep(view.xmax-view.xmin),ys=tickStep(view.ymax-view.ymin);
 const origin=transform(0,0), ax=Math.max(padding.left,Math.min(width-padding.right,origin[0])),ay=Math.max(padding.top,Math.min(height-padding.bottom,origin[1]));
 ctx.font='500 12px "Segoe UI", Arial, sans-serif';ctx.lineWidth=1;
 for(let i=Math.ceil(view.xmin/xs);i<=Math.floor(view.xmax/xs);i++){const v=i*xs,[x]=transform(v,0);if(grid){ctx.strokeStyle='#edf0f5';ctx.beginPath();ctx.moveTo(x,padding.top);ctx.lineTo(x,height-padding.bottom);ctx.stroke();}ctx.fillStyle='#596579';ctx.textAlign='center';ctx.fillText(format(v),x,Math.min(height-12,ay+19));}
 for(let i=Math.ceil(view.ymin/ys);i<=Math.floor(view.ymax/ys);i++){const v=i*ys,[,y]=transform(0,v);if(grid){ctx.strokeStyle='#edf0f5';ctx.beginPath();ctx.moveTo(padding.left,y);ctx.lineTo(width-padding.right,y);ctx.stroke();}if(Math.abs(v)>1e-10){ctx.fillStyle='#596579';ctx.textAlign='right';ctx.fillText(format(v),Math.max(30,ax-10),y+4);}}
 ctx.strokeStyle='#b7bfce';ctx.beginPath();ctx.moveTo(padding.left,ay);ctx.lineTo(width-padding.right+7,ay);ctx.moveTo(ax,padding.top-7);ctx.lineTo(ax,height-padding.bottom);ctx.stroke();
 ctx.fillStyle='#455169';ctx.textAlign='left';ctx.fillText(mode==='function'?'x':'n',width-padding.right+10,ay+4);ctx.fillText('y',ax+8,padding.top-9);
 ctx.save();ctx.beginPath();ctx.rect(padding.left,padding.top,w,h);ctx.clip();
 const valid=[];
 curves.forEach(c=>{const error=$(`#error-${c.id}`);error.textContent='';if(!c.visible)return;try{const pts=sample(c.expression,mode,view.xmin,view.xmax,parameter);if(!pts.some(p=>Number.isFinite(p[1])))throw new Error('当前范围内没有有效的实数值');valid.push(c);ctx.strokeStyle=c.color;ctx.fillStyle=c.color;ctx.lineWidth=2.4;ctx.lineJoin='round';ctx.beginPath();let last=null;for(const [x,y] of pts){if(!Number.isFinite(y)){last=null;continue;}const p=transform(x,y);if(mode==='sequence'){if(connect&&last) {ctx.moveTo(...last);ctx.lineTo(...p);}last=p;}else{if(!last||Math.abs(p[1]-last[1])>h*0.65)ctx.moveTo(...p);else ctx.lineTo(...p);last=p;}}ctx.stroke();if(mode==='sequence')for(const [x,y]of pts){if(!Number.isFinite(y))continue;const p=transform(x,y);ctx.beginPath();ctx.arc(...p,3.8,0,Math.PI*2);ctx.fill();}}catch(e){error.textContent=e.message;}});
 ctx.restore();$('#legend').replaceChildren(...valid.map(c=>{const el=document.createElement('span');const dot=document.createElement('i');dot.style.background=c.color;el.append(dot,document.createTextNode(c.expression));return el;}));
}
function resize(){const rect=canvas.parentElement.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=window.devicePixelRatio||1;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);draw();}
function syncRange(){for(const k of ['xmin','xmax','ymin','ymax'])$('#'+k).value=Number(view[k].toPrecision(8));}
for(const k of ['xmin','xmax','ymin','ymax'])$('#'+k).addEventListener('change',()=>{try{const v=Object.fromEntries(['xmin','xmax','ymin','ymax'].map(key=>[key,$('#'+key).value.trim()===''?NaN:Number($('#'+key).value)]));validateRange(v.xmin,v.xmax);validateRange(v.ymin,v.ymax);if(mode==='sequence'&&v.xmax-Math.max(1,v.xmin)>2000)throw new Error('数列最多显示 2000 项');view=v;showError();draw();}catch(e){showError(e.message);}});
$('#add').onclick=()=>{if(curves.length>=4)return;curves.push({id:nextId++,expression:mode==='function'?'x':'n',color:colors.find(color=>!curves.some(c=>c.color===color))||colors[0],visible:true});renderCurves();draw();};
function reset(){view=mode==='function'?{xmin:-10,xmax:10,ymin:-3,ymax:3}:{xmin:0,xmax:30,ymin:-0.1,ymax:1.2};syncRange();showError();draw();}
$('#reset').onclick=reset;$('#fit').onclick=reset;
function zoom(factor){const cx=(view.xmin+view.xmax)/2,cy=(view.ymin+view.ymax)/2,dx=(view.xmax-view.xmin)*factor/2,dy=(view.ymax-view.ymin)*factor/2;if(dx<1e-7||dx>1e7||dy<1e-7||dy>1e7)return;if(mode==='sequence'&&dx*2>2000)return;view={xmin:cx-dx,xmax:cx+dx,ymin:cy-dy,ymax:cy+dy};syncRange();showError();draw();}
$('#zoom-in').onclick=()=>zoom(0.8);$('#zoom-out').onclick=()=>zoom(1.25);
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?1.15:1/1.15);},{passive:false});
let drag=null;
canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,view:{...view}};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');});
canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect(),{w,h}=metrics();if(drag){const dx=(e.clientX-drag.x)/w*(drag.view.xmax-drag.view.xmin),dy=(e.clientY-drag.y)/h*(drag.view.ymax-drag.view.ymin);view={xmin:drag.view.xmin-dx,xmax:drag.view.xmax-dx,ymin:drag.view.ymin+dy,ymax:drag.view.ymax+dy};syncRange();draw();}const x=view.xmin+(e.clientX-r.left-padding.left)/w*(view.xmax-view.xmin),y=view.ymax-(e.clientY-r.top-padding.top)/h*(view.ymax-view.ymin);$('#coordinates').textContent=`${mode==='function'?'x':'n'}: ${x.toFixed(3)}   y: ${y.toFixed(3)}`;});
function endDrag(){drag=null;canvas.classList.remove('dragging');}canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
$('#parameter').oninput=e=>{parameter=Number(e.target.value);$('#parameter-value').textContent=parameter.toFixed(1);draw();};$('#grid').onchange=e=>{grid=e.target.checked;draw();};$('#connect').onchange=e=>{connect=e.target.checked;draw();};
document.querySelectorAll('[data-mode]').forEach(btn=>btn.onclick=()=>{if(mode===btn.dataset.mode)return;mode=btn.dataset.mode;document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b===btn));$('#expression-title').textContent=mode==='function'?'函数表达式':'数列通项公式';$('#plot-title').textContent=mode==='function'?'函数画布':'数列画布';$('#x-label').textContent=mode==='function'?'X 轴':'项数 n';$('#syntax-hint').textContent=mode==='function'?'支持 sin(x)、x^2、sqrt(x)、log(x)':'支持 1/n、2*n+1、(-1)^n · n 从 1 开始';$('#plot-info').textContent=mode==='function'?'弧度制 · 笛卡尔坐标系':'正整数项 · 离散点图';$('#connect-row').hidden=mode!=='sequence';curves=[{id:nextId++,expression:mode==='function'?'sin(x)':'1/n',color:colors[0],visible:true}];renderCurves();renderPresets();reset();});
$('#export').onclick=()=>{const out=document.createElement('canvas');out.width=canvas.width;out.height=canvas.height+100;const c=out.getContext('2d');c.fillStyle='white';c.fillRect(0,0,out.width,out.height);c.drawImage(canvas,0,0);c.fillStyle='#667085';c.font='16px sans-serif';const label=curves.filter(x=>x.visible&&!$(`#error-${x.id}`).textContent).map(x=>x.expression).join('   /   ');c.fillText(`序绘 · ${label}   (a = ${parameter})`,30,canvas.height+40);out.toBlob(blob=>{if(!blob){showError('导出失败，请重试');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`序绘-${mode==='function'?'函数':'数列'}-${Date.now()}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');};
$('#help').onclick=e=>{e.preventDefault();$('#help-dialog').showModal();};$('#close-help').onclick=()=>$('#help-dialog').close();
renderCurves();renderPresets();new ResizeObserver(resize).observe(canvas.parentElement);

// Refresh the backing resolution after browser zoom or display changes.
window.addEventListener('resize', resize);
