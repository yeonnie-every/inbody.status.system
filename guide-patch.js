/*  ============================================================
 *  IBS – 이용 가이드 페이지 패치
 *  ============================================================
 *  사용법:
 *    index.html 의 </body> 바로 위에 추가:
 *    <script src="guide-patch.js"></script>
 *
 *    (showhide-patch.js 보다 뒤에 위치해도 OK)
 *  ============================================================ */

(function () {
  'use strict';

  // ── 1. CSS 주입 ──
  const css = document.createElement('style');
  css.textContent = `
.guide-section{margin-bottom:28px}
.guide-section-num{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:var(--burg2);color:#fff;font-size:12px;font-weight:800;margin-right:8px;flex-shrink:0}
.guide-section-title{font-size:18px;font-weight:800;color:var(--burg2);display:flex;align-items:center;margin-bottom:16px}
.guide-card{background:var(--white);border-radius:12px;box-shadow:var(--shadow);padding:24px;margin-bottom:16px}
.guide-card h3{font-size:15px;font-weight:700;color:var(--text);margin-bottom:10px;display:flex;align-items:center;gap:8px}
.guide-card p,.guide-card li{font-size:13px;color:var(--text2);line-height:1.9}
.guide-card ul{padding-left:18px;margin:8px 0}
.guide-card li{margin-bottom:4px}
.guide-role-card{border-radius:12px;padding:20px 24px;margin-bottom:12px;border-left:4px solid}
.guide-role-card.role-user{background:#f9fafb;border-color:#6b7280}
.guide-role-card.role-manager{background:#eff6ff;border-color:#2563eb}
.guide-role-card.role-master{background:#fdf2f4;border-color:#7c2d3e}
.guide-role-card .role-title{font-size:14px;font-weight:800;margin-bottom:6px;display:flex;align-items:center;gap:8px}
.guide-role-card .role-title .role-icon{font-size:16px}
.guide-role-card .role-badge-sm{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700}
.guide-role-card p{font-size:12px;color:var(--text2);line-height:1.8;margin:0}
.guide-role-card ul{padding-left:16px;margin:6px 0 0}
.guide-role-card li{font-size:12px;color:var(--text2);line-height:1.8;margin-bottom:2px}
.guide-contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.guide-contact-item{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--gray-light);border-radius:9px;font-size:12px}
.guide-contact-item .gc-label{font-weight:700;color:var(--text);min-width:70px}
.guide-contact-item .gc-value{color:var(--text2)}
.qa-form{margin-top:14px}
.qa-form textarea{width:100%;min-height:80px;padding:10px 14px;border:1px solid var(--border);border-radius:9px;font-size:13px;font-family:inherit;outline:none;resize:vertical}
.qa-form textarea:focus{border-color:var(--blue);box-shadow:0 0 0 2px rgba(45,107,228,.1)}
.qa-list{margin-top:14px}
.qa-item{background:var(--gray-light);border-radius:9px;padding:12px 16px;margin-bottom:8px}
.qa-item .qa-q{font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px}
.qa-item .qa-meta{font-size:11px;color:var(--text2)}
.qa-item .qa-a{font-size:12px;color:var(--green);margin-top:6px;padding-top:6px;border-top:1px solid var(--border)}
.guide-toc{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.guide-toc-btn{padding:8px 18px;border-radius:20px;border:1.5px solid var(--border);background:var(--white);font-size:12px;font-weight:600;color:var(--text2);cursor:pointer;font-family:inherit;transition:all .18s}
.guide-toc-btn:hover{border-color:var(--burg2);color:var(--burg2);background:#fdf2f4}
.guide-toc-btn.active{border-color:var(--burg2);color:#fff;background:var(--burg2)}
  `;
  document.head.appendChild(css);

  // ── 2. 사이드바에 가이드 메뉴 추가 ──
  const searchSection = document.querySelector('.sidebar-nav');
  if (searchSection) {
    const guideNav = document.createElement('div');
    guideNav.innerHTML =
      '<div class="nav-section" style="font-size:9px;font-weight:800;color:rgba(255,255,255,.55);letter-spacing:2px;text-transform:uppercase;padding:14px 18px 6px">GUIDE</div>' +
      '<div class="nav-item" id="ni-guide" onclick="goPage(\'guide\',this)">' +
      '<span class="ni">📖</span><span>IBS 이용 가이드</span></div>';
    searchSection.appendChild(guideNav);
  }

  // ── 3. 가이드 페이지 HTML 삽입 ──
  const content = document.querySelector('.content');
  if (content) {
    const page = document.createElement('div');
    page.className = 'page';
    page.id = 'page-guide';
    page.innerHTML = `
      <div class="ph"><h1>IBS Guide</h1><p>IBS 이용 가이드</p></div>

      <!-- TOC -->
      <div class="guide-toc">
        <button class="guide-toc-btn active" onclick="guideScrollTo('main',this)">01. MAIN</button>
        <button class="guide-toc-btn" onclick="guideScrollTo('roles',this)">02. 권한 별 사용방법</button>
        <button class="guide-toc-btn" onclick="guideScrollTo('etc',this)">03. 기타</button>
      </div>

      <!-- 01. MAIN -->
      <div id="guide-main">
        <div class="guide-section-title"><span class="guide-section-num">01</span>MAIN</div>

        <div class="guide-card">
          <h3>💡 IBS란?</h3>
          <p><b>IBS (InBody Status Management System)</b>는 제품별 이관 및 생산 적용에 필요한 제품 UI / 후가공 / 인증 등의 진행 현황을 통합 관리하는 시스템입니다.</p>
          <p style="margin-top:6px">신제품 출시, 판매 국가 추가 등 생산 이관 전 반드시 수행되어야 하는 작업들의 진행 상태를 한눈에 확인할 수 있도록 설계되었습니다.</p>
        </div>

        <div class="guide-card">
          <h3>📌 필요성</h3>
          <ul>
            <li>제품별 진행 현황이 분산 관리되어 최신 상태 확인의 어려움 발생</li>
            <li>담당자 간 커뮤니케이션 의존도가 높아 정보 누락 및 지연 가능성 존재</li>
            <li>생산 및 출고 이후에도 이관 관련 자료 누락 발생 가능</li>
          </ul>
          <p style="margin-top:10px;padding:10px 14px;background:#f0fdf4;border-radius:8px;color:#065f46;font-weight:600;font-size:12px">
            ✅ IBS를 통해 모든 진행 현황을 통합 관리하고, 최신 버전 기준으로 업무 정합성을 확보할 수 있습니다.
          </p>
        </div>

        <div class="guide-card">
          <h3>🎯 목적</h3>
          <ul>
            <li>제품별 이관 및 생산 적용 진행 현황의 <b>실시간 공유</b></li>
            <li>최신 버전 기준의 <b>데이터 일원화</b> 및 이력 관리</li>
            <li>담당자 간 <b>커뮤니케이션 최소화</b> 및 업무 효율 향상</li>
            <li>생산 전 단계에서의 <b>리스크 사전 방지</b></li>
          </ul>
        </div>
      </div>

      <!-- 02. 권한 별 사용방법 -->
      <div id="guide-roles" style="margin-top:32px">
        <div class="guide-section-title"><span class="guide-section-num">02</span>권한 별 사용방법</div>

        <div class="guide-card" style="margin-bottom:16px">
          <p style="font-size:12px;color:var(--text2);line-height:1.8">IBS는 <b>3단계 권한 체계</b>로 운영됩니다. 역할에 따라 접근 가능한 기능과 데이터 범위가 다릅니다.</p>
        </div>

        <div class="guide-role-card role-user">
          <div class="role-title">
            <span class="role-icon">👤</span>
            USER
            <span class="role-badge-sm" style="background:#f3f4f6;color:#6b7280">조회 전용</span>
          </div>
          <ul>
            <li>조회 전용 권한 — 비밀번호 없이 접속 가능</li>
            <li>대시보드, 전체 현황, 검색 기능 등을 통해 데이터 확인 가능</li>
            <li>데이터 수정 및 업로드 불가</li>
          </ul>
          <p style="margin-top:8px;font-size:11px;color:#9ca3af">접근 가능: 대시보드 · 로드맵 · 프로젝트 현황 · 검색 · 이용 가이드</p>
        </div>

        <div class="guide-role-card role-manager">
          <div class="role-title">
            <span class="role-icon">🔧</span>
            MANAGER
            <span class="role-badge-sm" style="background:#dbeafe;color:#1d4ed8">🔒 비밀번호 필요</span>
          </div>
          <ul>
            <li>데이터 관리 권한 (비밀번호 필요)</li>
            <li>항목 생성 및 수정</li>
            <li>제품별 데이터 업로드 및 업데이트 가능</li>
            <li>담당 파트 기준 현황 관리</li>
          </ul>
          <p style="margin-top:8px;font-size:11px;color:#9ca3af">추가 접근: 항목 관리 · 데이터 업로드</p>
        </div>

        <div class="guide-role-card role-master">
          <div class="role-title">
            <span class="role-icon">⭐</span>
            MASTER
            <span class="role-badge-sm" style="background:#fdf2f4;color:#7c2d3e">🔒 비밀번호 필요</span>
          </div>
          <ul>
            <li>전체 관리자 권한 (비밀번호 필요)</li>
            <li>사이트 내 모든 기능 접근 가능</li>
            <li>기한 관리, 유형/파트 설정 등 시스템 전반 관리</li>
            <li>전체 데이터 통합 관리 및 운영</li>
          </ul>
          <p style="margin-top:8px;font-size:11px;color:#9ca3af">추가 접근: 기한 관리 · 유형/파트 관리 · 파트 공개설정</p>
        </div>
      </div>

      <!-- 03. 기타 -->
      <div id="guide-etc" style="margin-top:32px">
        <div class="guide-section-title"><span class="guide-section-num">03</span>기타</div>

        <!-- 담당자 안내 -->
        <div class="guide-card">
          <h3>📌 담당자 안내</h3>
          <div class="guide-contact-grid">
            <div class="guide-contact-item">
              <span class="gc-label">사이트 운영</span>
              <span class="gc-value">김다슬 D / 김연희 S</span>
            </div>
            <div class="guide-contact-item">
              <span class="gc-label">제품 UI</span>
              <span class="gc-value">—</span>
            </div>
            <div class="guide-contact-item">
              <span class="gc-label">후가공</span>
              <span class="gc-value">이수빈 S</span>
            </div>
            <div class="guide-contact-item">
              <span class="gc-label">인증</span>
              <span class="gc-value">김종준 D</span>
            </div>
          </div>
        </div>

        <!-- Q&A -->
        <div class="guide-card">
          <h3>📌 Q&A</h3>
          <p>사이트 이용 중 발생하는 문의사항, 개선 요청, 데이터 수정 요청 등은 아래 Q&A를 통해 남겨주시기 바랍니다.</p>
          <ul style="margin-top:8px;margin-bottom:12px">
            <li>기능 관련 문의</li>
            <li>데이터 오류 및 최신화 요청</li>
            <li>개선 의견 및 기타 피드백</li>
          </ul>
          <p style="font-size:12px;color:var(--blue);font-weight:600">👉 담당자 확인 후 순차적으로 답변 및 반영 예정입니다.</p>

          <div class="divider"></div>

          <!-- Q&A 입력 폼 -->
          <div class="qa-form">
            <div style="display:flex;gap:8px;margin-bottom:8px">
              <input type="text" id="qa-name" placeholder="이름" style="width:120px;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:12px;font-family:inherit;outline:none">
              <select id="qa-category" style="padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:12px;font-family:inherit;outline:none">
                <option value="기능 문의">기능 문의</option>
                <option value="데이터 오류">데이터 오류</option>
                <option value="최신화 요청">최신화 요청</option>
                <option value="개선 의견">개선 의견</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <textarea id="qa-content" placeholder="문의 내용을 입력해주세요..."></textarea>
            <div style="display:flex;gap:8px;margin-top:8px;align-items:center">
              <button class="btn btn-primary" onclick="submitQA()">📨 문의 등록</button>
              <span style="font-size:11px;color:var(--text2)">등록된 문의는 담당자에게 전달됩니다.</span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Q&A 목록 -->
          <div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:8px">등록된 문의</div>
          <div id="qa-list"><div class="empty" style="padding:20px">아직 등록된 문의가 없습니다.</div></div>
        </div>
      </div>
    `;
    content.appendChild(page);
  }

  // ── 4. 페이지 라우팅에 guide 추가 ──
  // PAGE_ROLES에 guide 추가 (모든 역할 접근 가능)
  if (window.PAGE_ROLES) {
    PAGE_ROLES.guide = ['user', 'manager', 'master'];
  }

  // goPage 오버라이드
  const _origGoPage = window.goPage;
  window.goPage = function (id, el) {
    _origGoPage(id, el);
    if (id === 'guide') {
      renderQAList();
    }
  };

  // ── 5. TOC 스크롤 ──
  window.guideScrollTo = function (section, btn) {
    const target = document.getElementById('guide-' + section);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    document.querySelectorAll('.guide-toc-btn').forEach(function (b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
  };

  // ── 6. Q&A 기능 ──
  const QA_STORAGE_KEY = 'ibs_qa_v1';

  function loadQAData() {
    try {
      return JSON.parse(localStorage.getItem(QA_STORAGE_KEY) || '[]');
    } catch (e) { return []; }
  }

  function saveQAData(data) {
    try { localStorage.setItem(QA_STORAGE_KEY, JSON.stringify(data)); } catch (e) { }
  }

  window.submitQA = function () {
    const name = document.getElementById('qa-name').value.trim();
    const category = document.getElementById('qa-category').value;
    const content = document.getElementById('qa-content').value.trim();

    if (!name) { showToast('이름을 입력해주세요'); return; }
    if (!content) { showToast('문의 내용을 입력해주세요'); return; }

    const qaList = loadQAData();
    qaList.unshift({
      id: Date.now(),
      name: name,
      category: category,
      content: content,
      createdAt: new Date().toISOString(),
      answer: null
    });
    saveQAData(qaList);

    // 폼 초기화
    document.getElementById('qa-name').value = '';
    document.getElementById('qa-content').value = '';

    // updateLog에도 기록
    if (window.updateLog) {
      updateLog.unshift({
        text: '[Q&A] ' + name + ' — ' + category + ': ' + content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        time: new Date().toISOString()
      });
      if (typeof renderFeed === 'function') renderFeed();
    }

    renderQAList();
    showToast('📨 문의가 등록되었습니다');
  };

  window.deleteQA = function (id) {
    if (!confirm('이 문의를 삭제하시겠습니까?')) return;
    let qaList = loadQAData();
    qaList = qaList.filter(function (q) { return q.id !== id; });
    saveQAData(qaList);
    renderQAList();
    showToast('삭제되었습니다');
  };

  window.answerQA = function (id) {
    const answer = prompt('답변을 입력하세요:');
    if (!answer) return;
    const qaList = loadQAData();
    const item = qaList.find(function (q) { return q.id === id; });
    if (item) {
      item.answer = answer;
      item.answeredAt = new Date().toISOString();
      saveQAData(qaList);
      renderQAList();
      showToast('✅ 답변이 등록되었습니다');
    }
  };

  window.renderQAList = function () {
    const el = document.getElementById('qa-list');
    if (!el) return;
    const qaList = loadQAData();

    if (!qaList.length) {
      el.innerHTML = '<div class="empty" style="padding:20px">아직 등록된 문의가 없습니다.</div>';
      return;
    }

    const isMgr = (window.role === 'manager' || window.role === 'master');

    el.innerHTML = qaList.map(function (q) {
      const date = new Date(q.createdAt);
      const dateStr = date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0') + ' ' +
        String(date.getHours()).padStart(2, '0') + ':' +
        String(date.getMinutes()).padStart(2, '0');

      let h = '<div class="qa-item">' +
        '<div class="qa-q">[' + q.category + '] ' + q.content + '</div>' +
        '<div class="qa-meta">' + q.name + ' · ' + dateStr;

      if (isMgr) {
        h += ' · <span style="cursor:pointer;color:var(--blue);font-weight:600" onclick="answerQA(' + q.id + ')">답변</span>';
        h += ' · <span style="cursor:pointer;color:var(--red);font-weight:600" onclick="deleteQA(' + q.id + ')">삭제</span>';
      }
      h += '</div>';

      if (q.answer) {
        h += '<div class="qa-a">💬 <b>답변</b>: ' + q.answer + '</div>';
      }

      h += '</div>';
      return h;
    }).join('');
  };

  // ── 7. 로그인 없이도 가이드 접근 허용 + 권한별 Q&A 버튼 표시 ──
  const _goPageFinal = window.goPage;
  window.goPage = function (id, el) {
    if (id === 'guide') {
      // guide 페이지는 로그인 여부와 관계없이 항상 접근 허용
      document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
      document.querySelectorAll('.nav-item').forEach(function (n) {
        n.classList.remove('active');
        n.style.background = '';
        n.style.borderLeftColor = 'transparent';
        n.style.fontWeight = '500';
        n.querySelectorAll('span').forEach(function (s) { s.style.color = ''; s.style.fontWeight = '500'; });
      });
      document.getElementById('page-guide').classList.add('active');
      const activeEl = el || document.getElementById('ni-guide');
      if (activeEl) {
        activeEl.classList.add('active');
        activeEl.style.background = 'rgba(255,255,255,.15)';
        activeEl.style.borderLeftColor = '#fff';
        activeEl.style.fontWeight = '700';
        activeEl.querySelectorAll('span').forEach(function (s) { s.style.color = '#fff'; s.style.fontWeight = '700'; });
      }
      document.getElementById('topbar-title').textContent = 'IBS 이용 가이드';
      var ph = document.querySelector('#page-guide .ph');
      if (ph) { var h1 = ph.querySelector('h1'); var p = ph.querySelector('p'); if(h1) h1.textContent='IBS Guide'; if(p) p.textContent='IBS 이용 가이드'; }
      renderQAList();
      return;
    }
    _goPageFinal(id, el);
  };

  console.log('✅ IBS Guide patch loaded');
})();
