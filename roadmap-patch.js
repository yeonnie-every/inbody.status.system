/*  ============================================================
 *  IBS – 로드맵 v7 (대륙별 색상 + 균일 버블 크기 + 깔끔 디자인)
 *  - world-map.svg 파일을 같은 폴더에 배치해야 합니다
 *  ============================================================ */
(function(){
'use strict';

var css=document.createElement('style');
css.textContent=`
.rm-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
.rm-grid-2-1{display:grid;grid-template-columns:2.2fr 1fr;gap:16px;margin-bottom:20px}
.rm-card{background:var(--white);border-radius:12px;box-shadow:var(--shadow);overflow:hidden}
.rm-card-head{padding:14px 20px;border-bottom:1px solid var(--border);font-size:13px;font-weight:700;color:var(--text);display:flex;align-items:center;justify-content:space-between}
.rm-card-body{padding:16px 20px}
.rm-map-outer{position:relative;background:linear-gradient(145deg,#0c1929 0%,#132b42 50%,#0e1f33 100%);border-radius:10px;overflow:hidden}
.rm-map-bg{display:block;width:100%;height:auto;opacity:0.5;filter:brightness(1.05) saturate(1.1)}
.rm-map-overlay{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}
.rm-map-overlay svg{width:100%;height:100%;pointer-events:all}
.rm-map-tooltip{position:fixed;background:rgba(10,18,30,.96);color:#fff;padding:14px 20px;border-radius:12px;font-size:12px;pointer-events:none;z-index:999;display:none;box-shadow:0 8px 32px rgba(0,0,0,.5);line-height:1.9;backdrop-filter:blur(8px);border:1px solid rgba(100,180,255,.15);max-width:220px}
.map-legend{display:flex;gap:14px;padding:10px 16px;flex-wrap:wrap;align-items:center;background:rgba(0,0,0,.2);border-top:1px solid rgba(255,255,255,.05)}
.map-legend-item{display:flex;align-items:center;gap:5px;font-size:10px;color:rgba(255,255,255,.6);font-weight:600}
.map-legend-dot{width:8px;height:8px;border-radius:50%}
.country-rank-item{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)}
.country-rank-item:last-child{border-bottom:none}
.cr-num{font-size:10px;font-weight:800;color:var(--text2);width:18px;text-align:center}
.cr-name{font-size:12px;font-weight:600;color:var(--text);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cr-bar-wrap{width:70px;background:var(--gray-light);border-radius:99px;height:5px;overflow:hidden}
.cr-bar{height:100%;border-radius:99px}
.cr-pct{font-size:11px;font-weight:700;width:34px;text-align:right}
.rm-gantt-compact{overflow-x:auto;max-height:320px;overflow-y:auto}
.rm-gantt-compact table{border-collapse:collapse;width:100%;min-width:700px}
.rm-gantt-compact th{background:#f8fafc;color:var(--text2);font-size:9px;font-weight:700;padding:6px 3px;border:1px solid var(--border);text-align:center;position:sticky;top:0;z-index:2}
.rm-gantt-compact th.gl{text-align:left;padding-left:10px;min-width:120px;position:sticky;left:0;background:#f8fafc;z-index:3}
.rm-gantt-compact td{border:1px solid var(--border);padding:0;height:26px;position:relative}
.rm-gantt-compact td.gl{text-align:left;padding:4px 10px;font-size:11px;font-weight:600;background:#fafbfc;position:sticky;left:0;z-index:1;white-space:nowrap}
.rm-gbar{position:absolute;top:5px;height:16px;border-radius:4px;min-width:6px;font-size:8px;font-weight:700;color:#fff;display:flex;align-items:center;padding:0 3px;overflow:hidden;cursor:pointer}
.rm-gbar:hover{opacity:.8}
.rm-today-line{position:absolute;top:0;bottom:0;width:2px;background:var(--red);z-index:5;pointer-events:none}
.rm-ms-list{max-height:300px;overflow-y:auto}
.rm-ms-item{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border)}
.rm-ms-item:last-child{border-bottom:none}
.rm-ms-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.rm-ms-info{flex:1;min-width:0}
.rm-ms-title{font-size:12px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rm-ms-meta{font-size:10px;color:var(--text2);margin-top:1px}
@media(max-width:900px){.rm-grid-2,.rm-grid-2-1{grid-template-columns:1fr}}
`;
document.head.appendChild(css);

// ── Helpers ──
function _vP(){return typeof getVisibleParts==='function'?getVisibleParts():(typeof PARTS!=='undefined'?PARTS:[]);}
function _allE(){return typeof allEntries==='function'?allEntries():[];}
function _dls(){return typeof deadlines!=='undefined'?deadlines:[];}
function _ent(){return typeof entries!=='undefined'?entries:{};}
function _dd(ds){return Math.ceil((new Date(ds)-new Date().setHours(0,0,0,0))/864e5);}
function _pc(i){var c=['#7c2d3e','#9e3a50','#c4883a','#b8648a','#2563eb','#059669','#d97706','#7c3aed','#dc2626','#8b5a7a'];return c[i%c.length];}

var VALID_COUNTRIES=['한국','일본','미국','중국','유럽','글로벌','독일','프랑스','영국','캐나다','호주','인도','브라질','멕시코','러시아','태국','베트남','인도네시아','말레이시아','싱가포르','대만','홍콩','사우디','UAE','터키','이탈리아','스페인','네덜란드','폴란드','스웨덴','스위스','뉴질랜드','남아프리카','아르헨티나','필리핀','이집트','영어','일본어','중국어','한국어','불어','독일어','스페인어','포르투갈어','이탈리아어','러시아어','아랍어','태국어','베트남어','인도네시아어','영어(미국)','중국어(간체)','중국어(번체)','중국어/대만이(번체)'];
function _exC(p){var m=p.match(/\(([^()]+)\)$/);if(!m)return null;var c=m[1].trim();return VALID_COUNTRIES.indexOf(c)>=0?c:null;}

// ── 대륙별 색상 (6대륙) ──
var CONTINENT_COLORS={
  '아시아':'#f59e0b',    // 앰버/골드
  '유럽':'#3b82f6',      // 블루
  '북미':'#10b981',      // 에메랄드
  '남미':'#8b5cf6',      // 퍼플
  '아프리카':'#ef4444',  // 레드
  '오세아니아':'#06b6d4' // 시안
};

// 국가 → 대륙 매핑
var COUNTRY_CONTINENT={
  '한국':'아시아','일본':'아시아','중국':'아시아','대만':'아시아','홍콩':'아시아',
  '인도':'아시아','태국':'아시아','베트남':'아시아','인도네시아':'아시아',
  '말레이시아':'아시아','싱가포르':'아시아','필리핀':'아시아',
  '사우디':'아시아','UAE':'아시아','터키':'아시아',
  '한국어':'아시아','일본어':'아시아','중국어':'아시아','중국어(간체)':'아시아',
  '중국어(번체)':'아시아','중국어/대만이(번체)':'아시아',
  '태국어':'아시아','베트남어':'아시아','인도네시아어':'아시아','아랍어':'아시아',
  '유럽':'유럽','독일':'유럽','프랑스':'유럽','영국':'유럽',
  '이탈리아':'유럽','스페인':'유럽','네덜란드':'유럽','폴란드':'유럽',
  '스웨덴':'유럽','스위스':'유럽','러시아':'유럽',
  '독일어':'유럽','불어':'유럽','스페인어':'유럽','포르투갈어':'유럽',
  '이탈리아어':'유럽','러시아어':'유럽',
  '미국':'북미','캐나다':'북미','멕시코':'북미',
  '영어':'북미','영어(미국)':'북미',
  '브라질':'남미','아르헨티나':'남미',
  '이집트':'아프리카','남아프리카':'아프리카',
  '호주':'오세아니아','뉴질랜드':'오세아니아',
  '글로벌':'유럽'
};

function getContinent(c){return COUNTRY_CONTINENT[c]||'아시아';}
function getContinentColor(c){return CONTINENT_COLORS[getContinent(c)]||'#6b7280';}

// 국가별 좌표: x%, y%
var GEO={
  '한국':[78.5,36],'일본':[83,35],'미국':[17,38],'중국':[70,37],
  '유럽':[51,30],'글로벌':[50,50],'독일':[51,30],'프랑스':[48,34],
  '영국':[46,27],'캐나다':[19,24],'호주':[84,73],'인도':[66,48],
  '브라질':[30,63],'멕시코':[14,47],'러시아':[62,20],'태국':[71,50],
  '베트남':[73,50],'인도네시아':[75,58],'말레이시아':[72,55],
  '싱가포르':[72,57],'대만':[77,42],'홍콩':[75,42],
  '사우디':[57,44],'UAE':[59,44],'터키':[55,36],
  '이탈리아':[51,35],'스페인':[47,36],'네덜란드':[50,28],
  '폴란드':[53,28],'스웨덴':[52,22],'스위스':[50,33],
  '뉴질랜드':[89,78],'남아프리카':[54,72],'아르헨티나':[27,76],
  '필리핀':[78,50],'이집트':[55,42],
  '영어':[17,38],'영어(미국)':[17,38],'일본어':[83,35],
  '중국어':[70,37],'중국어(간체)':[70,37],'중국어(번체)':[77,42],
  '중국어/대만이(번체)':[77,42],
  '한국어':[78.5,36],'불어':[48,34],'독일어':[51,30],
  '스페인어':[47,36],'포르투갈어':[47,37],'이탈리아어':[51,35],
  '러시아어':[62,20],'아랍어':[57,44],'태국어':[71,50],
  '베트남어':[73,50],'인도네시아어':[75,58]
};

// ── Page HTML ──
var rp=document.getElementById('page-roadmap');
if(rp){rp.innerHTML=`
<div class="ph"><h1>Roadmap</h1><p>로드맵</p></div>
<div class="rm-grid-2-1">
  <div class="rm-card">
    <div class="rm-card-head">🌏 국가별 진행 현황<select id="rm-map-filter" onchange="renderRoadmap()" style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;font-size:11px;font-family:inherit;margin-left:8px"><option value="">전체</option><option value="아시아">아시아</option><option value="유럽">유럽</option><option value="북미">북미</option><option value="남미">남미</option><option value="아프리카">아프리카</option><option value="오세아니아">오세아니아</option></select></div>
    <div class="rm-card-body" style="padding:0">
      <div class="rm-map-outer" id="rm-map-outer">
        <img class="rm-map-bg" id="rm-map-bg" src="world-map.svg" alt="World Map" onerror="this.style.display='none';document.getElementById('rm-map-outer').style.minHeight='320px'">
        <div class="rm-map-overlay" id="rm-map-overlay"></div>
      </div>
      <div class="map-legend" id="rm-map-legend"></div>
    </div>
  </div>
  <div class="rm-card">
    <div class="rm-card-head">📊 국가별 진행률 순위</div>
    <div class="rm-card-body" style="padding:10px 16px;max-height:420px;overflow-y:auto"><div id="rm-country-rank"></div></div>
  </div>
</div>
<div class="rm-grid-2">
  <div class="rm-card">
    <div class="rm-card-head">📈 파트별 진행률</div>
    <div class="rm-card-body"><canvas id="rm-part-bar" height="180"></canvas></div>
  </div>
  <div class="rm-card">
    <div class="rm-card-head">🚩 다가오는 마일스톤</div>
    <div class="rm-card-body" style="padding:10px 16px"><div class="rm-ms-list" id="rm-milestones"></div></div>
  </div>
</div>
<div class="rm-card">
  <div class="rm-card-head">📊 간트차트 타임라인
    <div style="display:flex;gap:6px;align-items:center">
      <select id="rm-gantt-part" onchange="renderRoadmap()" style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;font-size:11px;font-family:inherit"><option value="">전체 파트</option></select>
      <select id="rm-gantt-range" onchange="renderRoadmap()" style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;font-size:11px;font-family:inherit"><option value="3">3개월</option><option value="6" selected>6개월</option><option value="12">12개월</option></select>
    </div>
  </div>
  <div class="rm-card-body" style="padding:10px 12px"><div class="rm-gantt-compact" id="rm-gantt"></div></div>
</div>
<div class="rm-map-tooltip" id="rm-tooltip"></div>
`;}

var rmBarInst=null;
window.renderRoadmap=function(){renderWorldMap();renderCountryRank();renderPartBar();renderMilestones();renderGantt();fillGanttSel();};

// ── 균일 버블 크기 ──
var BUBBLE_R=1.8;

// ── World Map ──
function renderWorldMap(){
  var overlay=document.getElementById('rm-map-overlay');if(!overlay)return;
  var all=_allE(),filterContinent=(document.getElementById('rm-map-filter')||{}).value||'';
  var cs={};
  all.forEach(function(e){var c=_exC(e.product);if(!c)return;if(!cs[c])cs[c]={t:0,d:0,i:0,n:0};cs[c].t++;if(e.status==='done')cs[c].d++;else if(e.status==='inprog')cs[c].i++;else cs[c].n++;});

  var keys=Object.keys(cs).filter(function(c){
    if(!GEO[c])return false;
    if(filterContinent&&getContinent(c)!==filterContinent)return false;
    return true;
  });

  var bubbles=[];
  keys.forEach(function(country){
    var g=GEO[country];if(!g)return;
    var s=cs[country],pct=s.t?Math.round(s.d/s.t*100):0;
    var color=getContinentColor(country);
    bubbles.push({country:country,x:g[0],y:g[1],r:BUBBLE_R,color:color,val:s.t,pct:pct,s:s,continent:getContinent(country)});
  });

  // Collision avoidance
  for(var iter=0;iter<20;iter++){
    for(var a=0;a<bubbles.length;a++){
      for(var b=a+1;b<bubbles.length;b++){
        var dx=bubbles[b].x-bubbles[a].x,dy=bubbles[b].y-bubbles[a].y;
        var dist=Math.sqrt(dx*dx+dy*dy);
        var minDist=BUBBLE_R*2+2.5;
        if(dist<minDist&&dist>0){
          var push=(minDist-dist)/2*0.3;
          var nx=dx/dist,ny=dy/dist;
          bubbles[a].x-=nx*push;bubbles[a].y-=ny*push;
          bubbles[b].x+=nx*push;bubbles[b].y+=ny*push;
          bubbles[a].x=Math.max(3,Math.min(97,bubbles[a].x));
          bubbles[a].y=Math.max(3,Math.min(97,bubbles[a].y));
          bubbles[b].x=Math.max(3,Math.min(97,bubbles[b].x));
          bubbles[b].y=Math.max(3,Math.min(97,bubbles[b].y));
        }
      }
    }
  }

  var svg='<svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">';

  bubbles.forEach(function(b){
    // Soft glow
    svg+='<circle cx="'+b.x+'" cy="'+b.y+'" r="'+(b.r+0.8)+'" fill="'+b.color+'" opacity="0.15"/>';
    // Main circle
    svg+='<circle cx="'+b.x+'" cy="'+b.y+'" r="'+b.r+'" fill="'+b.color+'" opacity="0.9" stroke="rgba(255,255,255,0.45)" stroke-width="0.1" style="cursor:pointer" '+
      'onmouseenter="showMapTip(evt,\''+b.country.replace(/'/g,"\\\'")+'\','+b.s.d+','+b.s.t+','+b.pct+','+b.s.i+','+b.s.n+',\''+b.continent+'\')" onmouseleave="hideMapTip()"/>';
    // Label below
    svg+='<text x="'+b.x+'" y="'+(b.y+b.r+1.4)+'" text-anchor="middle" font-size="1.1" font-weight="700" fill="rgba(255,255,255,0.85)" style="pointer-events:none;paint-order:stroke;stroke:rgba(0,0,0,0.7);stroke-width:0.3px;stroke-linejoin:round" font-family="Noto Sans KR,sans-serif">'+b.country+'</text>';
  });

  svg+='</svg>';
  overlay.innerHTML=svg;

  // Legend (대륙별)
  var lg=document.getElementById('rm-map-legend');
  if(lg){
    var legendHtml='';
    var continentNames=['아시아','유럽','북미','남미','아프리카','오세아니아'];
    continentNames.forEach(function(cn){
      legendHtml+='<div class="map-legend-item"><div class="map-legend-dot" style="background:'+CONTINENT_COLORS[cn]+'"></div>'+cn+'</div>';
    });
    legendHtml+='<div class="map-legend-item" style="margin-left:auto;color:rgba(255,255,255,.7)">'+keys.length+'개 국가/언어</div>';
    lg.innerHTML=legendHtml;
  }
}

window.showMapTip=function(evt,c,d,t,p,i,n,cont){
  var tip=document.getElementById('rm-tooltip');if(!tip)return;
  var cc=CONTINENT_COLORS[cont]||'#6b7280';
  tip.innerHTML='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:8px"><div style="width:10px;height:10px;border-radius:50%;background:'+cc+';flex-shrink:0"></div><div style="font-weight:800;font-size:14px">'+c+'</div><div style="font-size:10px;color:rgba(255,255,255,.5)">'+cont+'</div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px"><div>전체</div><div style="font-weight:800">'+t+'건</div><div>완료</div><div style="font-weight:700;color:#10b981">'+d+' ('+p+'%)</div><div>진행중</div><div style="font-weight:700;color:#3b82f6">'+i+'</div><div>미착수</div><div style="font-weight:700;color:#f59e0b">'+n+'</div></div>';
  tip.style.display='block';tip.style.left=(evt.clientX+16)+'px';tip.style.top=(evt.clientY-14)+'px';
};
window.hideMapTip=function(){var t=document.getElementById('rm-tooltip');if(t)t.style.display='none';};

function renderCountryRank(){var el=document.getElementById('rm-country-rank');if(!el)return;var all=_allE(),st={};all.forEach(function(e){var c=_exC(e.product);if(!c)return;if(!st[c])st[c]={t:0,d:0};st[c].t++;if(e.status==='done')st[c].d++;});var sorted=Object.keys(st).map(function(c){var s=st[c];return{c:c,t:s.t,d:s.d,p:Math.round(s.d/s.t*100)};}).sort(function(a,b){return b.p-a.p||b.t-a.t;});if(!sorted.length){el.innerHTML='<div class="empty" style="padding:20px">국가별 데이터가 없습니다.</div>';return;}el.innerHTML=sorted.map(function(s,i){var color=getContinentColor(s.c);return'<div class="country-rank-item"><span class="cr-num">'+(i+1)+'</span><span class="cr-name"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:'+color+';margin-right:6px;vertical-align:middle"></span>'+s.c+'</span><div class="cr-bar-wrap"><div class="cr-bar" style="width:'+s.p+'%;background:'+color+'"></div></div><span class="cr-pct" style="color:'+color+'">'+s.p+'%</span><span style="font-size:10px;color:var(--text2);width:38px;text-align:right">'+s.d+'/'+s.t+'</span></div>';}).join('');}

function renderPartBar(){var cv=document.getElementById('rm-part-bar');if(!cv)return;var ctx=cv.getContext('2d');if(rmBarInst)rmBarInst.destroy();var vP=_vP(),all=_allE();var lb=vP.filter(function(p){return all.some(function(e){return e.part===p;});});var d1=lb.map(function(p){return all.filter(function(e){return e.part===p&&e.status==='done'}).length;});var d2=lb.map(function(p){return all.filter(function(e){return e.part===p&&e.status==='inprog'}).length;});var d3=lb.map(function(p){return all.filter(function(e){return e.part===p&&(e.status==='none'||e.status==='na')}).length;});rmBarInst=new Chart(ctx,{type:'bar',data:{labels:lb,datasets:[{label:'완료',data:d1,backgroundColor:'#10b981',borderRadius:4},{label:'진행중',data:d2,backgroundColor:'#3b82f6',borderRadius:4},{label:'미착수',data:d3,backgroundColor:'#e5e7eb',borderRadius:4}]},options:{responsive:true,plugins:{legend:{position:'top',labels:{font:{size:11},usePointStyle:true,pointStyle:'rectRounded'}}},scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,ticks:{stepSize:1},grid:{color:'#f0f0f0'}}}}});}

function renderMilestones(){var el=document.getElementById('rm-milestones');if(!el)return;var dls=_dls(),now=new Date(),ent=_ent(),vP=_vP();var items=dls.filter(function(d){return vP.indexOf(d.part)>=0;}).map(function(d){var e=ent[d.part+'|'+d.product+'|'+d.type];return{date:d.date,product:d.product.replace(/\s*\(.+\)$/,''),type:d.type,part:d.part,assignee:d.assignee,done:e&&e.status==='done',dd:_dd(d.date),prio:d.prio};}).sort(function(a,b){return new Date(a.date)-new Date(b.date);}).slice(0,10);_allE().forEach(function(e){if(typeof extractDateFromNote==='function'&&e.note){var nd=extractDateFromNote(e.note);if(nd&&!items.some(function(m){return m.product===e.product.replace(/\s*\(.+\)$/,'')&&m.type===e.type;})){items.push({date:nd,product:e.product.replace(/\s*\(.+\)$/,''),type:e.type,part:e.part,assignee:e.owner||'',done:e.status==='done',dd:_dd(nd)});}}});items.sort(function(a,b){return new Date(a.date)-new Date(b.date);});items=items.slice(0,10);if(!items.length){el.innerHTML='<div class="empty" style="padding:20px">마일스톤이 없습니다.</div>';return;}el.innerHTML=items.map(function(m){var color=m.done?'#10b981':m.dd<0?'#ef4444':m.dd<=3?'#f59e0b':'#3b82f6';var label=m.done?'완료':m.dd<0?Math.abs(m.dd)+'일 초과':m.dd===0?'오늘':'D-'+m.dd;return'<div class="rm-ms-item"><div class="rm-ms-dot" style="background:'+color+'"></div><div class="rm-ms-info"><div class="rm-ms-title">'+(m.prio==='high'?'🔴 ':m.prio==='mid'?'🟡 ':'')+m.product+' › '+m.type+'</div><div class="rm-ms-meta">'+m.part+(m.assignee?' · '+m.assignee:'')+' · '+m.date+'</div></div><span class="dl-chip '+(m.done?'dl-ok':m.dd<0?'dl-over':m.dd<=3?'dl-soon':'dl-ok')+'">'+label+'</span></div>';}).join('');}

function fillGanttSel(){var sel=document.getElementById('rm-gantt-part');if(!sel)return;var vP=_vP(),cur=sel.value;sel.innerHTML='<option value="">전체 파트</option>'+vP.map(function(p){return'<option>'+p+'</option>';}).join('');sel.value=cur;}
function renderGantt(){var el=document.getElementById('rm-gantt');if(!el)return;var fp=(document.getElementById('rm-gantt-part')||{}).value||'';var rm=parseInt((document.getElementById('rm-gantt-range')||{}).value||'6');var vP=_vP();if(fp)vP=vP.filter(function(p){return p===fp;});var all=_allE(),dls=_dls(),now=new Date();var sd=new Date(now.getFullYear(),now.getMonth()-1,1),ed=new Date(now.getFullYear(),now.getMonth()+rm,0);var wks=[];var ws=new Date(sd);while(ws<ed){var we=new Date(ws);we.setDate(we.getDate()+6);if(we>ed)we=ed;wks.push({s:new Date(ws),e:new Date(we)});ws.setDate(ws.getDate()+7);}var mos=[];var mc=new Date(sd.getFullYear(),sd.getMonth(),1);while(mc<=ed){mos.push(new Date(mc));mc.setMonth(mc.getMonth()+1);}if(!all.length){el.innerHTML='<div class="empty" style="padding:20px">데이터를 업로드해주세요.</div>';return;}var h='<table><thead><tr><th class="gl">파트 / 제품</th>';mos.forEach(function(m){var ms2=new Date(Math.max(m.getTime(),sd.getTime())),me=new Date(m.getFullYear(),m.getMonth()+1,0);if(me>ed)me=ed;var span=0;wks.forEach(function(w){if(w.s<=me&&w.e>=ms2)span++;});if(span>0)h+='<th colspan="'+span+'" style="background:#f0f4ff;font-size:10px;color:var(--blue)">'+(m.getMonth()+1)+'월</th>';});h+='</tr></thead><tbody>';vP.forEach(function(part,pi){var pe=all.filter(function(e){return e.part===part;});var prods={};pe.forEach(function(e){var b=e.product.replace(/\s*\(.+\)$/,'');if(!prods[b])prods[b]=[];prods[b].push(e);});var pks=Object.keys(prods);if(!pks.length)return;var color=_pc(pi);pks.forEach(function(prod){var ents=prods[prod];var dn=ents.filter(function(e){return e.status==='done'}).length;var pct=ents.length?Math.round(dn/ents.length*100):0;var pdls=dls.filter(function(d){return d.part===part&&d.product.indexOf(prod)===0;});var ea=null,la=null;pdls.forEach(function(d){var dt=new Date(d.date);if(!ea||dt<ea)ea=dt;if(!la||dt>la)la=dt;});ents.forEach(function(e){if(typeof extractDateFromNote==='function'&&e.note){var nd=extractDateFromNote(e.note);if(nd){var ndt=new Date(nd);if(!ea||ndt<ea)ea=ndt;if(!la||ndt>la)la=ndt;}}});if(!ea){ea=new Date(now);ea.setMonth(ea.getMonth()-1);}if(!la){la=new Date(ea);la.setMonth(la.getMonth()+2);}h+='<tr><td class="gl" style="border-left:3px solid '+color+'"><span style="font-size:10px;color:'+color+';font-weight:700">'+part+'</span> '+prod+'</td>';wks.forEach(function(w){h+='<td style="position:relative">';if(ea<=w.e&&la>=w.s){var bs=Math.max(0,Math.round((ea-w.s)/864e5)),be=Math.min(7,Math.round((la-w.s)/864e5)+1);var left=(bs/7*100),width=((be-bs)/7*100);if(width<15)width=15;var bc=pct===100?'#10b981':pct>0?color:'#d1d5db';h+='<div class="rm-gbar" style="left:'+left+'%;width:'+width+'%;background:'+bc+'" title="'+prod+' ('+pct+'%)">'+pct+'%</div>';}if(now>=w.s&&now<=w.e){h+='<div class="rm-today-line" style="left:'+((now-w.s)/(7*864e5)*100)+'%"></div>';}h+='</td>';});h+='</tr>';});});h+='</tbody></table>';el.innerHTML=h;}

var _gp=window.goPage;
window.goPage=function(id,el){_gp(id,el);if(id==='roadmap')setTimeout(renderRoadmap,100);};

var bgImg=document.getElementById('rm-map-bg');
if(bgImg){
  if(bgImg.complete&&bgImg.naturalWidth>0)setTimeout(renderWorldMap,100);
  else bgImg.onload=function(){renderWorldMap();};
  bgImg.onerror=function(){this.style.display='none';document.getElementById('rm-map-outer').style.minHeight='320px';renderWorldMap();};
}

console.log('✅ IBS Roadmap v7 loaded');
})();
