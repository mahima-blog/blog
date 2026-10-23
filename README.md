# Mahima Blog

Blog técnico da Mahima Engenharia de Software, publicado como site estático no GitHub Pages. O projeto foi implementado em HTML, CSS e JavaScript puros, sem backend e com foco em leitura, acessibilidade e manutenção de conteúdo.

## Visão geral

- Página inicial com apresentação da marca e listagem dos artigos.
- Artigos completos em português brasileiro com resumo, conteúdo estruturado, quiz, flashcards e FAQ.
- Estrutura simples para adicionar novos temas sem repetir layout visual.
- Deploy compatível com GitHub Pages em repositório de usuário ou em site de projeto.

## Estrutura do projeto

```text
.
├── README.md
├── index.html
├── article.html
├── css/
│   └── styles.css
├── js/
│   └── site.js
├── content/
│   └── articles.js
├── logo/
│   └── logo_opcao4_tipografico.png
└── .nojekyll
```

## Executar localmente

1. Abra o projeto em qualquer servidor estático local.
2. Uma opção simples é usar Python:

```bash
cd c:\projetos\mahima
python -m http.server 8000
```

3. Acesse:

- http://localhost:8000/
- http://localhost:8000/article.html?slug=clean-architecture
- http://localhost:8000/article.html?slug=solid

## Adicionar novos artigos

1. Abra o arquivo `content/articles.js`.
2. Adicione um novo objeto ao array `window.articles` seguindo o mesmo formato dos artigos existentes.
3. Cada artigo deve conter:
   - `slug`
   - `title`
   - `category`
   - `readTime`
   - `published`
   - `summary`
   - `sections`
   - `references`
   - `quiz`
   - `flashcards`
   - `faq`
4. A página inicial renderiza automaticamente os artigos em ordem de array.
5. Para artigo novo, o link de navegação será gerado automaticamente.

## Publicar no GitHub Pages

Este projeto usa HTML estático puro, que é o mecanismo mais compatível com a publicação do GitHub Pages. Não há necessidade de backend ou serviço externo.

### Passos de configuração na conta GitHub

1. Faça push do repositório para o GitHub.
2. Abra o repositório no GitHub.
3. Acesse Settings → Pages.
4. Em Source, escolha a branch principal (por exemplo `main`) e a pasta raiz `/`.
5. Salve a configuração.
6. O GitHub disponibiliza uma URL pública do tipo:
   - `https://usuario.github.io/nome-do-repositorio/` para site de projeto.
   - `https://usuario.github.io/` para domínio de usuário.

Como a navegação usa caminhos relativos (`./`, `article.html?slug=...`), o site continua funcionando em ambientes de subcaminho do GitHub Pages sem necessidade de ajustes especiais no código.

> Importante: esta implementação não publica automaticamente o site. A habilitação e a configuração do Pages precisam ser feitas na interface do GitHub pelo proprietário do repositório.

## Validação

Para verificar o resultado localmente:

```bash
python -m http.server 8000
```

Em seguida, use um navegador para testar:

- página inicial com a listagem dos artigos;
- navegação para cada artigo;
- quiz com feedback do resultado;
- flashcards revelando resposta;
- FAQ acessível e responsiva;
- layout funcionando em desktop e mobile.

## Licença

Sem fins de licença específicos neste exercício; o código foi criado para demonstrar a implementação do blog técnico conforme especificação da tarefa.
