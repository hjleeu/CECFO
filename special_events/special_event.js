/**
 * An IIFE file for rendering a post for special events.
 * Required a div element with id "i_am_a_container" in the HTML file.
 */
(function () {
    const TYPE_ICON = {
        worship: "🎶",
        sermon: "👨🏻‍💼",
        prayer: "🙏🏻",
        scripture: "📖",
        choir: "🎤",
        break: "☕",
        meal: "🍽️",
        branch: "👉🏼",
        ending: "⌛"
    }

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

            .cecfo-widget {
                color-scheme: light dark;
                --cecfo-font: "Noto Serif SC", serif;

                /* Default Light Theme Variables */
                --cecfo-bg: #ffffff;
                --cecfo-text: #212529;
                --cecfo-subtext: #6c757d;
                --cecfo-accent: #425AEF;
                --cecfo-accent-hover: #3447cb;
                --cecfo-card-bg: #f8f9fa;
                --cecfo-card-alt: #e9ecef;
                --cecfo-border: #dee2e6;
                --cecfo-alert-bg: rgba(66, 90, 239, 0.08);
                --cecfo-alert-border: #425AEF;
                --cecfo-alert-text: #27348c;
                --cecfo-shadow: rgba(66, 90, 239, 0.2);
                --cecfo-hover-bg: rgba(0, 0, 0, 0.05);

                font-family: var(--cecfo-font);
                color: var(--cecfo-text) !important;
                max-width: 520px;
                margin: 0 auto;
                padding: 1rem;
                background-color: transparent;
            }

            /* Automatic Dark Mode Adjustments */
            @media (prefers-color-scheme: dark) {
                .cecfo-widget {
                    --cecfo-bg: #121212;
                    --cecfo-text: #f5f5f5;
                    --cecfo-subtext: #b0b0b0;
                    --cecfo-accent: #f2b94b;
                    --cecfo-accent-hover: #d9a43f;
                    --cecfo-card-bg: #1c1c1c;
                    --cecfo-card-alt: #2a2a2a;
                    --cecfo-border: #444444;
                    --cecfo-alert-bg: rgba(242, 185, 75, 0.15);
                    --cecfo-alert-border: #f2b94b;
                    --cecfo-alert-text: #fcebbc;
                    --cecfo-shadow: rgba(242, 185, 75, 0.2);
                    --cecfo-hover-bg: rgba(255, 255, 255, 0.1);
                }
            }

            .cecfo-widget * { box-sizing: border-box; }

            .cecfo-title {
                text-align: center;
                font-size: 1.4rem;
                font-weight: 700;
                margin: 0 0 1.5rem;
                color: var(--cecfo-text);
            }

            .cecfo-nav {
                position: sticky;
                top: 0.73rem;
                border: 1px solid var(--cecfo-border);
                display: flex;
                justify-content: space-between;
                gap: 0.37rem;
                color: var(--cecfo-text);
                background-color: var(--cecfo-card-bg);
                padding: 0.37rem;
                border-radius: 15px;
                margin-bottom: 1.5rem;
                z-index: 100;
            }

            .cecfo-nav-item {
                flex: 1 1 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                cursor: pointer;
                color: var(--cecfo-text);
                border-radius: 10px;
                padding: 0.3rem 0.5rem;
                transition: background-color 0.15s ease, color 0.15s ease;
            }

            .cecfo-nav-item:hover {
                background-color: var(--cecfo-hover-bg);
            }

            .cecfo-nav-item.is-active {
                background-color: var(--cecfo-accent);
                color: var(--cecfo-bg);
            }

            .cecfo-nav-item.is-active .cecfo-nav-time {
                color: var(--cecfo-bg);
                opacity: 0.85;
            }

            .cecfo-nav-label {
                font-weight: 600;
            }

            .cecfo-nav-time {
                font-size: 0.8rem;
                color: var(--cecfo-subtext);
            }

            .cecfo-day {
                margin-bottom: 2.5rem;
                scroll-margin-top: 5.2rem;
            }

            .cecfo-day:last-child {
                margin-bottom: 0;
            }

            .cecfo-day-title {
                display: inline-block;
                font-size: 1.05rem;
                font-weight: 700;
                color: var(--cecfo-bg);
                background: var(--cecfo-accent);
                padding: 0.3rem 0.9rem;
                border-radius: 999px;
                margin-bottom: 1.25rem;
            }

            .cecfo-timeline {
                position: relative;
                list-style: none;
                margin: 0;
                padding: 0;
            }

            /* the vertical line running through all markers */
            .cecfo-timeline::before {
                content: "";
                position: absolute;
                left: 19px;
                top: 6px;
                bottom: 6px;
                width: 2px;
                background: var(--cecfo-border);
            }

            .cecfo-item {
                position: relative;
                display: flex;
                gap: 1rem;
                padding-bottom: 1.5rem;
            }

            .cecfo-item:last-child {
                padding-bottom: 0;
            }

            .cecfo-marker {
                position: relative;
                z-index: 1;
                flex: 0 0 auto;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: var(--cecfo-card-bg);
                border: 2px solid var(--cecfo-accent);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.15rem;
                box-shadow: 0 0 0 4px var(--cecfo-bg);
            }

            .cecfo-content {
                flex: 1 1 auto;
                background: var(--cecfo-card-bg);
                border: 1px solid var(--cecfo-border);
                border-radius: 10px;
                padding: 0.7rem 0.9rem;
                min-width: 0;
            }

            .cecfo-time {
                font-size: 0.78rem;
                font-weight: 600;
                letter-spacing: 0.02em;
                color: var(--cecfo-accent);
            }

            .cecfo-item-title {
                font-size: 1rem;
                font-weight: 700;
                margin: 0.15rem 0 0;
                color: var(--cecfo-text);
            }

            .cecfo-descr {
                font-size: 0.85rem;
                color: var(--cecfo-subtext);
                margin: 0.25rem 0 0;
                line-height: 1.4;
            }

            .cecfo-details {
                margin-top: 0.5rem;
                padding-top: 0.5rem;
                border-top: 1px dashed var(--cecfo-border);
                font-size: 0.82rem;
                color: var(--cecfo-subtext);
            }

            .cecfo-details-person {
                font-weight: 600;
                color: var(--cecfo-text);
                margin-bottom: 0.2rem;
            }

            .cecfo-songs {
                list-style: none;
                margin: 0;
                padding: 0;
            }

            .cecfo-songs li {
                position: relative;
                padding-left: 0.9rem;
            }

            .cecfo-songs li::before {
                content: "\\266A";
                position: absolute;
                left: 0;
                color: var(--cecfo-accent);
                font-size: 0.7rem;
                top: 0.2em;
            }

            .cecfo-loading {
                text-align: center;
                color: var(--cecfo-subtext);
                padding: 2rem 0;
                font-size: 0.9rem;
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
     * Escape a string for safe HTML insertion.
     * @param {string} str
     * @returns {string}
     */
    function esc(str) {
        if (str === undefined || str === null) return "";
        return String(str).replace(/[&<>"']/g, (c) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[c]));
    }

    /**
     * Render the "details" block for an item (leader/group + song list), if present.
     * @param {*} details
     * @returns {string} html
     */
    function renderDetails(details) {
        if (!details) return "";

        const person = details.leader || details.group;
        const songs = (details.songs || []).filter((s) => s && s.title);

        if (!person && songs.length === 0) return "";

        const personHtml = person
            ? `<div class="cecfo-details-person">${esc(person)}</div>`
            : "";

        const songsHtml = songs.length
            ? `<ul class="cecfo-songs">${songs.map((s) => `<li>${esc(s.title)}</li>`).join("")}</ul>`
            : "";

        return `<div class="cecfo-details">${personHtml}${songsHtml}</div>`;
    }

    /**
     * Render a single schedule item as a timeline entry.
     * @param {*} item
     * @returns {string} html
     */
    function renderItem(item) {
        const icon = TYPE_ICON[item.type] || "•";
        const descrHtml = item.descr
            ? `<p class="cecfo-descr">${esc(item.descr)}</p>`
            : "";

        return `
            <li class="cecfo-item">
                <div class="cecfo-marker">${icon}</div>
                <div class="cecfo-content">
                    <div class="cecfo-time">${esc(item.time)}</div>
                    <h4 class="cecfo-item-title">${esc(item.title)}</h4>
                    ${descrHtml}
                    ${renderDetails(item.details)}
                </div>
            </li>
        `;
    }

    /**
     * Render one date's schedule as its own vertical timeline.
     * @param {*} dateEntry one entry of data.dates
     * @param {number} idx index of this date within data.dates, used to build its anchor id
     * @returns {string} html
     */
    function renderDay(dateEntry, idx) {
        const items = (dateEntry.schedule || []).map(renderItem).join("");
        return `
            <section class="cecfo-day" id="cecfo-day-${idx}">
                <div class="cecfo-day-title">${esc(dateEntry.date)}</div>
                <ul class="cecfo-timeline">${items}</ul>
            </section>
        `;
    }

    /**
     * Split a date string like "2026.09.05 周六" into a short label and a
     * sub label, so the nav item can show e.g. "周六" / "09.05".
     * Falls back gracefully if the format differs.
     * @param {string} dateStr
     * @returns {{label: string, sub: string}}
     */
    function splitDateLabel(dateStr) {
        const str = (dateStr || "").trim();
        const parts = str.split(/\s+/);
        const datePart = parts[0] || str;
        const weekday = parts[1] || "";
        const segments = datePart.split(".");
        const shortDate = segments.length >= 2
            ? segments.slice(-2).join(".")
            : datePart;

        return weekday
            ? { label: weekday, sub: shortDate }
            : { label: shortDate, sub: "" };
    }

    /**
     * Render the sticky nav bar with one item per date, linking to that
     * date's timeline section.
     * @param {*} data the fetched JSON data
     * @returns {string} html
     */
    function renderNav(data) {
        if (!Array.isArray(data.dates) || data.dates.length === 0) return "";

        const items = data.dates.map((dateEntry, idx) => {
            const { label, sub } = splitDateLabel(dateEntry.date);
            const subHtml = sub ? `<span class="cecfo-nav-time">${esc(sub)}</span>` : "";
            return `
                <div class="cecfo-nav-item" data-target="cecfo-day-${idx}">
                    <span class="cecfo-nav-label">${esc(label)}</span>
                    ${subHtml}
                </div>
            `;
        }).join("");

        return `<div class="cecfo-nav">${items}</div>`;
    }

    /**
     * Render the full event: a title plus one vertical timeline per date.
     * @param {*} data the fetched JSON data
     * @returns {string} html
     */
    function renderTimeLine(data) {
        if (!data || !Array.isArray(data.dates)) {
            return `<div class="cecfo-loading">暂无数据</div>`;
        }

        const titleHtml = data.name
            ? `<h2 class="cecfo-title">${esc(data.name)}</h2>`
            : "";

        const navHtml = renderNav(data);
        const daysHtml = data.dates.map((dateEntry, idx) => renderDay(dateEntry, idx)).join("");

        return `${titleHtml}${navHtml}${daysHtml}`;
    }

    /**
     * Wire up click-to-scroll on nav items, and keep the nav item for the
     * currently visible day highlighted as the user scrolls.
     * @param {HTMLElement} container
     */
    function activateNav(container) {
        const navItems = container.querySelectorAll(".cecfo-nav-item");
        if (!navItems.length) return;

        navItems.forEach((el) => {
            el.addEventListener("click", () => {
                const target = document.getElementById(el.dataset.target);
                if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });

        if (typeof IntersectionObserver === "undefined") return;

        const setActive = (id) => {
            navItems.forEach((el) => {
                el.classList.toggle("is-active", el.dataset.target === id);
            });
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) setActive(entry.target.id);
            });
        }, { root: null, threshold: 0, rootMargin: "-45% 0px -45% 0px" });

        container.querySelectorAll(".cecfo-day").forEach((section) => observer.observe(section));

        setActive(navItems[0].dataset.target);
    }

    async function init(scriptEl, options) {
        const config = Object.assign({
            containerId: "i_am_a_container",
            dataUrl: scriptEl.dataset.url
        }, options || {});

        ensureCustomCss();
        let container = document.getElementById(config.containerId);
        if (!container) {
            container = ensureContainer(scriptEl, config.containerId);
        }
        container.className = "cecfo-widget";

        container.innerHTML = `<div class="cecfo-loading">正在加载中...</div>`;

        const data = await fetchJson(config.dataUrl, null);

        container.innerHTML = renderTimeLine(data);
        if (data) activateNav(container);
    }

    const currentScript = document.currentScript;
    if (currentScript && currentScript.dataset.autoRun !== "false") {
        init(currentScript);
    }
})();