/* ==========================================================
   ACESSIBILIDADE COGNITIVA — SQUAD 7
   Painel de personalização de leitura

   Arquitetura:
   - IIFE isola o código do escopo global (nenhum vazamento
     de variáveis/funções para `window`).
   - `state` é a única fonte de verdade; toda mudança visual
     passa por `applyState()`, que também persiste no
     localStorage — as preferências sobrevivem a um reload.
   - `qs()` centraliza a busca de elementos e falha de forma
     clara (console.error) se o HTML mudar e um id sumir,
     em vez de lançar TypeError sem contexto no meio do app.
   ========================================================== */

(() => {
    "use strict";

    /* ----------------------------------------------------
       CONFIGURAÇÃO
    ---------------------------------------------------- */

    const STORAGE_KEY = "squad7:reading-preferences";

    // Níveis possíveis de tamanho de fonte, na ordem em que
    // "Aumentar" avança e "Diminuir" retrocede.
    const FONT_LEVELS = ["normal", "large-text", "extra-large-text"];

    const DEFAULT_STATE = {
        fontLevel: 0,           // índice em FONT_LEVELS
        spacing: false,
        readableFont: true,     // ligado por padrão, como no HTML original
        ruler: false,
        highContrast: false,
    };

    /* ----------------------------------------------------
       HELPERS
    ---------------------------------------------------- */

    /**
     * Busca um elemento por id e avisa no console (sem quebrar
     * a aplicação) caso ele não exista — facilita detectar
     * dessincronização entre HTML e JS durante manutenção.
     */
    function qs(id) {
        const el = document.getElementById(id);
        if (!el) {
            console.error(`[reading-panel] elemento "#${id}" não encontrado.`);
        }
        return el;
    }

    function prefersReducedMotion() {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return { ...DEFAULT_STATE };
            return { ...DEFAULT_STATE, ...JSON.parse(raw) };
        } catch {
            // localStorage indisponível (modo privado, quota, etc.)
            // ou JSON corrompido: segue com o padrão sem quebrar a página.
            return { ...DEFAULT_STATE };
        }
    }

    function saveState(state) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            // Falha silenciosa: persistência é um extra, não deve
            // impedir o uso do painel.
        }
    }

    /* ----------------------------------------------------
       ELEMENTOS
    ---------------------------------------------------- */

    const els = {
        openReading: qs("openReading"),
        closeReading: qs("closeReading"),
        readingPanel: qs("readingPanel"),
        increaseFont: qs("increaseFont"),
        decreaseFont: qs("decreaseFont"),
        spacingButton: qs("spacingButton"),
        fontButton: qs("fontButton"),
        rulerButton: qs("rulerButton"),
        contrastButton: qs("contrastButton"),
        resetButton: qs("resetButton"),
        readingRuler: qs("readingRuler"),
        content: qs("content"),
        liveMessage: qs("liveMessage"),
        menuButton: qs("menuButton"),
        nav: document.querySelector(".nav"),
        howButton: qs("howButton"),
    };

    let state = loadState();

    /* ----------------------------------------------------
       ANÚNCIOS PARA LEITOR DE TELA
    ---------------------------------------------------- */

    function announce(message) {
        els.liveMessage.textContent = "";
        // Timeout curto garante que leitores de tela percebam a
        // mudança mesmo quando a mensagem é igual à anterior.
        window.setTimeout(() => {
            els.liveMessage.textContent = message;
        }, 50);
    }

    /* ----------------------------------------------------
       APLICAR ESTADO NA TELA
       Ponto único que traduz `state` em classes/atributos.
    ---------------------------------------------------- */

    function applyState({ persist = true, announceChange = null } = {}) {
        FONT_LEVELS.forEach((cls) => {
            if (cls !== "normal") els.content.classList.remove(cls);
        });
        const level = FONT_LEVELS[state.fontLevel];
        if (level !== "normal") els.content.classList.add(level);

        els.content.classList.toggle("spacing-mode", state.spacing);
        els.content.classList.toggle("readable-font", state.readableFont);
        els.readingRuler.classList.toggle("active", state.ruler);
        document.body.classList.toggle("high-contrast", state.highContrast);

        setSwitch(els.spacingButton, state.spacing);
        setSwitch(els.fontButton, state.readableFont);
        setSwitch(els.rulerButton, state.ruler);
        setSwitch(els.contrastButton, state.highContrast);

        if (persist) saveState(state);
        if (announceChange) announce(announceChange);
    }

    function setSwitch(button, active) {
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    }

    /* ----------------------------------------------------
       ABRIR / FECHAR PAINEL
    ---------------------------------------------------- */

    function openPanel() {
        els.readingPanel.classList.add("open");
        els.readingPanel.setAttribute("aria-hidden", "false");
        els.openReading.setAttribute("aria-expanded", "true");
        els.closeReading.focus();
        announce("Painel de personalização da leitura aberto.");
        document.addEventListener("keydown", trapFocusInPanel);
        document.addEventListener("click", handleOutsideClick, true);
    }

    function closePanel({ restoreFocus = true, message = "Painel de personalização fechado." } = {}) {
        els.readingPanel.classList.remove("open");
        els.readingPanel.setAttribute("aria-hidden", "true");
        els.openReading.setAttribute("aria-expanded", "false");
        if (restoreFocus) els.openReading.focus();
        announce(message);
        document.removeEventListener("keydown", trapFocusInPanel);
        document.removeEventListener("click", handleOutsideClick, true);
    }

    function isPanelOpen() {
        return els.readingPanel.classList.contains("open");
    }

    function handleOutsideClick(event) {
        if (
            !els.readingPanel.contains(event.target) &&
            event.target !== els.openReading &&
            !els.openReading.contains(event.target)
        ) {
            closePanel({ restoreFocus: false });
        }
    }

    /**
     * Mantém o foco dentro do painel enquanto ele está aberto
     * (Tab / Shift+Tab não escapam para o resto da página) e
     * fecha com Escape — comportamento esperado de um diálogo
     * acessível (padrão WAI-ARIA de dialog).
     */
    function trapFocusInPanel(event) {
        if (event.key === "Escape") {
            closePanel({ message: "Painel fechado." });
            return;
        }

        if (event.key !== "Tab") return;

        const focusable = els.readingPanel.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    els.openReading.addEventListener("click", () => {
        isPanelOpen() ? closePanel() : openPanel();
    });

    els.closeReading.addEventListener("click", () => closePanel());

    /* ----------------------------------------------------
       FONTE
    ---------------------------------------------------- */

    els.increaseFont.addEventListener("click", () => {
        if (state.fontLevel >= FONT_LEVELS.length - 1) {
            announce("A fonte já está no maior tamanho disponível.");
            return;
        }
        state.fontLevel += 1;
        const msg =
            FONT_LEVELS[state.fontLevel] === "extra-large-text"
                ? "Fonte aumentada para tamanho extra grande."
                : "Fonte aumentada.";
        applyState({ announceChange: msg });
    });

    els.decreaseFont.addEventListener("click", () => {
        if (state.fontLevel <= 0) {
            announce("A fonte já está no menor tamanho disponível.");
            return;
        }
        state.fontLevel -= 1;
        const msg =
            state.fontLevel === 0
                ? "Fonte voltou ao tamanho padrão."
                : "Fonte diminuída.";
        applyState({ announceChange: msg });
    });

    /* ----------------------------------------------------
       ESPAÇAMENTO / FONTE LEGÍVEL / CONTRASTE
    ---------------------------------------------------- */

    els.spacingButton.addEventListener("click", () => {
        state.spacing = !state.spacing;
        applyState({
            announceChange: state.spacing
                ? "Espaçamento ampliado."
                : "Espaçamento padrão restaurado.",
        });
    });

    els.fontButton.addEventListener("click", () => {
        state.readableFont = !state.readableFont;
        applyState({
            announceChange: state.readableFont
                ? "Fonte otimizada para leitura ativada."
                : "Fonte padrão ativada.",
        });
    });

    els.contrastButton.addEventListener("click", () => {
        state.highContrast = !state.highContrast;
        applyState({
            announceChange: state.highContrast
                ? "Alto contraste ativado."
                : "Alto contraste desativado.",
        });
    });

    /* ----------------------------------------------------
       RÉGUA DE LEITURA
    ---------------------------------------------------- */

    function toggleRuler(source) {
        state.ruler = !state.ruler;
        applyState({
            announceChange: state.ruler
                ? `Régua de leitura ativada${source}.`
                : "Régua de leitura desativada.",
        });
    }

    els.rulerButton.addEventListener("click", () => toggleRuler(""));

    // Atalho de teclado "r" — ignorado quando o usuário está
    // digitando em um campo de formulário, para não interceptar
    // a letra "r" durante a digitação normal.
    document.addEventListener("keydown", (event) => {
        const target = event.target;
        const isTyping =
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable;

        if (
            event.key.toLowerCase() === "r" &&
            !event.ctrlKey &&
            !event.altKey &&
            !event.metaKey &&
            !isTyping
        ) {
            toggleRuler(" pelo teclado");
        }
    });

    // O listener de mousemove só reposiciona a régua quando ela
    // está ativa, e usa requestAnimationFrame para não disparar
    // um reflow a cada pixel de movimento do mouse.
    let rulerFrame = null;

    document.addEventListener("mousemove", (event) => {
        if (!state.ruler || rulerFrame !== null) return;
        rulerFrame = requestAnimationFrame(() => {
            els.readingRuler.style.top = `${event.clientY - 27}px`;
            rulerFrame = null;
        });
    });

    /* ----------------------------------------------------
       RESTAURAR PADRÕES
    ---------------------------------------------------- */

    els.resetButton.addEventListener("click", () => {
        state = { ...DEFAULT_STATE };
        applyState({ announceChange: "Todas as configurações de leitura foram restauradas." });
    });

    /* ----------------------------------------------------
       MENU MOBILE
    ---------------------------------------------------- */

    els.menuButton.addEventListener("click", () => {
        const open = els.nav.classList.toggle("open");
        els.menuButton.setAttribute("aria-expanded", String(open));
    });

    document.querySelectorAll(".nav a").forEach((link) => {
        link.addEventListener("click", () => {
            els.nav.classList.remove("open");
            els.menuButton.setAttribute("aria-expanded", "false");
        });
    });

    /* ----------------------------------------------------
       BOTÃO "COMO FUNCIONA"
    ---------------------------------------------------- */

    els.howButton.addEventListener("click", () => {
        if (!isPanelOpen()) openPanel();
        announce("Veja as opções disponíveis no Modo de Leitura.");
    });

    /* ----------------------------------------------------
       INICIALIZAÇÃO
       Aplica preferências salvas (ou padrão) sem disparar
       anúncios de leitor de tela nem regravar o storage.
    ---------------------------------------------------- */

    applyState({ persist: false });

    if (prefersReducedMotion()) {
        document.documentElement.classList.add("reduced-motion");
    }
})();