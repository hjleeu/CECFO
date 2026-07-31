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
        const linkId = "church-widget-css";
        if (document.getElementById(linkId)) return;
        const st = document.createElement("style");
        st.id = linkId;
        st.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@200..900&display=swap');
            
            :root {
                --widget-font: "Noto Serif SC", serif;
                --widget-bg: #ffffff;
                --widget-text: #222222;
                --widget-subtext: #666666;
                --widget-accent: #b8860b;
                --widget-accent-hover: #996f08;
                --widget-border: #e0e0e0;
                --widget-nav-bg: rgba(240, 240, 240, 0.85);
                --widget-item-border: rgba(0, 0, 0, 0.08);
            }

            @media (prefers-color-scheme: dark) {
                :root {
                    --widget-bg: #1c1c1c;
                    --widget-text: #f5f5f5;
                    --widget-subtext: #b0b0b0;
                    --widget-accent: #F2B94B;
                    --widget-accent-hover: #e0a935;
                    --widget-border: #444444;
                    --widget-nav-bg: rgba(0, 0, 0, 0.3);
                    --widget-item-border: rgba(255, 255, 255, 0.1);
                }
            }

            .church-widget {
                font-family: var(--widget-font);
                color: var(--widget-text);
                max-width: 520px;
                margin: 0 auto;
                padding: 1.25rem;
                background-color: var(--widget-bg);
                border: 1px solid var(--widget-border);
                border-radius: 8px;
                scroll-behavior: smooth;
                transition: background-color 0.3s ease, color 0.3s ease;
            }
            .widget-nav {
                display: flex;
                gap: 0.5rem;
                background: var(--widget-nav-bg);
                padding: 0.5rem;
                border-radius: 6px;
                margin-bottom: 1.25rem;
                position: sticky;
                top: 0;
                z-index: 10;
                backdrop-filter: blur(5px);
                border: 1px solid var(--widget-border);
                overflow-x: auto;
            }
            .widget-nav button {
                background: transparent;
                border: none;
                color: var(--widget-subtext);
                font-family: var(--widget-font);
                font-size: 0.85rem;
                padding: 0.35rem 0.75rem;
                border-radius: 4px;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.2s ease;
            }
            .widget-nav button:hover, .widget-nav button.active {
                background: var(--widget-accent);
                color: #ffffff;
                font-weight: 600;
            }
            .widget-section {
                margin-bottom: 1.5rem;
                scroll-margin-top: 4rem;
            }
            .widget-section:last-child {
                margin-bottom: 0;
            }
            .widget-section h3 {
                color: var(--widget-accent);
                font-size: 1.1rem;
                border-bottom: 1px solid var(--widget-border);
                padding-bottom: 0.4rem;
                margin-bottom: 0.75rem;
            }
            .song-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.4rem 0;
                font-size: 0.95rem;
                border-bottom: 1px dashed var(--widget-item-border);
            }
            .song-links a {
                color: var(--widget-accent);
                margin-left: 0.75rem;
                text-decoration: none;
                font-size: 0.85rem;
            }
            .song-links a:hover {
                text-decoration: underline;
                color: var(--widget-accent-hover);
            }
            .sermon-list {
                list-style: none;
                padding-left: 0;
                margin-top: 0.5rem;
            }
            .sermon-list li {
                margin-bottom: 0.5rem;
                line-height: 1.5;
            }
            .sermon-sublist {
                list-style: none;
                padding-left: 1.2rem;
                margin-top: 0.3rem;
            }
            .scripture-tag {
                font-size: 0.85rem;
                color: var(--widget-subtext);
                margin-left: 0.4rem;
            }
        `;
        document.head.appendChild(st);
    }

    function renderSermonPoints(points) {
        if (!points || points.length === 0) return '';
        const chineseNumerals = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
        
        let html = `<ul class="sermon-list">`;
        points.forEach((pt, index) => {
            const prefix = chineseNumerals[index] ? `${chineseNumerals[index]}.` : `${index + 1}.`;
            
            let itemHtml = `<li>`;
            itemHtml += `<strong>${prefix}</strong> ${pt.text}`;
            if (pt.scripture) {
                itemHtml += `<span class="scripture-tag">(${pt.scripture})</span>`;
            }

            if (pt.points && pt.points.length > 0) {
                itemHtml += `<ul class="sermon-sublist">`;
                pt.points.forEach((subPt, subIndex) => {
                    itemHtml += `<li>`;
                    itemHtml += `<strong>${subIndex + 1}.</strong> ${subPt.text}`;
                    if (subPt.scripture) {
                        itemHtml += `<span class="scripture-tag">(${subPt.scripture})</span>`;
                    }
                    itemHtml += `</li>`;
                });
                itemHtml += `</ul>`;
            }

            itemHtml += `</li>`;
            html += itemHtml;
        });
        html += `</ul>`;
        return html;
    }

    function renderWidget(container, data) {
        if (!data) {
            container.innerHTML = `<div style="padding:1rem; text-align:center;">暂无聚会内容数据</div>`;
            return;
        }

        let html = `<div class="church-widget">`;

        html += `
            <div class="widget-nav">
                <button onclick="document.getElementById('sec-worship').scrollIntoView({behavior: 'smooth'})">🎵 敬拜</button>
                <button onclick="document.getElementById('sec-choir').scrollIntoView({behavior: 'smooth'})">🎶 献诗</button>
                <button onclick="document.getElementById('sec-sermon').scrollIntoView({behavior: 'smooth'})">📖 证道</button>
            </div>
        `;

        if (data.worship_songs && data.worship_songs.length > 0) {
            html += `
                <div id="sec-worship" class="widget-section">
                    <h3>🎵 敬拜诗歌</h3>
                    <div>
            `;
            data.worship_songs.forEach(song => {
                html += `
                    <div class="song-item">
                        <span>${song.name}</span>
                        <span class="song-links">
                            ${song.yt_url && song.yt_url.trim() !== "" ? `<a href="${song.yt_url}" target="_blank">▶ 视频</a>` : ''}
                            ${song.img_url && song.img_url.trim() !== "" ? `<a href="${song.img_url}" target="_blank">📄 谱子</a>` : ''}
                        </span>
                    </div>
                `;
            });
            html += `</div></div>`;
        }

        if (data.choir && data.choir.songs && data.choir.songs.length > 0) {
            html += `
                <div id="sec-choir" class="widget-section">
                    <h3>🎶 主日献唱 | ${data.choir.assigned || ""}</h3>
                    <div>
            `;
            data.choir.songs.forEach(song => {
                html += `
                    <div class="song-item">
                        <span>${song.name}</span>
                        <span class="song-links">
                            ${song.yt_url && song.yt_url.trim() !== "" ? `<a href="${song.yt_url}" target="_blank">▶ 视频</a>` : ''}
                            ${song.img_url && song.img_url.trim() !== "" ? `<a href="${song.img_url}" target="_blank">📄 谱子</a>` : ''}
                        </span>
                    </div>
                `;
            });
            html += `</div></div>`;
        }

        const sermon = data.sermon_outline || {};
        html += `
            <div id="sec-sermon" class="widget-section">
                <h3>📖 主日证道 | ${sermon.pastor || "待定"}</h3>
                <p><strong>题目：</strong>${sermon.title || "暂无题目"}</p>
                <p><strong>经文：</strong>${sermon.scripture || "暂无经文"}</p>
        `;
        if (sermon.points && sermon.points.length > 0) {
            html += renderSermonPoints(sermon.points);
        }
        html += `</div>`;

        html += `</div>`;
        container.innerHTML = html;
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
