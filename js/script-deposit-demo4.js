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
        erc20: {
            id: "erc20", name: "ERC20-USDT", icon: "erc20.png", maintenance: false, currency: "USDT", minDeposit: 10, maxDeposit: 10000, addressLabel: "Wallet Address", address: "TQX9abc123exampleERC20walletAddress"
},
        trc20: {
            id: "trc20", name: "TRC20-USDT", icon: "trc20.png", maintenance: false, currency: "USDT", minDeposit: 10, maxDeposit: null,addressLabel: "Wallet Address", address: "tesing trc20"
},
    };
    const BANK_PAYTO_ACCOUNTS = [
        {
            id: "maybank_acc_1",
            bank: "Maybank",
            image: "payment/maybank.png",
            accountName: "ABCDEFG HIJKLMN  SDN BHD",
            accountNumber: "1234 5678 9012",
            maintenance: false,
            minDeposit: 20,
            maxDeposit: 50000,
            qrimage:"image/img-qr-testing.png",
        },
        {
            id: "cimb_acc_1",
            bank: "CIMB Bank",
            image: "payment/cimb.png",
            accountName: "ABC SDN BHD",
            accountNumber: "1111 2222 3333",
            maintenance: false,
            minDeposit: 20,
            maxDeposit: 10000,
            qrimage: "",
        },
        {
            id: "ocbc",
            bank: "OBC Bank",
            image: "payment/ocbc.png",
            accountName: "ABCDEFG HIJKLMN OPQRSTU SDN BHD",
            accountNumber: "8888 1111 2222",
            maintenance: false,
            minDeposit: 50,
            maxDeposit: 1000,
            qrimage: "image/img-qr-testing3.jpg",
        },
    ];
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
                icon: "maybank.png",
                maintenance: false,
                requiresPayTo: true,
                payTo: BANK_PAYTO_ACCOUNTS
            }
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
            {
                id: "bitcoin", name: "Bitcoin", icon: "bitcoin.png", minDeposit: 10, currency: "BTC", convert: true, maintenance: false,
                addressLabel: "Wallet Address",
                address: "testing bitcoin",
},
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


        let lastScrollAt = 0;
        let lastShowAt = 0;
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
        }
        // --- Mobile / touch: tap to show tooltip (ignore drag) ---
        const isTouchUI = () => window.matchMedia("(hover: none)").matches;

        const SHOW_MS = 1500;
        const TAP_MOVE_PX = 8;

        let down = null; // {x,y,target, moved}

        function clearTimer() {
            clearTimeout(window.__ttipTimer);
            window.__ttipTimer = null;
        }

        function armAutoHide() {
            clearTimer();
            window.__ttipTimer = setTimeout(() => hide(), SHOW_MS);
        }

        // 用 pointer 系列来判断“点”还是“拖”
        document.addEventListener(
            "pointerdown",
            (e) => {
                if (!isTouchUI()) return;

                const t = e.target.closest("[data-ttip]");
                if (!t) {
                    // 点到别处就关（可选）
                    hide();
                    return;
                }

                down = { x: e.clientX, y: e.clientY, target: t, moved: false };
            },
            true
        );

        document.addEventListener(
            "pointermove",
            (e) => {
                if (!isTouchUI()) return;
                if (!down) return;

                const dx = e.clientX - down.x;
                const dy = e.clientY - down.y;
                if (Math.hypot(dx, dy) > TAP_MOVE_PX) down.moved = true;
            },
            true
        );

        document.addEventListener(
            "pointerup",
            (e) => {
                if (!isTouchUI()) return;
                if (!down) return;

                const t = down.target;
                const wasDrag = down.moved;
                down = null;

                if (wasDrag) return; // 拖动/滑动，不弹 tooltip

                // toggle：点同一个目标就关
                if (activeTarget === t) {
                    hide();
                    clearTimer();
                    return;
                }

                show(t);
                armAutoHide();
            },
            true
        );

        window.addEventListener(
            "scroll",
            () => {
                if (isTouchUI()) {
                    // ✅ 刚 show 的 450ms 内不隐藏（iOS 惯性更强，300 有时不够）
                    if (Date.now() - lastShowAt < 450) return;
                    hide();
                    return;
                }
                if (activeTarget) positionBubble(activeTarget);
            },
            true
        );
        function show(target) {
            if (!target?.dataset?.ttip) return;
            activeTarget = target;
            lastShowAt = Date.now();
            positionBubble(target);
        }

        function hide() {
            activeTarget = null;
            if (!bubble) return;
            bubble.style.opacity = "0";
            bubble.style.visibility = "hidden";
        }

        // hover + keyboard focus
        document.addEventListener(
            "click",
            (e) => {
                if (isTouchUI()) return;

                const t = e.target.closest("[data-ttip]");
                if (!t) return;

                show(t);
            },
            true
        );

        document.addEventListener("pointerout", (e) => {
            if (isTouchUI()) return;
            const t = e.target.closest("[data-ttip]");
            if (!t) return;
            hide();
        });

        document.addEventListener("focusin", (e) => {
            if (isTouchUI()) return;   // ✅ 新增
            const t = e.target.closest("[data-ttip]");
            if (!t) return;
            show(t);
        });

        document.addEventListener("focusout", (e) => {
            if (isTouchUI()) return;   // ✅ 新增
            const t = e.target.closest("[data-ttip]");
            if (!t) return;
            hide();
        });

        function markScrolled() {
            lastScrollAt = Date.now();

            if (isTouchUI()) {
                // ✅ 刚点出来的一瞬间，别立刻被惯性滚动干掉
                if (Date.now() - lastShowAt < 300) return;
                hide();
            }
        }
        window.addEventListener("resize", () => {
            if (activeTarget) positionBubble(activeTarget);
        });

        // if user clicks anywhere, hide (optional)
        document.addEventListener("pointerover", (e) => {
            if (isTouchUI()) return;
            const t = e.target.closest("[data-ttip]");
            if (!t) return;
            show(t);
        });
    }
    function initQrViewer() {

        const viewer = document.getElementById("qrViewer");
        const viewerImg = document.getElementById("qrViewerImg");

        if (!viewer || !viewerImg) return;

        function openQrViewer(src) {
            if (!src) return;

            viewerImg.src = src;
            viewer.hidden = false;
            viewer.setAttribute("aria-hidden", "false");
            document.body.classList.add("qrViewer-open");
        }

        function closeQrViewer() {
            viewer.hidden = true;
            viewer.setAttribute("aria-hidden", "true");
            viewerImg.src = "";
            document.body.classList.remove("qrViewer-open");
        }

        viewer.addEventListener("click", (e) => {
            if (e.target.closest("[data-qr-close]")) {
                closeQrViewer();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !viewer.hidden) {
                closeQrViewer();
            }
        });

        window.openQrViewer = openQrViewer;
        window.closeQrViewer = closeQrViewer;
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
            // bindRailWheel(railEl);
            railEl.querySelectorAll("[data-scroll-x]").forEach(el => {
                // enableHorizontalWheelScroll(el);
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
        // bindRailWheel(railEl);
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
            payToId: null,
            payToMeta: null,
        };

        const paymentMain = document.querySelector(".payment--main");

        function syncPaymentMainState() {
            if (!paymentMain) return;

            const methodType = state.methodType || "";
            const isBank = methodType === "bank";

            paymentMain.dataset.methodType = methodType;
            paymentMain.dataset.layout = isBank ? "bank-transfer" : "default";

            paymentMain.classList.toggle("is-bank-transfer", isBank);
        }

        const mqMobile = window.matchMedia("(max-width: 1023.98px)");
        function renderMinHint(value, currency) {
            const el = document.getElementById("minHint");
            if (!el) return;

            el.innerHTML =
                `<span class="hint-label">Min</span>` +
                `<span class="hint-value">${fmtMoneySep(value, 2)} ${currency}</span>`;
        }

        function renderMaxHint(value, currency) {
            const el = document.getElementById("maxHint");
            if (!el) return;

            el.innerHTML =
                `<span class="hint-label">Max</span>` +
                `<span class="hint-value">${fmtMoneySep(value, 2)} ${currency}</span>`;
        }
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
        function getActiveCryptoSource() {
            if (state.methodType !== "crypto") return null;

            const channel = getActiveChannel();
            const payFrom = getActivePayFrom();

            return payFrom || channel || null;
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
        function sortTabsByAvailability() {
            tabs.forEach((tab, index) => {
                const disabled = tab.classList.contains("is-disabled");
                // 可选的在前，不可选的在后；同组内保留原始顺序
                tab.style.order = disabled ? String(100 + index) : String(index);
            });
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

                // Tooltip for disabled tabs
                const tipText = "This payment method is not supported";

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

            // ✅ 先按可不可用排序
            sortTabsByAvailability();

            let currentActive = tabs.find((t) => t.classList.contains("is-active") && !t.classList.contains("is-disabled"));
            if (!currentActive) currentActive = tabs.find((t) => !t.classList.contains("is-disabled"));

            if (currentActive) {
                setTabActive(currentActive);
                state.methodType = currentActive.dataset.method;
            } else {
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
            const curHint = document.querySelector(".curHint");
            const sumMinDeposit = document.getElementById("sumMinDeposit");

            if (!input) return;

            const minAmt = parseFloat(playcardBody.getAttribute("data-mindeposit-amt")) || 0;
            const maxAmt = parseFloat(playcardBody.getAttribute("data-maxdeposit-amt")) || 0;
            const cur = playcardBody.getAttribute("data-mindeposit-cur") || "";

            input.min = 0;
            if (maxAmt && Number.isFinite(maxAmt)) input.max = maxAmt;
            else input.removeAttribute("max");
            input.value = "";

            renderMinHint(minAmt, cur);

            if (maxAmt && Number.isFinite(maxAmt)) {
                renderMaxHint(maxAmt, cur);
            } else {
                const maxHint = document.getElementById("maxHint");
                if (maxHint) maxHint.innerHTML = "";
            }

            if (curHint) {
                curHint.textContent = cur;
            }

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
        function tryDetectQr(imageData, w, h) {
            return jsQR(imageData.data, w, h, { inversionAttempts: "attemptBoth" });
        }

        function makeThresholdImageData(srcImageData, threshold = 160) {
            const out = new ImageData(srcImageData.width, srcImageData.height);
            const s = srcImageData.data;
            const d = out.data;

            for (let i = 0; i < s.length; i += 4) {
                const gray = 0.299 * s[i] + 0.587 * s[i + 1] + 0.114 * s[i + 2];
                const v = gray > threshold ? 255 : 0;
                d[i] = v;
                d[i + 1] = v;
                d[i + 2] = v;
                d[i + 3] = 255;
            }
            return out;
        }
        function setSummaryText(id, text) {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = text ?? "-";
        }

        function setSummaryRowVisible(key, show) {
            const row = document.querySelector(`[data-summary-row="${key}"]`);
            if (!row) return;
            row.hidden = !show;
        }
        function syncSelectBankingVisibility() {
            const wrap = document.getElementById("selectBanking");
            if (!wrap) return;

            const payFromSection = wrap.querySelector(".payFromSection");
            const payToInfoCard = document.getElementById("payToInfoCard");
            const cryptoInfoCard = document.getElementById("cryptoInfoCard");

            const hasVisibleChild =
                (payFromSection && !payFromSection.hidden) ||
                (payToInfoCard && !payToInfoCard.hidden) ||
                (cryptoInfoCard && !cryptoInfoCard.hidden);

            wrap.hidden = !hasVisibleChild;
        }
        function recalcSummary() {
            const pkgEl = getActivePackage();
            const channel = getActiveChannel();
            const payFrom = getActivePayFrom();
            const payTo = getActivePayTo();

            const activeSource =
                state.methodType === "bank"
                    ? payTo
                    : (state.methodType === "crypto" ? (payFrom || channel) : payFrom);

            const input = document.getElementById("amount");
            if (!pkgEl || !input) return;

            const pkg = getPkgData(pkgEl);

            const pkgCur = (pkg.minCur || "MYR").trim(); // base (display) currency
            const payCur = (activeSource?.currency || channel?.currency || pkgCur).trim();

            updateCurHint(payCur);

            // convert is allowed when channel.convert === true (or payFrom could also drive it if you want)
            const allowConvert = !!channel?.convert;

            // rate: 1 payCur = rate pkgCur
            const rate = allowConvert ? getRateByPair(payCur, pkgCur) : null;
            const convertMode = allowConvert && rate != null && payCur !== pkgCur;
            // ---- Extended summary details ----
            const isBank = state.methodType === "bank";
            const isCrypto = state.methodType === "crypto";

            const channelName = channel?.name || channel?.id || "-";
            const networkName = payFrom?.name || payFrom?.id || "-";
            const walletAddress =
                (isCrypto ? (payFrom?.address || channel?.address || "") : "").trim() || "-";

            setSummaryText("sumMethod", METHOD_META[state.methodType]?.label || "-");
            setSummaryText("sumFrom", activeSource?.name || activeSource?.bank || activeSource?.id || "-");
            setSummaryText("sumChannel", channelName);
            setSummaryText("sumNetwork", networkName);
            setSummaryText("sumWalletAddress", walletAddress);
            setSummaryText("sumCurrency", payCur);
            setSummaryText(
                "sumConversion",
                convertMode ? `${fmtMoneySep(rate, 8)} ${payCur}` : "-"
            );

            // row visibility
            //setSummaryRowVisible("channel", !isBank && !!channel);
            setSummaryRowVisible("network", isCrypto && !!payFrom);
            setSummaryRowVisible("currency", !isBank);
            setSummaryRowVisible("conversion", convertMode);

            const sumFromLabel = document.getElementById("sumFromLabel");
            if (state.methodType === "crypto") {
                const hasAddress = !!String(walletAddress || "").trim() && walletAddress !== "-";

                if (hasAddress) {
                    if (sumFromLabel) sumFromLabel.textContent = "Or send to this address";
                    setSummaryText("sumFrom", walletAddress);
                } else {
                    if (sumFromLabel) sumFromLabel.textContent = "Paying From";
                    setSummaryText("sumFrom", channel?.name || activeSource?.name || activeSource?.id || "-");
                }
            } else if (state.methodType === "bank") {
                if (sumFromLabel) sumFromLabel.textContent = "Pay To";
                setSummaryText("sumFrom", activeSource?.bank || activeSource?.id || "-");
            } else {
                if (sumFromLabel) sumFromLabel.textContent = "Paying From";
                setSummaryText("sumFrom", activeSource?.name || activeSource?.id || "-");
            }
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

            const rawVal = Number(unformatThousands(input.value || "0")) || 0;
            const depositInCurrency = convertMode && rate ? (rawVal / rate) : rawVal;

            setSummaryText(
                "sumDepositInCurrency",
                convertMode ? `${fmtMoneySep(depositInCurrency, 8)} ${payCur}` : "-"
            );

            setSummaryRowVisible("deposit-in-currency", convertMode);

            // ---- Min Deposit display ----
            const minHint = document.getElementById("minHint");
            const sumMinDepositEl = document.getElementById("sumMinDeposit");

            // method min (in pay currency, e.g. USDT in convert mode; MYR in normal mode)
            const methodMinPay = getMethodMinDeposit(channel, activeSource);
            const pkgMinBase = pkg.minAmt;

            // fallback: if method min missing, use package min (base currency)
            if (convertMode) {
                const minPay = (methodMinPay != null ? methodMinPay : (pkgMinBase / rate));
                const minMYR = minPay * rate;

                if (minPay) renderMinHint(minPay, payCur);
                else {
                    const minHintEl = document.getElementById("minHint");
                    if (minHintEl) minHintEl.innerHTML = "";
                }

                if (sumMinDepositEl) {
                    sumMinDepositEl.textContent = minPay ? `${fmtMoneySep(minMYR, 2)} ${pkgCur}` : "-";
                }
            } else {
                const minBase = (methodMinPay != null ? methodMinPay : pkgMinBase);

                if (minBase) renderMinHint(minBase, pkgCur);
                else {
                    const minHintEl = document.getElementById("minHint");
                    if (minHintEl) minHintEl.innerHTML = "";
                }

                if (sumMinDepositEl) {
                    sumMinDepositEl.textContent = minBase ? `${fmtMoneySep(minBase, 2)} ${pkgCur}` : "-";
                }
            }
            // ---- Max deposit (input currency constraint) ----
            // package max is in pkgCur. If convertMode, convert it to payCur for validation
            const pkgMaxBase = (pkg.maxAmt && Number.isFinite(pkg.maxAmt)) ? pkg.maxAmt : null; // pkgCur
            const methodMaxPay = getMethodMaxDeposit(channel, activeSource);

            const pkgMaxPay = (convertMode && pkgMaxBase != null) ? (pkgMaxBase / rate) : pkgMaxBase;

            let finalMaxPay = null;
            if (pkgMaxPay == null) finalMaxPay = methodMaxPay;
            else if (methodMaxPay == null) finalMaxPay = pkgMaxPay;
            else finalMaxPay = Math.min(pkgMaxPay, methodMaxPay);

            applyMaxToInputAndHint(finalMaxPay, payCur); // hint only (no input.max)

            // ---- compute finalMinPay (in pay currency) ----
            const pkgMinPay = (convertMode && pkgMinBase != null) ? (pkgMinBase / rate) : pkgMinBase;

            let finalMinPay = null;
            if (pkgMinPay == null) finalMinPay = methodMinPay;
            else if (methodMinPay == null) finalMinPay = pkgMinPay;
            else finalMinPay = Math.max(pkgMinPay, methodMinPay);

            // ---- read input (pay currency) ----
            let payAmount = parseFloat(unformatThousands(input.value) || "");
            if (!Number.isFinite(payAmount)) payAmount = 0;
            if (payAmount < 0) payAmount = 0;

            // ---- validate ----
            const hasAmount = payAmount > 0;
            const overMax = (finalMaxPay != null && hasAmount && payAmount > finalMaxPay);
            const underMin = (finalMinPay != null && hasAmount && payAmount < finalMinPay);

            // parent alert: only overMax (按你要求)
            const amountRow = input.closest(".amountRow");
            if (amountRow) amountRow.classList.toggle("alert-value", overMax);
            // ===== Hint highlight =====
            const minHintEl = document.getElementById("minHint");
            const maxHintEl = document.getElementById("maxHint");

            if (minHintEl) {
                minHintEl.classList.toggle("is-alert", underMin);
            }

            if (maxHintEl) {
                maxHintEl.classList.toggle("is-alert", overMax);
            }


            // submit enable: must be between min~max
            const withinMin = (finalMinPay == null) ? true : (payAmount >= finalMinPay);
            const withinMax = (finalMaxPay == null) ? true : (payAmount <= finalMaxPay);
            const isValidAmount = hasAmount && withinMin && withinMax;

            const submitBtn =
                document.querySelector("#submitBtn") ||
                document.querySelector(".submit");

            const submitWrap = document.getElementById("submitWrap");

            if (submitBtn) {
                submitBtn.disabled = !isValidAmount;
                submitBtn.classList.toggle("is-disabled", !isValidAmount);
                submitBtn.setAttribute("aria-disabled", String(!isValidAmount));
            }

            if (submitWrap) {
                let tip = "";

                if (!hasAmount) {
                    tip = "Please enter amount";
                } else if (underMin) {
                    tip = "Amount below minimum";
                } else if (overMax) {
                    tip = "Amount exceeds maximum";
                }

                if (tip) {
                    submitWrap.dataset.ttip = tip;
                } else {
                    delete submitWrap.dataset.ttip;
                }
            }
            // keep formatted display (no clamp)
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

        }

        mqMobile.addEventListener?.("change", () => {
            const ch = getActiveChannel();
            if (!ch) return;
            renderPayFrom(ch);
        });

        function clearPayFrom() {
            payFromGrid.innerHTML = "";
            if (sumFromEl) sumFromEl.textContent = "-";
            state.payFromId = null;
            state.payToId = null;
            state.payToMeta = null;
            renderPayToCard();
            renderCryptoInfoCard();
            syncBankSummaryVisibility();
            syncSelectBankingVisibility();
        }
        function getActivePayTo() {
            const channel = getActiveChannel();
            if (!channel || !Array.isArray(channel.payTo)) return null;
            return channel.payTo.find(x => x.id === state.payToId) || null;
        }

        function syncBankSummaryVisibility() {
            const payToInfoCard = document.getElementById("payToInfoCard");
            const cryptoInfoCard = document.getElementById("cryptoInfoCard");
            const payFromRow = document.querySelector('[data-summary-row="pay-from"]');

            const isBank = state.methodType === "bank";
            const isCrypto = state.methodType === "crypto";

            if (payToInfoCard) {
                payToInfoCard.hidden = !isBank;
            }

            if (cryptoInfoCard) {
                const source = getActiveCryptoSource();
                const hasAddress = !!String(source?.address || "").trim();
                cryptoInfoCard.hidden = !isCrypto || !hasAddress;
            }

            if (payFromRow) {
                payFromRow.hidden = isBank;
            }
        }
        const qrCropCache = new Map();
        let qrRenderJobId = 0;

        function loadImage(src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });
        }

        async function detectAndCropQr(src) {
            const img = await loadImage(src);
            console.log("[QR] loadImage:", src, img.naturalWidth, img.naturalHeight);

            const maxW = 1200;
            const scale = Math.min(1, maxW / img.naturalWidth);
            const w = Math.round(img.naturalWidth * scale);
            const h = Math.round(img.naturalHeight * scale);

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);

            function detectInRegion(sx, sy, sw, sh, label = "region") {
                const regionData = ctx.getImageData(sx, sy, sw, sh);

                const tries = [
                    regionData,
                    makeThresholdImageData(regionData, 160),
                    makeThresholdImageData(regionData, 120),
                ];

                for (const candidate of tries) {
                    const code = tryDetectQr(candidate, sw, sh);
                    if (code) {
                        console.log("[QR] detected in", label, { sx, sy, sw, sh });
                        return {
                            code,
                            offsetX: sx,
                            offsetY: sy,
                        };
                    }
                }

                return null;
            }

            // 1) full image
            let found = detectInRegion(0, 0, w, h, "full");

            // 2) big regions
            if (!found) {
                const regions = [
                    [0, 0, w, Math.floor(h * 0.55), "top"],
                    [0, Math.floor(h * 0.25), w, Math.floor(h * 0.5), "middle"],
                    [0, Math.floor(h * 0.45), w, h - Math.floor(h * 0.45), "bottom"],

                    [0, 0, Math.floor(w * 0.7), h, "left"],
                    [Math.floor(w * 0.3), 0, w - Math.floor(w * 0.3), h, "right"],

                    [
                        Math.floor(w * 0.1),
                        Math.floor(h * 0.1),
                        Math.floor(w * 0.8),
                        Math.floor(h * 0.8),
                        "center"
                    ],
                ];

                for (const [sx, sy, sw, sh, label] of regions) {
                    found = detectInRegion(sx, sy, sw, sh, label);
                    if (found) break;
                }
            }

            // 3) sliding window
            if (!found) {
                const stepX = Math.max(80, Math.floor(w * 0.18));
                const stepY = Math.max(80, Math.floor(h * 0.18));
                const winW = Math.max(220, Math.floor(w * 0.55));
                const winH = Math.max(220, Math.floor(h * 0.55));

                for (let sy = 0; sy <= h - 180; sy += stepY) {
                    for (let sx = 0; sx <= w - 180; sx += stepX) {
                        const sw = Math.min(winW, w - sx);
                        const sh = Math.min(winH, h - sy);

                        found = detectInRegion(sx, sy, sw, sh, "sliding");
                        if (found) break;
                    }
                    if (found) break;
                }
            }

            console.log("[QR] final detect:", found);

            if (!found) return null;

            const { code, offsetX, offsetY } = found;

            const pts = [
                code.location.topLeftCorner,
                code.location.topRightCorner,
                code.location.bottomRightCorner,
                code.location.bottomLeftCorner,
            ].map((p) => ({
                x: p.x + offsetX,
                y: p.y + offsetY,
            }));

            console.log("[QR] corners:", pts);

            const xs = pts.map((p) => p.x);
            const ys = pts.map((p) => p.y);

            let xMin = Math.floor(Math.min(...xs));
            let yMin = Math.floor(Math.min(...ys));
            let xMax = Math.ceil(Math.max(...xs));
            let yMax = Math.ceil(Math.max(...ys));

            const pad = Math.round(Math.max(xMax - xMin, yMax - yMin) * 0.12);
            xMin = Math.max(0, xMin - pad);
            yMin = Math.max(0, yMin - pad);
            xMax = Math.min(w, xMax + pad);
            yMax = Math.min(h, yMax + pad);

            const cropW = xMax - xMin;
            const cropH = yMax - yMin;

            console.log("[QR] crop rect:", { xMin, yMin, cropW, cropH });

            const out = document.createElement("canvas");
            const outCtx = out.getContext("2d");
            out.width = cropW;
            out.height = cropH;

            outCtx.drawImage(
                canvas,
                xMin, yMin, cropW, cropH,
                0, 0, cropW, cropH
            );

            return out.toDataURL("image/png");
        }

        function renderQrImg(qrEl, src, { clickable = true, alt = "QR Code" } = {}) {
            qrEl.innerHTML = `
        <img
            class="payToCard__qrImg ${clickable ? "is-clickable" : "is-static"}"
            src="${src}"
            alt="${alt}"
            loading="lazy"
            style="cursor:${clickable ? "pointer" : "default"};"
        >
    `;

            const img = qrEl.querySelector(".payToCard__qrImg");
            if (!img) return;

            if (!clickable) {
                img.style.pointerEvents = "none";
                return;
            }

            img.addEventListener("click", () => {
                window.openQrViewer?.(src);
            });
        }

        async function renderAutoCroppedQr(qrEl, meta) {
            if (!qrEl) return;

            const src = String(meta?.qrimage || "").trim();

            const qrWrap = document.getElementById("payToCardQrWrap");

            if (!src) {
                if (qrWrap) qrWrap.hidden = true;
                qrEl.innerHTML = "";
                qrEl.hidden = true;
                return;
            }

            qrEl.hidden = false;
            qrEl.innerHTML = `<div class="payToCard__qrLoading">Loading QR.</div>`;

            if (meta.qrCrop) {
                renderQrImg(qrEl, meta.qrCrop, { clickable: true, alt: "QR Code" });
                qrEl.hidden = false;
                return;
            }

            if (qrCropCache.has(src)) {
                const cached = qrCropCache.get(src);
                meta.qrCrop = cached;
                renderQrImg(qrEl, cached, { clickable: true, alt: "QR Code" });
                qrEl.hidden = false;
                return;
            }

            const jobId = ++qrRenderJobId;

            try {
                const cropped = await detectAndCropQr(src);

                if (jobId !== qrRenderJobId) return;

                if (cropped) {
                    qrCropCache.set(src, cropped);
                    meta.qrCrop = cropped;
                    renderQrImg(qrEl, cropped, { clickable: true, alt: "QR Code" });
                } else {
                    renderQrImg(qrEl, src, { clickable: true, alt: "QR Code" });
                }

                qrEl.hidden = false;
            } catch (err) {
                console.error("QR detect failed:", err);

                if (jobId !== qrRenderJobId) return;

                renderQrImg(qrEl, src, { clickable: true, alt: "QR Code" });
                qrEl.hidden = false;
            }
        }
        function renderPayToCard() {
            const payToInfoCard = document.getElementById("payToInfoCard");

            const bankEl = document.querySelector(".payToCard__bank");
            const nameEl = document.querySelector(".payToCard__name");
            const numberEl = document.querySelector(".payToCard__number");
            const qrWrap = document.getElementById("payToCardQrWrap");
            const qrEl = document.getElementById("payToCardQr");

            const activePayTo = getActivePayTo();
            const meta = state.payToMeta || activePayTo || null;
            const isBank = state.methodType === "bank";

            syncBankSummaryVisibility();

            if (!isBank || !meta) {
                if (bankEl) bankEl.innerHTML = "";
                if (nameEl) nameEl.textContent = "";
                if (numberEl) numberEl.textContent = "";
                if (qrEl) qrEl.innerHTML = "";
                if (payToInfoCard) payToInfoCard.hidden = true;
                return;
            }

            if (payToInfoCard) payToInfoCard.hidden = false;

            // bank
            if (bankEl) {
                const imgSrc = meta.image ? `image/${meta.image}` : "";
                bankEl.innerHTML = imgSrc
                    ? `
                <span class="payToCard__bankWrap">
                    <img src="${imgSrc}" alt="${meta.bank || ""}" loading="lazy">
                    <span>${meta.bank || ""}</span>
                </span>
            `
                    : `<span>${meta.bank || ""}</span>`;
            }

            // account name
            if (nameEl) {
                nameEl.textContent = meta.accountName || "";
            }

            // account number
            if (numberEl) {
                numberEl.textContent = meta.accountNumber || "";
            }

            // qr
            const hasQr = !!String(meta?.qrimage || "").trim();

            if (qrWrap) qrWrap.hidden = !hasQr;

            if (qrEl) {
                if (hasQr) {
                    qrEl.hidden = false;
                    renderAutoCroppedQr(qrEl, meta);
                } else {
                    qrEl.innerHTML = "";
                    qrEl.hidden = true;
                }
            }
        }
        function renderCryptoInfoCard() {
            const card = document.getElementById("cryptoInfoCard");
            //const networkEl = document.getElementById("cryptoNetwork");
            const valueEl = document.getElementById("cryptoAddressValue");
            const copyBtn = document.getElementById("cryptoCopyBtn");

            if (!card) return;

            const isCrypto = state.methodType === "crypto";
            const source = getActiveCryptoSource();

            const address = String(source?.address || "").trim();
            const network = String(source?.name || source?.id || "").trim();

            if (!isCrypto || !address) {
                card.hidden = true;

                //if (networkEl) networkEl.textContent = "";
                if (valueEl) valueEl.textContent = "";
                if (copyBtn) copyBtn.disabled = true;

                return;
            }

            card.hidden = false;

            //if (networkEl) networkEl.textContent = network;
            if (valueEl) valueEl.textContent = address;

            if (copyBtn) {
                copyBtn.disabled = false;
                copyBtn.onclick = async () => {
                    try {
                        await navigator.clipboard.writeText(address);
                    } catch (err) {
                        console.error("Copy failed:", err);
                    }
                };
            }
        }
        function renderPayFrom(channel) {
            if (!payFromGrid) return;

            const isBankTransfer = state.methodType === "bank";
            const list = isBankTransfer
                ? (Array.isArray(channel?.payTo) ? channel.payTo : []).filter(Boolean)
                : (Array.isArray(channel?.payFrom) ? channel.payFrom : []).filter(Boolean);

            const titleEl = payFromSection?.querySelector(".payFromSection__title");
            if (titleEl) {
                titleEl.textContent = isBankTransfer
                    ? "Select a Bank"
                    : (state.methodType === "crypto" ? "Select Network" : "Paying From");
            }

            payFromGrid.innerHTML = "";

            const hasList = list.length > 0;

            if (!hasList) {
                if (payFromSection) payFromSection.hidden = true;;
                state.payFromId = null;
                state.payToId = null;
                state.payToMeta = null;
                if (sumFromEl) sumFromEl.textContent = "-";
                renderPayToCard();
                renderCryptoInfoCard();
                syncBankSummaryVisibility();
                syncSelectBankingVisibility();
                recalcSummary();
                return;
            }

            if (payFromSection) payFromSection.hidden = false;;

            if (isMobileUI()) {
                payFromGrid.classList.add("payFromGrid--select");

                const firstSelectable = list.find(x => !x.maintenance) || null;
                const currentId = isBankTransfer ? state.payToId : state.payFromId;
                const current = list.find(p => p.id === currentId && !p.maintenance) || firstSelectable;

                if (current) {
                    if (isBankTransfer) {
                        state.payToId = current.id;
                        state.payToMeta = {
                            bank: current.bank,
                            image: current.image,
                            accountName: current.accountName,
                            accountNumber: current.accountNumber,
                            qrimage: current.qrimage,
                            qrCrop: current.qrCrop || null,
                            minDeposit: current.minDeposit,
                            maxDeposit: current.maxDeposit,
                            currency: current.currency
                        };
                        if (sumFromEl) sumFromEl.textContent = current.bank || current.id || "-";
                    } else {
                        state.payFromId = current.id;
                        if (sumFromEl) sumFromEl.textContent = current.name || current.id || "-";
                    }
                } else {
                    if (isBankTransfer) {
                        state.payToId = null;
                        state.payToMeta = null;
                    } else {
                        state.payFromId = null;
                    }
                    if (sumFromEl) sumFromEl.textContent = "-";
                }

                renderPayToCard();
                
                syncSelectBankingVisibility();

                const pickBtn = document.createElement("button");
                pickBtn.type = "button";
                pickBtn.className = "payFromPickBtn";
                pickBtn.innerHTML = `
    <span class="pf-label">
        ${current ? getPayItemHTML(current, isBankTransfer, channel) : `<span class="payOpt__title">Select</span>`}
    </span>
    <span aria-hidden="true">▾</span>
`;
                payFromGrid.appendChild(pickBtn);

                pickBtn.addEventListener("click", () => {
                    const items = list.map(x => {
                        const base = getListItemLabel(x, isBankTransfer);
                        return {
                            value: x.id,
                            label: x.maintenance ? `${base} (Maintenance)` : base,
                            html: getPayItemHTML(x, isBankTransfer, channel),
                            disabled: !!x.maintenance
                        };
                    });

                    const fallback = firstSelectable?.id || (items.find(x => !x.disabled)?.value) || "";

                    window.openpkgSheet?.({
                        title: isBankTransfer
                            ? "Select a Bank"
                            : (state.methodType === "crypto" ? "Select Network" : "Paying From"),
                        items,
                        value: isBankTransfer ? (state.payToId || fallback) : (state.payFromId || fallback),
                        triggerEl: pickBtn,
                        onDone: (v) => {
                            const picked = list.find(x => String(x.id) === String(v) && !x.maintenance) || firstSelectable || null;

                            if (isBankTransfer) {
                                state.payToId = picked?.id || null;
                                state.payToMeta = picked ? {
                                    bank: picked.bank,
                                    image: picked.image,
                                    accountName: picked.accountName,
                                    accountNumber: picked.accountNumber,
                                    qrimage: picked.qrimage,
                                    qrCrop: picked.qrCrop || null,
                                    minDeposit: picked.minDeposit,
                                    maxDeposit: picked.maxDeposit,
                                    currency: picked.currency
                                } : null;

                                if (sumFromEl) sumFromEl.textContent = picked?.bank || picked?.id || "-";
                            } else {
                                state.payFromId = picked?.id || null;
                                if (sumFromEl) sumFromEl.textContent = picked?.name || picked?.id || "-";
                            }

                            const label = pickBtn.querySelector(".pf-label");
                            if (label) {
                                label.innerHTML = picked
                                    ? getPayItemHTML(picked, isBankTransfer, channel)
                                    : `<span class="payOpt__title">Select</span>`;
                            }

                            renderPayToCard();
                            renderCryptoInfoCard();
                            syncBankSummaryVisibility();
                            syncSelectBankingVisibility();
                            recalcSummary();
                        }
                    });
                });

                recalcSummary();
                return;
            }

            payFromGrid.classList.remove("payFromGrid--select");

            const selected = renderDesktopDropdown({
                mount: payFromGrid,
                list,
                currentId: isBankTransfer ? state.payToId : state.payFromId,
                placeholder: isBankTransfer
                    ? "Select a Bank"
                    : (state.methodType === "crypto" ? "Select Network" : "Select Paying From"),
                getValue: (item) => item.id,
                getLabel: (item) => getListItemLabel(item, isBankTransfer),
                getLabelHTML: (item) => getPayItemHTML(item, isBankTransfer, channel),
                isDisabled: (item) => !!item.maintenance,
                onPick: (item) => {
                    if (isBankTransfer) {
                        state.payToId = item.id;
                        state.payToMeta = {
                            bank: item.bank,
                            image: item.image,
                            accountName: item.accountName,
                            accountNumber: item.accountNumber,
                            qrimage: item.qrimage,
                            qrCrop: item.qrCrop || null,
                            minDeposit: item.minDeposit,
                            maxDeposit: item.maxDeposit,
                            currency: item.currency
                        };
                        if (sumFromEl) sumFromEl.textContent = item.bank || item.id || "-";
                        renderPayToCard();
                    } else {
                        state.payFromId = item.id;
                        if (sumFromEl) sumFromEl.textContent = item.name || item.id || "-";
                    }
                    renderCryptoInfoCard();
                    syncBankSummaryVisibility();
                    syncSelectBankingVisibility();
                    recalcSummary();
                }
            });

            if (selected) {
                if (isBankTransfer) {
                    state.payToId = selected.id;
                    state.payToMeta = {
                        bank: selected.bank,
                        image: selected.image,
                        accountName: selected.accountName,
                        accountNumber: selected.accountNumber,
                        qrimage: selected.qrimage,
                        qrCrop: selected.qrCrop || null,
                        minDeposit: selected.minDeposit,
                        maxDeposit: selected.maxDeposit,
                        currency: selected.currency
                    };
                    if (sumFromEl) sumFromEl.textContent = selected.bank || selected.id || "-";
                    renderPayToCard();
                } else {
                    state.payFromId = selected.id;
                    if (sumFromEl) sumFromEl.textContent = selected.name || selected.id || "-";
                }
            } else {
                if (isBankTransfer) {
                    state.payToId = null;
                    state.payToMeta = null;
                } else {
                    state.payFromId = null;
                }
                if (sumFromEl) sumFromEl.textContent = "-";
                renderPayToCard();
            }


            renderCryptoInfoCard();
            syncBankSummaryVisibility();
            syncSelectBankingVisibility();
            recalcSummary();
        }
        function escapeHtml(str) {
            return String(str ?? "").replace(/[&<>"']/g, (m) => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[m]));
        }

        function getPayItemIcon(item, isBankTransfer, channel) {
            const raw = isBankTransfer
                ? (item?.image || item?.icon || "")
                : (item?.icon || channel?.icon || "");

            const file = String(raw || "").trim();
            if (!file) return "";

            if (/^(https?:|data:|\/)/i.test(file)) return file;
            if (file.startsWith("image/")) return file;
            if (file.startsWith("payment/")) return `image/${file}`;

            //return `image/payment/${file}`;
            return `image/payment/maybank.png`;
        }

        function getPayItemText(item, isBankTransfer) {
            if (!item) {
                return {
                    title: "Select",
                    subtitle: ""
                };
            }

            if (isBankTransfer) {
                return {
                    title: (item.bank || item.id || "").trim() || "-",
                    subtitle: (item.accountName || "").trim()
                };
            }

            return {
                title: (item.name || item.id || "").trim() || "-",
                subtitle: ""
            };
        }

        function getListItemLabel(item, isBankTransfer) {
            const t = getPayItemText(item, isBankTransfer);
            return t.subtitle ? `${t.title} - ${t.subtitle}` : t.title;
        }

        function getPayItemHTML(item, isBankTransfer, channel, opts = {}) {
            const icon = getPayItemIcon(item, isBankTransfer, channel);
            const { title, subtitle } = getPayItemText(item, isBankTransfer);

            const iconHtml = icon
                ? `<span class="payOpt__icon"><img src="${escapeHtml(icon)}" alt=""></span>`
                : "";

            if (isBankTransfer) {
                return `
            <span class="payOpt">
                ${iconHtml}
                <span class="payOpt__main">
                    <span class="payOpt__title">${escapeHtml(title)}</span>
                    <span>-</span>
                    <span class="payOpt__sub">${escapeHtml(subtitle || "")}</span>
                </span>
            </span>
        `;
            }

            return `
        <span class="payOpt">
            ${iconHtml}
            <span class="payOpt__main">
                <span class="payOpt__title">${escapeHtml(title)}</span>
            </span>
        </span>
    `;
        }
        function renderDesktopDropdown({
            mount,
            list = [],
            currentId = null,
            placeholder = "Select",
            getValue,
            getLabel,
            getLabelHTML,
            isDisabled,
            onPick,
        }) {
            if (!mount) return null;

            const firstSelectable = list.find(item => !isDisabled(item)) || null;
            const current =
                list.find(item => String(getValue(item)) === String(currentId) && !isDisabled(item)) ||
                firstSelectable ||
                null;

            mount.innerHTML = "";

            const root = document.createElement("div");
            root.className = "desktopDropdown";

            const trigger = document.createElement("button");
            trigger.type = "button";
            trigger.className = "desktopDropdown__trigger";

            const triggerLabel = document.createElement("span");
            triggerLabel.className = "desktopDropdown__label";
            if (current) {
                triggerLabel.innerHTML = getLabelHTML ? getLabelHTML(current) : escapeHtml(getLabel(current));
            } else {
                triggerLabel.textContent = placeholder;
            }

            const triggerArrow = document.createElement("span");
            triggerArrow.className = "desktopDropdown__arrow";
            triggerArrow.setAttribute("aria-hidden", "true");
            triggerArrow.textContent = "▾";

            trigger.appendChild(triggerLabel);
            trigger.appendChild(triggerArrow);

            const menu = document.createElement("div");
            menu.className = "desktopDropdown__menu";
            menu.hidden = true;

            list.forEach((item) => {
                const value = String(getValue(item));
                const disabled = !!isDisabled(item);

                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "desktopDropdown__item";
                btn.dataset.value = value;

                if (getLabelHTML) {
                    btn.innerHTML = getLabelHTML(item);
                } else {
                    btn.textContent = getLabel(item);
                }

                if (disabled) {
                    btn.disabled = true;
                    btn.classList.add("is-disabled");
                }

                if (current && String(getValue(current)) === value) {
                    btn.classList.add("is-active");
                }

                btn.addEventListener("click", () => {
                    if (disabled) return;

                    root.querySelectorAll(".desktopDropdown__item").forEach(el => {
                        el.classList.toggle("is-active", el === btn);
                    });

                    if (getLabelHTML) {
                        triggerLabel.innerHTML = getLabelHTML(item);
                    } else {
                        triggerLabel.textContent = getLabel(item);
                    }

                    menu.hidden = true;
                    root.classList.remove("is-open");

                    onPick?.(item);
                });

                menu.appendChild(btn);
            });

            trigger.addEventListener("click", (e) => {
                e.stopPropagation();
                const willOpen = menu.hidden;

                document.querySelectorAll(".desktopDropdown.is-open").forEach(el => {
                    el.classList.remove("is-open");
                    const m = el.querySelector(".desktopDropdown__menu");
                    if (m) m.hidden = true;
                });

                root.classList.toggle("is-open", willOpen);
                menu.hidden = !willOpen;
            });

            root.appendChild(trigger);
            root.appendChild(menu);
            mount.appendChild(root);

            return current;
        }
        function getMethodMaxDeposit(channel, payFrom) {
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

            input.removeAttribute("max");

            if (finalMax == null) {
                if (maxHint) maxHint.innerHTML = "";
            } else {
                renderMaxHint(finalMax, curLabel);
            }
        }

        function syncSummaryFrom(text) {
            if (sumFromEl) sumFromEl.textContent = text ?? "-";
        }
        function renderChannels(methodKey) {
            methodGrid.innerHTML = "";

            const list = METHOD_CHANNELS[methodKey] || [];
            const isBank = methodKey === "bank";

            if (!list.length) {
                methodGrid.innerHTML = "<div class='muted'>No channels</div>";
                clearPayFrom();
                state.channelId = null;
                state.payFromId = null;
                state.payToId = null;
                state.payToMeta = null;
                syncSummaryFrom("-");
                syncBankSummaryVisibility();
                //syncMethodSubHead();
                return;
            }

            const defaultChannel = list.find(ch => !ch?.maintenance) || list[0] || null;

            // bank transfer: hide method section entirely
            if (isBank) {
                const methodSection = methodGrid.closest(".methodSection");
                if (methodSection) methodSection.style.display = "none";

                state.channelId = defaultChannel?.id || null;
                state.payFromId = null;
                state.payToId = null;
                state.payToMeta = null;

                renderPayFrom(defaultChannel);
                syncBankSummaryVisibility();
                //syncMethodSubHead();
                return;
            }

            // non-bank: show method section
            const methodSection = methodGrid.closest(".methodSection");
            if (methodSection) methodSection.style.display = "";

            if (payFromSection) payFromSection.style.display = "";

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

                const img = document.createElement("img");
                img.loading = "lazy";
                img.alt = ch.name || ch.id || "";
                img.src = "image/payment/icon-vaderpay-m.png";
                iconSpan.appendChild(img);
                btn.appendChild(iconSpan);

                const nameSpan = document.createElement("span");
                nameSpan.className = "methodName";
                nameSpan.textContent = ch.name || ch.id;
                btn.appendChild(nameSpan);

                methodGrid.appendChild(btn);
            });

            if (defaultChannel) {
                const btn = methodGrid.querySelector(`.methodBtn[data-channel-id="${CSS.escape(defaultChannel.id)}"]`);
                if (btn) btn.classList.add("is-active");

                state.channelId = defaultChannel.id;
                state.payFromId = null;
                state.payToId = null;
                state.payToMeta = null;

                renderPayFrom(defaultChannel);
            } else {
                clearPayFrom();
                state.channelId = null;
                state.payFromId = null;
                state.payToId = null;
                state.payToMeta = null;
                syncSummaryFrom("-");
            }

            syncBankSummaryVisibility();
            //syncMethodSubHead();
        }
        function syncMethodSubHead() {
            const subHead = document.getElementById("methodSubHead");
            const subHeadTitle = document.getElementById("methodSubHeadTitle");

            const isBank = state.methodType === "bank";
            const show = !isMobileUI() && !isBank;

            if (subHead) subHead.hidden = !show;
            if (subHeadTitle) subHeadTitle.textContent = "Select";
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
                input.value = formatThousands(String(Math.trunc(next)), ",");
                recalcSummary();
            });
        });
        function initKeypad() {
            const keypad = document.querySelector("[data-keypad]");
            const input = document.getElementById("amount");
            const sheet = document.getElementById("amountEntrySheet");

            if (!input) return;

            const mqMobile = window.matchMedia("(max-width: 1023.98px)");
            const isMobileUI = () => mqMobile.matches;

            function closeAmountSheet() {
                if (!sheet) return;
                sheet.classList.remove("is-open");
                sheet.setAttribute("aria-hidden", "true");
                document.body.classList.remove("no-scroll");
            }

            function syncInputMode() {
                input.removeAttribute("readonly");
                input.setAttribute("autocomplete", "off");
                input.setAttribute("inputmode", "numeric");
                input.setAttribute("pattern", "[0-9]*");

                // 现在 mobile / desktop 都不再使用 amountEntrySheet
                closeAmountSheet();
            }

            function setValue(v) {
                v = unformatThousands(v);

                if (v === "") {
                    input.value = "";
                    recalcSummary?.();
                    return;
                }

                let num = parseInt(v, 10);
                if (!Number.isFinite(num)) num = 0;

                input.value = formatThousands(String(num), ",");
                recalcSummary?.();
            }

            function appendDigit(d) {
                const curRaw = unformatThousands(input.value || "");
                const next = curRaw === "" ? d : (curRaw + d);
                setValue(next);
            }

            function delOne() {
                const cur = unformatThousands(input.value || "");
                const next = cur.length <= 1 ? "" : cur.slice(0, -1);
                setValue(next);
            }

            function clearAll() {
                setValue("");
            }

            // 还保留 keypad 的话就继续支持 desktop / 现有 data-key
            keypad?.addEventListener("pointerdown", (e) => {
                const btn = e.target.closest("button[data-key]");
                if (!btn) return;

                e.preventDefault();
                e.stopPropagation();

                const key = btn.dataset.key;
                if (key === "del") delOne();
                else if (key === "clear") clearAll();
                else if (/^\d$/.test(key)) appendDigit(key);
            }, { passive: false });

            mqMobile.addEventListener?.("change", syncInputMode);

            syncInputMode();
        }
        initKeypad();

        tablist.addEventListener("click", (e) => {
            const tab = e.target.closest(".tab[data-method]");
            if (!tab) return;
            if (tab.classList.contains("is-disabled")) return;
            if (tab.classList.contains("is-active")) return;

            setTabActive(tab);
            state.methodType = tab.dataset.method;
            syncPaymentMainState();
            renderChannels(state.methodType);
            syncBankSummaryVisibility();
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

        // initial
        state.activePlaycard = playcards[0];
        applyTabsByPlaycard(state.activePlaycard);
        syncPaymentMainState();
        if (state.methodType) renderChannels(state.methodType);

        syncDepositByPlaycard(state.activePlaycard);
        renderPayToCard();
        renderCryptoInfoCard();
        syncBankSummaryVisibility();
        syncSelectBankingVisibility();
        recalcSummary();

        // ===== amount input events =====
        // ===== amount input events =====
        const amountInput = document.getElementById("amount");
        if (amountInput) {
            const sanitizeDigits = (s) => String(s || "").replace(/[^\d]/g, "");

            amountInput.autocomplete = "off";
            amountInput.autocapitalize = "off";
            amountInput.spellcheck = false;
            amountInput.removeAttribute("readonly");
            amountInput.setAttribute("inputmode", "numeric");
            amountInput.setAttribute("pattern", "[0-9]*");

            amountInput.addEventListener("input", () => {
                const raw = sanitizeDigits(amountInput.value);
                amountInput.value = raw ? formatThousands(raw, ",") : "";
                recalcSummary();
            });

            amountInput.addEventListener("blur", () => {
                recalcSummary();
            });
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
        // bindRailWheel();
        initQrViewer();

        // IMPORTANT: init payment UI after partials are in DOM
        initPaymentUI();
        initTooltipPortal();

        document.querySelectorAll("[data-scroll-x]").forEach(el => {
            // enableHorizontalWheelScroll(el);
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
    if (pkgOpt) {

        pkgOpt.addEventListener("change", function () {
            // desktop & mobile最终都走这里：mobile 是 sheet 点选后触发 change
            const url = this.value;
            if (!url) return;
            window.location.href = url;
        });
    }
});


/* =========================================================
   6) SHARED SELECT SHEET (re-use language CSS)
   - Uses existing HTML: #pkgSheet (class appSheet)
   - Desktop: popover under trigger (click item => pick & close)
   - Mobile: wheel + Done
========================================================= */
(function () {
    function onReady(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn, { once: true });
        } else {
            fn();
        }
    }

    onReady(() => {
        const sheet = document.getElementById("pkgSheet");
        if (!sheet) return;

        const panel = sheet.querySelector(".appSheet__panel");
        const titleEl = sheet.querySelector("[data-sheet-title]");
        const listEl = sheet.querySelector("[data-sheet-list]");
        const doneBtn = sheet.querySelector("[data-sheet-done]");
        const closeBtns = sheet.querySelectorAll("[data-sheet-close]");
        const wheel = sheet.querySelector("[data-sheet-wheel]");

        const MQ_MOBILE = window.matchMedia("(max-width: 1023.98px)");
        const isMobile = () => MQ_MOBILE.matches;

        let items = [];            // [{value,label,disabled}]
        let value = "";
        let confirmedValue = "";
        let onDone = null;
        let triggerEl = null;
        let isProgrammaticScroll = false;
        function open() {
            sheet.classList.add("isOpen");
            sheet.setAttribute("aria-hidden", "false");

            if (isMobile()) {
                //document.body.classList.add("no-scroll");
                if (doneBtn) doneBtn.hidden = isMobile();
                // align to current value
                requestAnimationFrame(() => {
                    setActiveInList(value);
                    syncDoneState();
                    scrollToValue(value, false);
                });
                setTimeout(() => wheel?.focus(), 30);
                return;
            }

            // desktop popover position under trigger
            //document.body.classList.remove("no-scroll");
            if (doneBtn) doneBtn.hidden = false;
            if (triggerEl) {
                const r = triggerEl.getBoundingClientRect();
                sheet.style.left = `${r.left + window.scrollX}px`;
                sheet.style.top = `${r.bottom + window.scrollY + 8}px`;

                requestAnimationFrame(() => {
                    const rect = panel?.getBoundingClientRect?.() || sheet.getBoundingClientRect();
                    const overflowX = rect.right - window.innerWidth;
                    if (overflowX > 0) {
                        sheet.style.left = `${(r.left + window.scrollX) - overflowX - 8}px`;
                    }
                });
            }
        }

        function close() {
            sheet.classList.remove("isOpen");
            sheet.setAttribute("aria-hidden", "true");
            document.body.classList.remove("no-scroll");

            // ✅ closing via outside/close button should NOT change selection
            value = String(confirmedValue ?? value);
            setActiveInList(value);
            syncDoneState();
        }

        function render() {
            if (!listEl) return;
            listEl.innerHTML = "";

            items.forEach((it) => {
                const div = document.createElement("div");
                div.className = "wheel__item";
                div.dataset.value = String(it.value);

                if (it.html) {
                    div.innerHTML = it.html;
                } else {
                    div.textContent = String(it.label ?? it.value);
                }

                if (it.disabled) div.classList.add("is-disabled");
                if (String(it.value) === String(value)) div.classList.add("isActive");

                listEl.appendChild(div);
            });
        }

        function setActiveInList(v) {
            value = String(v ?? "");
            listEl?.querySelectorAll?.(".wheel__item").forEach((el) => {
                el.classList.toggle("isActive", String(el.dataset.value) === value);
            });
        }

        function scrollToValue(v, smooth = true) {
            if (!listEl) return;

            const el = listEl.querySelector(`.wheel__item[data-value="${CSS.escape(String(v))}"]`);
            if (!el) return;

            const itemTop = el.offsetTop;
            const itemBottom = itemTop + el.offsetHeight;
            const viewTop = listEl.scrollTop;
            const viewBottom = viewTop + listEl.clientHeight;

            let top = viewTop;

            if (itemTop < viewTop) {
                top = itemTop;
            } else if (itemBottom > viewBottom) {
                top = itemBottom - listEl.clientHeight;
            } else {
                // 已经在可视范围内，就不要动
                setActiveInList(v);
                syncDoneState();
                return;
            }

            isProgrammaticScroll = true;
            listEl.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });

            clearTimeout(window.__pkgSheetScrollLock);
            window.__pkgSheetScrollLock = setTimeout(() => {
                isProgrammaticScroll = false;
                setActiveInList(v);
                syncDoneState();
            }, smooth ? 260 : 80);
        }


        function syncDoneState() {
            if (!doneBtn) return;
            const meta = items.find(x => String(x.value) === String(value));
            const disabled = !!meta?.disabled;
            doneBtn.disabled = disabled;
            doneBtn.setAttribute("aria-disabled", disabled ? "true" : "false");
        }

        // public API
        window.openpkgSheet = function (opts) {
            triggerEl = opts?.triggerEl || null;
            items = Array.isArray(opts?.items) ? opts.items : [];
            value = String(opts?.value ?? items.find(x => !x.disabled)?.value ?? items[0]?.value ?? "");
            confirmedValue = value; // ✅ only Done / desktop click will update this
            onDone = typeof opts?.onDone === "function" ? opts.onDone : null;

            if (titleEl) titleEl.textContent = String(opts?.title || "Select");
            render();
            setActiveInList(value);
            syncDoneState();

            open();
        };

        // click item
        listEl?.addEventListener("click", (e) => {
            const item = e.target.closest(".wheel__item");
            if (!item) return;
            if (item.classList.contains("is-disabled")) return;

            const v = item.dataset.value;
            setActiveInList(v);
            syncDoneState();

            // desktop 维持原本行为
            if (!isMobile()) {
                scrollToValue(v, true);
                return;
            }

            // mobile: 点了就直接提交，不再等 Done
            confirmedValue = String(v);
            onDone?.(v);
            close();
        });

        doneBtn?.addEventListener("click", () => {
            if (!isMobile()) return;

            const meta = items.find(x => String(x.value) === String(value));
            if (meta?.disabled) return; // button should already be disabled, but keep safe

            confirmedValue = String(value);
            onDone?.(value);
            close();
        });

        closeBtns?.forEach(btn => btn.addEventListener("click", close));

        // click outside close (desktop)
        document.addEventListener("click", (e) => {
            if (isMobile()) return;
            if (!sheet.classList.contains("isOpen")) return;
            const inside = sheet.contains(e.target);
            const onTrigger = triggerEl && triggerEl.contains(e.target);
            if (!inside && !onTrigger) close();
        }, true);

        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && sheet.classList.contains("isOpen")) close();
        });

        MQ_MOBILE.addEventListener?.("change", () => close());

        /* =========================================================
           7) PACKAGE -> pkgSheet (same look as language)
        ========================================================= */
        (function wirePkg() {
            const root = document.getElementById("pkgSelect");
            if (!root) return;

            const select = root.querySelector("#pkgOpt");
            const btn = root.querySelector("[data-pkg-trigger]");
            const txt = root.querySelector("[data-pkg-text]");
            if (!select || !btn || !txt) return;

            function syncBtnText() {
                txt.textContent = select.selectedOptions?.[0]?.textContent || "Select";
            }
            syncBtnText();

            btn.addEventListener("click", () => {
                if (!isMobile()) {
                    // 方案 A1：用原生 select（如果你的 CSS 没把它 display:none）
                    // select.focus();
                    // select.click();

                    // 方案 A2：用你原本的 desktop menu（你 HTML 里本来就有）
                    const menu = root.querySelector("[data-pkg-menu]");
                    if (menu) {
                        menu.hidden ? openMenuFromSelect(select, menu) : (menu.hidden = true);
                    }
                    return;
                }

                // mobile 才打开 wheel sheet
                const items = Array.from(select.options).map(o => ({
                    value: o.value,
                    label: o.textContent || o.value,
                    disabled: !!o.disabled
                }));

                window.openpkgSheet?.({
                    title: "Promotion",
                    items,
                    value: select.value,
                    triggerEl: btn,
                    onDone: (v) => {
                        select.value = v;
                        select.dispatchEvent(new Event("change", { bubbles: true }));
                        syncBtnText();
                    }
                });
            });
            // keep text synced when external code changes #pkgOpt
            select.addEventListener("change", syncBtnText);
        })();
    });
})();

