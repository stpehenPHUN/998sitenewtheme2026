document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'demo_withdraw_methods_v3';
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

    const BANK_ICON_MAP = Object.fromEntries(BANK_OPTIONS.map((b) => [b.code, b.icon]));
    const BANK_LABEL_MAP = Object.fromEntries(BANK_OPTIONS.map((b) => [b.code, b.label]));

    const EWALLET_OPTIONS = [
        { key: 'tng', label: "Touch 'n Go", icon: 'image/payment/maybank.png' },
        { key: 'shopeepay', label: 'Shopee Pay', icon: 'image/payment/maybank.png' },
        { key: 'boost', label: 'Boost', icon: 'image/payment/maybank.png' },
        { key: 'bigpay', label: 'BigPay', icon: 'image/payment/maybank.png' }
    ];
    const EWALLET_LABEL_MAP = Object.fromEntries(EWALLET_OPTIONS.map((w) => [w.key, w.label]));
    const EWALLET_ICON_MAP = Object.fromEntries(EWALLET_OPTIONS.map((w) => [w.key, w.icon]));

    const CRYPTO_OPTIONS = [
        { key: 'usdt_trc20', label: 'USDT', network: 'TRC20', icon: 'image/payment/maybank.png' },
        { key: 'usdt_erc20', label: 'USDT', network: 'ERC20', icon: 'image/payment/maybank.png' },
        { key: 'btc_btc', label: 'BTC', network: 'BTC', icon: 'image/payment/maybank.png' },
        { key: 'eth_erc20', label: 'ETH', network: 'ERC20', icon: 'image/payment/maybank.png' }
    ];
    const CRYPTO_META_MAP = Object.fromEntries(CRYPTO_OPTIONS.map((c) => [c.key, c]));

    const DEFAULT_STORE = {
        bankAccounts: [
            { id: 'bank_001', bankCode: 'maybank', bankName: 'Maybank (MBB)', accountName: 'Player998', accountNumber: '112233445566', branchName: 'KL Main' },
            { id: 'bank_002', bankCode: 'bsn', bankName: 'Bank Simpanan Nasional', accountName: 'Player998', accountNumber: '223344556699', branchName: 'PJ' }
        ],
        appBankAccount: {
            id: 'app_bank_001', bankCode: 'app_internal', bankName: 'App Bank Route', accountName: 'Player998', accountNumber: '900123456789', branchName: 'Internal Settlement'
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
        editor: document.getElementById('withdrawEditor'),
        editorTitle: document.getElementById('withdrawEditorTitle'),
        form: document.getElementById('withdrawMethodForm'),
        formFields: document.getElementById('withdrawFormFields'),
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
        editingId: null
    };

    function cloneDefault() {
        return typeof structuredClone === 'function'
            ? structuredClone(DEFAULT_STORE)
            : JSON.parse(JSON.stringify(DEFAULT_STORE));
    }

    function hydrateStore(parsed) {
        const fallback = cloneDefault();
        const merged = {
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
        return merged;
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
        return BANK_ICON_MAP[bankCode] || 'image/bank/default-bank.png';
    }

    function getBankLabel(bankCode, fallback = '') {
        return BANK_LABEL_MAP[bankCode] || fallback || 'Bank';
    }

    function getEwalletIconPath(type) {
        return EWALLET_ICON_MAP[type] || 'image/payment/default-ewallet.png';
    }

    function getCryptoIconPath(key) {
        return CRYPTO_META_MAP[key]?.icon || 'image/payment/default-crypto.png';
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
                account: maskAccountNumber(acc.accountNumber),
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
          <span class="withdrawCard__addIcon">+</span>
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
            els.appBankSlot.innerHTML = `<button type="button" class="withdrawCard withdrawCard--add" data-action="add-app-bank">
        <span class="withdrawCard__addIcon">+</span>
        <span class="withdrawCard__body">
          <span class="withdrawCard__title">Add App Bank Route</span>
          <span class="withdrawCard__meta">max 1 internal route only</span>
        </span>
      </button>`;
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
            <span class="withdrawCard__meta">${esc(maskAccountNumber(acc.accountNumber))}</span>
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
                return `<article class="withdrawCard withdrawCard--empty"><span class="withdrawCard__icon"><img src="${esc(opt.icon)}" alt="${esc(opt.label)}"></span><span class="withdrawCard__body"><span class="withdrawCard__title">${esc(opt.label)}</span><span class="withdrawCard__meta">Not linked</span></span></article>`;
            }
            return `
        <article class="withdrawCard ${active ? 'is-active' : ''}" data-ewallet-type="${esc(opt.key)}">
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
                return `<article class="withdrawCard withdrawCard--empty"><span class="withdrawCard__icon"><img src="${esc(opt.icon)}" alt="${esc(opt.label)}"></span><span class="withdrawCard__body"><span class="withdrawCard__title">${esc(opt.label)} (${esc(opt.network)})</span><span class="withdrawCard__meta">Not linked</span></span></article>`;
            }
            return `
        <article class="withdrawCard ${active ? 'is-active' : ''}" data-crypto-key="${esc(opt.key)}">
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

    function openBankEditor(mode, bankId = null, isAppBank = false) {
        editorState.open = true;
        editorState.mode = mode;
        editorState.type = isAppBank ? 'app_bank' : 'bank';
        editorState.editingId = bankId;

        const title = mode === 'edit'
            ? (isAppBank ? 'Edit App Bank Route' : 'Edit Bank Account')
            : (isAppBank ? 'Add App Bank Route' : 'Add Bank Account');

        if (els.editorTitle) els.editorTitle.textContent = title;
        if (!els.formFields) return;

        const bank = isAppBank
            ? store.appBankAccount
            : (bankId ? store.bankAccounts.find((x) => x.id === bankId) : null);

        els.formFields.innerHTML = `
      <div class="withdrawFormGrid">
        <label class="field">
          <span>Bank Account</span>
          <input type="text" name="accountName" value="${esc(bank?.accountName || '')}" placeholder="Player998" required>
        </label>

        <label class="field">
          <span>Bank</span>
          <select name="bankCode" required>
            <option value="">Select Bank</option>
            ${BANK_OPTIONS
                .filter((opt) => isAppBank ? opt.code === 'app_internal' : opt.code !== 'app_internal')
                .map((opt) => `<option value="${esc(opt.code)}" ${bank?.bankCode === opt.code ? 'selected' : ''}>${esc(opt.label)}</option>`)
                .join('')}
          </select>
        </label>

        <label class="field">
          <span>Account Number</span>
          <input type="text" name="accountNumber" value="${esc(bank?.accountNumber || '')}" placeholder="Account Number" required>
        </label>

        <label class="field">
          <span>Bank Branch</span>
          <input type="text" name="branchName" value="${esc(bank?.branchName || '')}" placeholder="Bank Branch">
        </label>
      </div>`;

        els.editor.hidden = false;
    }

    function closeEditor() {
        editorState.open = false;
        editorState.mode = 'add';
        editorState.type = 'bank';
        editorState.editingId = null;
        if (els.form) els.form.reset();
        if (els.editor) els.editor.hidden = true;
    }

    function saveEditorForm(form) {
        const fd = new FormData(form);
        const bankCode = String(fd.get('bankCode') || '').trim();
        const accountName = String(fd.get('accountName') || '').trim();
        const accountNumber = String(fd.get('accountNumber') || '').replace(/\s+/g, '');
        const branchName = String(fd.get('branchName') || '').trim();

        if (!bankCode || !accountName || !accountNumber) return;

        const payload = {
            bankCode,
            bankName: getBankLabel(bankCode),
            accountName,
            accountNumber,
            branchName
        };

        if (editorState.type === 'app_bank') {
            store.appBankAccount = {
                id: store.appBankAccount?.id || `app_bank_${Date.now()}`,
                ...payload
            };
            setSelectedMethod('app_bank', store.appBankAccount.id);
            return;
        }

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

        saveStore();
        renderAll();
        closeEditor();
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
        renderBankAccounts();
        renderAppBankRoute();
        renderEwalletAccounts();
        renderCryptoAccounts();
        renderSummary();
        syncSubmitState();
    }

    els.tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const type = tab.dataset.wdType || 'bank';
            store.preferences.preferredType = type;
            saveStore();
            renderAll();
        });
    });

    document.addEventListener('click', (e) => {
        const addBankBtn = e.target.closest('[data-action="add-bank"]');
        if (addBankBtn) {
            openBankEditor('add', null, false);
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
            return;
        }

        const selectEwalletBtn = e.target.closest('[data-action="select-ewallet"]');
        if (selectEwalletBtn) {
            setSelectedMethod('ewallet', selectEwalletBtn.dataset.id);
            return;
        }

        const selectCryptoBtn = e.target.closest('[data-action="select-crypto"]');
        if (selectCryptoBtn) {
            setSelectedMethod('crypto', selectCryptoBtn.dataset.id);
            return;
        }

        const cancelBtn = e.target.closest('[data-action="cancel-editor"]');
        if (cancelBtn) {
            closeEditor();
        }
    });

    els.form?.addEventListener('submit', (e) => {
        e.preventDefault();
        saveEditorForm(e.currentTarget);
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
