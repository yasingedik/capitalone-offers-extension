// content_script.js
// This script runs in the page context to load all offers, then inject UI filters for multiplier and amount.
(async function() {
  console.log('C1 Offers Analyzer: starting content script');

  // 1) Click "View More" until gone
  while (true) {
    const btn = Array.from(document.querySelectorAll('button')).find(b => 
      b.innerText.trim().toLowerCase().includes('view more') && !b.disabled
    );
    if (!btn) {
      console.log('C1 Offers Analyzer: all offers loaded');
      break;
    }
    console.log('C1 Offers Analyzer: clicking View More');
    btn.click();
    await new Promise(res => setTimeout(res, 1500));
  }

  // 2) Annotate each tile with multiplier/amount metadata
  const tiles = Array.from(document.querySelectorAll('div.standard-tile'));
  tiles.forEach(tile => {
    const text = tile.textContent;
    const mulMatch = text.match(/(\d+(?:\.\d+)?)\s*[xX]/);
    const amtMatch = text.match(/([\d,]+)\s*mile/i);
    tile.dataset.hasMultiplier = mulMatch ? 'true' : 'false';
    tile.dataset.hasAmount     = amtMatch ? 'true' : 'false';
  });

  // 3) Inject filter UI panel
  const panel = document.createElement('div');
  panel.id = 'c1-offers-filter-panel';
  Object.assign(panel.style, {
    position: 'fixed', top: '10px', right: '10px',
    background: '#fff', border: '1px solid #ccc', padding: '8px',
    'border-radius': '4px', 'z-index': 9999, 'font-family': 'Arial, sans-serif',
    'font-size': '14px', color: '#333'
  });
  panel.innerHTML = `
    <label style="margin-right: 8px;">
      <input type="checkbox" id="filterMultiplier" checked>
      Multipliers
    </label>
    <label>
      <input type="checkbox" id="filterAmount" checked>
      Amount
    </label>
  `;
  document.body.appendChild(panel);

  // 4) Filter logic
  function updateFilters() {
    const showMul = document.getElementById('filterMultiplier').checked;
    const showAmt = document.getElementById('filterAmount').checked;

    tiles.forEach(tile => {
      const hasMul = tile.dataset.hasMultiplier === 'true';
      const hasAmt = tile.dataset.hasAmount === 'true';
      let visible;
      if ((!showMul && !showAmt) || (showMul && showAmt)) {
        visible = true;
      } else if (showMul && !showAmt) {
        visible = hasMul;
      } else if (!showMul && showAmt) {
        visible = hasAmt;
      }
      tile.style.display = visible ? '' : 'none';
    });
  }

  // 5) Attach event listeners
  document.getElementById('filterMultiplier').addEventListener('change', updateFilters);
  document.getElementById('filterAmount').addEventListener('change', updateFilters);

  console.log('C1 Offers Analyzer: filter UI injected');
})();
