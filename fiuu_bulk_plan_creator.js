// ==UserScript==
// @name         Fiuu Bulk Plan Creator
// @namespace    https://admin.fiuu.com
// @version      3.2.0
// @description  Bulk create plans via Excel upload — MY channels
// @author       Kiki
// @match        https://admin.fiuu.com/RMS/admin/plan.php*
// @require      https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js
// @grant        none
// @updateURL    https://bulkplancreator-production.up.railway.app/plan-creator.js
// @downloadURL  https://bulkplancreator-production.up.railway.app/plan-creator.js
// ==/UserScript==

(function () {
  'use strict';

  if (window.location.search.includes('op=edit_plan')) return;

  // ─── CHANNEL DEFINITIONS BY COUNTRY ────────────────────────────────────────
  const MY_CHANNELS = [
    'MYDEBIT_CP',
    'FPX_B2B', 'FPX-TPA',
    'MB2U_QRPay-Push',
    'RPP_DuitNowQR',
    'RPP_DuitNowQR@SUB@DOMESTIC_CACC', 'RPP_DuitNowQR@SUB@DOMESTIC_SVGS',
    'RPP_DuitNowQR@SUB@DOMESTIC_CCRD', 'RPP_DuitNowQR@SUB@DOMESTIC_WALL',
    'RPP_DuitNowQR@SUB@CROSSBORDER_CACC', 'RPP_DuitNowQR@SUB@CROSSBORDER_WALL',
    'RPP_DuitNowQR@SUB@CROSSBORDER_CCRD', 'RPP_DuitNowQR@SUB@CROSSBORDER_SVGS',
    'TNG-EWALLET',
    'BOOST-OFFLINE', 'MB2U_QRPay-Pull', 'RPP_DuitNowQR-Offline_MP',
    'RPP_DuitNowQR-Offline_MP@SUB@DOMESTIC_CACC', 'RPP_DuitNowQR-Offline_MP@SUB@DOMESTIC_SVGS',
    'RPP_DuitNowQR-Offline_MP@SUB@DOMESTIC_CCRD', 'RPP_DuitNowQR-Offline_MP@SUB@DOMESTIC_WALL',
    'RPP_DuitNowQR-Offline_MP@SUB@CROSSBORDER_CACC', 'RPP_DuitNowQR-Offline_MP@SUB@CROSSBORDER_WALL',
    'RPP_DuitNowQR-Offline_MP@SUB@CROSSBORDER_CCRD', 'RPP_DuitNowQR-Offline_MP@SUB@CROSSBORDER_SVGS',
    'TNG-EWALLET-Offline', 'TNG-EWALLET-Offline-MP',
    'Cash-711'
  ];

  const CN_CHANNELS = [
    'CIL_UnionPay',
    'CIL_UPI_CP',
    'GUPOP',
    'AlipayPlus',
    'AlipayPlus@SUB@ALIPAY', 'AlipayPlus@SUB@GCASH',
    'AlipayPlus@SUB@KAKAOPAY', 'AlipayPlus@SUB@RABBITLINEPAY', 'AlipayPlus@SUB@TRUEMONEYWALLET',
    'WeChatPay',
    'AlipayPlus-Offline',
    'AlipayPlus-Offline@SUB@ALIPAY', 'AlipayPlus-Offline@SUB@GCASH',
    'AlipayPlus-Offline@SUB@KAKAOPAY', 'AlipayPlus-Offline@SUB@RABBITLINEPAY', 'AlipayPlus-Offline@SUB@TRUEMONEYWALLET',
    'UnionPay-Offline', 'WeChatPay-Offline'
  ];

  const SG_CHANNELS = [
    'GrabPay', 'ShopeePay',
    'GrabPay-Offline', 'ShopeePay-Offline',
    'Atome', 'Atome-Offline'
  ];

  const US_CHANNELS = [
    'CIL_Mastercard',
    'CIL_Mastercard@SUB@DOMESTIC_DEBIT', 'CIL_Mastercard@SUB@DOMESTIC_CREDIT',
    'CIL_Mastercard@SUB@FOREIGN_DEBIT', 'CIL_Mastercard@SUB@FOREIGN_CREDIT',
    'CIL_Mastercard@SUB@DOMESTIC_PREPAID', 'CIL_Mastercard@SUB@FOREIGN_PREPAID',
    'CIL_Visa',
    'CIL_Visa@SUB@DOMESTIC_DEBIT', 'CIL_Visa@SUB@DOMESTIC_CREDIT',
    'CIL_Visa@SUB@FOREIGN_DEBIT', 'CIL_Visa@SUB@FOREIGN_CREDIT',
    'CIL_Visa@SUB@DOMESTIC_PREPAID', 'CIL_Visa@SUB@FOREIGN_PREPAID',
    'CIL_Diners',
    'CIL_Diners_CP',
    'CIL_Master_CP',
    'CIL_Master_CP@SUB@DOMESTIC_DEBIT', 'CIL_Master_CP@SUB@DOMESTIC_CREDIT',
    'CIL_Master_CP@SUB@FOREIGN_DEBIT', 'CIL_Master_CP@SUB@FOREIGN_CREDIT',
    'CIL_Master_CP@SUB@DOMESTIC_PREPAID', 'CIL_Master_CP@SUB@FOREIGN_PREPAID',
    'CIL_Visa_CP',
    'CIL_Visa_CP@SUB@DOMESTIC_DEBIT', 'CIL_Visa_CP@SUB@DOMESTIC_CREDIT',
    'CIL_Visa_CP@SUB@FOREIGN_DEBIT', 'CIL_Visa_CP@SUB@FOREIGN_CREDIT',
    'CIL_Visa_CP@SUB@DOMESTIC_PREPAID', 'CIL_Visa_CP@SUB@FOREIGN_PREPAID'
  ];

  // All channels combined — used for building active_channel
  const ALL_COUNTRY_CHANNELS = [
    ...MY_CHANNELS,
    ...CN_CHANNELS,
    ...SG_CHANNELS,
    ...US_CHANNELS
  ];

  // ─── EXCEL TEMPLATE (embedded base64) ──────────────────────────────────────────
  const TEMPLATE_B64 = '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';

  function downloadTemplate() {
    const bin = atob(TEMPLATE_B64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'fiuu_plan_template.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── PARSE CELL VALUE ────────────────────────────────────────────────────────
  // Cell format: "1.5" or "1.5, cost=0.50" or "0, cost=0.50, fee=both, flexi=Y, cur=MYR"
  // First number = min rate (required to enable channel)
  // Named params: cost, cost_min, cost_max, cur, fee, flexi
  function parseCell(raw) {
    if (raw === '' || raw === undefined || raw === null) return null;
    const str = String(raw).trim();
    if (!str) return null;

    const parts = str.split(',').map(s => s.trim());
    const minRate = parseFloat(parts[0]);
    if (isNaN(minRate)) return null;

    // Parse named params
    const params = {};
    for (let i = 1; i < parts.length; i++) {
      const eqIdx = parts[i].indexOf('=');
      if (eqIdx === -1) continue;
      const k = parts[i].substring(0, eqIdx).trim().toLowerCase();
      const v = parts[i].substring(eqIdx + 1).trim();
      params[k] = v;
    }

    // Rate formula: min → min+1 → min+3
    const rateMin = minRate;
    const rateDef = +(minRate + 1).toFixed(4);
    const rateMax = +(minRate + 3).toFixed(4);

    // Cost formula: same as rate (+1, +3) if cost provided
    let costMin = '', costDef = '0.0000', costMax = '';
    if (params.cost !== undefined) {
      const c = parseFloat(params.cost);
      if (!isNaN(c)) {
        costMin  = c.toFixed(4);
        costDef  = (c + 1).toFixed(4);
        costMax  = (c + 3).toFixed(4);
      }
    }
    // Allow manual override for cost_min / cost_max
    if (params.cost_min !== undefined) costMin = params.cost_min;
    if (params.cost_max !== undefined) costMax = params.cost_max;

    return {
      rateMin, rateDef, rateMax,
      costMin, costDef, costMax,
      cur:     params.cur    || 'ALL',
      fee:     params.fee    || 'default',
      flexi:   params.flexi  || 'D',
    };
  }

  // ─── EXCEL PARSING ───────────────────────────────────────────────────────────
  // Row 1 = category labels, Row 2 = column keys, Row 3 = labels, Row 4 = instructions, Row 5+ = data
  function parseSheet(ws) {
    if (!ws) return [];
    const all = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    const row2 = all[1] || [];
    const isTemplate = row2.some(h => String(h).split('\n')[0].trim().match(/^(plan_type|plan_name|MYDEBIT_CP|GrabPay|CIL_|AlipayPlus|RPP_)/));
    let headers, dataRows;
    if (isTemplate) { headers = row2; dataRows = all.slice(4); }
    else { headers = all[0] || []; dataRows = all.slice(1); }
    return dataRows.map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        if (!h) return;
        const cleanKey = String(h).trim().split('\n')[0].trim();
        if (cleanKey) obj[cleanKey] = row[i] !== undefined ? row[i] : '';
      });
      return obj;
    }).filter(r => {
      const name = String(r.plan_name || '').trim();
      // Skip empty rows and internal notes (remarks, instructions)
      return name !== '' && !name.startsWith('📌') && !name.startsWith('📝');
    });
  }

  function parseExcelWorkbook(wb) {
    const plansSheet = wb.Sheets['Plans'] || wb.Sheets[wb.SheetNames[0]];
    const planRows = parseSheet(plansSheet);
    const channelSheetNames = wb.SheetNames.filter(n => n !== 'Plans' && n !== 'How To Use');
    const channelData = {};
    channelSheetNames.forEach(sheetName => {
      const rows = parseSheet(wb.Sheets[sheetName]);
      rows.forEach(row => {
        const planName = String(row.plan_name || '').trim();
        if (!planName) return;
        if (!channelData[planName]) channelData[planName] = {};
        Object.entries(row).forEach(([k, v]) => {
          if (k !== 'plan_name' && v !== '' && v !== undefined) channelData[planName][k] = v;
        });
      });
    });
    return planRows.map(plan => {
      const planName = String(plan.plan_name || '').trim();
      return { ...plan, ...(channelData[planName] || {}) };
    });
  }


  // ─── INJECT BUTTON ───────────────────────────────────────────────────────────
  const addNew = [...document.querySelectorAll('button')]
    .find(b => b.textContent.trim().toLowerCase().includes('add new'));
  if (!addNew) return;

  const btn = document.createElement('button');
  btn.id = 'bpc-trigger';
  btn.textContent = '📊 Bulk Create Plans';
  btn.style.cssText = 'background:#1a73e8;color:white;padding:7px 16px;border:none;border-radius:4px;cursor:pointer;font-size:14px;font-weight:bold;margin-left:10px;vertical-align:middle;';
  addNew.insertAdjacentElement('afterend', btn);

  // ─── MODAL ───────────────────────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = 'bpc-overlay';
  overlay.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.55);z-index:999999;overflow-y:auto;padding:40px 0;box-sizing:border-box;';
  overlay.innerHTML = `
    <div style="background:#fff;width:680px;margin:0 auto;border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.3);font-family:Arial,sans-serif;font-size:14px;overflow:hidden;">
      <div style="background:#1a73e8;color:#fff;padding:18px 24px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:17px;font-weight:bold;">📊 Bulk Plan Creator — MY Channels</span>
        <span id="bpc-x" style="cursor:pointer;font-size:22px;">✕</span>
      </div>
      <div style="padding:24px;">
        <div style="margin-bottom:14px;text-align:right;">
          <button id="bpc-dl-template" style="background:#f1f3f4;color:#1a73e8;border:1px solid #1a73e8;padding:6px 14px;border-radius:4px;cursor:pointer;font-size:13px;font-weight:bold;">
            ⬇ Download Template
          </button>
        </div>
        <div style="margin-bottom:18px;">
          <label style="font-weight:bold;display:block;margin-bottom:8px;">Step 1 — Upload Excel file</label>
          <div id="bpc-dz" style="border:2px dashed #1a73e8;border-radius:8px;padding:24px;text-align:center;cursor:pointer;background:#f8f9ff;">
            <div style="font-size:36px;">📂</div>
            <div style="font-weight:bold;">Click to upload</div>
            <div style="font-size:12px;color:#999;margin-top:4px;">.xlsx files only</div>
            <input type="file" id="bpc-file" accept=".xlsx,.xls" style="display:none;">
          </div>
        </div>
        <div id="bpc-preview" style="display:none;margin-bottom:18px;">
          <label style="font-weight:bold;display:block;margin-bottom:8px;">Step 2 — Preview & Confirm</label>
          <div id="bpc-pc"></div>
        </div>
        <div style="display:flex;gap:10px;margin-bottom:8px;">
          <button id="bpc-run" disabled style="flex:1;background:#28a745;color:#fff;border:none;padding:11px;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer;opacity:0.45;">▶ Create All Plans</button>
          <button id="bpc-cancel" style="background:#f1f3f4;color:#333;border:none;padding:11px 18px;border-radius:6px;cursor:pointer;">Cancel</button>
        </div>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#888;font-size:12px;margin-bottom:4px;">
          <input type="checkbox" id="bpc-debug"> 🔍 Debug mode
        </label>
        <div id="bpc-log" style="display:none;margin-top:10px;background:#1e1e1e;color:#d4d4d4;border-radius:6px;padding:14px;font-family:monospace;font-size:12px;max-height:300px;overflow-y:auto;line-height:1.8;"></div>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  document.getElementById('bpc-dl-template').onclick = downloadTemplate;

  // ─── EVENTS ──────────────────────────────────────────────────────────────────
  let plans = [];

  function closeModal() {
    overlay.style.display = 'none';
    plans = [];
    document.getElementById('bpc-file').value = '';
    document.getElementById('bpc-preview').style.display = 'none';
    document.getElementById('bpc-log').style.display = 'none';
    document.getElementById('bpc-log').innerHTML = '';
    const rb = document.getElementById('bpc-run');
    rb.disabled = true; rb.style.opacity = '0.45'; rb.textContent = '▶ Create All Plans';
  }

  btn.onclick = () => overlay.style.display = 'block';
  document.getElementById('bpc-x').onclick = closeModal;
  document.getElementById('bpc-cancel').onclick = closeModal;
  overlay.onclick = e => { if (e.target === overlay) closeModal(); };
  document.getElementById('bpc-dz').onclick = () => document.getElementById('bpc-file').click();

  document.getElementById('bpc-file').onchange = function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' });
        const rows = parseExcelWorkbook(wb);
        if (!rows.length) { alert('No valid plan rows found. Check that Plans sheet has data from row 5.'); return; }
        plans = rows;
        renderPreview(rows);
      } catch (err) { alert('Error reading Excel: ' + err.message); }
    };
    reader.readAsArrayBuffer(file);
  };

  function renderPreview(rows) {
    const trs = rows.map((r, i) => {
      const active = ALL_COUNTRY_CHANNELS.filter(ch => parseCell(r[ch]) !== null).length;
      return `<tr style="border-bottom:1px solid #eee;">
        <td style="padding:7px;">${i + 1}</td>
        <td style="padding:7px;font-weight:bold;">${r.plan_name || '—'}</td>
        <td style="padding:7px;">${r.display_name || '—'}</td>
        <td style="padding:7px;"><span style="background:#e8f0fe;color:#1a73e8;padding:2px 8px;border-radius:10px;font-size:12px;">${r.plan_type || 'Online'}</span></td>
        <td style="padding:7px;color:#28a745;font-weight:bold;">${active} channels</td>
      </tr>`;
    }).join('');

    document.getElementById('bpc-pc').innerHTML = `
      <div style="background:#e8f5e9;color:#2e7d32;padding:10px;border-radius:6px;margin-bottom:10px;font-weight:bold;">✅ ${rows.length} plan(s) ready to create</div>
      <div style="overflow-x:auto;border-radius:6px;border:1px solid #eee;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead><tr style="background:#f8f9fa;border-bottom:2px solid #eee;">
            <th style="padding:8px;text-align:left;">#</th>
            <th style="padding:8px;text-align:left;">Plan Name</th>
            <th style="padding:8px;text-align:left;">Display Name</th>
            <th style="padding:8px;text-align:left;">Type</th>
            <th style="padding:8px;text-align:left;">Channels</th>
          </tr></thead>
          <tbody>${trs}</tbody>
        </table>
      </div>`;

    document.getElementById('bpc-preview').style.display = 'block';
    const rb = document.getElementById('bpc-run');
    rb.disabled = false; rb.style.opacity = '1';
  }

  // ─── CREATE ALL ───────────────────────────────────────────────────────────────
  document.getElementById('bpc-run').onclick = async function () {
    const log = document.getElementById('bpc-log');
    const debugMode = document.getElementById('bpc-debug')?.checked;
    log.style.display = 'block'; log.innerHTML = '';
    this.disabled = true; this.style.opacity = '0.5'; this.textContent = '⏳ Creating...';

    let ok = 0, fail = 0;
    const addLog = h => { log.innerHTML += `<div>${h}</div>`; log.scrollTop = log.scrollHeight; };
    const sleep  = ms => new Promise(r => setTimeout(r, ms));
    const normType = v => {
      const t = String(v||'Online').trim().toLowerCase().replace(/[^a-z]/g,'');
      if(t==='offline') return 'Offline';
      if(t==='both') return 'Both';
      return 'Online';
    };

    for (let i = 0; i < plans.length; i++) {
      const p = plans[i];
      addLog(`⏳ [${i+1}/${plans.length}] <span style="color:#9cdcfe;">${p.plan_name}</span>...`);

      try {
        // Build active_channel string
        const channelEntries = [];
        let chCount = 0;

        ALL_COUNTRY_CHANNELS.forEach(ch => {
          const cfg = parseCell(p[ch]);
          if (!cfg) return;

          const entry = [
            ch,           // [0]  channel key
            cfg.rateMin,  // [1]  min rate
            cfg.rateDef,  // [2]  default rate
            cfg.rateMax,  // [3]  max rate
            cfg.rateMin,  // [4]  min rate range
            cfg.rateMax,  // [5]  max rate range
            cfg.costMin,  // [6]  min cost       ✅ confirmed
            cfg.costDef,  // [7]  default cost   ✅ confirmed
            cfg.costMax,  // [8]  max cost       ✅ confirmed
            cfg.costMin,  // [9]  min_cost_range (customize cost lower bound)
            cfg.costMax,  // [10] max_cost_range (customize cost upper bound)
            cfg.fee,      // [11] fee_option      ✅ confirmed
            cfg.flexi,    // [12] onflexi         ✅ confirmed
            '0',          // [13] mdr_charge_type
            'NA',         // [14] cap_limit
            cfg.cur,      // [15] cur_cost        ✅ confirmed
            'ALL',        // [16] cur_cap_amt
            ''            // [17] cap_amt
          ].join('|');

          channelEntries.push(entry);
          chCount++;
        });

        if (chCount === 0) {
          addLog(`❌ <span style="color:#f44747;">${p.plan_name}</span> — No channels found (check Excel rates)`);
          fail++; continue;
        }

        const activeChannel = channelEntries.join(',');

        const body = new URLSearchParams();
        body.append('op', 'save_plan');
        body.append('planid', '');
        body.append('plan_type', normType(p.plan_type));
        body.append('plan_icon', '');
        body.append('plan_display_name', String(p.display_name||'').trim());
        body.append('plan_name', String(p.plan_name||'').trim());
        body.append('plan_description', '');
        body.append('plan_sign_up_fee', '');
        body.append('plan_maintenance_fee', '');
        body.append('plan_user_id', '');
        body.append('plan_sales_pic', String(p.sales_pic||'').trim());
        body.append('plan_country_included', '');
        body.append('plan_country_excluded', '');
        body.append('plan_business_type_included', '');
        body.append('plan_business_type_excluded', '');
        body.append('plan_entity_type', 'Company');
        body.append('stmPeriod', '');
        body.append('plan_icon_add', '');
        body.append('is_booster', 'No');
        body.append('active_channel', activeChannel);

        const res = await fetch('https://admin.fiuu.com/RMS/admin/plan.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          credentials: 'include',
          body: body.toString()
        });

        if (!res.ok) { addLog(`❌ <span style="color:#f44747;">${p.plan_name}</span> — HTTP ${res.status}`); fail++; continue; }

        const text = await res.text();
        const finalUrl = res.url;

        // ── Extract plan ID from response HTML ───────────────────────────────
        // planid is in a hidden input: <input name="planid" value="XXXX">
        const planIdMatch = text.match(/name=.planid.[^>]*value=.(\d+)/) ||
                            text.match(/value=.(\d+).[^>]*name=.planid/) ||
                            text.match(/planid=(\d+)/);
        const planId = planIdMatch ? planIdMatch[1] : null;
        const planUrl = planId
          ? `https://admin.fiuu.com/RMS/admin/plan.php?op=edit_plan&planid=${planId}`
          : null;

        // Debug mode
        if (debugMode) {
          addLog(`<span style="color:#888;">--- DEBUG [${p.plan_name}] ---</span>`);
          addLog(`<span style="color:#888;">HTTP: ${res.status} | URL: ${finalUrl}</span>`);
          const sentChs = channelEntries.map(e => e.split('|')[0]);
          addLog(`<span style="color:#9cdcfe;">plan_type sent: ${normType(p.plan_type)} (raw Excel value: "${p.plan_type}")</span>`);
          addLog(`<span style="color:#9cdcfe;">Sent ${sentChs.length} channels: ${sentChs.join(', ')}</span>`);
          addLog(`<span style="color:#9cdcfe;">active_channel preview: ${activeChannel.substring(0, 120)}...</span>`);
          const stripped = text.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().substring(0, 300);
          addLog(`<span style="color:#ce9178;">Response: ${stripped}</span>`);
          addLog(`<span style="color:#888;">--- END DEBUG ---</span>`);
        }

        // ── Detect success/fail ──────────────────────────────────────────────
        const html = text.toLowerCase();
        const isDuplicate = html.includes('duplicate entry') || html.includes('plan name already') || html.includes('already been taken');

        if (isDuplicate) {
          addLog(`❌ <span style="color:#f44747;">${p.plan_name}</span> — Duplicate plan name`);
          fail++;
        } else {
          const linkHtml = planUrl
            ? ` <a href="${planUrl}" target="_blank" style="color:#4ec9b0;font-size:11px;text-decoration:underline;">👉 View Plan (ID: ${planId})</a>`
            : ` <span style="color:#888;font-size:11px;">(verify in list)</span>`;
          addLog(`✅ <span style="color:#4ec9b0;">${p.plan_name}</span> — created!${linkHtml}`);
          ok++;
        }

      } catch (err) {
        addLog(`❌ <span style="color:#f44747;">${p.plan_name}</span> — ${err.message}`);
        fail++;
      }

      await sleep(700);
    }

    addLog(`<br><span style="color:#dcdcaa;font-weight:bold;">🎉 Done — ${ok} created, ${fail} failed.</span>`);
    this.textContent = `✅ Done! (${ok}/${plans.length})`;
  };

})();
