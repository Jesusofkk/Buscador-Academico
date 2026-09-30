# Academic Search Tool

Um buscador acadêmico client-side que pesquisa em bases de artigos científicos (OpenAlex) e fornece links para acesso via Sci-Hub.

## Funcionalidades

- Pesquisa em bases de artigos científicos via API pública do [OpenAlex](https://openalex.org)
- Suporte a operadores booleanos (AND, OR, NOT) na consulta
- Links para acessar artigos via [Sci-Hub](https://sci-hub.se) quando o DOI estiver disponível
- Interface limpa e profissional com tema escuro
- Totalmente client-side - não requer backend ou instalação

## Como usar

1. Abra o arquivo `frontend/index.html` em qualquer navegador moderno
2. Digite sua consulta na barra de pesquisa (ex: `"surveillance capitalism" AND "data brokers"`)
3. Use os botões de operadores booleanos para construir sua consulta
4. Marque a opção "Tentar acesso via Sci-Hub" se desejar
5. Clique em "Buscar" ou pressione Enter
6. Clique nos resultados para abrir o artigo ou acessar via Sci-Hub

## Tecnologias utilizadas

- HTML5, CSS3, JavaScript (vanilla)
- API do OpenAlex para metadados acadêmicos
- Sci-Hub para acesso a artigos (quando disponível via DOI)

## Estrutura do projeto

```
AcademicSearchTool/
├── frontend/
│   ├── index.html      # Estrutura da página
│   ├── styles.css      # Estilos e tema
│   └── script.js       # Lógica da aplicação
└── backend/            # Mantido para compatibilidade, mas não utilizado
    └── app.py
```

## Privacidade e segurança

- Todas as buscas são feitas diretamente para a API do OpenAlex (nenhum dado é enviado para servidores de terceiros)
- Os links para Sci-Hub são gerados client-side a partir do DOI obtido na resposta da OpenAlex
- Nenhum dado de busca é armazenado ou rastreado

## Aviso legal

Este projeto é para fins educacionais e de pesquisa. O acesso a artigos via Sci-Hub pode estar sujeito a restrições legais em algumas jurisdições. Os usuários são responsáveis por verificar a legalidade do acesso aos artigos em seu país.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
