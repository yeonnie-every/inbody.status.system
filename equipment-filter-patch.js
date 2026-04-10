/**
 * IBS 장비별 필터 패치
 * 
 * 사용법: 기존 index.html의 </body> 직전에 아래 스크립트 태그를 추가하세요
 * <script src="equipment-filter-patch.js"></script>
 * 
 * 또는 기존 HTML에 직접 3곳 수정 (아래 주석 참고)
 */

(function(){
  // 1. mx-country 셀렉트 바로 뒤에 mx-equipment 셀렉트 추가
  const mxCountry = document.getElementById('mx-country');
  if(mxCountry && !document.getElementById('mx-equipment')){
    const sel = document.createElement('select');
    sel.className = 'fsel';
    sel.id = 'mx-equipment';
    sel.onchange = function(){ renderMatrix(); };
    sel.innerHTML = '<option value="">전체 장비</option>';
    mxCountry.parentNode.insertBefore(sel, mxCountry.nextSibling);
  }

  // 2. fillEquipmentSel 함수 정의
  window.fillEquipmentSel = function(){
    const fp = currentPart === '전체' ? null : currentPart;
    const equipSet = new Set();
    allEntries().forEach(e => {
      if(fp && e.part !== fp) return;
      const m = e.product.match(/^(.+?)\s*\((.+?)\)$/);
      const base = m ? m[1] : e.product;
      equipSet.add(base);
    });
    const sel = document.getElementById('mx-equipment');
    if(sel){
      const prev = sel.value;
      sel.innerHTML = '<option value="">전체 장비</option>' + 
        [...equipSet].sort().map(eq => `<option>${eq}</option>`).join('');
      sel.value = prev || '';
    }
  };

  // 3. 기존 fillCountrySel을 래핑하여 fillEquipmentSel도 호출
  const origFillCountrySel = window.fillCountrySel;
  window.fillCountrySel = function(){
    origFillCountrySel();
    fillEquipmentSel();
  };

  // 4. renderMatrix를 래핑하여 장비 필터 적용
  const origRenderMatrix = window.renderMatrix;
  window.renderMatrix = function(){
    const feq = document.getElementById('mx-equipment')?.value || '';
    
    if(!feq){
      // 장비 필터 없으면 원래 함수 실행
      origRenderMatrix();
      return;
    }

    // 장비 필터가 있는 경우: 임시로 entries를 필터링한 뒤 원래 함수 호출
    const origAllEntries = window.allEntries;
    window.allEntries = function(includeHidden){
      return origAllEntries(includeHidden).filter(e => {
        const m = e.product.match(/^(.+?)\s*\((.+?)\)$/);
        const base = m ? m[1] : e.product;
        return base === feq;
      });
    };
    
    origRenderMatrix();
    
    // 원래 allEntries 복원
    window.allEntries = origAllEntries;
  };

  // 초기 로드 시 장비 셀렉트 채우기
  if(typeof fillEquipmentSel === 'function'){
    fillEquipmentSel();
  }
})();
