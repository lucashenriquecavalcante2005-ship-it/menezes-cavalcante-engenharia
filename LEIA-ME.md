# Site — Menezes Cavalcante Engenharia

Site institucional estático (HTML + CSS + JS puro, sem build e sem dependências).

**Posicionamento:** engenharia estrutural e construtora. O carro-chefe é o **projeto
estrutural** — modelagem 3D, análise e detalhamento — somado à execução de obras e às
soluções em aço (corte, dobra e armação). Atendimento residencial, alto padrão,
comercial, industrial e obras públicas em **todo Pernambuco, da capital ao interior**.

Frase-conceito que fecha o site:
*"Da concepção estrutural à execução, transformamos projetos em soluções concretas."*

---

## Como visualizar

Abra `index.html` no navegador. Para servir por HTTP (recomendado — as transições
entre páginas e a página 404 só funcionam assim):

```bash
node serve.js
```

Depois abra `http://localhost:5177`. Sem Node instalado, use o Python:

```bash
python -m http.server 5178
```

e abra `http://localhost:5178`.

---

## Estrutura

```
index.html          Home — carrossel, quem somos, PROJETO ESTRUTURAL (destaque),
                    6 serviços, portfólio, soluções em aço (com galeria), processo,
                    Instagram, formulário
sobre.html          A empresa — quem somos (foto do escritório), direção técnica
                    (retrato), áreas de atuação, pilares
servicos.html       Os 6 serviços em detalhe, cada um com foto
                    (#estrutural #execucao #aco #residencial #comercial #publicas)
obras.html          Portfólio (12 obras) com filtros
contato.html        Formulário, canais e mapa
privacidade.html    Política de privacidade (LGPD) e termos de uso (#termos)
404.html            Página de erro para endereços inexistentes
.htaccess           Para hospedagem Apache (Hostinger etc.): 404, acentos, compressão e cache
serve.js            Servidor local de desenvolvimento

assets/css/style.css   Design system completo (inclui o vidro líquido)
assets/js/main.js      Menu, gaveta, carrossel, gota líquida, refração, filtros, formulários
assets/img/            Logo, ícones, imagem de compartilhamento, marcadores de reserva
assets/img/aco/        Fotos da central de corte, dobra e armação
assets/img/empresa/    Escritório e retrato da direção técnica
assets/img/obras/      Fotos, renders e pranchas do portfólio
assets/img/originais/  Arquivos originais do WhatsApp (backup, não usados pelo site)
```

---

## Imagens

| Arquivo | Onde aparece |
|---|---|
| `tapume-obra.jpg` | 1º slide do topo e bloco final de "A empresa" |
| `og-image.jpg` | Prévia do link ao compartilhar (WhatsApp, redes) — recorte do tapume |
| `aco/corte-serra.jpg` | 2º slide do topo e serviço "Corte, dobra e armação" |
| `aco/corte-faiscas.jpg` | Galeria de aço da home |
| `aco/feixes-identificados.jpg` | Galeria de aço da home |
| `aco/bancada-tabela-corte.jpg` | Galeria de aço da home |
| `empresa/escritorio.jpg` | "A empresa" — quem somos |
| `empresa/direcao-tecnica.jpg` | "A empresa" — direção técnica (retrato sem as faixas pretas) |
| `obras/residencial-fachada.jpg` | 3º slide, portfólio e serviço residencial |
| `obras/comercial-fachada.jpg` | Portfólio e serviço comercial (recortado do post do Instagram) |
| `obras/praca-publica.jpg` | Portfólio — versão mais nítida enviada em 27/09 |
| `obras/galpao-industrial.jpg` | Portfólio — versão mais nítida enviada em 27/09 |
| demais `obras/*.jpg` | Portfólio (sem mudança) |

**Para trocar qualquer imagem:** sobrescreva o arquivo mantendo o nome.

**Para adicionar uma obra nova:** copie um bloco `<a class="obra ...">` em `obras.html`,
troque texto e `src`. A categoria vai em `data-cat` e aceita mais de uma:
`data-cat="estrutural residencial"`. Pranchas e plantas usam `obra__img--desenho`
(mostra o desenho inteiro sobre fundo branco).

---

## Logo

`logo-mc.svg` (vinho, para fundo claro), `logo-mc-branco.svg` (rodapé), `favicon.svg`
e `apple-touch-icon.png` foram **redesenhados a partir das fotos do tapume e do
escritório** — já seguem o monograma real (haste cortada, C sobreposto à perna do M).
Ainda assim é uma reconstrução: se a empresa tiver o arquivo vetorial oficial
(.svg, .pdf ou .ai), basta sobrescrever esses arquivos.

