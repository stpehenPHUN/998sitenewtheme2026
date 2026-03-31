
    (() => {
        const BREAKPOINT = 1024;

        const sheet = document.querySelector(".appSheet");
        const panel = sheet.querySelector(".appSheet__panel");
        const scroller = sheet.querySelector(".wheel__scroller");
        const wheel = sheet.querySelector(".wheel");
        const doneBtn = sheet.querySelector("[data-lang-done]");

        const ITEM_H = 44; // mobile wheel 用
        let currentValue = localStorage.getItem("lang") || "en";

        let activeTrigger = null;

        // desktop dropdown 状态
        let pinned = false; // click toggle “锁定打开”
        let hoveringTrigger = false;
        let hoveringPanel = false;
        let suppressHoverUntilLeave = false;

        const isDesktop = () => window.innerWidth >= BREAKPOINT;
        const isOpen = () => sheet.classList.contains("isOpen");
        const isHovering = () => hoveringTrigger || hoveringPanel;

        /* =========================
           Open / Close
        ========================= */

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
            document.body.style.overflow = ""; // desktop 不锁滚动

            // 定位到按钮下方
            const r = triggerBtn.getBoundingClientRect();
            sheet.style.left = `${r.left + window.scrollX}px`;
            sheet.style.top = `${r.bottom + window.scrollY + 8}px`;

            // 简单防溢出（右侧）
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

        /* =========================
           Triggers: click + hover (desktop)
        ========================= */

        const triggers = document.querySelectorAll("[data-lang-trigger]");

        triggers.forEach(btn => {
            // click toggle
            btn.addEventListener("click", (e) => {
                activeTrigger = btn;

                if (!isDesktop()) {
                    // mobile：直接打开 sheet（你原逻辑）
                    openMobileSheet(btn);
                    return;
                }

                // desktop：click toggle（pin/unpin）
                if (!isOpen()) {
                    // 目前关着：打开并锁定
                    pinned = true;
                    suppressHoverUntilLeave = false;
                    openDesktopDropdown(btn);
                    return;
                }

                // 目前开着：
                if (!pinned) {
                    // 仅 hover 打开状态 → 点击 = pin（锁定打开）
                    pinned = true;
                    suppressHoverUntilLeave = false;
                    openDesktopDropdown(btn); // 重新定位（如果有多个按钮）
                } else {
                    // pinned 打开 → 点击 = 关闭并解除 pin
                    pinned = false;
                    closeAll();

                    // 如果此刻还在 hover 区域：抑制 hover，直到鼠标离开
                    if (isHovering()) suppressHoverUntilLeave = true;
                }
            });

            // hover open（desktop）
            btn.addEventListener("mouseenter", () => {
                if (!isDesktop()) return;
                hoveringTrigger = true;
                activeTrigger = btn;

                if (pinned) {
                    // 已锁定：只需要确保定位到当前按钮
                    openDesktopDropdown(btn);
                    return;
                }
                if (suppressHoverUntilLeave) return;

                openDesktopDropdown(btn);
            });

            btn.addEventListener("mouseleave", () => {
                if (!isDesktop()) return;
                hoveringTrigger = false;

                // 离开 hover 区域（trigger + panel 都不在）时重置 suppress
                if (!isHovering()) suppressHoverUntilLeave = false;

                // 非 pinned 时，hover 离开就关闭（但如果鼠标正进入 panel，会由 panel 的 enter 保持）
                if (!pinned && !isHovering()) closeAll();
            });
        });

        // panel hover：允许从 trigger 移到 dropdown 仍保持打开
        panel.addEventListener("mouseenter", () => {
            if (!isDesktop()) return;
            hoveringPanel = true;
            if (!pinned && suppressHoverUntilLeave) return; // 关闭后还没离开，不要复活
            if (activeTrigger) openDesktopDropdown(activeTrigger);
        });

        panel.addEventListener("mouseleave", () => {
            if (!isDesktop()) return;
            hoveringPanel = false;

            if (!isHovering()) suppressHoverUntilLeave = false;
            if (!pinned && !isHovering()) closeAll();
        });

        // 点击关闭（mobile 的 data-close）
        sheet.addEventListener("click", (e) => {
            if (!e.target.closest("[data-close]")) return;

            closeAll();
            pinned = false;

            // 如果桌面还在 hover 范围内，抑制 hover 直到离开
            if (isDesktop() && isHovering()) suppressHoverUntilLeave = true;
        });

        // 点击外部关闭（desktop）
        document.addEventListener("click", (e) => {
            if (!isDesktop()) return;
            if (!isOpen()) return;

            const insideSheet = sheet.contains(e.target);
            const onTrigger = activeTrigger && activeTrigger.contains(e.target);

            if (!insideSheet && !onTrigger) {
                closeAll();
                pinned = false;
                // 外部点击一般已经离开 hover，但保险：如果还 hover，就抑制
                if (isHovering()) suppressHoverUntilLeave = true;
            }
        });

        // Esc 关闭
        window.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;
            if (!isOpen()) return;

            closeAll();
            pinned = false;
            if (isDesktop() && isHovering()) suppressHoverUntilLeave = true;
        });

        /* =========================
           Select behavior
        ========================= */

        // Desktop：点击 item 直接选中并关闭
        // Mobile：点击 item 滚到中间
        scroller.addEventListener("click", (e) => {
            const item = e.target.closest(".wheel__item");
            if (!item) return;

            if (isDesktop()) {
                selectLang(item.dataset.value);
                closeAll();
                pinned = false;
                // 点击项之后一般鼠标还在 panel，上面会立刻 hover 复活，所以也抑制到离开
                suppressHoverUntilLeave = true;
                return;
            }

            scrollToValue(item.dataset.value, true);
        });

        // Mobile Done
        doneBtn.addEventListener("click", () => {
            if (isDesktop()) return;
            localStorage.setItem("lang", currentValue);
            closeAll();
        });

        function selectLang(value) {
            currentValue = value;
            localStorage.setItem("lang", value);
            // TODO: 在这里接你的 i18n 切换逻辑
        }

        /* =========================
           Mobile wheel snap (only mobile)
        ========================= */

        function getItems() { return [...sheet.querySelectorAll(".wheel__item")]; }

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
                if (d < bestDist) { bestDist = d; best = el; }

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

        /* =========================
           Resize: 形态切换时收起 + 重置状态
        ========================= */

        window.addEventListener("resize", () => {
            closeAll();
            pinned = false;
            hoveringTrigger = false;
            hoveringPanel = false;
            suppressHoverUntilLeave = false;
        });

    })();



    //side menu
    document.addEventListener('DOMContentLoaded', () => {
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

        // ===== 动画包装：加 sidebar-animating，等 transitionend 清掉 =====
        const withSidebarAnimation = (mutateClasses) => {
            body.classList.add('sidebar-animating');

            // 触发一次 reflow，确保 animating class 生效后再切状态（避免某些浏览器不动画）
            void body.offsetWidth;

            mutateClasses();

            const sidebar = document.querySelector('.sidebar--main'); // 你的 aside.sidebar.sidebar--main
            if (!sidebar) {
                body.classList.remove('sidebar-animating');
                return;
            }

            const cleanup = () => body.classList.remove('sidebar-animating');

            let done = false;
            const onEnd = (e) => {
                // 只接 sidebar 自己的宽度/transform 动画结束（你可按实际改 property）
                if (e.target !== sidebar) return;
                if (!['width', 'transform', 'max-width'].includes(e.propertyName)) return;

                if (done) return;
                done = true;
                sidebar.removeEventListener('transitionend', onEnd);
                cleanup();
            };

            sidebar.addEventListener('transitionend', onEnd);

            // 兜底：如果某次没触发 transitionend（比如没变化），也能自动清掉
            window.setTimeout(() => {
                if (done) return;
                done = true;
                sidebar.removeEventListener('transitionend', onEnd);
                cleanup();
            }, 320); // 跟你 CSS duration 对齐（例如 250ms~300ms）
        };

        /* ===== Breakpoint 切换时的默认状态 ===== */
        let lastMode = null;
        function applyDefaults(force = false) {
            const mode = isMobile() ? 'mobile' : 'desktop';
            if (!force && mode === lastMode) return;
            lastMode = mode;

            // 切 breakpoint 默认不需要动画的话，就不要包 withSidebarAnimation
            if (mode === 'mobile') {
                setDesktopClosed(false);
                setMobileOpen(false);
            } else {
                setMobileOpen(false);
                setDesktopClosed(false);
            }
        }

        /* ===== Click handling ===== */
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



    (() => {
        const BREAKPOINT = 1024;

        const note = document.querySelector("[data-note]");          // .noteBox
        const overlay = document.querySelector(".overlay[data-action='close-all']");
        const openBtn = document.querySelector("[data-action='open-note']");
        const closeBtn = document.querySelector("[data-action='close-note']"); // 可选

        if (!note || !overlay || !openBtn) return;

        const isDesktop = () => window.innerWidth >= BREAKPOINT;
        const isOpen = () => note.classList.contains("is-open");

        // ===== 动画包装（复用你 sidebar 的套路）=====
        const withNoteAnimation = (mutate) => {
            note.classList.add("note-animating");
            void note.offsetWidth; // reflow
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
            if (isDesktop()) return; // desktop 直接显示，不弹
            if (isOpen()) return;

            withNoteAnimation(() => {
                note.classList.add("is-open");
                overlay.classList.add("is-show");
            });

            openBtn.setAttribute("aria-expanded", "true");
            overlay.setAttribute("aria-hidden", "false");

            // 如果你不想锁 body，就删掉这行（你之前提过不想 overflow hidden）
            // document.body.classList.add("no-scroll");
        }

        function closeAll() {
            if (!isOpen() && !overlay.classList.contains("is-show")) return;

            withNoteAnimation(() => {
                note.classList.remove("is-open");
                overlay.classList.remove("is-show");
            });

            openBtn.setAttribute("aria-expanded", "false");
            overlay.setAttribute("aria-hidden", "true");
            // document.body.classList.remove("no-scroll");
        }

        // 打开
        openBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openNote();
        });

        // 关闭按钮（可选）
        closeBtn?.addEventListener("click", (e) => {
            e.preventDefault();
            closeAll();
        });

        // 点击 overlay 关闭（你已有 data-action close-all，就顺便统一在这里关）
        overlay.addEventListener("click", closeAll);

        // Esc 关闭（复用 appSheet 思路）
        window.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;
            if (!isOpen()) return;
            closeAll();
        });

        // resize：形态切换时收起（复用 appSheet 末尾那段 reset 思路）
        window.addEventListener("resize", () => {
            // 从 mobile -> desktop 时，必须收起 overlay/状态
            if (isDesktop()) closeAll();
        });

        // 如果你还有其它“close-all”入口（不仅 overlay），用事件委托也能一起吃掉：
        document.addEventListener("click", (e) => {
            const btn = e.target.closest?.('[data-action="close-all"]');
            if (!btn) return;
            // overlay 自己也会进来；重复 closeAll 没关系
            closeAll();
        });
    })();


    // fav button
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-fav');
        if (!btn) return;

        e.preventDefault();

        const item = btn.closest('.vendor');
        if (!item) return;

        const isFav = item.dataset.fav === 'true';

        if (isFav) {
            // 取消收藏
            item.removeAttribute('data-fav');
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        } else {
            // 加收藏
            item.dataset.fav = 'true';
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        }
    });


    const btn = document.querySelector('[data-action="toggle-app"]');
    const nav = document.querySelector('.sidebar-nav.sidebar-nav--product');
    const panel = nav?.querySelector('.prod-nav');
    const body = document.body;

    if (!btn || !nav || !panel) {
        console.warn('toggle-app / sidebar-nav--product / .prod-nav not found');
    }

    const ANIM_CLASS = 'nav-animating';
    const DURATION = 260; // 跟你的 CSS transition 对齐（200~300 都行）
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

    /* A：按钮点击时，下一帧才切换（避免同一次 click 命中新元素） */
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (scheduled) cancelAnimationFrame(scheduled);
        scheduled = requestAnimationFrame(() => {
            scheduled = 0;
            toggleNav();
        });
    });

    /* 点击遮罩关掉 */
    nav.addEventListener('click', () => {
        if (nav.classList.contains('active')) closeNav();
    });

    /* panel：不要冒泡关掉 + B：刚打开时吞掉第一次误点 */
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
        true // capture：更早拦截，保险
    );

    /* ESC 关闭 */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('active')) closeNav();
    });



    //search
    document.addEventListener('DOMContentLoaded', () => {
        const BP_MOBILE_MAX = 1024;

        const isMobile = () => window.innerWidth <= BP_MOBILE_MAX;

        const rails = document.querySelectorAll('[data-vendor-rail]');

        const openSearch = (rail) => {
            rail.classList.add('is-search-open');
            const input = rail.querySelector('.vendor-search');
            if (input) {
                // 等动画开始后再focus，体验更顺
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

        // 点按钮展开/收起（用事件委托，不用id）
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action="toggle-search"]');
            if (!btn) return;

            const rail = btn.closest('[data-vendor-rail]');
            if (!rail) return;

            if (!isMobile()) return;
            e.preventDefault();
            toggleSearch(rail);
        });

        // 点外面收起
        document.addEventListener('click', (e) => {
            if (!isMobile()) return;

            rails.forEach((rail) => {
                if (!rail.classList.contains('is-search-open')) return;

                const searchBox = rail.querySelector('[data-search]');
                const clickedInside = searchBox && searchBox.contains(e.target);
                if (clickedInside) return;

                // 如果你希望“input有字就不收起”，把下面这段打开：
                // const input = rail.querySelector('.vendor-search');
                // if (input && input.value.trim()) return;

                closeSearch(rail);
            });
        });

        // ESC 收起
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            if (!isMobile()) return;

            rails.forEach((rail) => {
                if (rail.classList.contains('is-search-open')) closeSearch(rail);
            });
        });

        // 从 mobile 切回 desktop：把状态清掉，避免卡住布局
        window.addEventListener('resize', () => {
            if (isMobile()) return;
            rails.forEach((rail) => closeSearch(rail));
        });
    });



    document.addEventListener("click", (e) => {
        const btn = e.target.closest("#btn-settingsbox");
        if (!btn) return;

        const box = document.querySelector("#togglesettings");
        if (!box) return;

        const isOpen = box.classList.contains("open");
        box.classList.toggle("open", !isOpen);

        btn.classList.toggle("btn-setting__open", isOpen);
        btn.classList.toggle("btn-setting__close", !isOpen);

        // 无障碍：告诉读屏当前状态
        btn.setAttribute("aria-expanded", String(!isOpen));
    });



    //render background image form data
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

