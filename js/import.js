(function () {
    async function loadInto(el, url, { execScripts = false, bustCache = false } = {}) {
        try {
            const realUrl = bustCache ? `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}` : url;
            const res = await fetch(realUrl, { credentials: 'same-origin' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const html = await res.text();
            el.innerHTML = html;
            if (execScripts) runScripts(el); 
        } catch (e) {
            console.warn(`[include] loadfail: ${url}`, e);
        }
    }

    function runScripts(scope) {
        const scripts = scope.querySelectorAll('script');
        scripts.forEach(old => {
            const s = document.createElement('script');
            [...old.attributes].forEach(a => s.setAttribute(a.name, a.value));
            s.textContent = old.textContent;
            old.replaceWith(s);
        });
    }

    async function loadPartials(opts = {}) {
        const nodes = document.querySelectorAll('[data-include]');
        if (!nodes.length) return;

        const tasks = [];
        nodes.forEach(el => {
            const includePath = el.getAttribute('data-include');
            const lang = el.getAttribute('data-lang');
            const url = lang ? includePath.replace(/(\.\w+)$/, `.${lang}$1`) : includePath;
            tasks.push(loadInto(el, url, opts));
            el.removeAttribute('data-include'); 
        });

        await Promise.all(tasks);
        await loadPartials(opts);
    }

    function start() {
        loadPartials({
            execScripts: true,   // 片段里若有 <script>，需要就设 true
            bustCache: false     // 开发期可以设 true，线上设 false
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }

    window.HTMLIncludes = { loadInto, loadPartials };
})();