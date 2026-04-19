/** Find BUG, TODO to complete the code. */

const services_headers = {
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

const worship_headers = {
    "worship_leader": "敬拜主领",
    "worship_piano": "敬拜钢琴",
    "worship_drums": "敬拜鼓",
    "worship_guitar": "敬拜吉他",
    "worship_bass": "敬拜贝斯",
    "worship_vocal": "敬拜领唱"
};

async function fetchDetails() {
    const details_URL = `https://cdn.jsdelivr.net/gh/hjleeu/CECFO@24f744e3e9e1970170a7a2da89faef753cfea922/weekly_details/${getNextSundayDate()}.json`;

    try {
        const response = await fetch(details_URL);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

function getNextSundayDate() {
    const today = new Date();
    const day_n = today.getDay(); // 0 = Sunday, 1 = Monday, ...
    const daysUntilSunday = day_n === 0 ? 0 : 7 - day_n;
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + daysUntilSunday);

    // format as YYYY-MM-DD
    const year = sunday.getFullYear();
    const month = String(sunday.getMonth() + 1).padStart(2, '0');
    const day = String(sunday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function loadData(id, objArray) {
    const where = document.getElementById(id);
    where.innerHTML = '';
    const groupedData = groupByMonth(objArray);
    const months = Object.keys(groupedData);

    const details = await fetchDetails();

    /** Services section. */
    let service_row = document.createElement("div");
    service_row.className = "d-flex flex-wrap";

    let services_container = document.createElement("div");
    services_container.className = "flex-grow-1  table-responsive";

    let service_right_side = document.createElement("div");
    service_right_side.className = "d-flex flex-column m-2";
    if(details && details.sermon) service_right_side.appendChild(renderDetails(details.sermon));
    if(details && details.youth_comm) service_right_side.appendChild(renderDetails(details.youth_comm));

    service_row.appendChild(services_container);
    service_row.appendChild(service_right_side);

    /** Worship section. */
    let worship_row = document.createElement("div");
    worship_row.className = "d-flex flex-wrap";

    let worship_container = document.createElement("div");
    worship_container.className = "flex-grow-1";

    let worship_right_side = document.createElement("div");
    worship_right_side.className = "m-2"
    if(details && details.worship) worship_right_side.appendChild(renderDetails(details.worship));
    service_right_side.style.width = "20rem";
    worship_right_side.style.width = "20rem";

    worship_row.appendChild(worship_container);
    worship_row.appendChild(worship_right_side);

    where.appendChild(service_row);
    where.appendChild(worship_row);

    renderSection(services_container, groupedData, months, services_headers, 0);
    renderSection(worship_container, groupedData, months, worship_headers, 0);
}

function renderSection(container, groupedData, months, headers, index) {
    /** Clean all. */
    container.innerHTML = '';

    const currentMonth = months[index];
    const currentMonthData = groupedData[currentMonth];

    const nav = document.createElement("div");
    nav.className = "d-flex m-2 gap-2";

    const prevMonth = document.createElement("button");
    prevMonth.className = "btn btn-success btn-sm";
    prevMonth.textContent = '←' + (months[index - 1] ?? "");
    prevMonth.disabled = (index == 0);
    prevMonth.onclick = function () { renderSection(container, groupedData, months, headers, index - 1); };

    const thisMonth = document.createElement("span");
    thisMonth.textContent = currentMonth;

    const nextMonth = document.createElement("button");
    nextMonth.className = "btn btn-success btn-sm";
    nextMonth.textContent = '→' + (months[index + 1] ?? "");
    nextMonth.disabled = (index == months.length - 1);
    nextMonth.onclick = function () { renderSection(container, groupedData, months, headers, index + 1); };

    nav.appendChild(prevMonth);
    nav.appendChild(thisMonth);
    nav.appendChild(nextMonth);
    container.append(nav);

    let services_table = document.createElement("table");
    services_table.className = "table table-bordered text-center align-middle text-nowrap";

    let services_table_head = document.createElement("thead");
    let services_table_body = document.createElement("tbody");
    services_table_body.className = "table-group-divider";

    let headerRow = document.createElement("tr");
    let firstHeaderCell = document.createElement("th");
    firstHeaderCell.textContent = currentMonth;
    headerRow.appendChild(firstHeaderCell);

    for (let i = 0; i < currentMonthData.length; i++) {
        let headerCell = document.createElement("th");
        headerCell.scope = "col";
        headerCell.textContent = currentMonthData[i]["date"].split('月')[1];
        headerRow.appendChild(headerCell);
    }
    services_table_head.appendChild(headerRow);

    for (var h in headers) {
        let newRow = document.createElement("tr");
        let firstCell = document.createElement("th");
        firstCell.scope = "row";
        firstCell.textContent = headers[h];
        newRow.appendChild(firstCell);

        for (let i = 0; i < currentMonthData.length; i++) {
            newRow.appendChild(generateRow(currentMonthData[i], h, services_table));
        }

        services_table_body.appendChild(newRow);
    }

    services_table.appendChild(services_table_head);
    services_table.appendChild(services_table_body);
    container.appendChild(services_table);
}

function generateRow(obj, key, table) {
    let newCell = document.createElement("td");
    let badge = document.createElement("span");
    
    switch(key) {
        case "scripture_reader":
            var scripture_toread = document.createElement("small");
            scripture_toread.textContent = obj["scripture_toread"] ? obj["scripture_toread"] : "-";
            scripture_toread.className = "d-block text-secondary fw-light mt-1";
            badge.textContent = obj[key] ? obj[key] : '-';
            badge.onmouseover = function() { highlight_on(this.textContent.split('-')[0], table); }
            badge.onmouseout = function() { highlight_off(table); }
            newCell.appendChild(badge);
            newCell.append(scripture_toread);
            break;
        case "reception":
        case "clean_up":
            let container = document.createElement("div");
            container.className = "d-flex flex-column";
            for(let i = 1; i <= 2; i++) {
                var multiple_badges = document.createElement("span");
                multiple_badges.textContent = obj[key + "0" + i] ? obj[key + "0" + i] : '-';
                multiple_badges.onmouseover = function() { highlight_on(this.textContent.split('-')[0], table); }
                multiple_badges.onmouseout = function() { highlight_off(table); }
                container.appendChild(multiple_badges);
            }
            newCell.appendChild(container);
            break;
        case "worship_vocal":
            let vocals = document.createElement("div");
            vocals.className = "d-flex flex-column";
           for(let i = 1; i <= 3; i++) {
                var multiple_badges = document.createElement("span");
                multiple_badges.textContent = obj[key + "0" + i] ? obj[key + "0" + i] : '-';
                multiple_badges.onmouseover = function() { highlight_on(this.textContent.split('-')[0], table); }
                multiple_badges.onmouseout = function() { highlight_off(table); }
                vocals.appendChild(multiple_badges);
            }
            newCell.appendChild(vocals);
            break;
        default:
            badge.textContent = obj[key] ? obj[key] : '-';
            badge.onmouseover = function() { highlight_on(this.textContent, table); }
            badge.onmouseout = function() { highlight_off(table); }
            newCell.appendChild(badge);
    }
    return newCell;
}

/** We suppose that the date format is always x年y月第z周. */
function getMonthLabel(date) {
    return date.split('第')[0];
}

/** Group the data by month. */
function groupByMonth(allData) {
    /** Loops on all the data, starting with an empty object {}. */
    return allData.reduce((acc, obj) => {
        var currentMonth = getMonthLabel(obj["date"]);

        /** If the array of this month is null, I create an empty array. */
        if(!acc[currentMonth]) acc[currentMonth] = [];

        acc[currentMonth].push(obj);
        return acc;
    }, {});
}

/** Highlight the span tags in the table that contains the value of name. */
function highlight_on(name, table) {
    /** Return all the span tags in the table passed as arg. */
    const badges = table.querySelectorAll("span");
    badges.forEach(badge => {
        if(name != '-' && !badge.textContent.includes(name)) badge.style.opacity = "0.25";
    });
    
}

/** Reset the highlight effect. */
function highlight_off(table) {
    const badges = table.querySelectorAll("span");
    badges.forEach(badge => {
        badge.style.opacity = '1';
    });
}

function renderDetails(detailObj) {
    let details_div = document.createElement("div");
    details_div.className = "card p-2 mt-5";

    let title = document.createElement("h5");
    title.className = "card-title";
    title.textContent = detailObj.descr;
    details_div.appendChild(title);

    if(detailObj.song_list && detailObj.song_list.length > 0) {
        let ul = document.createElement("ul");
        ul.className = "list-group list-group-flush";
        detailObj.song_list.forEach(song => {
            let li = document.createElement("li");
            li.className = "list-group-item";
            li.textContent = song;
            ul.appendChild(li);
        });
        details_div.appendChild(ul);
    }

    if(detailObj.title && detailObj.title != "") {
        let topic = document.createElement("h6");
        topic.className = "card-subtitle";
        topic.textContent = ` - ${detailObj.title   }`;;
        details_div.appendChild(topic);
    }

    if(detailObj.scripture && detailObj.scripture != "") {
        let scripture = document.createElement("span");
        scripture.className = "list-group-item";
        scripture.textContent = detailObj.scripture;
        details_div.appendChild(scripture);
    }

    if(detailObj.points && detailObj.points.length > 0) {
        details_div.appendChild(renderPoints(detailObj.points, 0));
    }

    if(detailObj.reflections && detailObj.reflections.length > 0) {
        details_div.appendChild(renderPoints(detailObj.reflections, 0));
    }

    return details_div;
}

function renderPoints(points, depth) {
    const ol = document.createElement("ol");
    ol.className = "list-group list-group-numbered";
    ol.style.paddingLeft = depth === 0 ? "0" : "1.5rem";

    points.forEach(point => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = point.text;

        if(point.points && point.points.length > 0) {
            li.appendChild(renderPoints(point.points, depth + 1));
        }

        ol.appendChild(li);
    });

    return ol;
}