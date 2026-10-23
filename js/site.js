const articles = window.articles || [];

function getCurrentArticle() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  return articles.find((article) => article.slug === slug) || articles[0] || null;
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date);
}

/* ---------- Tema claro/escuro ---------- */
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

/* ---------- Página inicial ---------- */
function renderHomeArticles() {
  const listNode = document.getElementById('article-list');
  if (!listNode) return;

  listNode.innerHTML = articles
    .map(
      (article) => `
        <article class="article-card" data-search="${normalize(article.title + ' ' + article.category + ' ' + article.summary)}">
          <div class="card-topline">
            <span class="pill">${article.category}</span>
            <span>${article.readTime}</span>
          </div>
          <h3><a href="./article.html?slug=${article.slug}">${article.title}</a></h3>
          <p>${article.summary}</p>
          <div class="card-meta">
            <span>Publicado em ${formatDate(article.published)}</span>
          </div>
          <a class="button secondary" href="./article.html?slug=${article.slug}">Ler artigo</a>
        </article>
      `
    )
    .join('');
}

function initSearch() {
  const input = document.getElementById('search-input');
  const empty = document.getElementById('search-empty');
  if (!input) return;

  input.addEventListener('input', () => {
    const query = normalize(input.value.trim());
    const cards = document.querySelectorAll('.article-card');
    let visible = 0;

    cards.forEach((card) => {
      const haystack = card.dataset.search || '';
      const match = !query || haystack.includes(query);
      card.style.display = match ? '' : 'none';
      if (match) visible += 1;
    });

    if (empty) {
      empty.style.display = visible === 0 ? 'block' : 'none';
    }
  });
}

/* ---------- Página de artigo ---------- */
function renderArticlePage() {
  const article = getCurrentArticle();
  const heroNode = document.getElementById('article-hero');
  const articleRoot = document.getElementById('article-content');

  if (!article || !heroNode || !articleRoot) return;

  document.title = `${article.title} | Mahima Blog`;

  heroNode.innerHTML = `
    <div class="container narrow">
      <p class="eyebrow">${article.category}</p>
      <h1>${article.title}</h1>
      <p class="article-summary">${article.summary}</p>
      <div class="meta-row">
        <span>Publicado em ${formatDate(article.published)}</span>
        <span>Tempo de leitura: ${article.readTime}</span>
      </div>
    </div>
  `;

  const sectionsMarkup = article.sections
    .map((section) => {
      const bodyMarkup = section.body.map((paragraph) => `<p>${paragraph}</p>`).join('');

      if (section.type === 'example') {
        return `
          <section class="article-section">
            <h2>${section.heading}</h2>
            ${bodyMarkup}
            <pre class="code-block"><code>${escapeHtml(section.code || '')}</code></pre>
          </section>
        `;
      }

      return `
        <section class="article-section">
          <h2>${section.heading}</h2>
          ${bodyMarkup}
        </section>
      `;
    })
    .join('');

  const referencesMarkup = article.references.map((reference) => `<li>${reference}</li>`).join('');

  const quizMarkup = article.quiz
    .map(
      (quizItem, quizIndex) => `
        <div class="quiz-item" data-quiz-index="${quizIndex}">
          <h3>${quizIndex + 1}. ${quizItem.question}</h3>
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
                    ${option}
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
            <span>${index + 1}. ${item.question}</span>
          </button>
          <div class="flashcard-answer" hidden>
            <p>${item.answer}</p>
          </div>
        </div>
      `
    )
    .join('');

  const faqMarkup = article.faq
    .map(
      (item) => `
        <details class="faq-item">
          <summary>${item.question}</summary>
          <p>${item.answer}</p>
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
  const index = articles.findIndex((a) => a.slug === current.slug);
  if (index === -1) return '';

  const prev = articles[index - 1];
  const next = articles[index + 1];

  return `
    <nav class="article-nav" aria-label="Navegação entre artigos">
      ${prev
        ? `<a class="article-nav-link prev" href="./article.html?slug=${prev.slug}">
            <span class="article-nav-label">← Anterior</span>
            <span class="article-nav-title">${prev.title}</span>
          </a>`
        : '<span></span>'}
      <a class="article-nav-all" href="./index.html#artigos">Todos os artigos</a>
      ${next
        ? `<a class="article-nav-link next" href="./article.html?slug=${next.slug}">
            <span class="article-nav-label">Próximo →</span>
            <span class="article-nav-title">${next.title}</span>
          </a>`
        : '<span></span>'}
    </nav>
  `;
}

function bindQuizHandlers() {
  document.querySelectorAll('.quiz-option').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.quiz-item');
      if (!item) return;

      const quizIndex = Number(item.dataset.quizIndex);
      const question = articles.find((article) => article.slug === getCurrentArticle()?.slug)?.quiz[quizIndex]
        || getCurrentArticle()?.quiz[quizIndex];

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

/* ---------- Inicialização ---------- */
initTheme();

if (document.getElementById('article-list')) {
  renderHomeArticles();
  initSearch();
}

if (document.getElementById('article-content')) {
  renderArticlePage();
}
