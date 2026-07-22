const state = {
    data: [],
    view: 'transformation',
    transformation: 'all',
    affix: 'all',
    level: 'all',
    query: '',
    expandedId: null
};

const labels = {
    'verb-to-noun': 'Verb → Nomen',
    'verb-to-adjective': 'Verb → Adjektiv',
    'noun-to-adjective': 'Nomen → Adjektiv',
    'adjective-to-noun': 'Adjektiv → Nomen',
    'noun-to-verb': 'Nomen → Verb'
};

const elements = {
    viewTabs: document.querySelector('#view-tabs'),
    transformationTabs: document.querySelector('#transformation-tabs'),
    transformationRow: document.querySelector('#transformation-row'),
    affixTabs: document.querySelector('#affix-tabs'),
    affixRow: document.querySelector('#affix-row'),
    levelTabs: document.querySelector('#level-tabs'),
    search: document.querySelector('#wb-search'),
    results: document.querySelector('#wb-results'),
    empty: document.querySelector('#wb-empty'),
    count: document.querySelector('#result-count'),
    description: document.querySelector('#active-description')
};

function button(value, label, active, attribute) {
    const item = document.createElement('button');
    item.type = 'button';
    item.dataset[attribute] = value;
    item.textContent = label;
    item.classList.toggle('active', active);
    return item;
}

function populateFilters() {
    const transformations = [...new Set(state.data.map(item => item.transformation))];
    const affixes = [...new Set(state.data.map(item => item.affix))].sort((a, b) => a.localeCompare(b, 'de'));
    const levels = [...new Set(state.data.map(item => item.level))].sort();

    elements.transformationTabs.replaceChildren(button('all', '全部', true, 'transformation'));
    transformations.forEach(value => elements.transformationTabs.append(button(value, labels[value] || value, false, 'transformation')));
    elements.affixTabs.replaceChildren(button('all', '全部', true, 'affix'));
    affixes.forEach(value => elements.affixTabs.append(button(value, value, false, 'affix')));
    elements.levelTabs.replaceChildren(button('all', '全部', true, 'level'));
    levels.forEach(value => elements.levelTabs.append(button(value, value, false, 'level')));
}

function searchableText(item) {
    return [item.baseWord, item.targetWord, item.meaningZh, item.meaningDe, item.affix, item.example, ...item.family, ...item.collocations].join(' ').toLowerCase();
}

function filteredData() {
    return state.data.filter(item => {
        const transformationMatches = state.transformation === 'all' || item.transformation === state.transformation;
        const affixMatches = state.affix === 'all' || item.affix === state.affix;
        const levelMatches = state.level === 'all' || item.level === state.level;
        const queryMatches = !state.query || searchableText(item).includes(state.query);
        return transformationMatches && affixMatches && levelMatches && queryMatches;
    });
}

function text(tag, value, className) {
    const node = document.createElement(tag);
    node.textContent = value;
    if (className) node.className = className;
    return node;
}

function detailSection(title, content, wide = false) {
    const section = document.createElement('section');
    if (wide) section.className = 'wb-wide';
    section.append(text('h3', title));
    section.append(content);
    return section;
}

function makeList(items) {
    const list = document.createElement('ul');
    items.forEach(item => list.append(text('li', item)));
    return list;
}

function makeDetail(item) {
    const row = document.createElement('tr');
    row.className = 'wb-detail-row';
    const cell = document.createElement('td');
    cell.colSpan = 6;
    const detail = document.createElement('div');
    detail.className = 'wb-detail';

    const rule = document.createElement('div');
    rule.append(text('p', item.rule));
    rule.append(text('p', item.notes));
    detail.append(detailSection('构词规律', rule));

    const meaning = document.createElement('div');
    meaning.append(text('p', item.meaningZh));
    meaning.append(text('p', item.meaningDe));
    meaning.append(text('p', item.example));
    detail.append(detailSection('含义与例句', meaning));

    const family = document.createElement('div');
    family.className = 'wb-family';
    item.family.forEach((word, index) => {
        if (index) family.append(text('i', '→'));
        family.append(text('span', word));
    });
    detail.append(detailSection('词族', family, true));
    detail.append(detailSection('高频搭配', makeList(item.collocations), true));
    cell.append(detail);
    row.append(cell);
    return row;
}

