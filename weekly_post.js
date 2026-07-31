(function () {
    const defaultDataUrl = "";

    async function fetchJson(url, fallbackValue) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("HTTP " + response.status);
            return await response.json();
        } catch (error) {
            console.error("Error fetching JSON: ", url, error);
            return fallbackValue;
        }
    }

    function ensureCustomCss() {
        const st = document.createElement("style");
        st.textContent = `
            
        `;
        document.head.appendChild(st);
    }

    function renderWidget(container, data) {

    }

    async function init(scriptEl, options) {
        const scriptUrl = scriptEl ? scriptEl.dataset.url : null;

        const config = Object.assign({
            containerId: "church_widget_container",
            dataUrl: scriptUrl || defaultDataUrl
        }, options || {});

        ensureCustomCss();
        let container = document.getElementById(config.containerId);
        if (!container) {
            container = document.createElement("div");
            container.id = config.containerId;

            if (scriptEl && scriptEl.parentNode) {
                scriptEl.parentNode.insertBefore(container, scriptEl.nextSibling);
            } else {
                document.body.appendChild(container);
            }
        }

        if (!config.dataUrl) {
            container.innerHTML = `<div style="text-align:center; padding:1.5rem; color:#ff6b6b;">错误：未提供数据 URL (data-url)。</div>`;
            return;
        }

        container.innerHTML = `<div style="text-align:center; padding:1.5rem;">正在加载聚会安排...</div>`;
        const data = await fetchJson(config.dataUrl, null);
        renderWidget(container, data);
    }

    const currentScript = document.currentScript;
    if (currentScript && currentScript.dataset.autoRun !== "false") {
        init(currentScript);
    }
})();
