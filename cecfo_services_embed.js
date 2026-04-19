(function () {
    const currentScript = document.currentScript;
    const servicesHeaders = {
        "host": "主持人",
        "worship_pray": "敬拜祷告",
        "memorial_pray": "记念祷告",
        "sermon": "证道",
        "youth_comm": "青年团契",
        "sunschool_senior": "主日学大班",
        "sunschool_intermediate": "主日学中班",
        "sunschool_junior": "主日学小班",
        "scripture_reader": "读经",
        "reception": "执勤/接待",
        "clean_up": "值日"
    };

    const worshipHeaders = {
        "worship_leader": "敬拜主领",
        "worship_piano": "敬拜钢琴",
        "worship_drums": "敬拜鼓",
        "worship_guitar": "敬拜吉他",
        "worship_bass": "敬拜贝斯",
        "worship_vocal": "敬拜领唱"
    };

    const defaultDataUrl = "https://script.google.com/macros/s/AKfycbxtK3CsxFygMAXY7UUOaUYpA-AomB7zwRLo6x9elqj_1JA8kV2NDo6_1pknFBzUZDLg/exec";
    const defaultDetailsBaseUrl = getDefaultDetailsBaseUrl(currentScript);
    const bootstrapCssHref = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css";
    const customStyleId = "cecfo-services-embed-style";
    const bootstrapLinkId = "cecfo-services-bootstrap-css";

    async function fetchJson(url, fallbackValue) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("HTTP " + response.status);
            return await response.json();
        } catch (error) {
            console.error("Error fetching JSON:", url, error);
            return fallbackValue;
        }
    }

    function getDefaultDetailsBaseUrl(scriptEl) {
        const explicitBaseUrl = scriptEl && scriptEl.dataset ? scriptEl.dataset.detailsBaseUrl : "";
        if (explicitBaseUrl) return explicitBaseUrl.replace(/\/$/, "");

        const scriptSrc = scriptEl ? scriptEl.getAttribute("src") : "";
        if (!scriptSrc) return "./weekly_details";

        try {
            const scriptUrl = new URL(scriptSrc, window.location.href);
            return new URL("./weekly_details", scriptUrl).toString().replace(/\/$/, "");
        } catch (error) {
            return "./weekly_details";
        }
    }

    function ensureBootstrapCss() {
        if (document.getElementById(bootstrapLinkId)) return;

        const link = document.createElement("link");
        link.id = bootstrapLinkId;
        link.rel = "stylesheet";
        link.href = bootstrapCssHref;
        link.integrity = "sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB";
        link.crossOrigin = "anonymous";
        document.head.appendChild(link);
    }

    function ensureCustomStyle(containerId) {
        if (document.getElementById(customStyleId)) return;

        const style = document.createElement("style");
        style.id = customStyleId;
        style.textContent = `
            #${containerId} { color: #F2B94B; }
            #${containerId} .cecfo-song-link {
                color: #ff0000;
                text-decoration: none;
            }
        `;
        document.head.appendChild(style);
    }

    function ensureContainer(scriptEl, containerId) {
        let container = document.getElementById(containerId);
        if (container) return container;

        container = document.createElement("div");
        container.id = containerId;
        container.className = "container-fluid";
        container.innerHTML = `
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            加载中...
        `;

        if (scriptEl && scriptEl.parentNode) {
            scriptEl.parentNode.insertBefore(container, scriptEl.nextSibling);
        } else {
            document.body.appendChild(container);
        }

        return container;
    }

    function getNextSundayDate() {
        const today = new Date();
        const dayNumber = today.getDay();
        const daysUntilSunday = dayNumber === 0 ? 0 : 7 - dayNumber;
        const sunday = new Date(today);
        sunday.setDate(today.getDate() + daysUntilSunday);

        const year = sunday.getFullYear();
        const month = String(sunday.getMonth() + 1).padStart(2, "0");
        const day = String(sunday.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function getMonthLabel(date) {
        return date.split("第")[0];
    }

    function groupByMonth(allData) {
        return allData.reduce((acc, obj) => {
            const currentMonth = getMonthLabel(obj.date);
            if (!acc[currentMonth]) acc[currentMonth] = [];
            acc[currentMonth].push(obj);
            return acc;
        }, {});
    }

    function highlightOn(name, table) {
        const badges = table.querySelectorAll("span");
        badges.forEach(badgeItem => {
            if (name !== "-" && !badgeItem.textContent.includes(name)) {
                badgeItem.style.opacity = "0.25";
            }
        });
    }

    function highlightOff(table) {
        const badges = table.querySelectorAll("span");
        badges.forEach(badgeItem => {
            badgeItem.style.opacity = "1";
        });
    }

    function normalizeUrl(url) {
        if (typeof url !== "string" || url.trim() === "") return "";

        try {
            const parsed = new URL(url);
            return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : "";
        } catch (error) {
            return "";
        }
    }

    function cleanSongTitle(title) {
        if (typeof title !== "string") return "";
        return title.replace(/^[\s]*[°•·]\s*/, "").trim();
    }

    function normalizeSong(song) {
        if (typeof song === "string") {
            return {
                title: cleanSongTitle(song),
                youtubeUrl: ""
            };
        }

        if (!song || typeof song !== "object") {
            return {
                title: "",
                youtubeUrl: ""
            };
        }

        return {
            title: cleanSongTitle(String(song.title ?? song.name ?? song.text ?? "")),
            youtubeUrl: normalizeUrl(song.youtube_url ?? song.youtubeUrl ?? song.youtube ?? song.url ?? song.href ?? "")
        };
    }

    function buildYoutubeSearchUrl(title) {
        if (!title) return "";
        return `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`;
    }

    function createYoutubeIcon() {
        const svgNs = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNs, "svg");
        svg.setAttribute("viewBox", "0 0 32 32");
        svg.setAttribute("width", "20");
        svg.setAttribute("height", "20");
        svg.setAttribute("aria-hidden", "true");
        svg.style.display = "block";

        const circle = document.createElementNS(svgNs, "circle");
        circle.setAttribute("cx", "16");
        circle.setAttribute("cy", "16");
        circle.setAttribute("r", "15");
        circle.setAttribute("fill", "#ff0000");
        svg.appendChild(circle);

        const plate = document.createElementNS(svgNs, "rect");
        plate.setAttribute("x", "8");
        plate.setAttribute("y", "10");
        plate.setAttribute("width", "16");
        plate.setAttribute("height", "12");
        plate.setAttribute("rx", "3");
        plate.setAttribute("fill", "#ffffff");
        svg.appendChild(plate);

        const play = document.createElementNS(svgNs, "path");
        play.setAttribute("fill", "#ff0000");
        play.setAttribute("d", "M14 12.5L19.5 16L14 19.5Z");
        svg.appendChild(play);

        return svg;
    }

    function renderSongList(songList) {
        const list = document.createElement("div");
        list.className = "list-group list-group-flush";
        list.style.marginBottom = "0";

        songList.forEach(song => {
            const normalizedSong = normalizeSong(song);
            const item = document.createElement("div");
            item.className = "list-group-item";

            const row = document.createElement("div");
            row.className = "d-flex align-items-center gap-2";

            const songUrl = normalizedSong.youtubeUrl || buildYoutubeSearchUrl(normalizedSong.title);
            if (songUrl) {
                const link = document.createElement("a");
                link.href = songUrl;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.className = "cecfo-song-link";
                link.title = normalizedSong.youtubeUrl
                    ? `打开 ${normalizedSong.title || "诗歌"} 的 YouTube 链接`
                    : `在 YouTube 搜索 ${normalizedSong.title || "这首诗歌"}`;
                link.setAttribute("aria-label", link.title);
                link.style.display = "inline-flex";
                link.style.alignItems = "center";
                link.style.flexShrink = "0";
                link.style.textDecoration = "none";
                link.appendChild(createYoutubeIcon());
                row.appendChild(link);
            }

            const label = document.createElement("span");
            label.textContent = normalizedSong.title || "-";
            row.appendChild(label);

            item.appendChild(row);
            list.appendChild(item);
        });

        return list;
    }

    function renderPoints(points, depth) {
        const ol = document.createElement("ol");
        ol.className = "list-group list-group-numbered";
        ol.style.paddingLeft = depth === 0 ? "0" : "1.5rem";

        points.forEach(point => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.textContent = point.text;

            if (point.points && point.points.length > 0) {
                li.appendChild(renderPoints(point.points, depth + 1));
            }

            ol.appendChild(li);
        });

        return ol;
    }

    function renderDetails(detailObj) {
        const detailsDiv = document.createElement("div");
        detailsDiv.className = "card p-2 mt-5";

        const title = document.createElement("h5");
        title.className = "card-title";
        title.textContent = detailObj.descr;
        detailsDiv.appendChild(title);

        if (detailObj.song_list && detailObj.song_list.length > 0) {
            detailsDiv.appendChild(renderSongList(detailObj.song_list));
        }

        if (detailObj.title && detailObj.title !== "") {
            const topic = document.createElement("h6");
            topic.className = "card-subtitle";
            topic.textContent = ` - ${detailObj.title}`;
            detailsDiv.appendChild(topic);
        }

        if (detailObj.scripture && detailObj.scripture !== "") {
            const scripture = document.createElement("span");
            scripture.className = "list-group-item";
            scripture.textContent = detailObj.scripture;
            detailsDiv.appendChild(scripture);
        }

        if (detailObj.points && detailObj.points.length > 0) {
            detailsDiv.appendChild(renderPoints(detailObj.points, 0));
        }

        if (detailObj.reflections && detailObj.reflections.length > 0) {
            detailsDiv.appendChild(renderPoints(detailObj.reflections, 0));
        }

        return detailsDiv;
    }

    function generateRow(obj, key, table) {
        const newCell = document.createElement("td");
        const badge = document.createElement("span");

        switch (key) {
            case "scripture_reader": {
                const scriptureToRead = document.createElement("small");
                scriptureToRead.textContent = obj.scripture_toread ? obj.scripture_toread : "-";
                scriptureToRead.className = "d-block text-secondary fw-light mt-1";
                badge.textContent = obj[key] ? obj[key] : "-";
                badge.onmouseover = function () { highlightOn(this.textContent.split("-")[0], table); };
                badge.onmouseout = function () { highlightOff(table); };
                newCell.appendChild(badge);
                newCell.append(scriptureToRead);
                break;
            }
            case "reception":
            case "clean_up": {
                const container = document.createElement("div");
                container.className = "d-flex flex-column";
                for (let i = 1; i <= 2; i++) {
                    const multipleBadges = document.createElement("span");
                    multipleBadges.textContent = obj[key + "0" + i] ? obj[key + "0" + i] : "-";
                    multipleBadges.onmouseover = function () { highlightOn(this.textContent.split("-")[0], table); };
                    multipleBadges.onmouseout = function () { highlightOff(table); };
                    container.appendChild(multipleBadges);
                }
                newCell.appendChild(container);
                break;
            }
            case "worship_vocal": {
                const vocals = document.createElement("div");
                vocals.className = "d-flex flex-column";
                for (let i = 1; i <= 3; i++) {
                    const multipleBadges = document.createElement("span");
                    multipleBadges.textContent = obj[key + "0" + i] ? obj[key + "0" + i] : "-";
                    multipleBadges.onmouseover = function () { highlightOn(this.textContent.split("-")[0], table); };
                    multipleBadges.onmouseout = function () { highlightOff(table); };
                    vocals.appendChild(multipleBadges);
                }
                newCell.appendChild(vocals);
                break;
            }
            default:
                badge.textContent = obj[key] ? obj[key] : "-";
                badge.onmouseover = function () { highlightOn(this.textContent, table); };
                badge.onmouseout = function () { highlightOff(table); };
                newCell.appendChild(badge);
        }

        return newCell;
    }

    function renderSection(container, groupedData, months, headers, index) {
        container.innerHTML = "";

        const currentMonth = months[index];
        const currentMonthData = groupedData[currentMonth];

        const nav = document.createElement("div");
        nav.className = "d-flex m-2 gap-2";

        const prevMonth = document.createElement("button");
        prevMonth.className = "btn btn-success btn-sm";
        prevMonth.textContent = "←" + (months[index - 1] ?? "");
        prevMonth.disabled = index === 0;
        prevMonth.onclick = function () {
            renderSection(container, groupedData, months, headers, index - 1);
        };

        const thisMonth = document.createElement("span");
        thisMonth.textContent = currentMonth;

        const nextMonth = document.createElement("button");
        nextMonth.className = "btn btn-success btn-sm";
        nextMonth.textContent = "→" + (months[index + 1] ?? "");
        nextMonth.disabled = index === months.length - 1;
        nextMonth.onclick = function () {
            renderSection(container, groupedData, months, headers, index + 1);
        };

        nav.appendChild(prevMonth);
        nav.appendChild(thisMonth);
        nav.appendChild(nextMonth);
        container.append(nav);

        const servicesTable = document.createElement("table");
        servicesTable.className = "table table-bordered text-center align-middle text-nowrap";

        const servicesTableHead = document.createElement("thead");
        const servicesTableBody = document.createElement("tbody");
        servicesTableBody.className = "table-group-divider";

        const headerRow = document.createElement("tr");
        const firstHeaderCell = document.createElement("th");
        firstHeaderCell.textContent = currentMonth;
        headerRow.appendChild(firstHeaderCell);

        for (let i = 0; i < currentMonthData.length; i++) {
            const headerCell = document.createElement("th");
            headerCell.scope = "col";
            headerCell.textContent = currentMonthData[i].date.split("月")[1];
            headerRow.appendChild(headerCell);
        }

        servicesTableHead.appendChild(headerRow);

        for (const h in headers) {
            const newRow = document.createElement("tr");
            const firstCell = document.createElement("th");
            firstCell.scope = "row";
            firstCell.textContent = headers[h];
            newRow.appendChild(firstCell);

            for (let i = 0; i < currentMonthData.length; i++) {
                newRow.appendChild(generateRow(currentMonthData[i], h, servicesTable));
            }

            servicesTableBody.appendChild(newRow);
        }

        servicesTable.appendChild(servicesTableHead);
        servicesTable.appendChild(servicesTableBody);
        container.appendChild(servicesTable);
    }

    async function loadData(id, objArray, detailsBaseUrl) {
        const where = document.getElementById(id);
        if (!where) return;

        where.innerHTML = "";
        const groupedData = groupByMonth(objArray);
        const months = Object.keys(groupedData);

        if (!months.length) {
            where.innerHTML = '<div class="alert alert-warning my-3">没有获取到排班数据。</div>';
            return;
        }

        const detailsUrl = `${detailsBaseUrl}/${getNextSundayDate()}.json`;
        const details = await fetchJson(detailsUrl, null);

        const serviceRow = document.createElement("div");
        serviceRow.className = "d-flex flex-wrap";

        const servicesContainer = document.createElement("div");
        servicesContainer.className = "flex-grow-1 table-responsive";

        const serviceRightSide = document.createElement("div");
        serviceRightSide.className = "d-flex flex-column m-2";
        if (details && details.sermon) serviceRightSide.appendChild(renderDetails(details.sermon));
        if (details && details.youth_comm) serviceRightSide.appendChild(renderDetails(details.youth_comm));

        serviceRow.appendChild(servicesContainer);
        serviceRow.appendChild(serviceRightSide);

        const worshipRow = document.createElement("div");
        worshipRow.className = "d-flex flex-wrap";

        const worshipContainer = document.createElement("div");
        worshipContainer.className = "flex-grow-1 table-responsive";

        const worshipRightSide = document.createElement("div");
        worshipRightSide.className = "m-2";
        if (details && details.worship) worshipRightSide.appendChild(renderDetails(details.worship));

        serviceRightSide.style.width = "20rem";
        worshipRightSide.style.width = "20rem";

        worshipRow.appendChild(worshipContainer);
        worshipRow.appendChild(worshipRightSide);

        where.appendChild(serviceRow);
        where.appendChild(worshipRow);

        renderSection(servicesContainer, groupedData, months, servicesHeaders, 0);
        renderSection(worshipContainer, groupedData, months, worshipHeaders, 0);
    }

    async function initCecfoServicesTable(options) {
        const config = Object.assign({
            containerId: "i_am_a_container",
            dataUrl: defaultDataUrl,
            detailsBaseUrl: defaultDetailsBaseUrl
        }, options || {});

        ensureBootstrapCss();
        ensureCustomStyle(config.containerId);

        const mount = document.getElementById(config.containerId) || ensureContainer(null, config.containerId);
        if (!mount) return;

        const servicesList = await fetchJson(config.dataUrl, []);
        await loadData(config.containerId, servicesList, config.detailsBaseUrl);
    }

    window.initCecfoServicesTable = initCecfoServicesTable;

    if (currentScript && currentScript.dataset.autoRun !== "false") {
        const containerId = currentScript.dataset.containerId || "i_am_a_container";
        const dataUrl = currentScript.dataset.dataUrl || defaultDataUrl;
        const detailsBaseUrl = currentScript.dataset.detailsBaseUrl || defaultDetailsBaseUrl;

        ensureBootstrapCss();
        ensureCustomStyle(containerId);
        ensureContainer(currentScript, containerId);

        initCecfoServicesTable({
            containerId: containerId,
            dataUrl: dataUrl,
            detailsBaseUrl: detailsBaseUrl
        });
    }
})();
