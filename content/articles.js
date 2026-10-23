window.articles = [
  {
    slug: 'clean-architecture',
    title: 'Clean Architecture',
    category: 'Arquitetura',
    readTime: '11 minutos',
    published: '2026-10-22',
    summary: 'Uma visão prática de como separar responsabilidade, energia e dependência em sistemas complexos sem cair em burocracia ou abstrações vazias.',
    sections: [
      {
        type: 'content',
        heading: 'Por que a arquitetura importa',
        body: [
          'A arquitetura de software não é um adereço de design; ela define o que custa mais manter, evoluir e testar um sistema. Quando o código cresce sem limites explícitos, a mudança se torna arriscada porque cada novo requisito mexe em regras de negócios, estruturas de acesso a dados e interfaces de usuário ao mesmo tempo.',
          'A Clean Architecture busca separar as decisões mais mutáveis das decisões mais estáveis. Em outras palavras, regras de negócio não devem depender de tecnologias como banco de dados, frameworks web ou bibliotecas de UI. O objetivo não é eliminar dependências, mas controlar a direção delas.'
        ]
      },
      {
        type: 'content',
        heading: 'Objetivos da abordagem',
        body: [
          'A proposta central é criar uma arquitetura em que as regras de negócio sejam independentes de mecanismos externos. Isso torna o sistema mais previsível, testável e fácil de adaptar quando a tecnologia muda. O custo é maior esforço inicial para definir fronteiras claras e, em alguns cenários, estruturas mais rígidas do que o necessário.',
          'A ideia não é transformar todo projeto em um sistema de “camadas puras”. Há casos em que uma abordagem menos rígida entrega valor mais rápido. O importante é reconhecer quando a complexidade do domínio justifica mais disciplina.'
        ]
      },
      {
        type: 'content',
        heading: 'Camadas e regra de dependência',
        body: [
          'A Clean Architecture costuma ser representada em camadas concêntricas. No centro ficam as entidades e casos de uso: regras de negócio e políticas da aplicação. Em volta, os adaptadores e interfaces externas: banco de dados, APIs, frameworks, UI. A regra de dependência diz que as dependências devem apontar para o centro, nunca para fora.',
          'Isso significa que uma entidade de domínio não deve conhecer que existe um banco SQL nem que existe um controlador HTTP. Essas tecnologias são detalhes de infraestrutura. O código do domínio fala em conceitos do negócio: “cadastrar pedido”, “calcular preço”, “validar limite de crédito”.',
          'Quando a camada de aplicação depende da camada de infraestrutura, o sistema fica preso às tecnologias e perde flexibilidade. Ao inverter essa direção, você garante que a lógica principal possa ser testada sem mockar um servidor inteiro ou depender de um banco específico.'
        ]
      },
      {
        type: 'content',
        heading: 'Limites e responsabilidades',
        body: [
          'Uma arquitetura requer fronteiras bem definidas. O domínio não deve ser responsável por ORMs, filas, integrações com terceiros ou detalhes de apresentação. A camada de infraestrutura, por sua vez, não deve decidir regras de negócio; ela apenas implementa mecanismos que a aplicação usa.',
          'A responsabilidade de cada camada deve ser clara. Entidades cuidam do modelo do negócio; casos de uso coordenam fluxos específicos; interfaces de adaptação convertem dados externos em convenções internas; e infraestrutura fornece persistência, mensageria, envio de e-mail e outros mecanismos. Quando isso é combinado com interfaces bem desenhadas, o código fica mais fácil de evoluir sem efeito dominó.'
        ]
      },
      {
        type: 'example',
        heading: 'Exemplo aplicado: pedido de e-commerce',
        code: `
// domínio
class Pedido {
  constructor(itens, cliente) {
    this.itens = itens;
    this.cliente = cliente;
  }

  total() {
    return this.itens.reduce((s, item) => s + item.preco, 0);
  }
}

class CalcularValorPedido {
  executar(pedido) {
    if (pedido.total() <= 0) {
      throw new Error('Pedido sem itens válidos');
    }
    return pedido.total();
  }
}

// infraestrutura
class PedidoRepository {
  salvar(pedido) {
    // persiste no banco
  }
}
        `,
        body: [
          'No exemplo, a lógica que valida o pedido e calcula o valor é completamente independente da camada de persistência. O banco de dados é um detalhe. O caso de uso conhece a abstração de um repositório, mas não depende de como o objeto é salvo no banco.',
          'Se em uma nova sprint a empresa passar de PostgreSQL para MongoDB, por exemplo, a regra de negócio não precisa ser reescrita. O que muda é a implementação do adaptador, e a aplicação continua funcionando sem que o domínio “saiba” sobre a mudança.'
        ]
      },
      {
        type: 'content',
        heading: 'Benefícios, custos e quando pode ser excessiva',
        body: [
          'Os ganhos são claros: baixo acoplamento, testes mais focados, organização mental mais forte e maior capacidade de adaptação. A arquitetura da aplicação ainda pode mudar sem derrubar regras centrais. Além disso, a higienização de fronteiras facilita que times diferentes trabalhem em paralelos com menos atrito.',
          'O custo está na complexidade adicional. Em projetos menores, a Clean Architecture pode parecer “muito formal”: interfaces, adaptadores, casos de uso, DTOs e regras de dependência aumentam a quantidade de código e o tempo de escrita. Em sistemas simples, a abordagem pode ser excessiva quando o problema não demanda tanta previsibilidade.',
          'A regra não é “usar Clean Architecture em tudo”. O critério é a maturidade do domínio, a previsibilidade da mudança e o risco de acoplamento. Quando o problema é simples e bem compreendido, um desenho mais direto pode ser mais honesto e eficiente.'
        ]
      }
    ],
    references: [
      'Robert C. Martin — Clean Architecture',
      'Eric Evans — Domain-Driven Design: Tackling Complexity in the Heart of Software',
      'Martin Fowler — Architecture Guide',
      'Vaughn Vernon — Implementing Domain-Driven Design'
    ],
    quiz: [
      {
        question: 'Qual é a principal ideia da regra de dependência na Clean Architecture?',
        options: [
          'As camadas externas devem depender das mais internas.',
          'Dependências devem apontar para o centro do sistema, não para fora.',
          'Tudo deve ser separado em módulos de um único arquivo.',
          'As regras de negócio devem depender do banco de dados.'
        ],
        correctIndex: 1,
        explanation: 'A regra de dependência busca manter as regras de negócio no núcleo e impedir que detalhes de infraestrutura definam a lógica central.'
      },
      {
        question: 'Qual camada normalmente carrega regras de negócio e políticas do domínio?',
        options: [
          'Infraestrutura',
          'UI e framework',
          'Entidades e casos de uso',
          'Deploy e CI/CD'
        ],
        correctIndex: 2,
        explanation: 'As entidades e os casos de uso compõem o núcleo da aplicação, onde a lógica vital do negócio deve ficar.'
      },
      {
        question: 'Quando a Clean Architecture pode ser excessiva?',
        options: [
          'Quando o sistema tem poucas regras e pouca mudança esperada.',
          'Quando o time usa apenas linguagem orientada a objetos.',
          'Quando há muitas integrações com banco de dados.',
          'Quando o projeto não tem testes automatizados.'
        ],
        correctIndex: 0,
        explanation: 'Em projetos pequenos e estáveis, a adoção de muitos limites pode aumentar custo e complexidade sem ganho proporcional.'
      },
      {
        question: 'Qual é um benefício direto de deixar o domínio independente de frameworks?',
        options: [
          'O sistema deixa de usar interfaces públicas.',
          'O código de negócio fica mais fácil de testar e trocar de tecnologia.',
          'O front-end passa a depender do banco.',
          'Não é mais necessário separar responsabilidades.'
        ],
        correctIndex: 1,
        explanation: 'A independência de frameworks reduz acoplamento e facilita testes e evolução tecnológica sem mexer na lógica central.'
      },
      {
        question: 'O que o adaptador deve fazer na arquitetura em camadas?',
        options: [
          'Determinar regras de negócio do domínio.',
          'Conectar tecnologias externas às interfaces internas da aplicação.',
          'Substituir o caso de uso em todas as decisões.',
          'Eliminar testes de integração.'
        ],
        correctIndex: 1,
        explanation: 'Adaptadores convertem dados e interações do mundo externo para a linguagem da aplicação, sem misturar lógica de negócio com infraestrutura.'
      }
    ],
    flashcards: [
      {
        question: 'O que é a regra de dependência?',
        answer: 'É a convenção de que as dependências devem apontar para o núcleo do sistema, e não o contrário, mantendo regras de negócio independentes de infraestrutura.'
      },
      {
        question: 'Qual camada normalmente fica no centro da arquitetura?',
        answer: 'O domínio: entidades, regras e casos de uso do negócio.'
      },
      {
        question: 'Por que frameworks não devem definir a lógica de negócio?',
        answer: 'Porque frameworks mudam com frequência e são detalhes de implementação; regras de negócio devem sobreviver às mudanças tecnológicas.'
      },
      {
        question: 'Qual é um risco da Clean Architecture aplicada sem critério?',
        answer: 'Aumento de complexidade e burocracia em projetos pequenos, sem trazer benefício real proporcional.'
      },
      {
        question: 'O que é um adaptador?',
        answer: 'É um componente que traduz comunicação entre infraestrutura externa e a aplicação, preservando o domínio isolado.'
      }
    ],
    faq: [
      {
        question: 'A Clean Architecture é obrigatório para todos os sistemas?',
        answer: 'Não. Ela é mais útil quando o domínio é complexo, a mudança é frequente e o risco de acoplamento é alto. Projetos pequenos podem ser mais simples sem perder qualidade.'
      },
      {
        question: 'É possível usar Clean Architecture com aplicações web?',
        answer: 'Sim. A arquitetura não proíbe frameworks web; ela apenas exige que o framework seja usado como infraestrutura e não como fonte de regras de negócio.'
      },
      {
        question: 'A arquitetura limpa substitui testes unitários?',
        answer: 'Não. Ela melhora a separação e a testabilidade, mas não elimina a necessidade de testes de unidade, integração e comportamento em camadas diferentes.'
      }
    ]
  },
  {
    slug: 'solid',
    title: 'Princípios SOLID',
    category: 'Design de software',
    readTime: '13 minutos',
    published: '2026-10-22',
    summary: 'Um guia prático para entender SRP, OCP, LSP, ISP e DIP sem transformá-los em dogmas vazios de contexto.',
    sections: [
      {
        type: 'content',
        heading: 'SOLID como conjunto de boas fronteiras',
        body: [
          'Os princípios SOLID surgiram para orientar projetos mais compreensíveis, flexíveis e resilientes. Cada princípio responde a uma tensão específica: acoplamento, mudança, extensão, substituição e dependência. Eles são úteis como linguagem para discutir arquitetura, mas não são uma receita mágica para todos os sistemas.',
          'Um erro comum é tratar SOLID como “regra fixa” em vez de ferramenta de design. O objetivo é reduzir custos de mudança sem criar mais abstrações do que o problema exige. Em outras palavras, os princípios devem servir ao domínio, e não o contrário.'
        ]
      },
      {
        type: 'content',
        heading: 'SRP — Princípio da Responsabilidade Única',
        body: [
          'Uma classe deve ter apenas uma razão para mudar. Isso não significa que a entidade deve ter uma única linha de código ou um único método; significa que ela deve concentrar um único motivo de mudança. Quando uma classe mistura regras de negócio, persistência e validação de interface, ela evolui por vários motivos ao mesmo tempo e vira um ponto de ruptura.',
          'Um exemplo típico é um serviço de cobrança que também envia e-mail e salva logs em disco. A classe muda quando o fluxo financeiro muda, quando a infraestrutura de e-mail muda e quando o formato de log muda. Isso é um sinal de que ela tem mais de uma responsabilidade.'
        ]
      },
      {
        type: 'example',
        heading: 'Exemplo SRP: o caso inadequado',
        code: `
class PedidoController {
  salvarPedido(dados) {
    const pedido = new Pedido(dados);
    banco.insert(pedido);
    email.enviar('pedido@empresa.com', 'Novo pedido');
    logger.info('Pedido salvo');
  }
}
        `,
        body: [
          'A classe acima toma decisões de negócio, persistência e comunicação externa. Se o sistema trocar de banco, o e-mail ou o mecanismo de log, a mesma classe precisa mudar. Isso viola o SRP.',
          'Uma abordagem melhor separa um caso de uso de domínio, um repositório para persistência e um serviço de notificação. Assim, cada componente muda por uma razão principal.'
        ]
      },
      {
        type: 'content',
        heading: 'OCP — Princípio Aberto/Fechado',
        body: [
          'Entidades devem estar abertas para extensão e fechadas para modificação. Em termos práticos, você deve conseguir acrescentar comportamento novo sem alterar o código já existente e bem testado. Isso geralmente é alcançado por interfaces, abstrações e composição.',
          'Uma política de cálculo de imposto, por exemplo, não deve exigir editar uma classe central toda vez que surgir um novo tipo de imposto. Em vez disso, cada imposto pode ser uma implementação de uma interface comum.'
        ]
      },
      {
        type: 'example',
        heading: 'Exemplo OCP: extensão sem alteração do núcleo',
        code: `
class CalculadoraDeImposto {
  calcular(produto, estrategia) {
    return estrategia.aplicar(produto);
  }
}

class ImpostoEstadual {
  aplicar(produto) {
    return produto.valor * 0.18;
  }
}

class ImpostoFederal {
  aplicar(produto) {
    return produto.valor * 0.12;
  }
}
        `,
        body: [
          'A calculadora não precisa conhecer cada imposto existente. Ela depende de uma estratégia que encapsula a variação. Isso torna a extensão simples e reduz riscos de regressão.'
        ]
      },
      {
        type: 'content',
        heading: 'LSP — Princípio da Substituição de Liskov',
        body: [
          'Objetos de um tipo base devem poder ser substituídos por objetos de um subtipo sem quebrar o comportamento esperado do sistema. Em outras palavras, o subtipo não pode contradizer as promessas do contrato do tipo base.',
          'Se um método fala “retorna um produto com validade” e uma subclasse retorna null ou lança exceções inesperadas, o design está quebrado. O problema não é a linguagem, e sim a incompatibilidade de contrato.'
        ]
      },
      {
        type: 'content',
        heading: 'ISP — Princípio da Segregação de Interfaces',
        body: [
          'Uma interface deve ser específica para o cliente que a usa. Não force um módulo a implementar métodos que não utiliza. Em vez de uma interface “gigante”, prefira pequenas interfaces com responsabilidade única ou bem delimitada.',
          'Em sistemas com domínio e integração, uma interface ampla pode obrigar implementações a cumprir contratos que não fazem sentido para esse cliente. Isso gera dependências sem necessidade e aumenta o risco de mudança em cascata.'
        ]
      },
      {
        type: 'content',
        heading: 'DIP — Princípio da Inversão de Dependência',
        body: [
          'Módulos de alto nível não devem depender de detalhes de baixo nível. Ambos devem depender de abstrações. Em código, isso normalmente significa depender de interfaces ou contratos, e não de classes concretas.',
          'Quando uma classe de negócio conhece diretamente uma implementação de banco de dados, ela fica presa ao mecanismo de persistência. Ao invés disso, o domínio depende de uma interface de repositório; a implementação concreta fica em um módulo de infraestrutura.'
        ]
      },
      {
        type: 'content',
        heading: 'Concluindo com equilíbrio',
        body: [
          'Os princípios SOLID são valiosos porque descrevem problemas recorrentes: classes que fazem demais, variações que exigem alteração em cascata, contratos que se contradizem e dependências que queimam o sistema. Mas eles não resolvem tudo. Quando usados por obrigação, podem criar uma camada de abstrações que não acrescenta clareza.',
          'O melhor uso dos princípios é combinar contexto com clareza. Se a mudança real do domínio sugere uma abstração, use-a. Se não sugere, evite-a. Em design de software, o critério mais importante continua sendo: “essa decisão reduz custo de mudança sem criar complexidade desnecessária?”'
        ]
      }
    ],
    references: [
      'Robert C. Martin — Agile Software Development, Principles, Patterns, and Practices',
      'Robert C. Martin — The Principles of OOD',
      'Clean Code e design orientado a objetos de domínio',
      'Design patterns e princípios de coesão e acoplamento em software'
    ],
    quiz: [
      {
        question: 'O que o SRP tenta evitar?',
        options: [
          'Classes com poucos métodos.',
          'Classes que mudam por múltiplas razões.',
          'Classes com apenas um atributo.',
          'Classes sem interfaces.'
        ],
        correctIndex: 1,
        explanation: 'O SRP busca reduzir a chance de uma classe mudar por motivos diferentes, como regra de negócio e persistência ao mesmo tempo.'
      },
      {
        question: 'Qual princípio está mais associado a “extensão sem modificação do código existente”?',
        options: [
          'SRP',
          'OCP',
          'ISP',
          'LSP'
        ],
        correctIndex: 1,
        explanation: 'O OCP enfatiza que o sistema deve aceitar mudança por extensão e não por edição constante de componentes centrais.'
      },
      {
        question: 'No LSP, o que ocorre quando um subtipo não respeita o contrato do tipo base?',
        options: [
          'O sistema melhora a legibilidade.',
          'A abstração deixa de ser confiável.',
          'A classe torna-se mais encapsulada.',
          'O código passa a usar menos interfaces.'
        ],
        correctIndex: 1,
        explanation: 'Se um subtipo quebra a promessa do contrato, o sistema deixa de poder substituir o tipo base de forma segura.'
      },
      {
        question: 'Qual propósito principal do ISP?',
        options: [
          'Unificar todas as regras de negócio em uma única interface.',
          'Evitar que clientes dependam de métodos que não usam.',
          'Criar mais heranças em vez de composição.',
          'Permitir que todas as classes tenham um único construtor.'
        ],
        correctIndex: 1,
        explanation: 'A segregação de interfaces reduz dependências desnecessárias e mantém contratos mais específicos para cada cliente.'
      },
      {
        question: 'O DIP recomenda que módulos de alto nível dependam de quê?',
        options: [
          'Implementações concretas de infraestrutura.',
          'Abstrações e contratos.',
          'Classes utilitárias estáticas.',
          'Detalhes de UI e banco em uma só camada.'
        ],
        correctIndex: 1,
        explanation: 'O DIP faz com que regras de alto nível dependam de abstrações flexíveis, em vez de detalhes específicos de infraestrutura.'
      }
    ],
    flashcards: [
      {
        question: 'Qual é a ideia central do SRP?',
        answer: 'Uma classe deve ter uma única razão para mudar, evitando múltiplos motivos de alteração em uma mesma entidade.'
      },
      {
        question: 'O que significa “aberto para extensão”?',
        answer: 'Significa que o sistema pode receber novos comportamentos sem reescrever a lógica central já validada.'
      },
      {
        question: 'Qual é a pergunta-chave do LSP?',
        answer: 'Um subtipo pode substituir o tipo base sem quebrar as expectativas do cliente que usa esse contrato?'
      },
      {
        question: 'Por que o ISP é útil?',
        answer: 'Porque evita interfaces “infinita” e força contratos menores, mais específicos e menos acoplados.'
      },
      {
        question: 'O que o DIP tenta inverter?',
        answer: 'A direção da dependência: o código de alto nível deve depender de abstrações, e não de detalhes de baixo nível.'
      }
    ],
    faq: [
      {
        question: 'SOLID é uma camisa de força?',
        answer: 'Não. Ele é um conjunto de princípios para reduzir riscos de mudança e acoplamento, mas deve ser aplicado com sensibilidade ao contexto.'
      },
      {
        question: 'Dá para aplicar SOLID em funções simples?',
        answer: 'Em funções isoladas, o ganho costuma ser menor. Os princípios são mais relevantes em módulos, serviços e classes com vários comportamentos ou variações.'
      },
      {
        question: 'Se eu ignorar um princípio, o software está “ruim”?',
        answer: 'Nem sempre. O valor do design depende do problema. O erro é usar os princípios como dogma absoluto e ignorar a real necessidade do domínio.'
      }
    ]
  }
];
