/*  ============================================================
 *  IBS – 글로벌 출시 & 인증 대시보드 패치
 *  ============================================================
 *  사용법:
 *    index.html 의 </body> 바로 위에 추가:
 *    <script src="global-launch-patch.js"></script>
 *  ============================================================ */

(function () {
  'use strict';

  // ── 1. 사이드바에 "글로벌 출시" 메뉴 추가 ──
  const countryNav = document.getElementById('ni-country');
  const refNode = countryNav || document.getElementById('ni-status');
  if (refNode && !document.getElementById('ni-global')) {
    const el = document.createElement('div');
    el.className = 'nav-item';
    el.id = 'ni-global';
    el.onclick = function () { goPage('global', this); };
    el.innerHTML = '<span class="ni">🌐</span><span>글로벌 출시</span>';
    refNode.parentNode.insertBefore(el, refNode.nextSibling);
  }

  // ── 2. 페이지 권한 ──
  if (window.PAGE_ROLES) PAGE_ROLES.global = ['user', 'manager', 'master'];

  // ── 3. 스타일 주입 ──
  const style = document.createElement('style');
  style.textContent = `
    /* ── Global Launch Dashboard ── */
    .gl-tabs{display:flex;gap:0;border-bottom:2px solid var(--border);margin-bottom:20px}
    .gl-tab{padding:10px 20px;font-size:13px;font-weight:600;color:var(--text2);cursor:pointer;border:none;background:none;font-family:inherit;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .18s;display:flex;align-items:center;gap:6px}
    .gl-tab:hover{color:var(--blue)}
    .gl-tab.active{color:var(--blue);border-bottom-color:var(--blue)}
    .gl-tab .gl-count{background:var(--blue-light);color:var(--blue);padding:1px 7px;border-radius:10px;font-size:11px}
    .gl-tab.active .gl-count{background:var(--blue);color:#fff}

    .gl-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px}
    .gl-sum-card{background:var(--white);border-radius:10px;padding:14px 16px;box-shadow:var(--shadow);border-left:3px solid var(--blue)}
    .gl-sum-card .gl-sv{font-size:22px;font-weight:800;color:var(--text);line-height:1.1}
    .gl-sum-card .gl-sl{font-size:11px;color:var(--text2);margin-top:3px}

    .gl-filter-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center}
    .gl-pill{padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:var(--white);color:var(--text2);transition:all .18s;font-family:inherit}
    .gl-pill:hover{border-color:var(--blue);color:var(--blue)}
    .gl-pill.active{background:var(--blue);color:#fff;border-color:var(--blue)}

    /* Timeline / Gantt */
    .gl-timeline{background:var(--white);border-radius:12px;box-shadow:var(--shadow);overflow:hidden}
    .gl-tl-header{display:grid;grid-template-columns:260px 1fr;border-bottom:1px solid var(--border)}
    .gl-tl-label{padding:10px 16px;font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.5px}
    .gl-tl-months{display:grid;grid-template-columns:repeat(12,1fr)}
    .gl-tl-month{padding:10px 0;font-size:11px;color:var(--text2);text-align:center;font-weight:500;border-left:1px solid #f0f0f5}
    .gl-tl-month.current{color:var(--blue);font-weight:700;background:#f0f4ff;border-bottom:2px solid var(--blue)}

    .gl-tl-row{display:grid;grid-template-columns:260px 1fr;border-bottom:1px solid #f5f5fa;transition:background .15s}
    .gl-tl-row:hover{background:#fafbff}
    .gl-tl-info{padding:12px 16px;display:flex;flex-direction:column;gap:3px}
    .gl-tl-name{font-size:13px;font-weight:700;color:var(--text);display:flex;align-items:center;gap:6px}
    .gl-tl-sub{font-size:11px;color:var(--text2)}
    .gl-tl-tags{display:flex;gap:4px;flex-wrap:wrap;margin-top:2px}
    .gl-tl-tag{font-size:10px;padding:1px 7px;border-radius:4px;background:#f3f4f6;color:var(--text2);font-weight:500}

    .gl-tl-chart{display:grid;grid-template-columns:repeat(12,1fr);align-items:center;position:relative}
    .gl-tl-cell{height:100%;border-left:1px solid #f5f5fa}
    .gl-tl-cell.current{background:#f0f4ff08;border-left:1px dashed var(--blue)}
    .gl-gantt-bar{position:absolute;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:#fff;top:50%;transform:translateY(-50%);box-shadow:0 2px 6px rgba(0,0,0,.12);cursor:default}
    .gl-gantt-bar.active{background:linear-gradient(90deg,#2d6be4,#5b8def)}
    .gl-gantt-bar.planned{background:linear-gradient(90deg,#94a3b8,#b0bec5)}

    /* Priority arrow */
    .gl-prio{font-size:10px;margin-right:2px}
    .gl-prio.high{color:var(--red)}.gl-prio.mid{color:var(--orange)}.gl-prio.low{color:var(--blue)}

    /* Cert Matrix */
    .gl-cert-table{width:100%;border-collapse:separate;border-spacing:0;font-size:12px}
    .gl-cert-table th{background:#f8fafc;color:var(--text2);font-weight:600;padding:9px 10px;text-align:center;border:1px solid var(--border);font-size:11px;position:sticky;top:0;z-index:2}
    .gl-cert-table td{border:1px solid var(--border);padding:7px 8px;text-align:center;vertical-align:middle}
    .gl-cert-table td.gl-model-td{text-align:left;font-weight:600;background:#fafbfc;position:sticky;left:0;z-index:1;min-width:140px}
    .gl-cert-table tr:hover td{background:#fafeff}

    .gl-cert-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:6px;font-size:11px;font-weight:600;white-space:nowrap}
    .gl-cb-none{background:#f3f4f6;color:#9ca3af}
    .gl-cb-doc{background:var(--blue-light);color:#2563eb}
    .gl-cb-test{background:var(--orange-light);color:#b45309}
    .gl-cb-review{background:var(--green-light);color:#047857}
    .gl-cb-fix{background:var(--red-light);color:#dc2626}
    .gl-cb-done{background:#d1fae5;color:#065f46}

    .gl-cert-stat{background:var(--white);border-radius:10px;padding:12px 16px;box-shadow:var(--shadow);text-align:center}
    .gl-cert-stat .gl-cs-num{font-size:20px;font-weight:800}
    .gl-cert-stat .gl-cs-label{font-size:11px;color:var(--text2);margin-top:2px}

    /* Design Progress */
    .gl-prog-bar{width:100%;height:7px;background:#f0f0f5;border-radius:4px;overflow:hidden}
    .gl-prog-fill{height:100%;border-radius:4px;transition:width .6s}
    .gl-prog-fill.ui{background:linear-gradient(90deg,#7c2d3e,#b8648a)}
    .gl-prog-fill.post{background:linear-gradient(90deg,#2e7d6e,#4ec9b0)}

    /* Subsidiary Cards */
    .gl-sub-card{background:var(--white);border-radius:12px;box-shadow:var(--shadow);padding:18px;transition:box-shadow .18s}
    .gl-sub-card:hover{box-shadow:var(--shadow-md)}
    .gl-sub-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
    .gl-sub-name{font-size:15px;font-weight:700;color:var(--text)}
    .gl-sub-region{font-size:11px;color:var(--text2)}
    .gl-sub-type{padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600}
    .gl-sub-type.corp{background:#fdf2f4;color:#7c2d3e;border:1px solid #e8c8ce}
    .gl-sub-type.agent{background:var(--orange-light);color:#92400e;border:1px solid #f5d6a8}
    .gl-sub-revenue{background:#f8fafc;border-radius:8px;padding:12px;margin-bottom:10px}
    .gl-sub-rev-num{font-size:18px;font-weight:800;color:var(--text)}
    .gl-sub-rev-label{font-size:10px;color:var(--text2);margin-bottom:6px}
    .gl-sub-rev-bar{height:4px;background:#f0f0f5;border-radius:4px;overflow:hidden;margin-top:3px}
    .gl-sub-rev-fill{height:100%;border-radius:4px;background:var(--blue)}
  `;
  document.head.appendChild(style);

  // ── 4. 샘플 데이터 ──
  const GL_DATA = {
    subsidiaries: [
      { id:'kr', name:'한국 본사', type:'법인', region:'Asia' },
      { id:'us', name:'미국 법인', type:'법인', region:'Americas' },
      { id:'de', name:'독일 법인', type:'법인', region:'Europe' },
      { id:'jp', name:'일본 법인', type:'법인', region:'Asia' },
      { id:'cn', name:'중국 법인', type:'법인', region:'Asia' },
      { id:'br', name:'브라질 법인', type:'법인', region:'Americas' },
      { id:'in', name:'인도 법인', type:'법인', region:'Asia' },
      { id:'au', name:'호주 법인', type:'법인', region:'Oceania' },
      { id:'sa', name:'사우디 대리점', type:'대리점', region:'Middle East' },
      { id:'th', name:'태국 대리점', type:'대리점', region:'Asia' },
      { id:'vn', name:'베트남 대리점', type:'대리점', region:'Asia' },
      { id:'mx', name:'멕시코 대리점', type:'대리점', region:'Americas' },
      { id:'pl', name:'폴란드 대리점', type:'대리점', region:'Europe' },
      { id:'eg', name:'이집트 대리점', type:'대리점', region:'Africa' },
    ],
    models: [
      { id:'m1', name:'MedScan Pro X1', category:'진단장비' },
      { id:'m2', name:'MedScan Lite S2', category:'진단장비' },
      { id:'m3', name:'TheraWave 300', category:'치료장비' },
      { id:'m4', name:'TheraWave 500', category:'치료장비' },
      { id:'m5', name:'VitaMonitor M1', category:'모니터링' },
      { id:'m6', name:'VitaMonitor M2', category:'모니터링' },
      { id:'m7', name:'SurgiAssist R1', category:'수술장비' },
      { id:'m8', name:'DentaCure Pro', category:'치과장비' },
      { id:'m9', name:'OptiView 200', category:'영상장비' },
      { id:'m10', name:'CardioSync Plus', category:'심장장비' },
    ],
    certTypes: [
      { id:'kfda', name:'KFDA', country:'한국' },
      { id:'fda', name:'FDA 510(k)', country:'미국' },
      { id:'ce', name:'CE MDR', country:'유럽' },
      { id:'pmda', name:'PMDA', country:'일본' },
      { id:'nmpa', name:'NMPA', country:'중국' },
      { id:'anvisa', name:'ANVISA', country:'브라질' },
      { id:'tga', name:'TGA', country:'호주' },
      { id:'cdsco', name:'CDSCO', country:'인도' },
      { id:'sfda', name:'SFDA', country:'사우디' },
      { id:'tfda', name:'Thai FDA', country:'태국' },
    ],
    certStages: ['미착수','서류준비','시험진행','심사중','보완요청','승인완료'],
    launchPlans: [
      { id:'lp1', model:'m1', subsidiary:'sa', status:'진행중', startMonth:1, endMonth:6, certStatus:'시험진행', designStatus:'UI확정', postProcess:'진행중', priority:'높음' },
      { id:'lp2', model:'m3', subsidiary:'vn', status:'계획', startMonth:3, endMonth:9, certStatus:'서류준비', designStatus:'디자인중', postProcess:'미착수', priority:'중간' },
      { id:'lp3', model:'m5', subsidiary:'mx', status:'진행중', startMonth:2, endMonth:7, certStatus:'심사중', designStatus:'UI확정', postProcess:'완료', priority:'높음' },
      { id:'lp4', model:'m2', subsidiary:'eg', status:'계획', startMonth:5, endMonth:12, certStatus:'미착수', designStatus:'미착수', postProcess:'미착수', priority:'낮음' },
      { id:'lp5', model:'m7', subsidiary:'pl', status:'진행중', startMonth:1, endMonth:5, certStatus:'보완요청', designStatus:'수정중', postProcess:'진행중', priority:'높음' },
      { id:'lp6', model:'m4', subsidiary:'in', status:'계획', startMonth:4, endMonth:10, certStatus:'서류준비', designStatus:'디자인중', postProcess:'미착수', priority:'중간' },
      { id:'lp7', model:'m8', subsidiary:'th', status:'진행중', startMonth:2, endMonth:8, certStatus:'시험진행', designStatus:'UI확정', postProcess:'진행중', priority:'중간' },
      { id:'lp8', model:'m10', subsidiary:'br', status:'계획', startMonth:6, endMonth:12, certStatus:'미착수', designStatus:'미착수', postProcess:'미착수', priority:'낮음' },
      { id:'lp9', model:'m9', subsidiary:'au', status:'진행중', startMonth:1, endMonth:4, certStatus:'승인완료', designStatus:'완료', postProcess:'완료', priority:'높음' },
      { id:'lp10', model:'m6', subsidiary:'jp', status:'진행중', startMonth:3, endMonth:8, certStatus:'심사중', designStatus:'UI확정', postProcess:'진행중', priority:'높음' },
    ],
    certMatrix: [
      { model:'m1', cert:'kfda', status:'승인완료', date:'2024-06' },
      { model:'m1', cert:'fda', status:'승인완료', date:'2025-01' },
      { model:'m1', cert:'ce', status:'승인완료', date:'2025-03' },
      { model:'m1', cert:'pmda', status:'심사중', date:'2026-02' },
      { model:'m1', cert:'sfda', status:'시험진행', date:'2026-04' },
      { model:'m2', cert:'kfda', status:'승인완료', date:'2024-09' },
      { model:'m2', cert:'fda', status:'심사중', date:'2025-12' },
      { model:'m2', cert:'ce', status:'미착수', date:'' },
      { model:'m3', cert:'kfda', status:'승인완료', date:'2023-11' },
      { model:'m3', cert:'fda', status:'승인완료', date:'2024-08' },
      { model:'m3', cert:'ce', status:'승인완료', date:'2025-01' },
      { model:'m3', cert:'pmda', status:'승인완료', date:'2025-06' },
      { model:'m3', cert:'nmpa', status:'시험진행', date:'2026-01' },
      { model:'m3', cert:'tfda', status:'서류준비', date:'2026-03' },
      { model:'m4', cert:'kfda', status:'승인완료', date:'2025-02' },
      { model:'m4', cert:'fda', status:'서류준비', date:'2026-01' },
      { model:'m4', cert:'cdsco', status:'서류준비', date:'2026-04' },
      { model:'m5', cert:'kfda', status:'승인완료', date:'2024-03' },
      { model:'m5', cert:'fda', status:'심사중', date:'2025-10' },
      { model:'m5', cert:'ce', status:'승인완료', date:'2025-05' },
      { model:'m6', cert:'kfda', status:'승인완료', date:'2025-01' },
      { model:'m6', cert:'pmda', status:'심사중', date:'2026-03' },
      { model:'m7', cert:'kfda', status:'승인완료', date:'2024-07' },
      { model:'m7', cert:'ce', status:'보완요청', date:'2026-01' },
      { model:'m8', cert:'kfda', status:'승인완료', date:'2024-12' },
      { model:'m8', cert:'tfda', status:'시험진행', date:'2026-02' },
      { model:'m9', cert:'kfda', status:'승인완료', date:'2023-08' },
      { model:'m9', cert:'fda', status:'승인완료', date:'2024-05' },
      { model:'m9', cert:'ce', status:'승인완료', date:'2024-11' },
      { model:'m9', cert:'tga', status:'승인완료', date:'2026-01' },
      { model:'m10', cert:'kfda', status:'승인완료', date:'2025-04' },
      { model:'m10', cert:'anvisa', status:'미착수', date:'' },
    ],
    designStatus: [
      { model:'m1', uiStatus:'완료', uiProgress:100, postStatus:'완료', postProgress:100, countries:['kr','us','de','jp'] },
      { model:'m1', uiStatus:'확정', uiProgress:80, postStatus:'진행중', postProgress:60, countries:['sa'] },
      { model:'m2', uiStatus:'완료', uiProgress:100, postStatus:'완료', postProgress:100, countries:['kr'] },
      { model:'m3', uiStatus:'완료', uiProgress:100, postStatus:'완료', postProgress:100, countries:['kr','us','de','jp'] },
      { model:'m3', uiStatus:'디자인중', uiProgress:45, postStatus:'미착수', postProgress:0, countries:['vn'] },
      { model:'m4', uiStatus:'완료', uiProgress:100, postStatus:'완료', postProgress:100, countries:['kr'] },
      { model:'m4', uiStatus:'디자인중', uiProgress:30, postStatus:'미착수', postProgress:0, countries:['in'] },
      { model:'m5', uiStatus:'완료', uiProgress:100, postStatus:'완료', postProgress:100, countries:['kr','de'] },
      { model:'m5', uiStatus:'확정', uiProgress:85, postStatus:'완료', postProgress:100, countries:['mx'] },
      { model:'m6', uiStatus:'완료', uiProgress:100, postStatus:'완료', postProgress:100, countries:['kr'] },
      { model:'m6', uiStatus:'확정', uiProgress:75, postStatus:'진행중', postProgress:50, countries:['jp'] },
      { model:'m7', uiStatus:'완료', uiProgress:100, postStatus:'완료', postProgress:100, countries:['kr'] },
      { model:'m7', uiStatus:'수정중', uiProgress:60, postStatus:'진행중', postProgress:40, countries:['pl'] },
      { model:'m8', uiStatus:'완료', uiProgress:100, postStatus:'완료', postProgress:100, countries:['kr'] },
      { model:'m8', uiStatus:'확정', uiProgress:80, postStatus:'진행중', postProgress:55, countries:['th'] },
      { model:'m9', uiStatus:'완료', uiProgress:100, postStatus:'완료', postProgress:100, countries:['kr','us','de','au'] },
      { model:'m10', uiStatus:'완료', uiProgress:100, postStatus:'완료', postProgress:100, countries:['kr'] },
    ],
    salesData: [
      { subsidiary:'kr', model:'m1', revenue:8500, units:320 },
      { subsidiary:'kr', model:'m3', revenue:12000, units:180 },
      { subsidiary:'kr', model:'m5', revenue:4200, units:560 },
      { subsidiary:'kr', model:'m7', revenue:15000, units:85 },
      { subsidiary:'kr', model:'m9', revenue:6800, units:210 },
      { subsidiary:'us', model:'m1', revenue:14200, units:480 },
      { subsidiary:'us', model:'m3', revenue:18500, units:220 },
      { subsidiary:'us', model:'m9', revenue:9600, units:310 },
      { subsidiary:'de', model:'m1', revenue:7800, units:260 },
      { subsidiary:'de', model:'m3', revenue:9200, units:140 },
      { subsidiary:'de', model:'m5', revenue:3100, units:420 },
      { subsidiary:'jp', model:'m1', revenue:11000, units:390 },
      { subsidiary:'jp', model:'m3', revenue:13500, units:195 },
      { subsidiary:'cn', model:'m3', revenue:16000, units:350 },
      { subsidiary:'br', model:'m3', revenue:5400, units:95 },
      { subsidiary:'in', model:'m1', revenue:3200, units:180 },
      { subsidiary:'au', model:'m9', revenue:4500, units:150 },
      { subsidiary:'au', model:'m1', revenue:3800, units:130 },
    ]
  };

  // Helpers
  const D = GL_DATA;
  const getModel = (id) => D.models.find(m => m.id === id);
  const getSub = (id) => D.subsidiaries.find(s => s.id === id);
  const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const CURRENT_MONTH = 3; // April (0-indexed)

  const certBadgeClass = (status) => {
    const map = {'미착수':'gl-cb-none','서류준비':'gl-cb-doc','시험진행':'gl-cb-test','심사중':'gl-cb-review','보완요청':'gl-cb-fix','승인완료':'gl-cb-done'};
    return map[status] || 'gl-cb-none';
  };
  const prioInfo = (p) => {
    if (p === '높음') return { cls:'high', icon:'▲' };
    if (p === '중간') return { cls:'mid', icon:'●' };
    return { cls:'low', icon:'▽' };
  };
  const designBadgeHtml = (status) => {
    const map = {
      '미착수':  { bg:'#f3f4f6', color:'#9ca3af' },
      '디자인중': { bg:'var(--orange-light)', color:'#b45309' },
      'UI확정':  { bg:'var(--green-light)', color:'#047857' },
      '확정':    { bg:'var(--green-light)', color:'#047857' },
      '수정중':  { bg:'var(--red-light)', color:'#dc2626' },
      '진행중':  { bg:'var(--orange-light)', color:'#b45309' },
      '완료':    { bg:'#d1fae5', color:'#065f46' },
    };
    const s = map[status] || map['미착수'];
    return `<span class="gl-cert-badge" style="background:${s.bg};color:${s.color}">${status}</span>`;
  };
  const shortName = (name) => name.replace(/ (법인|대리점)/, '');

  // ── 5. 페이지 HTML 생성 ──
  const content = document.querySelector('.content');
  if (content && !document.getElementById('page-global')) {
    const page = document.createElement('div');
    page.className = 'page';
    page.id = 'page-global';
    page.innerHTML = `
      <div class="ph"><h1>Global Launch</h1><p>글로벌 출시 & 인증 통합 대시보드 │ 2026</p></div>

      <!-- 법인 필터 -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
        <div class="gl-filter-row" id="gl-sub-filter" style="margin-bottom:0"></div>
        <select class="fsel" id="gl-sub-select" onchange="IBS_Global.onSubChange()" style="min-width:180px">
          <option value="전체">전체 법인/대리점</option>
        </select>
      </div>

      <!-- Summary Cards -->
      <div class="gl-summary" id="gl-summary"></div>

      <!-- Tabs -->
      <div class="gl-tabs" id="gl-tabs"></div>

      <!-- Tab Contents -->
      <div id="gl-tab-content"></div>
    `;
    // 검색 페이지 앞에 삽입
    const searchPage = document.getElementById('page-search');
    if (searchPage) content.insertBefore(page, searchPage);
    else content.appendChild(page);
  }

  // ── 6. 모듈 ──
  let glActiveTab = 0;
  let glFilterSub = '전체';

  const mod = {
    init() {
      // 법인 select 채우기
      const sel = document.getElementById('gl-sub-select');
      if (sel) {
        sel.innerHTML = '<option value="전체">전체 법인/대리점</option>' +
          D.subsidiaries.map(s => `<option value="${s.id}">${s.name} (${s.type})</option>`).join('');
      }
      this.renderSummary();
      this.renderTabs();
      this.renderContent();
    },

    onSubChange() {
      glFilterSub = document.getElementById('gl-sub-select').value;
      this.renderSummary();
      this.renderContent();
    },

    setTab(idx) {
      glActiveTab = idx;
      this.renderTabs();
      this.renderContent();
    },

    renderSummary() {
      const el = document.getElementById('gl-summary');
      if (!el) return;
      const activeLP = D.launchPlans.filter(l => l.status === '진행중').length;
      const certInProg = D.certMatrix.filter(c => c.status === '심사중' || c.status === '시험진행').length;
      const certDone = D.certMatrix.filter(c => c.status === '승인완료').length;
      const certFix = D.certMatrix.filter(c => c.status === '보완요청').length;
      const corps = D.subsidiaries.filter(s => s.type === '법인').length;
      const agents = D.subsidiaries.filter(s => s.type === '대리점').length;
      const cards = [
        { label:'진행중 출시', value:activeLP, color:'var(--blue)' },
        { label:'인증 심사중', value:certInProg, color:'var(--orange)' },
        { label:'인증 완료', value:certDone, color:'var(--green)' },
        { label:'보완 필요', value:certFix, color:'var(--red)' },
        { label:'관리 법인', value:corps, color:'#7c2d3e' },
        { label:'관리 대리점', value:agents, color:'var(--purple)' },
      ];
      el.innerHTML = cards.map(c => `
        <div class="gl-sum-card" style="border-left-color:${c.color}">
          <div class="gl-sv" style="color:${c.color}">${c.value}</div>
          <div class="gl-sl">${c.label}</div>
        </div>
      `).join('');
    },

    renderTabs() {
      const tabs = [
        { name:'신규 출시 계획', icon:'🚀', count:D.launchPlans.length },
        { name:'인증 현황', icon:'📋', count:D.certMatrix.length },
        { name:'디자인/후가공', icon:'🎨', count:D.designStatus.length },
        { name:'법인/국가 현황', icon:'🏢', count:D.subsidiaries.length },
      ];
      const el = document.getElementById('gl-tabs');
      if (!el) return;
      el.innerHTML = tabs.map((t, i) => `
        <button class="gl-tab${i === glActiveTab ? ' active' : ''}" onclick="IBS_Global.setTab(${i})">
          <span>${t.icon}</span> ${t.name} <span class="gl-count">${t.count}</span>
        </button>
      `).join('');
    },

    renderContent() {
      const el = document.getElementById('gl-tab-content');
      if (!el) return;
      if (glActiveTab === 0) this.renderLaunch(el);
      else if (glActiveTab === 1) this.renderCert(el);
      else if (glActiveTab === 2) this.renderDesign(el);
      else this.renderSubsidiary(el);
    },

    // ── Tab 1: Launch Timeline ──
    renderLaunch(container) {
      let plans = D.launchPlans;
      if (glFilterSub !== '전체') plans = plans.filter(p => p.subsidiary === glFilterSub);

      // Filters
      let h = `<div class="gl-filter-row" style="margin-bottom:14px">
        <span style="font-size:11px;color:var(--text2);margin-right:4px">상태:</span>
        <button class="gl-pill active" onclick="IBS_Global._launchFilter('전체',this)">전체</button>
        <button class="gl-pill" onclick="IBS_Global._launchFilter('진행중',this)">진행중</button>
        <button class="gl-pill" onclick="IBS_Global._launchFilter('계획',this)">계획</button>
        <span style="width:1px;height:20px;background:var(--border);margin:0 6px"></span>
        <span style="font-size:11px;color:var(--text2);margin-right:4px">우선순위:</span>
        <button class="gl-pill active" onclick="IBS_Global._launchPrio('전체',this)">전체</button>
        <button class="gl-pill" onclick="IBS_Global._launchPrio('높음',this)"><span class="gl-prio high">▲</span>높음</button>
        <button class="gl-pill" onclick="IBS_Global._launchPrio('중간',this)"><span class="gl-prio mid">●</span>중간</button>
        <button class="gl-pill" onclick="IBS_Global._launchPrio('낮음',this)"><span class="gl-prio low">▽</span>낮음</button>
      </div>`;

      // Timeline
      h += `<div class="gl-timeline">`;
      // Header
      h += `<div class="gl-tl-header">
        <div class="gl-tl-label">프로젝트</div>
        <div class="gl-tl-months">
          ${MONTHS.map((m, i) => `<div class="gl-tl-month${i === CURRENT_MONTH ? ' current' : ''}">${m}</div>`).join('')}
        </div>
      </div>`;

      // Rows
      plans.forEach(lp => {
        const model = getModel(lp.model);
        const sub = getSub(lp.subsidiary);
        const pi = prioInfo(lp.priority);
        h += `<div class="gl-tl-row" data-status="${lp.status}" data-prio="${lp.priority}">
          <div class="gl-tl-info">
            <div class="gl-tl-name">
              <span class="gl-prio ${pi.cls}">${pi.icon}</span>
              ${model ? model.name : lp.model}
            </div>
            <div class="gl-tl-sub">${sub ? sub.name : lp.subsidiary}</div>
            <div class="gl-tl-tags">
              <span class="gl-tl-tag">인증: ${lp.certStatus}</span>
              <span class="gl-tl-tag">UI: ${lp.designStatus}</span>
              <span class="gl-tl-tag">후가공: ${lp.postProcess}</span>
            </div>
          </div>
          <div class="gl-tl-chart">
            ${MONTHS.map((_, i) => `<div class="gl-tl-cell${i === CURRENT_MONTH ? ' current' : ''}"></div>`).join('')}
            <div class="gl-gantt-bar ${lp.status === '진행중' ? 'active' : 'planned'}"
              style="left:${((lp.startMonth - 1) / 12) * 100}%;width:${((lp.endMonth - lp.startMonth + 1) / 12) * 100}%">
              ${lp.startMonth}월~${lp.endMonth}월
            </div>
          </div>
        </div>`;
      });

      if (!plans.length) {
        h += `<div style="padding:40px;text-align:center;color:var(--text2)">해당 조건의 출시 계획이 없습니다</div>`;
      }

      h += `</div>`; // .gl-timeline

      // Legend
      h += `<div style="display:flex;gap:16px;margin-top:12px;padding:10px 14px;background:var(--white);border-radius:8px;box-shadow:var(--shadow)">
        <span style="font-size:11px;color:var(--text2)">범례:</span>
        <span style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--text2)">
          <span style="width:20px;height:8px;border-radius:3px;background:linear-gradient(90deg,#2d6be4,#5b8def)"></span> 진행중
        </span>
        <span style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--text2)">
          <span style="width:20px;height:8px;border-radius:3px;background:linear-gradient(90deg,#94a3b8,#b0bec5)"></span> 계획
        </span>
        <span style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--text2)">
          <span style="width:1px;height:14px;border-left:1px dashed var(--blue)"></span> 현재 (4월)
        </span>
      </div>`;

      container.innerHTML = h;
    },

    _launchFilter(val, btn) {
      const parent = btn.parentElement;
      // 상태 필터만 (앞 4개 버튼)
      const statusBtns = [parent.children[1], parent.children[2], parent.children[3]];
      statusBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.gl-tl-row').forEach(row => {
        const match = val === '전체' || row.dataset.status === val;
        const prioMatch = !row.dataset._prioHidden;
        row.style.display = match ? '' : 'none';
      });
    },

    _launchPrio(val, btn) {
      const parent = btn.parentElement;
      const prioBtns = [parent.children[6], parent.children[7], parent.children[8], parent.children[9]];
      prioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.gl-tl-row').forEach(row => {
        const match = val === '전체' || row.dataset.prio === val;
        row.style.display = match ? '' : 'none';
      });
    },

    // ── Tab 2: Certification Matrix ──
    renderCert(container) {
      let h = '';

      // Filter by model
      h += `<div class="gl-filter-row" style="margin-bottom:14px">
        <span style="font-size:11px;color:var(--text2);margin-right:4px">모델:</span>
        <button class="gl-pill active" onclick="IBS_Global._certModelFilter('전체',this)">전체</button>
        ${D.models.map(m => `<button class="gl-pill" onclick="IBS_Global._certModelFilter('${m.id}',this)">${m.name}</button>`).join('')}
      </div>`;

      // Matrix Table
      h += `<div class="card"><div class="card-body" style="padding:0 16px 16px"><div class="matrix-wrap">
        <table class="gl-cert-table">
          <thead><tr>
            <th style="text-align:left;position:sticky;left:0;background:#f8fafc;z-index:2;min-width:140px">장비</th>
            ${D.certTypes.map(ct => `<th style="min-width:90px"><div>${ct.name}</div><div style="font-size:9px;color:#999;font-weight:400">${ct.country}</div></th>`).join('')}
          </tr></thead>
          <tbody>`;

      D.models.forEach((model, idx) => {
        h += `<tr data-model="${model.id}">
          <td class="gl-model-td" style="text-align:left;font-weight:600;background:${idx % 2 === 0 ? '#fff' : '#fafbfc'};position:sticky;left:0;z-index:1;border:1px solid var(--border)">
            <div>${model.name}</div>
            <div style="font-size:10px;color:var(--text2);font-weight:400">${model.category}</div>
          </td>`;
        D.certTypes.forEach(ct => {
          const entry = D.certMatrix.find(c => c.model === model.id && c.cert === ct.id);
          if (!entry) {
            h += `<td style="color:#ddd">—</td>`;
          } else {
            h += `<td>
              <span class="gl-cert-badge ${certBadgeClass(entry.status)}">${entry.status}</span>
              ${entry.date ? `<div style="font-size:9px;color:#999;margin-top:2px">${entry.date}</div>` : ''}
            </td>`;
          }
        });
        h += `</tr>`;
      });

      h += `</tbody></table></div></div></div>`;

      // Summary Stats
      h += `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;margin-top:16px">`;
      D.certStages.forEach(stage => {
        const count = D.certMatrix.filter(c => c.status === stage).length;
        h += `<div class="gl-cert-stat">
          <div class="gl-cs-num" style="color:${certBadgeClass(stage).replace('gl-cb-','') === 'done' ? '#065f46' : 'var(--text)'}">${count}</div>
          <div class="gl-cs-label">${stage}</div>
        </div>`;
      });
      h += `</div>`;

      container.innerHTML = h;
    },

    _certModelFilter(val, btn) {
      btn.parentElement.querySelectorAll('.gl-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.gl-cert-table tbody tr').forEach(row => {
        row.style.display = (val === '전체' || row.dataset.model === val) ? '' : 'none';
      });
    },

    // ── Tab 3: Design Status ──
    renderDesign(container) {
      let filtered = D.designStatus;
      if (glFilterSub !== '전체') filtered = filtered.filter(d => d.countries.includes(glFilterSub));

      let h = `<div class="card"><div class="card-head"><div class="card-head-title">장비별 디자인 & 후가공 진행현황</div></div>
        <div class="card-body" style="padding:0 16px 16px"><div class="matrix-wrap">
        <table class="gl-cert-table">
          <thead><tr>
            <th style="text-align:left;min-width:140px">장비</th>
            <th>대상국가</th>
            <th style="text-align:center">제품 UI</th>
            <th style="min-width:120px">UI 진행률</th>
            <th style="text-align:center">후가공</th>
            <th style="min-width:120px">후가공 진행률</th>
          </tr></thead><tbody>`;

      filtered.forEach((d, idx) => {
        const model = getModel(d.model);
        h += `<tr style="background:${idx % 2 === 0 ? '#fff' : '#fafbfc'}">
          <td style="text-align:left;font-weight:600;border:1px solid var(--border)">
            <div>${model ? model.name : d.model}</div>
            <div style="font-size:10px;color:var(--text2);font-weight:400">${model ? model.category : ''}</div>
          </td>
          <td style="border:1px solid var(--border)">
            <div style="display:flex;gap:3px;flex-wrap:wrap;justify-content:center">
              ${d.countries.map(c => {
                const sub = getSub(c);
                return `<span style="font-size:10px;background:#f3f4f6;color:var(--text2);padding:2px 6px;border-radius:3px">${sub ? shortName(sub.name) : c}</span>`;
              }).join('')}
            </div>
          </td>
          <td style="text-align:center;border:1px solid var(--border)">${designBadgeHtml(d.uiStatus)}</td>
          <td style="border:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:8px">
              <div class="gl-prog-bar"><div class="gl-prog-fill ui" style="width:${d.uiProgress}%"></div></div>
              <span style="font-size:11px;color:var(--text2);min-width:30px">${d.uiProgress}%</span>
            </div>
          </td>
          <td style="text-align:center;border:1px solid var(--border)">${designBadgeHtml(d.postStatus)}</td>
          <td style="border:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:8px">
              <div class="gl-prog-bar"><div class="gl-prog-fill post" style="width:${d.postProgress}%"></div></div>
              <span style="font-size:11px;color:var(--text2);min-width:30px">${d.postProgress}%</span>
            </div>
          </td>
        </tr>`;
      });

      h += `</tbody></table></div></div></div>`;

      if (!filtered.length) {
        h = `<div class="card"><div class="card-body"><div class="empty">해당 조건의 디자인 현황이 없습니다</div></div></div>`;
      }

      container.innerHTML = h;
    },

    // ── Tab 4: Subsidiary Overview ──
    renderSubsidiary(container) {
      let subs = D.subsidiaries;
      if (glFilterSub !== '전체') subs = subs.filter(s => s.id === glFilterSub);

      let h = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px">`;

      subs.forEach(sub => {
        const sales = D.salesData.filter(s => s.subsidiary === sub.id);
        const totalRevenue = sales.reduce((a, b) => a + b.revenue, 0);
        const totalUnits = sales.reduce((a, b) => a + b.units, 0);
        const launches = D.launchPlans.filter(lp => lp.subsidiary === sub.id);

        h += `<div class="gl-sub-card">
          <div class="gl-sub-header">
            <div>
              <div class="gl-sub-name">${sub.name}</div>
              <div class="gl-sub-region">${sub.region} · ${sub.type}</div>
            </div>
            <span class="gl-sub-type ${sub.type === '법인' ? 'corp' : 'agent'}">${sub.type}</span>
          </div>`;

        if (sales.length) {
          h += `<div class="gl-sub-revenue">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <div><div class="gl-sub-rev-label">총 매출</div><div class="gl-sub-rev-num">${(totalRevenue / 1000).toFixed(1)}B</div></div>
              <div style="text-align:right"><div class="gl-sub-rev-label">판매수량</div><div class="gl-sub-rev-num">${totalUnits.toLocaleString()}</div></div>
            </div>`;
          sales.forEach(s => {
            const model = getModel(s.model);
            const pct = (s.revenue / totalRevenue) * 100;
            h += `<div style="margin-bottom:4px">
              <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text2);margin-bottom:2px">
                <span>${model ? model.name : s.model}</span>
                <span>${(s.revenue / 1000).toFixed(1)}B (${s.units}대)</span>
              </div>
              <div class="gl-sub-rev-bar"><div class="gl-sub-rev-fill" style="width:${pct}%"></div></div>
            </div>`;
          });
          h += `</div>`;
        }

        if (launches.length) {
          h += `<div><div style="font-size:11px;color:var(--text2);font-weight:600;margin-bottom:6px">신규 출시 계획</div>`;
          launches.forEach(lp => {
            const model = getModel(lp.model);
            const statusStyle = lp.status === '진행중'
              ? 'background:var(--green-light);color:#065f46'
              : 'background:var(--blue-light);color:#2563eb';
            h += `<div style="padding:7px 10px;background:#f8fafc;border-radius:6px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">
              <div>
                <span style="font-size:12px;font-weight:600;color:var(--text)">${model ? model.name : lp.model}</span>
                <span style="font-size:10px;color:var(--text2);margin-left:6px">${lp.startMonth}월~${lp.endMonth}월</span>
              </div>
              <span class="gl-cert-badge" style="${statusStyle}">${lp.status}</span>
            </div>`;
          });
          h += `</div>`;
        }

        if (!sales.length && !launches.length) {
          h += `<div style="padding:20px;text-align:center;color:var(--text2);font-size:12px">데이터 없음</div>`;
        }

        h += `</div>`; // .gl-sub-card
      });

      h += `</div>`;
      container.innerHTML = h;
    }
  };

  window.IBS_Global = mod;

  // ── 7. goPage 확장 ──
  const origGoPage = window.goPage;
  window.goPage = function (id, el) {
    if (id === 'global') {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.remove('active');
        n.style.background = '';
        n.style.borderLeftColor = 'transparent';
        n.style.fontWeight = '500';
        n.querySelectorAll('span').forEach(s => { s.style.color = ''; s.style.fontWeight = '500'; });
      });
      document.getElementById('page-global').classList.add('active');
      const activeEl = el || document.getElementById('ni-global');
      if (activeEl) {
        activeEl.classList.add('active');
        activeEl.style.background = 'rgba(255,255,255,.15)';
        activeEl.style.borderLeftColor = '#fff';
        activeEl.style.fontWeight = '700';
        activeEl.querySelectorAll('span').forEach(s => { s.style.color = '#fff'; s.style.fontWeight = '700'; });
      }
      document.getElementById('topbar-title').textContent = '글로벌 출시';
      const pageEl = document.getElementById('page-global');
      const h1 = pageEl.querySelector('.ph h1');
      const p = pageEl.querySelector('.ph p');
      if (h1) h1.textContent = 'Global Launch';
      if (p) p.textContent = '글로벌 출시 & 인증 통합 대시보드 │ 2026';
      mod.init();
      return;
    }
    origGoPage(id, el);
  };

  console.log('✅ IBS Global Launch patch loaded');
})();
