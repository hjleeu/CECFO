(function () {
    const defaultDataUrl = "https://script.google.com/macros/s/AKfycbxtK3CsxFygMAXY7UUOaUYpA-AomB7zwRLo6x9elqj_1JA8kV2NDo6_1pknFBzUZDLg/exec";
    const storageKey = "cecfo_my_name";

    const DISPLAY_LABELS = {
        "host": "👨🏻‍💼 主持",
        "worship_pray": "🙏🏻 敬拜祷告",
        "memorial_pray": "🙏🏻 记念祷告",
        "sermon": "👨🏻‍💼 证道",
        "youth_comm": "👩🏻‍🏫 青年团契",
        "sunschool_senior": "👩🏻‍🏫 主日学大班",
        "sunschool_intermediate": "👩🏻‍🏫 主日学中班",
        "sunschool_junior": "👩🏻‍🏫 主日学小班",
        "scripture_reader": "📖 读经",
        "reception01": "🤝🏻 执勤",
        "reception02": "🤝🏻 执勤",
        "clean_up01": "🧹 值日",
        "clean_up02": "🧹 值日",
        "mix_team01": "🎧 音控组",
        "mix_team02": "🎧 音控组",
        "worship_leader": "🎤 敬拜主领",
        "worship_piano": "🎹 敬拜司琴",
        "worship_drums": "🥁 敬拜鼓手",
        "worship_guitar": "🎸 敬拜吉他手",
        "worship_bass": "🎸 敬拜贝斯手",
        "worship_vocal01": "🎤 敬拜领唱",
        "worship_vocal02": "🎤 敬拜领唱",
        "worship_vocal03": "🎤 敬拜领唱"
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

    /**
     * Return a style tag containing all css rules.
     * @returns the style tag
     */
    function ensureCustomCss() {
        const linkId = "cecfo-widget-css";
        if (document.getElementById(linkId)) return;
        const st = document.createElement("style");
        st.id = linkId;
        st.textContent = `
                    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@200..900&display=swap');

                    :root {
                        --cecfo-font: "Noto Serif SC", serif;

                        --cecfo-bg: #121212;
                        --cecfo-text: #f5f5f5;
                        --cecfo-subtext: #b0b0b0;
                        --cecfo-accent: #F2B94B; /* Dark theme accent */
                        --cecfo-accent-hover: #e0a935;
                        --cecfo-card-bg: #1c1c1c;
                        --cecfo-card-alt: #2a2a2a;
                        --cecfo-border: #444444;
                        --cecfo-alert-bg: rgba(242, 185, 75, 0.15);
                        --cecfo-alert-border: #F2B94B;
                        --cecfo-alert-text: #fcebbc;
                    }

                    .cecfo-widget {
                        font-family: var(--cecfo-font);
                        color: var(--cecfo-text) !important;
                        max-width: 520px;
                        margin: 0 auto;
                        padding: 1rem;
                        background-color: transparent;
                    }

                    .cecfo-widget ul,
                    .cecfo-widget li {
                        list-style: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    .cecfo-widget li::marker,
                    .cecfo-widget li::before {
                        content: none !important;
                    }

                    .cecfo-widget h5.cecfo-section-header,
                    .cecfo-section-header {
                        font-size: 1.15rem !important;
                        font-weight: 600 !important;
                        margin: 0 0 0.75rem !important;
                        color: var(--cecfo-text) !important;
                        background: none !important;
                    }

                    .cecfo-service-list {
                        margin: 0 0 1.5rem !important;
                        padding: 0 !important;
                        border: 1px solid var(--cecfo-border) !important;
                        border-radius: 8px !important;
                        overflow: hidden !important;
                    }

                    .cecfo-service-item {
                        display: flex !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                        padding: 0 !important;
                        border-bottom: 1px solid var(--cecfo-border) !important;
                        font-size: 0.99rem !important;
                        background-color: var(--cecfo-card-bg) !important;
                    }

                    .cecfo-service-item:last-child {
                        border-bottom: none !important;
                    }

                    .cecfo-service-item:nth-child(even) {
                        background-color: var(--cecfo-card-alt) !important;
                    }

                    .cecfo-service-role {
                        color: var(--cecfo-subtext) !important;
                        font-weight: 500 !important;
                        padding: 0.66rem !important;
                    }

                    .cecfo-service-person {
                        color: var(--cecfo-text) !important;
                        font-weight: 600 !important;
                        padding: 0.66rem !important;
                    }

                    .cecfo-alert {
                        padding: 0.75rem 1rem !important;
                        border-radius: 8px !important;
                        background-color: var(--cecfo-alert-bg) !important;
                        border: 1px solid var(--cecfo-alert-border) !important;
                        color: var(--cecfo-alert-text) !important;
                        font-size: 0.9rem !important;
                        margin-bottom: 1rem !important;
                    }

                    .cecfo-name-form {
                        display: flex !important;
                        gap: 0.5rem !important;
                        margin-bottom: 1.5rem !important;
                    }

                    .cecfo-name-input {
                        font-family: var(--cecfo-font);
                        flex: 1 !important;
                        padding: 0.5rem 0.75rem !important;
                        border: 1px solid var(--cecfo-border) !important;
                        background-color: var(--cecfo-card-bg) !important;
                        color: var(--cecfo-text) !important;
                        border-radius: 6px !important;
                        font-size: 0.95rem !important;
                    }

                    .cecfo-name-input::placeholder {
                        color: var(--cecfo-subtext) !important;
                    }

                    .cecfo-name-input:focus {
                        outline: none !important;
                        border-color: var(--cecfo-accent) !important;
                        box-shadow: 0 0 0 3px rgba(198, 138, 18, 0.2) !important;
                    }

                    .cecfo-btn {
                        font-family: var(--cecfo-font);
                        padding: 0.5rem 1rem !important;
                        border: none !important;
                        border-radius: 6px !important;
                        font-size: 0.9rem !important;
                        font-weight: 500 !important;
                        cursor: pointer !important;
                        transition: background-color 0.15s ease !important;
                    }

                    .cecfo-btn-primary {
                        background-color: var(--cecfo-accent) !important;
                        color: #ffffff !important;
                    }

                    .cecfo-btn-primary:hover {
                        background-color: var(--cecfo-accent-hover) !important;
                    }

                    .cecfo-btn-secondary {
                        background-color: transparent !important;
                        color: var(--cecfo-text) !important;
                        border: 1px solid var(--cecfo-border) !important;
                        margin-bottom: 0.75rem !important;
                    }

                    .cecfo-btn-secondary:hover {
                        background-color: rgba(128, 128, 128, 0.1) !important;
                    }

                    .cecfo-subscribe {
                        margin-top: 1.5rem !important;
                        padding-top: 1.5rem !important;
                        border-top: 1px solid var(--cecfo-border) !important;
                    }

                    .cecfo-subscribe p {
                        color: var(--cecfo-text) !important;
                    }

                    .cecfo-loading {
                        font-family: var(--cecfo-font);
                        text-align: center !important;
                        color: var(--cecfo-subtext) !important;
                        padding: 2rem 0 !important;
                        font-size: 0.9rem !important;
                    }
                `;
        document.head.appendChild(st);
    }

    /**
     * Ensure that the container exists. Otherwise create it and place it before the footer.
     * @param {*} scriptEl 
     * @param {string} containerId container DOM id
     * @returns the container
     */
    function ensureContainer(scriptEl, containerId) {
        let container = document.getElementById(containerId);
        if (container) return container;

        // If the container does not exist, create it.
        container = document.createElement("div");
        container.id = containerId;
        container.className = "cecfo-widget";

        if (scriptEl && scriptEl.parentNode) {
            // 1. If script tag is present, insert it right after the script element
            scriptEl.parentNode.insertBefore(container, scriptEl.nextSibling);
        } else {
            // 2. Fallback: Try to find a footer or main wrapper to anchor right before the footer
            const footer = document.querySelector("footer") || document.querySelector(".footer") || document.getElementById("footer");
            
            if (footer && footer.parentNode) {
                footer.parentNode.insertBefore(container, footer);
            } else {
                // 3. Absolute fallback: append to body if no footer is found
                document.body.appendChild(container);
            }
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
        const month = sunday.getMonth() + 1;
        const dayOfMonth = sunday.getDate();
        const weekOfMonth = Math.ceil(dayOfMonth / 7);
        return `${year}年${month}月第${weekOfMonth}周`;
    }

    /**
     * Return only the current week data.
     * @param {*} data the entire data
     * @returns the filter data for this current week
     */
    function filterByWeek(data) {
        const target = getCurrentWeekLabel();
        return data.find(week => week.date && week.date.toString().trim() === target);
    }

    /**
     * Rendering the current week service list.
     * @param {*} container 
     * @param {*} weekData the current week data
     * @returns 
     */
    function renderThisWeekServices(container, weekData) {
        const section = document.createElement("div");
        const header = document.createElement("h5");
        header.className = "cecfo-section-header";
        header.textContent = `${weekData && weekData.date ? weekData.date : "-"} | 主日聚会服事安排`;
        section.appendChild(header);

        if (!weekData) {
            section.innerHTML += `<div class="cecfo-alert">本周暂未有服事安排。</div>`;
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

    /**
     * Rendering the subscription section.
     * @param {*} container 
     */
    function renderSubscribeSection(container) {
        const section = document.createElement("div");
        section.className = "cecfo-subscribe";
        const existingName = localStorage.getItem(storageKey);

        function renderSubscribedState(name) {
            section.innerHTML = "";
            const msg = document.createElement("div");
            msg.className = "cecfo-alert";
            msg.textContent = `🔔 当前服事订阅提醒为： ${name} 弟兄/姊妹。`;
            section.appendChild(msg);

            const changeBtn = document.createElement("button");
            changeBtn.className = "cecfo-btn cecfo-btn-secondary";
            changeBtn.textContent = "⇄ 切换订阅对象";
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
            intro.textContent = "🔔 订阅服事提醒";
            section.appendChild(intro);

            const desc = document.createElement("p");
            desc.textContent = "输入你的名字，当你有服事安排时会收到通知。";
            section.appendChild(desc);

            const form = document.createElement("form");
            form.className = "cecfo-name-form";
            form.innerHTML = `
                        <input type="text" class="cecfo-name-input" placeholder="请输入你的名字" required>
                        <button type="submit" class="cecfo-btn cecfo-btn-primary">➤ 订阅</button>
                    `;

            form.onsubmit = async (e) => {
                 e.preventDefault();
                 const name = form.querySelector("input").value.trim();
                 if (!name) return;

                 if (window.OneSignal) {
                     try {
                         // 1. Request browser notification permission natively
                         await window.OneSignal.Notifications.requestPermission(true);

                         // 2. Create a clean ASCII-safe tag value to avoid multi-byte encoding/display bugs
                         const safeTagValue = btoa(encodeURIComponent(name));

                         // 3. Push to OneSignalDeferred safely
                         window.OneSignalDeferred = window.OneSignalDeferred || [];
                         window.OneSignalDeferred.push(async function (OneSignal) {
                             await OneSignal.User.addTag("service_name", safeTagValue);
                             await OneSignal.User.addTag("display_name", name);
                         });

                         console.log("Successfully subscribed and tagged:", name);
                     } catch (err) {
                         console.error("OneSignal permission/tag error:", err);
                     }
                 }

                 // 4. Save locally and update UI state
                 localStorage.setItem(storageKey, name);
                 renderSubscribedState(name);
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
            dataUrl: defaultDataUrl
        }, options || {});

        ensureCustomCss();
        let container = document.getElementById(config.containerId);
        container.className = "cecfo-widget";
        if (!container) {
            container = ensureContainer(scriptEl, config.containerId);
        }

        container.innerHTML = `<div class="cecfo-loading">正在加载本周服事安排...</div>`;

        const allData = await fetchJson(config.dataUrl, []);
        const weekData = filterByWeek(allData);

        container.innerHTML = "";
        renderSubscribeSection(container);
        renderThisWeekServices(container, weekData);
    }

    const currentScript = document.currentScript;
    if (currentScript && currentScript.dataset.autoRun !== "false") {
        init(currentScript);
    }
})();