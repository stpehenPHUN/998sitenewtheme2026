document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'demo_withdraw_methods_v4';
    const SUMMARY_TARGET = 1000;
    const SUMMARY_ROLLOVER = 1530;

    const BANK_OPTIONS = [
        { code: 'maybank', label: 'Maybank (MBB)', icon: 'image/payment/maybank.png' },
        { code: 'cimb', label: 'CIMB Bank', icon: 'image/payment/maybank.png' },
        { code: 'rhb', label: 'RHB Bank', icon: 'image/payment/maybank.png' },
        { code: 'public_bank', label: 'Public Bank', icon: 'image/payment/maybank.png' },
        { code: 'hong_leong', label: 'Hong Leong Bank', icon: 'image/payment/maybank.png' },
        { code: 'bank_islam', label: 'Bank Islam', icon: 'image/payment/maybank.png' },
        { code: 'bsn', label: 'Bank Simpanan Nasional', icon: 'image/payment/maybank.png' },
        { code: 'ambank', label: 'AmBank', icon: 'image/payment/maybank.png' },
        { code: 'ocbc', label: 'OCBC Bank', icon: 'image/payment/maybank.png' },
        { code: 'uob', label: 'UOB Bank', icon: 'image/payment/maybank.png' },
        { code: 'app_internal', label: 'App Internal Bank', icon: 'image/payment/maybank.png' }
    ];

    const EWALLET_OPTIONS = [
        { key: 'tng', label: "Touch 'n Go", icon: 'image/payment/maybank.png' },
        { key: 'shopeepay', label: 'Shopee Pay', icon: 'image/payment/maybank.png' },
        { key: 'boost', label: 'Boost', icon: 'image/payment/maybank.png' },
        { key: 'bigpay', label: 'BigPay', icon: 'image/payment/maybank.png' }
    ];

    const CRYPTO_OPTIONS = [
        { key: 'usdt_trc20', label: 'USDT', network: 'TRC20', icon: 'image/payment/maybank.png' },
        { key: 'usdt_erc20', label: 'USDT', network: 'ERC20', icon: 'image/payment/maybank.png' },
        { key: 'btc_btc', label: 'BTC', network: 'BTC', icon: 'image/payment/maybank.png' },
        { key: 'eth_erc20', label: 'ETH', network: 'ERC20', icon: 'image/payment/maybank.png' }
    ];

    const BANK_ICON_MAP = Object.fromEntries(BANK_OPTIONS.map((b) => [b.code, b.icon]));
    const BANK_LABEL_MAP = Object.fromEntries(BANK_OPTIONS.map((b) => [b.code, b.label]));
    const EWALLET_LABEL_MAP = Object.fromEntries(EWALLET_OPTIONS.map((w) => [w.key, w.label]));
    const EWALLET_ICON_MAP = Object.fromEntries(EWALLET_OPTIONS.map((w) => [w.key, w.icon]));
    const CRYPTO_META_MAP = Object.fromEntries(CRYPTO_OPTIONS.map((c) => [c.key, c]));

    const DEFAULT_STORE = {
        bankAccounts: [
            { id: 'bank_001', bankCode: 'maybank', bankName: 'Maybank (MBB)', accountName: 'player Testing', accountNumber: '112233445566', branchName: 'KL Main' },
            { id: 'bank_002', bankCode: 'bsn', bankName: 'Bank Simpanan Nasional', accountName: 'Player ABC', accountNumber: '223344556699', branchName: 'PJ' }
        ],
        appBankAccount: {
            id: 'app_bank_001', bankCode: 'app_internal', bankName: 'App Bank Route', accountName: 'Name Lious', accountNumber: '900123456789', branchName: 'Internal Settlement'
        },
        ewalletAccounts: {
            tng: { type: 'tng', label: "Touch 'n Go", accountNumber: '0123456789', icon: EWALLET_ICON_MAP.tng },
            shopeepay: { type: 'shopeepay', label: 'Shopee Pay', accountNumber: '0123555589', icon: EWALLET_ICON_MAP.shopeepay },
            boost: { type: 'boost', label: 'Boost', accountNumber: '0187655589', icon: EWALLET_ICON_MAP.boost },
            bigpay: { type: 'bigpay', label: 'BigPay', accountNumber: '0192005589', icon: EWALLET_ICON_MAP.bigpay }
        },
        cryptoAccounts: {
            usdt_trc20: { key: 'usdt_trc20', label: 'USDT', network: 'TRC20', address: 'TRX9ExampleWalletAddress123456', icon: CRYPTO_META_MAP.usdt_trc20.icon }
        },
        preferences: {
            preferredType: 'bank',
            selectedType: 'bank',
            selectedBankId: 'bank_001',
            selectedAppBankId: null,
            selectedEwalletType: null,
            selectedCryptoKey: null
        }
    };

    const els = {
        tabs: [...document.querySelectorAll('[data-wd-type]')],
        sections: [...document.querySelectorAll('.withdrawSection[data-section]')],
        savedBankList: document.getElementById('savedBankList'),
        appBankSlot: document.getElementById('appBankSlot'),
        ewalletList: document.getElementById('ewalletList'),
        cryptoList: document.getElementById('cryptoList'),

        bankEditorMount: document.getElementById('bankEditorMount'),
        appBankEditorMount: document.getElementById('appBankEditorMount'),
        ewalletEditorMount: document.getElementById('ewalletEditorMount'),
        cryptoEditorMount: document.getElementById('cryptoEditorMount'),

        withdrawSheet: document.getElementById('withdrawSheet'),
        withdrawSheetBody: document.getElementById('withdrawSheetBody'),

        amountInput: document.getElementById('amount'),
        quickButtons: [...document.querySelectorAll('.qBtn[data-add]')],
        submitBtn: document.getElementById('submitBtn'),
        summary: {
            iconWrap: document.getElementById('sumWithdrawBankIcon'),
            iconImg: document.getElementById('sumWithdrawBankImg'),
            to: document.getElementById('sumWithdrawTo'),
            account: document.getElementById('sumWithdrawAccount'),
            amount: document.getElementById('sumWithdrawAmount'),
            target: document.getElementById('sumTarget'),
            rollover: document.getElementById('sumRollover'),
            formula: document.getElementById('sumRolloverFormula'),
            total: document.getElementById('sumTotal')
        }
    };
    const editorState = {
        open: false,
        mode: 'add',
        type: 'bank',
        editingId: null,
        optionKey: null,
        mountKey: null,
        mobile: false
    };
    const sheetState = {
        view: null
    };
    function isEditorOpenFor(type) {
        return editorState.open && editorState.mountKey === type && !editorState.mobile;
    }

    function syncMethodAreaVisibility() {
        ['bank', 'app_bank', 'ewallet', 'crypto'].forEach((type) => {
            const list = getListByType(type);
            const mount = getMountByType(type);

            if (!list || !mount) return;

            const active = isEditorOpenFor(type);
            list.classList.toggle('withdrawList--hidden', active);
            mount.hidden = !active;

            if (!active) {
                mount.innerHTML = '';
            }
        });
    }
    function cloneDefault() {
        return typeof structuredClone === 'function'
            ? structuredClone(DEFAULT_STORE)
            : JSON.parse(JSON.stringify(DEFAULT_STORE));
    }

    function hydrateStore(parsed) {
        const fallback = cloneDefault();
        return {
            ...fallback,
            ...parsed,
            bankAccounts: Array.isArray(parsed?.bankAccounts) ? parsed.bankAccounts : fallback.bankAccounts,
            appBankAccount: parsed?.appBankAccount ?? fallback.appBankAccount,
            ewalletAccounts: parsed?.ewalletAccounts || fallback.ewalletAccounts,
            cryptoAccounts: parsed?.cryptoAccounts || fallback.cryptoAccounts,
            preferences: {
                ...fallback.preferences,
                ...(parsed?.preferences || {})
            }
        };
    }

    function loadStore() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                const seed = cloneDefault();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
                return seed;
            }
            return hydrateStore(JSON.parse(raw));
        } catch {
            const seed = cloneDefault();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
            return seed;
        }
    }

    let store = loadStore();

    function saveStore() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
    function isMobileEditorMode() {
        return window.matchMedia('(max-width: 767.98px)').matches;
    }

    function buildEditorShell(title, desc, innerHtml) {
        return `
        <section class="withdrawEditor withdrawEditor--inline" id="withdrawEditor">
            <div class="sectionHead">
             <button type="button" data-action="cancel-editor"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M15.5 19.5 8 12l7.5-7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg></button>
                <h5 id="withdrawEditorTitle">${esc(title)}</h5>
            </div>

            <p class="withdrawEditor__desc">${esc(desc)}</p>

            <div id="withdrawEditorHost">
                ${innerHtml}
            </div>
        </section>
    `;
    }
    function getMountByType(type) {
        if (type === 'bank') return els.bankEditorMount;
        if (type === 'app_bank') return els.appBankEditorMount;
        if (type === 'ewallet') return els.ewalletEditorMount;
        if (type === 'crypto') return els.cryptoEditorMount;
        return null;
    }

    function getListByType(type) {
        if (type === 'bank') return els.savedBankList?.closest('.banklist') || els.savedBankList;
        if (type === 'app_bank') return els.appBankSlot;
        if (type === 'ewallet') return els.ewalletList;
        if (type === 'crypto') return els.cryptoList;
        return null;
    }

    function lockMethodArea(type) {
        editorState.mountKey = type;
        syncMethodAreaVisibility();
    }

    function unlockMethodArea(type) {
        if (editorState.mountKey === type) {
            editorState.mountKey = null;
        }
        syncMethodAreaVisibility();
    }
    function openWithdrawSheet(html) {
        if (!els.withdrawSheet || !els.withdrawSheetBody) return;

        els.withdrawSheetBody.innerHTML = html;
        els.withdrawSheet.hidden = false;

        requestAnimationFrame(() => {
            els.withdrawSheet.classList.add('isOpen');
        });

        document.body.classList.add('is-withdraw-sheet-open');
    }

    function closeWithdrawSheet() {
        if (!els.withdrawSheet || !els.withdrawSheetBody) return;

        els.withdrawSheet.classList.remove('isOpen');
        document.body.classList.remove('is-withdraw-sheet-open');

        const panel = els.withdrawSheet.querySelector('.withdrawSheet__panel');
        const onDone = () => {
            els.withdrawSheet.hidden = true;
            els.withdrawSheetBody.innerHTML = '';
            panel?.removeEventListener('transitionend', onDone);
        };

        if (panel) {
            panel.addEventListener('transitionend', onDone, { once: true });
        } else {
            els.withdrawSheet.hidden = true;
            els.withdrawSheetBody.innerHTML = '';
        }
    }
    function renderEditorIntoPlace({ type, title, desc, formHtml }) {
        const shell = buildEditorShell(title, desc, formHtml);
        const mobile = isMobileEditorMode();

        editorState.mobile = mobile;

        if (mobile) {
            editorState.mountKey = type;
            openWithdrawSheet(shell);
            const form = els.withdrawSheetBody?.querySelector('#withdrawDynamicForm');
            if (form?.dataset.editorType === 'bank') {
                initWithdrawBankDropdown(form, false);
            }
        } else {
            const mount = getMountByType(type);
            if (!mount) return;

            lockMethodArea(type);
            mount.innerHTML = shell;
            const form = mount.querySelector('#withdrawDynamicForm');
            if (form?.dataset.editorType === 'bank') {
                initWithdrawBankDropdown(form, false);
            }
            syncMethodAreaVisibility();
        }
    }
    function esc(v) {
        return String(v ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function money(n) {
        return `MYR ${Number(n || 0).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function getBankIconPath(bankCode) {
        return BANK_ICON_MAP[bankCode] || 'image/payment/maybank.png';
    }

    function getBankLabel(bankCode, fallback = '') {
        return BANK_LABEL_MAP[bankCode] || fallback || 'Bank';
    }

    function getEwalletIconPath(type) {
        return EWALLET_ICON_MAP[type] || 'image/payment/maybank.png';
    }

    function getCryptoIconPath(key) {
        return CRYPTO_META_MAP[key]?.icon || 'image/payment/maybank.png';
    }

    function maskAccountNumber(value) {
        const raw = String(value || '').replace(/\s+/g, '');
        if (!raw) return '-';
        if (raw.length <= 4) return raw;
        return `${'x'.repeat(Math.max(0, raw.length - 4))}${raw.slice(-4)}`;
    }

    function maskAddress(value) {
        const raw = String(value || '').trim();
        if (!raw) return '-';
        if (raw.length <= 12) return raw;
        return `${raw.slice(0, 6)}...${raw.slice(-6)}`;
    }

    function amountValue() {
        const raw = String(els.amountInput?.value || '').replace(/[^\d]/g, '');
        return raw ? parseInt(raw, 10) : 0;
    }

    function setAmount(n) {
        if (!els.amountInput) return;
        const safe = Math.max(0, Number(n) || 0);
        els.amountInput.value = safe ? safe.toLocaleString('en-MY') : '';
        renderSummary();
        syncSubmitState();
    }
    function getWithdrawBankOptionHTML(opt) {
        const icon = getBankIconPath(opt.code);
        const label = opt.label || getBankLabel(opt.code);

        return `
        <span class="payOpt">
            <span class="payOpt__icon">
                <img src="${esc(icon)}" alt="${esc(label)}">
            </span>
            <span class="payOpt__main">
                <span class="payOpt__title">${esc(label)}</span>
            </span>
        </span>
    `;
    }

    function initWithdrawBankDropdown(form, isAppBank = false, model = null) {
        if (!form) return;

        const mount = form.querySelector('[data-bank-dropdown]');
        const hidden = form.querySelector('input[name="bankCode"]');
        if (!mount || !hidden) return;

        const list = BANK_OPTIONS.filter((opt) =>
            isAppBank ? opt.code === 'app_internal' : opt.code !== 'app_internal'
        );

        const selected = renderDesktopDropdown({
            mount,
            list,
            currentId: hidden.value || model?.bankCode || '',
            placeholder: 'Select Bank',
            getValue: (item) => item.code,
            getLabel: (item) => item.label,
            getLabelHTML: (item) => getWithdrawBankOptionHTML(item),
            isDisabled: () => false,
            onPick: (item) => {
                hidden.value = item.code;
            }
        });

        if (selected) {
            hidden.value = selected.code;
        }
    }
    function renderDesktopDropdown({
        mount,
        list = [],
        currentId = null,
        placeholder = 'Select',
        getValue,
        getLabel,
        getLabelHTML,
        isDisabled = () => false,
        onPick,
    }) {
        if (!mount) return null;

        const firstSelectable = list.find((item) => !isDisabled(item)) || null;
        const current =
            list.find((item) => String(getValue(item)) === String(currentId) && !isDisabled(item)) ||
            firstSelectable ||
            null;

        mount.innerHTML = '';

        const root = document.createElement('div');
        root.className = 'desktopDropdown';

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'desktopDropdown__trigger';
        trigger.setAttribute('aria-expanded', 'false');

        const triggerLabel = document.createElement('span');
        triggerLabel.className = 'desktopDropdown__label';
        if (current) {
            triggerLabel.innerHTML = getLabelHTML ? getLabelHTML(current) : esc(getLabel(current));
        } else {
            triggerLabel.textContent = placeholder;
        }

        const triggerArrow = document.createElement('span');
        triggerArrow.className = 'desktopDropdown__arrow';
        triggerArrow.setAttribute('aria-hidden', 'true');
        triggerArrow.textContent = '▾';

        trigger.appendChild(triggerLabel);
        trigger.appendChild(triggerArrow);

        const menu = document.createElement('div');
        menu.className = 'desktopDropdown__menu';
        menu.hidden = true;

        const closeMenu = () => {
            root.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
            menu.hidden = true;
        };

        const openMenu = () => {
            root.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
            menu.hidden = false;
        };

        list.forEach((item) => {
            const value = getValue(item);
            const disabled = !!isDisabled(item);
            const option = document.createElement('button');
            option.type = 'button';
            option.className = 'desktopDropdown__option';
            option.dataset.value = String(value);
            option.innerHTML = getLabelHTML ? getLabelHTML(item) : esc(getLabel(item));
            option.disabled = disabled;

            if (current && String(getValue(current)) === String(value)) {
                option.classList.add('is-active');
            }

            option.addEventListener('click', () => {
                if (disabled) return;
                triggerLabel.innerHTML = getLabelHTML ? getLabelHTML(item) : esc(getLabel(item));
                menu.querySelectorAll('.desktopDropdown__option').forEach((el) => {
                    el.classList.toggle('is-active', el === option);
                });
                onPick?.(item);
                closeMenu();
            });

            menu.appendChild(option);
        });

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (menu.hidden) openMenu();
            else closeMenu();
        });

        document.addEventListener('click', (e) => {
            if (!root.contains(e.target)) closeMenu();
        });

        root.appendChild(trigger);
        root.appendChild(menu);
        mount.appendChild(root);

        return current;
    }
    function updateBankSelectIcon(selectEl) {
        const iconWrap = document.getElementById('bankSelectIcon');
        const img = iconWrap?.querySelector('img');
        if (!iconWrap || !img) return;

        const bankCode = selectEl.value;
        const icon = getBankIconPath(bankCode);

        if (!bankCode) {
            iconWrap.hidden = true;
            img.removeAttribute('src');
            img.alt = '';
            return;
        }

        iconWrap.hidden = false;
        img.src = icon;
        img.alt = getBankLabel(bankCode);
    }

    function toolIcon(type) {
        if (type === 'edit') {
            return `
            <svg class="icon" viewBox="0 0 633.3 633.4" aria-hidden="true">
                <path
                    fill="none"
                    stroke="#FFFFFF"
                    stroke-width="66.6667"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-miterlimit="133.3333"
                    d="M449.2,113.6l70.6,70.6 M494.5,51.4L303.6,242.3c-9.8,9.9-16.6,22.4-19.3,36.1l-17.7,88.3l88.3-17.7
                    c13.7-2.7,26.2-9.5,36.1-19.3l190.9-190.9c24.1-24.1,24.1-63.2,0-87.4S518.7,27.3,494.5,51.4z"
                />
                <path
                    fill="none"
                    stroke="#FFFFFF"
                    stroke-width="66.6667"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-miterlimit="133.3333"
                    d="M533.3,433.3v100c0,36.8-29.8,66.7-66.7,66.7H100c-36.8,0-66.7-29.8-66.7-66.7V166.6
                    c0-36.8,29.8-66.7,66.7-66.7h100"
                />
            </svg>
        `;
        }

        return `
        <svg class="icon" viewBox="0 0 186 186" aria-hidden="true">
            <path
                fill="#FFFFFF"
                d="M8,139.2l46.1-46.1L8,46.9C-2.7,36.2-2.7,18.7,8,8l0,0C18.7-2.7,36.2-2.7,46.9,8L93,54.1L139.1,8
                C149.8-2.7,167.3-2.7,178,8l0,0c10.7,10.7,10.7,28.2,0,38.9L131.9,93l46.1,46.1c10.7,10.7,10.7,28.2,0,38.9l0,0
                c-10.7,10.7-28.2,10.7-38.9,0L93,131.9L46.9,178c-10.7,10.7-28.2,10.7-38.9,0l0,0C-2.7,167.3-2.7,149.9,8,139.2z"
            />
        </svg>
    `;
    }

    function currentSelection() {
        const p = store.preferences || {};

        if (p.selectedType === 'bank' && p.selectedBankId) {
            const acc = (store.bankAccounts || []).find((item) => item.id === p.selectedBankId);
            if (acc) {
                return {
                    type: 'bank',
                    label: acc.bankName || getBankLabel(acc.bankCode),
                    account: maskAccountNumber(acc.accountNumber),
                    icon: getBankIconPath(acc.bankCode),
                    network: '',
                    raw: acc
                };
            }
        }

        if (p.selectedType === 'app_bank' && p.selectedAppBankId && store.appBankAccount?.id === p.selectedAppBankId) {
            const acc = store.appBankAccount;
            return {
                type: 'app_bank',
                label: acc.bankName || getBankLabel(acc.bankCode || 'app_internal', 'App Bank Route'),
                account: acc.accountName || '-',
                icon: getBankIconPath(acc.bankCode || 'app_internal'),
                network: '',
                raw: acc
            };
        }

        if (p.selectedType === 'ewallet' && p.selectedEwalletType) {
            const acc = store.ewalletAccounts?.[p.selectedEwalletType];
            if (acc) {
                return {
                    type: 'ewallet',
                    label: acc.label || EWALLET_LABEL_MAP[p.selectedEwalletType] || 'E-wallet',
                    account: maskAccountNumber(acc.accountNumber),
                    icon: acc.icon || getEwalletIconPath(p.selectedEwalletType),
                    network: '',
                    raw: acc
                };
            }
        }

        if (p.selectedType === 'crypto' && p.selectedCryptoKey) {
            const acc = store.cryptoAccounts?.[p.selectedCryptoKey];
            if (acc) {
                return {
                    type: 'crypto',
                    label: acc.label || CRYPTO_META_MAP[p.selectedCryptoKey]?.label || 'Crypto',
                    account: maskAddress(acc.address),
                    icon: acc.icon || getCryptoIconPath(p.selectedCryptoKey),
                    network: acc.network || CRYPTO_META_MAP[p.selectedCryptoKey]?.network || '',
                    raw: acc
                };
            }
        }

        return null;
    }

    function ensureValidSelection() {
        const p = store.preferences;
        const hasSelectedBank = p.selectedBankId && store.bankAccounts.some((x) => x.id === p.selectedBankId);
        const hasSelectedApp = p.selectedAppBankId && store.appBankAccount?.id === p.selectedAppBankId;
        const hasSelectedEwallet = p.selectedEwalletType && !!store.ewalletAccounts?.[p.selectedEwalletType];
        const hasSelectedCrypto = p.selectedCryptoKey && !!store.cryptoAccounts?.[p.selectedCryptoKey];

        if (p.selectedType === 'bank' && hasSelectedBank) return;
        if (p.selectedType === 'app_bank' && hasSelectedApp) return;
        if (p.selectedType === 'ewallet' && hasSelectedEwallet) return;
        if (p.selectedType === 'crypto' && hasSelectedCrypto) return;

        if (store.bankAccounts.length) {
            p.selectedType = 'bank';
            p.selectedBankId = store.bankAccounts[0].id;
            p.selectedAppBankId = null;
            p.selectedEwalletType = null;
            p.selectedCryptoKey = null;
            return;
        }
        if (store.appBankAccount) {
            p.selectedType = 'app_bank';
            p.selectedAppBankId = store.appBankAccount.id;
            p.selectedBankId = null;
            p.selectedEwalletType = null;
            p.selectedCryptoKey = null;
            return;
        }
        const firstWallet = Object.keys(store.ewalletAccounts || {})[0];
        if (firstWallet) {
            p.selectedType = 'ewallet';
            p.selectedEwalletType = firstWallet;
            p.selectedBankId = null;
            p.selectedAppBankId = null;
            p.selectedCryptoKey = null;
            return;
        }
        const firstCrypto = Object.keys(store.cryptoAccounts || {})[0];
        if (firstCrypto) {
            p.selectedType = 'crypto';
            p.selectedCryptoKey = firstCrypto;
            p.selectedBankId = null;
            p.selectedAppBankId = null;
            p.selectedEwalletType = null;
            return;
        }

        p.selectedType = 'bank';
        p.selectedBankId = null;
        p.selectedAppBankId = null;
        p.selectedEwalletType = null;
        p.selectedCryptoKey = null;
    }

    function setSelectedMethod(type, idOrKey) {
        const p = store.preferences;
        p.selectedType = type;
        p.preferredType = type === 'app_bank' ? 'bank' : type;
        p.selectedBankId = type === 'bank' ? idOrKey : null;
        p.selectedAppBankId = type === 'app_bank' ? idOrKey : null;
        p.selectedEwalletType = type === 'ewallet' ? idOrKey : null;
        p.selectedCryptoKey = type === 'crypto' ? idOrKey : null;
        saveStore();
        renderAll();
    }

    function isMobileWithdrawUI() {
        return window.matchMedia('(max-width: 767.98px)').matches;
    }

    function buildMobileMethodEntry({ action, icon, title, meta, extraClass = '' }) {
        return `
        <button type="button" class="withdrawCard withdrawCard--picker ${esc(extraClass)}" data-action="${esc(action)}">
            <span class="withdrawCard__icon"><img src="${esc(icon)}" alt="${esc(title)}"></span>
            <span class="withdrawCard__body">
                <span class="withdrawCard__title">${esc(title)}</span>
                <span class="withdrawCard__meta">${esc(meta)}</span>
            </span>
        </button>`;
    }

    function buildSheetHeader(leftText, title, rightHtml = '') {
        return `
        <div class="sectionHead sectionHead--sheet">
            <button type="button" class="sheetHead__btn" data-action="close-sheet">${esc(leftText)}</button>
            <h5>${esc(title)}</h5>
            ${rightHtml || '<span class="sheetHead__spacer"></span>'}
        </div>`;
    }

    function getSelectedBankAccount() {
        return (store.bankAccounts || []).find((item) => item.id === store.preferences.selectedBankId) || store.bankAccounts?.[0] || null;
    }

    function renderMobileBankEntry() {
        if (!els.savedBankList) return;
        const acc = getSelectedBankAccount();
        const title = acc ? (acc.bankName || getBankLabel(acc.bankCode)) : 'Choose a bank';
        const meta = acc ? maskAccountNumber(acc.accountNumber) : 'Tap to choose';
        const icon = acc ? getBankIconPath(acc.bankCode) : getBankIconPath('maybank');
        els.savedBankList.innerHTML = buildMobileMethodEntry({
            action: 'open-bank-picker',
            icon,
            title,
            meta
        });
    }

    function renderMobileAppBankEntry() {
        if (!els.appBankSlot) return;
        const acc = store.appBankAccount;
        const title = acc?.bankName || APP_BANK_NAME;
        const meta = acc?.accountName || 'Tap to manage';
        const icon = getBankIconPath(acc?.bankCode || 'app_internal');
        els.appBankSlot.innerHTML = buildMobileMethodEntry({
            action: 'open-app-bank-sheet',
            icon,
            title,
            meta,
            extraClass: store.preferences.selectedType === 'app_bank' ? 'is-active' : ''
        });
    }

    function renderMobileEwalletEntry() {
        if (!els.ewalletList) return;
        const key = store.preferences.selectedEwalletType;
        const acc = key ? store.ewalletAccounts?.[key] : null;
        const title = acc?.label || EWALLET_LABEL_MAP[key] || 'Choose E-wallet';
        const meta = acc ? maskAccountNumber(acc.accountNumber) : 'Tap to choose';
        const icon = acc?.icon || getEwalletIconPath(key || EWALLET_OPTIONS[0]?.key);
        els.ewalletList.innerHTML = buildMobileMethodEntry({
            action: 'open-ewallet-picker',
            icon,
            title,
            meta
        });
    }

    function renderMobileCryptoEntry() {
        if (!els.cryptoList) return;
        const key = store.preferences.selectedCryptoKey;
        const acc = key ? store.cryptoAccounts?.[key] : null;
        const title = acc ? `${acc.label || CRYPTO_META_MAP[key]?.label || 'Crypto'} (${acc.network || CRYPTO_META_MAP[key]?.network || ''})` : 'Choose Crypto';
        const meta = acc ? maskAddress(acc.address) : 'Tap to choose';
        const icon = acc?.icon || getCryptoIconPath(key || CRYPTO_OPTIONS[0]?.key);
        els.cryptoList.innerHTML = buildMobileMethodEntry({
            action: 'open-crypto-picker',
            icon,
            title,
            meta
        });
    }

    function buildBankPickerSheet() {
        return `
        <section class="withdrawSheetPanel withdrawSheetPanel--picker">
            ${buildSheetHeader('Close', 'Choose a bank', '')}

            <div class="sheetList">
                ${(store.bankAccounts || []).map((acc) => {
            const active = store.preferences.selectedType === 'bank' && store.preferences.selectedBankId === acc.id;
            const title = acc.bankName || getBankLabel(acc.bankCode);
            return `
                        <button type="button" class="withdrawCard ${active ? 'is-active' : ''}" data-action="select-bank-from-sheet" data-id="${esc(acc.id)}">
                            <span class="withdrawCard__icon"><img src="${esc(getBankIconPath(acc.bankCode))}" alt="${esc(title)}"></span>
                            <span class="withdrawCard__body">
                                <span class="withdrawCard__title">${esc(title)}</span>
                                <span class="withdrawCard__meta">${esc(maskAccountNumber(acc.accountNumber))}</span>
                            </span>
                        </button>`;
        }).join('')}

                ${store.bankAccounts.length < 3 ? `
                    <button type="button" class="withdrawCard withdrawCard--add" data-action="add-bank">
                        <span class="withdrawCard__addIcon"></span>
                        <span class="withdrawCard__body">
                            <span class="withdrawCard__title">Add Bank Account</span>
                            <span class="withdrawCard__meta">max 3 bank account only</span>
                        </span>
                    </button>` : ''}
            </div>

            <div class="sheetActions">
                <button type="button" class="sheetHead__btn" data-action="open-bank-manage">Edit or delete account</button>
            </div>
        </section>`;
    }
    function buildBankManageSheet() {
        return `
        <section class="withdrawSheetPanel withdrawSheetPanel--manage">
            ${buildSheetHeader('Back', 'Choose a bank')}
            <div class="sheetList">
                ${(store.bankAccounts || []).map((acc) => {
            const title = acc.bankName || getBankLabel(acc.bankCode);
            return `
                    <article class="withdrawCard" data-bank-id="${esc(acc.id)}">
                        <button type="button" class="withdrawCard__tool withdrawCard__tool--delete" data-action="delete-bank" data-id="${esc(acc.id)}" aria-label="Delete bank account">${toolIcon('delete')}</button>
                        <button type="button" class="withdrawCard__tool withdrawCard__tool--edit" data-action="edit-bank" data-id="${esc(acc.id)}" aria-label="Edit bank account">${toolIcon('edit')}</button>
                        <div class="withdrawCard__main">
                            <span class="withdrawCard__icon"><img src="${esc(getBankIconPath(acc.bankCode))}" alt="${esc(title)}"></span>
                            <span class="withdrawCard__body">
                                <span class="withdrawCard__title">${esc(title)}</span>
                                <span class="withdrawCard__meta">${esc(maskAccountNumber(acc.accountNumber))}</span>
                            </span>
                        </div>
                    </article>`;
        }).join('')}
                ${store.bankAccounts.length < 3 ? `
                    <button type="button" class="withdrawCard withdrawCard--add" data-action="add-bank">
                        <span class="withdrawCard__addIcon"></span>
                        <span class="withdrawCard__body">
                            <span class="withdrawCard__title">Add Bank Account</span>
                            <span class="withdrawCard__meta">max 3 bank account only</span>
                        </span>
                    </button>` : ''}
                <div class="sheetFootNote">Edit or delete account</div>
            </div>
        </section>`;
    }

    function buildAppBankSheet() {
        const acc = store.appBankAccount;
        const active = store.preferences.selectedType === 'app_bank' && store.preferences.selectedAppBankId === acc?.id;
        return `
        <section class="withdrawSheetPanel withdrawSheetPanel--picker">
            ${buildSheetHeader('Close', APP_BANK_NAME, `<button type="button" class="sheetHead__btn" data-action="${acc ? 'edit-app-bank' : 'add-app-bank'}">Edit</button>`)}
            <div class="sheetList">
                ${acc ? `
                    <button type="button" class="withdrawCard ${active ? 'is-active' : ''}" data-action="select-app-bank" data-id="${esc(acc.id)}">
                        <span class="withdrawCard__icon"><img src="${esc(getBankIconPath(acc.bankCode || 'app_internal'))}" alt="${esc(acc.bankName || APP_BANK_NAME)}"></span>
                        <span class="withdrawCard__body">
                            <span class="withdrawCard__title">${esc(acc.bankName || APP_BANK_NAME)}</span>
                            <span class="withdrawCard__meta">${esc(acc.accountName || '-')}</span>
                        </span>
                    </button>
                    <div class="sheetFootNote">Tap card to select. Use Edit to update username.</div>
                ` : `
                    <button type="button" class="withdrawCard withdrawCard--add" data-action="add-app-bank">
                        <span class="withdrawCard__addIcon"></span>
                        <span class="withdrawCard__body">
                            <span class="withdrawCard__title">Add ${esc(APP_BANK_NAME)}</span>
                            <span class="withdrawCard__meta">Link your username</span>
                        </span>
                    </button>`}
            </div>
        </section>`;
    }

    function buildEwalletPickerSheet() {
        return `
        <section class="withdrawSheetPanel withdrawSheetPanel--picker">
            ${buildSheetHeader('Close', 'Choose E-wallet', '<button type="button" class="sheetHead__btn" data-action="open-ewallet-manage">Edit</button>')}
            <div class="sheetList">
                ${EWALLET_OPTIONS.map((opt) => {
            const acc = store.ewalletAccounts?.[opt.key];
            if (!acc) return '';
            const active = store.preferences.selectedType === 'ewallet' && store.preferences.selectedEwalletType === opt.key;
            return `
                    <button type="button" class="withdrawCard ${active ? 'is-active' : ''}" data-action="select-ewallet-from-sheet" data-id="${esc(opt.key)}">
                        <span class="withdrawCard__icon"><img src="${esc(acc.icon || opt.icon)}" alt="${esc(acc.label || opt.label)}"></span>
                        <span class="withdrawCard__body">
                            <span class="withdrawCard__title">${esc(acc.label || opt.label)}</span>
                            <span class="withdrawCard__meta">${esc(maskAccountNumber(acc.accountNumber))}</span>
                        </span>
                    </button>`;
        }).join('')}
            </div>
        </section>`;
    }

    function buildEwalletManageSheet() {
        return `
        <section class="withdrawSheetPanel withdrawSheetPanel--manage">
            ${buildSheetHeader('Back', 'Choose E-wallet')}
            <div class="sheetList">
                ${EWALLET_OPTIONS.map((opt) => {
            const acc = store.ewalletAccounts?.[opt.key];
            if (!acc) {
                return `
                        <button type="button" class="withdrawCard withdrawCard--add" data-action="add-ewallet" data-id="${esc(opt.key)}">
                            <span class="withdrawCard__addIcon"></span>
                            <span class="withdrawCard__body">
                                <span class="withdrawCard__title">Add ${esc(opt.label)}</span>
                                <span class="withdrawCard__meta">Link account</span>
                            </span>
                        </button>`;
            }
            return `
                    <article class="withdrawCard" data-ewallet-type="${esc(opt.key)}">
                        <button type="button" class="withdrawCard__tool withdrawCard__tool--delete" data-action="delete-ewallet" data-id="${esc(opt.key)}">${toolIcon('delete')}</button>
                        <button type="button" class="withdrawCard__tool withdrawCard__tool--edit" data-action="edit-ewallet" data-id="${esc(opt.key)}">${toolIcon('edit')}</button>
                        <div class="withdrawCard__main">
                            <span class="withdrawCard__icon"><img src="${esc(acc.icon || opt.icon)}" alt="${esc(acc.label || opt.label)}"></span>
                            <span class="withdrawCard__body">
                                <span class="withdrawCard__title">${esc(acc.label || opt.label)}</span>
                                <span class="withdrawCard__meta">${esc(maskAccountNumber(acc.accountNumber))}</span>
                            </span>
                        </div>
                    </article>`;
                }).join('')}
                <div class="sheetFootNote">Edit or delete account</div>
            </div>
        </section>`;
    }

    function buildCryptoPickerSheet() {
        return `
        <section class="withdrawSheetPanel withdrawSheetPanel--picker">
            ${buildSheetHeader('Close', 'Choose Crypto', '<button type="button" class="sheetHead__btn" data-action="open-crypto-manage">Edit</button>')}
            <div class="sheetList">
                ${CRYPTO_OPTIONS.map((opt) => {
            const acc = store.cryptoAccounts?.[opt.key];
            if (!acc) return '';
            const active = store.preferences.selectedType === 'crypto' && store.preferences.selectedCryptoKey === opt.key;
            return `
                    <button type="button" class="withdrawCard ${active ? 'is-active' : ''}" data-action="select-crypto-from-sheet" data-id="${esc(opt.key)}">
                        <span class="withdrawCard__icon"><img src="${esc(acc.icon || opt.icon)}" alt="${esc(acc.label || opt.label)}"></span>
                        <span class="withdrawCard__body">
                            <span class="withdrawCard__title">${esc(acc.label || opt.label)} (${esc(acc.network || opt.network)})</span>
                            <span class="withdrawCard__meta">${esc(maskAddress(acc.address))}</span>
                        </span>
                    </button>`;
        }).join('')}
            </div>
        </section>`;
    }

    function buildCryptoManageSheet() {
        return `
        <section class="withdrawSheetPanel withdrawSheetPanel--manage">
            ${buildSheetHeader('Back', 'Choose Crypto')}
            <div class="sheetList">
                ${CRYPTO_OPTIONS.map((opt) => {
            const acc = store.cryptoAccounts?.[opt.key];
            if (!acc) {
                return `
                        <button type="button" class="withdrawCard withdrawCard--add" data-action="add-crypto" data-id="${esc(opt.key)}">
                            <span class="withdrawCard__addIcon"></span>
                            <span class="withdrawCard__body">
                                <span class="withdrawCard__title">Add ${esc(opt.label)} (${esc(opt.network)})</span>
                                <span class="withdrawCard__meta">Link wallet</span>
                            </span>
                        </button>`;
            }
            return `
                    <article class="withdrawCard" data-crypto-key="${esc(opt.key)}">
                        <button type="button" class="withdrawCard__tool withdrawCard__tool--delete" data-action="delete-crypto" data-id="${esc(opt.key)}">${toolIcon('delete')}</button>
                        <button type="button" class="withdrawCard__tool withdrawCard__tool--edit" data-action="edit-crypto" data-id="${esc(opt.key)}">${toolIcon('edit')}</button>
                        <div class="withdrawCard__main">
                            <span class="withdrawCard__icon"><img src="${esc(acc.icon || opt.icon)}" alt="${esc(acc.label || opt.label)}"></span>
                            <span class="withdrawCard__body">
                                <span class="withdrawCard__title">${esc(acc.label || opt.label)} (${esc(acc.network || opt.network)})</span>
                                <span class="withdrawCard__meta">${esc(maskAddress(acc.address))}</span>
                            </span>
                        </div>
                    </article>`;
        }).join('')}
                <div class="sheetFootNote">Edit or delete account</div>
            </div>
        </section>`;
    }

    function openMethodSheet(view) {
        sheetState.view = view;
        if (view === 'bank-picker') return openWithdrawSheet(buildBankPickerSheet());
        if (view === 'bank-manage') return openWithdrawSheet(buildBankManageSheet());
        if (view === 'app-bank') return openWithdrawSheet(buildAppBankSheet());
        if (view === 'ewallet-picker') return openWithdrawSheet(buildEwalletPickerSheet());
        if (view === 'ewallet-manage') return openWithdrawSheet(buildEwalletManageSheet());
        if (view === 'crypto-picker') return openWithdrawSheet(buildCryptoPickerSheet());
        if (view === 'crypto-manage') return openWithdrawSheet(buildCryptoManageSheet());
    }

    function renderBankAccounts() {
        if (!els.savedBankList) return;
        const selectedId = store.preferences.selectedType === 'bank' ? store.preferences.selectedBankId : null;

        const html = store.bankAccounts.map((acc) => {
            const active = acc.id === selectedId;
            const iconPath = getBankIconPath(acc.bankCode);
            const title = acc.bankName || getBankLabel(acc.bankCode);
            return `
        <article class="withdrawCard ${active ? 'is-active' : ''}" data-bank-id="${esc(acc.id)}">
          <button type="button" class="withdrawCard__tool withdrawCard__tool--delete" data-action="delete-bank" data-id="${esc(acc.id)}" aria-label="Delete bank account">${toolIcon('delete')}</button>
          <button type="button" class="withdrawCard__tool withdrawCard__tool--edit" data-action="edit-bank" data-id="${esc(acc.id)}" aria-label="Edit bank account">${toolIcon('edit')}</button>
          <button type="button" class="withdrawCard__main" data-action="select-bank" data-id="${esc(acc.id)}" aria-pressed="${active ? 'true' : 'false'}">
            <span class="withdrawCard__icon"><img src="${esc(iconPath)}" alt="${esc(title)}"></span>
            <span class="withdrawCard__body">
              <span class="withdrawCard__title">${esc(title)}</span>
              <span class="withdrawCard__meta">${esc(maskAccountNumber(acc.accountNumber))}</span>
            </span>
          </button>
        </article>`;
        }).join('');

        const addCard = store.bankAccounts.length < 3
            ? `<button type="button" class="withdrawCard withdrawCard--add" data-action="add-bank">
          <span class="withdrawCard__addIcon"></span>
          <span class="withdrawCard__body">
            <span class="withdrawCard__title">Add Bank Account</span>
            <span class="withdrawCard__meta">max 3 bank account only</span>
          </span>
        </button>`
            : '';

        els.savedBankList.innerHTML = html + addCard;
    }

    function renderAppBankRoute() {
        if (!els.appBankSlot) return;
        const acc = store.appBankAccount;
        if (!acc) {
            els.appBankSlot.innerHTML = `
    <article class="withdrawCard withdrawCard--empty withdrawCard--appBankEmpty">
      <button
        type="button"        class="withdrawCard__tool withdrawCard__tool--edit"
        data-action="add-app-bank"
        aria-label="Add app bank route"
      >
        ${toolIcon('edit')}
      </button>

      <div class="withdrawCard__main" aria-disabled="true">
        <span class="withdrawCard__icon">
          <img src="${esc(getBankIconPath('app_internal'))}" alt="App Bank Route">
        </span>
        <span class="withdrawCard__body">
          <span class="withdrawCard__title">App Bank Route</span>
          <span class="withdrawCard__meta">Not linked</span>
        </span>
      </div>
    </article>`;
            return;
        }

        const active = store.preferences.selectedType === 'app_bank' && store.preferences.selectedAppBankId === acc.id;
        const title = acc.bankName || getBankLabel(acc.bankCode || 'app_internal', 'App Bank Route');
        els.appBankSlot.innerHTML = `
      <article class="withdrawCard ${active ? 'is-active' : ''}" data-app-bank-id="${esc(acc.id)}">
        <button type="button" class="withdrawCard__tool withdrawCard__tool--delete" data-action="delete-app-bank" aria-label="Delete app bank route">${toolIcon('delete')}</button>
        <button type="button" class="withdrawCard__tool withdrawCard__tool--edit" data-action="edit-app-bank" aria-label="Edit app bank route">${toolIcon('edit')}</button>
        <button type="button" class="withdrawCard__main" data-action="select-app-bank" data-id="${esc(acc.id)}" aria-pressed="${active ? 'true' : 'false'}">
          <span class="withdrawCard__icon"><img src="${esc(getBankIconPath(acc.bankCode || 'app_internal'))}" alt="${esc(title)}"></span>
          <span class="withdrawCard__body">
            <span class="withdrawCard__title">${esc(title)}</span>
            <span class="withdrawCard__meta">${esc(maskAccountNumber(acc.accountName))}</span>
          </span>
        </button>
      </article>`;
    }

    function renderEwalletAccounts() {
        if (!els.ewalletList) return;
        els.ewalletList.innerHTML = EWALLET_OPTIONS.map((opt) => {
            const acc = store.ewalletAccounts?.[opt.key];
            const active = store.preferences.selectedType === 'ewallet' && store.preferences.selectedEwalletType === opt.key;
            if (!acc) {
                return `
    <article class="withdrawCard withdrawCard--empty" data-ewallet-type="${esc(opt.key)}">
      <button
        type="button"
        class="withdrawCard__tool withdrawCard__tool--edit"
        data-action="add-ewallet"
        data-id="${esc(opt.key)}"
        aria-label="Add ${esc(opt.label)} account"
      >
        ${toolIcon('edit')}
      </button>

      <div class="withdrawCard__main" aria-disabled="true">
        <span class="withdrawCard__icon"><img src="${esc(opt.icon)}" alt="${esc(opt.label)}"></span>
        <span class="withdrawCard__body">
          <span class="withdrawCard__title">${esc(opt.label)}</span>
          <span class="withdrawCard__meta">Not linked</span>
        </span>
      </div>
    </article>`;
            }
            return `
        <article class="withdrawCard ${active ? 'is-active' : ''}" data-ewallet-type="${esc(opt.key)}">
          <button type="button" class="withdrawCard__tool withdrawCard__tool--delete" data-action="delete-ewallet" data-id="${esc(opt.key)}" aria-label="Delete e-wallet account">${toolIcon('delete')}</button>
          <button type="button" class="withdrawCard__tool withdrawCard__tool--edit" data-action="edit-ewallet" data-id="${esc(opt.key)}" aria-label="Edit e-wallet account">${toolIcon('edit')}</button>
          <button type="button" class="withdrawCard__main" data-action="select-ewallet" data-id="${esc(opt.key)}" aria-pressed="${active ? 'true' : 'false'}">
            <span class="withdrawCard__icon"><img src="${esc(acc.icon || opt.icon)}" alt="${esc(acc.label || opt.label)}"></span>
            <span class="withdrawCard__body">
              <span class="withdrawCard__title">${esc(acc.label || opt.label)}</span>
              <span class="withdrawCard__meta">${esc(maskAccountNumber(acc.accountNumber))}</span>
            </span>
          </button>
        </article>`;
        }).join('');
    }

    function renderCryptoAccounts() {
        if (!els.cryptoList) return;
        els.cryptoList.innerHTML = CRYPTO_OPTIONS.map((opt) => {
            const acc = store.cryptoAccounts?.[opt.key];
            const active = store.preferences.selectedType === 'crypto' && store.preferences.selectedCryptoKey === opt.key;
            if (!acc) {
                return `
    <article class="withdrawCard withdrawCard--empty" data-crypto-key="${esc(opt.key)}">
      <button
        type="button"
        class="withdrawCard__tool withdrawCard__tool--edit"
        data-action="add-crypto"
        data-id="${esc(opt.key)}"
        aria-label="Add ${esc(opt.label)} ${esc(opt.network)} wallet"
      >
        ${toolIcon('edit')}
      </button>

      <div class="withdrawCard__main" aria-disabled="true">
        <span class="withdrawCard__icon"><img src="${esc(opt.icon)}" alt="${esc(opt.label)}"></span>
        <span class="withdrawCard__body">
          <span class="withdrawCard__title">${esc(opt.label)} (${esc(opt.network)})</span>
          <span class="withdrawCard__meta">Not linked</span>
        </span>
      </div>
    </article>`;
            }
            return `
        <article class="withdrawCard ${active ? 'is-active' : ''}" data-crypto-key="${esc(opt.key)}">
          <button type="button" class="withdrawCard__tool withdrawCard__tool--delete" data-action="delete-crypto" data-id="${esc(opt.key)}" aria-label="Delete crypto account">${toolIcon('delete')}</button>
          <button type="button" class="withdrawCard__tool withdrawCard__tool--edit" data-action="edit-crypto" data-id="${esc(opt.key)}" aria-label="Edit crypto account">${toolIcon('edit')}</button>
          <button type="button" class="withdrawCard__main" data-action="select-crypto" data-id="${esc(opt.key)}" aria-pressed="${active ? 'true' : 'false'}">
            <span class="withdrawCard__icon"><img src="${esc(acc.icon || opt.icon)}" alt="${esc(acc.label || opt.label)}"></span>
            <span class="withdrawCard__body">
              <span class="withdrawCard__title">${esc(acc.label || opt.label)} (${esc(acc.network || opt.network)})</span>
              <span class="withdrawCard__meta">${esc(maskAddress(acc.address))}</span>
            </span>
          </button>
        </article>`;
        }).join('');
    }

    function buildBankForm(model = null) {
        return `
        <form id="withdrawDynamicForm" data-editor-type="bank">
            <div class="withdrawFormGrid">
                <label class="field">
                    <span>Bank Account</span>
                    <input type="text" name="accountName" value="${esc(model?.accountName || '')}" placeholder="Account Name" required>
                </label>

                <label class="field">
                    <span>Bank</span>
                    <input type="hidden" name="bankCode" value="${esc(model?.bankCode || '')}" required>
                    <div data-bank-dropdown></div>
                </label>

                <label class="field">
                    <span>Account Number</span>
                    <input type="text" name="accountNumber" value="${esc(model?.accountNumber || '')}" placeholder="Account Number" required>
                </label>

                <label class="field">
                    <span>Bank Branch</span>
                    <input type="text" name="branchName" value="${esc(model?.branchName || '')}" placeholder="Bank Branch">
                </label>
            </div>

            <div class="formActions">
                <button type="submit" data-action="save-method">Save</button>
            </div>
        </form>`;
    }

    function buildAppBankForm(model = null) {
        return `
        <form id="withdrawDynamicForm" data-editor-type="app_bank">
            <div class="withdrawFormGrid">
                <label class="field">
                    <span>App Bank</span>
                    <input type="text" value="A9Wallet / G2Point" disabled>
                    <input type="hidden" name="bankCode" value="app_internal">
                </label>

                <label class="field">
                    <span>Username</span>
                    <input type="text" name="accountName" value="${esc(model?.accountName || '')}" placeholder="Account Name" required>
                </label>
            </div>

            <div class="formActions">
                <button type="submit" data-action="save-method">Save</button>
            </div>
        </form>`;
    }

    function buildEwalletForm(optionKey, model = null) {
        const meta = EWALLET_OPTIONS.find((item) => item.key === optionKey);
        return `
        <form id="withdrawDynamicForm" data-editor-type="ewallet" data-option-key="${esc(optionKey)}">
            <div class="withdrawFormGrid">
                <label class="field">
                    <span>E-wallet</span>
                    <input type="text" value="${esc(meta?.label || model?.label || 'E-wallet')}" disabled>
                </label>

                <label class="field">
                    <span>Account Name</span>
                    <input type="text" name="label" value="${esc(model?.label || meta?.label || '')}" placeholder="Account Name" required>
                </label>

                <label class="field">
                    <span>Account Number</span>
                    <input type="text" name="accountNumber" value="${esc(model?.accountNumber || '')}" placeholder="0123456789" required>
                </label>
            </div>

            <div class="formActions">
                <button type="submit" data-action="save-method">Save</button>
            </div>
        </form>`;
    }

    function buildCryptoForm(optionKey, model = null) {
        const meta = CRYPTO_OPTIONS.find((item) => item.key === optionKey);
        return `
        <form id="withdrawDynamicForm" data-editor-type="crypto" data-option-key="${esc(optionKey)}">
            <div class="withdrawFormGrid">
                <label class="field">
                    <span>Crypto</span>
                    <input type="text" value="${esc(meta?.label || model?.label || 'Crypto')}" disabled>
                </label>

                <label class="field">
                    <span>Network</span>
                    <input type="text" value="${esc(meta?.network || model?.network || '')}" disabled>
                </label>

                <label class="field">
                    <span>Wallet Label</span>
                    <input type="text" name="label" value="${esc(model?.label || meta?.label || '')}" placeholder="Wallet Label" required>
                </label>

                <label class="field">
                    <span>Wallet Address</span>
                    <input type="text" name="address" value="${esc(model?.address || '')}" placeholder="Wallet Address" required>
                </label>
            </div>
                        <div class="formActions">
                <button type="submit" data-action="save-method">Save</button>
            </div>
        </form>`;
    }

    function openBankEditor(mode, bankId = null, isAppBank = false) {
        if (editorState.open) return;

        editorState.open = true;
        editorState.mode = mode;
        editorState.type = isAppBank ? 'app_bank' : 'bank';
        editorState.editingId = bankId;
        editorState.optionKey = null;

        const title = mode === 'edit'
            ? (isAppBank ? 'Edit App Bank Route' : 'Edit Bank Account')
            : (isAppBank ? 'Add App Bank Route' : 'Add Bank Account');

        const bank = isAppBank
            ? store.appBankAccount
            : (bankId ? store.bankAccounts.find((x) => x.id === bankId) : null);

        renderEditorIntoPlace({
            type: isAppBank ? 'app_bank' : 'bank',
            title,
            desc: 'We need your account detail for payment verification and for future withdrawals.',
            formHtml: isAppBank ? buildAppBankForm(bank) : buildBankForm(bank)
        });
    }

    function openEwalletEditor(mode, optionKey) {
        if (editorState.open) return;

        editorState.open = true;
        editorState.mode = mode;
        editorState.type = 'ewallet';
        editorState.editingId = null;
        editorState.optionKey = optionKey;

        const meta = EWALLET_OPTIONS.find((item) => item.key === optionKey);
        const model = store.ewalletAccounts?.[optionKey] || null;

        renderEditorIntoPlace({
            type: 'ewallet',
            title: `${mode === 'edit' ? 'Edit' : 'Add'} ${meta?.label || 'E-wallet'}`,
            desc: 'Each e-wallet keeps its own account detail. Editing one will not affect the others.',
            formHtml: buildEwalletForm(optionKey, model)
        });
    }

    function openCryptoEditor(mode, optionKey) {
        if (editorState.open) return;

        editorState.open = true;
        editorState.mode = mode;
        editorState.type = 'crypto';
        editorState.editingId = null;
        editorState.optionKey = optionKey;

        const meta = CRYPTO_OPTIONS.find((item) => item.key === optionKey);
        const model = store.cryptoAccounts?.[optionKey] || null;

        renderEditorIntoPlace({
            type: 'crypto',
            title: `${mode === 'edit' ? 'Edit' : 'Add'} ${meta?.label || 'Crypto'} (${meta?.network || ''})`,
            desc: 'Each crypto method keeps its own wallet address. Editing one will not affect the others.',
            formHtml: buildCryptoForm(optionKey, model)
        });
    }
    function canInteractWhileEditing(action) {
        return action === 'cancel-editor' || action === 'close-sheet';
    }
    function closeEditor() {
        if (!editorState.open) return;

        const closingType = editorState.mountKey;
        const isMobile = editorState.mobile;

        if (isMobile) {
            closeWithdrawSheet();
        } else if (closingType) {
            unlockMethodArea(closingType);
        }

        editorState.open = false;
        editorState.mode = 'add';
        editorState.type = 'bank';
        editorState.editingId = null;
        editorState.optionKey = null;
        editorState.mountKey = null;
        editorState.mobile = false;
        sheetState.view = null;

        syncMethodAreaVisibility();
    }

    function saveEditorForm(form) {
        const fd = new FormData(form);

        if (editorState.type === 'app_bank' || editorState.type === 'bank') {
            const bankCode = String(fd.get('bankCode') || '').trim();
            const accountName = String(fd.get('accountName') || '').trim();
            const accountNumber = String(fd.get('accountNumber') || '').replace(/\s+/g, '');
            const branchName = String(fd.get('branchName') || '').trim();

            if (editorState.type === 'app_bank') {
                if (!accountName) return;

                store.appBankAccount = {
                    id: store.appBankAccount?.id || `app_bank_${Date.now()}`,
                    bankCode: 'app_internal',
                    bankName: APP_BANK_NAME,
                    accountName,
                    accountNumber: '',
                    branchName: ''
                };
                saveStore();
                setSelectedMethod('app_bank', store.appBankAccount.id);
                closeEditor();
                return;
            }

            if (!bankCode || !accountName || !accountNumber) return;

            const payload = {
                bankCode,
                bankName: getBankLabel(bankCode),
                accountName,
                accountNumber,
                branchName
            };

            if (editorState.mode === 'edit' && editorState.editingId) {
                const idx = store.bankAccounts.findIndex((x) => x.id === editorState.editingId);
                if (idx > -1) {
                    store.bankAccounts[idx] = { ...store.bankAccounts[idx], ...payload };
                }
            } else {
                if (store.bankAccounts.length >= 3) return;
                const next = { id: `bank_${Date.now()}`, ...payload };
                store.bankAccounts.push(next);
                store.preferences.selectedType = 'bank';
                store.preferences.selectedBankId = next.id;
                store.preferences.selectedAppBankId = null;
                store.preferences.selectedEwalletType = null;
                store.preferences.selectedCryptoKey = null;
            }
        }

        if (editorState.type === 'ewallet' && editorState.optionKey) {
            const label = String(fd.get('label') || '').trim();
            const accountNumber = String(fd.get('accountNumber') || '').replace(/\s+/g, '');
            if (!label || !accountNumber) return;
            store.ewalletAccounts[editorState.optionKey] = {
                type: editorState.optionKey,
                label,
                accountNumber,
                icon: getEwalletIconPath(editorState.optionKey)
            };
            store.preferences.selectedType = 'ewallet';
            store.preferences.selectedEwalletType = editorState.optionKey;
            store.preferences.selectedBankId = null;
            store.preferences.selectedAppBankId = null;
            store.preferences.selectedCryptoKey = null;
        }

        if (editorState.type === 'crypto' && editorState.optionKey) {
            const label = String(fd.get('label') || '').trim();
            const address = String(fd.get('address') || '').trim();
            const meta = CRYPTO_META_MAP[editorState.optionKey];
            if (!label || !address || !meta) return;
            store.cryptoAccounts[editorState.optionKey] = {
                key: editorState.optionKey,
                label,
                network: meta.network,
                address,
                icon: getCryptoIconPath(editorState.optionKey)
            };
            store.preferences.selectedType = 'crypto';
            store.preferences.selectedCryptoKey = editorState.optionKey;
            store.preferences.selectedBankId = null;
            store.preferences.selectedAppBankId = null;
            store.preferences.selectedEwalletType = null;
        }

        const reopenView = isMobileWithdrawUI()
            ? (editorState.type === 'bank' ? 'bank-manage'
                : editorState.type === 'app_bank' ? 'app-bank'
                    : editorState.type === 'ewallet' ? 'ewallet-manage'
                        : editorState.type === 'crypto' ? 'crypto-manage'
                            : null)
            : null;

        saveStore();
        closeEditor();
        renderAll();

        if (reopenView) {
            openMethodSheet(reopenView);
        }
    }

    function deleteBankAccount(bankId) {
        store.bankAccounts = store.bankAccounts.filter((x) => x.id !== bankId);
        if (store.preferences.selectedBankId === bankId) {
            store.preferences.selectedBankId = null;
        }
        ensureValidSelection();
        saveStore();
        renderAll();
    }

    function deleteAppBankAccount() {
        store.appBankAccount = null;
        if (store.preferences.selectedType === 'app_bank') {
            store.preferences.selectedAppBankId = null;
        }
        ensureValidSelection();
        saveStore();
        renderAll();
    }

    function deleteEwalletAccount(key) {
        if (!key) return;
        delete store.ewalletAccounts[key];
        if (store.preferences.selectedType === 'ewallet' && store.preferences.selectedEwalletType === key) {
            store.preferences.selectedEwalletType = null;
        }
        ensureValidSelection();
        saveStore();
        renderAll();
    }

    function deleteCryptoAccount(key) {
        if (!key) return;
        delete store.cryptoAccounts[key];
        if (store.preferences.selectedType === 'crypto' && store.preferences.selectedCryptoKey === key) {
            store.preferences.selectedCryptoKey = null;
        }
        ensureValidSelection();
        saveStore();
        renderAll();
    }

    function renderSummary() {
        const selected = currentSelection();
        if (els.summary.to) els.summary.to.textContent = selected?.label || '-';
        if (els.summary.account) els.summary.account.textContent = selected?.account || '-';

        if (els.summary.iconWrap && els.summary.iconImg) {
            if (selected?.icon) {
                els.summary.iconImg.src = selected.icon;
                els.summary.iconImg.alt = selected.label || '';
                els.summary.iconWrap.hidden = false;
            } else {
                els.summary.iconWrap.hidden = true;
                els.summary.iconImg.removeAttribute('src');
                els.summary.iconImg.alt = '';
            }
        }

        const amt = amountValue();
        if (els.summary.amount) els.summary.amount.textContent = money(amt);
        if (els.summary.target) els.summary.target.textContent = money(SUMMARY_TARGET);
        if (els.summary.rollover) {
            const suffix = selected?.type === 'crypto' && selected.network ? ` (${selected.network})` : '';
            els.summary.rollover.textContent = `${money(SUMMARY_ROLLOVER)}${suffix}`;
        }
        if (els.summary.formula) {
            els.summary.formula.innerHTML = 'Rollover Requirement (Deposit × 10) + (Bonus × 0) + (Max Bonus × 10)<br>= MYR 0 + (To be calculated after Free Spin Completion)';
        }
        if (els.summary.total) els.summary.total.textContent = money(amt);
    }

    function syncSubmitState() {
        if (!els.submitBtn) return;
        const valid = !!currentSelection() && amountValue() > 0;
        els.submitBtn.disabled = !valid;
        els.submitBtn.classList.toggle('is-disabled', !valid);
    }

    function renderTabState() {
        const activeType = store.preferences.preferredType || 'bank';
        els.tabs.forEach((tab) => {
            const on = tab.dataset.wdType === activeType;
            tab.classList.toggle('is-active', on);
            tab.setAttribute('aria-selected', on ? 'true' : 'false');
        });

        els.sections.forEach((section) => {
            section.hidden = section.dataset.section !== activeType;
        });
    }

    function renderAll() {
        ensureValidSelection();
        renderTabState();

        if (isMobileWithdrawUI()) {
            renderMobileBankEntry();
            renderMobileAppBankEntry();
            renderMobileEwalletEntry();
            renderMobileCryptoEntry();
        } else {
            renderBankAccounts();
            renderAppBankRoute();
            renderEwalletAccounts();
            renderCryptoAccounts();
        }

        renderSummary();
        syncSubmitState();
        syncMethodAreaVisibility();
    }

    els.tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            if (editorState.open) return;

            const type = tab.dataset.wdType || 'bank';
            store.preferences.preferredType = type;
            saveStore();
            renderAll();
        });
    });

    document.addEventListener('click', (e) => {
        const actionEl = e.target.closest('[data-action]');
        const action = actionEl?.dataset.action || '';

        // editor 开着时，除了 cancel / close-sheet 之外，其他点击都先挡住
        if (editorState.open && !canInteractWhileEditing(action)) {
            return;
        }

        const addBankBtn = e.target.closest('[data-action="add-bank"]');
        if (addBankBtn) {
            openBankEditor('add', null, false);
            return;
        }
        const closeSheetBtn = e.target.closest('[data-action="close-sheet"]');
        if (closeSheetBtn) {
            if (editorState.open) {
                closeEditor();
            } else {
                closeWithdrawSheet();
                sheetState.view = null;
            }
            return;
        }

        const openBankPickerBtn = e.target.closest('[data-action="open-bank-picker"]');
        if (openBankPickerBtn) {
            openMethodSheet('bank-picker');
            return;
        }

        const openBankManageBtn = e.target.closest('[data-action="open-bank-manage"]');
        if (openBankManageBtn) {
            openMethodSheet('bank-manage');
            return;
        }

        const openAppBankSheetBtn = e.target.closest('[data-action="open-app-bank-sheet"]');
        if (openAppBankSheetBtn) {
            openMethodSheet('app-bank');
            return;
        }

        const addAppBankBtn = e.target.closest('[data-action="add-app-bank"]');
        if (addAppBankBtn) {
            openBankEditor(store.appBankAccount ? 'edit' : 'add', store.appBankAccount?.id || null, true);
            return;
        }

        const selectBankBtn = e.target.closest('[data-action="select-bank"]');
        if (selectBankBtn) {
            setSelectedMethod('bank', selectBankBtn.dataset.id);
            return;
        }

        const editBankBtn = e.target.closest('[data-action="edit-bank"]');
        if (editBankBtn) {
            openBankEditor('edit', editBankBtn.dataset.id, false);
            return;
        }

        const deleteBankBtn = e.target.closest('[data-action="delete-bank"]');
        if (deleteBankBtn) {
            deleteBankAccount(deleteBankBtn.dataset.id);
            if (!editorState.open && isMobileWithdrawUI() && sheetState.view === 'bank-manage') {
                openMethodSheet('bank-manage');
            }
            return;
        }

        const selectBankSheetBtn = e.target.closest('[data-action="select-bank-from-sheet"]');
        if (selectBankSheetBtn) {
            setSelectedMethod('bank', selectBankSheetBtn.dataset.id);
            closeWithdrawSheet();
            sheetState.view = null;
            return;
        }

        const selectAppBankBtn = e.target.closest('[data-action="select-app-bank"]');
        if (selectAppBankBtn) {
            setSelectedMethod('app_bank', selectAppBankBtn.dataset.id);
            return;
        }

        const editAppBankBtn = e.target.closest('[data-action="edit-app-bank"]');
        if (editAppBankBtn) {
            openBankEditor('edit', store.appBankAccount?.id || null, true);
            return;
        }

        const deleteAppBankBtn = e.target.closest('[data-action="delete-app-bank"]');
        if (deleteAppBankBtn) {
            deleteAppBankAccount();
            if (!editorState.open && isMobileWithdrawUI()) {
                openMethodSheet('app-bank');
            }
            return;
        }

        const openEwalletPickerBtn = e.target.closest('[data-action="open-ewallet-picker"]');
        if (openEwalletPickerBtn) {
            openMethodSheet('ewallet-picker');
            return;
        }

        const openEwalletManageBtn = e.target.closest('[data-action="open-ewallet-manage"]');
        if (openEwalletManageBtn) {
            openMethodSheet('ewallet-manage');
            return;
        }

        const addEwalletBtn = e.target.closest('[data-action="add-ewallet"]');
        if (addEwalletBtn) {
            openEwalletEditor('add', addEwalletBtn.dataset.id);
            return;
        }

        const editEwalletBtn = e.target.closest('[data-action="edit-ewallet"]');
        if (editEwalletBtn) {
            openEwalletEditor('edit', editEwalletBtn.dataset.id);
            return;
        }

        const deleteEwalletBtn = e.target.closest('[data-action="delete-ewallet"]');
        if (deleteEwalletBtn) {
            deleteEwalletAccount(deleteEwalletBtn.dataset.id);
            if (!editorState.open && isMobileWithdrawUI() && sheetState.view === 'ewallet-manage') {
                openMethodSheet('ewallet-manage');
            }
            return;
        }

        const selectEwalletBtn = e.target.closest('[data-action="select-ewallet"]');
        if (selectEwalletBtn) {
            setSelectedMethod('ewallet', selectEwalletBtn.dataset.id);
            return;
        }

        const selectEwalletSheetBtn = e.target.closest('[data-action="select-ewallet-from-sheet"]');
        if (selectEwalletSheetBtn) {
            setSelectedMethod('ewallet', selectEwalletSheetBtn.dataset.id);
            closeWithdrawSheet();
            sheetState.view = null;
            return;
        }

        const openCryptoPickerBtn = e.target.closest('[data-action="open-crypto-picker"]');
        if (openCryptoPickerBtn) {
            openMethodSheet('crypto-picker');
            return;
        }

        const openCryptoManageBtn = e.target.closest('[data-action="open-crypto-manage"]');
        if (openCryptoManageBtn) {
            openMethodSheet('crypto-manage');
            return;
        }

        const addCryptoBtn = e.target.closest('[data-action="add-crypto"]');
        if (addCryptoBtn) {
            openCryptoEditor('add', addCryptoBtn.dataset.id);
            return;
        }

        const editCryptoBtn = e.target.closest('[data-action="edit-crypto"]');
        if (editCryptoBtn) {
            openCryptoEditor('edit', editCryptoBtn.dataset.id);
            return;
        }

        const deleteCryptoBtn = e.target.closest('[data-action="delete-crypto"]');
        if (deleteCryptoBtn) {
            deleteCryptoAccount(deleteCryptoBtn.dataset.id);
            if (!editorState.open && isMobileWithdrawUI() && sheetState.view === 'crypto-manage') {
                openMethodSheet('crypto-manage');
            }
            return;
        }

        const selectCryptoBtn = e.target.closest('[data-action="select-crypto"]');
        if (selectCryptoBtn) {
            setSelectedMethod('crypto', selectCryptoBtn.dataset.id);
            return;
        }

        const selectCryptoSheetBtn = e.target.closest('[data-action="select-crypto-from-sheet"]');
        if (selectCryptoSheetBtn) {
            setSelectedMethod('crypto', selectCryptoSheetBtn.dataset.id);
            closeWithdrawSheet();
            sheetState.view = null;
            return;
        }

        const cancelBtn = e.target.closest('[data-action="cancel-editor"]');
        if (cancelBtn) {
            closeEditor();
        }
    });

    document.addEventListener('submit', (e) => {
        const form = e.target.closest('#withdrawDynamicForm');
        if (!form) return;
        e.preventDefault();
        saveEditorForm(form);
    });

    els.amountInput?.addEventListener('input', () => {
        const raw = String(els.amountInput.value || '').replace(/[^\d]/g, '');
        els.amountInput.value = raw ? Number(raw).toLocaleString('en-MY') : '';
        renderSummary();
        syncSubmitState();
    });

    els.quickButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const add = Number(btn.dataset.add || 0);
            setAmount(amountValue() + add);
        });
    });

    renderAll();
});
