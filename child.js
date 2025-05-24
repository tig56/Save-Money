'use strict';

const container = document.getElementById('tablesContainer');
const addTableBtn = document.getElementById('addTableBtn');
const bankOptions = [
  "三菱UFJ銀行", "三井住友銀行", "みずほ銀行",
  "りそな銀行", "楽天銀行", "ゆうちょ銀行"
];

const months = ["1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月"
];

addTableBtn.addEventListener('click', () => createSavingsTable());

function createSavingsTable(data = null, index = Date.now()) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('savings-childtable');
  wrapper.dataset.id = index;

  const topBar = document.createElement('div');
  topBar.classList.add('top-bar');

  const yearLabel = document.createElement('span');
  yearLabel.textContent = "年:";
  yearLabel.classList.add('year-label');

  const yearInput = document.createElement('input');
  yearInput.type = 'number';
  yearInput.classList.add('year-input');
  yearInput.value = data?.year || new Date().getFullYear();

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = "🗑️ 削除";
  deleteBtn.classList.add('deleteTableBtn');
  deleteBtn.addEventListener('click', () => {
    container.removeChild(wrapper);
    saveData();
  });

  topBar.appendChild(yearLabel);
  topBar.appendChild(yearInput);
  topBar.appendChild(deleteBtn);

  const tableTop = document.createElement('table');
  tableTop.innerHTML = `
  <thead>
    <tr>
      <th>銀行名</th>
      <th>目標金額 (万)</th>
      <th>結果 (万)</th>
      <th>差額 (万)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><select class="bankSelect">${bankOptions.map(b => `<option value="${b}">${b}</option>`).join('')}</select></td>
      <td class="goalTotalCell">0</td> 
      <td class="totalResult">0</td>
      <td class="difference">0</td>
    </tr>
  </tbody>
`;

  const tableMonth = document.createElement('table');
  tableMonth.innerHTML = `
  <thead>
    <tr>
      <th>月</th>
      <th>設定金額 (万)</th>
      <th>結果 (万)</th>
      <th>差額 (万)</th>
    </tr>
  </thead>
  <tbody></tbody>
`;

  const tbody = tableMonth.querySelector('tbody');

  months.forEach((month, i) => {
    const tr = document.createElement('tr');

    const tdMonth = document.createElement('td');
    tdMonth.textContent = month;
    tr.appendChild(tdMonth);

    const tdGoal = document.createElement('td');
    const inputGoal = document.createElement('input');
    inputGoal.type = 'number';
    inputGoal.value = data?.months?.[i]?.goal ?? 0;
    inputGoal.classList.add('goal-input');
    tdGoal.appendChild(inputGoal);
    tr.appendChild(tdGoal);

    const tdResult = document.createElement('td');
    const inputResult = document.createElement('input');
    inputResult.type = 'number';
    inputResult.value = data?.months?.[i]?.result ?? 0;
    inputResult.classList.add('result-input');
    tdResult.appendChild(inputResult);
    tr.appendChild(tdResult);

    const tdDiff = document.createElement('td');
    tdDiff.textContent = '0';
    tdDiff.classList.add('diff-cell');
    tr.appendChild(tdDiff);

    inputGoal.addEventListener('input', update);
    inputResult.addEventListener('input', update);

    tbody.appendChild(tr);
  });

  wrapper.appendChild(topBar);
  wrapper.appendChild(tableTop);
  wrapper.appendChild(tableMonth);
  container.appendChild(wrapper);

  const goalTotalCell = wrapper.querySelector('.goalTotalCell');
  const totalResultCell = wrapper.querySelector('.totalResult');
  const differenceCell = wrapper.querySelector('.difference');
  const bankSelect = wrapper.querySelector('.bankSelect');

  function update() {
    const goals = tbody.querySelectorAll('.goal-input');
    const results = tbody.querySelectorAll('.result-input');
    const diffs = tbody.querySelectorAll('.diff-cell');

    let totalGoal = 0;
    let totalResult = 0;

    goals.forEach((goal, i) => {
      const g = Number(goal.value) || 0;
      const r = Number(results[i].value) || 0;
      const d = r - g;
      diffs[i].textContent = d.toLocaleString();
      diffs[i].style.color = d >= 0 ? 'green' : 'red';

      totalGoal += g;
      totalResult += r;
    });

    goalTotalCell.textContent = totalGoal.toLocaleString();
    totalResultCell.textContent = totalResult.toLocaleString();

    const diff = totalResult - totalGoal;
    differenceCell.textContent = diff.toLocaleString();
    differenceCell.style.color = diff >= 0 ? 'green' : 'red';

    saveData();
  }

  if (data) {
    bankSelect.value = data.bank;
  }

  update();
}

function saveData() {
  const allTables = container.querySelectorAll('.savings-childtable');
  const saveArray = [];

  allTables.forEach(table => {
    const bank = table.querySelector('.bankSelect').value;
    const year = table.querySelector('.year-input').value;
    const goalInputs = table.querySelectorAll('.goal-input');
    const resultInputs = table.querySelectorAll('.result-input');

    const months = Array.from(goalInputs).map((goal, i) => ({
      goal: Number(goal.value) || 0,
      result: Number(resultInputs[i].value) || 0
    }));

    saveArray.push({ bank, year, months });
  });

  localStorage.setItem('savingsTables', JSON.stringify(saveArray));
}

function loadData() {
  const saved = localStorage.getItem('savingsTables');
  if (!saved) return;

  const data = JSON.parse(saved);
  data.forEach((tableData, index) => createSavingsTable(tableData, index));
}

window.addEventListener('load', loadData);
