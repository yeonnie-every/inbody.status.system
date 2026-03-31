/*  ============================================================
 *  IBS – 로드맵 v4 (정교한 세계지도 + 깔끔한 버블)
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
.rm-map-outer{position:relative;background:#1b2838;border-radius:10px;overflow:hidden}
.rm-map-img{display:block;width:100%;height:auto;opacity:.35;filter:brightness(1.2)}
.rm-map-overlay{position:absolute;top:0;left:0;width:100%;height:100%}
.rm-map-overlay svg{width:100%;height:100%}
.rm-map-tooltip{position:fixed;background:rgba(20,25,35,.95);color:#fff;padding:10px 16px;border-radius:10px;font-size:11px;pointer-events:none;z-index:999;display:none;box-shadow:0 4px 20px rgba(0,0,0,.4);line-height:1.7;backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,.1)}
.map-legend{display:flex;gap:14px;padding:8px 16px;flex-wrap:wrap;justify-content:center;background:rgba(0,0,0,.2)}
.map-legend-item{display:flex;align-items:center;gap:5px;font-size:10px;color:rgba(255,255,255,.65)}
.map-legend-dot{width:8px;height:8px;border-radius:50%}
.country-rank-item{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)}
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

// 국가 추출 (유효한 국가/언어만)
var VALID_COUNTRIES=['한국','일본','미국','중국','유럽','글로벌','독일','프랑스','영국','캐나다','호주','인도','브라질','멕시코','러시아','태국','베트남','인도네시아','말레이시아','싱가포르','대만','홍콩','사우디','UAE','터키','이탈리아','스페인','네덜란드','폴란드','스웨덴','스위스','뉴질랜드','남아프리카','아르헨티나','필리핀','이집트','영어','일본어','중국어','한국어','불어','독일어','스페인어','포르투갈어','이탈리아어','러시아어','아랍어','태국어','베트남어','인도네시아어','영어(미국)','중국어(간체)','중국어(번체)','중국어/대만이(번체)'];
function _exC(p){var m=p.match(/\(([^()]+)\)$/);if(!m)return null;var c=m[1].trim();return VALID_COUNTRIES.indexOf(c)>=0?c:null;}

// 국가별 좌표: x%,y% (지도 이미지 위 상대 좌표)
var GEO={
  '한국':[77.5,38],'일본':[82,37],'미국':[16,40],'중국':[68,38],
  '유럽':[52,32],'글로벌':[50,50],'독일':[52,33],'프랑스':[49,36],
  '영국':[47,30],'캐나다':[18,28],'호주':[83,72],'인도':[65,48],
  '브라질':[30,65],'멕시코':[14,50],'러시아':[62,22],'태국':[69,52],
  '베트남':[71,52],'인도네시아':[74,60],'말레이시아':[70,57],
  '싱가포르':[70,59],'대만':[76,45],'홍콩':[74,44],
  '사우디':[57,46],'UAE':[59,44],'터키':[55,38],
  '이탈리아':[52,37],'스페인':[47,38],'네덜란드':[50,32],
  '폴란드':[54,32],'스웨덴':[53,26],'스위스':[51,35],
  '뉴질랜드':[90,78],'남아프리카':[54,73],'아르헨티나':[27,76],
  '필리핀':[77,52],'이집트':[55,46],
  '영어':[16,40],'영어(미국)':[16,40],'일본어':[82,37],
  '중국어':[68,38],'중국어(간체)':[68,38],'중국어(번체)':[76,45],
  '중국어/대만이(번체)':[76,45],
  '한국어':[77.5,38],'불어':[49,36],'독일어':[52,33],
  '스페인어':[47,38],'포르투갈어':[46,38],'이탈리아어':[52,37],
  '러시아어':[62,22],'아랍어':[57,46],'태국어':[69,52],
  '베트남어':[71,52],'인도네시아어':[74,60]
};

// 세계지도 이미지 URL (public domain simplified world map)
var MAP_IMG='https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/BlankMap-World-Flattened.svg/1280px-BlankMap-World-Flattened.svg.png';
// Fallback: inline SVG world outline
var MAP_FALLBACK_USED=false;

// ── Page HTML ──
var rp=document.getElementById('page-roadmap');
if(rp){rp.innerHTML=`
<div class="ph"><h1>Roadmap</h1><p>파트별 이관 일정 및 진행 현황</p></div>
<div class="rm-grid-2-1">
  <div class="rm-card">
    <div class="rm-card-head">🌏 국가별 진행 현황<select id="rm-map-status" onchange="renderRoadmap()" style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;font-size:11px;font-family:inherit;margin-left:8px"><option value="">전체</option><option value="done">완료</option><option value="inprog">진행중</option><option value="none">미착수</option></select></div>
    <div class="rm-card-body" style="padding:0">
      <div class="rm-map-outer" id="rm-map-outer">
        <img id="rm-map-bg" class="rm-map-img" src="${MAP_IMG}" alt="World Map" onerror="useMapFallback()">
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

// Fallback if image fails
window.useMapFallback=function(){
  MAP_FALLBACK_USED=true;
  var bg=document.getElementById('rm-map-bg');
  if(bg)bg.style.display='none';
  var outer=document.getElementById('rm-map-outer');
  if(outer)outer.style.minHeight='280px';
  renderWorldMap();
};

var rmBarInst=null;

window.renderRoadmap=function(){renderWorldMap();renderCountryRank();renderPartBar();renderMilestones();renderGantt();fillGanttSel();};

// ── World Map ──
function renderWorldMap(){
  var overlay=document.getElementById('rm-map-overlay');if(!overlay)return;
  var all=_allE(),sf=(document.getElementById('rm-map-status')||{}).value||'';
  var cs={};
  all.forEach(function(e){var c=_exC(e.product);if(!c)return;if(!cs[c])cs[c]={t:0,d:0,i:0,n:0};cs[c].t++;if(e.status==='done')cs[c].d++;else if(e.status==='inprog')cs[c].i++;else cs[c].n++;});

  var keys=Object.keys(cs).filter(function(c){return GEO[c];});
  var maxT=Math.max.apply(null,keys.map(function(c){return cs[c].t;}).concat([1]));

  // Build positioned bubbles
  var bubbles=[];
  keys.forEach(function(country){
    var g=GEO[country];if(!g)return;
    var s=cs[country],pct=s.t?Math.round(s.d/s.t*100):0;
    var val=sf?(s[sf==='done'?'d':sf==='inprog'?'i':'n']||0):s.t;
    if(sf&&val===0)return;
    var r=Math.max(5,Math.min(18,(val/maxT)*16+4));
    var color=pct>=80?'#10b981':pct>=40?'#3b82f6':pct>0?'#f59e0b':'#6b7280';
    if(sf==='done')color='#10b981';else if(sf==='inprog')color='#3b82f6';else if(sf==='none')color='#f59e0b';
    bubbles.push({country:country,x:g[0],y:g[1],r:r,color:color,val:val,pct:pct,s:s});
  });

  // Collision avoidance: push overlapping bubbles apart
  for(var iter=0;iter<5;iter++){
    for(var a=0;a<bubbles.length;a++){
      for(var b=a+1;b<bubbles.length;b++){
        var dx=bubbles[b].x-bubbles[a].x,dy=bubbles[b].y-bubbles[a].y;
        var dist=Math.sqrt(dx*dx+dy*dy);
        var minDist=(bubbles[a].r+bubbles[b].r)*0.12+2.5;
        if(dist<minDist&&dist>0){
          var push=(minDist-dist)/2;
          var nx=dx/dist,ny=dy/dist;
          bubbles[a].x-=nx*push;bubbles[a].y-=ny*push;
          bubbles[b].x+=nx*push;bubbles[b].y+=ny*push;
          // Keep in bounds
          bubbles[a].x=Math.max(2,Math.min(98,bubbles[a].x));
          bubbles[a].y=Math.max(2,Math.min(98,bubbles[a].y));
          bubbles[b].x=Math.max(2,Math.min(98,bubbles[b].x));
          bubbles[b].y=Math.max(2,Math.min(98,bubbles[b].y));
        }
      }
    }
  }

  // SVG overlay
  var svg='<svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">';

  // If fallback, draw simple land shapes
  if(MAP_FALLBACK_USED){
    svg+='<rect width="100" height="100" fill="#1b2838"/>';
    // Simplified continents at % coords
    var lands=[
      'M5,30 C8,25 14,22 20,20 C26,22 28,28 26,34 C28,38 30,44 32,50 C30,54 26,56 22,54 C18,50 14,44 10,40 C7,36 5,33 5,30Z',
      'M26,58 C28,56 32,55 34,58 C36,62 37,70 36,78 C34,82 30,82 28,78 C26,72 25,64 26,58Z',
      'M44,28 C46,26 50,25 54,26 C56,28 56,32 54,34 C52,36 48,36 46,34 C44,32 44,30 44,28Z',
      'M48,38 C50,36 54,35 58,38 C60,44 62,52 60,62 C58,68 54,70 50,68 C48,62 46,52 46,44 C47,40 48,38 48,38Z',
      'M56,18 C62,14 70,14 78,18 C84,24 86,32 84,40 C80,44 74,44 68,42 C62,38 58,32 56,26 Z',
      'M64,46 C66,42 70,44 72,48 C72,54 70,58 68,56 C66,52 64,48 64,46Z',
      'M68,52 C72,50 76,52 78,56 C78,60 76,62 72,60 C70,58 68,54 68,52Z',
      'M78,64 C82,62 86,64 88,68 C88,74 86,78 82,78 C78,76 76,70 78,64Z',
      'M84,26 C86,24 88,26 88,30 C87,34 85,32 84,28Z',
      'M82,26 C83,24 84,26 84,30 C83,30 82,28 82,26Z'
    ];
    lands.forEach(function(d){svg+='<path d="'+d+'" fill="rgba(100,160,200,.15)" stroke="rgba(100,160,200,.1)" stroke-width="0.3"/>';});
  }

  // Draw bubbles (sorted: larger ones first)
  bubbles.sort(function(a,b){return b.r-a.r;});
  bubbles.forEach(function(b){
    // Glow
    svg+='<circle cx="'+b.x+'" cy="'+b.y+'" r="'+(b.r*0.15+1.5)+'" fill="'+b.color+'" opacity="0.15"/>';
    svg+='<circle cx="'+b.x+'" cy="'+b.y+'" r="'+(b.r*0.12+0.8)+'" fill="'+b.color+'" opacity="0.25"/>';
    // Main bubble
    svg+='<circle cx="'+b.x+'" cy="'+b.y+'" r="'+(b.r*0.1+0.4)+'" fill="'+b.color+'" opacity="0.9" stroke="rgba(255,255,255,.5)" stroke-width="0.15" style="cursor:pointer" '+
      'onmouseenter="showMapTip(evt,\''+b.country.replace(/'/g,"\\'")+'\','+b.s.d+','+b.s.t+','+b.pct+','+b.s.i+','+b.s.n+')" onmouseleave="hideMapTip()"/>';
    // Label (only for bigger bubbles)
    if(b.r>=7){
      var fs=Math.max(1,Math.min(2,b.r*0.13));
      svg+='<text x="'+b.x+'" y="'+(b.y+0.3)+'" text-anchor="middle" font-size="'+fs+'" font-weight="800" fill="#fff" style="pointer-events:none;text-shadow:0 0 2px rgba(0,0,0,.8)">'+b.country+'</text>';
    }
    // Count label below
    if(b.r>=10){
      svg+='<text x="'+b.x+'" y="'+(b.y+b.r*0.12+2.2)+'" text-anchor="middle" font-size="1.2" font-weight="700" fill="rgba(255,255,255,.45)" style="pointer-events:none">'+b.val+'건</text>';
    }
  });

  svg+='</svg>';
  overlay.innerHTML=svg;

  // Legend
  var lg=document.getElementById('rm-map-legend');
  if(lg)lg.innerHTML='<div class="map-legend-item"><div class="map-legend-dot" style="background:#10b981"></div>80%+</div><div class="map-legend-item"><div class="map-legend-dot" style="background:#3b82f6"></div>40~79%</div><div class="map-legend-item"><div class="map-legend-dot" style="background:#f59e0b"></div>1~39%</div><div class="map-legend-item"><div class="map-legend-dot" style="background:#6b7280"></div>0%</div><div class="map-legend-item" style="margin-left:auto;font-weight:600;color:rgba(255,255,255,.7)">'+keys.length+'개 국가/언어</div>';
}

window.showMapTip=function(evt,c,d,t,p,i,n){var tip=document.getElementById('rm-tooltip');if(!tip)return;tip.innerHTML='<div style="font-weight:800;font-size:13px;margin-bottom:4px">'+c+'</div><div style="display:flex;gap:12px"><div>완료 <b style="color:#10b981">'+d+'</b>/'+t+'</div><div style="color:#10b981;font-weight:800">'+p+'%</div></div><div style="margin-top:2px">진행중 <b style="color:#3b82f6">'+i+'</b> · 미착수 <b style="color:#f59e0b">'+n+'</b></div>';tip.style.display='block';tip.style.left=(evt.clientX+14)+'px';tip.style.top=(evt.clientY-12)+'px';};
window.hideMapTip=function(){var t=document.getElementById('rm-tooltip');if(t)t.style.display='none';};

// ── Country Rank ──
function renderCountryRank(){var el=document.getElementById('rm-country-rank');if(!el)return;var all=_allE(),st={};all.forEach(function(e){var c=_exC(e.product);if(!c)return;if(!st[c])st[c]={t:0,d:0};st[c].t++;if(e.status==='done')st[c].d++;});var sorted=Object.keys(st).map(function(c){var s=st[c];return{c:c,t:s.t,d:s.d,p:Math.round(s.d/s.t*100)};}).sort(function(a,b){return b.p-a.p||b.t-a.t;});if(!sorted.length){el.innerHTML='<div class="empty" style="padding:20px">국가별 데이터가 없습니다.</div>';return;}el.innerHTML=sorted.map(function(s,i){var color=s.p>=80?'#10b981':s.p>=40?'#3b82f6':s.p>0?'#f59e0b':'#6b7280';return'<div class="country-rank-item"><span class="cr-num">'+(i+1)+'</span><span class="cr-name">'+s.c+'</span><div class="cr-bar-wrap"><div class="cr-bar" style="width:'+s.p+'%;background:'+color+'"></div></div><span class="cr-pct" style="color:'+color+'">'+s.p+'%</span><span style="font-size:10px;color:var(--text2);width:38px;text-align:right">'+s.d+'/'+s.t+'</span></div>';}).join('');}

// ── Part Bar ──
function renderPartBar(){var cv=document.getElementById('rm-part-bar');if(!cv)return;var ctx=cv.getContext('2d');if(rmBarInst)rmBarInst.destroy();var vP=_vP(),all=_allE();var lb=vP.filter(function(p){return all.some(function(e){return e.part===p;});});var d1=lb.map(function(p){return all.filter(function(e){return e.part===p&&e.status==='done'}).length;});var d2=lb.map(function(p){return all.filter(function(e){return e.part===p&&e.status==='inprog'}).length;});var d3=lb.map(function(p){return all.filter(function(e){return e.part===p&&(e.status==='none'||e.status==='na')}).length;});rmBarInst=new Chart(ctx,{type:'bar',data:{labels:lb,datasets:[{label:'완료',data:d1,backgroundColor:'#10b981',borderRadius:4},{label:'진행중',data:d2,backgroundColor:'#3b82f6',borderRadius:4},{label:'미착수',data:d3,backgroundColor:'#e5e7eb',borderRadius:4}]},options:{responsive:true,plugins:{legend:{position:'top',labels:{font:{size:11},usePointStyle:true,pointStyle:'rectRounded'}}},scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,ticks:{stepSize:1},grid:{color:'#f0f0f0'}}}}});}

// ── Milestones ──
function renderMilestones(){var el=document.getElementById('rm-milestones');if(!el)return;var dls=_dls(),now=new Date(),ent=_ent(),vP=_vP();var items=dls.filter(function(d){return vP.indexOf(d.part)>=0;}).map(function(d){var e=ent[d.part+'|'+d.product+'|'+d.type];return{date:d.date,product:d.product.replace(/\s*\(.+\)$/,''),type:d.type,part:d.part,assignee:d.assignee,done:e&&e.status==='done',dd:_dd(d.date),prio:d.prio};}).sort(function(a,b){return new Date(a.date)-new Date(b.date);}).slice(0,10);_allE().forEach(function(e){if(typeof extractDateFromNote==='function'&&e.note){var nd=extractDateFromNote(e.note);if(nd&&!items.some(function(m){return m.product===e.product.replace(/\s*\(.+\)$/,'')&&m.type===e.type;})){items.push({date:nd,product:e.product.replace(/\s*\(.+\)$/,''),type:e.type,part:e.part,assignee:e.owner||'',done:e.status==='done',dd:_dd(nd)});}}});items.sort(function(a,b){return new Date(a.date)-new Date(b.date);});items=items.slice(0,10);if(!items.length){el.innerHTML='<div class="empty" style="padding:20px">마일스톤이 없습니다.</div>';return;}el.innerHTML=items.map(function(m){var color=m.done?'#10b981':m.dd<0?'#ef4444':m.dd<=3?'#f59e0b':'#3b82f6';var label=m.done?'완료':m.dd<0?Math.abs(m.dd)+'일 초과':m.dd===0?'오늘':'D-'+m.dd;return'<div class="rm-ms-item"><div class="rm-ms-dot" style="background:'+color+'"></div><div class="rm-ms-info"><div class="rm-ms-title">'+(m.prio==='high'?'🔴 ':m.prio==='mid'?'🟡 ':'')+m.product+' › '+m.type+'</div><div class="rm-ms-meta">'+m.part+(m.assignee?' · '+m.assignee:'')+' · '+m.date+'</div></div><span class="dl-chip '+(m.done?'dl-ok':m.dd<0?'dl-over':m.dd<=3?'dl-soon':'dl-ok')+'">'+label+'</span></div>';}).join('');}

// ── Gantt ──
function fillGanttSel(){var sel=document.getElementById('rm-gantt-part');if(!sel)return;var vP=_vP(),cur=sel.value;sel.innerHTML='<option value="">전체 파트</option>'+vP.map(function(p){return'<option>'+p+'</option>';}).join('');sel.value=cur;}
function renderGantt(){var el=document.getElementById('rm-gantt');if(!el)return;var fp=(document.getElementById('rm-gantt-part')||{}).value||'';var rm=parseInt((document.getElementById('rm-gantt-range')||{}).value||'6');var vP=_vP();if(fp)vP=vP.filter(function(p){return p===fp;});var all=_allE(),dls=_dls(),now=new Date();var sd=new Date(now.getFullYear(),now.getMonth()-1,1),ed=new Date(now.getFullYear(),now.getMonth()+rm,0);var wks=[];var ws=new Date(sd);while(ws<ed){var we=new Date(ws);we.setDate(we.getDate()+6);if(we>ed)we=ed;wks.push({s:new Date(ws),e:new Date(we)});ws.setDate(ws.getDate()+7);}var mos=[];var mc=new Date(sd.getFullYear(),sd.getMonth(),1);while(mc<=ed){mos.push(new Date(mc));mc.setMonth(mc.getMonth()+1);}if(!all.length){el.innerHTML='<div class="empty" style="padding:20px">데이터를 업로드해주세요.</div>';return;}var h='<table><thead><tr><th class="gl">파트 / 제품</th>';mos.forEach(function(m){var ms2=new Date(Math.max(m.getTime(),sd.getTime())),me=new Date(m.getFullYear(),m.getMonth()+1,0);if(me>ed)me=ed;var span=0;wks.forEach(function(w){if(w.s<=me&&w.e>=ms2)span++;});if(span>0)h+='<th colspan="'+span+'" style="background:#f0f4ff;font-size:10px;color:var(--blue)">'+(m.getMonth()+1)+'월</th>';});h+='</tr></thead><tbody>';vP.forEach(function(part,pi){var pe=all.filter(function(e){return e.part===part;});var prods={};pe.forEach(function(e){var b=e.product.replace(/\s*\(.+\)$/,'');if(!prods[b])prods[b]=[];prods[b].push(e);});var pks=Object.keys(prods);if(!pks.length)return;var color=_pc(pi);pks.forEach(function(prod){var ents=prods[prod];var dn=ents.filter(function(e){return e.status==='done'}).length;var pct=ents.length?Math.round(dn/ents.length*100):0;var pdls=dls.filter(function(d){return d.part===part&&d.product.indexOf(prod)===0;});var ea=null,la=null;pdls.forEach(function(d){var dt=new Date(d.date);if(!ea||dt<ea)ea=dt;if(!la||dt>la)la=dt;});ents.forEach(function(e){if(typeof extractDateFromNote==='function'&&e.note){var nd=extractDateFromNote(e.note);if(nd){var ndt=new Date(nd);if(!ea||ndt<ea)ea=ndt;if(!la||ndt>la)la=ndt;}}});if(!ea){ea=new Date(now);ea.setMonth(ea.getMonth()-1);}if(!la){la=new Date(ea);la.setMonth(la.getMonth()+2);}h+='<tr><td class="gl" style="border-left:3px solid '+color+'"><span style="font-size:10px;color:'+color+';font-weight:700">'+part+'</span> '+prod+'</td>';wks.forEach(function(w){h+='<td style="position:relative">';if(ea<=w.e&&la>=w.s){var bs=Math.max(0,Math.round((ea-w.s)/864e5)),be=Math.min(7,Math.round((la-w.s)/864e5)+1);var left=(bs/7*100),width=((be-bs)/7*100);if(width<15)width=15;var bc=pct===100?'#10b981':pct>0?color:'#d1d5db';h+='<div class="rm-gbar" style="left:'+left+'%;width:'+width+'%;background:'+bc+'" title="'+prod+' ('+pct+'%)">'+pct+'%</div>';}if(now>=w.s&&now<=w.e){h+='<div class="rm-today-line" style="left:'+((now-w.s)/(7*864e5)*100)+'%"></div>';}h+='</td>';});h+='</tr>';});});h+='</tbody></table>';el.innerHTML=h;}

// ── goPage ──
var _gp=window.goPage;
window.goPage=function(id,el){_gp(id,el);if(id==='roadmap')renderRoadmap();};

// 이미지 로드 완료 후 렌더
var bgImg=document.getElementById('rm-map-bg');
if(bgImg){
  if(bgImg.complete)setTimeout(renderWorldMap,100);
  else bgImg.onload=function(){renderWorldMap();};
}

console.log('✅ IBS Roadmap v4 loaded');
})();
