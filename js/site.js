let articles = [];
let currentArticle = null;
let activeCategory = 'all';

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date);
}

async function fetchJson(url, resourceName) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao carregar ${resourceName}: HTTP ${response.status}`);
  }
  return response.json();
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateMetadataIndex(data) {
  if (!data || !Array.isArray(data.articles)) {
    throw new Error('O índice de artigos deve conter uma lista "articles".');
  }

  const slugs = new Set();
  data.articles.forEach((article) => {
    if (
      !article
      || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)
      || article.file !== `${article.slug}.json`
      || !isNonEmptyString(article.title)
      || !isNonEmptyString(article.category)
      || !isNonEmptyString(article.readTime)
      || !/^\d{4}-\d{2}-\d{2}$/.test(article.published)
      || Number.isNaN(new Date(`${article.published}T00:00:00`).getTime())
      || !isNonEmptyString(article.summary)
      || slugs.has(article.slug)
    ) {
      throw new Error('O índice contém um artigo inválido ou um slug duplicado.');
    }
    slugs.add(article.slug);
  });

  return data.articles;
}

function validateArticle(data, expectedSlug) {
  const isTextList = (value) => Array.isArray(value) && value.every(isNonEmptyString);
  const isQuestionAnswerList = (value) => Array.isArray(value) && value.every(
    (item) => item && isNonEmptyString(item.question) && isNonEmptyString(item.answer)
  );

  if (
    !data
    || data.slug !== expectedSlug
    || !isNonEmptyString(data.title)
    || !isNonEmptyString(data.category)
    || !isNonEmptyString(data.readTime)
    || !/^\d{4}-\d{2}-\d{2}$/.test(data.published)
    || !isNonEmptyString(data.summary)
    || !Array.isArray(data.sections)
    || !data.sections.every((section) => (
      section
      && ['content', 'example'].includes(section.type)
      && isNonEmptyString(section.heading)
      && isTextList(section.body)
      && (section.type !== 'example' || typeof section.code === 'string')
    ))
    || !isTextList(data.references)
    || !Array.isArray(data.quiz)
    || !data.quiz.every((item) => (
      item
      && isNonEmptyString(item.question)
      && isTextList(item.options)
      && Number.isInteger(item.correctIndex)
      && item.correctIndex >= 0
      && item.correctIndex < item.options.length
      && isNonEmptyString(item.explanation)
    ))
    || !isQuestionAnswerList(data.flashcards)
    || !isQuestionAnswerList(data.faq)
  ) {
    throw new Error(`O conteúdo do artigo "${expectedSlug}" tem formato inválido.`);
  }

  return data;
}

async function loadArticleIndex() {
  const url = new URL('./content/articles/index.json', document.baseURI);
  const data = await fetchJson(url, 'índice de artigos');
  return validateMetadataIndex(data);
}

async function loadArticle(entry) {
  const url = new URL(`./content/articles/${entry.file}`, document.baseURI);
  const data = await fetchJson(url, `artigo "${entry.slug}"`);
  return validateArticle(data, entry.slug);
}

function renderMessage(node, message, role = 'status') {
  const paragraph = document.createElement('p');
  paragraph.setAttribute('role', role);
  paragraph.textContent = message;
  node.replaceChildren(paragraph);
}

function initTheme() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  const stored = localStorage.getItem('mahima-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');

  applyTheme(theme);

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('mahima-theme', next);
  });
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function renderHomeArticles() {
  const listNode = document.getElementById('article-list');
  if (!listNode) return;

  if (articles.length === 0) {
    renderMessage(listNode, 'Nenhum artigo disponível no momento.');
    return;
  }

  listNode.innerHTML = articles
    .map(
      (article) => `
        <article class="article-card" data-category="${escapeHtml(slugify(article.category))}" data-search="${escapeHtml(normalize(`${article.title} ${article.category} ${article.summary}`))}">
          <div class="card-topline">
            <span class="pill">${escapeHtml(article.category)}</span>
            <span>${escapeHtml(article.readTime)}</span>
          </div>
          <h3><a href="./article.html?slug=${encodeURIComponent(article.slug)}">${escapeHtml(article.title)}</a></h3>
          <p>${escapeHtml(article.summary)}</p>
          <div class="card-meta">
            <span>Publicado em ${escapeHtml(formatDate(article.published))}</span>
          </div>
          <a class="button secondary" href="./article.html?slug=${encodeURIComponent(article.slug)}">Ler artigo</a>
        </article>
      `
    )
    .join('');
}

function renderCategoryFilters() {
  const filtersNode = document.getElementById('category-filters');
  if (!filtersNode) return;

  const categories = buildCategories(articles);

  const allButton = `
    <button class="category-filter${activeCategory === 'all' ? ' active' : ''}" type="button" data-category="all">
      Todos
      <span class="category-filter-count">${articles.length}</span>
    </button>
  `;

  const categoryButtons = categories
    .map(
      (category) => `
        <button class="category-filter${activeCategory === category.slug ? ' active' : ''}" type="button" data-category="${escapeHtml(category.slug)}">
          ${escapeHtml(category.name)}
          <span class="category-filter-count">${category.articles.length}</span>
        </button>
      `
    )
    .join('');

  filtersNode.innerHTML = allButton + categoryButtons;

  filtersNode.querySelectorAll('.category-filter').forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category;
      renderCategoryFilters();
      applyFilters();
    });
  });
}

function renderCategoryDropdown() {
  const menuNode = document.getElementById('category-menu');
  if (!menuNode) return;

  const categories = buildCategories(articles);

  menuNode.innerHTML = categories
    .map(
      (category) => `
        <a href="./index.html?categoria=${encodeURIComponent(category.slug)}" role="menuitem">
          ${escapeHtml(category.name)}
          <span class="nav-dropdown-count">${category.articles.length}</span>
        </a>
      `
    )
    .join('');
}

function initCategoryDropdown() {
  const dropdown = document.getElementById('category-dropdown');
  const toggle = dropdown?.querySelector('.nav-dropdown-toggle');
  const menu = document.getElementById('category-menu');
  if (!dropdown || !toggle || !menu) return;

  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
  };

  const openMenu = () => {
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('open');
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) closeMenu();
    else openMenu();
  });

  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  menu.addEventListener('click', () => closeMenu());
}

function applyFilters() {
  const input = document.getElementById('search-input');
  const query = normalize(input ? input.value.trim() : '');
  const cards = document.querySelectorAll('.article-card');
  let visible = 0;

  cards.forEach((card) => {
    const inCategory = activeCategory === 'all' || card.dataset.category === activeCategory;
    const haystack = card.dataset.search || '';
    const matchesSearch = !query || haystack.includes(query);
    const match = inCategory && matchesSearch;
    card.style.display = match ? '' : 'none';
    if (match) visible += 1;
  });

  const empty = document.getElementById('search-empty');
  if (empty) {
    empty.style.display = visible === 0 ? 'block' : 'none';
  }
}

function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  input.addEventListener('input', applyFilters);
}

function renderArticlePage(article) {
  const heroNode = document.getElementById('article-hero');
  const articleRoot = document.getElementById('article-content');
  if (!heroNode || !articleRoot) return;

  currentArticle = article;
  document.title = `${article.title} | Mahima Blog`;

  heroNode.innerHTML = `
    <div class="container narrow">
      <p class="eyebrow">${escapeHtml(article.category)}</p>
      <h1>${escapeHtml(article.title)}</h1>
      <p class="article-summary">${escapeHtml(article.summary)}</p>
      <div class="meta-row">
        <span>Publicado em ${escapeHtml(formatDate(article.published))}</span>
        <span>Tempo de leitura: ${escapeHtml(article.readTime)}</span>
      </div>
      <div class="article-author">
        <img class="article-author-avatar" src="./assets/images/actor.jpg" alt="Foto de Stanley Dias" />
        <div class="article-author-details">
          <strong>Stanley Dias</strong>
          <span>Compartilhando aprendizados sobre engenharia de software e boas práticas.</span>
        </div>
      </div>
    </div>
  `;

  const sectionsMarkup = article.sections
    .map((section) => {
      const bodyMarkup = section.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');

      if (section.type === 'example') {
        return `
          <section class="article-section">
            <h2>${escapeHtml(section.heading)}</h2>
            ${bodyMarkup}
            <pre class="code-block"><code>${escapeHtml(section.code)}</code></pre>
          </section>
        `;
      }

      return `
        <section class="article-section">
          <h2>${escapeHtml(section.heading)}</h2>
          ${bodyMarkup}
        </section>
      `;
    })
    .join('');

  const referencesMarkup = article.references
    .map((reference) => `<li>${escapeHtml(reference)}</li>`)
    .join('');

  const quizMarkup = article.quiz
    .map(
      (quizItem, quizIndex) => `
        <div class="quiz-item" data-quiz-index="${quizIndex}">
          <h3>${quizIndex + 1}. ${escapeHtml(quizItem.question)}</h3>
          <div class="quiz-options">
            ${quizItem.options
              .map(
                (option, optionIndex) => `
                  <button
                    class="quiz-option"
                    type="button"
                    data-option-index="${optionIndex}"
                    data-correct="${optionIndex === quizItem.correctIndex}"
                  >
                    ${escapeHtml(option)}
                  </button>
                `
              )
              .join('')}
          </div>
          <p class="quiz-feedback" aria-live="polite"></p>
        </div>
      `
    )
    .join('');

  const flashcardsMarkup = article.flashcards
    .map(
      (item, index) => `
        <div class="flashcard">
          <button class="flashcard-toggle" type="button" aria-expanded="false">
            <span>${index + 1}. ${escapeHtml(item.question)}</span>
          </button>
          <div class="flashcard-answer" hidden>
            <p>${escapeHtml(item.answer)}</p>
          </div>
        </div>
      `
    )
    .join('');

  const faqMarkup = article.faq
    .map(
      (item) => `
        <details class="faq-item">
          <summary>${escapeHtml(item.question)}</summary>
          <p>${escapeHtml(item.answer)}</p>
        </details>
      `
    )
    .join('');

  articleRoot.innerHTML = `
    <div class="container narrow article-page">
      <article>
        ${sectionsMarkup}

        <section class="article-section">
          <h2>Leituras recomendadas</h2>
          <ul class="reference-list">
            ${referencesMarkup}
          </ul>
        </section>

        <section class="article-section">
          <h2>Quiz</h2>
          ${quizMarkup}
        </section>

        <section class="article-section">
          <h2>Flashcards</h2>
          <div class="flashcards-grid">
            ${flashcardsMarkup}
          </div>
        </section>

        <section class="article-section">
          <h2>Perguntas frequentes</h2>
          <div class="faq-list">
            ${faqMarkup}
          </div>
        </section>
      </article>
      ${renderArticleNav(article)}
    </div>
  `;

  bindQuizHandlers();
  bindFlashcardHandlers();
}

function renderArticleNav(current) {
  const index = articles.findIndex((article) => article.slug === current.slug);
  if (index === -1) return '';

  const prev = articles[index - 1];
  const next = articles[index + 1];

  return `
    <nav class="article-nav" aria-label="Navegação entre artigos">
      ${prev
        ? `<a class="article-nav-link prev" href="./article.html?slug=${encodeURIComponent(prev.slug)}">
            <span class="article-nav-label">← Anterior</span>
            <span class="article-nav-title">${escapeHtml(prev.title)}</span>
          </a>`
        : '<span></span>'}
      <a class="article-nav-all" href="./index.html#artigos">Todos os artigos</a>
      ${next
        ? `<a class="article-nav-link next" href="./article.html?slug=${encodeURIComponent(next.slug)}">
            <span class="article-nav-label">Próximo →</span>
            <span class="article-nav-title">${escapeHtml(next.title)}</span>
          </a>`
        : '<span></span>'}
    </nav>
  `;
}

function bindQuizHandlers() {
  document.querySelectorAll('.quiz-option').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.quiz-item');
      if (!item || !currentArticle) return;

      const quizIndex = Number(item.dataset.quizIndex);
      const question = currentArticle.quiz[quizIndex];
      if (!question) return;

      const options = item.querySelectorAll('.quiz-option');
      const selectedCorrect = button.dataset.correct === 'true';

      options.forEach((option) => {
        option.disabled = true;
        const isCorrect = option.dataset.correct === 'true';
        option.classList.toggle('correct', isCorrect);
        option.classList.toggle('wrong', !selectedCorrect && option === button);
      });

      const feedback = item.querySelector('.quiz-feedback');
      if (selectedCorrect) {
        feedback.textContent = `Correto. ${question.explanation}`;
      } else {
        const correctAnswer = question.options[question.correctIndex];
        feedback.textContent = `Incorreto. A resposta correta é: ${correctAnswer}. ${question.explanation}`;
      }
    });
  });
}

function bindFlashcardHandlers() {
  document.querySelectorAll('.flashcard-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const flashcard = button.closest('.flashcard');
      const answer = flashcard?.querySelector('.flashcard-answer');
      if (!answer) return;

      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      answer.hidden = expanded;
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalize(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function slugify(value) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildCategories(articleList) {
  const map = new Map();
  articleList.forEach((article) => {
    const slug = slugify(article.category);
    if (!map.has(slug)) {
      map.set(slug, { slug, name: article.category, articles: [] });
    }
    map.get(slug).articles.push(article);
  });
  return Array.from(map.values());
}

async function initialize() {
  initTheme();

  const listNode = document.getElementById('article-list');
  const heroNode = document.getElementById('article-hero');
  const articleRoot = document.getElementById('article-content');

  if (listNode) renderMessage(listNode, 'Carregando artigos...');
  if (articleRoot) renderMessage(articleRoot, 'Carregando artigo...');

  try {
    articles = await loadArticleIndex();

    renderCategoryDropdown();
    initCategoryDropdown();

    if (listNode) {
      const urlCategory = new URLSearchParams(window.location.search).get('categoria');
      if (urlCategory && buildCategories(articles).some((c) => c.slug === urlCategory)) {
        activeCategory = urlCategory;
      }
      renderHomeArticles();
      renderCategoryFilters();
      initSearch();
      applyFilters();
    }

    if (articleRoot) {
      const slug = new URLSearchParams(window.location.search).get('slug');
      const entry = articles.find((article) => article.slug === slug);

      if (!entry) {
        document.title = 'Artigo não encontrado | Mahima Blog';
        if (heroNode) heroNode.replaceChildren();
        renderMessage(articleRoot, 'Artigo não encontrado. Confira o endereço ou volte à lista de artigos.', 'alert');
        return;
      }

      const article = await loadArticle(entry);
      renderArticlePage(article);
    }
  } catch (error) {
    console.error('Não foi possível carregar o conteúdo do blog.', error);
    if (listNode) {
      renderMessage(listNode, 'Não foi possível carregar os artigos. Atualize a página ou tente novamente mais tarde.', 'alert');
    }
    if (articleRoot) {
      if (heroNode) heroNode.replaceChildren();
      renderMessage(articleRoot, 'Não foi possível carregar este artigo. Atualize a página ou tente novamente mais tarde.', 'alert');
    }
  }
}

initialize();
