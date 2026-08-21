# Acessibilidade Cognitiva — Squad 7

Site institucional sobre acessibilidade cognitiva na web, com um **painel de
personalização de leitura** funcional: ajuste de tamanho de fonte, fonte
legível, espaçamento, régua de leitura, alto contraste e persistência das
preferências do usuário entre visitas.

O objetivo do projeto é duplo: explicar o tema (o que é acessibilidade
cognitiva, por que importa, dados e dicas práticas) e **demonstrar** os
próprios recursos de acessibilidade na prática.

## Demonstração

Abra `index.html` no navegador — não há build nem servidor obrigatório.
No canto superior direito do cabeçalho, clique em **"Modo Leitura"** para
abrir o painel e testar os controles.

## Tecnologias

- **HTML5** semântico (landmarks, `aria-*`, `role="dialog"`)
- **CSS3** puro — variáveis (custom properties), Grid/Flexbox, media queries
  responsivas e `prefers-reduced-motion`
- **JavaScript** vanilla (ES2020+), sem frameworks nem dependências
- **Google Fonts** (Inter), via `@import` no CSS
- **Web Storage API** (`localStorage`) para persistir as preferências de
  leitura

Nenhuma etapa de build é necessária — é um site estático puro.

## Estrutura do projeto

```
.
├── index.html    # Marcação e conteúdo das seções
├── style.css     # Estilos, variáveis de tema e responsividade
├── script.js     # Painel de acessibilidade, menu mobile e régua de leitura
└── unnamed.webp  # Logo do Squad 7 (header e footer)
```

## Instalação e uso local

Não há dependências para instalar. Duas formas de rodar:

**1. Direto no navegador**

```bash
# clone o repositório
git clone <url-do-repositorio>
cd <pasta-do-projeto>

# abra o arquivo index.html no navegador
```

Depois acesse `http://localhost:8000`.

## Funcionalidades do painel de leitura

| Recurso | O que faz |
|---|---|
| **A+ / A−** | Aumenta/diminui o texto em 3 níveis (normal, grande, extra grande) |
| **Espaçamento** | Amplia o espaço entre linhas e caracteres |
| **Fonte para leitura** | Alterna para uma fonte otimizada para leitura (ativa por padrão) |
| **Régua de leitura** | Uma faixa acompanha o cursor para ajudar a manter o foco — também pode ser ativada com a tecla `R` |
| **Alto contraste** | Aumenta o contraste entre texto e fundo |
| **Restaurar** | Volta todas as opções ao padrão |

Todas as preferências são salvas no `localStorage` do navegador e restauradas
automaticamente na próxima visita. O painel funciona como um diálogo
acessível: foco preso enquanto aberto, fecha com `Esc` ou clique fora, e
anuncia cada mudança para leitores de tela via região `aria-live`.

## Acessibilidade

Este projeto segue boas práticas de acessibilidade como parte do próprio
tema que apresenta:

- Link "pular para o conteúdo" no topo da página
- Navegação e painel totalmente operáveis por teclado
- Atributos `aria-expanded`, `aria-controls`, `aria-pressed` e `aria-live`
  sincronizados com o estado da interface
- Respeito a `prefers-reduced-motion`
- Contraste de cores e tamanhos de fonte ajustáveis pelo próprio usuário

## Autor

Projeto desenvolvido pelo **Squad 7**.
