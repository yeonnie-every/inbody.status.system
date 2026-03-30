/*  ============================================================
 *  IBS v2.3 – 파트 Show/Hide 패치
 *  ============================================================
 *  사용법:
 *    원본 index.html 의 </body> 바로 위에 아래 한 줄 추가:
 *    <script src="showhide-patch.js"></script>
 *
 *  이 스크립트는 기존 코드를 monkey-patch 하여
 *  Master 권한으로 파트별 공개/숨김을 관리할 수 있게 합니다.
 *  ============================================================ */

(function () {
  'use strict';

  // ── 1. hiddenParts 상태 변수 ──
  window.hiddenParts = window.hiddenParts || [];

  function isPartVisible(p) { return !hiddenParts.includes(p); }
  function getVisibleParts() { return PARTS.filter(isPartVisible); }

  // 전역에 노출
  window.isPartVisible = isPartVisible;
  window.getVisibleParts = getVisibleParts;

  // ── 2. allEntries 오버라이드 ──
  const _origAllEntries = window.allEntries;
  window.allEntries = function (includeHidden) {
    const all = Object.entries(entries).map(function ([k, v]) {
      const [p, pr, tp] = k.split('|');
      return { key: k, part: p, product: pr, type: tp, ...v };
    });
    if (includeHidden) return all;
    return all.filter(function (e) { return isPartVisible(e.part); });
  };

  // ── 3. buildSaveData 오버라이드 ──
  const _origBuildSave = window.buildSaveData;
  window.buildSaveData = function () {
    const data = _origBuildSave();
    data.hiddenParts = hiddenParts;
    return data;
  };

  // ── 4. applyLoadData 오버라이드 ──
  const _origApplyLoad = window.applyLoadData;
  window.applyLoadData = function (data) {
    _origApplyLoad(data);
    hiddenParts = data.hiddenParts || [];
  };

  // ── 5. renderPartTabs 오버라이드 ──
  window.renderPartTabs = function () {
    const vParts = getVisibleParts();
    if (currentPart !== '전체' && !vParts.includes(currentPart)) currentPart = '전체';
    const activeParts = ['전체', ...vParts.filter(function (p) { return (products[p] || []).length > 0; })];
    const el = document.getElementById('part-tabs');
    if (!el) return;
    el.innerHTML = activeParts.map(function (p) {
      return '<button class="wtype-tab' + (p === currentPart ? ' active' : '') +
        '" onclick="setPart(\'' + p + '\',this)">' + p + '</button>';
    }).join('');
  };

  // ── 6. renderDashboard 오버라이드 ──
  const _origDashboard = window.renderDashboard;
  window.renderDashboard = function () {
    // allEntries() 가 이미 visible 필터링 하므로 그대로 호출
    _origDashboard();

    // part-bars 다시 그리기 (visible 파트만)
    const all = allEntries();
    const vParts = getVisibleParts();
    document.getElementById('part-bars').innerHTML = vParts.map(function (p) {
      const i = PARTS.indexOf(p);
      const pe = all.filter(function (e) { return e.part === p; });
      const pct = pe.length ? Math.round(pe.filter(function (e) { return e.status === 'done'; }).length / pe.length * 100) : 0;
      return '<div class="part-row"><div class="part-name">' + p +
        '</div><div class="bar-bg"><div class="bar-fill" style="width:' + pct + '%;background:' + getPartColor(i) +
        '"></div></div><div class="bar-pct">' + pct + '%</div></div>';
    }).join('');

    // 바 차트 재생성 (visible 파트만)
    if (window.barInst) barInst.destroy();
    const ctx2 = document.getElementById('barChart').getContext('2d');
    const barDatasets = STATUSES.filter(function (s) { return s.id !== 'na'; }).map(function (s) {
      return {
        label: s.label,
        data: vParts.map(function (p) { return all.filter(function (e) { return e.part === p && e.status === s.id; }).length; }),
        backgroundColor: s.color
      };
    });
    barInst = new Chart(ctx2, {
      type: 'bar',
      data: { labels: vParts, datasets: barDatasets },
      options: {
        plugins: { legend: { labels: { font: { size: 12 }, color: '#1a1f2e' } } },
        scales: { x: { stacked: true }, y: { stacked: true, ticks: { stepSize: 1 } } },
        responsive: true
      }
    });
  };

  // ── 7. fillSel 오버라이드 (검색 필터에서 visible 파트만) ──
  const _origFillSel = window.fillSel;
  window.fillSel = function (pfx) {
    _origFillSel(pfx);
    // 검색용 파트 필터는 visible만
    if (pfx !== 'uf') {
      const ps = document.getElementById(pfx + '-part');
      if (ps) {
        ps.innerHTML = '<option value="">전체 파트</option>' +
          getVisibleParts().map(function (p) { return '<option>' + p + '</option>'; }).join('');
      }
    }
  };

  // ── 8. renderMatrix 오버라이드 (fParts를 visible로) ──
  const _origRenderMatrix = window.renderMatrix;
  window.renderMatrix = function () {
    // renderMatrix 내부에서 PARTS 대신 getVisibleParts() 사용이 필요
    // 가장 깔끔한 방법: 임시로 PARTS를 visible만으로 교체 후 원본 호출
    const savedParts = window.PARTS;
    const savedColors = window.PART_COLORS;
    // matrix에서는 visible 파트만 보여야 함 (currentPart가 '전체'일 때)
    // 하지만 특정 파트 선택 시에는 그 파트만 보여야 하므로 PARTS 자체를 바꾸면 안됨
    // → 대신 원본을 호출하되, fParts 계산에 영향을 주는 방식으로 처리
    _origRenderMatrix();
  };

  // renderMatrix 내부의 fParts 를 패치하기 어려우므로,
  // entries에서 hidden 파트를 필터링하는 allEntries()가 이미 처리함.
  // 다만 fParts = PARTS.filter(...) 부분이 문제 → 아래에서 직접 오버라이드

  // 완전한 renderMatrix 재정의
  window.renderMatrix = function () {
    const fs = (document.getElementById('mx-status') || {}).value || '';
    const fc = (document.getElementById('mx-country') || {}).value || '';
    const fp = currentPart === '전체' ? null : currentPart;

    let filtered = allEntries().filter(function (e) {
      if (currentWtype !== '전체' && e.type !== currentWtype) return false;
      if (fp && e.part !== fp) return false;
      if (fs && e.status !== fs) return false;
      return true;
    });

    if (!filtered.length) {
      document.getElementById('matrix-wrap').innerHTML = '<div class="empty">표시할 데이터가 없습니다.<br>데이터 업로드 후 확인하세요.</div>';
      return;
    }

    const productSet = new Set();
    const countrySet = new Set();
    const partOfProduct = {};

    filtered.forEach(function (e) {
      const m = e.product.match(/^(.+?)\s*\((.+?)\)$/);
      const base = m ? m[1] : e.product;
      const country = m ? m[2] : '공통';
      productSet.add(base);
      countrySet.add(country);
      partOfProduct[base] = e.part;
    });

    const countries = fc ? [fc] : [...countrySet];
    const vParts = getVisibleParts();
    const fParts = fp ? [fp] : vParts.filter(function (p) {
      return [...productSet].some(function (b) { return partOfProduct[b] === p; });
    });

    document.getElementById('matrix-title').textContent =
      (fp || '전체') + (currentWtype !== '전체' ? ' — ' + currentWtype : '');

    let h = '<table class="mx"><thead><tr>' +
      '<th style="min-width:55px;text-align:left;position:sticky;left:0;background:#f8fafc;z-index:2">파트</th>' +
      '<th style="min-width:140px;text-align:left;position:sticky;left:55px;background:#f8fafc;z-index:2">제품명</th>';
    countries.forEach(function (c) { h += '<th style="min-width:88px">' + c + '</th>'; });
    h += '</tr></thead><tbody>';

    fParts.forEach(function (part) {
      const partProds = [...productSet].filter(function (b) { return partOfProduct[b] === part; });
      if (!partProds.length) return;
      partProds.forEach(function (base, idx) {
        h += '<tr>';
        if (idx === 0) {
          h += '<td class="part-sep" rowspan="' + partProds.length + '" style="vertical-align:middle;min-width:55px;position:sticky;left:0;background:#eef2ff;z-index:1;font-size:11px;font-weight:700;color:var(--blue);text-align:center">' + part + '</td>';
        }
        h += '<td class="prod-td" style="position:sticky;left:55px;z-index:1;min-width:140px">' + base + '</td>';
        countries.forEach(function (country) {
          const prodKeyFull = base + ' (' + country + ')';
          const prodKey = filtered.some(function (e) { return e.product === prodKeyFull; }) ? prodKeyFull : base;
          const typeEntries = filtered.filter(function (e) { return e.product === prodKey && e.part === part; });
          if (!typeEntries.length) { h += '<td style="color:#d1d5db;font-size:12px;text-align:center">—</td>'; return; }
          if (currentWtype !== '전체') {
            const e = typeEntries[0];
            const dl = deadlines.find(function (d) { return d.part === part && d.product === prodKey && d.type === currentWtype; });
            let dlH = '';
            if (dl && e.status !== 'done') {
              const dd = dday(dl.date);
              dlH = '<span class="dl-chip ' + (dd < 0 ? 'dl-over' : dd <= 3 ? 'dl-soon' : 'dl-ok') + '">' +
                (dd < 0 ? '+' + Math.abs(dd) + 'd' : dd === 0 ? '오늘' : dl.date.slice(5)) + '</span>';
            }
            const noteH = noteBadgeHtml(e.note, e.status);
            h += '<td onclick="openDetail(\'' + e.key + '\')" style="cursor:pointer">' + sbHtml(e.status) + dlH + noteH + '</td>';
          } else {
            let cell = '';
            typeEntries.forEach(function (e) {
              const noteH = noteBadgeHtml(e.note, e.status);
              cell += '<div style="margin-bottom:3px"><span style="font-size:10px;color:var(--text2)">' + e.type + '</span> ' + sbHtml(e.status) + noteH + '</div>';
            });
            h += '<td style="cursor:pointer;text-align:left" onclick="openDetail(\'' + typeEntries[0].key + '\')">' + cell + '</td>';
          }
        });
        h += '</tr>';
      });
    });
    h += '</tbody></table>';
    document.getElementById('matrix-wrap').innerHTML = h;
  };

  // ── 9. renderPriority 오버라이드 (visible만) ──
  const _origPriority = window.renderPriority;
  window.renderPriority = function () {
    // 임시로 deadlines 필터
    const origDl = window.deadlines;
    window.deadlines = origDl.filter(function (d) { return isPartVisible(d.part); });
    _origPriority();
    window.deadlines = origDl;
  };

  // ── 10. renderUpdateTable 오버라이드 (모든 파트 + hidden 표시) ──
  const _origUpdateTable = window.renderUpdateTable;
  window.renderUpdateTable = function () {
    const fp = document.getElementById('uf-part').value;
    const fprod = document.getElementById('uf-prod').value;
    const all = allEntries(true).filter(function (e) {
      if (fp && e.part !== fp) return false;
      if (fprod && e.product !== fprod) return false;
      return true;
    });
    if (!all.length) { document.getElementById('update-tbl').innerHTML = '<div class="empty">항목이 없습니다.</div>'; return; }
    let h = '<table class="mx"><thead><tr><th>파트</th><th>제품</th><th>유형</th><th>상태</th><th>버전</th><th>담당자</th><th>수정</th><th>삭제</th></tr></thead><tbody>';
    all.forEach(function (e) {
      const isHidden = hiddenParts.includes(e.part);
      h += '<tr' + (isHidden ? ' style="opacity:.5"' : '') + '><td>' + e.part +
        (isHidden ? ' <span style="font-size:10px;color:#ef4444">숨김</span>' : '') +
        '</td><td>' + e.product + '</td><td>' + e.type + '</td><td>' + sbHtml(e.status) +
        '</td><td>' + (e.version || '—') + '</td><td>' + (e.owner || '—') +
        '</td><td><button class="btn-sm btn-edit" onclick="loadEdit(\'' + e.key + '\')">수정</button></td>' +
        '<td><button class="btn-sm btn-del" onclick="delEntry(\'' + e.key + '\')">삭제</button></td></tr>';
    });
    h += '</tbody></table>';
    document.getElementById('update-tbl').innerHTML = h;
  };

  // ── 11. goPage 오버라이드 (types 진입 시 visibility 렌더) ──
  const _origGoPage = window.goPage;
  window.goPage = function (id, el) {
    _origGoPage(id, el);
    if (id === 'types') renderVisibilityList();
  };

  // ── 12. clearAllData 패치 ──
  const _origClearAll = window.clearAllData;
  window.clearAllData = function () {
    _origClearAll();
    hiddenParts = [];
  };

  // ── 13. Visibility UI 렌더링 ──
  window.renderVisibilityList = function () {
    const el = document.getElementById('visibility-list');
    if (!el) return;
    const totalByPart = {};
    Object.keys(entries).forEach(function (k) {
      const part = k.split('|')[0];
      totalByPart[part] = (totalByPart[part] || 0) + 1;
    });
    let h = '';
    PARTS.forEach(function (p, i) {
      const visible = isPartVisible(p);
      const cnt = totalByPart[p] || 0;
      const color = getPartColor(i);
      h += '<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;margin-bottom:6px;' +
        'background:' + (visible ? '#f0fdf4' : '#fef2f2') + ';border:1px solid ' + (visible ? '#bbf7d0' : '#fecaca') + ';transition:all .2s">' +
        '<label class="toggle-switch"><input type="checkbox" ' + (visible ? 'checked' : '') +
        ' onchange="togglePartVisibility(\'' + p + '\',this.checked)"><span class="toggle-slider"></span></label>' +
        '<div style="display:flex;align-items:center;gap:8px;flex:1">' +
        '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + color + ';flex-shrink:0"></span>' +
        '<span style="font-size:13px;font-weight:700;color:' + (visible ? 'var(--text)' : '#9ca3af') + '">' + p + '</span>' +
        '<span style="font-size:11px;color:var(--text2)">' + cnt + '건</span>' +
        '</div>' +
        '<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:12px;' +
        (visible ? 'background:#d1fae5;color:#065f46' : 'background:#fee2e2;color:#991b1b') + '">' +
        (visible ? '👁️ 공개' : '🙈 숨김') + '</span></div>';
    });
    el.innerHTML = h;
  };

  window.togglePartVisibility = function (part, visible) {
    if (visible) {
      hiddenParts = hiddenParts.filter(function (p) { return p !== part; });
    } else {
      if (!hiddenParts.includes(part)) hiddenParts.push(part);
    }
    autoSave();
    renderVisibilityList();
    renderDashboard(); renderFeed(); renderPartTabs(); renderMatrix(); renderPriority();
    showToast(visible
      ? '👁️ \'' + part + '\' 파트가 공개되었습니다'
      : '🙈 \'' + part + '\' 파트가 숨김 처리되었습니다');
  };

  // ── 14. CSS 주입 (toggle switch) ──
  const style = document.createElement('style');
  style.textContent = [
    '.toggle-switch{position:relative;display:inline-block;width:40px;height:22px;flex-shrink:0}',
    '.toggle-switch input{opacity:0;width:0;height:0}',
    '.toggle-slider{position:absolute;cursor:pointer;inset:0;background-color:#d1d5db;transition:.25s;border-radius:22px}',
    '.toggle-slider:before{content:"";position:absolute;height:16px;width:16px;left:3px;bottom:3px;background:#fff;transition:.25s;border-radius:50%}',
    '.toggle-switch input:checked+.toggle-slider{background-color:#2e7d6e}',
    '.toggle-switch input:checked+.toggle-slider:before{transform:translateX(18px)}'
  ].join('\n');
  document.head.appendChild(style);

  // ── 15. 유형/파트 관리 페이지에 Visibility 섹션 HTML 삽입 ──
  const typesPage = document.getElementById('page-types');
  if (typesPage) {
    const firstCard = typesPage.querySelector('.card');
    if (firstCard) {
      const visCard = document.createElement('div');
      visCard.className = 'card';
      visCard.style.marginBottom = '18px';
      visCard.innerHTML =
        '<div class="card-head"><div class="card-head-title">👁️ 파트 공개 설정 (Show / Hide)</div></div>' +
        '<div class="card-body">' +
        '<div style="font-size:12px;color:var(--text2);margin-bottom:14px;line-height:1.8">' +
        '파트별로 공개 여부를 설정합니다. <b>숨김 처리된 파트</b>는 대시보드, 프로젝트 현황, 검색에서 보이지 않습니다.<br>' +
        '데이터는 삭제되지 않으며 언제든 다시 공개할 수 있습니다.</div>' +
        '<div id="visibility-list"></div>' +
        '<div style="margin-top:12px;background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:10px 14px;font-size:12px;color:#1d4ed8;line-height:1.7">' +
        '💡 <b>Tip</b>: 숨긴 파트의 데이터는 항목 관리, 데이터 업로드에서는 계속 접근 가능합니다.</div>' +
        '</div>';
      firstCard.parentNode.insertBefore(visCard, firstCard);
    }
  }

  // ── 16. 저장된 hiddenParts 복원 ──
  try {
    const saved = JSON.parse(localStorage.getItem('ibs_data_v1') || '{}');
    if (saved.hiddenParts && saved.hiddenParts.length) {
      hiddenParts = saved.hiddenParts;
      // 화면 갱신
      setTimeout(function () {
        renderDashboard(); renderFeed(); renderPartTabs();
        renderMatrix(); renderPriority();
      }, 500);
    }
  } catch (e) { /* ignore */ }

  console.log('✅ IBS Show/Hide patch loaded (v2.3)');
})();
