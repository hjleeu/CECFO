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

/** Update manually every week. */
const worship_song = ["安静", "我们欢迎君王降临", "十字架的传达者", "我的生命献给你"];
const sermon_details = {
    "title": "在基督里彼此接纳",
    "scripture": "罗马书 第14章",
    "points": [
        {
            "text": "教会中的肢体生活",
            "points": [
                { "text": "彼此相爱" },
                { "text": "彼此接纳" },
                { "text": "彼此和睦" },
                { "text": "彼此建立" },
                { "text": "彼此劝诫" },
                { "text": "彼此担待" }
            ]
        },
        {
            "text": "接纳信心软弱的弟兄 | 1-12节",
            "points": [
                { "text": "不辩论所疑惑的事" },
                { "text": "不可彼此轻看" },
                { "text": "不可彼此论断" },
                { "text": "信心坚定为主而活"}
            ]
        },
        {
            "text": "不要因论断使弟兄跌倒 | 11-23节",
            "points": [
                { "text": "吃喝的事是次要的事" },
                {
                    "text": "公义，和平，圣灵中的喜乐是重要的事",
                    "points": [
                        { "text": "要追求和睦的事" },
                        { "text": "要追求建立德行的事" }
                    ]
                },
                { "text": "凡不出于信心的都是罪" }
            ]
        }
    ]
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
    where.appendChild(fillSermonLabel());

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

function fillSermonLabel() {
    let sermon_div = document.createElement("ul");
    sermon_div.className = "list-group p-2";

    if(sermon_details.points && sermon_details.points.length > 0) {
        sermon_div.appendChild(renderSermonPoints(sermon_details.points, 0));
    }

    return sermon_div;
}

function renderSermonPoints(points, depth) {
    const ol = document.createElement("ol");
    ol.className = "list-group list-group-numbered";
    ol.style.paddingLeft = depth === 0 ? "0" : "1.5rem";

    points.forEach(point => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = point.text;

        if(point.points && point.points.length > 0) {
            li.appendChild(renderSermonPoints(point.points, depth + 1));
        }

        ol.appendChild(li);
    });

    return ol;
}