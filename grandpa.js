'use strict';

const table = document.getElementById('assetTable');
const addBankBtn = document.getElementById('addBank');
const totalDisplay = document.querySelector('h2');

const BANK_OPTIONS = [
  "三菱UFJ銀行", "三井住友銀行", "みずほ銀行",
  "りそな銀行", "楽天銀行", "ゆうちょ銀行", "積立NISA"
];

// 銀行の行を追加
function addBankRow(data = null) {
  const tr = document.createElement('tr');

  // 銀行名セル
  const tdBank = document.createElement('td');
  const select = document.createElement('select');
  BANK_OPTIONS.forEach(b => {
    const option = document.createElement('option');
    option.value = b;
    option.textContent = b;
    select.appendChild(option);
  });
  if(data?.bank) select.value = data.bank;
  tdBank.appendChild(select);
  tr.appendChild(tdBank);

  // 金額セル
  const tdAmount = document.createElement('td');
  const input = document.createElement('input');
  input.type = 'number';
  input.value = data?.amount || 0;
  tdAmount.appendChild(input);
  tr.appendChild(tdAmount);

  // 削除セル
  const tdDel = document.createElement('td');
  const delBtn = document.createElement('button');
  delBtn.textContent = "🗑️";
  delBtn.addEventListener('click', () => {
    tr.remove();
    updateTotal();
    saveData();
  });
  tdDel.appendChild(delBtn);
  tr.appendChild(tdDel);

  table.appendChild(tr);

  // 入力値が変わったら合計更新
  input.addEventListener('input', () => {
    updateTotal();
    saveData();
  });
  select.addEventListener('change', saveData);

  updateTotal();
}

function updateTotal() {
  let total = 0;
  const rows = table.querySelectorAll('tr');
  rows.forEach((row, i) => {
    if(i === 0) return; // ヘッダー行はスキップ
    const input = row.querySelector('input[type="number"]');
    total += Number(input.value) || 0;
  });
  totalDisplay.textContent = `合計資産金額 : ${total.toLocaleString()}円`;
}

function saveData() {
  const rows = table.querySelectorAll('tr');
  const data = [];
  rows.forEach((row, i) => {
    if(i === 0) return;
    const bank = row.querySelector('select').value;
    const amount = Number(row.querySelector('input[type="number"]').value) || 0;
    data.push({ bank, amount });
  });
  localStorage.setItem('grandpaAssets', JSON.stringify(data));
}

function loadData() {
  const saved = localStorage.getItem('grandpaAssets');
  if(!saved) return;
  const data = JSON.parse(saved);
  // 既存行は1行のみ。初期行は削除して再生成
  while(table.rows.length > 1) {
    table.deleteRow(1);
  }
  data.forEach(d => addBankRow(d));
  updateTotal();
}

addBankBtn.addEventListener('click', () => addBankRow());

window.addEventListener('load', loadData);
