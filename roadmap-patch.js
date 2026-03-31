/*  ============================================================
 *  IBS – 로드맵 페이지 패치 v3
 *  ============================================================
 *  - KPI 카드 제거
 *  - 다크 배경 세계 지도 위에 국가별 진행 현황 버블 표시
 *  - 국가별 진행률 순위
 *  - 파트별 진행률 차트 + 마일스톤 + 간트차트
 *  ============================================================ */

(function () {
  'use strict';

  // ── CSS ──
  var css = document.createElement('style');
  css.textContent = `
.rm-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
.rm-grid-2-1{display:grid;grid-template-columns:2.2fr 1fr;gap:16px;margin-bottom:20px}
.rm-card{background:var(--white);border-radius:12px;box-shadow:var(--shadow);overflow:hidden}
.rm-card-head{padding:14px 20px;border-bottom:1px solid var(--border);font-size:13px;font-weight:700;color:var(--text);display:flex;align-items:center;justify-content:space-between}
.rm-card-body{padding:16px 20px}
.rm-map-container{position:relative;background:linear-gradient(135deg,#1a2332 0%,#243447 50%,#1a2332 100%);border-radius:10px;overflow:hidden;padding:10px}
.rm-map-svg-wrap{position:relative;width:100%;overflow:hidden}
.rm-map-svg-wrap svg{display:block;width:100%}
.rm-map-tooltip{position:fixed;background:#1a1f2e;color:#fff;padding:8px 14px;border-radius:8px;font-size:11px;pointer-events:none;z-index:999;display:none;box-shadow:0 4px 16px rgba(0,0,0,.3);line-height:1.6;max-width:200px}
.map-legend{display:flex;gap:14px;padding:10px 0 4px;flex-wrap:wrap;justify-content:center}
.map-legend-item{display:flex;align-items:center;gap:5px;font-size:11px;color:rgba(255,255,255,.7)}
.map-legend-dot{width:10px;height:10px;border-radius:50%}
.country-rank-item{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--border)}
.country-rank-item:last-child{border-bottom:none}
.cr-num{font-size:11px;font-weight:800;color:var(--text2);width:20px;text-align:center}
.cr-name{font-size:12px;font-weight:600;color:var(--text);flex:1}
.cr-bar-wrap{width:80px;background:var(--gray-light);border-radius:99px;height:6px;overflow:hidden}
.cr-bar{height:100%;border-radius:99px}
.cr-pct{font-size:11px;font-weight:700;width:36px;text-align:right}
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

  // ── 헬퍼 ──
  function _vParts(){return typeof getVisibleParts==='function'?getVisibleParts():(typeof PARTS!=='undefined'?PARTS:[]);}
  function _allE(){return typeof allEntries==='function'?allEntries():[];}
  function _dls(){return typeof deadlines!=='undefined'?deadlines:[];}
  function _entries(){return typeof entries!=='undefined'?entries:{};}
  function _dday(ds){return Math.ceil((new Date(ds)-new Date().setHours(0,0,0,0))/864e5);}
  function _partColor(i){var c=['#7c2d3e','#9e3a50','#c4883a','#b8648a','#2563eb','#059669','#d97706','#7c3aed','#dc2626','#8b5a7a'];return c[i%c.length];}
  function _extractCountry(product){
    var m=product.match(/\(([^()]+)\)$/);
    if(!m)return null;
    var c=m[1].trim();
    // 유효한 국가/언어만 허용 (COUNTRY_GEO에 있거나 알려진 국가명)
    if(COUNTRY_GEO[c])return c;
    // 추가 허용 리스트 (좌표가 없어도 국가로 인정)
    var known=['한국','일본','미국','중국','유럽','글로벌','독일','프랑스','영국','캐나다','호주','인도','브라질','멕시코','러시아','태국','베트남','인도네시아','말레이시아','싱가포르','대만','홍콩','사우디','UAE','터키','이탈리아','스페인','네덜란드','폴란드','스웨덴','스위스','뉴질랜드','남아프리카','아르헨티나','필리핀','이집트','영어','일본어','중국어','한국어','불어','독일어','스페인어','포르투갈어','이탈리아어','러시아어','아랍어','태국어','베트남어','인도네시아어'];
    if(known.indexOf(c)>=0)return c;
    // 괄호 안 내용이 국가/언어가 아니면 무시 (예: 국문향, 미국향 등)
    return null;
  }

  // 국가별 좌표 (경도,위도)
  var COUNTRY_GEO={
    '한국':[127,37.5],'일본':[139.7,35.7],'미국':[-98,38],'중국':[104,35],
    '유럽':[10,50],'글로벌':[0,20],'독일':[10.4,51.2],'프랑스':[2.2,46.6],
    '영국':[-1.2,52.4],'캐나다':[-106,56],'호주':[134,-25],'인도':[79,21],
    '브라질':[-51,-14],'멕시코':[-102,23.6],'러시아':[90,62],'태국':[100.5,15.9],
    '베트남':[108.3,14.1],'인도네시아':[113.9,-0.8],'말레이시아':[101.7,4.2],
    '싱가포르':[103.8,1.35],'대만':[120.9,23.7],'홍콩':[114.2,22.3],
    '사우디':[45,24],'UAE':[54,24.5],'터키':[35.2,39],
    '이탈리아':[12.5,41.9],'스페인':[-3.7,40.4],'네덜란드':[5.3,52.1],
    '폴란드':[19.1,51.9],'스웨덴':[18.6,60.1],'스위스':[8.2,46.8],
    '뉴질랜드':[174.9,-40.9],'남아프리카':[25.7,-29],'아르헨티나':[-64,-34.6],
    '필리핀':[121.8,12.9],'이집트':[30.8,26.8],
    '영어':[-98,38],'영어(미국)':[-98,38],'일본어':[139.7,35.7],
    '중국어':[104,35],'중국어(간체)':[104,35],'중국어(번체)':[120.9,23.7],
    '중국어/대만이(번체)':[120.9,23.7],
    '한국어':[127,37.5],'불어':[2.2,46.6],'독일어':[10.4,51.2],
    '스페인어':[-3.7,40.4],'포르투갈어':[-8.2,39.4],'이탈리아어':[12.5,41.9],
    '러시아어':[90,62],'아랍어':[45,24],'태국어':[100.5,15.9],
    '베트남어':[108.3,14.1],'인도네시아어':[113.9,-0.8],
    '유럽계량기':[10,50],'유럽계량기(유럽계량기)':[10,50]
  };

  function geoToSvg(lon,lat,w,h){
    var x=(lon+180)/360*w;
    var latR=Math.max(-80,Math.min(80,lat))*Math.PI/180;
    var mercN=Math.log(Math.tan(Math.PI/4+latR/2));
    var y=h/2-(w*mercN/(2*Math.PI));
    return[Math.max(5,Math.min(w-5,x)),Math.max(5,Math.min(h-5,y))];
  }

  // 세계 대륙 윤곽 (간략화)
  var CONTINENTS=[
    // 북미
    {d:'M50,58 C55,48 70,38 85,35 C100,32 120,35 135,40 C140,42 142,50 140,58 C142,65 148,75 150,85 C152,95 148,100 140,105 C130,108 120,112 110,110 C100,105 95,95 90,85 C85,75 80,68 70,62 C60,58 52,60 50,58Z',fill:'rgba(100,180,130,.12)'},
    // 남미
    {d:'M130,118 C138,114 148,112 155,115 C162,120 165,130 168,145 C170,160 168,175 162,185 C158,190 152,192 148,188 C142,182 138,170 135,155 C133,142 131,130 130,118Z',fill:'rgba(100,180,130,.10)'},
    // 유럽
    {d:'M245,42 C250,38 260,35 270,36 C278,38 285,42 288,48 C290,52 286,58 280,60 C274,62 265,58 258,55 C252,52 248,48 245,42Z',fill:'rgba(100,160,220,.12)'},
    // 아프리카
    {d:'M252,70 C258,66 268,64 278,66 C286,70 292,78 294,90 C296,102 296,115 292,128 C288,136 280,140 272,138 C264,134 258,125 254,114 C250,102 248,88 250,78 C251,74 252,72 252,70Z',fill:'rgba(220,160,80,.10)'},
    // 아시아
    {d:'M288,28 C300,22 320,18 340,20 C358,22 375,28 388,36 C395,42 398,50 396,60 C394,68 388,74 378,76 C368,78 355,74 342,68 C330,62 318,55 308,48 C298,42 292,36 288,28Z',fill:'rgba(100,160,220,.10)'},
    // 동남아
    {d:'M360,80 C368,76 378,75 386,78 C392,82 394,90 390,96 C386,100 378,102 370,100 C364,96 360,88 360,80Z',fill:'rgba(180,130,200,.10)'},
    // 호주
    {d:'M370,135 C380,130 395,130 405,134 C412,138 416,146 414,155 C410,162 402,165 392,163 C382,160 374,152 372,144 C371,140 370,137 370,135Z',fill:'rgba(220,160,80,.10)'},
    // 인도
    {d:'M330,58 C336,54 344,56 348,62 C350,68 348,76 344,80 C340,82 334,80 330,74 C328,68 328,62 330,58Z',fill:'rgba(100,160,220,.08)'},
    // 일본
    {d:'M395,36 C396,32 398,30 400,32 C402,36 402,42 400,46 C398,44 396,40 395,36Z',fill:'rgba(220,100,100,.12)'},
    // 한반도
    {d:'M388,36 C389,33 391,32 392,34 C393,37 392,41 390,42 C389,40 388,38 388,36Z',fill:'rgba(100,160,220,.12)'},
    // 영국/아일랜드
    {d:'M238,40 C240,38 243,38 244,40 C244,43 242,45 240,44 C238,43 238,42 238,40Z',fill:'rgba(100,160,220,.12)'},
    // 인도네시아
    {d:'M362,102 C370,100 382,100 392,102 C398,104 400,108 396,110 C390,112 378,112 368,110 C363,108 361,104 362,102Z',fill:'rgba(180,130,200,.08)'}
  ];

  // ── 페이지 HTML ──
  var roadmapPage=document.getElementById('page-roadmap');
  if(roadmapPage){
    roadmapPage.innerHTML=`
      <div class="ph"><h1>Roadmap</h1><p>파트별 이관 일정 및 진행 현황</p></div>
      <div class="rm-grid-2-1">
        <div class="rm-card">
          <div class="rm-card-head">🌏 국가별 진행 현황
            <select id="rm-map-status" onchange="renderRoadmap()" style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;font-size:11px;font-family:inherit;margin-left:8px">
              <option value="">전체</option><option value="done">완료</option><option value="inprog">진행중</option><option value="none">미착수</option>
            </select>
          </div>
          <div class="rm-card-body" style="padding:0">
            <div class="rm-map-container">
              <div class="rm-map-svg-wrap" id="rm-worldmap"></div>
              <div class="map-legend" id="rm-map-legend"></div>
            </div>
          </div>
        </div>
        <div class="rm-card">
          <div class="rm-card-head">📊 국가별 진행률 순위</div>
          <div class="rm-card-body" style="padding:10px 16px;max-height:420px;overflow-y:auto">
            <div id="rm-country-rank"></div>
          </div>
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
    `;
  }

  var rmBarInst=null;

  window.renderRoadmap=function(){renderWorldMap();renderCountryRank();renderPartBar();renderMilestones();renderGantt();fillGanttPartSel();};

  // ── World Map ──
  function renderWorldMap(){
    var el=document.getElementById('rm-worldmap');if(!el)return;
    var all=_allE(),statusFilter=(document.getElementById('rm-map-status')||{}).value||'';
    var cs={};
    all.forEach(function(e){var c=_extractCountry(e.product);if(!c)return;if(!cs[c])cs[c]={total:0,done:0,inprog:0,none:0};cs[c].total++;if(e.status==='done')cs[c].done++;else if(e.status==='inprog')cs[c].inprog++;else cs[c].none++;});

    var W=460,H=240;
    var svg='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg">';
    // 그리드
    for(var i=0;i<=W;i+=40)svg+='<line x1="'+i+'" y1="0" x2="'+i+'" y2="'+H+'" stroke="rgba(255,255,255,.04)" stroke-width="0.5"/>';
    for(var j=0;j<=H;j+=40)svg+='<line x1="0" y1="'+j+'" x2="'+W+'" y2="'+j+'" stroke="rgba(255,255,255,.04)" stroke-width="0.5"/>';
    // 대륙
    CONTINENTS.forEach(function(c){svg+='<path d="'+c.d+'" fill="'+c.fill+'" stroke="rgba(255,255,255,.1)" stroke-width="0.5"/>';});

    var keys=Object.keys(cs);
    var maxT=Math.max.apply(null,keys.map(function(c){return cs[c].total;}).concat([1]));

    keys.forEach(function(country){
      var geo=COUNTRY_GEO[country];if(!geo)return;
      var s=cs[country],pct=s.total?Math.round(s.done/s.total*100):0;
      var val=statusFilter?(s[statusFilter]||0):s.total;
      if(statusFilter&&val===0)return;
      var pos=geoToSvg(geo[0],geo[1],W,H),x=pos[0],y=pos[1];
      var r=Math.max(6,Math.min(22,(val/maxT)*20+5));
      var color=pct>=80?'#10b981':pct>=40?'#3b82f6':pct>0?'#f59e0b':'#6b7280';
      if(statusFilter==='done')color='#10b981';else if(statusFilter==='inprog')color='#3b82f6';else if(statusFilter==='none')color='#f59e0b';

      // glow
      svg+='<circle cx="'+x+'" cy="'+y+'" r="'+(r+5)+'" fill="'+color+'" opacity="0.12"/>';
      svg+='<circle cx="'+x+'" cy="'+y+'" r="'+(r+2)+'" fill="'+color+'" opacity="0.2"/>';
      // main
      svg+='<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+color+'" opacity="0.85" stroke="rgba(255,255,255,.5)" stroke-width="0.8" style="cursor:pointer" '+
        'onmouseenter="showMapTip(evt,\''+country.replace(/'/g,"\\'")+'\','+s.done+','+s.total+','+pct+','+s.inprog+','+s.none+')" onmouseleave="hideMapTip()"/>';
      // label
      var fs=Math.max(5.5,Math.min(9,r*0.7));
      svg+='<text x="'+x+'" y="'+(y+1.5)+'" text-anchor="middle" font-size="'+fs+'" font-weight="800" fill="#fff" style="pointer-events:none;text-shadow:0 1px 2px rgba(0,0,0,.5)">'+country+'</text>';
      if(r>=10)svg+='<text x="'+x+'" y="'+(y+r+10)+'" text-anchor="middle" font-size="7" font-weight="700" fill="rgba(255,255,255,.5)" style="pointer-events:none">'+val+'건</text>';
    });

    svg+='</svg>';
    el.innerHTML=svg;

    var legend=document.getElementById('rm-map-legend');
    if(legend)legend.innerHTML='<div class="map-legend-item"><div class="map-legend-dot" style="background:#10b981"></div>80%+</div><div class="map-legend-item"><div class="map-legend-dot" style="background:#3b82f6"></div>40~79%</div><div class="map-legend-item"><div class="map-legend-dot" style="background:#f59e0b"></div>1~39%</div><div class="map-legend-item"><div class="map-legend-dot" style="background:#6b7280"></div>0%</div><div class="map-legend-item" style="margin-left:auto;font-weight:600;color:rgba(255,255,255,.8)">'+keys.length+'개 국가/언어</div>';
  }

  window.showMapTip=function(evt,country,done,total,pct,inprog,none){var t=document.getElementById('rm-tooltip');if(!t)return;t.innerHTML='<div style="font-weight:800;font-size:13px;margin-bottom:3px">'+country+'</div><div>완료: <b style="color:#10b981">'+done+'</b>/'+total+' ('+pct+'%)</div><div>진행중: <b style="color:#3b82f6">'+inprog+'</b> · 미착수: <b style="color:#f59e0b">'+none+'</b></div>';t.style.display='block';t.style.left=(evt.clientX+12)+'px';t.style.top=(evt.clientY-10)+'px';};
  window.hideMapTip=function(){var t=document.getElementById('rm-tooltip');if(t)t.style.display='none';};

  // ── Country Rank ──
  function renderCountryRank(){var el=document.getElementById('rm-country-rank');if(!el)return;var all=_allE(),st={};all.forEach(function(e){var c=_extractCountry(e.product);if(!c)return;if(!st[c])st[c]={total:0,done:0};st[c].total++;if(e.status==='done')st[c].done++;});var sorted=Object.keys(st).map(function(c){var s=st[c];return{country:c,total:s.total,done:s.done,pct:Math.round(s.done/s.total*100)};}).sort(function(a,b){return b.pct-a.pct||b.total-a.total;});if(!sorted.length){el.innerHTML='<div class="empty" style="padding:20px">국가별 데이터가 없습니다.</div>';return;}el.innerHTML=sorted.map(function(s,i){var color=s.pct>=80?'#10b981':s.pct>=40?'#3b82f6':s.pct>0?'#f59e0b':'#6b7280';return'<div class="country-rank-item"><span class="cr-num">'+(i+1)+'</span><span class="cr-name">'+s.country+'</span><div class="cr-bar-wrap"><div class="cr-bar" style="width:'+s.pct+'%;background:'+color+'"></div></div><span class="cr-pct" style="color:'+color+'">'+s.pct+'%</span><span style="font-size:10px;color:var(--text2);width:40px;text-align:right">'+s.done+'/'+s.total+'</span></div>';}).join('');}

  // ── Part Bar ──
  function renderPartBar(){var canvas=document.getElementById('rm-part-bar');if(!canvas)return;var ctx=canvas.getContext('2d');if(rmBarInst)rmBarInst.destroy();var vP=_vParts(),all=_allE();var labels=vP.filter(function(p){return all.some(function(e){return e.part===p;});});var d1=labels.map(function(p){return all.filter(function(e){return e.part===p&&e.status==='done'}).length;});var d2=labels.map(function(p){return all.filter(function(e){return e.part===p&&e.status==='inprog'}).length;});var d3=labels.map(function(p){return all.filter(function(e){return e.part===p&&(e.status==='none'||e.status==='na')}).length;});rmBarInst=new Chart(ctx,{type:'bar',data:{labels:labels,datasets:[{label:'완료',data:d1,backgroundColor:'#10b981',borderRadius:4},{label:'진행중',data:d2,backgroundColor:'#3b82f6',borderRadius:4},{label:'미착수',data:d3,backgroundColor:'#e5e7eb',borderRadius:4}]},options:{responsive:true,plugins:{legend:{position:'top',labels:{font:{size:11},usePointStyle:true,pointStyle:'rectRounded'}}},scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,ticks:{stepSize:1},grid:{color:'#f0f0f0'}}}}});}

  // ── Milestones ──
  function renderMilestones(){var el=document.getElementById('rm-milestones');if(!el)return;var dls=_dls(),now=new Date(),ent=_entries(),vP=_vParts();var items=dls.filter(function(d){return vP.indexOf(d.part)>=0;}).map(function(d){var e=ent[d.part+'|'+d.product+'|'+d.type];var isDone=e&&e.status==='done';return{date:d.date,product:d.product.replace(/\s*\(.+\)$/,''),type:d.type,part:d.part,assignee:d.assignee,done:isDone,dd:_dday(d.date),prio:d.prio};}).sort(function(a,b){return new Date(a.date)-new Date(b.date);}).slice(0,10);_allE().forEach(function(e){if(typeof extractDateFromNote==='function'&&e.note){var nd=extractDateFromNote(e.note);if(nd&&!items.some(function(m){return m.product===e.product.replace(/\s*\(.+\)$/,'')&&m.type===e.type;})){items.push({date:nd,product:e.product.replace(/\s*\(.+\)$/,''),type:e.type,part:e.part,assignee:e.owner||'',done:e.status==='done',dd:_dday(nd)});}}});items.sort(function(a,b){return new Date(a.date)-new Date(b.date);});items=items.slice(0,10);if(!items.length){el.innerHTML='<div class="empty" style="padding:20px">마일스톤이 없습니다.</div>';return;}el.innerHTML=items.map(function(m){var color=m.done?'#10b981':m.dd<0?'#ef4444':m.dd<=3?'#f59e0b':'#3b82f6';var label=m.done?'완료':m.dd<0?Math.abs(m.dd)+'일 초과':m.dd===0?'오늘':'D-'+m.dd;var pi=m.prio==='high'?'🔴':m.prio==='mid'?'🟡':'';return'<div class="rm-ms-item"><div class="rm-ms-dot" style="background:'+color+'"></div><div class="rm-ms-info"><div class="rm-ms-title">'+pi+' '+m.product+' › '+m.type+'</div><div class="rm-ms-meta">'+m.part+(m.assignee?' · '+m.assignee:'')+' · '+m.date+'</div></div><span class="dl-chip '+(m.done?'dl-ok':m.dd<0?'dl-over':m.dd<=3?'dl-soon':'dl-ok')+'">'+label+'</span></div>';}).join('');}

  // ── Gantt ──
  function fillGanttPartSel(){var sel=document.getElementById('rm-gantt-part');if(!sel)return;var vP=_vParts(),cur=sel.value;sel.innerHTML='<option value="">전체 파트</option>'+vP.map(function(p){return'<option>'+p+'</option>';}).join('');sel.value=cur;}
  function renderGantt(){var el=document.getElementById('rm-gantt');if(!el)return;var fp=(document.getElementById('rm-gantt-part')||{}).value||'';var rm=parseInt((document.getElementById('rm-gantt-range')||{}).value||'6');var vP=_vParts();if(fp)vP=vP.filter(function(p){return p===fp;});var all=_allE(),dls=_dls(),now=new Date();var sd=new Date(now.getFullYear(),now.getMonth()-1,1),ed=new Date(now.getFullYear(),now.getMonth()+rm,0);var weeks=[];var ws=new Date(sd);while(ws<ed){var we=new Date(ws);we.setDate(we.getDate()+6);if(we>ed)we=ed;weeks.push({s:new Date(ws),e:new Date(we)});ws.setDate(ws.getDate()+7);}var months=[];var mc=new Date(sd.getFullYear(),sd.getMonth(),1);while(mc<=ed){months.push(new Date(mc));mc.setMonth(mc.getMonth()+1);}if(!all.length){el.innerHTML='<div class="empty" style="padding:20px">데이터를 업로드해주세요.</div>';return;}var h='<table><thead><tr><th class="gl">파트 / 제품</th>';months.forEach(function(m){var ms2=new Date(Math.max(m.getTime(),sd.getTime())),me=new Date(m.getFullYear(),m.getMonth()+1,0);if(me>ed)me=ed;var span=0;weeks.forEach(function(w){if(w.s<=me&&w.e>=ms2)span++;});if(span>0)h+='<th colspan="'+span+'" style="background:#f0f4ff;font-size:10px;color:var(--blue)">'+(m.getMonth()+1)+'월</th>';});h+='</tr></thead><tbody>';vP.forEach(function(part,pi){var pe=all.filter(function(e){return e.part===part;});var prods={};pe.forEach(function(e){var b=e.product.replace(/\s*\(.+\)$/,'');if(!prods[b])prods[b]=[];prods[b].push(e);});var pks=Object.keys(prods);if(!pks.length)return;var color=_partColor(pi);pks.forEach(function(prod){var ents=prods[prod];var done=ents.filter(function(e){return e.status==='done'}).length;var pct=ents.length?Math.round(done/ents.length*100):0;var pdls=dls.filter(function(d){return d.part===part&&d.product.indexOf(prod)===0;});var earliest=null,latest=null;pdls.forEach(function(d){var dt=new Date(d.date);if(!earliest||dt<earliest)earliest=dt;if(!latest||dt>latest)latest=dt;});ents.forEach(function(e){if(typeof extractDateFromNote==='function'&&e.note){var nd=extractDateFromNote(e.note);if(nd){var ndt=new Date(nd);if(!earliest||ndt<earliest)earliest=ndt;if(!latest||ndt>latest)latest=ndt;}}});if(!earliest){earliest=new Date(now);earliest.setMonth(earliest.getMonth()-1);}if(!latest){latest=new Date(earliest);latest.setMonth(latest.getMonth()+2);}h+='<tr><td class="gl" style="border-left:3px solid '+color+'"><span style="font-size:10px;color:'+color+';font-weight:700">'+part+'</span> '+prod+'</td>';weeks.forEach(function(w){h+='<td style="position:relative">';if(earliest<=w.e&&latest>=w.s){var bs=Math.max(0,Math.round((earliest-w.s)/86400000)),be=Math.min(7,Math.round((latest-w.s)/86400000)+1);var left=(bs/7*100),width=((be-bs)/7*100);if(width<15)width=15;var bc=pct===100?'#10b981':pct>0?color:'#d1d5db';h+='<div class="rm-gbar" style="left:'+left+'%;width:'+width+'%;background:'+bc+'" title="'+prod+' ('+pct+'%)">'+pct+'%</div>';}if(now>=w.s&&now<=w.e){var tp=((now-w.s)/(7*86400000)*100);h+='<div class="rm-today-line" style="left:'+tp+'%"></div>';}h+='</td>';});h+='</tr>';});});h+='</tbody></table>';el.innerHTML=h;}

  // ── goPage ──
  var _goPageRm=window.goPage;
  window.goPage=function(id,el){_goPageRm(id,el);if(id==='roadmap')renderRoadmap();};

  console.log('✅ IBS Roadmap v3 patch loaded');
})();