---

## Animações e vidro líquido

- **Menu** em cápsula de vidro flutuante; uma "gota" desliza até o link sob o mouse.
- **Carrossel** com zoom lento nas fotos, texto entrando em sequência, pontos que viram
  barra de progresso e botão de pausar.
- **Peças de vidro** sobre as fotos (etiquetas, botões, legendas, selos das obras):
  desfoque + brilho em todos os navegadores; no Chrome/Edge há também **refração nas
  bordas** (o fundo "curva" como numa lente), gerada pelo `main.js`.
- Seções aparecem com esmaecimento ao rolar; bolhas animadas na faixa vinho;
  filtros de obras com gota vinho e cards que deslizam para as novas posições;
  transição suave entre páginas (Chrome, Edge e Safari recentes).

**Modo "reduzir movimento":** se o sistema do visitante pede menos animação
(Windows: Configurações → Acessibilidade → Efeitos visuais → *Efeitos de animação*
desligado), o site mostra uma versão calma — ficam os esmaecimentos e a troca de
slides, saem zoom, parallax e efeitos elásticos. É o comportamento esperado, não defeito.

**Ao alterar `style.css` ou `main.js`:** troque o número em `?v=20260927` nos
`<link>`/`<script>` das páginas, para quem já visitou não ficar com a versão antiga
em cache.

---

## ⚠️ Falta trocar antes de publicar

Marcados no código com `<!-- SUBSTITUIR: ... -->`. Para achar todos:

```bash
grep -rn "SUBSTITUIR" *.html
```

| Item | Situação atual |
|---|---|
| **Telefone / WhatsApp** | `(81) 9 9999-9999` e `wa.me/5581999999999` — fictícios |
| **E-mail** | `contato@menezescavalcante.com.br` — presumido |
| **Direção técnica** | `sobre.html`: nome, formação e CREA de quem aparece no retrato (hoje "Nome e sobrenome") |
| **CNPJ e nº do CREA** | rodapé e política de privacidade |
| **Dados das obras** | cada uma está com "Pernambuco" no lugar da cidade e specs genéricas |
| **Domínio** | `og:image` usa caminho relativo — com o domínio no ar, use o endereço completo; depois criar `sitemap.xml`, `robots.txt` e URL canônica |
| **Política de privacidade** | texto-base; revisar com a assessoria jurídica |

Não há nenhum número inventado no site (nada de "X anos de mercado" ou "Y obras
entregues"). Se quiser incluir depois, o bloco de três colunas em `index.html` e
`sobre.html` aceita contadores animados: troque o conteúdo por
`<span data-conta="120" data-sufixo="+">0</span>`.

---

## Formulários

Hoje os formulários apenas exibem a confirmação na tela (`assets/js/main.js`, bloco
*"Formulários (envio simulado)"*). Para funcionar de verdade:

- **Formspree / Getform / Web3Forms** — troque `<form data-form>` por
  `<form action="https://formspree.io/f/SEU_ID" method="POST">` e **remova** o
  `data-form` para o JS não interceptar o envio;
- **PHP** na própria hospedagem — aponte o `action` para um `enviar.php`;
- **WhatsApp** — o botão flutuante e o CTA de contato já levam direto à conversa.

---

## Personalização rápida

Cores e medidas ficam no topo de `assets/css/style.css`, em `:root`:

```css
--vinho:     #7A1C2E;   /* cor principal da marca */
--vinho-esc: #4A0F1C;   /* hover e fundo do hero */
--tinta:     #12161B;   /* texto, rodapé e seções escuras */
--areia:     #F7F4F2;   /* fundo das seções alternadas */
```

Tipografia: **Archivo** (títulos) + **Inter** (texto), via Google Fonts.

---

## Acessibilidade e SEO

- Estrutura semântica (`header`, `nav`, `main`, `section`, `article`, `footer`)
- `aria-label`, `aria-current`, `aria-expanded`, `aria-pressed` e `role` nos componentes
- Carrossel com pausa; slides fora do ar não recebem foco nem leitura de tela
- Gaveta do celular fecha com Esc ou tocando fora
- Respeita `prefers-reduced-motion` (ver "Animações")
- Sem JavaScript, todo o conteúdo continua visível (as animações só escondem o
  conteúdo quando o JS está ativo)
- `title`, `meta description`, Open Graph e ícones em todas as páginas
- Sem rolagem horizontal de 375 px a 1440 px

**Peso das imagens:** entre 40 KB e 290 KB cada. Para otimizar mais, converta para
WebP (`squoosh.app`) e troque a extensão no `src`.
