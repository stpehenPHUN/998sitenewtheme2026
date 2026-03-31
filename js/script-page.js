(() => {
    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn, { once: true });
        } else {
            fn();
        }
    }

    /* =========================
       Language sheet
    ========================= */
    onReady(() => {
        const BREAKPOINT = 1024;

        const sheet = document.querySelector(".appSheet");
        if (!sheet) return;

        const panel = sheet.querySelector(".appSheet__panel");
        const scroller = sheet.querySelector(".wheel__scroller");
        const wheel = sheet.querySelector(".wheel");
        const doneBtn = sheet.querySelector("[data-lang-done]");

        if (!panel || !scroller || !wheel || !doneBtn) return;

        const ITEM_H = 44;
        let currentValue = localStorage.getItem("lang") || "en";

        let activeTrigger = null;

        let pinned = false;
        let hoveringTrigger = false;
        let hoveringPanel = false;
        let suppressHoverUntilLeave = false;

        const isDesktop = () => window.innerWidth >= BREAKPOINT;
        const isOpen = () => sheet.classList.contains("isOpen");
        const isHovering = () => hoveringTrigger || hoveringPanel;

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

        const triggers = document.querySelectorAll("[data-lang-trigger]");

        triggers.forEach(btn => {
            btn.addEventListener("click", (e) => {
                activeTrigger = btn;

                if (!isDesktop()) {
                    openMobileSheet(btn);
                    return;
                }

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

            btn.addEventListener("mouseenter", () => {
                if (!isDesktop()) return;
                hoveringTrigger = true;
                activeTrigger = btn;

                if (pinned) {
                    openDesktopDropdown(btn);
                    return;
                }
                if (suppressHoverUntilLeave) return;

                openDesktopDropdown(btn);
            });

            btn.addEventListener("mouseleave", () => {
                if (!isDesktop()) return;
                hoveringTrigger = false;

                if (!isHovering()) suppressHoverUntilLeave = false;
                if (!pinned && !isHovering()) closeAll();
            });
        });

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
            let best = null, bestDist = Infinity;

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
    onReady(() => {
        const BREAKPOINT = 1024;

        const note = document.querySelector("[data-note]");
        const overlay = document.querySelector(".overlay[data-action='close-all']");
        const openBtn = document.querySelector("[data-action='open-note']");
        const closeBtn = document.querySelector("[data-action='close-note']");

        if (!note || !overlay || !openBtn) return;

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
    onReady(() => {
        const btn = document.querySelector('[data-action="toggle-app"]');
        const nav = document.querySelector('.sidebar-nav.sidebar-nav--product');
        const panel = nav?.querySelector('.prod-nav');
        const body = document.body;

        if (!btn || !nav || !panel) return;

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

        btn.addEventListener('click', (e) => {
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
    });

    /* =========================
       Search
    ========================= */
    onReady(() => {
        const BP_MOBILE_MAX = 1024;
        const isMobile = () => window.innerWidth <= BP_MOBILE_MAX;
        const rails = document.querySelectorAll('[data-vendor-rail]');

        if (!rails.length) return;

        const openSearch = (rail) => {
            rail.classList.add('is-search-open');
            const input = rail.querySelector('.vendor-search');
            if (input) {
                requestAnimationFrame(() => input.focus());
            }
        };

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
    onReady(() => {
        document.querySelectorAll('.vendor-img').forEach(el => {
            const src = el.dataset.image;
            if (src) {
                el.style.backgroundImage = `url("${src}")`;
            }
        });

        document.querySelectorAll('.vendor-bg').forEach(el => {
            const src = el.dataset.bg;
            if (src) {
                el.style.backgroundImage = `url("${src}")`;
            }
        });

        document.querySelectorAll('.vendor-logo').forEach(el => {
            const src = el.dataset.logo;
            if (!src) return;

            const img = document.createElement('img');
            img.src = src;
            img.alt = '';
            img.loading = 'lazy';

            el.appendChild(img);
        });
    });

    /* =========================
      current page render
    ========================= */
    onReady(() => {
        const mainNav = document.querySelector('nav[aria-label="main navigation"]');
        if (!mainNav) return;

        const currentUrl = new URL(window.location.href);
        const currentPath = currentUrl.pathname.split('/').pop() || 'index.html';

        const links = mainNav.querySelectorAll('a[href]');

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

            if (linkPath === currentPath) {
                link.setAttribute('aria-current', 'page');
            }
        });
    });
})();
