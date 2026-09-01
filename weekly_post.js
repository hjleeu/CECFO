/**
 * CECFO Weekly Post JS.
 * An IIFE file which render the weekly post.
 * Required a div element with id: "i_am_container" in the .html file.
 */
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
            @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@200..900&display=swap');

            #i_am_container {
                color-scheme: light dark;
                --font: "Noto Serif SC", serif;

                /* Default Light Theme Variables */
                --bg: #ffffff;
                --text: #212529;
                --subtext: #6c757d;
                --accent: #425AEF;
                --accent-hover: #3447cb;
                --card-bg: #f8f9fa;
                --card-alt: #e9ecef;
                --border: #dee2e6;
                --alert-bg: rgba(66, 90, 239, 0.08);
                --alert-border: #425AEF;
                --alert-text: #27348c;
                --shadow: rgba(66, 90, 239, 0.2);
                --hover-bg: rgba(0, 0, 0, 0.05);

                font-family: var(--font);
                color: var(--text);
                max-width: 789px;
                margin: 0 auto;
                padding: 1rem;
                background-color: transparent;
            }

            /* Automatic Dark Mode Adjustments */
            @media (prefers-color-scheme: dark) {
                #i_am_container {
                    --bg: #121212;
                    --text: #f5f5f5;
                    --subtext: #b0b0b0;
                    --accent: #f2b94b;
                    --accent-hover: #d9a43f;
                    --card-bg: #1c1c1c;
                    --card-alt: #2a2a2a;
                    --border: #444444;
                    --alert-bg: rgba(242, 185, 75, 0.15);
                    --alert-border: #f2b94b;
                    --alert-text: #fcebbc;
                    --shadow: rgba(242, 185, 75, 0.2);
                    --hover-bg: rgba(255, 255, 255, 0.1);
                }
            }

            .nav {
                position: sticky;
                top: 0.73rem;
                border: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                color: var(--text);
                background-color: var(--card-bg);
                padding: 0.37rem;
                border-radius: 15px;
                margin-bottom: 0.37rem;
                z-index: 100;
            }

            .nav-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                cursor: pointer;
                color: var(--text);
                border-radius: 10px;
                padding: 0.25rem 0.5rem;
                transition: background-color 0.15s ease;
            }

            .nav-item:hover {
                background-color: var(--hover-bg);
            }

            .nav-label {
                font-weight: 600;
            }

            .nav-time {
                font-size: 0.8rem;
                color: var(--subtext);
            }

            .section-heading {
                font-size: 1.15rem;
                font-weight: bold;
                display: block;
                color: var(--text);
            }

            .section-meta {
                display: block;
                color: var(--subtext);
                font-size: 0.9rem;
                margin-bottom: 0.5rem;
            }

            .sermon-outline {
                position: relative;
                display: block;
                color: var(--text);
            }

            .sermon-scripture {
                position: relative;
                border: 1px solid var(--alert-border);
                border-radius: 5px;
                padding: 3px 8px;
                margin: 0.25rem 1rem;
                background-color: var(--alert-bg);
                color: var(--alert-text);
            }

            .song-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0.37rem 0.25rem;
                border-bottom: 1px solid var(--border);
            }

            .song-title {
                color: var(--text);
            }

            .song-meta {
                display: flex;
                gap: 0.52rem;
            }

            .song-link {
                text-decoration: none;
                opacity: 0.73;
                transition: opacity 0.15s ease, transform 0.15s ease;
                color: var(--subtext);
            }

            .song-link:hover {
                opacity: 1;
                transform: translateY(-1.37px)
            }

            .live-section {
                border-top: 1px solid var(--border);
                padding-top: 0.37rem;
                margin-top: 0.37rem;
            }

            .live-embed {
                position: relative;
                width: 100%;
                aspect-ratio: 16 / 9;
                border-radius: 12px;
                overflow: hidden;
                border: 1px solid var(--border);
                background-color: var(--card-bg);
            }

            .live-embed iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: block;
            }

            [id="诗歌敬拜"],
            [id="信息分享"] {
                scroll-margin-top: 73px;
            }
        `;
        document.head.appendChild(st);
    }

    function renderContent(container, data) {
        container.innerHTML = '';

        const schedule = [
            { "name": "诗歌敬拜", "time": "15.00-15.30" },
            { "name": "信息分享", "time": "16.00-17.00" }
        ];

        /* NAVBAR. */
        const nav = document.createElement("div");
        nav.className = "nav";
        container.appendChild(nav);

        schedule.forEach(e => {
            const item = document.createElement('div');
            item.className = 'nav-item';
            item.innerHTML = `
                <span class="nav-label">${e.name}</span>
                <span class="nav-time">${e.time}</span>
            `;

            item.addEventListener('click', () => {
                const target = document.getElementById(e.name);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });

            nav.appendChild(item);
        });

        const worship_section = document.createElement("div");
        worship_section.className = "";
        container.appendChild(worship_section);
        worship_section.innerHTML = `<span id="诗歌敬拜" class="section-heading">🎶 诗歌敬拜</span>`;
        data.worship_songs.forEach(e => {
            worship_section.innerHTML += `
                <div class="song-container">
                    <span class="song-title">${e.name}</span>
                    <span class="song-meta">
                        <a href="${e.yt_url}" target="_blank" rel="noopener noreferrer" class="song-link">💿 打开YouTube</a>
                        <a href="${e.img_url}" target="_blank" rel="noopener noreferrer" class="song-link">🖼️ 查看歌谱</a>
                    </span>
                </div>
            `;
        });

        container.appendChild(renderSermon(data.sermon_outline));

        if(data.liveId !== null) container.appendChild(renderLive(data.live_id));
    }

    function renderLive(liveId) {
        const liveSection = document.createElement("div");
        liveSection.className = "live-section";
        liveSection.innerHTML = `
            <div class="live-embed">
                <iframe
                    src="https://www.youtube.com/embed/${liveId}?autoplay=0"
                    title="Live Stream"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    loading="lazy">
                </iframe>
            </div>
        `;
        return liveSection;
    }

    function renderSermon(data) {
        const twToCn = OpenCC.Converter({ from: 'tw', to: 'cn' });
        const cnToTw = OpenCC.Converter({ from: 'cn', to: 'tw' });

        const sermon_section = document.createElement("div");
        sermon_section.id = "信息分享";
        sermon_section.className = "";
        sermon_section.insertAdjacentHTML('beforeend', `
            <span class="section-heading">📖 信息分享 | ${data.pastor}</span>
            <span class="section-meta">「${data.title ?? '暂无题目'}」 | ${data.scripture}</span>
        `);

        async function fetchBibleVerses(reference, translation = 'cuv') {
            const apiUrl = 'https://bible-api.com';

            try {
                const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=${translation}`;
                const response = await fetch(url);

                if (!response.ok) throw new Error("Failed to fetch verse");

                const data = await response.json();

                return data;
            } catch (error) {
                console.error('Error calling API:', error);
                throw error;
            }
        }

        async function renderPoints(indent, points) {
            let cont = 0;
            let verseData = null;

            if (points && points.length > 0) {
                for(const pt of points) {
                    sermon_section.insertAdjacentHTML('beforeend', `
                        <span class="sermon-outline" style="left: ${indent}rem;">${++cont}. ${pt.text}</span>
                    `);
                    if (pt.scripture) {
                        try {
                            verseData = await fetchBibleVerses(cnToTw(pt.scripture));
                            sermon_section.insertAdjacentHTML('beforeend', `
                                <div class=${pt.scripture ? 'sermon-scripture' : ''}>${twToCn(verseData.reference)} - ${twToCn(verseData.text)}</div>
                            `);
                        } catch (error) {
                            console.error(error);
                        }
                    }

                    if (pt.points) {
                        await renderPoints(indent + 1, pt.points);
                    }
                }
            }
        }

        renderPoints(0, data.points);

        return sermon_section;
    }

    async function init(scriptEl, options) {
        const scriptUrl = scriptEl ? scriptEl.dataset.url : null;

        const config = Object.assign({
            containerId: "i_am_container",
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
        renderContent(container, data);
    }

    const currentScript = document.currentScript;
    if (currentScript && currentScript.dataset.autoRun !== "false") {
        init(currentScript);
    }
})();