function makeRow(item) {
    const row = document.createElement('tr');
    row.className = 'wb-result-row';
    row.tabIndex = 0;
    row.dataset.id = item.id;
    row.setAttribute('aria-expanded', String(state.expandedId === item.id));

    const baseCell = document.createElement('td');
    baseCell.append(text('span', item.baseWord, 'wb-word'));
    baseCell.append(text('span', item.baseType, 'wb-type'));
    row.append(baseCell);
    row.append(text('td', labels[item.transformation] || item.transformation));
    const affixCell = document.createElement('td');
    affixCell.append(text('span', item.affix, 'wb-pill'));
    row.append(affixCell);
    const targetCell = document.createElement('td');
    targetCell.append(text('span', `${item.article ? `${item.article} ` : ''}${item.targetWord}`, 'wb-word'));
    targetCell.append(text('span', item.targetType, 'wb-type'));
    row.append(targetCell);
    row.append(text('td', item.meaningZh));
    const levelCell = document.createElement('td');
    levelCell.append(text('span', item.level, 'wb-pill'));
    row.append(levelCell);
    return row;
}

function render() {
    const data = filteredData();
    elements.results.replaceChildren();
    data.forEach(item => {
        elements.results.append(makeRow(item));
        if (state.expandedId === item.id) elements.results.append(makeDetail(item));
    });
    elements.count.textContent = data.length;
    elements.empty.hidden = data.length > 0;
    elements.transformationRow.hidden = state.view === 'affix';
    elements.affixRow.hidden = state.view === 'family';
    elements.description.textContent = {
        transformation: '按词性转换查看来源词与目标词。',
        affix: '按词缀比较不同转换关系中的构词方式。',
        family: '搜索一个词，查看相关词族、搭配与派生关系。'
    }[state.view];
}

function selectTab(container, target, dataKey, stateKey) {
    const selected = target.closest(`button[data-${dataKey}]`);
    if (!selected) return;
    state[stateKey] = selected.dataset[stateKey];
    [...container.querySelectorAll('button')].forEach(item => item.classList.toggle('active', item === selected));
    state.expandedId = null;
    render();
}

elements.viewTabs.addEventListener('click', event => selectTab(elements.viewTabs, event.target, 'view', 'view'));
elements.transformationTabs.addEventListener('click', event => selectTab(elements.transformationTabs, event.target, 'transformation', 'transformation'));
elements.affixTabs.addEventListener('click', event => selectTab(elements.affixTabs, event.target, 'affix', 'affix'));
elements.levelTabs.addEventListener('click', event => selectTab(elements.levelTabs, event.target, 'level', 'level'));
elements.search.addEventListener('input', event => {
    state.query = event.target.value.trim().toLowerCase();
    state.expandedId = null;
    render();
});
elements.results.addEventListener('click', event => {
    const row = event.target.closest('.wb-result-row');
    if (!row) return;
    state.expandedId = state.expandedId === row.dataset.id ? null : row.dataset.id;
    render();
});
elements.results.addEventListener('keydown', event => {
    if (!['Enter', ' '].includes(event.key)) return;
    const row = event.target.closest('.wb-result-row');
    if (!row) return;
    event.preventDefault();
    state.expandedId = state.expandedId === row.dataset.id ? null : row.dataset.id;
    render();
});

async function loadData() {
    const localPath = 'data/wortbildung.json?v=20260722';
    const rawPath = 'https://raw.githubusercontent.com/haruru6666/haruru6666.github.io/main/data/wortbildung.json';
    let response;
    try {
        response = await fetch(window.location.protocol === 'file:' ? rawPath : localPath);
        if (!response.ok && window.location.protocol !== 'file:') response = await fetch(rawPath);
    } catch (error) {
        response = await fetch(rawPath);
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.data = await response.json();
    populateFilters();
    render();
}

loadData().catch(error => {
    document.querySelector('.wb-table-card').innerHTML = `<p class="wb-load-error">构词数据暂时无法加载（${error.message}）。请检查网络或等待 GitHub Pages 完成部署。</p>`;
});
