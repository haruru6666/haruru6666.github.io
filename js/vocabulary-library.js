const params = new URLSearchParams(window.location.search);
const requestedCategory = params.get('category') || 'redemittel';
const state = { index: null, category: requestedCategory, query: '' };

const elements = {
    title: document.querySelector('#category-title'),
    description: document.querySelector('#category-description'),
    moduleLabel: document.querySelector('#module-label'),
    search: document.querySelector('#entry-search'),
    count: document.querySelector('#entry-count'),
    grid: document.querySelector('#entry-grid'),
    empty: document.querySelector('#entry-empty')
};

function makeElement(tag, value, className) {
    const node = document.createElement(tag);
    if (value) node.textContent = value;
    if (className) node.className = className;
    return node;
}

function currentCategory() {
    return state.index.categories.find(category => category.id === state.category) || state.index.categories[0];
}

function visibleEntries() {
    return state.index.entries.filter(entry => {
        if (entry.category !== state.category) return false;
        const text = [entry.title, entry.meaningZh, entry.level, ...entry.tags].join(' ').toLowerCase();
        return !state.query || text.includes(state.query);
    });
}

function makeCard(entry) {
    const card = makeElement('article', '', 'vl-card');
    const meta = makeElement('div', '', 'vl-card-meta');
    meta.append(makeElement('span', entry.level, 'vl-pill'));
    card.append(meta);
    card.append(makeElement('h2', entry.title));
    card.append(makeElement('p', entry.meaningZh));
    const tags = makeElement('div', '', 'vl-tags');
    entry.tags.forEach(tag => tags.append(makeElement('span', tag)));
    card.append(tags);
    const open = makeElement('a', '打开知识页 →', 'vl-open');
    open.href = `markdown-viewer.html?file=${encodeURIComponent(entry.path)}`;
    card.append(open);
    return card;
}

function render() {
    const category = currentCategory();
    state.category = category.id;
    elements.title.textContent = `${category.name} · ${category.nameZh}`;
    elements.description.textContent = category.description;
    elements.moduleLabel.textContent = category.module === 'writing' ? 'Writing material library' : 'Vocabulary knowledge library';
    document.title = `${category.name} · DLKB`;

    const entries = visibleEntries();
    elements.grid.replaceChildren(...entries.map(makeCard));
    elements.count.textContent = entries.length;
    elements.empty.hidden = entries.length > 0;
}

elements.search.addEventListener('input', event => {
    state.query = event.target.value.trim().toLowerCase();
    render();
});

async function loadIndex() {
    const local = `data/vocabulary-index.json?v=${Date.now()}`;
    const raw = `https://raw.githubusercontent.com/haruru6666/haruru6666.github.io/main/data/vocabulary-index.json?v=${Date.now()}`;
    let response;
    try {
        response = await fetch(window.location.protocol === 'file:' ? raw : local, { cache: 'no-store' });
        if (!response.ok && window.location.protocol !== 'file:') response = await fetch(raw, { cache: 'no-store' });
    } catch (error) {
        response = await fetch(raw, { cache: 'no-store' });
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.index = await response.json();
    render();
}

loadIndex().catch(error => {
    document.querySelector('main').innerHTML = `<p class="vl-error">词汇索引暂时无法加载（${error.message}）。请检查网络或等待部署完成。</p>`;
});
