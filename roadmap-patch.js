/*  ============================================================
 *  IBS – 로드맵 페이지 패치 v2 (대시보드 스타일)
 *  ============================================================
 *  사용법:
 *    index.html 의 </body> 바로 위에 추가:
 *    <script src="roadmap-patch.js"></script>
 *  ============================================================ */

(function () {
  'use strict';

  // ── CSS ──
  var css = document.createElement('style');
  css.textContent = `
.rm-kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
.rm-kpi{background:var(--white);border-radius:12px;padding:18px 20px;box-shadow:var(--shadow);position:relative;overflow:hidden}
.rm-kpi::after{content:'';position:absolute;top:0;right:0;width:60px;height:60px;border-radius:0 0 0 60px;opacity:.08}
.rm-kpi .kpi-label{font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
.rm-kpi .kpi-value{font-size:28px;font-weight:900;line-height:1}
.rm-kpi .kpi-sub{font-size:11px;color:var(--text2);margin-top:6px}
.rm-kpi .kpi-gauge{width:64px;height:64px;position:absolute;right:16px;top:50%;transform:translateY(-50%)}

.rm-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
.rm-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:20px}
.rm-grid-2-1{display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:20px}
.rm-card{background:var(--white);border-radius:12px;box-shadow:var(--shadow);overflow:hidden}
.rm-card-head{padding:14px 20px;border-bottom:1px solid var(--border);font-size:13px;font-weight:700;color:var(--text);display:flex;align-items:center;justify-content:space-between}
.rm-card-body{padding:16px 20px}

/* World Map */
.map-wrap{position:relative;width:100%;padding-bottom:50%;overflow:hidden}
.map-wrap svg{position:absolute;top:0;left:0;width:100%;height:100%}
.map-country{fill:#e8ecf0;stroke:#fff;stroke-width:.5;transition:all .2s;cursor:pointer}
.map-country:hover{opacity:.8}
.map-country.active{stroke:#1a1f2e;stroke-width:1}
.map-legend{display:flex;gap:12px;padding:10px 0;flex-wrap:wrap}
.map-legend-item{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text2)}
.map-legend-dot{width:10px;height:10px;border-radius:3px}
.map-tooltip{position:absolute;background:#1a1f2e;color:#fff;padding:6px 12px;border-radius:8px;font-size:11px;pointer-events:none;z-index:10;white-space:nowrap;display:none;box-shadow:var(--shadow-md)}

/* Gantt compact */
.rm-gantt-compact{overflow-x:auto;max-height:300px;overflow-y:auto}
.rm-gantt-compact table{border-collapse:collapse;width:100%;min-width:700px}
.rm-gantt-compact th{background:#f8fafc;color:var(--text2);font-size:9px;font-weight:700;padding:6px 3px;border:1px solid var(--border);text-align:center;position:sticky;top:0;z-index:2}
.rm-gantt-compact th.gl{text-align:left;padding-left:10px;min-width:120px;position:sticky;left:0;background:#f8fafc;z-index:3}
.rm-gantt-compact td{border:1px solid var(--border);padding:0;height:26px;position:relative}
.rm-gantt-compact td.gl{text-align:left;padding:4px 10px;font-size:11px;font-weight:600;background:#fafbfc;position:sticky;left:0;z-index:1;white-space:nowrap}
.rm-gbar{position:absolute;top:5px;height:16px;border-radius:4px;min-width:6px;font-size:8px;font-weight:700;color:#fff;display:flex;align-items:center;padding:0 3px;overflow:hidden;cursor:pointer}
.rm-gbar:hover{opacity:.8}
.rm-today-line{position:absolute;top:0;bottom:0;width:2px;background:var(--red);z-index:5;pointer-events:none}

/* Milestone compact */
.rm-ms-list{max-height:300px;overflow-y:auto}
.rm-ms-item{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border)}
.rm-ms-item:last-child{border-bottom:none}
.rm-ms-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.rm-ms-info{flex:1;min-width:0}
.rm-ms-title{font-size:12px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rm-ms-meta{font-size:10px;color:var(--text2);margin-top:1px}

/* Country rank */
.country-rank-item{display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)}
.country-rank-item:last-child{border-bottom:none}
.cr-num{font-size:11px;font-weight:800;color:var(--text2);width:20px;text-align:center}
.cr-name{font-size:12px;font-weight:600;color:var(--text);flex:1}
.cr-bar-wrap{width:80px;background:var(--gray-light);border-radius:99px;height:6px;overflow:hidden}
.cr-bar{height:100%;border-radius:99px}
.cr-pct{font-size:11px;font-weight:700;width:36px;text-align:right}

@media(max-width:900px){
  .rm-kpi-row{grid-template-columns:1fr 1fr}
  .rm-grid-2,.rm-grid-3,.rm-grid-2-1{grid-template-columns:1fr}
}
  `;
  document.head.appendChild(css);

  // ── 헬퍼 ──
  function _vParts(){return typeof getVisibleParts==='function'?getVisibleParts():(typeof PARTS!=='undefined'?PARTS:[]);}
  function _allE(){return typeof allEntries==='function'?allEntries():[];}
  function _dls(){return typeof deadlines!=='undefined'?deadlines:[];}
  function _entries(){return typeof entries!=='undefined'?entries:{};}
  function _dday(ds){return Math.ceil((new Date(ds)-new Date().setHours(0,0,0,0))/864e5);}
  function _partColor(i){var c=['#7c2d3e','#9e3a50','#c4883a','#b8648a','#2563eb','#059669','#d97706','#7c3aed','#dc2626','#8b5a7a'];return c[i%c.length];}

  // 국가 추출
  function _extractCountry(product){var m=product.match(/\((.+?)\)$/);return m?m[1]:null;}

  // 국가 코드 매핑
  var COUNTRY_MAP={
    '한국':'KR','일본':'JP','미국':'US','중국':'CN','유럽':'EU',
    '글로벌':'GL','독일':'DE','프랑스':'FR','영국':'GB','캐나다':'CA',
    '호주':'AU','인도':'IN','브라질':'BR','멕시코':'MX','러시아':'RU',
    '태국':'TH','베트남':'VN','인도네시아':'ID','말레이시아':'MY',
    '싱가포르':'SG','대만':'TW','홍콩':'HK','사우디':'SA','UAE':'AE',
    '터키':'TR','이탈리아':'IT','스페인':'ES','네덜란드':'NL','폴란드':'PL'
  };

  var COUNTRY_COORDS={
    'KR':[127,37.5],'JP':[139.7,35.7],'US':[-98,38],'CN':[104,35],
    'EU':[10,50],'GL':[0,20],'DE':[10.4,51.2],'FR':[2.2,46.6],
    'GB':[-1.2,52.4],'CA':[-106,56],'AU':[134,-25],'IN':[79,21],
    'BR':[-51,-14],'MX':[-102,23.6],'RU':[105,62],'TH':[100.5,15.9],
    'VN':[108.3,14.1],'ID':[113.9,-0.8],'MY':[101.7,4.2],'SG':[103.8,1.35],
    'TW':[120.9,23.7],'HK':[114.2,22.3],'SA':[45,24],'AE':[54,24.5],
    'TR':[35.2,39],'IT':[12.5,41.9],'ES':[-3.7,40.4],'NL':[5.3,52.1],'PL':[19.1,51.9]
  };

  // ── 페이지 HTML ──
  var roadmapPage=document.getElementById('page-roadmap');
  if(roadmapPage){
    roadmapPage.innerHTML=`
      <div class="ph"><h1>Roadmap</h1><p>파트별 이관 일정 및 진행 현황</p></div>

      <!-- KPI Cards -->
      <div class="rm-kpi-row" id="rm-kpis"></div>

      <!-- Map + Country Rank -->
      <div class="rm-grid-2-1" id="rm-map-section">
        <div class="rm-card">
          <div class="rm-card-head">🌏 국가별 진행 현황<select id="rm-map-status" onchange="renderRoadmap()" style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;font-size:11px;font-family:inherit;margin-left:8px"><option value="">전체</option><option value="done">완료</option><option value="inprog">진행중</option><option value="none">미착수</option></select></div>
          <div class="rm-card-body" style="padding:10px 16px">
            <div id="rm-worldmap" style="position:relative"></div>
            <div class="map-legend" id="rm-map-legend"></div>
          </div>
        </div>
        <div class="rm-card">
          <div class="rm-card-head">📊 국가별 진행률 순위</div>
          <div class="rm-card-body" style="padding:10px 16px;max-height:340px;overflow-y:auto">
            <div id="rm-country-rank"></div>
          </div>
        </div>
      </div>

      <!-- Part Progress + Donut -->
      <div class="rm-grid-2">
        <div class="rm-card">
          <div class="rm-card-head">📈 파트별 진행률</div>
          <div class="rm-card-body"><canvas id="rm-part-bar" height="180"></canvas></div>
        </div>
        <div class="rm-card">
          <div class="rm-card-head">🚩 다가오는 마일스톤</div>
          <div class="rm-card-body" style="padding:10px 16px">
            <div class="rm-ms-list" id="rm-milestones"></div>
          </div>
        </div>
      </div>

      <!-- Gantt -->
      <div class="rm-card">
        <div class="rm-card-head">📊 간트차트 타임라인
          <div style="display:flex;gap:6px;align-items:center">
            <select id="rm-gantt-part" onchange="renderRoadmap()" style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;font-size:11px;font-family:inherit"><option value="">전체 파트</option></select>
            <select id="rm-gantt-range" onchange="renderRoadmap()" style="padding:4px 10px;border:1px solid var(--border);border-radius:6px;font-size:11px;font-family:inherit"><option value="3">3개월</option><option value="6" selected>6개월</option><option value="12">12개월</option></select>
          </div>
        </div>
        <div class="rm-card-body" style="padding:10px 12px">
          <div class="rm-gantt-compact" id="rm-gantt"></div>
        </div>
      </div>
    `;
  }

  // ── 차트 인스턴스 ──
  var rmBarInst=null;

  // ── 메인 렌더 ──
  window.renderRoadmap=function(){
    renderKPIs();
    renderWorldMap();
    renderCountryRank();
    renderPartBar();
    renderMilestones();
    renderGantt();
    fillGanttPartSel();
  };

  // ── KPI Cards ──
  function renderKPIs(){
    var el=document.getElementById('rm-kpis');if(!el)return;
    var all=_allE(),dls=_dls(),now=new Date();
    var total=all.length,done=all.filter(function(e){return e.status==='done'}).length;
    var pct=total?Math.round(done/total*100):0;

    // 기한 초과
    var overdue=dls.filter(function(d){
      var e=_entries()[d.part+'|'+d.product+'|'+d.type];
      return!(e&&e.status==='done')&&new Date(d.date)<now;
    }).length;

    // 이번 달 완료
    var thisMonth=all.filter(function(e){
      if(e.status!=='done'||!e.updatedAt)return false;
      var d=new Date(e.updatedAt);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
    }).length;

    // 다음 마감일
    var nextDl=dls.filter(function(d){
      var e=_entries()[d.part+'|'+d.product+'|'+d.type];
      return!(e&&e.status==='done')&&new Date(d.date)>=now;
    }).sort(function(a,b){return new Date(a.date)-new Date(b.date)})[0];
    var nextDday=nextDl?_dday(nextDl.date):null;

    // 게이지 SVG
    function gauge(pct,color){
      var r=26,c=2*Math.PI*r,offset=c-(pct/100*c);
      return '<svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="'+r+'" fill="none" stroke="#e8ecf0" stroke-width="6"/><circle cx="32" cy="32" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="6" stroke-dasharray="'+c+'" stroke-dashoffset="'+offset+'" stroke-linecap="round" transform="rotate(-90 32 32)"/><text x="32" y="36" text-anchor="middle" font-size="13" font-weight="800" fill="'+color+'">'+pct+'%</text></svg>';
    }

    el.innerHTML=
      '<div class="rm-kpi" style="border-top:3px solid var(--burg2)">'+
        '<div class="kpi-label">전체 진행률</div>'+
        '<div class="kpi-value" style="color:var(--burg2)">'+pct+'<span style="font-size:14px">%</span></div>'+
        '<div class="kpi-sub">'+done+' / '+total+' 완료</div>'+
        '<div class="kpi-gauge">'+gauge(pct,'#7c2d3e')+'</div>'+
      '</div>'+
      '<div class="rm-kpi" style="border-top:3px solid '+(overdue>0?'var(--red)':'var(--green)')+'">'+
        '<div class="kpi-label">기한 초과</div>'+
        '<div class="kpi-value" style="color:'+(overdue>0?'var(--red)':'var(--green)')+'">'+overdue+'<span style="font-size:14px">건</span></div>'+
        '<div class="kpi-sub">'+(overdue>0?'⚠️ 즉시 확인 필요':'✅ 모든 기한 준수 중')+'</div>'+
      '</div>'+
      '<div class="rm-kpi" style="border-top:3px solid var(--blue)">'+
        '<div class="kpi-label">이번 달 완료</div>'+
        '<div class="kpi-value" style="color:var(--blue)">'+thisMonth+'<span style="font-size:14px">건</span></div>'+
        '<div class="kpi-sub">'+(now.getMonth()+1)+'월 완료 항목</div>'+
      '</div>'+
      '<div class="rm-kpi" style="border-top:3px solid '+(nextDday!==null&&nextDday<=3?'var(--orange)':'var(--green)')+'">'+
        '<div class="kpi-label">다음 마감일</div>'+
        '<div class="kpi-value" style="color:'+(nextDday!==null&&nextDday<=3?'var(--orange)':'var(--green)')+'">'+
          (nextDday!==null?'D-'+nextDday:'—')+
        '</div>'+
        '<div class="kpi-sub">'+(nextDl?nextDl.product.replace(/\s*\(.+\)$/,''):'예정된 마감일 없음')+'</div>'+
      '</div>';
  }

  // ── World Map ──
  function renderWorldMap(){
    var el=document.getElementById('rm-worldmap');if(!el)return;
    var all=_allE();
    var statusFilter=(document.getElementById('rm-map-status')||{}).value||'';

    // 국가별 집계
    var countryStats={};
    all.forEach(function(e){
      var c=_extractCountry(e.product);if(!c)return;
      if(!countryStats[c])countryStats[c]={total:0,done:0,inprog:0,none:0};
      countryStats[c].total++;
      if(e.status==='done')countryStats[c].done++;
      else if(e.status==='inprog')countryStats[c].inprog++;
      else countryStats[c].none++;
    });

    // SVG 세계 지도 (간략 버전 - 점 기반)
    var w=600,h=300;
    var svg='<svg viewBox="0 0 '+w+' '+h+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#f8fafc;border-radius:8px">';

    // 배경 그리드
    for(var gi=0;gi<w;gi+=50){svg+='<line x1="'+gi+'" y1="0" x2="'+gi+'" y2="'+h+'" stroke="#e8ecf0" stroke-width="0.5"/>';}
    for(var gj=0;gj<h;gj+=50){svg+='<line x1="0" y1="'+gj+'" x2="'+w+'" y2="'+gj+'" stroke="#e8ecf0" stroke-width="0.5"/>';}

    // 국가별 버블
    Object.keys(countryStats).forEach(function(country){
      var code=COUNTRY_MAP[country];
      var coords=code?COUNTRY_COORDS[code]:null;
      if(!coords)return;

      var s=countryStats[country];
      var pct=s.total?Math.round(s.done/s.total*100):0;
      var displayVal=statusFilter?s[statusFilter]||0:s.total;
      var size=Math.max(12,Math.min(32,displayVal*3+10));

      // 경도/위도 → SVG 좌표 (간단 Mercator)
      var x=((coords[0]+180)/360)*w;
      var y=((90-coords[1])/180)*h;

      var color=pct>=80?'#2e7d6e':pct>=40?'#2d6be4':pct>0?'#c97a2a':'#d1d5db';
      if(statusFilter==='done')color='#2e7d6e';
      else if(statusFilter==='inprog')color='#2d6be4';
      else if(statusFilter==='none')color='#c97a2a';

      svg+='<circle cx="'+x+'" cy="'+y+'" r="'+size/2+'" fill="'+color+'" opacity="0.7" stroke="#fff" stroke-width="1.5"/>';
      svg+='<text x="'+x+'" y="'+(y+1)+'" text-anchor="middle" font-size="8" font-weight="800" fill="#fff">'+country+'</text>';
      svg+='<text x="'+x+'" y="'+(y+size/2+10)+'" text-anchor="middle" font-size="8" font-weight="700" fill="'+color+'">'+displayVal+'건</text>';
    });

    svg+='</svg>';
    el.innerHTML=svg;

    // 범례
    var legend=document.getElementById('rm-map-legend');
    if(legend){
      legend.innerHTML=
        '<div class="map-legend-item"><div class="map-legend-dot" style="background:#2e7d6e"></div>80%+ 완료</div>'+
        '<div class="map-legend-item"><div class="map-legend-dot" style="background:#2d6be4"></div>40~79%</div>'+
        '<div class="map-legend-item"><div class="map-legend-dot" style="background:#c97a2a"></div>1~39%</div>'+
        '<div class="map-legend-item"><div class="map-legend-dot" style="background:#d1d5db"></div>미착수</div>'+
        '<div class="map-legend-item" style="margin-left:auto;font-weight:600;color:var(--text)">총 '+Object.keys(countryStats).length+'개 국가</div>';
    }
  }

  // ── Country Rank ──
  function renderCountryRank(){
    var el=document.getElementById('rm-country-rank');if(!el)return;
    var all=_allE();
    var stats={};
    all.forEach(function(e){
      var c=_extractCountry(e.product);if(!c)return;
      if(!stats[c])stats[c]={total:0,done:0};
      stats[c].total++;
      if(e.status==='done')stats[c].done++;
    });

    var sorted=Object.keys(stats).map(function(c){
      var s=stats[c];return{country:c,total:s.total,done:s.done,pct:Math.round(s.done/s.total*100)};
    }).sort(function(a,b){return b.pct-a.pct||b.total-a.total;});

    if(!sorted.length){el.innerHTML='<div class="empty" style="padding:20px">국가별 데이터가 없습니다.</div>';return;}

    el.innerHTML=sorted.map(function(s,i){
      var color=s.pct>=80?'#2e7d6e':s.pct>=40?'#2d6be4':s.pct>0?'#c97a2a':'#d1d5db';
      return '<div class="country-rank-item">'+
        '<span class="cr-num">'+(i+1)+'</span>'+
        '<span class="cr-name">'+s.country+'</span>'+
        '<div class="cr-bar-wrap"><div class="cr-bar" style="width:'+s.pct+'%;background:'+color+'"></div></div>'+
        '<span class="cr-pct" style="color:'+color+'">'+s.pct+'%</span>'+
        '<span style="font-size:10px;color:var(--text2);width:40px;text-align:right">'+s.done+'/'+s.total+'</span>'+
      '</div>';
    }).join('');
  }

  // ── Part Bar Chart ──
  function renderPartBar(){
    var canvas=document.getElementById('rm-part-bar');if(!canvas)return;
    var ctx=canvas.getContext('2d');
    if(rmBarInst)rmBarInst.destroy();

    var vParts=_vParts(),all=_allE();
    var labels=vParts.filter(function(p){return all.some(function(e){return e.part===p;});});

    var doneData=labels.map(function(p){return all.filter(function(e){return e.part===p&&e.status==='done'}).length;});
    var inprogData=labels.map(function(p){return all.filter(function(e){return e.part===p&&e.status==='inprog'}).length;});
    var noneData=labels.map(function(p){return all.filter(function(e){return e.part===p&&(e.status==='none'||e.status==='na')}).length;});

    rmBarInst=new Chart(ctx,{
      type:'bar',
      data:{
        labels:labels,
        datasets:[
          {label:'완료',data:doneData,backgroundColor:'#2e7d6e',borderRadius:4},
          {label:'진행중',data:inprogData,backgroundColor:'#2d6be4',borderRadius:4},
          {label:'미착수',data:noneData,backgroundColor:'#e8ecf0',borderRadius:4}
        ]
      },
      options:{
        responsive:true,
        plugins:{legend:{position:'top',labels:{font:{size:11},usePointStyle:true,pointStyle:'rectRounded'}}},
        scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,ticks:{stepSize:1},grid:{color:'#f0f0f0'}}}
      }
    });
  }

  // ── Milestones ──
  function renderMilestones(){
    var el=document.getElementById('rm-milestones');if(!el)return;
    var dls=_dls(),now=new Date(),ent=_entries();
    var vParts=_vParts();

    var items=dls.filter(function(d){return vParts.indexOf(d.part)>=0;})
      .map(function(d){
        var e=ent[d.part+'|'+d.product+'|'+d.type];
        var isDone=e&&e.status==='done';
        var dd=_dday(d.date);
        return{date:d.date,product:d.product.replace(/\s*\(.+\)$/,''),type:d.type,part:d.part,
          assignee:d.assignee,done:isDone,dd:dd,prio:d.prio};
      })
      .sort(function(a,b){return new Date(a.date)-new Date(b.date);})
      .slice(0,10);

    // 비고 날짜 기반도 추가
    _allE().forEach(function(e){
      if(typeof extractDateFromNote==='function'&&e.note){
        var nd=extractDateFromNote(e.note);
        if(nd&&!items.some(function(m){return m.product===e.product.replace(/\s*\(.+\)$/,'')&&m.type===e.type;})){
          items.push({date:nd,product:e.product.replace(/\s*\(.+\)$/,''),type:e.type,part:e.part,
            assignee:e.owner||'',done:e.status==='done',dd:_dday(nd)});
        }
      }
    });
    items.sort(function(a,b){return new Date(a.date)-new Date(b.date);});
    items=items.slice(0,10);

    if(!items.length){el.innerHTML='<div class="empty" style="padding:20px">마일스톤이 없습니다.</div>';return;}

    el.innerHTML=items.map(function(m){
      var color=m.done?'#2e7d6e':m.dd<0?'#ef4444':m.dd<=3?'#c97a2a':'#2d6be4';
      var label=m.done?'완료':m.dd<0?Math.abs(m.dd)+'일 초과':m.dd===0?'오늘':'D-'+m.dd;
      var prioIcon=m.prio==='high'?'🔴':m.prio==='mid'?'🟡':'';
      return '<div class="rm-ms-item">'+
        '<div class="rm-ms-dot" style="background:'+color+'"></div>'+
        '<div class="rm-ms-info">'+
          '<div class="rm-ms-title">'+prioIcon+' '+m.product+' › '+m.type+'</div>'+
          '<div class="rm-ms-meta">'+m.part+(m.assignee?' · '+m.assignee:'')+' · '+m.date+'</div>'+
        '</div>'+
        '<span class="dl-chip '+(m.done?'dl-ok':m.dd<0?'dl-over':m.dd<=3?'dl-soon':'dl-ok')+'">'+label+'</span>'+
      '</div>';
    }).join('');
  }

  // ── Gantt Chart ──
  function fillGanttPartSel(){
    var sel=document.getElementById('rm-gantt-part');if(!sel)return;
    var vParts=_vParts(),cur=sel.value;
    sel.innerHTML='<option value="">전체 파트</option>'+vParts.map(function(p){return'<option>'+p+'</option>';}).join('');
    sel.value=cur;
  }

  function renderGantt(){
    var el=document.getElementById('rm-gantt');if(!el)return;
    var filterPart=(document.getElementById('rm-gantt-part')||{}).value||'';
    var rangeMonths=parseInt((document.getElementById('rm-gantt-range')||{}).value||'6');
    var vParts=_vParts();if(filterPart)vParts=vParts.filter(function(p){return p===filterPart;});
    var all=_allE(),dls=_dls(),now=new Date();

    var startDate=new Date(now.getFullYear(),now.getMonth()-1,1);
    var endDate=new Date(now.getFullYear(),now.getMonth()+rangeMonths,0);

    // 주 단위
    var weeks=[];var ws=new Date(startDate);
    while(ws<endDate){var we=new Date(ws);we.setDate(we.getDate()+6);if(we>endDate)we=endDate;weeks.push({s:new Date(ws),e:new Date(we)});ws.setDate(ws.getDate()+7);}

    // 월 헤더
    var months=[];var mc=new Date(startDate.getFullYear(),startDate.getMonth(),1);
    while(mc<=endDate){months.push(new Date(mc));mc.setMonth(mc.getMonth()+1);}

    if(!all.length){el.innerHTML='<div class="empty" style="padding:20px">데이터를 업로드해주세요.</div>';return;}

    var h='<table><thead><tr><th class="gl">파트 / 제품</th>';
    months.forEach(function(m){
      var mStart=new Date(Math.max(m.getTime(),startDate.getTime()));
      var mEnd=new Date(m.getFullYear(),m.getMonth()+1,0);if(mEnd>endDate)mEnd=endDate;
      var span=0;weeks.forEach(function(w){if(w.s<=mEnd&&w.e>=mStart)span++;});
      if(span>0)h+='<th colspan="'+span+'" style="background:#f0f4ff;font-size:10px;color:var(--blue)">'+(m.getMonth()+1)+'월</th>';
    });
    h+='</tr></thead><tbody>';

    vParts.forEach(function(part,pi){
      var pe=all.filter(function(e){return e.part===part;});
      var prods={};
      pe.forEach(function(e){var b=e.product.replace(/\s*\(.+\)$/,'');if(!prods[b])prods[b]=[];prods[b].push(e);});
      var pks=Object.keys(prods);if(!pks.length)return;
      var color=_partColor(pi);

      pks.forEach(function(prod){
        var ents=prods[prod];
        var done=ents.filter(function(e){return e.status==='done'}).length;
        var pct=ents.length?Math.round(done/ents.length*100):0;
        var pdls=dls.filter(function(d){return d.part===part&&d.product.indexOf(prod)===0;});

        var earliest=null,latest=null;
        pdls.forEach(function(d){var dt=new Date(d.date);if(!earliest||dt<earliest)earliest=dt;if(!latest||dt>latest)latest=dt;});
        ents.forEach(function(e){if(typeof extractDateFromNote==='function'&&e.note){var nd=extractDateFromNote(e.note);if(nd){var ndt=new Date(nd);if(!earliest||ndt<earliest)earliest=ndt;if(!latest||ndt>latest)latest=ndt;}}});
        if(!earliest){earliest=new Date(now);earliest.setMonth(earliest.getMonth()-1);}
        if(!latest){latest=new Date(earliest);latest.setMonth(latest.getMonth()+2);}

        h+='<tr><td class="gl" style="border-left:3px solid '+color+'"><span style="font-size:10px;color:'+color+';font-weight:700">'+part+'</span> '+prod+'</td>';

        weeks.forEach(function(w){
          h+='<td style="position:relative">';
          if(earliest<=w.e&&latest>=w.s){
            var bs=Math.max(0,Math.round((earliest-w.s)/86400000));
            var be=Math.min(7,Math.round((latest-w.s)/86400000)+1);
            var left=(bs/7*100),width=((be-bs)/7*100);if(width<15)width=15;
            var bcolor=pct===100?'#2e7d6e':pct>0?color:'#d1d5db';
            h+='<div class="rm-gbar" style="left:'+left+'%;width:'+width+'%;background:'+bcolor+'" title="'+prod+' ('+pct+'%)">'+pct+'%</div>';
          }
          if(now>=w.s&&now<=w.e){var tp=((now-w.s)/(7*86400000)*100);h+='<div class="rm-today-line" style="left:'+tp+'%"></div>';}
          h+='</td>';
        });
        h+='</tr>';
      });
    });
    h+='</tbody></table>';
    el.innerHTML=h;
  }

  // ── goPage 오버라이드 ──
  var _goPageRm=window.goPage;
  window.goPage=function(id,el){
    _goPageRm(id,el);
    if(id==='roadmap')renderRoadmap();
  };

  console.log('✅ IBS Roadmap v2 patch loaded');
})();
