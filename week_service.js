(function () {
    const defaultDataUrl = "https://script.google.com/macros/s/AKfycbxtK3CsxFygMAXY7UUOaUYpA-AomB7zwRLo6x9elqj_1JA8kV2NDo6_1pknFBzUZDLg/exec";
    const VAPID_PUBLIC_KEY = "BFNWckOeAM7T9VeE3zxC7kKNzbDEIhQ8NjsTSJGSfE3fVlkKSOHCGsi-tCb7zVChrIwgVp-4KTetK-YuWS2h9_c";
    const storageKey = "cecfo_my_name";

    const DISPLAY_LABELS = {
        "host": "主持",
        "worship_pray": "敬拜祷告",
        "memorial_pray": "记念祷告",
        "sermon": "证道",
        "youth_comm": "青年团契",
        "sunschool_senior": "主日学大班",
        "sunschool_intermediate": "主日学中班",
        "sunschool_junior": "主日学小班",
        "scripture_reader": "读经",
        "reception01": "执勤01",
        "reception02": "执勤02",
        "clean_up01": "值日01",
        "clean_up02": "值日02",
        "mix_team01": "音控组01",
        "mix_team02": "音控组02",
        "worship_leader": "带领",
        "worship_piano": "司琴",
        "worship_drums": "鼓手",
        "worship_guitar": "吉他手",
        "worship_bass": "贝斯手",
        "worship_vocal01": "领唱01",
        "worship_vocal02": "领唱02",
        "worship_vocal03": "领唱03"
    };

    /**
     * Fetch the JSON data.
     * @param {string} url the url of the data
     * @param {*} fallbackValue 
     * @returns 
     */
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

    function ensureCustomCss(href) {
        const linkId = "cecfo-widget-css";
        if (document.getElementById(linkId)) return;
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
    }

    /**
     * Ensure the container exist. If not create it.
     * @param {*} scriptEl 
     * @param {*} containerId container id
     * @returns 
     */
    function ensureContainer(scriptEl, containerId) {
        let container = document.getElementById(containerId);
        if (container) return container;

        // If the container does not exist, create it.
        container = document.createElement("div");
        container.id = containerId;
        container.className = "cecfo-widget";
        if (scriptEl && scriptEl.parentNode) {
            scriptEl.parentNode.insertBefore(container, scriptEl.nextSibling);
        } else {
            document.body.appendChild(container);
        }

        return container;
    }

    /**
     * Return the date in a well formatted string.
     * @returns a formatted string rapresenting the date label
     */
    function getCurrentWeekLabel() {
        const today = new Date();
        const dayNumber = today.getDay();
        const daysUntilSunday = dayNumber === 0 ? 0 : 7 - dayNumber;
        const sunday = new Date(today);
        sunday.setDate(today.getDate() + daysUntilSunday);

        const year = sunday.getFullYear();
        const month = sunday.getMonth() + 1; // Zero-based.
        const dayOfMonth = sunday.getDate();
        const weekOfMonth = Math.ceil(dayOfMonth / 7);

        return `${year}年${month}月第${weekOfMonth}周`;
    }

    function filterByWeek(data) {
        const target = getCurrentWeekLabel();
        return data.find(week => week.date && week.date.toString().trim() === target);
    }

    function renderThisWeekServices(container, weekData) {
        const section = document.createElement("div");

        const header = document.createElement("h5");
        header.className = "cecfo-section-header";
        header.textContent = `本周服事安排 (${weekData ? weekData.date : "-"})`;
        section.appendChild(header);

        if (!weekData) {
            section.innerHTML += `
                <div class="cecfo-alert">本周暂未有服事安排。</div>
            `;
            container.appendChild(section);
            return;
        }

        const list = document.createElement("ul");
        list.className = "cecfo-service-list";

        for (const key in DISPLAY_LABELS) {
            const value = weekData[key];

            if (value) {
                const li = document.createElement("li");
                li.className = "cecfo-service-item";
                li.innerHTML = `
                    <span class="cecfo-service-role">${DISPLAY_LABELS[key]}</span>
                    <span class="cecfo-service-person">${value}</span>
                `;
                list.appendChild(li);
            }
        }

        section.appendChild(list);
        container.appendChild(section);
    }

    async function subscribeToNotifications(name, onStatus) {
       if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            onStatus('error', '此浏览器不支持推送通知');
            return false;
        }

        try {
            const reg = await navigator.serviceWorker.ready;
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                onStatus('denied', '未授权通知权限，稍后可在浏览器设置中开启');
                return false;
            }

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            const res = await fetch('/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, subscription: sub })
            });

            if (!res.ok) throw new Error('HTTP ' + res.status);

            localStorage.setItem(storageKey, name);
            onStatus('success', '订阅成功！本周有安排时会通知你');
            return true;
        } catch (err) {
            console.error('Subscribe failed:', err);
            onStatus('error', '订阅失败，请重试');
            return false;
        }
    }

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = atob(base64);
        return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
    }

    function renderSubscribeSection(container) {
        const section = document.createElement("div");
        section.className = "cecfo-subscribe";

        const existingName = localStorage.getItem(storageKey);

        function renderSubscribedState(name) {
            section.innerHTML = "";
            const msg = document.createElement("div");
            msg.className = "cecfo-alert";
            msg.textContent = `已为 ${name} 订阅服事提醒`;
            section.appendChild(msg);

            const changeBtn = document.createElement("button");
            changeBtn.className = "cecfo-btn cecfo-btn-secondary";
            changeBtn.textContent = "切换姓名";
            changeBtn.onclick = () => {
                localStorage.removeItem(storageKey);
                renderForm();
            };
            section.appendChild(changeBtn);
        }

        function renderForm() {
            section.innerHTML = "";

            const intro = document.createElement("p");
            intro.className = "cecfo-section-header";
            intro.textContent = "订阅服事提醒";
            section.appendChild(intro);

            const desc = document.createElement("p");
            desc.textContent = "输入你的名字，当你有服事安排时会收到通知。";
            section.appendChild(desc);

            const form = document.createElement("form");
            form.className = "cecfo-name-form";
            form.innerHTML = `
                <input type="text" class="cecfo-name-input" placeholder="请输入你的名字" required>
                <button type="submit" class="cecfo-btn cecfo-btn-primary">订阅</button>
            `;

            const statusMsg = document.createElement("div");

            form.onsubmit = async (e) => {
                e.preventDefault();
                const input = form.querySelector("input");
                const name = input.value.trim();
                if (!name) return;

                const button = form.querySelector("button");
                button.disabled = true;
                button.textContent = "订阅中...";

                const success = await subscribeToNotifications(name, (type, message) => {
                    statusMsg.className = type === 'success' ? 'cecfo-alert' : 'cecfo-alert';
                    statusMsg.textContent = message;
                });

                if (success) {
                    renderSubscribedState(name);
                } else {
                    button.disabled = false;
                    button.textContent = "订阅";
                    section.appendChild(statusMsg);
                }
            };

            section.appendChild(form);
        }

        if (existingName) {
            renderSubscribedState(existingName);
        } else {
            renderForm();
        }

        container.appendChild(section);
    }

    async function init(scriptEl, options) {
        const config = Object.assign({
            containerId: "this_week_container",
            dataUrl: defaultDataUrl,
            cssUrl: "week_service.css"
        }, options || {});

        if (config.cssUrl) ensureCustomCss(config.cssUrl);

        const container = ensureContainer(scriptEl, config.containerId);
        const allData = await fetchJson(config.dataUrl, []);
        const weekData = filterByWeek(allData);

        renderThisWeekServices(container, weekData);
        renderSubscribeSection(container);
    }

    window.renderThisWeekServices = renderThisWeekServices;
    window.initThisWeek = (options) => init(null, options);

    const currentScript = document.currentScript;
    if (currentScript && currentScript.dataset.autoRun !== "false") {
        const containerId = currentScript.dataset.containerId || "this_week_container";
        const dataUrl = currentScript.dataset.dataUrl || defaultDataUrl;
        const cssUrl = currentScript.dataset.cssUrl || "week_service.css";
        init(currentScript, { containerId, dataUrl, cssUrl });
    }
})();