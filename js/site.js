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

function renderHomeArticles() {
  const listNode = document.getElementById('article-list');
  if (!listNode) return;

  listNode.innerHTML = articles
    .map(
      (article) => `
        <article class="article-card">
          <div class="card-topline">
            <span class="pill">${article.category}</span>
            <span>${article.readTime}</span>
          </div>
          <h3>${article.title}</h3>
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
    </div>
  `;

  bindQuizHandlers();
  bindFlashcardHandlers();
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

if (document.getElementById('article-list')) {
  renderHomeArticles();
}

if (document.getElementById('article-content')) {
  renderArticlePage();
}
