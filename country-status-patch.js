/**
 * IBS 국가별 현황 패치
 * 
 * 사용법: index.html의 </body> 직전에 추가
 * <script src="country-status-patch.js"></script>
 */

(function(){

  // ── 1. 사이드바에 "국가별 현황" 메뉴 추가 ──
  const statusNav = document.getElementById('ni-status');
  if(statusNav && !document.getElementById('ni-country')){
    const countryNav = document.createElement('div');
    countryNav.className = 'nav-item';
    countryNav.id = 'ni-country';
    countryNav.onclick = function(){ goPage('country', this); };
    countryNav.innerHTML = '<span class="ni">🌍</span><span>국가별 현황</span>';
    statusNav.parentNode.insertBefore(countryNav, statusNav.nextSibling);
  }

  // ── 2. 국가별 현황 페이지 HTML 생성 ──
  const content = document.querySelector('.content');
  if(content && !document.getElementById('page-country')){
    const page = document.createElement('div');
    page.className = 'page';
    page.id = 'page-country';
    page.innerHTML = `
      <div class="ph"><h1>Country Status</h1><p>국가별 현황</p></div>

      <!-- 법인/대리점 매핑 관리 (Master만) -->
      <div id="corp-mapping-section" style="display:none;margin-bottom:18px">
        <div class="card">
          <div class="card-head">
            <div class="card-head-title">🏢 법인/대리점 매핑 관리</div>
            <button class="btn btn-sm btn-edit" onclick="IBS_Country.toggleMappingEdit()">수정</button>
          </div>
          <div class="card-body" id="corp-mapping-body">
            <div id="corp-mapping-view"></div>
            <div id="corp-mapping-edit" style="display:none">
              <div style="font-size:12px;color:var(--text2);margin-bottom:10px">각 국가에 법인/대리점명을 입력하세요. 비워두면 국가명만 표시됩니다.</div>
              <div id="corp-mapping-fields"></div>
              <div style="margin-top:12px;display:flex;gap:8px">
                <button class="btn btn-primary btn-sm" onclick="IBS_Country.saveMappings()">저장</button>
                <button class="btn btn-secondary btn-sm" onclick="IBS_Country.toggleMappingEdit()">취소</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 국가 선택 카드 그리드 -->
      <div id="country-cards" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;margin-bottom:24px"></div>

      <!-- 선택된 국가 상세 -->
      <div id="country-detail" style="display:none">
        <!-- 국가 헤더 -->
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
          <button class="btn btn-secondary btn-sm" onclick="IBS_Country.backToList()" style="padding:6px 12px">← 전체 국가</button>
          <div>
            <div id="cd-title" style="font-size:20px;font-weight:800;color:#7c2d3e"></div>
            <div id="cd-corp" style="font-size:12px;color:var(--text2);margin-top:2px"></div>
          </div>
          <div id="cd-summary" style="margin-left:auto;display:flex;gap:12px"></div>
        </div>

        <!-- 파트 필터 탭 -->
        <div class="wtype-tabs" id="cd-part-tabs" style="margin-bottom:16px"></div>

        <!-- 장비별 완료율 바 -->
        <div class="card" style="margin-bottom:18px">
          <div class="card-head"><div class="card-head-title">장비별 이관 완료율</div></div>
          <div class="card-body" id="cd-completion-bars"></div>
        </div>

        <!-- 장비 × 작업유형 매트릭스 -->
        <div class="card" style="margin-bottom:18px">
          <div class="card-head">
            <div class="card-head-title">작업유형별 상태</div>
            <select class="fsel" id="cd-type-filter" onchange="IBS_Country.renderDetail()">
              <option value="">전체 유형</option>
            </select>
          </div>
          <div class="card-body" style="padding:0">
            <div class="matrix-wrap" id="cd-matrix" style="padding:0 16px 16px"></div>
          </div>
        </div>

        <!-- 기한 D-day -->
        <div class="card" id="cd-deadline-card" style="display:none">
          <div class="card-head"><div class="card-head-title">⏰ 기한 현황</div></div>
          <div class="card-body" id="cd-deadlines"></div>
        </div>
      </div>
    `;
    // 검색 페이지 앞에 삽입
    const searchPage = document.getElementById('page-search');
    if(searchPage) content.insertBefore(page, searchPage);
    else content.appendChild(page);
  }

  // ── 3. PAGE_ROLES에 country 추가 ──
  if(window.PAGE_ROLES) PAGE_ROLES.country = ['user','manager','master'];

  // ── 4. 법인/대리점 매핑 데이터 ──
  let corpMappings = {}; // { '한국': '본사', '일본': 'InBody Japan', ... }
  let selectedCountry = null;
  let cdPartFilter = '전체';
  let mappingEditMode = false;

  // localStorage에서 매핑 복원
  try {
    const saved = localStorage.getItem('ibs_corp_mappings');
    if(saved) corpMappings = JSON.parse(saved);
  } catch(e){}

  // ── 5. 핵심 함수들 ──
  const mod = {

    // 모든 국가 목록 추출
    getCountries: function(){
      const countries = {};
      allEntries().forEach(e => {
        const m = e.product.match(/^(.+?)\s*\((.+?)\)$/);
        const country = m ? m[2] : null;
        if(!country) return;
        if(!countries[country]) countries[country] = { total:0, done:0, inprog:0, none:0, parts:new Set(), equipments:new Set() };
        countries[country].total++;
        if(e.status === 'done') countries[country].done++;
        else if(e.status === 'inprog') countries[country].inprog++;
        else if(e.status === 'none') countries[country].none++;
        countries[country].parts.add(e.part);
        const base = m ? m[1] : e.product;
        countries[country].equipments.add(base);
      });
      return countries;
    },

    // 국가 카드 그리드 렌더링
    renderCountryCards: function(){
      const countries = this.getCountries();
      const el = document.getElementById('country-cards');
      if(!el) return;

      const sorted = Object.entries(countries).sort((a,b) => b[1].total - a[1].total);

      if(!sorted.length){
        el.innerHTML = '<div class="empty" style="grid-column:1/-1">데이터가 없습니다. 데이터 업로드 후 확인하세요.</div>';
        return;
      }

      el.innerHTML = sorted.map(([country, info]) => {
        const pct = info.total ? Math.round(info.done / info.total * 100) : 0;
        const corp = corpMappings[country] || '';
        const barColor = pct === 100 ? '#2e7d6e' : pct >= 50 ? '#2d6be4' : '#c97a2a';
        
        return `<div onclick="IBS_Country.selectCountry('${country}')" style="
          background:#fff;border-radius:12px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,.08);
          cursor:pointer;transition:all .2s;border:2px solid transparent;
        " onmouseover="this.style.borderColor='#2d6be4';this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 16px rgba(0,0,0,.1)'"
           onmouseout="this.style.borderColor='transparent';this.style.transform='';this.style.boxShadow='0 1px 4px rgba(0,0,0,.08)'">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <div>
              <div style="font-size:15px;font-weight:700;color:#1a1f2e">${country}</div>
              ${corp ? `<div style="font-size:11px;color:#6b7280;margin-top:1px">${corp}</div>` : ''}
            </div>
            <div style="font-size:20px;font-weight:800;color:${barColor}">${pct}%</div>
          </div>
          <div style="background:#f3f4f6;border-radius:99px;height:6px;overflow:hidden;margin-bottom:10px">
            <div style="height:100%;border-radius:99px;background:${barColor};width:${pct}%;transition:width .6s"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#6b7280">
            <span>장비 ${info.equipments.size}종</span>
            <span>✅${info.done} 🔄${info.inprog} ⏳${info.none}</span>
          </div>
          <div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap">
            ${[...info.parts].map(p => `<span style="font-size:10px;background:#f3f4f6;padding:1px 6px;border-radius:4px;color:#6b7280">${p}</span>`).join('')}
          </div>
        </div>`;
      }).join('');

      // Master면 매핑 관리 보이기
      const mappingSection = document.getElementById('corp-mapping-section');
      if(mappingSection) mappingSection.style.display = (typeof role !== 'undefined' && role === 'master') ? 'block' : 'none';
      this.renderMappingView();
    },

    // 국가 선택 → 상세 뷰
    selectCountry: function(country){
      selectedCountry = country;
      cdPartFilter = '전체';
      document.getElementById('country-cards').style.display = 'none';
      const mappingSection = document.getElementById('corp-mapping-section');
      if(mappingSection) mappingSection.style.display = 'none';
      document.getElementById('country-detail').style.display = 'block';

      // 헤더
      document.getElementById('cd-title').textContent = country;
      const corp = corpMappings[country];
      document.getElementById('cd-corp').textContent = corp ? `🏢 ${corp}` : '';

      // 유형 필터 채우기
      const typeSel = document.getElementById('cd-type-filter');
      if(typeSel){
        typeSel.innerHTML = '<option value="">전체 유형</option>' + workTypes.map(t => `<option>${t}</option>`).join('');
      }

      this.renderPartTabs();
      this.renderDetail();
    },

    // 전체 국가 목록으로 돌아가기
    backToList: function(){
      selectedCountry = null;
      document.getElementById('country-detail').style.display = 'none';
      document.getElementById('country-cards').style.display = 'grid';
      const mappingSection = document.getElementById('corp-mapping-section');
      if(mappingSection && typeof role !== 'undefined' && role === 'master') mappingSection.style.display = 'block';
    },

    // 파트 탭 렌더링
    renderPartTabs: function(){
      const entries_filtered = allEntries().filter(e => {
        const m = e.product.match(/^(.+?)\s*\((.+?)\)$/);
        return m && m[2] === selectedCountry;
      });
      const parts = [...new Set(entries_filtered.map(e => e.part))];
      const el = document.getElementById('cd-part-tabs');
      if(!el) return;
      el.innerHTML = ['전체', ...parts].map(p => 
        `<button class="wtype-tab${p === cdPartFilter ? ' active' : ''}" onclick="IBS_Country.setPartFilter('${p}',this)">${p}</button>`
      ).join('');
    },

    setPartFilter: function(p, btn){
      cdPartFilter = p;
      document.querySelectorAll('#cd-part-tabs .wtype-tab').forEach(b => b.classList.remove('active'));
      if(btn) btn.classList.add('active');
      this.renderDetail();
    },

    // 상세 뷰 전체 렌더링
    renderDetail: function(){
      if(!selectedCountry) return;

      const typeFilter = document.getElementById('cd-type-filter')?.value || '';

      // 해당 국가 항목 필터링
      let items = allEntries().filter(e => {
        const m = e.product.match(/^(.+?)\s*\((.+?)\)$/);
        if(!m || m[2] !== selectedCountry) return false;
        if(cdPartFilter !== '전체' && e.part !== cdPartFilter) return false;
        if(typeFilter && e.type !== typeFilter) return false;
        return true;
      });

      // 요약 통계
      const total = items.length;
      const done = items.filter(e => e.status === 'done').length;
      const inprog = items.filter(e => e.status === 'inprog').length;
      const none = items.filter(e => e.status === 'none').length;
      const pct = total ? Math.round(done / total * 100) : 0;

      document.getElementById('cd-summary').innerHTML = `
        <div style="text-align:center;padding:6px 14px;background:#f3f4f6;border-radius:8px">
          <div style="font-size:18px;font-weight:700;color:#1a1f2e">${total}</div>
          <div style="font-size:10px;color:#6b7280">전체</div>
        </div>
        <div style="text-align:center;padding:6px 14px;background:#e0f2ee;border-radius:8px">
          <div style="font-size:18px;font-weight:700;color:#065f46">${done}</div>
          <div style="font-size:10px;color:#065f46">완료</div>
        </div>
        <div style="text-align:center;padding:6px 14px;background:#e0f2ee;border-radius:8px">
          <div style="font-size:18px;font-weight:700;color:#2e7d6e">${pct}%</div>
          <div style="font-size:10px;color:#2e7d6e">완료율</div>
        </div>
      `;

      // 장비별 완료율 바
      this.renderCompletionBars(items);

      // 장비 × 유형 매트릭스
      this.renderMatrix(items);

      // 기한
      this.renderDeadlines();
    },

    // 장비별 완료율 바 차트
    renderCompletionBars: function(items){
      const el = document.getElementById('cd-completion-bars');
      if(!el) return;

      const equipMap = {};
      items.forEach(e => {
        const m = e.product.match(/^(.+?)\s*\((.+?)\)$/);
        const base = m ? m[1] : e.product;
        if(!equipMap[base]) equipMap[base] = { total:0, done:0, part:e.part };
        equipMap[base].total++;
        if(e.status === 'done') equipMap[base].done++;
      });

      const sorted = Object.entries(equipMap).sort((a,b) => {
        const pctA = a[1].total ? a[1].done / a[1].total : 0;
        const pctB = b[1].total ? b[1].done / b[1].total : 0;
        return pctB - pctA;
      });

      if(!sorted.length){
        el.innerHTML = '<div class="empty">데이터가 없습니다.</div>';
        return;
      }

      el.innerHTML = sorted.map(([name, info]) => {
        const pct = info.total ? Math.round(info.done / info.total * 100) : 0;
        const barColor = pct === 100 ? '#2e7d6e' : pct >= 50 ? '#2d6be4' : '#c97a2a';
        return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <div style="width:130px;font-size:12px;font-weight:600;color:#1a1f2e;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${name}">${name}</div>
          <span style="font-size:10px;color:#6b7280;width:40px;flex-shrink:0">${info.part}</span>
          <div style="flex:1;background:#f3f4f6;border-radius:99px;height:8px;overflow:hidden">
            <div style="height:100%;border-radius:99px;background:${barColor};width:${pct}%;transition:width .6s"></div>
          </div>
          <div style="width:60px;text-align:right;font-size:11px;font-weight:700;color:${barColor}">${info.done}/${info.total} (${pct}%)</div>
        </div>`;
      }).join('');
    },

    // 장비 × 작업유형 매트릭스
    renderMatrix: function(items){
      const el = document.getElementById('cd-matrix');
      if(!el) return;

      if(!items.length){
        el.innerHTML = '<div class="empty">표시할 데이터가 없습니다.</div>';
        return;
      }

      // 장비별 그룹핑 (파트 포함)
      const equipPart = {};
      const equipTypes = {};
      const typeSet = new Set();

      items.forEach(e => {
        const m = e.product.match(/^(.+?)\s*\((.+?)\)$/);
        const base = m ? m[1] : e.product;
        equipPart[base] = e.part;
        if(!equipTypes[base]) equipTypes[base] = {};
        equipTypes[base][e.type] = e;
        typeSet.add(e.type);
      });

      const types = workTypes.filter(t => typeSet.has(t));
      const equips = Object.keys(equipPart).sort((a,b) => {
        if(equipPart[a] !== equipPart[b]) return equipPart[a].localeCompare(equipPart[b]);
        return a.localeCompare(b);
      });

      let h = `<table class="mx"><thead><tr>
        <th style="min-width:50px;text-align:left;position:sticky;left:0;background:#f8fafc;z-index:2">파트</th>
        <th style="min-width:130px;text-align:left;position:sticky;left:50px;background:#f8fafc;z-index:2">장비</th>
        ${types.map(t => `<th style="min-width:80px">${t}</th>`).join('')}
        <th style="min-width:60px">완료율</th>
      </tr></thead><tbody>`;

      let lastPart = '';
      equips.forEach(eq => {
        const part = equipPart[eq];
        const showPart = part !== lastPart;
        lastPart = part;
        
        const typeData = equipTypes[eq] || {};
        const total = types.length;
        const done = types.filter(t => typeData[t] && typeData[t].status === 'done').length;
        const pct = total ? Math.round(done / total * 100) : 0;

        h += `<tr>`;
        h += `<td style="text-align:center;font-size:11px;font-weight:600;color:var(--blue);position:sticky;left:0;background:${showPart ? '#eef2ff' : '#fafbfc'};z-index:1">${showPart ? part : ''}</td>`;
        h += `<td class="prod-td" style="position:sticky;left:50px;z-index:1">${eq}</td>`;

        types.forEach(t => {
          const e = typeData[t];
          if(!e){
            h += '<td style="color:#d1d5db">—</td>';
            return;
          }
          const noteH = (typeof noteBadgeHtml === 'function') ? noteBadgeHtml(e.note, e.status) : '';
          const key = e.key || `${part}|${eq} (${selectedCountry})|${t}`;
          h += `<td onclick="openDetail('${key}')" style="cursor:pointer">${sbHtml(e.status)}${noteH}</td>`;
        });

        const barColor = pct === 100 ? '#2e7d6e' : pct >= 50 ? '#2d6be4' : '#c97a2a';
        h += `<td style="font-size:11px;font-weight:700;color:${barColor}">${pct}%</td>`;
        h += `</tr>`;
      });

      h += `</tbody></table>`;
      el.innerHTML = h;
    },

    // 기한 D-day
    renderDeadlines: function(){
      const card = document.getElementById('cd-deadline-card');
      const el = document.getElementById('cd-deadlines');
      if(!card || !el) return;

      const countryDeadlines = deadlines.filter(d => {
        return d.product.includes(`(${selectedCountry})`);
      }).sort((a,b) => new Date(a.date) - new Date(b.date));

      // 비고에서 날짜가 있는 진행중 항목도 포함
      const noteDeadlines = allEntries().filter(e => {
        const m = e.product.match(/^(.+?)\s*\((.+?)\)$/);
        if(!m || m[2] !== selectedCountry) return false;
        if(e.status !== 'inprog') return false;
        return (typeof extractDateFromNote === 'function') && extractDateFromNote(e.note);
      });

      if(!countryDeadlines.length && !noteDeadlines.length){
        card.style.display = 'none';
        return;
      }

      card.style.display = 'block';
      let h = '';

      countryDeadlines.forEach(d => {
        const dd = dday(d.date);
        const e = entries[`${d.part}|${d.product}|${d.type}`];
        const isDone = e && e.status === 'done';
        const prioIcon = d.prio === 'high' ? '🔴' : d.prio === 'mid' ? '🟡' : '🟢';
        
        h += `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)${isDone ? ';opacity:.5' : ''}">
          <span style="font-size:14px">${prioIcon}</span>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600">${d.product.replace(/\s*\(.+?\)$/, '')} <span style="color:var(--text2);font-weight:400">› ${d.type}</span></div>
            <div style="font-size:11px;color:var(--text2);margin-top:2px">${d.part} · ${d.assignee || '-'} · ${d.date}</div>
          </div>
          <span class="dl-chip ${isDone ? 'dl-ok' : dd < 0 ? 'dl-over' : dd <= 3 ? 'dl-soon' : 'dl-ok'}">
            ${isDone ? '완료' : dd < 0 ? `${Math.abs(dd)}일 초과` : dd === 0 ? '오늘' : `D-${dd}`}
          </span>
        </div>`;
      });

      noteDeadlines.forEach(e => {
        const dt = extractDateFromNote(e.note);
        const dd = dday(dt);
        h += `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:14px">📝</span>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600">${e.product.replace(/\s*\(.+?\)$/, '')} <span style="color:var(--text2);font-weight:400">› ${e.type}</span></div>
            <div style="font-size:11px;color:var(--text2);margin-top:2px">${e.part} · ${dt} <span style="color:#a16207">[비고 날짜]</span></div>
          </div>
          <span class="dl-chip ${dd < 0 ? 'dl-over' : dd <= 3 ? 'dl-soon' : 'dl-ok'}">
            ${dd < 0 ? `${Math.abs(dd)}일 초과` : dd === 0 ? '오늘' : `D-${dd}`}
          </span>
        </div>`;
      });

      el.innerHTML = h || '<div class="empty">기한 없음</div>';
    },

    // ── 법인/대리점 매핑 관리 ──
    renderMappingView: function(){
      const el = document.getElementById('corp-mapping-view');
      if(!el) return;
      const countries = Object.keys(this.getCountries()).sort();
      if(!countries.length){
        el.innerHTML = '<div style="font-size:12px;color:var(--text2)">국가 데이터가 없습니다.</div>';
        return;
      }
      el.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:8px">${countries.map(c => {
        const corp = corpMappings[c];
        return `<div style="display:flex;align-items:center;gap:6px;background:#f3f4f6;border-radius:8px;padding:5px 12px;font-size:12px">
          <span style="font-weight:600">${c}</span>
          ${corp ? `<span style="color:var(--text2)">→ ${corp}</span>` : '<span style="color:#d1d5db">미지정</span>'}
        </div>`;
      }).join('')}</div>`;
    },

    toggleMappingEdit: function(){
      mappingEditMode = !mappingEditMode;
      document.getElementById('corp-mapping-view').style.display = mappingEditMode ? 'none' : 'block';
      document.getElementById('corp-mapping-edit').style.display = mappingEditMode ? 'block' : 'none';
      if(mappingEditMode) this.renderMappingFields();
    },

    renderMappingFields: function(){
      const el = document.getElementById('corp-mapping-fields');
      if(!el) return;
      const countries = Object.keys(this.getCountries()).sort();
      el.innerHTML = countries.map(c => `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="width:60px;font-size:12px;font-weight:600;flex-shrink:0">${c}</span>
          <input type="text" id="corp-map-${c}" value="${corpMappings[c] || ''}" 
            placeholder="법인/대리점명 입력" 
            style="flex:1;padding:6px 10px;border:1px solid var(--border);border-radius:7px;font-size:12px;font-family:inherit;outline:none">
        </div>
      `).join('');
    },

    saveMappings: function(){
      const countries = Object.keys(this.getCountries());
      countries.forEach(c => {
        const input = document.getElementById('corp-map-' + c);
        if(input){
          const val = input.value.trim();
          if(val) corpMappings[c] = val;
          else delete corpMappings[c];
        }
      });
      try { localStorage.setItem('ibs_corp_mappings', JSON.stringify(corpMappings)); } catch(e){}
      mappingEditMode = false;
      document.getElementById('corp-mapping-view').style.display = 'block';
      document.getElementById('corp-mapping-edit').style.display = 'none';
      this.renderMappingView();
      this.renderCountryCards();
      if(typeof showToast === 'function') showToast('✅ 법인/대리점 매핑 저장됨');
    }
  };

  // 전역 접근용
  window.IBS_Country = mod;

  // ── 6. goPage 확장 ──
  const origGoPage = window.goPage;
  window.goPage = function(id, el){
    if(id === 'country'){
      // 페이지 전환 처리
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(n => {
        n.classList.remove('active');
        n.style.background = '';
        n.style.borderLeftColor = 'transparent';
        n.style.fontWeight = '500';
        n.querySelectorAll('span').forEach(s => { s.style.color = ''; s.style.fontWeight = '500'; });
      });
      document.getElementById('page-country').classList.add('active');
      const activeEl = el || document.getElementById('ni-country');
      if(activeEl){
        activeEl.classList.add('active');
        activeEl.style.background = 'rgba(255,255,255,.15)';
        activeEl.style.borderLeftColor = '#fff';
        activeEl.style.fontWeight = '700';
        activeEl.querySelectorAll('span').forEach(s => { s.style.color = '#fff'; s.style.fontWeight = '700'; });
      }
      document.getElementById('topbar-title').textContent = '국가별 현황';
      const pageEl = document.getElementById('page-country');
      const h1 = pageEl.querySelector('.ph h1');
      const p = pageEl.querySelector('.ph p');
      if(h1) h1.textContent = 'Country Status';
      if(p) p.textContent = '국가별 현황';

      // 상세 뷰 리셋
      selectedCountry = null;
      document.getElementById('country-detail').style.display = 'none';
      document.getElementById('country-cards').style.display = 'grid';
      mod.renderCountryCards();
      return;
    }
    origGoPage(id, el);
  };

})();
