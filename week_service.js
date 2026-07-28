(function () {
    const defaultDataUrl = "https://script.google.com/macros/s/AKfycbxtK3CsxFygMAXY7UUOaUYpA-AomB7zwRLo6x9elqj_1JA8kV2NDo6_1pknFBzUZDLg/exec";
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
        const linkId = "cecfo-widget-css";
        if (document.getElementById(linkId)) return;
        const st = document.createElement("style");
        st.id = linkId;
        st.textContent = `
            .cecfo-widget {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
                color: #f5f5f5 !important;
                max-width: 640px;
                margin: 0 auto;
                padding: 1rem;
                background-color: transparent;
                /* No max-height or overflow restrictions - flows naturally before footer */
            }

            .cecfo-widget ul,
            .cecfo-widget li {
                list-style: none !important;
                list-style-type: none !important;
                list-style-image: none !important;
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
                color: #f5f5f5 !important;
                background: none !important;
            }

            .cecfo-service-list {
                margin: 0 0 1.5rem !important;
                padding: 0 !important;
                border: 1px solid #444 !important;
                border-radius: 8px !important;
                overflow: hidden !important;
            }

            .cecfo-service-item {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                padding: 0.6rem 1rem !important;
                border-bottom: 1px solid #3a3a3a !important;
                font-size: 0.95rem !important;
                background-color: #1c1c1c !important;
            }

            .cecfo-service-item:last-child {
                border-bottom: none !important;
            }

            .cecfo-service-item:nth-child(even) {
                background-color: #2a2a2a !important;
            }

            .cecfo-service-role {
                color: #b0b0b0 !important;
                font-weight: 500 !important;
            }

            .cecfo-service-person {
                color: #ffffff !important;
                font-weight: 600 !important;
            }

            .cecfo-alert {
                padding: 0.75rem 1rem !important;
                border-radius: 8px !important;
                background-color: rgba(242, 185, 75, 0.15) !important;
                border: 1px solid #f2b94b !important;
                color: #fcebbc !important;
                font-size: 0.9rem !important;
                margin-bottom: 1rem !important;
            }

            .cecfo-name-form {
                display: flex !important;
                gap: 0.5rem !important;
                margin-bottom: 1.5rem !important;
            }

            .cecfo-name-input {
                flex: 1 !important;
                padding: 0.5rem 0.75rem !important;
                border: 1px solid #555 !important;
                background-color: #1c1c1c !important;
                color: #fff !important;
                border-radius: 6px !important;
                font-size: 0.95rem !important;
            }

            .cecfo-name-input::placeholder {
                color: #888 !important;
            }

            .cecfo-name-input:focus {
                outline: none !important;
                border-color: #F2B94B !important;
                box-shadow: 0 0 0 3px rgba(242, 185, 75, 0.25) !important;
            }

            .cecfo-btn {
                padding: 0.5rem 1rem !important;
                border: none !important;
                border-radius: 6px !important;
                font-size: 0.9rem !important;
                font-weight: 500 !important;
                cursor: pointer !important;
                transition: background-color 0.15s ease !important;
            }

            .cecfo-btn-primary {
                background-color: #F2B94B !important;
                color: #1a1a1a !important;
            }

            .cecfo-btn-primary:hover {
                background-color: #e0a935 !important;
            }

            .cecfo-btn-secondary {
                background-color: transparent !important;
                color: #ccc !important;
                border: 1px solid #666 !important;
                margin-bottom: 0.75rem !important;
            }

            .cecfo-btn-secondary:hover {
                background-color: rgba(255, 255, 255, 0.1) !important;
                color: #fff !important;
            }

            .cecfo-subscribe {
                margin-top: 1.5rem !important;
                padding-top: 1.5rem !important;
                border-top: 1px solid #444 !important;
            }

            .cecfo-subscribe p {
                color: #ddd !important;
            }

            .cecfo-loading {
                text-align: center !important;
                color: #999 !important;
                padding: 2rem 0 !important;
                font-size: 0.9rem !important;
            }
        `;
        document.head.appendChild(st);
    }

    function ensureContainer(scriptEl, containerId) {
        let container = document.getElementById(containerId);
        if (container) return container;

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
            form.action = "";
            form.innerHTML = `
                <input type="text" class="cecfo-name-input" placeholder="请输入你的名字" required autocomplete="name">
                <button type="submit" class="cecfo-btn cecfo-btn-primary">订阅</button>
            `;

            const statusMsg = document.createElement("div");

            form.onsubmit = (e) => {
                e.preventDefault();
                const input = form.querySelector("input");
                const name = input.value.trim();
                if (!name) return;

                const button = form.querySelector("button");
                button.disabled = true;
                button.textContent = "订阅中...";

                window.OneSignalDeferred = window.OneSignalDeferred || [];
                window.OneSignalDeferred.push(function(OneSignal) {
                    try {
                        if (OneSignal && OneSignal.Slidedown) {
                            OneSignal.Slidedown.promptPush({ force: true });
                        }
                        
                        if (OneSignal && OneSignal.User) {
                            OneSignal.User.addTag("service_name", name);
                        }

                        localStorage.setItem(storageKey, name);
                        renderSubscribedState(name);
                    } catch (err) {
                        console.error("OneSignal prompt error:", err);
                        button.disabled = false;
                        button.textContent = "订阅";
                        statusMsg.className = 'cecfo-alert';
                        statusMsg.textContent = "订阅遇到问题，请重试";
                        section.appendChild(statusMsg);
                    }
                });
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

        const container = ensureContainer(scriptEl, config.containerId);
        const allData = await fetchJson(config.dataUrl, []);
        const weekData = filterByWeek(allData);

        renderSubscribeSection(container);
        renderThisWeekServices(container, weekData);
    }

    window.renderThisWeekServices = renderThisWeekServices;
    window.initThisWeek = (options) => init(null, options);

    const currentScript = document.currentScript;
    if (currentScript && currentScript.dataset.autoRun !== "false") {
        const containerId = currentScript.dataset.containerId || "this_week_container";
        const dataUrl = currentScript.dataset.dataUrl || defaultDataUrl;
        init(currentScript, { containerId, dataUrl });
    }
})();