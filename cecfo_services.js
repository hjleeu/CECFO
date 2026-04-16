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
}

const worship_headers = {
    "worship_leader": "敬拜主领",
    "worship_piano": "敬拜钢琴",
    "worship_drums": "敬拜鼓",
    "worship_guitar": "敬拜吉他",
    "worship_bass": "敬拜贝斯",
    "worship_vocal": "敬拜领唱"
}

function loadData(id, objArray) {
    const where = document.getElementById(id);
    where.innerHTML = '';
    const groupedData = groupByMonth(objArray);
    const months = Object.keys(groupedData);

    let services_container = document.createElement("div");
    let worship_container = document.createElement("div");

    where.appendChild(services_container);
    where.appendChild(worship_container);

    renderSection(services_container, groupedData, months, services_headers, 0);
    renderSection(worship_container, groupedData, months, worship_headers, 0);
}

function renderSection(container, groupedData, months, headers, index) {
    /** Clean all for safety. */
    container.innerHTML = '';

    const currentMonth = months[index];
    const currentMonthData = groupedData[currentMonth];

    const nav = document.createElement("div");
    nav.className = "d-flex m-2 gap-2";

    const prevMonth = document.createElement("button");
    prevMonth.className = "btn btn-info btn-sm";
    prevMonth.textContent = '←' + (months[index - 1] ?? "");
    prevMonth.disabled = (index == 0);
    prevMonth.onclick = function () { renderSection(container, groupedData, months, headers, index - 1); };

    const thisMonth = document.createElement("span");
    thisMonth.textContent = currentMonth;

    const nextMonth = document.createElement("button");
    nextMonth.className = "btn btn-info btn-sm";
    nextMonth.textContent = '→' + (months[index + 1] ?? "");
    nextMonth.disabled = (index == months.length - 1);
    nextMonth.onclick = function () { renderSection(container, groupedData, months, headers, index + 1); };

    nav.appendChild(prevMonth);
    nav.appendChild(thisMonth);
    nav.appendChild(nextMonth);
    container.append(nav);

    let services_table = document.createElement("table");
    services_table.className = "table table-bordered text-center align-middle";

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
            var scripture_toread = document.createElement("span");
            scripture_toread.textContent = obj["scripture_toread"] ? obj["scripture_toread"] : "-";
            scripture_toread.className = "d-block text-muted small mt-1";
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
    })
}