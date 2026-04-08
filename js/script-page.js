(() => {
    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn, { once: true });
        } else {
            fn();
        }
    }

    function waitForElement(selector, callback, options = {}) {
        const {
            root = document,
            timeout = 5000,
            once = true
        } = options;

        const found = root.querySelector(selector);
        if (found) {
            callback(found);
            return;
        }

        const observer = new MutationObserver(() => {
            const el = root.querySelector(selector);
            if (!el) return;

            callback(el);
            if (once) observer.disconnect();
        });

        observer.observe(root === document ? document.body : root, {
            childList: true,
            subtree: true
        });

        if (timeout > 0) {
            setTimeout(() => observer.disconnect(), timeout);
        }
    }

    /* =========================
       Language sheet
    ========================= */
    function initLanguageSheet(sheet) {
        if (!sheet || sheet.dataset.langInit === 'true') return;
        sheet.dataset.langInit = 'true';

        const BREAKPOINT = 1024;

        const panel = sheet.querySelector(".appSheet__panel");
        const scroller = sheet.querySelector(".wheel__scroller");
        const wheel = sheet.querySelector(".wheel");
        const doneBtn = sheet.querySelector("[data-lang-done]");

        if (!panel || !scroller || !wheel || !doneBtn) return;

        let currentValue = localStorage.getItem("lang") || "en";
        let activeTrigger = null;

        let pinned = false;
        let hoveringTrigger = false;
        let hoveringPanel = false;
        let suppressHoverUntilLeave = false;

        const isDesktop = () => window.innerWidth >= BREAKPOINT;
        const isOpen = () => sheet.classList.contains("isOpen");
        const isHovering = () => hoveringTrigger || hoveringPanel;

        function getTriggers() {
            return document.querySelectorAll("[data-lang-trigger]");
        }

        function openMobileSheet(triggerBtn) {
            activeTrigger = triggerBtn;
            sheet.classList.add("isOpen");
            sheet.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";

            setTimeout(() => wheel.focus(), 50);
            scrollToValue(currentValue, false);
            updateVisual();
        }

        function openDesktopDropdown(triggerBtn) {
            activeTrigger = triggerBtn;
            sheet.classList.add("isOpen");
            sheet.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "";

            const r = triggerBtn.getBoundingClientRect();
            sheet.style.left = `${r.left + window.scrollX}px`;
            sheet.style.top = `${r.bottom + window.scrollY + 8}px`;

            requestAnimationFrame(() => {
                const rect = panel.getBoundingClientRect();
                const overflowX = rect.right - window.innerWidth;
                if (overflowX > 0) {
                    sheet.style.left = `${(r.left + window.scrollX) - overflowX - 8}px`;
                }
            });
        }

        function closeAll() {
            sheet.classList.remove("isOpen");
            sheet.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }

        document.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-lang-trigger]");
            if (!btn) return;

            activeTrigger = btn;

            if (!isDesktop()) {
                e.preventDefault();
                openMobileSheet(btn);
                return;
            }

            e.preventDefault();

            if (!isOpen()) {
                pinned = true;
                suppressHoverUntilLeave = false;
                openDesktopDropdown(btn);
                return;
            }

            if (!pinned) {
                pinned = true;
                suppressHoverUntilLeave = false;
                openDesktopDropdown(btn);
            } else {
                pinned = false;
                closeAll();

                if (isHovering()) suppressHoverUntilLeave = true;
            }
        });

        document.addEventListener("mouseenter", (e) => {
            const btn = e.target.closest?.("[data-lang-trigger]");
            if (!btn || !isDesktop()) return;

            hoveringTrigger = true;
            activeTrigger = btn;

            if (pinned) {
                openDesktopDropdown(btn);
                return;
            }
            if (suppressHoverUntilLeave) return;

            openDesktopDropdown(btn);
        }, true);

        document.addEventListener("mouseleave", (e) => {
            const btn = e.target.closest?.("[data-lang-trigger]");
            if (!btn || !isDesktop()) return;

            hoveringTrigger = false;

            if (!isHovering()) suppressHoverUntilLeave = false;
            if (!pinned && !isHovering()) closeAll();
        }, true);

        panel.addEventListener("mouseenter", () => {
            if (!isDesktop()) return;
            hoveringPanel = true;
            if (!pinned && suppressHoverUntilLeave) return;
            if (activeTrigger) openDesktopDropdown(activeTrigger);
        });

        panel.addEventListener("mouseleave", () => {
            if (!isDesktop()) return;
            hoveringPanel = false;

            if (!isHovering()) suppressHoverUntilLeave = false;
            if (!pinned && !isHovering()) closeAll();
        });

        sheet.addEventListener("click", (e) => {
            if (!e.target.closest("[data-close]")) return;

            closeAll();
            pinned = false;

            if (isDesktop() && isHovering()) suppressHoverUntilLeave = true;
        });

        document.addEventListener("click", (e) => {
            if (!isDesktop()) return;
            if (!isOpen()) return;

            const insideSheet = sheet.contains(e.target);
            const onTrigger = activeTrigger && activeTrigger.contains(e.target);

            if (!insideSheet && !onTrigger) {
                closeAll();
                pinned = false;
                if (isHovering()) suppressHoverUntilLeave = true;
            }
        });

        window.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;
            if (!isOpen()) return;

            closeAll();
            pinned = false;
            if (isDesktop() && isHovering()) suppressHoverUntilLeave = true;
        });

        scroller.addEventListener("click", (e) => {
            const item = e.target.closest(".wheel__item");
            if (!item) return;

            if (isDesktop()) {
                selectLang(item.dataset.value);
                closeAll();
                pinned = false;
                suppressHoverUntilLeave = true;
                return;
            }

            scrollToValue(item.dataset.value, true);
        });

        doneBtn.addEventListener("click", () => {
            if (isDesktop()) return;
            localStorage.setItem("lang", currentValue);
            closeAll();
        });

        function selectLang(value) {
            currentValue = value;
            localStorage.setItem("lang", value);
        }

        function getItems() {
            return [...sheet.querySelectorAll(".wheel__item")];
        }

        function scrollToValue(value, smooth = true) {
            const target = getItems().find(i => i.dataset.value === value);
            if (!target) return;

            const top = target.offsetTop - (scroller.clientHeight / 2 - target.offsetHeight / 2);
            scroller.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
        }

        function updateVisual() {
            if (isDesktop()) return;

            const center = scroller.scrollTop + scroller.clientHeight / 2;
            let best = null;
            let bestDist = Infinity;

            getItems().forEach(el => {
                const elCenter = el.offsetTop + el.offsetHeight / 2;
                const d = Math.abs(elCenter - center);
                if (d < bestDist) {
                    bestDist = d;
                    best = el;
                }
            });

            if (best) currentValue = best.dataset.value;
        }

        let snapTimer = null;
        scroller.addEventListener("scroll", () => {
            if (isDesktop()) return;
            updateVisual();
            clearTimeout(snapTimer);
            snapTimer = setTimeout(() => scrollToValue(currentValue, true), 120);
        });

        window.addEventListener("resize", () => {
            closeAll();
            pinned = false;
            hoveringTrigger = false;
            hoveringPanel = false;
            suppressHoverUntilLeave = false;
        });
    }

    onReady(() => {
    waitForElement('#langSheet', initLanguageSheet);
});
    /* =========================
       Side menu
    ========================= */
    onReady(() => {
        const BP_MOBILE_MAX = 767;
        const body = document.body;

        const isMobile = () => window.innerWidth <= BP_MOBILE_MAX;

        const setDesktopClosed = (closed) => {
            body.classList.toggle('sidebar-close', !!closed);
        };
        const isDesktopClosed = () => body.classList.contains('sidebar-close');

        const setMobileOpen = (open) => {
            body.classList.toggle('sidebar-open', !!open);
        };
        const isMobileOpen = () => body.classList.contains('sidebar-open');

        const withSidebarAnimation = (mutateClasses) => {
            body.classList.add('sidebar-animating');
            void body.offsetWidth;

            mutateClasses();

            const sidebar = document.querySelector('.sidebar--main');
            if (!sidebar) {
                body.classList.remove('sidebar-animating');
                return;
            }

            const cleanup = () => body.classList.remove('sidebar-animating');

            let done = false;
            const onEnd = (e) => {
                if (e.target !== sidebar) return;
                if (!['width', 'transform', 'max-width'].includes(e.propertyName)) return;
                if (done) return;

                done = true;
                sidebar.removeEventListener('transitionend', onEnd);
                cleanup();
            };

            sidebar.addEventListener('transitionend', onEnd);

            window.setTimeout(() => {
                if (done) return;
                done = true;
                sidebar.removeEventListener('transitionend', onEnd);
                cleanup();
            }, 320);
        };

        let lastMode = null;
        function applyDefaults(force = false) {
            const mode = isMobile() ? 'mobile' : 'desktop';
            if (!force && mode === lastMode) return;
            lastMode = mode;

            if (mode === 'mobile') {
                setDesktopClosed(false);
                setMobileOpen(false);
            } else {
                setMobileOpen(false);
                setDesktopClosed(false);
            }
        }

        document.addEventListener('click', (e) => {
            const btn = e.target.closest?.('[data-action="toggle-sidebar"]');
            if (!btn) return;

            e.preventDefault();

            withSidebarAnimation(() => {
                if (isMobile()) {
                    setMobileOpen(!isMobileOpen());
                } else {
                    setDesktopClosed(!isDesktopClosed());
                }
            });
        });

        document.querySelector('main')?.addEventListener('click', () => {
            if (isMobile() && isMobileOpen()) {
                withSidebarAnimation(() => setMobileOpen(false));
            }
        });

        applyDefaults(true);
        window.addEventListener('resize', () => applyDefaults(false));
    });

    /* =========================
       Note box
    ========================= */
    function initNoteBox(note) {
        if (!note || note.dataset.noteInit === 'true') return;
        note.dataset.noteInit = 'true';

        const BREAKPOINT = 1024;

        const overlay = document.querySelector(".overlay[data-action='close-all']");
        const openBtn = document.querySelector("[data-action='open-note']");
        const closeBtn = document.querySelector("[data-action='close-note']");

        if (!overlay || !openBtn) return;

        const isDesktop = () => window.innerWidth >= BREAKPOINT;
        const isOpen = () => note.classList.contains("is-open");

        const withNoteAnimation = (mutate) => {
            note.classList.add("note-animating");
            void note.offsetWidth;
            mutate();

            let done = false;
            const cleanup = () => note.classList.remove("note-animating");

            const onEnd = (e) => {
                if (e.target !== note) return;
                if (!["transform", "opacity"].includes(e.propertyName)) return;
                if (done) return;
                done = true;
                note.removeEventListener("transitionend", onEnd);
                cleanup();
            };

            note.addEventListener("transitionend", onEnd);

            window.setTimeout(() => {
                if (done) return;
                done = true;
                note.removeEventListener("transitionend", onEnd);
                cleanup();
            }, 320);
        };

        function openNote() {
            if (isDesktop()) return;
            if (isOpen()) return;

            withNoteAnimation(() => {
                note.classList.add("is-open");
                overlay.classList.add("is-show");
            });

            openBtn.setAttribute("aria-expanded", "true");
            overlay.setAttribute("aria-hidden", "false");
        }

        function closeAll() {
            if (!isOpen() && !overlay.classList.contains("is-show")) return;

            withNoteAnimation(() => {
                note.classList.remove("is-open");
                overlay.classList.remove("is-show");
            });

            openBtn.setAttribute("aria-expanded", "false");
            overlay.setAttribute("aria-hidden", "true");
        }

        openBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openNote();
        });

        closeBtn?.addEventListener("click", (e) => {
            e.preventDefault();
            closeAll();
        });

        overlay.addEventListener("click", closeAll);

        window.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;
            if (!isOpen()) return;
            closeAll();
        });

        window.addEventListener("resize", () => {
            if (isDesktop()) closeAll();
        });

        document.addEventListener("click", (e) => {
            const btn = e.target.closest?.('[data-action="close-all"]');
            if (!btn) return;
            closeAll();
        });
    }

    onReady(() => {
        waitForElement("[data-note]", initNoteBox);
    });

    /* =========================
       Fav button
    ========================= */
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-fav');
        if (!btn) return;

        e.preventDefault();

        const item = btn.closest('.vendor');
        if (!item) return;

        const isFav = item.dataset.fav === 'true';

        if (isFav) {
            item.removeAttribute('data-fav');
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        } else {
            item.dataset.fav = 'true';
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        }
    });

    /* =========================
       Product nav / toggle-app
    ========================= */
    function initProductNav(nav) {
        if (!nav || nav.dataset.prodInit === 'true') return;
        nav.dataset.prodInit = 'true';

        const body = document.body;
        const panel = nav.querySelector('.prod-nav');
        if (!panel) return;

        const ANIM_CLASS = 'nav-animating';
        const DURATION = 260;
        let scheduled = 0;
        let blockPanelUntil = 0;

        function setAnimating(on) {
            nav.classList.toggle(ANIM_CLASS, !!on);
        }

        function openNav() {
            nav.classList.add('active');
            body.classList.add('no-scroll');

            blockPanelUntil = performance.now() + 300;

            panel.style.pointerEvents = 'none';
            requestAnimationFrame(() => {
                panel.style.pointerEvents = '';
            });
        }

        function closeNav() {
            nav.classList.remove('active');
            body.classList.remove('no-scroll');

            setAnimating(true);
            window.setTimeout(() => setAnimating(false), DURATION + 40);
        }

        function toggleNav() {
            nav.classList.contains('active') ? closeNav() : openNav();
        }

        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action="toggle-app"]');
            if (!btn) return;

            e.preventDefault();
            e.stopPropagation();

            if (scheduled) cancelAnimationFrame(scheduled);
            scheduled = requestAnimationFrame(() => {
                scheduled = 0;
                toggleNav();
            });
        });

        nav.addEventListener('click', () => {
            if (nav.classList.contains('active')) closeNav();
        });

        panel.addEventListener(
            'click',
            (e) => {
                if (performance.now() < blockPanelUntil) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                e.stopPropagation();
            },
            true
        );

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('active')) closeNav();
        });
    }

    onReady(() => {
        waitForElement('.sidebar-nav.sidebar-nav--product', initProductNav);
    });

    /* =========================
       Search
    ========================= */
    onReady(() => {
        const BP_MOBILE_MAX = 1024;
        const isMobile = () => window.innerWidth <= BP_MOBILE_MAX;
        const rails = document.querySelectorAll('[data-vendor-rail]');

        if (!rails.length) return;

        const closeSearch = (rail) => {
            rail.classList.remove('is-search-open');
            const input = rail.querySelector('.vendor-search');
            if (input) input.blur();
        };

        const toggleSearch = (rail) => {
            rail.classList.toggle('is-search-open');
            if (rail.classList.contains('is-search-open')) {
                const input = rail.querySelector('.vendor-search');
                if (input) requestAnimationFrame(() => input.focus());
            } else {
                const input = rail.querySelector('.vendor-search');
                if (input) input.blur();
            }
        };

        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action="toggle-search"]');
            if (!btn) return;

            const rail = btn.closest('[data-vendor-rail]');
            if (!rail) return;

            if (!isMobile()) return;
            e.preventDefault();
            toggleSearch(rail);
        });

        document.addEventListener('click', (e) => {
            if (!isMobile()) return;

            rails.forEach((rail) => {
                if (!rail.classList.contains('is-search-open')) return;

                const searchBox = rail.querySelector('[data-search]');
                const clickedInside = searchBox && searchBox.contains(e.target);
                if (clickedInside) return;

                closeSearch(rail);
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            if (!isMobile()) return;

            rails.forEach((rail) => {
                if (rail.classList.contains('is-search-open')) closeSearch(rail);
            });
        });

        window.addEventListener('resize', () => {
            if (isMobile()) return;
            rails.forEach((rail) => closeSearch(rail));
        });
    });

    /* =========================
       Settings box
    ========================= */
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("#btn-settingsbox");
        if (!btn) return;

        const box = document.querySelector("#togglesettings");
        if (!box) return;

        const isOpen = box.classList.contains("open");
        box.classList.toggle("open", !isOpen);

        btn.classList.toggle("btn-setting__open", isOpen);
        btn.classList.toggle("btn-setting__close", !isOpen);
        btn.setAttribute("aria-expanded", String(!isOpen));
    });

    /* =========================
       Render images from data attrs
    ========================= */
    function renderDataImages(root = document) {
        root.querySelectorAll('.vendor-img').forEach(el => {
            const src = el.dataset.image;
            if (src && !el.dataset.renderedBg) {
                el.style.backgroundImage = `url("${src}")`;
                el.dataset.renderedBg = 'true';
            }
        });

        root.querySelectorAll('.vendor-bg').forEach(el => {
            const src = el.dataset.bg;
            if (src && !el.dataset.renderedBg) {
                el.style.backgroundImage = `url("${src}")`;
                el.dataset.renderedBg = 'true';
            }
        });

        root.querySelectorAll('.vendor-logo').forEach(el => {
            const src = el.dataset.logo;
            if (!src || el.dataset.renderedLogo === 'true') return;

            const img = document.createElement('img');
            img.src = src;
            img.alt = '';
            img.loading = 'lazy';

            el.appendChild(img);
            el.dataset.renderedLogo = 'true';
        });
    }

    onReady(() => {
        renderDataImages();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (!(node instanceof Element)) return;
                    renderDataImages(node);
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => observer.disconnect(), 5000);
    });

    /* =========================
      current page render
    ========================= */
    function markCurrentMainNavLink() {
        const mainNav = document.querySelector('nav[aria-label="main navigation"]');
        if (!mainNav) return false;

        const currentUrl = new URL(window.location.href);
        const currentPath = currentUrl.pathname.split('/').pop() || 'index.html';

        const links = mainNav.querySelectorAll('a[href]');
        let matched = false;

        links.forEach(link => {
            link.removeAttribute('aria-current');

            const rawHref = (link.getAttribute('href') || '').trim();
            if (!rawHref || rawHref === '#' || rawHref.startsWith('javascript:')) return;

            let linkUrl;
            try {
                linkUrl = new URL(rawHref, window.location.href);
            } catch {
                return;
            }

            const linkPath = linkUrl.pathname.split('/').pop() || 'index.html';

            if (!matched && linkPath === currentPath) {
                link.setAttribute('aria-current', 'page');
                matched = true;
            }
        });

        return matched;
    }

    onReady(() => {
        if (markCurrentMainNavLink()) return;

        const observer = new MutationObserver(() => {
            if (markCurrentMainNavLink()) {
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => observer.disconnect(), 5000);
    });
})();
