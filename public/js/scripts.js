/**
 * アプリ一覧の取得
 */
async function loadApps() {
  const ul = document.getElementById('app-list');
  const empty = document.getElementById('empty');
  try {
    const res = await fetch('/apps.json', { cache: 'no-store' });
    const apps = await res.json();
    if (!apps || apps.length === 0) {
      empty.style.display = 'block';
      return;
    }
    ul.innerHTML = apps.map(a => `
      <li>
        <div>
          <a href="${a.path || '#'}" style="color: ${a.color || '#222'};">
            ${a.name || '(no name)'}
          </a>
        </div>
        <div class="app-desc">${a.desc || '試験対策アプリ'}</div>
      </li>
    `).join('');
  } catch (e) {
    empty.style.display = 'block';
  }
}

/**
 * お知らせの取得
 */
async function loadNews() {
  const ul = document.getElementById('news-list');
  const empty = document.getElementById('news-empty');
  try {
    const res = await fetch('/news.json', { cache: 'no-store' });
    const news = await res.json();
    if (!news || news.length === 0) {
      empty.style.display = 'block';
      return;
    }
    ul.innerHTML = news.slice(0, 5).map(n => `
      <li>
        <span class="news-date">${n.date}</span>
        ${n.tag ? `<span class="news-tag">${n.tag}</span>` : ''}
        <span class="news-title">${n.title}</span>
      </li>
    `).join('');
  } catch (e) {
    empty.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadApps();
  loadNews();
});