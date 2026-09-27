/* Menezes Cavalcante Engenharia — interações do site */
(function () {
  'use strict';

  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var comPonteiro = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* --- Vidro líquido: refração nas bordas (Chrome, Edge, Samsung Internet) --
     Esses navegadores aceitam filtro SVG dentro do backdrop-filter. Para cada
     peça de vidro geramos um "mapa de deslocamento" do tamanho dela: perto da
     borda o fundo é puxado para dentro, como numa lente. Safari e Firefox
     ficam com o vidro clássico (desfoque + brilho), definido só no CSS. */
  var refracao = (function () {
    var marcas = navigator.userAgentData && navigator.userAgentData.brands;
    var ok = !!(marcas && marcas.some(function (m) { return /Chromium/.test(m.brand); }));
    if (!ok) return null;

    var NS = 'http://www.w3.org/2000/svg';
    var defs = document.createElementNS(NS, 'svg');
    defs.setAttribute('aria-hidden', 'true');
    defs.setAttribute('focusable', 'false');
    defs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
    document.body.appendChild(defs);
    document.documentElement.classList.add('lg-refracao');

    var mapas = {};
    var total = 0;

    function mapa(w, h, r, faixa) {
      var chave = w + 'x' + h + 'x' + r + 'x' + faixa;
      if (mapas[chave]) return mapas[chave];
      var tela = document.createElement('canvas');
      tela.width = w; tela.height = h;
      var ctx = tela.getContext('2d');
      var img = ctx.createImageData(w, h);
      var d = img.data;
      var cx = w / 2, cy = h / 2;
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          var px = x + 0.5 - cx, py = y + 0.5 - cy;
          // distância até a borda de um retângulo de cantos arredondados
          var qx = Math.abs(px) - (cx - r), qy = Math.abs(py) - (cy - r);
          var fx = Math.max(qx, 0), fy = Math.max(qy, 0);
          var dist = Math.sqrt(fx * fx + fy * fy) + Math.min(Math.max(qx, qy), 0) - r;
          var prof = -dist;
          // direção da borda mais próxima
          var nx = 0, ny = 0;
          if (qx > 0 && qy > 0) {
            var l = Math.sqrt(qx * qx + qy * qy) || 1;
            nx = qx / l; ny = qy / l;
          } else if (qx > qy) { nx = 1; } else { ny = 1; }
          if (px < 0) nx = -nx;
          if (py < 0) ny = -ny;
          var t = Math.min(Math.max(prof / faixa, 0), 1);
          var forca = Math.pow(1 - t, 2.4);
          var i = (y * w + x) * 4;
          d[i] = 128 - nx * forca * 127;
          d[i + 1] = 128 - ny * forca * 127;
          d[i + 2] = 128;
          d[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      return (mapas[chave] = tela.toDataURL());
    }

    function aplicar(el, intensidade) {
      var w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
      if (!w || !h) return;
      var raio = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
      var r = Math.min(raio, w / 2, h / 2);
      var faixa = Math.max(6, Math.min(h * 0.42, 22));
      if (el._lg && el._lg.w === w && el._lg.h === h) return;
      var id = (el._lg && el._lg.id) || ('lg-' + (++total));
      var filtro = defs.querySelector('#' + id);
      if (!filtro) {
        filtro = document.createElementNS(NS, 'filter');
        filtro.setAttribute('id', id);
        filtro.setAttribute('color-interpolation-filters', 'sRGB');
        filtro.setAttribute('filterUnits', 'userSpaceOnUse');
        filtro.innerHTML =
          '<feImage result="mapa" preserveAspectRatio="none" x="0" y="0"/>' +
          '<feDisplacementMap in="SourceGraphic" in2="mapa" xChannelSelector="R" yChannelSelector="G"/>';
        defs.appendChild(filtro);
      }
      filtro.setAttribute('x', 0); filtro.setAttribute('y', 0);
      filtro.setAttribute('width', w); filtro.setAttribute('height', h);
      var fe = filtro.firstChild;
      fe.setAttribute('width', w); fe.setAttribute('height', h);
      fe.setAttribute('href', mapa(w, h, Math.round(r), Math.round(faixa)));
      filtro.lastChild.setAttribute('scale', Math.round(faixa * (intensidade || 1.6)));
      el._lg = { id: id, w: w, h: h };
      el.style.setProperty('--lg', 'url(#' + id + ')');
    }

    var pecas = [];
    function registrar(seletor, intensidade) {
      document.querySelectorAll(seletor).forEach(function (el) {
        pecas.push([el, intensidade]);
        aplicar(el, intensidade);
      });
    }
    function atualizar() {
      pecas.forEach(function (p) { aplicar(p[0], p[1]); });
    }
    window.addEventListener('resize', atualizar);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(atualizar);
    return { registrar: registrar, atualizar: atualizar };
  })();

  /* --- Nav: sombra e cápsula mais baixa ao rolar -------------------------- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var marcaScroll = function () {
      nav.classList.toggle('is-stuck', window.scrollY > 12);
    };
    marcaScroll();
    window.addEventListener('scroll', marcaScroll, { passive: true });
    var capsula = nav.querySelector('.nav__in');
    if (refracao && capsula) {
      refracao.registrar('.nav__in', 1.3);
      capsula.addEventListener('transitionend', function (e) {
        if (e.propertyName === 'height') refracao.atualizar();
      });
    }
  }

  /* --- Menu mobile -------------------------------------------------------- */
  var burger = document.querySelector('.burger');
  if (burger) {
    var fecharMenu = function () {
      document.body.classList.remove('menu-aberto');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menu');
      document.body.style.overflow = '';
    };
    burger.addEventListener('click', function () {
      var aberto = document.body.classList.toggle('menu-aberto');
      burger.setAttribute('aria-expanded', String(aberto));
      burger.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
      document.body.style.overflow = aberto ? 'hidden' : '';
    });
    document.querySelectorAll('.drawer a').forEach(function (a) {
      a.addEventListener('click', fecharMenu);
    });
    // fecha ao tocar fora da gaveta ou apertar Esc
    document.addEventListener('click', function (e) {
      if (document.body.classList.contains('menu-aberto') && !e.target.closest('.drawer, .burger')) fecharMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-aberto')) { fecharMenu(); burger.focus(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1040 && document.body.classList.contains('menu-aberto')) fecharMenu();
    });
  }

  /* --- Gota líquida: indicador que escorre até o item ativo --------------- */
  // No meio do caminho ela estica na direção do destino e achata um pouco,
  // como uma gota — o gesto característico do vidro líquido.
  function criarGota(caixa, classe) {
    var gota = document.createElement('span');
    gota.className = classe;
    gota.setAttribute('aria-hidden', 'true');
    caixa.insertBefore(gota, caixa.firstChild);
    var pos = null;

    return function mover(alvo, animar) {
      if (!alvo || !alvo.offsetWidth) {
        gota.classList.remove('is-on');
        pos = null;
        return;
      }
      var novo = { x: alvo.offsetLeft, y: alvo.offsetTop, w: alvo.offsetWidth, h: alvo.offsetHeight };
      var antes = pos;
      var visivel = gota.classList.contains('is-on');
      pos = novo;
      gota.style.width = novo.w + 'px';
      gota.style.height = novo.h + 'px';
      gota.style.transform = 'translate(' + novo.x + 'px,' + novo.y + 'px)';
      gota.classList.add('is-on');
      if (!animar || !antes || !visivel || !gota.animate) return;
      if (antes.x === novo.x && antes.y === novo.y && antes.w === novo.w) return;

      var de = { transform: 'translate(' + antes.x + 'px,' + antes.y + 'px)', width: antes.w + 'px', height: antes.h + 'px' };
      var para = { transform: 'translate(' + novo.x + 'px,' + novo.y + 'px)', width: novo.w + 'px', height: novo.h + 'px' };
      if (semMovimento) {
        // versão calma: desliza direto, sem esticar
        gota.animate([de, para], { duration: 220, easing: 'ease-out' });
        return;
      }

      var meio;
      if (Math.abs(antes.y - novo.y) < 4) {
        var esq = Math.min(antes.x, novo.x);
        var dir = Math.max(antes.x + antes.w, novo.x + novo.w);
        var vao = dir - esq;
        var largura = vao * 0.74;
        var x = novo.x > antes.x ? dir - largura - vao * 0.07 : esq + vao * 0.07;
        meio = { transform: 'translate(' + x + 'px,' + novo.y + 'px) scaleY(.82)', width: largura + 'px', height: novo.h + 'px', offset: 0.42 };
      } else {
        meio = {
          transform: 'translate(' + (antes.x + novo.x) / 2 + 'px,' + (antes.y + novo.y) / 2 + 'px) scale(1.08,.84)',
          width: (antes.w + novo.w) / 2 + 'px', height: novo.h + 'px', offset: 0.42
        };
      }
      gota.animate([de, meio, para], { duration: 620, easing: 'cubic-bezier(.3,.85,.25,1)' });
    };
  }

  var menu = document.querySelector('.menu');
  if (menu) {
    var moverMenu = criarGota(menu, 'menu__gota');
    var paginaAtual = menu.querySelector('[aria-current="page"]');
    var posicionar = function () { moverMenu(paginaAtual, false); };
    posicionar();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(posicionar);
    window.addEventListener('resize', posicionar);
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('mouseenter', function () { moverMenu(a, true); });
      a.addEventListener('focus', function () { moverMenu(a, true); });
    });
    menu.addEventListener('mouseleave', function () { moverMenu(paginaAtual, true); });
    menu.addEventListener('focusout', function (e) {
      if (!menu.contains(e.relatedTarget)) moverMenu(paginaAtual, true);
    });
  }

  /* --- Revelação ao entrar na viewport ----------------------------------- */
  var alvos = document.querySelectorAll('.rev');
  if (alvos.length) {
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      alvos.forEach(function (el) { obs.observe(el); });
    } else {
      alvos.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* --- Carrossel do hero -------------------------------------------------- */
  var palco = document.querySelector('.hero__palco');
  if (palco) {
    var hero = palco.closest('.hero') || palco;
    var slides = palco.querySelectorAll('.slide');
    var dots = palco.querySelectorAll('.dot');
    var TEMPO = 6500;
    var atual = 0;
    var timer = null;
    palco.style.setProperty('--tempo', TEMPO + 'ms');

    var ir = function (i) {
      var novo = (i + slides.length) % slides.length;
      if (novo !== atual) {
        // o slide que sai mantém o zoom até terminar de sumir
        var sai = slides[atual];
        sai.classList.add('is-saindo');
        setTimeout(function () { sai.classList.remove('is-saindo'); }, 1300);
      }
      atual = novo;
      slides.forEach(function (s, k) {
        s.classList.toggle('is-on', k === atual);
        s.setAttribute('aria-hidden', String(k !== atual));
        if (k === atual) s.classList.remove('is-saindo');
      });
      dots.forEach(function (d, k) {
        d.classList.remove('is-on');
        d.setAttribute('aria-selected', String(k === atual));
      });
      void palco.offsetWidth; // reinicia a barra de progresso do ponto ativo
      if (dots[atual]) dots[atual].classList.add('is-on');
    };

    var pausado = false;          // pausa pedida pelo visitante
    var tocar = function () {
      clearInterval(timer);
      timer = setInterval(function () { ir(atual + 1); }, TEMPO);
      hero.classList.remove('is-parado');
    };
    var parar = function () {
      clearInterval(timer);
      timer = null;
      hero.classList.add('is-parado');
    };

    dots.forEach(function (d, k) {
      d.addEventListener('click', function () { ir(k); if (timer) tocar(); });
    });

    slides.forEach(function (s, k) { s.setAttribute('aria-hidden', String(k !== 0)); });

    // A troca é só um esmaecimento, então continua mesmo no modo "reduzir
    // movimento"; o botão de pausa dá o controle ao visitante.
    var botaoPausa = palco.querySelector('.hero__pausa');
    if (slides.length > 1) {
      tocar();
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) { parar(); } else if (!pausado) { ir(atual); tocar(); }
      });
      if (botaoPausa) {
        botaoPausa.addEventListener('click', function () {
          pausado = !pausado;
          if (pausado) { parar(); } else { ir(atual); tocar(); }
          botaoPausa.setAttribute('aria-pressed', String(pausado));
          botaoPausa.setAttribute('aria-label', pausado ? 'Retomar destaques' : 'Pausar destaques');
        });
      }
    } else {
      parar();
      if (botaoPausa) botaoPausa.hidden = true;
    }

    // o texto do primeiro slide entra depois do primeiro quadro pintado
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add('is-pronto'); });
    });

    // parallax leve da foto ao rolar
    if (!semMovimento) {
      var pedido = false;
      var parallax = function () {
        pedido = false;
        var y = window.scrollY;
        if (y > window.innerHeight * 1.3) return;
        palco.style.setProperty('--py', (y * 0.14).toFixed(1) + 'px');
      };
      window.addEventListener('scroll', function () {
        if (!pedido) { pedido = true; requestAnimationFrame(parallax); }
      }, { passive: true });
    }

    if (refracao) {
      refracao.registrar('.hero__ctrl', 1.4);
      refracao.registrar('.slide__tag', 1.4);
      refracao.registrar('.slide .btn--vidro', 1.5);
    }
  }

  /* --- Contadores --------------------------------------------------------- */
  var nums = document.querySelectorAll('[data-conta]');
  if (nums.length) {
    var valorFinal = function (el) {
      el.textContent = el.dataset.conta + (el.dataset.sufixo || '');
    };

    if (semMovimento || !('IntersectionObserver' in window)) {
      // Sem animação: o número já aparece pronto (nunca deixar "0" na tela).
      nums.forEach(valorFinal);
    } else {
      var obsN = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          obsN.unobserve(e.target);
          var el = e.target;
          var alvo = parseFloat(el.dataset.conta);
          var sufixo = el.dataset.sufixo || '';
          var ini = performance.now();
          var dur = 1400;
          var passo = function (agora) {
            var p = Math.min((agora - ini) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(alvo * eased) + sufixo;
            if (p < 1) { requestAnimationFrame(passo); } else { valorFinal(el); }
          };
          requestAnimationFrame(passo);
        });
      }, { threshold: 0.5 });
      nums.forEach(function (n) { obsN.observe(n); });
    }
  }

  /* --- Filtros de obras --------------------------------------------------- */
  var caixaFiltros = document.querySelector('.filtros');
  if (caixaFiltros) {
    var filtros = caixaFiltros.querySelectorAll('.filtro');
    var cards = document.querySelectorAll('[data-cat]');
    var moverFiltro = criarGota(caixaFiltros, 'filtros__gota');
    caixaFiltros.classList.add('tem-gota');
    var posFiltro = function () { moverFiltro(caixaFiltros.querySelector('.filtro.is-on'), false); };
    posFiltro();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(posFiltro);
    window.addEventListener('resize', posFiltro);

    var aplicarFiltro = function (cat) {
      cards.forEach(function (card) {
        // Uma obra pode pertencer a mais de uma categoria: data-cat="estrutural residencial"
        var cats = card.dataset.cat.split(/\s+/);
        var mostra = cat === 'todos' || cats.indexOf(cat) !== -1;
        card.style.display = mostra ? '' : 'none';
        if (mostra) card.classList.add('is-in');
      });
    };

    filtros.forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.classList.contains('is-on')) return;
        filtros.forEach(function (o) {
          o.classList.toggle('is-on', o === b);
          o.setAttribute('aria-pressed', String(o === b));
        });
        moverFiltro(b, true);
        var cat = b.dataset.filtro;
        // Com View Transitions os cards deslizam para as novas posições
        if (document.startViewTransition && !semMovimento) {
          var raiz = document.documentElement;
          cards.forEach(function (c, i) { c.style.viewTransitionName = 'obra-' + i; });
          raiz.classList.add('vt-filtro');
          var t = document.startViewTransition(function () { aplicarFiltro(cat); });
          t.finished.finally(function () {
            raiz.classList.remove('vt-filtro');
            cards.forEach(function (c) { c.style.viewTransitionName = ''; });
          });
        } else {
          aplicarFiltro(cat);
        }
      });
    });
  }

  /* --- Luz que acompanha o ponteiro (vidro e cards) ----------------------- */
  if (comPonteiro) {
    document.addEventListener('pointermove', function (e) {
      var el = e.target.closest && e.target.closest('.btn--vidro, .nav__in, .hero__ctrl, .serv');
      if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
    }, { passive: true });
  }

  /* --- Formulários (envio simulado — plugar back-end depois) -------------- */
  document.querySelectorAll('form[data-form]').forEach(function (f) {
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ok = f.querySelector('.form__ok');
      if (ok) {
        ok.classList.remove('is-on');
        void ok.offsetWidth;
        ok.classList.add('is-on');
        ok.setAttribute('role', 'status');
      }
      f.reset();
    });
  });

  /* --- Ano no rodapé ------------------------------------------------------ */
  document.querySelectorAll('[data-ano]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
