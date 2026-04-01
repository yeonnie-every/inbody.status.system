/*  ============================================================
 *  IBS – 로드맵 v5 (인라인 SVG 세계지도 + 개선된 가시성)
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
.rm-map-outer{position:relative;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);border-radius:10px;overflow:hidden;min-height:380px}
.rm-map-tooltip{position:fixed;background:rgba(15,23,42,.96);color:#fff;padding:12px 18px;border-radius:12px;font-size:11px;pointer-events:none;z-index:999;display:none;box-shadow:0 8px 32px rgba(0,0,0,.5);line-height:1.8;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.12)}
.map-legend{display:flex;gap:16px;padding:10px 16px;flex-wrap:wrap;justify-content:flex-start;align-items:center;background:rgba(0,0,0,.15)}
.map-legend-item{display:flex;align-items:center;gap:5px;font-size:10px;color:rgba(255,255,255,.65);font-weight:500}
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

// 국가 추출
var VALID_COUNTRIES=['한국','일본','미국','중국','유럽','글로벌','독일','프랑스','영국','캐나다','호주','인도','브라질','멕시코','러시아','태국','베트남','인도네시아','말레이시아','싱가포르','대만','홍콩','사우디','UAE','터키','이탈리아','스페인','네덜란드','폴란드','스웨덴','스위스','뉴질랜드','남아프리카','아르헨티나','필리핀','이집트','영어','일본어','중국어','한국어','불어','독일어','스페인어','포르투갈어','이탈리아어','러시아어','아랍어','태국어','베트남어','인도네시아어','영어(미국)','중국어(간체)','중국어(번체)','중국어/대만이(번체)'];
function _exC(p){var m=p.match(/\(([^()]+)\)$/);if(!m)return null;var c=m[1].trim();return VALID_COUNTRIES.indexOf(c)>=0?c:null;}

// 국가별 좌표 (SVG viewBox 0 0 1000 500 기준 — Natural Earth 투영 근사)
var GEO={
  '한국':[793,210],'일본':[843,205],'미국':[175,210],'중국':[700,220],
  '유럽':[520,170],'글로벌':[500,280],'독일':[518,170],'프랑스':[490,195],
  '영국':[475,155],'캐나다':[195,140],'호주':[845,395],'인도':[670,285],
  '브라질':[310,370],'멕시코':[155,280],'러시아':[640,120],'태국':[720,305],
  '베트남':[735,300],'인도네시아':[760,350],'말레이시아':[730,330],
  '싱가포르':[725,340],'대만':[775,260],'홍콩':[755,265],
  '사우디':[585,275],'UAE':[605,275],'터키':[560,210],
  '이탈리아':[515,205],'스페인':[475,210],'네덜란드':[505,160],
  '폴란드':[535,165],'스웨덴':[525,125],'스위스':[510,190],
  '뉴질랜드':[910,430],'남아프리카':[550,410],'아르헨티나':[285,420],
  '필리핀':[790,310],'이집트':[560,265],
  '영어':[175,210],'영어(미국)':[175,210],'일본어':[843,205],
  '중국어':[700,220],'중국어(간체)':[700,220],'중국어(번체)':[775,260],
  '중국어/대만이(번체)':[775,260],
  '한국어':[793,210],'불어':[490,195],'독일어':[518,170],
  '스페인어':[475,210],'포르투갈어':[475,215],'이탈리아어':[515,205],
  '러시아어':[640,120],'아랍어':[585,275],'태국어':[720,305],
  '베트남어':[735,300],'인도네시아어':[760,350]
};

// ── 인라인 SVG 세계지도 (간략화된 대륙 경로) ──
var WORLD_SVG_PATHS = [
  // 북미
  {d:"M50,130 L60,95 L90,80 L130,70 L170,65 L200,70 L230,80 L260,105 L265,130 L260,150 L235,160 L220,180 L225,195 L210,200 L190,210 L175,225 L155,235 L140,260 L130,285 L120,275 L110,265 L105,250 L95,240 L85,250 L75,250 L70,235 L60,220 L50,210 L40,195 L35,170 L40,150 Z", fill:"#2a4a6b"},
  // 중미/카리브
  {d:"M140,260 L150,255 L165,260 L175,270 L180,285 L175,295 L165,300 L155,295 L145,285 L140,275 Z", fill:"#2a4a6b"},
  // 남미
  {d:"M220,300 L240,290 L260,295 L280,310 L310,320 L325,340 L330,365 L325,390 L315,410 L305,425 L295,440 L280,445 L265,435 L255,420 L250,400 L240,380 L225,365 L215,345 L210,325 L215,310 Z", fill:"#2a4a6b"},
  // 유럽
  {d:"M460,80 L470,75 L490,80 L510,85 L530,80 L545,90 L555,110 L560,130 L555,150 L550,170 L540,185 L525,195 L520,210 L510,215 L500,210 L490,200 L480,195 L470,185 L460,175 L455,155 L450,135 L455,110 Z", fill:"#2e5270"},
  // 아프리카
  {d:"M470,230 L490,225 L510,230 L530,235 L550,240 L570,250 L585,270 L590,295 L585,320 L580,345 L570,370 L555,395 L540,410 L525,415 L510,410 L500,395 L490,375 L485,350 L480,325 L475,300 L470,275 L465,250 Z", fill:"#2a4a6b"},
  // 러시아/중앙아시아
  {d:"M555,65 L580,55 L620,50 L660,45 L700,50 L740,55 L780,65 L810,80 L820,95 L815,115 L800,125 L770,130 L740,125 L710,120 L680,115 L650,110 L620,105 L590,100 L570,95 L560,80 Z", fill:"#2e5270"},
  // 중동
  {d:"M560,195 L580,190 L600,195 L615,210 L620,230 L615,250 L605,265 L590,275 L575,270 L565,255 L555,240 L555,220 Z", fill:"#2a4a6b"},
  // 남아시아/인도
  {d:"M630,220 L650,210 L670,215 L690,230 L700,250 L705,275 L695,300 L680,315 L665,310 L650,295 L640,275 L635,255 L630,235 Z", fill:"#2a4a6b"},
  // 동남아시아
  {d:"M700,260 L720,255 L740,260 L755,275 L760,295 L755,310 L745,320 L730,325 L715,315 L705,300 L700,280 Z", fill:"#2e5270"},
  // 동아시아 (중국/한국/일본)
  {d:"M700,120 L720,115 L750,120 L775,130 L800,145 L810,160 L805,180 L795,200 L780,215 L760,225 L740,230 L720,225 L705,215 L695,200 L690,180 L690,160 L695,140 Z", fill:"#2e5270"},
  // 일본 열도
  {d:"M820,155 L828,150 L835,160 L840,175 L845,195 L848,210 L845,225 L838,230 L830,222 L825,205 L822,185 L820,170 Z", fill:"#2e5270"},
  // 인도네시아
  {d:"M720,340 L740,335 L760,340 L780,345 L795,350 L805,358 L795,365 L775,365 L755,362 L738,358 L725,355 L718,348 Z", fill:"#2a4a6b"},
  // 호주
  {d:"M800,370 L830,360 L860,365 L885,375 L900,390 L905,410 L895,430 L875,440 L850,440 L825,435 L805,425 L795,410 L790,390 Z", fill:"#2e5270"},
  // 뉴질랜드
  {d:"M910,415 L918,410 L922,420 L920,435 L915,445 L908,440 L905,430 Z", fill:"#2a4a6b"},
  // 그린란드
  {d:"M310,30 L340,25 L365,30 L380,45 L375,65 L360,75 L340,70 L320,60 L310,45 Z", fill:"#2e5270"},
  // 마다가스카르
  {d:"M595,380 L602,375 L608,385 L610,400 L605,410 L598,405 L595,395 Z", fill:"#2a4a6b"}
];

// ── Page HTML ──
var rp=document.getElementById('page-roadmap');
if(rp){rp.innerHTML=`
<div class="ph"><h1>Roadmap</h1><p>로드맵</p></div>
<div class="rm-grid-2-1">
  <div class="rm-card">
    <div class="rm-card-head">🌏 국가별 진행 현황<select id="rm-map-status" onchange="renderRoadmap()" style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;font-size:11px;font-family:inherit;margin-left:8px"><option value="">전체</option><option value="done">완료</option><option value="inprog">진행중</option><option value="none">미착수</option></select></div>
    <div class="rm-card-body" style="padding:0">
      <div class="rm-map-outer" id="rm-map-outer"></div>
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

// ── World Map (완전 인라인 SVG) ──
function renderWorldMap(){
  var outer=document.getElementById('rm-map-outer');if(!outer)return;
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
    var r=Math.max(12,Math.min(40,(val/maxT)*35+10));
    var color=pct>=80?'#10b981':pct>=40?'#3b82f6':pct>0?'#f59e0b':'#6b7280';
    if(sf==='done')color='#10b981';else if(sf==='inprog')color='#3b82f6';else if(sf==='none')color='#f59e0b';
    bubbles.push({country:country,x:g[0],y:g[1],r:r,color:color,val:val,pct:pct,s:s});
  });

  // Collision avoidance
  for(var iter=0;iter<8;iter++){
    for(var a=0;a<bubbles.length;a++){
      for(var b=a+1;b<bubbles.length;b++){
        var dx=bubbles[b].x-bubbles[a].x,dy=bubbles[b].y-bubbles[a].y;
        var dist=Math.sqrt(dx*dx+dy*dy);
        var minDist=(bubbles[a].r+bubbles[b].r)+8;
        if(dist<minDist&&dist>0){
          var push=(minDist-dist)/2*0.4;
          var nx=dx/dist,ny=dy/dist;
          bubbles[a].x-=nx*push;bubbles[a].y-=ny*push;
          bubbles[b].x+=nx*push;bubbles[b].y+=ny*push;
          bubbles[a].x=Math.max(20,Math.min(980,bubbles[a].x));
          bubbles[a].y=Math.max(20,Math.min(480,bubbles[a].y));
          bubbles[b].x=Math.max(20,Math.min(980,bubbles[b].x));
          bubbles[b].y=Math.max(20,Math.min(480,bubbles[b].y));
        }
      }
    }
  }

  // Build SVG
  var svg='<svg viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">';
  
  // Background
  svg+='<defs>';
  svg+='<radialGradient id="mapGlow" cx="50%" cy="50%" r="60%"><stop offset="0%" stop-color="#1e3a5f" stop-opacity="0.3"/><stop offset="100%" stop-color="#0f172a" stop-opacity="0"/></radialGradient>';
  // Graticule pattern
  svg+='<pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><line x1="50" y1="0" x2="50" y2="50" stroke="rgba(100,150,200,0.06)" stroke-width="0.5"/><line x1="0" y1="50" x2="50" y2="50" stroke="rgba(100,150,200,0.06)" stroke-width="0.5"/></pattern>';
  svg+='</defs>';
  svg+='<rect width="1000" height="500" fill="#0f172a"/>';
  svg+='<rect width="1000" height="500" fill="url(#grid)"/>';
  svg+='<rect width="1000" height="500" fill="url(#mapGlow)"/>';

  // Draw equator and tropics (subtle)
  svg+='<line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(100,150,200,0.08)" stroke-width="0.5" stroke-dasharray="8,4"/>';
  svg+='<line x1="0" y1="180" x2="1000" y2="180" stroke="rgba(100,150,200,0.04)" stroke-width="0.5" stroke-dasharray="4,8"/>';
  svg+='<line x1="0" y1="320" x2="1000" y2="320" stroke="rgba(100,150,200,0.04)" stroke-width="0.5" stroke-dasharray="4,8"/>';

  // Draw continents
  WORLD_SVG_PATHS.forEach(function(p){
    svg+='<path d="'+p.d+'" fill="'+p.fill+'" stroke="rgba(100,180,255,0.15)" stroke-width="0.8" opacity="0.85"/>';
  });

  // Draw bubbles (sorted: larger first for z-order)
  bubbles.sort(function(a,b){return b.r-a.r;});
  bubbles.forEach(function(b){
    // Outer glow
    svg+='<circle cx="'+b.x+'" cy="'+b.y+'" r="'+(b.r+8)+'" fill="'+b.color+'" opacity="0.08"/>';
    svg+='<circle cx="'+b.x+'" cy="'+b.y+'" r="'+(b.r+4)+'" fill="'+b.color+'" opacity="0.15"/>';
    // Main circle
    svg+='<circle cx="'+b.x+'" cy="'+b.y+'" r="'+b.r+'" fill="'+b.color+'" opacity="0.85" stroke="rgba(255,255,255,0.4)" stroke-width="1" style="cursor:pointer" '+
      'onmouseenter="showMapTip(evt,\''+b.country.replace(/'/g,"\\\'")+'\','+b.s.d+','+b.s.t+','+b.pct+','+b.s.i+','+b.s.n+')" onmouseleave="hideMapTip()"/>';
    // Inner highlight
    svg+='<circle cx="'+b.x+'" cy="'+(b.y-b.r*0.2)+'" r="'+(b.r*0.5)+'" fill="rgba(255,255,255,0.12)" style="pointer-events:none"/>';
    // Country name
    var fs=Math.max(9,Math.min(13,b.r*0.42));
    svg+='<text x="'+b.x+'" y="'+(b.y-1)+'" text-anchor="middle" dominant-baseline="central" font-size="'+fs+'" font-weight="800" fill="#fff" style="pointer-events:none;text-shadow:0 1px 3px rgba(0,0,0,.8)" font-family="Noto Sans KR,sans-serif">'+b.country+'</text>';
    // Count
    if(b.r>=16){
      svg+='<text x="'+b.x+'" y="'+(b.y+fs*0.8)+'" text-anchor="middle" font-size="'+(fs*0.7)+'" font-weight="600" fill="rgba(255,255,255,0.6)" style="pointer-events:none" font-family="Noto Sans KR,sans-serif">'+b.val+'건</text>';
    }
  });

  svg+='</svg>';
  outer.innerHTML=svg;

  // Legend
  var lg=document.getElementById('rm-map-legend');
  if(lg)lg.innerHTML='<div class="map-legend-item"><div class="map-legend-dot" style="background:#10b981"></div>80%+</div><div class="map-legend-item"><div class="map-legend-dot" style="background:#3b82f6"></div>40~79%</div><div class="map-legend-item"><div class="map-legend-dot" style="background:#f59e0b"></div>1~39%</div><div class="map-legend-item"><div class="map-legend-dot" style="background:#6b7280"></div>0%</div><div class="map-legend-item" style="margin-left:auto;font-weight:600;color:rgba(255,255,255,.7)">'+keys.length+'개 국가/언어</div>';
}

window.showMapTip=function(evt,c,d,t,p,i,n){var tip=document.getElementById('rm-tooltip');if(!tip)return;tip.innerHTML='<div style="font-weight:800;font-size:14px;margin-bottom:6px">'+c+'</div><div style="display:flex;gap:16px;margin-bottom:4px"><div>완료 <b style="color:#10b981">'+d+'</b>/'+t+'</div><div style="color:#10b981;font-weight:800;font-size:16px">'+p+'%</div></div><div>진행중 <b style="color:#3b82f6">'+i+'</b> · 미착수 <b style="color:#f59e0b">'+n+'</b></div>';tip.style.display='block';tip.style.left=(evt.clientX+16)+'px';tip.style.top=(evt.clientY-14)+'px';};
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

// ── goPage hook ──
var _gp=window.goPage;
window.goPage=function(id,el){_gp(id,el);if(id==='roadmap')setTimeout(renderRoadmap,50);};

// Initial render if already on roadmap
setTimeout(function(){
  var pg=document.getElementById('page-roadmap');
  if(pg&&pg.classList.contains('active'))renderRoadmap();
},200);

console.log('✅ IBS Roadmap v5 loaded');
})();
