/*  ============================================================
 *  IBS – 글로벌 출시 & 인증 대시보드 패치 v2
 *  ============================================================
 *  - 글로벌 전용 데이터 (glData)를 localStorage + Google Sheets에 저장
 *  - 기존 업로드 페이지에 "글로벌 출시 데이터" 업로드 탭 추가
 *  - 엑셀 템플릿 다운로드 및 파싱 지원
 *  
 *  사용법: index.html </body> 바로 위에 추가
 *    <script src="global-launch-patch.js"></script>
 *  ============================================================ */

(function () {
  'use strict';

  // ═══════════════════════════════════════════
  // 1. 글로벌 데이터 저장소
  // ═══════════════════════════════════════════
  const GL_STORAGE_KEY = 'ibs_global_v1';

  function emptyGlData() {
    return {
      subsidiaries: [],
      models: [],
      certTypes: [],
      launchPlans: [],
      certMatrix: [],
      designStatus: [],
      salesData: [],
      savedAt: null
    };
  }

  let glData = emptyGlData();

  function saveGlData() {
    glData.savedAt = new Date().toISOString();
    try { localStorage.setItem(GL_STORAGE_KEY, JSON.stringify(glData)); } catch (e) {}
    if (window.GAS_URL) {
      fetch(GAS_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ globalData: glData }) }).catch(function(){});
    }
  }

  function loadGlData() {
    try {
      var raw = localStorage.getItem(GL_STORAGE_KEY);
      if (raw) { var p = JSON.parse(raw); glData = Object.assign(emptyGlData(), p); return true; }
    } catch (e) {}
    return false;
  }

  loadGlData();

  // ═══════════════════════════════════════════
  // 2. 사이드바 메뉴 추가
  // ═══════════════════════════════════════════
  var countryNav = document.getElementById('ni-country');
  var refNode = countryNav || document.getElementById('ni-status');
  if (refNode && !document.getElementById('ni-global')) {
    var el = document.createElement('div');
    el.className = 'nav-item';
    el.id = 'ni-global';
    el.onclick = function () { goPage('global', this); };
    el.innerHTML = '<span class="ni">🌐</span><span>글로벌 출시</span>';
    refNode.parentNode.insertBefore(el, refNode.nextSibling);
  }

  if (window.PAGE_ROLES) PAGE_ROLES.global = ['user', 'manager', 'master'];

  // ═══════════════════════════════════════════
  // 3. 스타일
  // ═══════════════════════════════════════════
  var style = document.createElement('style');
  style.textContent = '.gl-tabs{display:flex;gap:0;border-bottom:2px solid var(--border);margin-bottom:20px}.gl-tab{padding:10px 20px;font-size:13px;font-weight:600;color:var(--text2);cursor:pointer;border:none;background:none;font-family:inherit;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .18s;display:flex;align-items:center;gap:6px}.gl-tab:hover{color:var(--blue)}.gl-tab.active{color:var(--blue);border-bottom-color:var(--blue)}.gl-tab .gl-count{background:var(--blue-light);color:var(--blue);padding:1px 7px;border-radius:10px;font-size:11px}.gl-tab.active .gl-count{background:var(--blue);color:#fff}.gl-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px}.gl-sum-card{background:var(--white);border-radius:10px;padding:14px 16px;box-shadow:var(--shadow);border-left:3px solid var(--blue)}.gl-sum-card .gl-sv{font-size:22px;font-weight:800;line-height:1.1}.gl-sum-card .gl-sl{font-size:11px;color:var(--text2);margin-top:3px}.gl-filter-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center}.gl-pill{padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:var(--white);color:var(--text2);transition:all .18s;font-family:inherit}.gl-pill:hover{border-color:var(--blue);color:var(--blue)}.gl-pill.active{background:var(--blue);color:#fff;border-color:var(--blue)}.gl-timeline{background:var(--white);border-radius:12px;box-shadow:var(--shadow);overflow:hidden}.gl-tl-header{display:grid;grid-template-columns:260px 1fr;border-bottom:1px solid var(--border)}.gl-tl-label{padding:10px 16px;font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.5px}.gl-tl-months{display:grid;grid-template-columns:repeat(12,1fr)}.gl-tl-month{padding:10px 0;font-size:11px;color:var(--text2);text-align:center;font-weight:500;border-left:1px solid #f0f0f5}.gl-tl-month.current{color:var(--blue);font-weight:700;background:#f0f4ff;border-bottom:2px solid var(--blue)}.gl-tl-row{display:grid;grid-template-columns:260px 1fr;border-bottom:1px solid #f5f5fa;transition:background .15s}.gl-tl-row:hover{background:#fafbff}.gl-tl-info{padding:12px 16px;display:flex;flex-direction:column;gap:3px}.gl-tl-name{font-size:13px;font-weight:700;color:var(--text);display:flex;align-items:center;gap:6px}.gl-tl-sub{font-size:11px;color:var(--text2)}.gl-tl-tags{display:flex;gap:4px;flex-wrap:wrap;margin-top:2px}.gl-tl-tag{font-size:10px;padding:1px 7px;border-radius:4px;background:#f3f4f6;color:var(--text2);font-weight:500}.gl-tl-chart{display:grid;grid-template-columns:repeat(12,1fr);align-items:center;position:relative}.gl-tl-cell{height:100%;border-left:1px solid #f5f5fa}.gl-tl-cell.current{background:rgba(240,244,255,.3);border-left:1px dashed var(--blue)}.gl-gantt-bar{position:absolute;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:#fff;top:50%;transform:translateY(-50%);box-shadow:0 2px 6px rgba(0,0,0,.12)}.gl-gantt-bar.active{background:linear-gradient(90deg,#2d6be4,#5b8def)}.gl-gantt-bar.planned{background:linear-gradient(90deg,#94a3b8,#b0bec5)}.gl-prio{font-size:10px;margin-right:2px}.gl-prio.high{color:var(--red)}.gl-prio.mid{color:var(--orange)}.gl-prio.low{color:var(--blue)}.gl-cert-table{width:100%;border-collapse:separate;border-spacing:0;font-size:12px}.gl-cert-table th{background:#f8fafc;color:var(--text2);font-weight:600;padding:9px 10px;text-align:center;border:1px solid var(--border);font-size:11px;position:sticky;top:0;z-index:2}.gl-cert-table td{border:1px solid var(--border);padding:7px 8px;text-align:center;vertical-align:middle}.gl-cert-table tr:hover td{background:#fafeff}.gl-cert-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:6px;font-size:11px;font-weight:600;white-space:nowrap}.gl-cb-none{background:#f3f4f6;color:#9ca3af}.gl-cb-doc{background:var(--blue-light);color:#2563eb}.gl-cb-test{background:var(--orange-light);color:#b45309}.gl-cb-review{background:var(--green-light);color:#047857}.gl-cb-fix{background:var(--red-light);color:#dc2626}.gl-cb-done{background:#d1fae5;color:#065f46}.gl-cert-stat{background:var(--white);border-radius:10px;padding:12px 16px;box-shadow:var(--shadow);text-align:center}.gl-cert-stat .gl-cs-num{font-size:20px;font-weight:800}.gl-cert-stat .gl-cs-label{font-size:11px;color:var(--text2);margin-top:2px}.gl-prog-bar{width:100%;height:7px;background:#f0f0f5;border-radius:4px;overflow:hidden}.gl-prog-fill{height:100%;border-radius:4px;transition:width .6s}.gl-prog-fill.ui{background:linear-gradient(90deg,#7c2d3e,#b8648a)}.gl-prog-fill.post{background:linear-gradient(90deg,#2e7d6e,#4ec9b0)}.gl-sub-card{background:var(--white);border-radius:12px;box-shadow:var(--shadow);padding:18px;transition:box-shadow .18s}.gl-sub-card:hover{box-shadow:var(--shadow-md)}.gl-sub-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.gl-sub-name{font-size:15px;font-weight:700;color:var(--text)}.gl-sub-region{font-size:11px;color:var(--text2)}.gl-sub-type{padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600}.gl-sub-type.corp{background:#fdf2f4;color:#7c2d3e;border:1px solid #e8c8ce}.gl-sub-type.agent{background:var(--orange-light);color:#92400e;border:1px solid #f5d6a8}.gl-sub-revenue{background:#f8fafc;border-radius:8px;padding:12px;margin-bottom:10px}.gl-sub-rev-num{font-size:18px;font-weight:800;color:var(--text)}.gl-sub-rev-label{font-size:10px;color:var(--text2);margin-bottom:6px}.gl-sub-rev-bar{height:4px;background:#f0f0f5;border-radius:4px;overflow:hidden;margin-top:3px}.gl-sub-rev-fill{height:100%;border-radius:4px;background:var(--blue)}.gl-empty{text-align:center;padding:60px 20px;color:var(--text2)}.gl-empty-icon{font-size:48px;margin-bottom:12px}.gl-empty-title{font-size:16px;font-weight:700;color:var(--text);margin-bottom:6px}.gl-empty-sub{font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:16px}';
  document.head.appendChild(style);

  // ═══════════════════════════════════════════
  // 4. 헬퍼
  // ═══════════════════════════════════════════
  var MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  var CURRENT_MONTH = new Date().getMonth();
  var CERT_STAGES = ['미착수','서류준비','시험진행','심사중','보완요청','승인완료'];

  function getModel(id) { return glData.models.find(function(m){return m.id===id}); }
  function getSub(id) { return glData.subsidiaries.find(function(s){return s.id===id}); }
  function shortName(n) { return (n||'').replace(/ (법인|대리점)/,''); }
  function certBadgeClass(s) { return {'미착수':'gl-cb-none','서류준비':'gl-cb-doc','시험진행':'gl-cb-test','심사중':'gl-cb-review','보완요청':'gl-cb-fix','승인완료':'gl-cb-done'}[s]||'gl-cb-none'; }
  function prioInfo(p) { if(p==='높음')return{cls:'high',icon:'▲'};if(p==='중간')return{cls:'mid',icon:'●'};return{cls:'low',icon:'▽'}; }
  function designBadge(status) {
    var map={'미착수':{bg:'#f3f4f6',c:'#9ca3af'},'디자인중':{bg:'var(--orange-light)',c:'#b45309'},'UI확정':{bg:'var(--green-light)',c:'#047857'},'확정':{bg:'var(--green-light)',c:'#047857'},'수정중':{bg:'var(--red-light)',c:'#dc2626'},'진행중':{bg:'var(--orange-light)',c:'#b45309'},'완료':{bg:'#d1fae5',c:'#065f46'}};
    var s=map[status]||map['미착수'];
    return '<span class="gl-cert-badge" style="background:'+s.bg+';color:'+s.c+'">'+status+'</span>';
  }
  function hasData() { return glData.launchPlans.length>0||glData.certMatrix.length>0||glData.designStatus.length>0||glData.subsidiaries.length>0; }

  // ═══════════════════════════════════════════
  // 5. 글로벌 페이지 HTML
  // ═══════════════════════════════════════════
  var content = document.querySelector('.content');
  if (content && !document.getElementById('page-global')) {
    var page = document.createElement('div');
    page.className = 'page';
    page.id = 'page-global';
    page.innerHTML = '<div class="ph"><h1>Global Launch</h1><p>글로벌 출시 & 인증 통합 대시보드 │ 2026</p></div>'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px"><div></div>'+
      '<select class="fsel" id="gl-sub-select" onchange="IBS_Global.onSubChange()" style="min-width:180px"><option value="전체">전체 법인/대리점</option></select></div>'+
      '<div class="gl-summary" id="gl-summary"></div>'+
      '<div class="gl-tabs" id="gl-tabs"></div>'+
      '<div id="gl-tab-content"></div>';
    var searchPage = document.getElementById('page-search');
    if (searchPage) content.insertBefore(page, searchPage);
    else content.appendChild(page);
  }

  // ═══════════════════════════════════════════
  // 6. 업로드 페이지에 글로벌 탭 추가
  // ═══════════════════════════════════════════
  function injectUploadTab() {
    var uploadPage = document.getElementById('page-upload');
    if (!uploadPage) return;
    var tabRow = uploadPage.querySelector('.wtype-tabs');
    if (!tabRow || document.getElementById('ul-mode-global')) return;

    var btn = document.createElement('button');
    btn.className = 'wtype-tab';
    btn.id = 'ul-mode-global';
    btn.textContent = '🌐 글로벌 출시 데이터';
    btn.onclick = function () { switchUploadMode('global', this); };
    tabRow.appendChild(btn);

    var section = document.createElement('div');
    section.id = 'ul-section-global';
    section.style.display = 'none';
    section.innerHTML =
      '<div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #93c5fd;border-radius:12px;padding:16px 20px;margin-bottom:18px"><div style="display:flex;align-items:center;gap:14px"><div style="font-size:28px">🌐</div><div style="flex:1"><div style="font-weight:700;font-size:13px;color:#1d4ed8;margin-bottom:3px">글로벌 출시 데이터 관리</div><div id="gl-data-info" style="font-size:12px;color:#3b82f6;line-height:1.8"></div></div><button onclick="IBS_Global.downloadTemplate()" style="padding:9px 18px;background:#2d6be4;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap">📄 템플릿 다운로드</button></div></div>'+
      '<div class="g2"><div class="card"><div class="card-head"><div class="card-head-title">📋 엑셀 시트 구조 안내</div></div><div class="card-body"><div style="background:#f8fafc;border-radius:9px;padding:14px;font-size:12px;color:var(--text2);line-height:2">'+
        '<b style="color:var(--text)">시트 1: 법인_대리점</b><br>ID · 법인명 · 구분(법인/대리점) · 지역<br><br>'+
        '<b style="color:var(--text)">시트 2: 장비모델</b><br>모델ID · 모델명 · 카테고리<br><br>'+
        '<b style="color:var(--text)">시트 3: 출시계획</b><br>모델ID · 법인ID · 상태 · 시작월 · 종료월 · 인증상태 · 디자인상태 · 후가공상태 · 우선순위<br><br>'+
        '<b style="color:var(--text)">시트 4: 인증현황</b><br>모델ID · 인증종류ID · 상태 · 날짜<br><br>'+
        '<b style="color:var(--text)">시트 5: 인증종류</b><br>인증ID · 인증명 · 대상국가<br><br>'+
        '<b style="color:var(--text)">시트 6: 디자인_후가공</b><br>모델ID · UI상태 · UI진행률 · 후가공상태 · 후가공진행률 · 대상국가(콤마구분)<br><br>'+
        '<b style="color:var(--text)">시트 7: 매출데이터</b><br>법인ID · 모델ID · 매출 · 판매수량'+
      '</div></div></div>'+
      '<div class="card"><div class="card-head"><div class="card-head-title">📥 파일 업로드</div></div><div class="card-body">'+
        '<div class="upload-zone" id="gl-drop-zone" onclick="document.getElementById(\'gl-file-input\').click()" ondragover="event.preventDefault();this.classList.add(\'drag\')" ondragleave="this.classList.remove(\'drag\')" ondrop="IBS_Global.handleDrop(event)">'+
          '<input type="file" id="gl-file-input" accept=".xlsx,.xls" onchange="IBS_Global.handleFile(event)" style="display:none">'+
          '<div class="uz-icon">🌐</div><div class="uz-title">글로벌 출시 데이터 업로드</div><div class="uz-sub">클릭하거나 드래그 (.xlsx)</div></div>'+
        '<div class="progress-bar" id="gl-pb"><div class="progress-fill" id="gl-pf" style="width:0%"></div></div>'+
        '<div class="upload-result" id="gl-ur"></div>'+
        '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">'+
          '<button onclick="IBS_Global.loadSampleData()" style="padding:8px 16px;background:#7c2d3e;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">📊 샘플 데이터 불러오기</button>'+
          '<button onclick="IBS_Global.clearData()" style="padding:8px 16px;background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">🗑️ 글로벌 데이터 초기화</button></div>'+
      '</div></div></div>'+
      '<div class="card" id="gl-preview-card" style="display:none"><div class="card-head"><div class="card-head-title">📋 업로드 결과</div></div><div class="card-body" id="gl-preview-body"></div></div>';

    var manualSection = document.getElementById('ul-section-manual');
    if (manualSection) manualSection.parentNode.insertBefore(section, manualSection.nextSibling);
    else { var ct = uploadPage.querySelector('.content'); if(ct)ct.appendChild(section); else uploadPage.appendChild(section); }

    // switchUploadMode 확장
    var origSwitch = window.switchUploadMode;
    window.switchUploadMode = function (mode, btn) {
      var glSection = document.getElementById('ul-section-global');
      var glBtn = document.getElementById('ul-mode-global');
      if (glSection) glSection.style.display = mode === 'global' ? 'block' : 'none';

      if (mode === 'global') {
        document.querySelectorAll('#page-upload .wtype-tab').forEach(function(b){b.classList.remove('active')});
        if (glBtn) glBtn.classList.add('active');
        var fs = document.getElementById('ul-section-file');
        var ms = document.getElementById('ul-section-manual');
        if (fs) fs.style.display = 'none';
        if (ms) ms.style.display = 'none';
        IBS_Global.updateDataInfo();
      } else {
        if (glBtn) glBtn.classList.remove('active');
        if (glSection) glSection.style.display = 'none';
        origSwitch(mode, btn);
      }
    };
  }

  // ═══════════════════════════════════════════
  // 7. 엑셀 파싱
  // ═══════════════════════════════════════════
  function parseGlobalExcel(wb) {
    var result = emptyGlData();
    var sheetNames = wb.SheetNames;

    function getSheet(keywords) {
      for (var i=0;i<sheetNames.length;i++) {
        var lower = sheetNames[i].toLowerCase().replace(/[\s_]/g,'');
        for (var j=0;j<keywords.length;j++) {
          if (lower.indexOf(keywords[j]) >= 0) return XLSX.utils.sheet_to_json(wb.Sheets[sheetNames[i]], {defval:''});
        }
      }
      return null;
    }

    var subRows = getSheet(['법인','대리점','subsidiary','sub']);
    if (subRows) subRows.forEach(function(r,i){
      var id=String(r['ID']||r['id']||r['법인ID']||'sub'+i).trim();
      var name=String(r['법인명']||r['이름']||r['name']||'').trim();
      var type=String(r['구분']||r['type']||r['유형']||'법인').trim();
      var region=String(r['지역']||r['region']||'').trim();
      if(name)result.subsidiaries.push({id:id,name:name,type:type,region:region});
    });

    var modelRows = getSheet(['장비','모델','model','equipment']);
    if (modelRows) modelRows.forEach(function(r,i){
      var id=String(r['모델ID']||r['ID']||r['id']||'m'+i).trim();
      var name=String(r['모델명']||r['이름']||r['name']||'').trim();
      var cat=String(r['카테고리']||r['category']||r['분류']||'').trim();
      if(name)result.models.push({id:id,name:name,category:cat});
    });

    var launchRows = getSheet(['출시','launch','plan']);
    if (launchRows) launchRows.forEach(function(r,i){
      result.launchPlans.push({
        id:'lp'+i,
        model:String(r['모델ID']||r['모델']||'').trim(),
        subsidiary:String(r['법인ID']||r['법인']||'').trim(),
        status:String(r['상태']||r['status']||'계획').trim(),
        startMonth:parseInt(r['시작월']||r['시작']||1)||1,
        endMonth:parseInt(r['종료월']||r['종료']||12)||12,
        certStatus:String(r['인증상태']||r['인증']||'미착수').trim(),
        designStatus:String(r['디자인상태']||r['디자인']||r['UI상태']||'미착수').trim(),
        postProcess:String(r['후가공상태']||r['후가공']||'미착수').trim(),
        priority:String(r['우선순위']||r['priority']||'중간').trim()
      });
    });

    var certRows = getSheet(['인증현황','인증매트릭스','cert']);
    if (certRows) certRows.forEach(function(r){
      var model=String(r['모델ID']||r['모델']||'').trim();
      var cert=String(r['인증종류ID']||r['인증ID']||r['인증종류']||'').trim();
      var status=String(r['상태']||r['status']||'미착수').trim();
      var date=String(r['날짜']||r['date']||'').trim();
      if(model&&cert)result.certMatrix.push({model:model,cert:cert,status:status,date:date});
    });

    var certTypeRows = getSheet(['인증종류','인증유형','certtype']);
    if (certTypeRows) certTypeRows.forEach(function(r){
      var id=String(r['인증ID']||r['ID']||r['id']||'').trim();
      var name=String(r['인증명']||r['이름']||r['name']||'').trim();
      var country=String(r['대상국가']||r['국가']||r['country']||'').trim();
      if(id&&name)result.certTypes.push({id:id,name:name,country:country});
    });

    var designRows = getSheet(['디자인','후가공','design']);
    if (designRows) designRows.forEach(function(r){
      var countriesRaw=String(r['대상국가']||r['국가']||'').trim();
      var countries=countriesRaw?countriesRaw.split(/[,，\s]+/).filter(Boolean):[];
      result.designStatus.push({
        model:String(r['모델ID']||r['모델']||'').trim(),
        uiStatus:String(r['UI상태']||r['UI']||'미착수').trim(),
        uiProgress:parseInt(r['UI진행률']||r['UI%']||0)||0,
        postStatus:String(r['후가공상태']||r['후가공']||'미착수').trim(),
        postProgress:parseInt(r['후가공진행률']||r['후가공%']||0)||0,
        countries:countries
      });
    });

    var salesRows = getSheet(['매출','sales','revenue']);
    if (salesRows) salesRows.forEach(function(r){
      result.salesData.push({
        subsidiary:String(r['법인ID']||r['법인']||'').trim(),
        model:String(r['모델ID']||r['모델']||'').trim(),
        revenue:parseFloat(r['매출']||r['revenue']||0)||0,
        units:parseInt(r['판매수량']||r['수량']||r['units']||0)||0
      });
    });

    return result;
  }

  // ═══════════════════════════════════════════
  // 8. 샘플 데이터
  // ═══════════════════════════════════════════
  function getSampleData(){return{subsidiaries:[{id:'kr',name:'한국 본사',type:'법인',region:'Asia'},{id:'us',name:'미국 법인',type:'법인',region:'Americas'},{id:'de',name:'독일 법인',type:'법인',region:'Europe'},{id:'jp',name:'일본 법인',type:'법인',region:'Asia'},{id:'cn',name:'중국 법인',type:'법인',region:'Asia'},{id:'br',name:'브라질 법인',type:'법인',region:'Americas'},{id:'in',name:'인도 법인',type:'법인',region:'Asia'},{id:'au',name:'호주 법인',type:'법인',region:'Oceania'},{id:'sa',name:'사우디 대리점',type:'대리점',region:'Middle East'},{id:'th',name:'태국 대리점',type:'대리점',region:'Asia'},{id:'vn',name:'베트남 대리점',type:'대리점',region:'Asia'},{id:'mx',name:'멕시코 대리점',type:'대리점',region:'Americas'},{id:'pl',name:'폴란드 대리점',type:'대리점',region:'Europe'},{id:'eg',name:'이집트 대리점',type:'대리점',region:'Africa'}],models:[{id:'m1',name:'MedScan Pro X1',category:'진단장비'},{id:'m2',name:'MedScan Lite S2',category:'진단장비'},{id:'m3',name:'TheraWave 300',category:'치료장비'},{id:'m4',name:'TheraWave 500',category:'치료장비'},{id:'m5',name:'VitaMonitor M1',category:'모니터링'},{id:'m6',name:'VitaMonitor M2',category:'모니터링'},{id:'m7',name:'SurgiAssist R1',category:'수술장비'},{id:'m8',name:'DentaCure Pro',category:'치과장비'},{id:'m9',name:'OptiView 200',category:'영상장비'},{id:'m10',name:'CardioSync Plus',category:'심장장비'}],certTypes:[{id:'kfda',name:'KFDA',country:'한국'},{id:'fda',name:'FDA 510(k)',country:'미국'},{id:'ce',name:'CE MDR',country:'유럽'},{id:'pmda',name:'PMDA',country:'일본'},{id:'nmpa',name:'NMPA',country:'중국'},{id:'anvisa',name:'ANVISA',country:'브라질'},{id:'tga',name:'TGA',country:'호주'},{id:'cdsco',name:'CDSCO',country:'인도'},{id:'sfda',name:'SFDA',country:'사우디'},{id:'tfda',name:'Thai FDA',country:'태국'}],launchPlans:[{id:'lp1',model:'m1',subsidiary:'sa',status:'진행중',startMonth:1,endMonth:6,certStatus:'시험진행',designStatus:'UI확정',postProcess:'진행중',priority:'높음'},{id:'lp2',model:'m3',subsidiary:'vn',status:'계획',startMonth:3,endMonth:9,certStatus:'서류준비',designStatus:'디자인중',postProcess:'미착수',priority:'중간'},{id:'lp3',model:'m5',subsidiary:'mx',status:'진행중',startMonth:2,endMonth:7,certStatus:'심사중',designStatus:'UI확정',postProcess:'완료',priority:'높음'},{id:'lp4',model:'m2',subsidiary:'eg',status:'계획',startMonth:5,endMonth:12,certStatus:'미착수',designStatus:'미착수',postProcess:'미착수',priority:'낮음'},{id:'lp5',model:'m7',subsidiary:'pl',status:'진행중',startMonth:1,endMonth:5,certStatus:'보완요청',designStatus:'수정중',postProcess:'진행중',priority:'높음'},{id:'lp6',model:'m4',subsidiary:'in',status:'계획',startMonth:4,endMonth:10,certStatus:'서류준비',designStatus:'디자인중',postProcess:'미착수',priority:'중간'},{id:'lp7',model:'m8',subsidiary:'th',status:'진행중',startMonth:2,endMonth:8,certStatus:'시험진행',designStatus:'UI확정',postProcess:'진행중',priority:'중간'},{id:'lp8',model:'m10',subsidiary:'br',status:'계획',startMonth:6,endMonth:12,certStatus:'미착수',designStatus:'미착수',postProcess:'미착수',priority:'낮음'},{id:'lp9',model:'m9',subsidiary:'au',status:'진행중',startMonth:1,endMonth:4,certStatus:'승인완료',designStatus:'완료',postProcess:'완료',priority:'높음'},{id:'lp10',model:'m6',subsidiary:'jp',status:'진행중',startMonth:3,endMonth:8,certStatus:'심사중',designStatus:'UI확정',postProcess:'진행중',priority:'높음'}],certMatrix:[{model:'m1',cert:'kfda',status:'승인완료',date:'2024-06'},{model:'m1',cert:'fda',status:'승인완료',date:'2025-01'},{model:'m1',cert:'ce',status:'승인완료',date:'2025-03'},{model:'m1',cert:'pmda',status:'심사중',date:'2026-02'},{model:'m1',cert:'sfda',status:'시험진행',date:'2026-04'},{model:'m2',cert:'kfda',status:'승인완료',date:'2024-09'},{model:'m2',cert:'fda',status:'심사중',date:'2025-12'},{model:'m2',cert:'ce',status:'미착수',date:''},{model:'m3',cert:'kfda',status:'승인완료',date:'2023-11'},{model:'m3',cert:'fda',status:'승인완료',date:'2024-08'},{model:'m3',cert:'ce',status:'승인완료',date:'2025-01'},{model:'m3',cert:'pmda',status:'승인완료',date:'2025-06'},{model:'m3',cert:'nmpa',status:'시험진행',date:'2026-01'},{model:'m3',cert:'tfda',status:'서류준비',date:'2026-03'},{model:'m4',cert:'kfda',status:'승인완료',date:'2025-02'},{model:'m4',cert:'fda',status:'서류준비',date:'2026-01'},{model:'m4',cert:'cdsco',status:'서류준비',date:'2026-04'},{model:'m5',cert:'kfda',status:'승인완료',date:'2024-03'},{model:'m5',cert:'fda',status:'심사중',date:'2025-10'},{model:'m5',cert:'ce',status:'승인완료',date:'2025-05'},{model:'m6',cert:'kfda',status:'승인완료',date:'2025-01'},{model:'m6',cert:'pmda',status:'심사중',date:'2026-03'},{model:'m7',cert:'kfda',status:'승인완료',date:'2024-07'},{model:'m7',cert:'ce',status:'보완요청',date:'2026-01'},{model:'m8',cert:'kfda',status:'승인완료',date:'2024-12'},{model:'m8',cert:'tfda',status:'시험진행',date:'2026-02'},{model:'m9',cert:'kfda',status:'승인완료',date:'2023-08'},{model:'m9',cert:'fda',status:'승인완료',date:'2024-05'},{model:'m9',cert:'ce',status:'승인완료',date:'2024-11'},{model:'m9',cert:'tga',status:'승인완료',date:'2026-01'},{model:'m10',cert:'kfda',status:'승인완료',date:'2025-04'},{model:'m10',cert:'anvisa',status:'미착수',date:''}],designStatus:[{model:'m1',uiStatus:'완료',uiProgress:100,postStatus:'완료',postProgress:100,countries:['kr','us','de','jp']},{model:'m1',uiStatus:'확정',uiProgress:80,postStatus:'진행중',postProgress:60,countries:['sa']},{model:'m2',uiStatus:'완료',uiProgress:100,postStatus:'완료',postProgress:100,countries:['kr']},{model:'m3',uiStatus:'완료',uiProgress:100,postStatus:'완료',postProgress:100,countries:['kr','us','de','jp']},{model:'m3',uiStatus:'디자인중',uiProgress:45,postStatus:'미착수',postProgress:0,countries:['vn']},{model:'m4',uiStatus:'완료',uiProgress:100,postStatus:'완료',postProgress:100,countries:['kr']},{model:'m4',uiStatus:'디자인중',uiProgress:30,postStatus:'미착수',postProgress:0,countries:['in']},{model:'m5',uiStatus:'완료',uiProgress:100,postStatus:'완료',postProgress:100,countries:['kr','de']},{model:'m5',uiStatus:'확정',uiProgress:85,postStatus:'완료',postProgress:100,countries:['mx']},{model:'m6',uiStatus:'완료',uiProgress:100,postStatus:'완료',postProgress:100,countries:['kr']},{model:'m6',uiStatus:'확정',uiProgress:75,postStatus:'진행중',postProgress:50,countries:['jp']},{model:'m7',uiStatus:'완료',uiProgress:100,postStatus:'완료',postProgress:100,countries:['kr']},{model:'m7',uiStatus:'수정중',uiProgress:60,postStatus:'진행중',postProgress:40,countries:['pl']},{model:'m8',uiStatus:'완료',uiProgress:100,postStatus:'완료',postProgress:100,countries:['kr']},{model:'m8',uiStatus:'확정',uiProgress:80,postStatus:'진행중',postProgress:55,countries:['th']},{model:'m9',uiStatus:'완료',uiProgress:100,postStatus:'완료',postProgress:100,countries:['kr','us','de','au']},{model:'m10',uiStatus:'완료',uiProgress:100,postStatus:'완료',postProgress:100,countries:['kr']}],salesData:[{subsidiary:'kr',model:'m1',revenue:8500,units:320},{subsidiary:'kr',model:'m3',revenue:12000,units:180},{subsidiary:'kr',model:'m5',revenue:4200,units:560},{subsidiary:'kr',model:'m7',revenue:15000,units:85},{subsidiary:'kr',model:'m9',revenue:6800,units:210},{subsidiary:'us',model:'m1',revenue:14200,units:480},{subsidiary:'us',model:'m3',revenue:18500,units:220},{subsidiary:'us',model:'m9',revenue:9600,units:310},{subsidiary:'de',model:'m1',revenue:7800,units:260},{subsidiary:'de',model:'m3',revenue:9200,units:140},{subsidiary:'de',model:'m5',revenue:3100,units:420},{subsidiary:'jp',model:'m1',revenue:11000,units:390},{subsidiary:'jp',model:'m3',revenue:13500,units:195},{subsidiary:'cn',model:'m3',revenue:16000,units:350},{subsidiary:'br',model:'m3',revenue:5400,units:95},{subsidiary:'in',model:'m1',revenue:3200,units:180},{subsidiary:'au',model:'m9',revenue:4500,units:150},{subsidiary:'au',model:'m1',revenue:3800,units:130}],savedAt:null};}

  // ═══════════════════════════════════════════
  // 9. 메인 모듈
  // ═══════════════════════════════════════════
  var glActiveTab = 0;
  var glFilterSub = '전체';

  var mod = {
    init: function() {
      var sel = document.getElementById('gl-sub-select');
      if (sel) {
        sel.innerHTML = '<option value="전체">전체 법인/대리점</option>' +
          glData.subsidiaries.map(function(s){return '<option value="'+s.id+'">'+s.name+' ('+s.type+')</option>'}).join('');
        sel.value = glFilterSub;
      }
      this.renderSummary();
      this.renderTabs();
      this.renderContent();
    },
    onSubChange: function() { glFilterSub = document.getElementById('gl-sub-select').value; this.renderSummary(); this.renderContent(); },
    setTab: function(idx) { glActiveTab = idx; this.renderTabs(); this.renderContent(); },

    renderSummary: function() {
      var el = document.getElementById('gl-summary');
      if (!el) return;
      if (!hasData()) { el.innerHTML = ''; return; }
      var cards = [
        {label:'진행중 출시',value:glData.launchPlans.filter(function(l){return l.status==='진행중'}).length,color:'var(--blue)'},
        {label:'인증 심사중',value:glData.certMatrix.filter(function(c){return c.status==='심사중'||c.status==='시험진행'}).length,color:'var(--orange)'},
        {label:'인증 완료',value:glData.certMatrix.filter(function(c){return c.status==='승인완료'}).length,color:'var(--green)'},
        {label:'보완 필요',value:glData.certMatrix.filter(function(c){return c.status==='보완요청'}).length,color:'var(--red)'},
        {label:'관리 법인',value:glData.subsidiaries.filter(function(s){return s.type==='법인'}).length,color:'#7c2d3e'},
        {label:'관리 대리점',value:glData.subsidiaries.filter(function(s){return s.type==='대리점'}).length,color:'var(--purple)'}
      ];
      el.innerHTML = cards.map(function(c){return '<div class="gl-sum-card" style="border-left-color:'+c.color+'"><div class="gl-sv" style="color:'+c.color+'">'+c.value+'</div><div class="gl-sl">'+c.label+'</div></div>'}).join('');
    },

    renderTabs: function() {
      var tabs=[{name:'신규 출시 계획',icon:'🚀',count:glData.launchPlans.length},{name:'인증 현황',icon:'📋',count:glData.certMatrix.length},{name:'디자인/후가공',icon:'🎨',count:glData.designStatus.length},{name:'법인/국가 현황',icon:'🏢',count:glData.subsidiaries.length}];
      var el = document.getElementById('gl-tabs');
      if (!el) return;
      el.innerHTML = tabs.map(function(t,i){return '<button class="gl-tab'+(i===glActiveTab?' active':'')+'" onclick="IBS_Global.setTab('+i+')"><span>'+t.icon+'</span> '+t.name+' <span class="gl-count">'+t.count+'</span></button>'}).join('');
    },

    renderContent: function() {
      var el = document.getElementById('gl-tab-content');
      if (!el) return;
      if (!hasData()) {
        el.innerHTML = '<div class="card"><div class="card-body"><div class="gl-empty"><div class="gl-empty-icon">🌐</div><div class="gl-empty-title">글로벌 출시 데이터가 없습니다</div><div class="gl-empty-sub">데이터 업로드 페이지에서 글로벌 출시 데이터를 업로드하거나<br>샘플 데이터를 불러와서 먼저 확인해보세요.</div><div style="display:flex;gap:8px;justify-content:center"><button onclick="goPage(\'upload\',document.getElementById(\'ni-upload\'));setTimeout(function(){switchUploadMode(\'global\',document.getElementById(\'ul-mode-global\'))},100)" class="btn btn-primary" style="font-size:13px">📥 데이터 업로드하기</button><button onclick="IBS_Global.loadSampleData()" class="btn btn-secondary" style="font-size:13px">📊 샘플 데이터</button></div></div></div></div>';
        return;
      }
      if (glActiveTab===0) this.renderLaunch(el);
      else if (glActiveTab===1) this.renderCert(el);
      else if (glActiveTab===2) this.renderDesign(el);
      else this.renderSubsidiary(el);
    },

    renderLaunch: function(ct) {
      var plans=glData.launchPlans;
      if(glFilterSub!=='전체')plans=plans.filter(function(p){return p.subsidiary===glFilterSub});
      var h='<div class="gl-filter-row" style="margin-bottom:14px"><span style="font-size:11px;color:var(--text2);margin-right:4px">상태:</span><button class="gl-pill active" onclick="IBS_Global._filter(\'전체\',\'status\',this)">전체</button><button class="gl-pill" onclick="IBS_Global._filter(\'진행중\',\'status\',this)">진행중</button><button class="gl-pill" onclick="IBS_Global._filter(\'계획\',\'status\',this)">계획</button><span style="width:1px;height:20px;background:var(--border);margin:0 6px"></span><span style="font-size:11px;color:var(--text2);margin-right:4px">우선순위:</span><button class="gl-pill active" onclick="IBS_Global._filter(\'전체\',\'prio\',this)">전체</button><button class="gl-pill" onclick="IBS_Global._filter(\'높음\',\'prio\',this)"><span class="gl-prio high">▲</span>높음</button><button class="gl-pill" onclick="IBS_Global._filter(\'중간\',\'prio\',this)"><span class="gl-prio mid">●</span>중간</button><button class="gl-pill" onclick="IBS_Global._filter(\'낮음\',\'prio\',this)"><span class="gl-prio low">▽</span>낮음</button></div>';
      h+='<div class="gl-timeline"><div class="gl-tl-header"><div class="gl-tl-label">프로젝트</div><div class="gl-tl-months">'+MONTHS.map(function(m,i){return '<div class="gl-tl-month'+(i===CURRENT_MONTH?' current':'')+'">'+m+'</div>'}).join('')+'</div></div>';
      plans.forEach(function(lp){
        var model=getModel(lp.model),sub=getSub(lp.subsidiary),pi=prioInfo(lp.priority);
        h+='<div class="gl-tl-row" data-status="'+lp.status+'" data-prio="'+lp.priority+'"><div class="gl-tl-info"><div class="gl-tl-name"><span class="gl-prio '+pi.cls+'">'+pi.icon+'</span>'+(model?model.name:lp.model)+'</div><div class="gl-tl-sub">'+(sub?sub.name:lp.subsidiary)+'</div><div class="gl-tl-tags"><span class="gl-tl-tag">인증: '+lp.certStatus+'</span><span class="gl-tl-tag">UI: '+lp.designStatus+'</span><span class="gl-tl-tag">후가공: '+lp.postProcess+'</span></div></div><div class="gl-tl-chart">'+MONTHS.map(function(_,i){return '<div class="gl-tl-cell'+(i===CURRENT_MONTH?' current':'')+'"></div>'}).join('')+'<div class="gl-gantt-bar '+(lp.status==='진행중'?'active':'planned')+'" style="left:'+((lp.startMonth-1)/12*100)+'%;width:'+((lp.endMonth-lp.startMonth+1)/12*100)+'%">'+lp.startMonth+'월~'+lp.endMonth+'월</div></div></div>';
      });
      if(!plans.length)h+='<div style="padding:40px;text-align:center;color:var(--text2)">해당 조건의 출시 계획이 없습니다</div>';
      h+='</div><div style="display:flex;gap:16px;margin-top:12px;padding:10px 14px;background:var(--white);border-radius:8px;box-shadow:var(--shadow)"><span style="font-size:11px;color:var(--text2)">범례:</span><span style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--text2)"><span style="width:20px;height:8px;border-radius:3px;background:linear-gradient(90deg,#2d6be4,#5b8def)"></span> 진행중</span><span style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--text2)"><span style="width:20px;height:8px;border-radius:3px;background:linear-gradient(90deg,#94a3b8,#b0bec5)"></span> 계획</span><span style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--text2)"><span style="width:1px;height:14px;border-left:1px dashed var(--blue)"></span> 현재 ('+MONTHS[CURRENT_MONTH]+')</span></div>';
      ct.innerHTML=h;
    },

    _filter: function(val,type,btn) {
      var pills=Array.from(btn.parentElement.querySelectorAll('.gl-pill'));
      if(type==='status')pills.slice(0,3).forEach(function(b){b.classList.remove('active')});
      else pills.slice(3).forEach(function(b){b.classList.remove('active')});
      btn.classList.add('active');
      var aS=pills.slice(0,3).find(function(b){return b.classList.contains('active')});
      var aP=pills.slice(3).find(function(b){return b.classList.contains('active')});
      var sV=aS?aS.textContent.trim():'전체';
      var pV=aP?aP.textContent.replace(/[▲●▽]/g,'').trim():'전체';
      document.querySelectorAll('.gl-tl-row').forEach(function(row){
        var mS=sV==='전체'||row.dataset.status===sV;
        var mP=pV==='전체'||row.dataset.prio===pV;
        row.style.display=(mS&&mP)?'':'none';
      });
    },

    renderCert: function(ct) {
      var h='<div class="gl-filter-row" style="margin-bottom:14px"><span style="font-size:11px;color:var(--text2);margin-right:4px">모델:</span><button class="gl-pill active" onclick="IBS_Global._certF(\'전체\',this)">전체</button>'+glData.models.map(function(m){return '<button class="gl-pill" onclick="IBS_Global._certF(\''+m.id+'\',this)">'+m.name+'</button>'}).join('')+'</div>';
      h+='<div class="card"><div class="card-body" style="padding:0 16px 16px"><div class="matrix-wrap"><table class="gl-cert-table"><thead><tr><th style="text-align:left;position:sticky;left:0;background:#f8fafc;z-index:2;min-width:140px">장비</th>'+glData.certTypes.map(function(c){return '<th style="min-width:90px"><div>'+c.name+'</div><div style="font-size:9px;color:#999;font-weight:400">'+c.country+'</div></th>'}).join('')+'</tr></thead><tbody>';
      glData.models.forEach(function(model,idx){
        var bg=idx%2===0?'#fff':'#fafbfc';
        h+='<tr data-model="'+model.id+'"><td style="text-align:left;font-weight:600;position:sticky;left:0;z-index:1;border:1px solid var(--border);background:'+bg+'"><div>'+model.name+'</div><div style="font-size:10px;color:var(--text2);font-weight:400">'+model.category+'</div></td>';
        glData.certTypes.forEach(function(c){
          var e=glData.certMatrix.find(function(x){return x.model===model.id&&x.cert===c.id});
          if(!e)h+='<td style="color:#ddd">—</td>';
          else h+='<td><span class="gl-cert-badge '+certBadgeClass(e.status)+'">'+e.status+'</span>'+(e.date?'<div style="font-size:9px;color:#999;margin-top:2px">'+e.date+'</div>':'')+'</td>';
        });
        h+='</tr>';
      });
      h+='</tbody></table></div></div></div>';
      h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;margin-top:16px">'+CERT_STAGES.map(function(stage){var count=glData.certMatrix.filter(function(c){return c.status===stage}).length;return '<div class="gl-cert-stat"><div class="gl-cs-num">'+count+'</div><div class="gl-cs-label">'+stage+'</div></div>'}).join('')+'</div>';
      ct.innerHTML=h;
    },

    _certF: function(val,btn) {
      btn.parentElement.querySelectorAll('.gl-pill').forEach(function(b){b.classList.remove('active')});
      btn.classList.add('active');
      document.querySelectorAll('.gl-cert-table tbody tr').forEach(function(row){row.style.display=(val==='전체'||row.dataset.model===val)?'':'none'});
    },

    renderDesign: function(ct) {
      var filtered=glData.designStatus;
      if(glFilterSub!=='전체')filtered=filtered.filter(function(d){return d.countries.indexOf(glFilterSub)>=0});
      if(!filtered.length){ct.innerHTML='<div class="card"><div class="card-body"><div class="empty">해당 조건의 디자인 현황이 없습니다</div></div></div>';return}
      var h='<div class="card"><div class="card-head"><div class="card-head-title">장비별 디자인 & 후가공 진행현황</div></div><div class="card-body" style="padding:0 16px 16px"><div class="matrix-wrap"><table class="gl-cert-table"><thead><tr><th style="text-align:left;min-width:140px">장비</th><th>대상국가</th><th style="text-align:center">제품 UI</th><th style="min-width:120px">UI 진행률</th><th style="text-align:center">후가공</th><th style="min-width:120px">후가공 진행률</th></tr></thead><tbody>';
      filtered.forEach(function(d,idx){
        var model=getModel(d.model);
        h+='<tr style="background:'+(idx%2===0?'#fff':'#fafbfc')+'"><td style="text-align:left;font-weight:600;border:1px solid var(--border)"><div>'+(model?model.name:d.model)+'</div><div style="font-size:10px;color:var(--text2);font-weight:400">'+(model?model.category:'')+'</div></td><td style="border:1px solid var(--border)"><div style="display:flex;gap:3px;flex-wrap:wrap;justify-content:center">'+d.countries.map(function(c){var sub=getSub(c);return '<span style="font-size:10px;background:#f3f4f6;color:var(--text2);padding:2px 6px;border-radius:3px">'+(sub?shortName(sub.name):c)+'</span>'}).join('')+'</div></td><td style="text-align:center;border:1px solid var(--border)">'+designBadge(d.uiStatus)+'</td><td style="border:1px solid var(--border)"><div style="display:flex;align-items:center;gap:8px"><div class="gl-prog-bar"><div class="gl-prog-fill ui" style="width:'+d.uiProgress+'%"></div></div><span style="font-size:11px;color:var(--text2);min-width:30px">'+d.uiProgress+'%</span></div></td><td style="text-align:center;border:1px solid var(--border)">'+designBadge(d.postStatus)+'</td><td style="border:1px solid var(--border)"><div style="display:flex;align-items:center;gap:8px"><div class="gl-prog-bar"><div class="gl-prog-fill post" style="width:'+d.postProgress+'%"></div></div><span style="font-size:11px;color:var(--text2);min-width:30px">'+d.postProgress+'%</span></div></td></tr>';
      });
      h+='</tbody></table></div></div></div>';
      ct.innerHTML=h;
    },

    renderSubsidiary: function(ct) {
      var subs=glData.subsidiaries;
      if(glFilterSub!=='전체')subs=subs.filter(function(s){return s.id===glFilterSub});
      var h='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px">';
      subs.forEach(function(sub){
        var sales=glData.salesData.filter(function(s){return s.subsidiary===sub.id});
        var totalRev=sales.reduce(function(a,b){return a+b.revenue},0);
        var totalUnits=sales.reduce(function(a,b){return a+b.units},0);
        var launches=glData.launchPlans.filter(function(lp){return lp.subsidiary===sub.id});
        h+='<div class="gl-sub-card"><div class="gl-sub-header"><div><div class="gl-sub-name">'+sub.name+'</div><div class="gl-sub-region">'+sub.region+' · '+sub.type+'</div></div><span class="gl-sub-type '+(sub.type==='법인'?'corp':'agent')+'">'+sub.type+'</span></div>';
        if(sales.length){
          h+='<div class="gl-sub-revenue"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><div><div class="gl-sub-rev-label">총 매출</div><div class="gl-sub-rev-num">'+(totalRev/1000).toFixed(1)+'B</div></div><div style="text-align:right"><div class="gl-sub-rev-label">판매수량</div><div class="gl-sub-rev-num">'+totalUnits.toLocaleString()+'</div></div></div>';
          sales.forEach(function(s){var model=getModel(s.model);var pct=totalRev?(s.revenue/totalRev)*100:0;h+='<div style="margin-bottom:4px"><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text2);margin-bottom:2px"><span>'+(model?model.name:s.model)+'</span><span>'+(s.revenue/1000).toFixed(1)+'B ('+s.units+'대)</span></div><div class="gl-sub-rev-bar"><div class="gl-sub-rev-fill" style="width:'+pct+'%"></div></div></div>'});
          h+='</div>';
        }
        if(launches.length){
          h+='<div><div style="font-size:11px;color:var(--text2);font-weight:600;margin-bottom:6px">신규 출시 계획</div>';
          launches.forEach(function(lp){var model=getModel(lp.model);var sStyle=lp.status==='진행중'?'background:var(--green-light);color:#065f46':'background:var(--blue-light);color:#2563eb';h+='<div style="padding:7px 10px;background:#f8fafc;border-radius:6px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center"><div><span style="font-size:12px;font-weight:600;color:var(--text)">'+(model?model.name:lp.model)+'</span><span style="font-size:10px;color:var(--text2);margin-left:6px">'+lp.startMonth+'월~'+lp.endMonth+'월</span></div><span class="gl-cert-badge" style="'+sStyle+'">'+lp.status+'</span></div>'});
          h+='</div>';
        }
        if(!sales.length&&!launches.length)h+='<div style="padding:20px;text-align:center;color:var(--text2);font-size:12px">데이터 없음</div>';
        h+='</div>';
      });
      h+='</div>';
      ct.innerHTML=h;
    },

    // ── 업로드 ──
    handleDrop: function(e) { e.preventDefault(); document.getElementById('gl-drop-zone').classList.remove('drag'); var f=e.dataTransfer.files[0]; if(f)this.processFile(f); },
    handleFile: function(e) { var f=e.target.files[0]; if(f)this.processFile(f); },
    processFile: function(file) {
      var pb=document.getElementById('gl-pb'),pf=document.getElementById('gl-pf'),ur=document.getElementById('gl-ur');
      pb.style.display='block';pf.style.width='0%';ur.style.display='none';
      var pct=0,intv=setInterval(function(){pct=Math.min(pct+20,80);pf.style.width=pct+'%'},80);
      var reader=new FileReader();
      reader.onload=function(ev){
        clearInterval(intv);pf.style.width='100%';
        try{
          var wb=XLSX.read(ev.target.result,{type:'array'});
          var parsed=parseGlobalExcel(wb);
          glData=Object.assign(emptyGlData(),parsed);
          saveGlData();
          var counts=[];
          if(parsed.subsidiaries.length)counts.push('법인/대리점 '+parsed.subsidiaries.length+'개');
          if(parsed.models.length)counts.push('장비 모델 '+parsed.models.length+'개');
          if(parsed.launchPlans.length)counts.push('출시 계획 '+parsed.launchPlans.length+'건');
          if(parsed.certMatrix.length)counts.push('인증 현황 '+parsed.certMatrix.length+'건');
          if(parsed.certTypes.length)counts.push('인증 종류 '+parsed.certTypes.length+'개');
          if(parsed.designStatus.length)counts.push('디자인/후가공 '+parsed.designStatus.length+'건');
          if(parsed.salesData.length)counts.push('매출 데이터 '+parsed.salesData.length+'건');
          ur.className='upload-result ok';ur.style.display='block';
          ur.textContent='✅ 업로드 완료 — '+counts.join(', ');
          var pc=document.getElementById('gl-preview-card'),pb2=document.getElementById('gl-preview-body');
          if(pc&&pb2){pc.style.display='block';pb2.innerHTML='<div style="font-size:13px;color:var(--text);line-height:2">'+counts.map(function(c){return '✅ '+c}).join('<br>')+'</div><div style="margin-top:12px"><button onclick="goPage(\'global\',document.getElementById(\'ni-global\'))" class="btn btn-primary">🌐 글로벌 대시보드로 이동</button></div>';}
          mod.updateDataInfo();
          if(typeof showToast==='function')showToast('✅ 글로벌 데이터 업로드 완료!');
        }catch(err){ur.className='upload-result err';ur.style.display='block';ur.textContent='❌ 파일 읽기 실패: '+err.message}
        setTimeout(function(){pb.style.display='none'},600);
      };
      reader.readAsArrayBuffer(file);
    },

    updateDataInfo: function() {
      var el=document.getElementById('gl-data-info');if(!el)return;
      if(!hasData()){el.innerHTML='아직 업로드된 글로벌 데이터가 없습니다.';return}
      el.innerHTML='법인 <b>'+glData.subsidiaries.length+'개</b> · 장비 <b>'+glData.models.length+'개</b> · 출시계획 <b>'+glData.launchPlans.length+'건</b> · 인증 <b>'+glData.certMatrix.length+'건</b>'+(glData.savedAt?'<br>마지막 저장: '+glData.savedAt.slice(0,16).replace('T',' '):'');
    },

    downloadTemplate: function() {
      var wb=XLSX.utils.book_new();
      var s1=XLSX.utils.aoa_to_sheet([['ID','법인명','구분','지역'],['kr','한국 본사','법인','Asia'],['us','미국 법인','법인','Americas'],['sa','사우디 대리점','대리점','Middle East']]);s1['!cols']=[{wch:10},{wch:18},{wch:10},{wch:14}];XLSX.utils.book_append_sheet(wb,s1,'법인_대리점');
      var s2=XLSX.utils.aoa_to_sheet([['모델ID','모델명','카테고리'],['m1','MedScan Pro X1','진단장비'],['m2','TheraWave 300','치료장비']]);s2['!cols']=[{wch:10},{wch:20},{wch:12}];XLSX.utils.book_append_sheet(wb,s2,'장비모델');
      var s3=XLSX.utils.aoa_to_sheet([['모델ID','법인ID','상태','시작월','종료월','인증상태','디자인상태','후가공상태','우선순위'],['m1','sa','진행중',1,6,'시험진행','UI확정','진행중','높음']]);s3['!cols']=Array(9).fill({wch:12});XLSX.utils.book_append_sheet(wb,s3,'출시계획');
      var s4=XLSX.utils.aoa_to_sheet([['모델ID','인증종류ID','상태','날짜'],['m1','kfda','승인완료','2024-06'],['m1','fda','심사중','2026-02']]);s4['!cols']=[{wch:10},{wch:14},{wch:12},{wch:12}];XLSX.utils.book_append_sheet(wb,s4,'인증현황');
      var s5=XLSX.utils.aoa_to_sheet([['인증ID','인증명','대상국가'],['kfda','KFDA','한국'],['fda','FDA 510(k)','미국'],['ce','CE MDR','유럽']]);s5['!cols']=[{wch:10},{wch:14},{wch:12}];XLSX.utils.book_append_sheet(wb,s5,'인증종류');
      var s6=XLSX.utils.aoa_to_sheet([['모델ID','UI상태','UI진행률','후가공상태','후가공진행률','대상국가'],['m1','완료',100,'완료',100,'kr,us,de'],['m1','확정',80,'진행중',60,'sa']]);s6['!cols']=Array(6).fill({wch:14});XLSX.utils.book_append_sheet(wb,s6,'디자인_후가공');
      var s7=XLSX.utils.aoa_to_sheet([['법인ID','모델ID','매출','판매수량'],['kr','m1',8500,320],['us','m1',14200,480]]);s7['!cols']=[{wch:10},{wch:10},{wch:12},{wch:12}];XLSX.utils.book_append_sheet(wb,s7,'매출데이터');
      XLSX.writeFile(wb,'IBS_글로벌출시_템플릿.xlsx');
      if(typeof showToast==='function')showToast('📄 글로벌 출시 템플릿 다운로드');
    },

    loadSampleData: function() {
      glData=getSampleData();saveGlData();this.updateDataInfo();
      if(typeof showToast==='function')showToast('✅ 글로벌 샘플 데이터 불러옴');
      var gp=document.getElementById('page-global');
      if(gp&&gp.classList.contains('active'))this.init();
    },

    clearData: function() {
      if(!confirm('글로벌 출시 데이터를 모두 초기화하시겠습니까?'))return;
      glData=emptyGlData();
      try{localStorage.removeItem(GL_STORAGE_KEY)}catch(e){}
      this.updateDataInfo();
      var gp=document.getElementById('page-global');
      if(gp&&gp.classList.contains('active'))this.init();
      if(typeof showToast==='function')showToast('🗑️ 글로벌 데이터 초기화됨');
    }
  };

  window.IBS_Global = mod;

  // ═══════════════════════════════════════════
  // 10. goPage 확장
  // ═══════════════════════════════════════════
  var origGoPage = window.goPage;
  window.goPage = function (id, el) {
    if (id === 'global') {
      document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active')});
      document.querySelectorAll('.nav-item').forEach(function(n){
        n.classList.remove('active');n.style.background='';n.style.borderLeftColor='transparent';n.style.fontWeight='500';
        n.querySelectorAll('span').forEach(function(s){s.style.color='';s.style.fontWeight='500'});
      });
      document.getElementById('page-global').classList.add('active');
      var activeEl = el || document.getElementById('ni-global');
      if (activeEl) {
        activeEl.classList.add('active');activeEl.style.background='rgba(255,255,255,.15)';activeEl.style.borderLeftColor='#fff';activeEl.style.fontWeight='700';
        activeEl.querySelectorAll('span').forEach(function(s){s.style.color='#fff';s.style.fontWeight='700'});
      }
      document.getElementById('topbar-title').textContent = '글로벌 출시';
      mod.init();
      return;
    }
    origGoPage(id, el);
  };

  // 업로드 탭 주입
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectUploadTab);
  else setTimeout(injectUploadTab, 100);

  console.log('✅ IBS Global Launch patch v2 loaded (data-driven)');
})();
