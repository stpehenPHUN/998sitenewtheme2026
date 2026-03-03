document.addEventListener("DOMContentLoaded", () => {
    /* =========================================================
       0) CONFIG
    ========================================================= */
    const CURCONVERT = {
        USDT: { myr: "3.89", sgd: "1.26" },
        BTC: { myr: "260957.44", sgd: "84690.81" }
    }
    // Leaf method -> group
    const METHOD_META = {
        bank: { label: "Bank-in Transfer", group: "bank" },
        crypto: { label: "Crypto", group: "crypto" },
        online: { label: "Online Transfer", group: "gateway" },
        qr: { label: "QR Payment", group: "gateway" },
        ewallet: { label: "E-wallet", group: "gateway" },
    };

    // Group labels (for playcard method pills)
    const GROUP_META = {
        bank: { label: "Bank-in Transfer" },
        gateway: { label: "Payment Gateway" },
        crypto: { label: "Crypto" },
    };

    const CAT_DICT = [
        { key: "sport", label: "Soccer", src: "image/menu-sports.png" },
        { key: "casino", label: "Live Casino", src: "image/menu-casino.png" },
        { key: "lottery", label: "Lottery", src: "image/menu-lottery.png" },
        { key: "slots", label: "Slots", src: "image/menu-slots.png" },
        { key: "p2p", label: "P2P", src: "image/menu-gaming2.png" },
        { key: "financial", label: "Financial", src: "image/menu-deposit.png" },
    ];

    /**
     * MethodType (tab) -> Channel list.
     * Each channel may optionally have `payFrom` list.
     * NOTE: This is demo data. Backend can replace it later.
     */
    const PAYFROM_CATALOG = {
        // ===== BANK (default MYR) =====
        affinbank: { id: "affinbank", name: "Affin Bank", icon: "affinbank.png", maintenance: true, currency: "MYR", minDeposit: 100, maxDeposit: 1000 },
        ambank: { id: "ambank", name: "AmBank", icon: "ambank.png", maintenance: false, currency: "MYR", minDeposit: 100, maxDeposit: 20000 },
        bsnbank: { id: "bsnbank", name: "Bank Simpanan Nasional", icon: "bsnbank.png", maintenance: false, currency: "MYR", minDeposit: 30, maxDeposit: 10000 },
        hlb: { id: "hlb", name: "Hong Leong Bank", icon: "hlb.png", maintenance: false, currency: "MYR", minDeposit: 40, maxDeposit: 30000 },
        maybank: { id: "maybank", name: "Maybank", icon: "maybank.png", maintenance: false, currency: "MYR", minDeposit: 20, maxDeposit: 50000 },
        pbb: { id: "pbb", name: "Public Bank Berhad", icon: "pbb.png", maintenance: false, currency: "MYR", minDeposit: 60, maxDeposit: 1000 },
        rhb: { id: "rhb", name: "RHB Bank", icon: "rhb.png", maintenance: false, currency: "MYR", minDeposit: 120, maxDeposit: 10000 },
        bim: { id: "islan", name: "Bank Islam Malaysia", icon: "islam.png", maintenance: false, currency: "MYR", minDeposit: 80, maxDeposit: 10000 },
        cimb: { id: "cimb", name: "CIMB Bank", icon: "cimb.png", maintenance: false, currency: "MYR", minDeposit: 20, maxDeposit: 10000 },
        bkr: { id: "bkr", name: "Bank Kerjasama Rakyat", icon: "bkr.png", maintenance: false, currency: "MYR", minDeposit: 20, maxDeposit: 10000 },
        alliance: { id: "alliance", name: "Alliance Bank", icon: "alliance.png", maintenance: false, currency: "MYR", minDeposit: 20, maxDeposit: 10000 },
        ocbc: { id: "ocbc", name: "OCBC Bank", icon: "ocbc.png", maintenance: false, currency: "MYR", minDeposit: 20, maxDeposit: 10000 },
        fpx: { id: "fpx", name: "FPX", icon: "fpx.png", maintenance: false, currency: "MYR", minDeposit: 20, maxDeposit: 10000 },

        // ===== EWALLET (default MYR) =====
        duitnow: { id: "diutnow", name: "DiutNow eWallet", icon: "duitnow.png", maintenance: false, currency: "MYR", minDeposit: 20, maxDeposit: 10000 },
        fpxewallet: { id: "fpxewallet", name: "FPX eWallet", icon: "fpx.png", maintenance: false, currency: "MYR", minDeposit: 20, maxDeposit: 10000 },
        boost: { id: "boost", name: "Boost eWallet", icon: "boost.png", maintenance: false, currency: "MYR", minDeposit: 20, maxDeposit: 10000 },
        grabpay: { id: "grabpay", name: "GrabPay Wallet", icon: "grabpay.png", maintenance: false, currency: "MYR", minDeposit: 20, maxDeposit: 10000 },
        tng: { id: "tng", name: "Touch N Go eWallet", icon: "tng.png", maintenance: false, currency: "MYR", minDeposit: 20, maxDeposit: 10000 },
        shopee: { id: "shopee", name: "ShopeePay eWallet", icon: "shopee.png", maintenance: false, currency: "MYR", minDeposit: 20, maxDeposit: 10000 },

        // ===== CRYPTO (default USDT) =====
        erc20: { id: "erc20", name: "ERC20-USDT", icon: "erc20.png", maintenance: false, currency: "USDT", minDeposit: 10, maxDeposit: 10000 },
        trc20: { id: "trc20", name: "TRC20-USDT", icon: "trc20.png", maintenance: false, currency: "USDT", minDeposit: 10, maxDeposit: null },
    };
    const METHOD_CHANNELS = {
        online: [
            {
                id: "vaderpayc1", name: "VADERPAY(C1)", icon: "vader2.png", maintenance: false,
                requiresPayFrom: true,
                payFrom: [
                    PAYFROM_CATALOG.affinbank,
                    PAYFROM_CATALOG.ambank,
                    PAYFROM_CATALOG.bsnbank,
                    PAYFROM_CATALOG.hlb,
                    PAYFROM_CATALOG.maybank,
                    PAYFROM_CATALOG.pbb,
                    PAYFROM_CATALOG.rhb,
                    PAYFROM_CATALOG.bim,
                    PAYFROM_CATALOG.cimb,
                    PAYFROM_CATALOG.bkr,
                    PAYFROM_CATALOG.alliance,
                    PAYFROM_CATALOG.ocbc,
                    PAYFROM_CATALOG.fpx
                ],
            },
            {
                id: "bigpayz", name: "Bigpayz", icon: "bigpay.png", maintenance: false,
                requiresPayFrom: true,
                payFrom: [
                    PAYFROM_CATALOG.affinbank,
                    PAYFROM_CATALOG.ambank,
                    PAYFROM_CATALOG.bsnbank,
                    PAYFROM_CATALOG.hlb,
                    PAYFROM_CATALOG.maybank
                ],
            },
            {
                id: "surepay", name: "SurePay", icon: "surepay.png",
                minDeposit: 20, maxDeposit: 5000, maintenance: false, requiresPayFrom: true, payFrom: [PAYFROM_CATALOG.maybank]
            },
            {
                id: "eeziepay", name: "EEZIEPAY", icon: "eeziepay.png", maintenance: false, requiresPayFrom: true,
                payFrom: [
                    PAYFROM_CATALOG.ambank,
                    PAYFROM_CATALOG.bim,
                    PAYFROM_CATALOG.cimb,
                    PAYFROM_CATALOG.hlb,
                    PAYFROM_CATALOG.maybank,
                    PAYFROM_CATALOG.pbb,
                    PAYFROM_CATALOG.rhb,
                    PAYFROM_CATALOG.ocbc,
                    PAYFROM_CATALOG.alliance,
                    PAYFROM_CATALOG.bsnbank
                ],
            },
            {
                id: "skl99", name: "SKL99", icon: "skl99.png", maintenance: false, requiresPayFrom: true,
                payFrom: [
                    PAYFROM_CATALOG.maybank,
                    PAYFROM_CATALOG.bim,
                    PAYFROM_CATALOG.cimb
                ],
            },
            { id: "test1", name: "Testing1", icon: "surepay.png", minDeposit: 20, maxDeposit: 100000, maintenance: true },
            { id: "test2", name: "Testing2", icon: "surepay.png", minDeposit: 20, maintenance: false },
            { id: "test3", name: "Testing3", icon: "surepay.png", minDeposit: 20, maxDeposit: 100000, maintenance: false },
            { id: "test4", name: "Testing4", icon: "surepay.png", minDeposit: 20, maintenance: false },
            { id: "test5", name: "Testing5", icon: "surepay.png", minDeposit: 20, maxDeposit: 100000, maintenance: true },
            { id: "test6", name: "Testing6", icon: "surepay.png", minDeposit: 20, maintenance: false },

        ],
        qr: [
            {
                id: "vaderpayc1", name: "VADERPAY(C1)", icon: "vaderpay.png", maintenance: false, requiresPayFrom: true,
                payFrom: [
                    PAYFROM_CATALOG.duitnow
                ],
            },
            { id: "vaderpayc2", name: "VADERPAY(C2)", icon: "vaderpay.png", minDeposit: 20, maxDeposit: 100000, maintenance: false, },
            { id: "cas9", name: "CAS9", icon: "cas9.png", minDeposit: 30, maxDeposit: 5000, maintenance: false, },
            { id: "skl99", name: "SKL99", icon: "skl99.png", minDeposit: 40, maxDeposit: 500000, maintenance: false, },
        ],
        bank: [
            {
                id: "bankin",
                name: "Bank-in Transfer",
                icon: "maybank.png", maintenance: false,
                requiresPayFrom: true,
                payFrom: [
                    PAYFROM_CATALOG.ambank,
                    PAYFROM_CATALOG.affinbank,
                    PAYFROM_CATALOG.bsnbank,
                    PAYFROM_CATALOG.hlb,
                    PAYFROM_CATALOG.maybank,
                    PAYFROM_CATALOG.pbb,
                    PAYFROM_CATALOG.rhb,
                    PAYFROM_CATALOG.bim,
                    PAYFROM_CATALOG.cimb,
                    PAYFROM_CATALOG.bkr,
                    PAYFROM_CATALOG.alliance,
                    PAYFROM_CATALOG.ocbc,
                    PAYFROM_CATALOG.fpx
                ],
            },
        ],
        ewallet: [
            {
                id: "vaderpayc2",
                name: "Vaderpay (C2)",
                icon: "vaderpay.png",
                requiresPayFrom: true,
                payFrom: [
                    PAYFROM_CATALOG.fpxewallet,
                    PAYFROM_CATALOG.duitnow
                ],
            },
            { id: "a9wallet", name: "A9Wallet", icon: "a9wallet.png", minDeposit: 40, maxDeposit: 500000, },
            {
                id: "payessence", name: "Pay Essence", icon: "bigpay.png", requiresPayFrom: true, maintenance: false,
                payFrom: [
                    PAYFROM_CATALOG.tng,
                    PAYFROM_CATALOG.grabpay,
                    PAYFROM_CATALOG.shopee,
                    PAYFROM_CATALOG.boost,
                    PAYFROM_CATALOG.duitnow
                ],
            },
            {
                id: "payjom", name: "Payjom", icon: "bigpay.png", requiresPayFrom: true, maintenance: false,
                payFrom: [
                    PAYFROM_CATALOG.tng,
                    PAYFROM_CATALOG.grabpay,
                    PAYFROM_CATALOG.boost,
                    PAYFROM_CATALOG.duitnow
                ],
            },
            { id: "bigpayz", name: "Bigpayz", icon: "bigpay.png", minDeposit: 40, maxDeposit: 500000, },
        ],
        crypto: [
            {
                id: "vaderpayc2",
                name: "Vaderpay (C2)",
                icon: "vaderpay.png", convert: true,
                requiresPayFrom: true, maintenance: true,
                payFrom: [
                    PAYFROM_CATALOG.erc20,
                    PAYFROM_CATALOG.trc20
                ],
            },
            {
                id: "cas9", name: "CAS9", icon: "cas9.png", convert: true, requiresPayFrom: true, maintenance: false,
                payFrom: [
                    PAYFROM_CATALOG.erc20,
                    PAYFROM_CATALOG.trc20
                ],
            },
            { id: "bitcoin", name: "Bitcoin", icon: "bitcoin.png", minDeposit: 1, currency: "BTC", convert: true, maintenance: false, },
            { id: "ethereum", name: "Ethereum", icon: "ethereum.png", minDeposit: 500, maxDeposit: 100000, currency: "USDT", convert: true, maintenance: false, },
            { id: "usdterc20", name: "USDT (ERC20)", icon: "erc20.png", minDeposit: 90, maxDeposit: 10000, currency: "USDT", convert: true, maintenance: false, },
        ],
    };

    /* =========================================================
       1) BADGE
    ========================================================= */

    const BADGE_DICT = { hot: "HOT", new: "NEW", promo: "PROMO", vip: "VIP" };

    function ensureBadge(card) {
        if (!card) return;
        const key = (card.getAttribute("data-badge") || "").trim().toLowerCase();
        if (!key) return;

        const media = card.querySelector(".playcard__media");
        if (!media) return;
        if (media.querySelector("[data-badge-el]")) return;

        const text = BADGE_DICT[key] || key.toUpperCase();
        const el = document.createElement("span");
        el.setAttribute("data-badge-el", "");
        el.className = "playcard__badge";
        el.dataset.badge = key;
        el.textContent = text;
        media.appendChild(el);
    }

    function initBadges(scope = document) {
        scope.querySelectorAll(".playcard[data-badge]").forEach(ensureBadge);
    }

    /* =========================================================
       2) HELPERS
    ========================================================= */

    const RAIL_STATE = new WeakMap();
    const RAIL_RESIZE_OBS = new WeakMap();

    function parseMulti(str) {
        return (str || "")
            .toLowerCase()
            .split(/[\s,]+/g)
            .map((s) => s.trim())
            .filter(Boolean);
    }

    function fileForIcon(icon) {
        const s = String(icon || "").trim();
        if (!s) return "";
        // allow "maybank.png" OR "maybank"
        return s.includes(".") ? s : `${s}.png`;
    }

    function initTooltipPortal() {
        if (document.body.dataset.ttipPortalBound === "1") return;
        document.body.dataset.ttipPortalBound = "1";

        let bubble = null;
        let activeTarget = null;

        function ensureBubble() {
            if (bubble) return bubble;
            bubble = document.createElement("span");
            bubble.className = "ttip__bubble ttipPortal";
            bubble.setAttribute("role", "tooltip");
            bubble.style.opacity = "0";
            bubble.style.visibility = "hidden";
            bubble.style.pointerEvents = "none";
            document.body.appendChild(bubble);
            return bubble;
        }

        function clamp(n, min, max) {
            return Math.max(min, Math.min(max, n));
        }

        function positionBubble(target) {
            const b = ensureBubble();
            const rect = target.getBoundingClientRect();
            const pos = (target.dataset.ttipPos || "top").toLowerCase();
            b.dataset.pos = pos;

            // set content
            b.textContent = target.dataset.ttip || "";

            // measure after text update
            b.style.left = "0px";
            b.style.top = "0px";
            b.style.opacity = "0";
            b.style.visibility = "hidden";

            // force layout
            const bw = b.offsetWidth;
            const bh = b.offsetHeight;

            const vw = window.innerWidth;
            const vh = window.innerHeight;

            let left = rect.left + rect.width / 2 - bw / 2;
            let top = rect.top - bh - 10;

            if (pos === "right") {
                left = rect.right + 10;
                top = rect.top + rect.height / 2 - bh / 2;
            }

            left = clamp(left, 8, vw - bw - 8);
            top = clamp(top, 8, vh - bh - 8);

            b.style.left = `${left}px`;
            b.style.top = `${top}px`;

            b.style.opacity = "1";
            b.style.visibility = "visible";
            b.style.transform = "translate3d(0, 0, 0)";
        }// --- Mobile / touch: tap to toggle tooltip ---
        const isTouchUI = () => window.matchMedia("(hover: none)").matches;

        document.addEventListener(
            "pointerdown",
            (e) => {
                if (!isTouchUI()) return;

                const t = e.target.closest("[data-ttip]");
                if (!t) {
                    hide(); // tap outside => hide
                    return;
                }

                // tap same target => toggle
                if (activeTarget === t) {
                    hide();
                    return;
                }

                show(t);

                // auto-hide after 1.5s (optional but recommended on mobile)
                clearTimeout(window.__ttipTO);
                window.__ttipTO = setTimeout(() => hide(), 1500);
            },
            true // capture: 即使你后面 stopPropagation，也能先抓到
        );

        function show(target) {
            if (!target?.dataset?.ttip) return;
            activeTarget = target;
            positionBubble(target);
        }

        function hide() {
            activeTarget = null;
            if (!bubble) return;
            bubble.style.opacity = "0";
            bubble.style.visibility = "hidden";
        }

        // hover + keyboard focus
        document.addEventListener("pointerover", (e) => {
            if (isTouchUI()) return;
            const t = e.target.closest("[data-ttip]");
            if (!t) return;
            show(t);
        });

        document.addEventListener("pointerout", (e) => {
            if (isTouchUI()) return;
            const t = e.target.closest("[data-ttip]");
            if (!t) return;
            hide();
        });

        document.addEventListener("focusin", (e) => {
            const t = e.target.closest("[data-ttip]");
            if (!t) return;
            show(t);
        });

        document.addEventListener("focusout", (e) => {
            const t = e.target.closest("[data-ttip]");
            if (!t) return;
            hide();
        });

        // reposition on scroll/resize (tabs 会横向滚动)
        window.addEventListener("scroll", () => {
            if (activeTarget) positionBubble(activeTarget);
        }, true);

        window.addEventListener("resize", () => {
            if (activeTarget) positionBubble(activeTarget);
        });

        // if user clicks anywhere, hide (optional)
        document.addEventListener("click", () => hide(), true);
    }

    /* =========================================================
       3) HYDRATE PLAYCARD
    ========================================================= */

    function hydratePlaycardBody(body) {
        if (!body || body.dataset.hydrated === "1") return;
        body.dataset.hydrated = "1";

        // media
        const mediaMount = body.querySelector("[data-media-mount]");
        const imageSrc = body.getAttribute("data-image");
        if (mediaMount && imageSrc) {
            mediaMount.innerHTML = `<img src="${imageSrc}" alt="" loading="lazy">`;
        }

        // title
        const titleMount = body.querySelector("[data-title-mount]");
        const titleText = body.getAttribute("data-title");
        if (titleMount && titleText) titleMount.textContent = titleText;

        // stats (bonus / rollover / max bonus)
        const statsMount = body.querySelector("[data-stats-mount]");
        if (statsMount) {
            statsMount.innerHTML = "";

            const addStat = (label, value) => {
                const s = String(value ?? "").trim();
                if (!s) return;

                const el = document.createElement("div");
                el.className = "stat";
                el.innerHTML = `
          <div class="stat__k">${label}</div>
          <div class="stat__v">${s}</div>
        `;
                statsMount.appendChild(el);
            };

            const bonusPct = body.getAttribute("data-bonus-pct");
            if (bonusPct && bonusPct.trim() !== "") addStat("Bonus", `${bonusPct}%`);

            const rollover = body.getAttribute("data-rollover");
            const rolloverUnit = body.getAttribute("data-rollover-unit") || "";
            if (rollover && rollover.trim() !== "") addStat("Rollover", `${rollover}${rolloverUnit}`);

            const maxAmt = body.getAttribute("data-maxbonus-amt");
            const maxCur = (body.getAttribute("data-maxbonus-cur") || "").trim();
            if (maxAmt && maxAmt.trim() !== "") addStat("Max Bonus", maxCur ? `${maxAmt} ${maxCur}` : `${maxAmt}`);

            // data-minbonus-* intentionally not rendered
        }

        // methods pills (bank / gateway / crypto)
        const methodsMount = body.querySelector("[data-methods-mount]");
        const leafKeys = parseMulti(body.getAttribute("data-methods"));

        if (methodsMount) {
            methodsMount.innerHTML = "";

            const groups = new Map(); // group -> { count, leaves[] }
            leafKeys.forEach((k) => {
                const meta = METHOD_META[k];
                if (!meta) return;

                if (!groups.has(meta.group)) groups.set(meta.group, { count: 0, leaves: [] });
                const g = groups.get(meta.group);
                g.count += 1;
                g.leaves.push(k);
            });

            const order = ["bank", "gateway", "crypto"];
            order.forEach((group) => {
                const g = groups.get(group);
                if (!g) return;

                let label = GROUP_META[group]?.label || group;
                let icoKey = group;

                // gateway single leaf => use leaf label + leaf icon
                if (group === "gateway" && g.count === 1) {
                    const onlyLeaf = g.leaves[0];
                    label = METHOD_META[onlyLeaf]?.label || label;
                    icoKey = onlyLeaf;
                }

                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "p--methodBtn";
                btn.dataset.methodGroup = group;
                btn.innerHTML = `
          <span class="p--methodBtn__ico" aria-hidden="true" data-ico="${icoKey}"></span>
          <span class="p--methodBtn__txt">${label}</span>
        `;
                methodsMount.appendChild(btn);
            });
        }

        // cats
        const catsMount = body.querySelector("[data-cats-mount]");
        const catKeys = parseMulti(body.getAttribute("data-cats"));
        if (catsMount) {
            catsMount.style.display = "";
            catsMount.innerHTML = "";

            if (!catKeys.length) {
                catsMount.style.display = "none";
            } else {
                catKeys.forEach((key) => {
                    const def = CAT_DICT.find((c) => c.key === key);
                    if (!def) return;

                    const btn = document.createElement("button");
                    btn.type = "button";
                    btn.className = "catBtn is-active";
                    btn.dataset.cat = key;

                    const ico = document.createElement("span");
                    ico.className = "catBtn__ico" + (def.src ? "" : " is-placeholder");

                    const img = document.createElement("img");
                    img.alt = def.label;
                    img.loading = "lazy";
                    img.src = def.src || "";
                    ico.appendChild(img);

                    const txt = document.createElement("span");
                    txt.className = "catBtn__txt";
                    txt.textContent = def.label;

                    btn.appendChild(ico);
                    btn.appendChild(txt);
                    catsMount.appendChild(btn);
                });
            }
        }
        // methods pills mount
    }

    function hydrateRail(railEl) {
        railEl.querySelectorAll(".playcard__body").forEach(hydratePlaycardBody);
    }

    function getRailState(railEl) {
        let state = RAIL_STATE.get(railEl);
        if (state) return state;

        const rowsWrap = railEl.querySelector(".rail__rows") || railEl;
        const cards = Array.from(railEl.querySelectorAll(".playcard"));
        state = { rowsWrap, cards, rows: [] };
        RAIL_STATE.set(railEl, state);
        return state;
    }

    function ensureRows(railEl, wantedOverride) {
        const state = getRailState(railEl);
        const wanted = Math.max(1, Number(wantedOverride ?? railEl.getAttribute("data-rows") ?? 2));

        let rows = Array.from(state.rowsWrap.querySelectorAll(".rail__row"));

        if (rows.length !== wanted) {
            state.rowsWrap.innerHTML = "";
            rows = [];
            for (let i = 0; i < wanted; i++) {
                const row = document.createElement("div");
                row.className = "rail__row";
                row.dataset.row = String(i);
                row.setAttribute("data-scroll-x", "");
                state.rowsWrap.appendChild(row);
                rows.push(row);
            }
        }

        state.rows = rows;
        return rows;
    }

    function getRowLimit(railEl) {
        const w = railEl.getBoundingClientRect().width || window.innerWidth;
        const cs = getComputedStyle(railEl);
        const cardW = parseFloat(cs.getPropertyValue("--card-w")) || 300;
        const gap = parseFloat(cs.getPropertyValue("--card-gap")) || 0;
        const safe = 8;

        const unit = Math.max(1, cardW + gap);
        const limit = Math.ceil((w - safe) / unit);
        return Math.max(3, limit);
    }

    function ensureRailSpacer(row, on) {
        let sp = row.querySelector("[data-rail-spacer]");
        if (!on) {
            if (sp) sp.remove();
            return;
        }
        if (!sp) {
            sp = document.createElement("div");
            sp.setAttribute("data-rail-spacer", "");
            sp.style.flex = "0 0 calc(var(--card-w) + var(--card-gap))";
            sp.style.width = "calc(var(--card-w) + var(--card-gap))";
            sp.style.pointerEvents = "none";
            sp.style.opacity = "0";
            row.appendChild(sp);
        }
    }

    function rebuildRail(railEl, filterKey = "all", mode = "init") {
        const state = getRailState(railEl);
        const key = (filterKey || "all").toLowerCase();

        const visible = [];
        state.cards.forEach((card) => {
            const body = card.querySelector(".playcard__body");
            const cats = parseMulti(body?.getAttribute("data-cats"));
            const show = key === "all" || cats.includes(key);
            if (show) visible.push(card);
        });

        const baseRows = Math.max(1, Number(railEl.getAttribute("data-rows") || 2));

        if (mode !== "filter") {
            const rows = ensureRows(railEl, baseRows);
            rows.forEach((r) => (r.innerHTML = ""));

            const total = visible.length;
            const perRow = Math.ceil(total / rows.length);

            visible.forEach((card, i) => {
                const rowIndex = Math.floor(i / perRow);
                (rows[rowIndex] || rows[rows.length - 1]).appendChild(card);
            });

            rows.forEach((r) => ensureRailSpacer(r, false));

            hydrateRail(railEl);
            initBadges(railEl);
            bindRailWheel(railEl);
            railEl.querySelectorAll("[data-scroll-x]").forEach(el => {
                enableHorizontalWheelScroll(el);
                enableDragScroll(el);
            });
            return;
        }

        const limit = getRowLimit(railEl);
        const extra = Math.max(0, Number(railEl.getAttribute("data-overflow") || 0));
        const cap = limit + extra;

        if (visible.length <= cap) {
            const rows = ensureRows(railEl, 1);
            rows[0].innerHTML = "";
            visible.forEach((card) => rows[0].appendChild(card));
            ensureRailSpacer(rows[0], visible.length <= limit - 2);
        } else {
            const rows = ensureRows(railEl, 2);
            rows.forEach((r) => (r.innerHTML = ""));
            visible.forEach((card, i) => (i < cap ? rows[0] : rows[1]).appendChild(card));

            if (rows[1].children.length > rows[0].children.length) {
                rows.forEach((r) => (r.innerHTML = ""));
                visible.forEach((card, i) => rows[i % 2].appendChild(card));
            }

            ensureRailSpacer(rows[0], false);
            ensureRailSpacer(rows[1], false);
        }

        hydrateRail(railEl);
        initBadges(railEl);
        bindRailWheel(railEl);
    }

    function bindRailWheel(scope = document) {
        scope.querySelectorAll(".rail__row").forEach((row) => {
            if (row.dataset.wheelBound === "1") return;
            row.dataset.wheelBound = "1";

            row.addEventListener(
                "wheel",
                (e) => {
                    const isMostlyHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
                    if (isMostlyHorizontal) return;

                    const max = row.scrollWidth - row.clientWidth;
                    if (max <= 0) return;

                    const goingRight = e.deltaY > 0;
                    const atStart = row.scrollLeft <= 0;
                    const atEnd = row.scrollLeft >= max - 1;

                    if ((goingRight && !atEnd) || (!goingRight && !atStart)) {
                        e.preventDefault();
                        row.scrollLeft += e.deltaY * 2;
                    }
                },
                { passive: false }
            );
        });
    }
    function enableHorizontalWheelScroll(container) {
        if (!container) return;

        container.addEventListener("wheel", (e) => {
            if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

            if (container.scrollWidth <= container.clientWidth) return;

            e.preventDefault();
            container.scrollLeft += e.deltaY;
        }, { passive: false });
    }
    function enableDragScroll(container) {
        if (!container) return;

        let isDown = false;
        let isDragging = false;
        let startX = 0;
        let scrollLeft = 0;

        const DRAG_THRESHOLD = 5; // Treat as drag only after 5px movement

        container.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return;

            isDown = true;
            isDragging = false;

            startX = e.pageX;
            scrollLeft = container.scrollLeft;

            container.classList.add("is-dragging");
        });

        document.addEventListener("mouseup", () => {
            isDown = false;
            container.classList.remove("is-dragging");
        });

        container.addEventListener("mouseleave", () => {
            isDown = false;
            container.classList.remove("is-dragging");
        });

        container.addEventListener("mousemove", (e) => {
            if (!isDown) return;

            const dx = e.pageX - startX;

            if (Math.abs(dx) > DRAG_THRESHOLD) {
                isDragging = true;
            }

            if (!isDragging) return;

            e.preventDefault();
            container.scrollLeft = scrollLeft - dx;
        });

        // Prevent a click after dragging
        container.addEventListener("click", (e) => {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    }

    function bindFilter() {
        const filterBar = document.querySelector(".pkgFilters");
        if (!filterBar || filterBar.dataset.bound === "1") return;
        filterBar.dataset.bound = "1";

        filterBar.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-filter]");
            if (!btn) return;

            const key = (btn.dataset.filter || "all").toLowerCase();

            filterBar.querySelectorAll("[data-filter]").forEach((b) => {
                b.classList.toggle("is-active", b === btn);
                b.setAttribute("aria-selected", b === btn ? "true" : "false");
            });

            document.querySelectorAll("[data-rail]").forEach((rail) => {
                rail.setAttribute("data-active-filter", key);
                rebuildRail(rail, key, "filter");
            });
        });
    }

    function watchRailResize(railEl) {
        if (RAIL_RESIZE_OBS.has(railEl)) return;

        let _raf = 0;
        const ro = new ResizeObserver(() => {
            cancelAnimationFrame(_raf);
            _raf = requestAnimationFrame(() => {
                const active = railEl.getAttribute("data-active-filter") || "all";
                const mode = active === "all" ? "init" : "filter";
                rebuildRail(railEl, active, mode);
            });
        });

        ro.observe(railEl);
        RAIL_RESIZE_OBS.set(railEl, ro);
    }

    /* =========================================================
       4) PAYMENT UI (tabs -> channel -> payFrom -> summary)
    ========================================================= */

    function initPaymentUI() {
        const tablist = document.querySelector(".topTabs");
        const tabs = tablist ? Array.from(tablist.querySelectorAll(".tab[data-method]")) : [];
        const playcards = Array.from(document.querySelectorAll(".playcard__body"));

        const sumMethodEl = document.getElementById("sumMethod");
        const sumFromEl = document.getElementById("sumFrom");

        const methodGrid = document.querySelector(".methodGrid");
        const payFromGrid = document.querySelector(".payFromGrid");
        const payFromSection = document.querySelector(".payFromSection");

        if (!tablist || tabs.length === 0 || playcards.length === 0) return;
        if (!methodGrid || !payFromGrid) return;

        // prevent double-bind
        if (tablist.dataset.bound === "1") return;
        tablist.dataset.bound = "1";

        const state = {
            lastConvertMode: false,
            activePlaycard: playcards[0] || null,
            methodType: null,
            channelId: null,
            payFromId: null,
        };

        const mqMobile = window.matchMedia("(max-width: 1023.98px)");
        function isMobileUI() {
            return mqMobile.matches;
        }

        function getActivePackage() {
            return state.activePlaycard || null;
        }

        function getActiveChannel() {
            const list = METHOD_CHANNELS[state.methodType] || [];
            return list.find(ch => ch.id === state.channelId) || null;
        }

        function getActivePayFrom() {
            const channel = getActiveChannel();
            if (!channel || !Array.isArray(channel.payFrom)) return null;

            return channel.payFrom.find(p => p.id === state.payFromId) || null;
        }
        function fmtMoney(n) {
            const num = Number(n);
            if (!Number.isFinite(num)) return "0.00";
            return num.toFixed(2);
        }
        function fmtMoneySep(n, dp = 2, sep = ",") {
            const num = Number(n);
            if (!Number.isFinite(num)) return (0).toFixed(dp);

            const fixed = num.toFixed(dp);              // "12345.67"
            const [intPart, decPart] = fixed.split(".");

            const intWithSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
            return decPart != null ? `${intWithSep}.${decPart}` : intWithSep;
        }
        function formatThousands(n, sep = ",") {
            const num = String(n).replace(/[^\d]/g, "");
            if (!num) return "";
            return num.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
        }

        function unformatThousands(str) {
            return String(str || "").replace(/[^\d]/g, "");
        }
        function numAttr(el, name, fallback = 0) {
            const v = parseFloat(el?.getAttribute(name) || "");
            return Number.isFinite(v) ? v : fallback;
        }
        function strAttr(el, name, fallback = "") {
            const v = (el?.getAttribute(name) || "").trim();
            return v || fallback;
        }
        function getPkgData(pkgEl) {
            return {
                minAmt: numAttr(pkgEl, "data-mindeposit-amt", 0),
                minCur: strAttr(pkgEl, "data-mindeposit-cur", ""),
                maxAmt: numAttr(pkgEl, "data-maxdeposit-amt", 0), // 0 means 'not set'
                bonusPct: numAttr(pkgEl, "data-bonus-pct", 0),
                maxBonusAmt: numAttr(pkgEl, "data-maxbonus-amt", 0),
                maxBonusCur: strAttr(pkgEl, "data-maxbonus-cur", ""),
                rollover: numAttr(pkgEl, "data-rollover", 0),
                rolloverUnit: strAttr(pkgEl, "data-rollover-unit", "x"),
            };
        }
        function parseMethods(str) {
            return (str || "")
                .split(",")
                .map((s) => s.trim().toLowerCase())
                .filter(Boolean);
        }

        function setTabActive(tabEl) {
            tabs.forEach((t) => {
                const isActive = t === tabEl;
                t.classList.toggle("is-active", isActive);
                t.setAttribute("aria-selected", isActive ? "true" : "false");
                t.tabIndex = isActive ? 0 : -1;
            });
            if (sumMethodEl && tabEl) sumMethodEl.textContent = tabEl.textContent.trim();
        }

        function applyTabsByPlaycard(playcardBody) {
            const allowed = new Set(parseMethods(playcardBody?.getAttribute("data-methods")));
            const allowAll = allowed.size === 0;

            tabs.forEach((tab) => {
                const key = tab.getAttribute("data-method");
                const ok = allowAll || allowed.has(key);

                tab.classList.toggle("is-disabled", !ok);
                tab.setAttribute("aria-disabled", String(!ok));
                tab.tabIndex = ok ? 0 : -1;

                // Tooltip for disabled tabs (PORTAL - do not append bubble inside overflow)
                const tipText = "This payment method is not supported";

                // clean any legacy bubble
                const existingBubble = tab.querySelector(".ttip__bubble");
                if (existingBubble) existingBubble.remove();

                if (!ok) {
                    tab.classList.add("ttip");
                    tab.dataset.ttip = tipText;
                    tab.dataset.ttipPos = "top";
                } else {
                    tab.classList.remove("ttip");
                    delete tab.dataset.ttip;
                    delete tab.dataset.ttipPos;
                }
            });


            let currentActive = tabs.find((t) => t.classList.contains("is-active") && !t.classList.contains("is-disabled"));
            if (!currentActive) currentActive = tabs.find((t) => !t.classList.contains("is-disabled"));

            if (currentActive) {
                setTabActive(currentActive);
                state.methodType = currentActive.dataset.method;
            } else {
                // no available method
                tabs.forEach((t) => {
                    t.classList.remove("is-active");
                    t.setAttribute("aria-selected", "false");
                    t.tabIndex = -1;
                });
                if (sumMethodEl) sumMethodEl.textContent = "-";
                state.methodType = null;
            }
        }

        function syncDepositByPlaycard(playcardBody) {
            if (!playcardBody) return;

            const input = document.getElementById("amount");
            const minHint = document.getElementById("minHint");
            const maxHint = document.getElementById("maxHint");
            const curHint = document.querySelector(".curHint");
            const sumMinDeposit = document.getElementById("sumMinDeposit");

            if (!input) return;

            const minAmt = parseFloat(playcardBody.getAttribute("data-mindeposit-amt")) || 0;
            const maxAmt = parseFloat(playcardBody.getAttribute("data-maxdeposit-amt")) || 0;
            const cur = playcardBody.getAttribute("data-mindeposit-cur") || "";

            // Update input constraints
            input.min = 0;
            if (maxAmt && Number.isFinite(maxAmt)) input.max = maxAmt;
            else input.removeAttribute("max");
            input.value = "";

            // Update hint text
            if (minHint) {
                minHint.textContent = `Min: ${minAmt} ${cur}`;
            }

            if (maxHint) {
                if (maxAmt && maxAmt !== Infinity) {
                    maxHint.textContent = `Max: ${maxAmt} ${cur}`;
                } else {
                    maxHint.textContent = "";
                }
            }

            // Update currency label
            if (curHint) {
                curHint.textContent = cur;
            }

            // Update summary
            if (sumMinDeposit) {
                sumMinDeposit.textContent = `${minAmt} ${cur}`;
            }
        }
        function getRateByPair(fromCur, toCur) {
            const fromRaw = String(fromCur || "").trim();
            const toRaw = String(toCur || "").trim();
            if (!fromRaw || !toRaw || fromRaw.toLowerCase() === toRaw.toLowerCase()) return null;

            // Try multiple key styles: as-is, UPPER, lower
            const fromKeys = [fromRaw, fromRaw.toUpperCase(), fromRaw.toLowerCase()];
            const toKeys = [toRaw, toRaw.toUpperCase(), toRaw.toLowerCase()];

            let map = null;
            for (const k of fromKeys) {
                if (CURCONVERT && CURCONVERT[k]) { map = CURCONVERT[k]; break; }
            }
            if (!map) return null;

            let raw = null;
            for (const k of toKeys) {
                if (map[k] != null) { raw = map[k]; break; }
            }

            const rate = parseFloat(String(raw ?? "").replace(/[^\d.]/g, ""));
            return Number.isFinite(rate) && rate > 0 ? rate : null;
        }

        function renderFxRow({ show, quoteCur, baseCur, rate }) {
            const fxRow = document.getElementById("fxRow");
            if (!fxRow) return;

            if (!show) {
                fxRow.hidden = true;
                return;
            }

            fxRow.hidden = false;

            const quoteEl = fxRow.querySelector(".fxRow__quote");
            const baseEl = fxRow.querySelector(".fxRow__base");
            const rateEl = fxRow.querySelector("#fxText");

            if (quoteEl) quoteEl.textContent = `${quoteCur} 1`;
            if (baseEl) baseEl.textContent = baseCur;

            // rate is "1 quote = rate base"
            if (rateEl) rateEl.textContent = fmtMoneySep(rate, 2);
        }
        function updateCurHint(text) {
            const el = document.querySelector(".curHint");
            if (!el) return;
            el.textContent = (text || "").trim();
        }
        function recalcSummary() {
            const pkgEl = getActivePackage();
            const channel = getActiveChannel();
            const payFrom = getActivePayFrom();

            const input = document.getElementById("amount");
            if (!pkgEl || !input) return;

            const pkg = getPkgData(pkgEl);

            const pkgCur = (pkg.minCur || "MYR").trim(); // base (display) currency
            const payCur = (payFrom?.currency || channel?.currency || pkgCur).trim(); // input currency

            updateCurHint(payCur);

            // convert is allowed when channel.convert === true (or payFrom could also drive it if you want)
            const allowConvert = !!channel?.convert;

            // rate: 1 payCur = rate pkgCur
            const rate = allowConvert ? getRateByPair(payCur, pkgCur) : null;
            const convertMode = allowConvert && rate != null && payCur !== pkgCur;

            // FX row render
            renderFxRow({
                show: convertMode,
                quoteCur: payCur,
                baseCur: pkgCur,
                rate
            });

            // Clear input only when convert mode toggles
            if (state.lastConvertMode !== convertMode) {
                input.value = "";
                state.lastConvertMode = convertMode;
            }

            // ---- Min Deposit display ----
            const minHint = document.getElementById("minHint");
            const sumMinDepositEl = document.getElementById("sumMinDeposit");

            // method min (in pay currency, e.g. USDT in convert mode; MYR in normal mode)
            const methodMinPay = getMethodMinDeposit(channel, payFrom);
            const pkgMinBase = pkg.minAmt;

            // fallback: if method min missing, use package min (base currency)
            if (convertMode) {
                // pay currency is USDT here
                const minPay = (methodMinPay != null ? methodMinPay : (pkgMinBase / rate)); // USDT
                const minMYR = minPay * rate;

                // ✅ minHint shows what user should key in (USDT)
                if (minHint) minHint.textContent = minPay ? `Min: ${fmtMoneySep(minPay, 2)} ${payCur}` : "";

                // ✅ summary min shows MYR (converted)
                if (sumMinDepositEl) sumMinDepositEl.textContent = minPay ? `${fmtMoneySep(minMYR, 2)} ${pkgCur}` : "-";
            } else {
                // non-convert: everything is in MYR (or payCur==pkgCur)
                const minBase = (methodMinPay != null ? methodMinPay : pkgMinBase); // MYR
                if (minHint) minHint.textContent = minBase ? `Min: ${fmtMoneySep(minBase, 2)} ${pkgCur}` : "";
                if (sumMinDepositEl) sumMinDepositEl.textContent = minBase ? `${fmtMoneySep(minBase, 2)} ${pkgCur}` : "-";
            }

            // ---- Max deposit (input currency constraint) ----
            // package max is in MYR (pkgCur). If convertMode, convert it to USDT for input.max
            const pkgMaxBase = (pkg.maxAmt && Number.isFinite(pkg.maxAmt)) ? pkg.maxAmt : null; // MYR
            const methodMaxPay = getMethodMaxDeposit(channel, payFrom); // pay currency (USDT for crypto payFrom)

            const pkgMaxPay = (convertMode && pkgMaxBase != null) ? (pkgMaxBase / rate) : null;

            let finalMaxPay = null;
            if (pkgMaxPay == null) finalMaxPay = methodMaxPay;
            else if (methodMaxPay == null) finalMaxPay = pkgMaxPay;
            else finalMaxPay = Math.min(pkgMaxPay, methodMaxPay);

            applyMaxToInputAndHint(finalMaxPay, payCur); // maxHint shows in pay currency

            // ---- read input (pay currency) & clamp ----
            let payAmount = parseFloat(unformatThousands(input.value) || "");
            if (!Number.isFinite(payAmount)) payAmount = 0;
            if (payAmount < 0) payAmount = 0;
            if (finalMaxPay != null) payAmount = Math.min(payAmount, finalMaxPay);

            // keep blank if 0
            input.value = payAmount ? formatThousands(String(Math.trunc(payAmount)), ",") : "";

            // ---- Convert + Compute (SUMMARY must be in package currency MYR) ----
            // If convertMode: input is USDT -> deposit is MYR
            const depositMYR = convertMode ? (payAmount * rate) : payAmount;

            let bonusMYR = depositMYR * (pkg.bonusPct / 100);
            if (pkg.maxBonusAmt && Number.isFinite(pkg.maxBonusAmt)) {
                bonusMYR = Math.min(bonusMYR, pkg.maxBonusAmt); // max bonus is already MYR (from playcard data)
            }

            const receiveMYR = depositMYR + bonusMYR;
            const totalMYR = depositMYR;

            // ---- write summary (ALWAYS MYR / package currency) ----
            const sumDepositEl = document.getElementById("sumDeposit");
            const sumBonusEl = document.getElementById("sumBonus");
            const sumReceiveEl = document.getElementById("sumReceive");
            const sumTotalEl = document.getElementById("sumTotal");

            if (sumDepositEl) sumDepositEl.textContent = `${fmtMoneySep(depositMYR, 2)} ${pkgCur}`;
            if (sumBonusEl) sumBonusEl.textContent = `${fmtMoneySep(bonusMYR, 2)} ${pkgCur}`;
            if (sumReceiveEl) sumReceiveEl.textContent = `${fmtMoneySep(receiveMYR, 2)} ${pkgCur}`;
            if (sumTotalEl) sumTotalEl.textContent = `${fmtMoneySep(totalMYR, 2)} ${pkgCur}`;

            const sumRolloverEl = document.getElementById("sumRolloverFormula");
            if (sumRolloverEl) {
                // Use package rollover if provided, else fallback to 10 (as per your design)
                const x = Number.isFinite(pkg.rollover) && pkg.rollover > 0 ? pkg.rollover : 10;

                // Values are in package currency (MYR) in your current logic
                const dep = Number.isFinite(depositMYR) ? depositMYR : 0;
                const bon = Number.isFinite(bonusMYR) ? bonusMYR : 0;
                const maxBon = Number.isFinite(pkg.maxBonusAmt) ? pkg.maxBonusAmt : 0;

                // "Known" turnover part (Free Spin part is separate note)
                const knownTurnover = (dep * x) + (bon * x) + (maxBon * x);

                sumRolloverEl.innerHTML = `
  <span class="rolloverFormula__main">
    Rollover Requirement : 
    (Deposit ${fmtMoneySep(dep, 2)} × ${x}) + 
    (Bonus ${fmtMoneySep(bon, 2)} × ${x}) + 
    (Max Bonus ${fmtMoneySep(maxBon, 2)} × ${x}) 
  
  </span>
  <span class="rolloverFormula__note">  = ${pkgCur} ${fmtMoneySep(knownTurnover, 2)}
    + (To be calculated after Free Spin Completion)
  </span>
`;
            }
            const submitBtn = document.querySelector(".submit");

            if (submitBtn) {

                // 当前 method 最低值（pay currency）
                const methodMinPay = getMethodMinDeposit(channel, payFrom);
                const pkgMinBase = pkg.minAmt;

                let requiredMinPay;

                if (convertMode) {
                    // convert 模式：input 是 USDT
                    requiredMinPay = methodMinPay != null
                        ? methodMinPay
                        : (pkgMinBase / rate);
                } else {
                    // 普通模式：input 是 MYR
                    requiredMinPay = methodMinPay != null
                        ? methodMinPay
                        : pkgMinBase;
                }

                const currentInputPay = payAmount; // 这是 input 里的真实数值（已 unformat）

                const isValid = currentInputPay >= requiredMinPay;

                submitBtn.disabled = !isValid;
                submitBtn.classList.toggle("is-disabled", !isValid);
            }
        }

        mqMobile.addEventListener?.("change", () => {
            const ch = getActiveChannel();
            if (ch) renderPayFrom(ch);
        });
        function clearPayFrom() {
            payFromGrid.innerHTML = "";
            if (sumFromEl) sumFromEl.textContent = "-";
            state.payFromId = null;
        }

        function renderPayFrom(channel) {
            if (!payFromGrid) return;

            payFromGrid.innerHTML = "";

            const list = (Array.isArray(channel?.payFrom) ? channel.payFrom : []).filter(Boolean);
            const hasPayFrom = list.length > 0;

            // No payFrom list: fallback to channel
            if (!hasPayFrom) {
                payFromSection.style.display = "none";
                state.payFromId = null;

                if (sumFromEl) sumFromEl.textContent = channel.name || channel.id || "-";
                recalcSummary();
                return;
            }

            // Has payFrom
            payFromSection.style.display = "";

            // ===== MOBILE: render as <select> =====
            if (isMobileUI()) {
                payFromGrid.classList.add("payFromGrid--select");

                const select = document.createElement("select");
                select.className = "payFromSelect";
                select.setAttribute("aria-label", "Paying From");

                // Build options (keep maintenance items disabled)
                let firstSelectable = null;
                list.forEach((item) => {
                    const opt = document.createElement("option");
                    opt.value = item.id;
                    opt.textContent = item.name || item.id;

                    if (item.maintenance) {
                        opt.disabled = true;
                        opt.textContent = `${opt.textContent} (Maintenance)`;
                    } else if (!firstSelectable) {
                        firstSelectable = item;
                    }

                    select.appendChild(opt);
                });

                // Pick current if valid, else default to first non-maintenance
                const current = list.find(p => p.id === state.payFromId && !p.maintenance) || firstSelectable;
                if (current) {
                    state.payFromId = current.id;
                    select.value = current.id;
                    if (sumFromEl) sumFromEl.textContent = current.name || current.id;
                } else {
                    state.payFromId = null;
                    if (sumFromEl) sumFromEl.textContent = channel.name || channel.id || "-";
                }

                select.addEventListener("change", () => {
                    const picked = list.find(p => p.id === select.value) || null;
                    state.payFromId = picked?.id || null;
                    if (sumFromEl) sumFromEl.textContent = picked?.name || picked?.id || "-";
                    recalcSummary();
                });

                payFromGrid.appendChild(select);
                recalcSummary();
                return;
            }

            // ===== DESKTOP: render as scroll buttons (your current behavior) =====
            payFromGrid.classList.remove("payFromGrid--select");

            let firstSelectableBtn = null;
            let firstSelectableItem = null;

            list.forEach((item) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "payFromBtn";
                btn.dataset.payFromId = item.id;

                const isMaint = !!item.maintenance;
                if (isMaint) {
                    btn.classList.add("is-maintenance");
                    btn.disabled = true;
                } else if (!firstSelectableBtn) {
                    firstSelectableBtn = btn;
                    firstSelectableItem = item;
                }

                const iconFile = item.icon || channel.icon;

                const iconSpan = document.createElement("span");
                iconSpan.className = "payFromIcon";
                if (iconFile) {
                    const img = document.createElement("img");
                    img.loading = "lazy";
                    img.alt = item.name || item.id || "";
                    img.src = `image/payment/icon-vaderpay-m.png`; // demo icon
                    iconSpan.appendChild(img);
                }

                const nameSpan = document.createElement("span");
                nameSpan.className = "payFromName";
                nameSpan.textContent = item.name || item.id;

                btn.appendChild(iconSpan);
                btn.appendChild(nameSpan);

                btn.addEventListener("click", () => {
                    payFromGrid.querySelectorAll(".payFromBtn").forEach(b => b.classList.remove("is-active"));
                    btn.classList.add("is-active");
                    if (sumFromEl) sumFromEl.textContent = item.name || item.id;
                    state.payFromId = item.id;
                    recalcSummary();
                });

                payFromGrid.appendChild(btn);
            });

            // default selection
            const current = list.find(p => p.id === state.payFromId && !p.maintenance) || null;
            if (current) {
                const btn = payFromGrid.querySelector(`.payFromBtn[data-pay-from-id="${CSS.escape(current.id)}"]`);
                if (btn) btn.classList.add("is-active");
                if (sumFromEl) sumFromEl.textContent = current.name || current.id;
                state.payFromId = current.id;
                recalcSummary();
                return;
            }

            if (firstSelectableBtn) {
                firstSelectableBtn.classList.add("is-active");
                if (sumFromEl) sumFromEl.textContent = firstSelectableItem.name || firstSelectableItem.id;
                state.payFromId = firstSelectableItem.id;
                recalcSummary();
            } else {
                // all maintenance
                if (sumFromEl) sumFromEl.textContent = channel.name || channel.id || "-";
                state.payFromId = null;
                recalcSummary();
            }
        }        function getMethodMaxDeposit(channel, payFrom) {
            // Prefer payFrom maxDeposit (each payFrom can have its own limit)
            const pfMax = payFrom?.maxDeposit;
            const chMax = channel?.maxDeposit;
            const max = (pfMax == null ? chMax : pfMax);
            return (max == null || max === "" || !Number.isFinite(Number(max))) ? null : Number(max);
        }

        function getMethodMinDeposit(channel, payFrom) {
            const pfMin = payFrom?.minDeposit;
            const chMin = channel?.minDeposit;

            const min = (pfMin == null ? chMin : pfMin);
            return (min == null || !Number.isFinite(Number(min))) ? null : Number(min);
        }

        function applyMaxToInputAndHint(finalMax, curLabel) {
            const input = document.getElementById("amount");
            const maxHint = document.getElementById("maxHint");
            if (!input) return;

            if (finalMax == null) {
                input.removeAttribute("max");
                if (maxHint) maxHint.textContent = "";
            } else {
                input.max = String(finalMax);
                if (maxHint) maxHint.textContent = `Max: ${fmtMoneySep(finalMax, 2)} ${curLabel}`;
            }
        }
        function syncSummaryFrom(text) {
            if (sumFromEl) sumFromEl.textContent = text ?? "-";
        }
        function renderChannels(methodKey) {
            methodGrid.innerHTML = "";

            const list = METHOD_CHANNELS[methodKey] || [];
            if (!list.length) {
                methodGrid.innerHTML = "<div class='muted'>No channels</div>";
                clearPayFrom();
                state.channelId = null;
                state.payFromId = null;
                syncSummaryFrom("-");
                return;
            }

            // 1) Pick a default channel (skip maintenance)
            const defaultChannel = list.find(ch => !ch?.maintenance) || null;

            // 2) Render all channel buttons
            list.forEach((ch) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "methodBtn";
                btn.dataset.channelId = ch.id;

                if (ch.maintenance) {
                    btn.classList.add("is-maintenance");
                    btn.disabled = true;
                }

                const iconSpan = document.createElement("span");
                iconSpan.className = "methodIcon";

                // icon (optional)
                const img = document.createElement("img");
                img.loading = "lazy";
                img.alt = ch.name || ch.id || "";

                const file = fileForIcon(ch.icon); // helper
                img.src = `image/payment/icon-vaderpay-m.png`;
                // if (file) img.src = ../image/${file}; //------------>original code
                iconSpan.appendChild(img);
                btn.appendChild(iconSpan);

                const nameSpan = document.createElement("span");
                nameSpan.className = "methodName";
                nameSpan.textContent = ch.name || ch.id;
                btn.appendChild(nameSpan);

                                methodGrid.appendChild(btn);
            });

            // 3) Select defaultChannel (if any)
            if (defaultChannel) {
                const btn = methodGrid.querySelector(`.methodBtn[data-channel-id="${CSS.escape(defaultChannel.id)}"]`);
                if (btn) btn.classList.add("is-active");

                state.channelId = defaultChannel.id;
                state.payFromId = null;

                renderPayFrom(defaultChannel);
            } else {
                // All maintenance
                clearPayFrom();
                state.channelId = null;
                state.payFromId = null;
                syncSummaryFrom("-");
            }
        }
        // ========== Event handlers (delegation) ==========
        document.querySelectorAll(".qBtn").forEach(btn => {
            btn.addEventListener("click", () => {
                const input = document.getElementById("amount");
                if (!input) return;

                const add = parseFloat(btn.dataset.add) || 0;
                const current = parseFloat(unformatThousands(input.value)) || 0;
                const card = state.activePlaycard;
                const max = parseFloat(card?.getAttribute("data-maxdeposit-amt")) || Infinity;

                const next = current + add;
                const v = Number.isFinite(max) ? Math.min(next, max) : next;
                input.value = formatThousands(String(Math.trunc(v)), ",");
                recalcSummary();
            });
        });
        function initKeypad() {
            const keypad = document.querySelector("[data-keypad]");
            const input = document.getElementById("amount");
            if (!keypad || !input) return;

            function setValue(v) {
                v = unformatThousands(v);

                // Allow empty input
                if (v === "") {
                    input.value = "";
                    recalcSummary?.();
                    return;
                }

                let num = parseInt(v, 10);
                if (!Number.isFinite(num)) num = 0;

                const card = state.activePlaycard;
                const max = parseFloat(card?.getAttribute("data-maxdeposit-amt")) || Infinity;
                if (Number.isFinite(max)) num = Math.min(num, max);

                input.value = formatThousands(String(num), ",");
                recalcSummary?.();
            }
            function appendDigit(d) {
                const curRaw = unformatThousands(input.value || "0"); // strip separators
                const cur = curRaw === "" ? "0" : curRaw;
                const next = (cur === "0") ? d : (cur + d);
                setValue(next);
            }
            function delOne() {
                const cur = unformatThousands(input.value || "0"); // strip separators
                const next = cur.length <= 1 ? "0" : cur.slice(0, -1);
                setValue(next);
            }
            function clearAll() {
                setValue("0");
            }

            keypad.addEventListener("click", (e) => {
                const btn = e.target.closest("button[data-key]");
                if (!btn) return;

                const key = btn.dataset.key;

                if (key === "del") delOne();
                else if (key === "clear") clearAll();
                else if (/^\d$/.test(key)) appendDigit(key);

            });
        }

        initKeypad();

        tablist.addEventListener("click", (e) => {
            const tab = e.target.closest(".tab[data-method]");
            if (!tab) return;
            if (tab.classList.contains("is-disabled")) return;


            if (tab.classList.contains("is-active")) return;

            setTabActive(tab);
            state.methodType = tab.dataset.method;
            renderChannels(state.methodType);
        });

        methodGrid.addEventListener("click", (e) => {
            const btn = e.target.closest(".methodBtn[data-channel-id]");
            if (!btn) return;
            if (btn.classList.contains("is-maintenance") || btn.disabled) return;

            const nextId = btn.dataset.channelId;

            // ✅ already active => do nothing
            if (String(state.channelId) === String(nextId)) return;

            methodGrid.querySelectorAll(".methodBtn").forEach((b) => b.classList.remove("is-active"));
            btn.classList.add("is-active");

            state.channelId = nextId;
            state.payFromId = null;

            const ch = (METHOD_CHANNELS[state.methodType] || []).find((x) => String(x.id) === String(nextId)) || null;
            renderPayFrom(ch);
            recalcSummary();
        });

        payFromGrid.addEventListener("click", (e) => {
            const btn = e.target.closest(".payFromBtn[data-pay-from-id]");
            if (!btn) return;

            const nextId = btn.dataset.payFromId;
            if (String(state.payFromId) === String(nextId)) return;

            payFromGrid.querySelectorAll(".payFromBtn").forEach((b) => b.classList.remove("is-active"));
            btn.classList.add("is-active");
            state.payFromId = btn.dataset.payFromId;

            // summary shows selected payFrom name
            if (sumFromEl) sumFromEl.textContent = btn.textContent.trim();
            recalcSummary(); // ensure summary refresh
        });

        // clicking a playcard changes allowed tabs & resets to first available tab
        document.addEventListener("click", (e) => {
            const card = e.target.closest(".playcard__body");
            if (!card) return;
            state.activePlaycard = card;
            applyTabsByPlaycard(state.activePlaycard);

            syncDepositByPlaycard(state.activePlaycard);

            if (state.methodType) renderChannels(state.methodType);
            else {
                methodGrid.innerHTML = "<div class='muted'>No methods</div>";
                clearPayFrom();
            }
        });

        // initial
        state.activePlaycard = playcards[0];
        applyTabsByPlaycard(state.activePlaycard);
        if (state.methodType) renderChannels(state.methodType);

        syncDepositByPlaycard(state.activePlaycard);
        recalcSummary();

        // ===== amount input events =====
        const amountInput = document.getElementById("amount");
        if (amountInput) {
            // ✅ 防止手机/电话版弹原生键盘
            amountInput.setAttribute("readonly", "");
            amountInput.setAttribute("inputmode", "none");

            // iOS 有时 readonly 仍会给你光标/放大页面，所以我们直接拦截
            const blockNativeKb = (e) => {
                e.preventDefault();
                e.stopPropagation();
                // 立刻取消 focus，避免弹键盘/页面跳
                amountInput.blur();
                // 你自家 keypad 还需要写值，不受影响
            };

            // pointerdown 比 click 更早，能更稳定阻止键盘
            amountInput.addEventListener("pointerdown", blockNativeKb, { passive: false });
            amountInput.addEventListener("mousedown", blockNativeKb, { passive: false });
            amountInput.addEventListener("touchstart", blockNativeKb, { passive: false });

            // 某些机型会通过 focus 触发键盘，这里兜底
            amountInput.addEventListener("focus", () => {
                amountInput.blur();
            });

            // ✅ 你之前绑定的 input/change/keydown 可以删掉或保留
            // 但在 readonly 情况下用户不会手打了，基本不会触发
        }

    }
    /* =========================================================
       5) STARTUP
    ========================================================= */

    function start() {
        document.querySelectorAll("[data-rail]").forEach((rail) => {
            rail.setAttribute("data-active-filter", "all");
            rebuildRail(rail, "all", "init");
            watchRailResize(rail);
        });

        if (!document.querySelector("[data-rail]")) {
            document.querySelectorAll(".playcard__body").forEach(hydratePlaycardBody);
            initBadges();
        }

        bindFilter();
        bindRailWheel();

        // IMPORTANT: init payment UI after partials are in DOM
        initPaymentUI();
        initTooltipPortal();

        document.querySelectorAll("[data-scroll-x]").forEach(el => {
            enableHorizontalWheelScroll(el);
            enableDragScroll(el);
        });

        // Disable playcard navigation on the payment page (hard block)
        if (document.querySelector(".payment--main")) {
            // 1) Remove data-href (including dataset cache)
            document.querySelectorAll(".playcard").forEach((card) => {
                card.removeAttribute("data-href");
                delete card.dataset.href;
                card.setAttribute("data-no-nav", "1");
            });

            // 2) Capture-phase interception: block any navigation attempts
            document.addEventListener(
                "click",
                (e) => {
                    if (!document.querySelector(".payment--main")) return;

                    const card = e.target.closest(".playcard");
                    if (!card) return;

                    // On the payment page: prevent default and stop all subsequent handlers for playcard clicks
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                },
                true
            );
        }

    }
    // ===== Disable playcard navigation in payment page =====
    if (window.HTMLIncludes?.loadPartials) {
        window.HTMLIncludes.loadPartials({ execScripts: true }).then(start);
    } else if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }

    // click-to-navigate (ignore controls)

    // click-to-navigate (only allow media/title on list page)
    document.addEventListener("click", (e) => {
        // Payment page: do not allow navigation
        if (document.querySelector(".payment--main")) return;

        // Only allow navigation by clicking the media or title area
        const trigger = e.target.closest(".playcard__media, .playcard__header");
        if (!trigger) return;

        const card = trigger.closest(".playcard");
        if (!card) return;

        // Safety: ignore clicks on interactive elements
        if (e.target.closest("a, button, input, label")) return;

        const url = card.getAttribute("data-href");
        if (url) window.location.href = url;
    });

    const pkgOpt = document.getElementById("pkgOpt");

    pkgOpt.addEventListener("change", function () {
        const url = this.value;
        if (!url) return;
        window.location.href = url;
    });
});
