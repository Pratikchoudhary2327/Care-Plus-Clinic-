
function getReportFeedback() {
    try {
        const data = JSON.parse(
            localStorage.getItem("clinicFeedback") || "[]"
        );

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error loading feedback:", error);
        return [];
    }
}

function createReportElement(tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;

    if (className) {
        element.className = className;
    }

    return element;
}

function loadReports() {
    const feedback = getReportFeedback();

    const validFeedback = feedback.filter(item => {
        const rating = Number(item.rating);
        return Number.isFinite(rating) && rating >= 1 && rating <= 5;
    });

    // Total responses
    document.getElementById("reportTotal").textContent =
        feedback.length;

    // Overall average rating
    const overallAverage = validFeedback.length
        ? (
            validFeedback.reduce(
                (sum, item) => sum + Number(item.rating), 0
            ) / validFeedback.length
        ).toFixed(1)
        : "0.0";

    document.getElementById("reportAverage").textContent =
        overallAverage + " / 5";

    // Department-wise records
    const departments = [
        "Doctor Consultation",
        "Nursing Care",
        "Nursing",
        "Reception",
        "Billing",
        "Cleanliness",
        "Waiting Time"
    ];

    // Include any additional department names found in submitted feedback
    feedback.forEach(item => {
        const name = item.department || "Other";

        if (!departments.includes(name)) {
            departments.push(name);
        }
    });

    const departmentData = departments.map(department => {
        const records = feedback.filter(
            item => (item.department || "Other") === department
        );

        const ratings = records
            .map(item => Number(item.rating))
            .filter(rating =>
                Number.isFinite(rating) && rating >= 1 && rating <= 5
            );

        const average = ratings.length
            ? ratings.reduce((sum, rating) => sum + rating, 0) /
            ratings.length
            : null;

        let performance = "No data";

        if (average !== null) {
            if (average >= 4) {
                performance = "Excellent";
            } else if (average >= 3) {
                performance = "Good";
            } else {
                performance = "Needs Improvement";
            }
        }

        return {
            department,
            count: records.length,
            average,
            performance
        };
    });

    // Service-wise performance table
    const tableBody = document.getElementById("reportTableBody");
    tableBody.replaceChildren();

    departmentData.forEach(item => {
        const row = document.createElement("tr");

        const values = [
            item.department,
            item.count,
            item.average === null
                ? "N/A"
                : item.average.toFixed(1) + " / 5",
            item.performance
        ];

        values.forEach((value, index) => {
            const cell = document.createElement("td");

            cell.textContent = value;
            cell.style.padding = "12px";
            cell.style.borderBottom = "1px solid #ddd";

            if (index === 3) {
                cell.style.fontWeight = "bold";

                if (value === "Excellent") {
                    cell.style.color = "green";
                } else if (value === "Good") {
                    cell.style.color = "#2563eb";
                } else if (value === "Needs Improvement") {
                    cell.style.color = "#d9534f";
                }
            }

            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });

    // Report message
    document.getElementById("reportEmpty").textContent =
        feedback.length
            ? "Report generated successfully from submitted feedback."
            : "No feedback yet. Submit feedback to generate your report.";

    // Additional analytics
    createExtraAnalytics(feedback, validFeedback, departmentData);
}

function createExtraAnalytics(feedback, validFeedback, departmentData) {
    const main = document.querySelector("main");

    let analytics = document.getElementById("extraAnalytics");

    if (!analytics) {
        analytics = document.createElement("section");
        analytics.id = "extraAnalytics";

        const reportSection = document.querySelector(".card");

        if (reportSection) {
            reportSection.before(analytics);
        } else {
            main.appendChild(analytics);
        }
    }

    analytics.replaceChildren();

    // Department insights
    const heading = createReportElement(
        "h2",
        "Performance Insights"
    );

    analytics.appendChild(heading);

    const ratedDepartments = departmentData.filter(
        item => item.average !== null
    );

    const bestDepartment = ratedDepartments.length
        ? [...ratedDepartments].sort(
            (a, b) => b.average - a.average
        )[0]
        : null;

    const improvementDepartment = ratedDepartments.length
        ? [...ratedDepartments].sort(
            (a, b) => a.average - b.average
        )[0]
        : null;

    const insights = document.createElement("div");
    insights.className = "service-grid";

    const cards = [
        {
            title: "Best Performing Department",
            value: bestDepartment
                ? bestDepartment.department + " (" +
                bestDepartment.average.toFixed(1) + "/5)"
                : "No data available"
        },
        {
            title: "Needs Most Improvement",
            value: improvementDepartment
                ? improvementDepartment.department + " (" +
                improvementDepartment.average.toFixed(1) + "/5)"
                : "No data available"
        },
        {
            title: "Rated Responses",
            value: validFeedback.length
        }
    ];

    cards.forEach(item => {
        const card = document.createElement("div");
        card.className = "service-card";

        card.appendChild(
            createReportElement("h3", item.title)
        );

        card.appendChild(
            createReportElement("p", item.value)
        );

        insights.appendChild(card);
    });

    analytics.appendChild(insights);

    // Star rating distribution
    const ratingHeading = createReportElement(
        "h2",
        "Rating Distribution"
    );

    analytics.appendChild(ratingHeading);

    for (let rating = 5; rating >= 1; rating--) {
        const count = validFeedback.filter(
            item => Number(item.rating) === rating
        ).length;

        const percentage = validFeedback.length
            ? (count / validFeedback.length) * 100
            : 0;

        const wrapper = document.createElement("div");
        wrapper.style.margin = "15px 0";

        const label = createReportElement(
            "p",
            rating + " Stars — " + count + " responses (" +
            percentage.toFixed(0) + "%)"
        );

        const barBackground = document.createElement("div");
        barBackground.style.width = "100%";
        barBackground.style.height = "12px";
        barBackground.style.background = "#e5e7eb";
        barBackground.style.borderRadius = "10px";
        barBackground.style.overflow = "hidden";

        const bar = document.createElement("div");
        bar.style.width = percentage + "%";
        bar.style.height = "100%";
        bar.style.background = "#e88ab5";
        bar.style.borderRadius = "10px";

        barBackground.appendChild(bar);
        wrapper.append(label, barBackground);
        analytics.appendChild(wrapper);
    }

    // Status summary
    const statusHeading = createReportElement(
        "h2",
        "Feedback Status Summary"
    );

    analytics.appendChild(statusHeading);

    const resolved = feedback.filter(
        item => item.status === "Resolved"
    ).length;

    const pending = feedback.length - resolved;

    const statusGrid = document.createElement("div");
    statusGrid.className = "service-grid";

    [
        { title: "Resolved Feedback", value: resolved },
        { title: "Pending Feedback", value: pending }
    ].forEach(item => {
        const card = document.createElement("div");
        card.className = "service-card";

        card.append(
            createReportElement("h3", item.title),
            createReportElement("p", item.value)
        );

        statusGrid.appendChild(card);
    });

    analytics.appendChild(statusGrid);
}

loadReports();
