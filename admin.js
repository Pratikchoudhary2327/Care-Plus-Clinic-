
function getFeedback() {
    try {
        return JSON.parse(localStorage.getItem("clinicFeedback") || "[]");
    } catch (error) {
        console.error("Unable to read feedback:", error);
        return [];
    }
}

function saveFeedback(feedback) {
    localStorage.setItem("clinicFeedback", JSON.stringify(feedback));
}

function createDepartmentSummary(feedback) {
    let summary = document.getElementById("departmentSummary");

    if (!summary) {
        summary = document.createElement("section");
        summary.id = "departmentSummary";
        summary.className = "section";

        const recordsHeading = Array.from(document.querySelectorAll("h2"))
            .find(heading => heading.textContent.trim() === "Feedback Records");

        if (recordsHeading) {
            recordsHeading.before(summary);
        }
    }

    summary.replaceChildren();

    const heading = document.createElement("h2");
    heading.textContent = "Department-wise Feedback";
    summary.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "service-grid";

    const departments = {};

    feedback.forEach(item => {
        const department = item.department || "Other";
        departments[department] = (departments[department] || 0) + 1;
    });

    if (Object.keys(departments).length === 0) {
        const message = document.createElement("p");
        message.textContent = "No department feedback available yet.";
        summary.appendChild(message);
        return;
    }

    Object.entries(departments).forEach(([department, count]) => {
        const card = document.createElement("div");
        card.className = "service-card";

        const name = document.createElement("h3");
        name.textContent = department;

        const total = document.createElement("p");
        total.textContent = count + " Feedback";

        card.append(name, total);
        grid.appendChild(card);
    });

    summary.appendChild(grid);
}

function loadDashboard() {
    const feedback = getFeedback();

    const total = feedback.length;

    const validRatings = feedback
        .map(item => Number(item.rating))
        .filter(rating => Number.isFinite(rating) && rating >= 1 && rating <= 5);

    const average = validRatings.length
        ? (validRatings.reduce((sum, rating) => sum + rating, 0) /
            validRatings.length).toFixed(1)
        : "0.0";

    const pending = feedback.filter(
        item => item.status !== "Resolved"
    ).length;

    const resolved = feedback.filter(
        item => item.status === "Resolved"
    ).length;

    document.getElementById("totalFeedback").textContent = total;
    document.getElementById("averageRating").textContent = average + " / 5";
    document.getElementById("pendingFeedback").textContent = pending;
    document.getElementById("resolvedFeedback").textContent = resolved;

    // Department summary
    createDepartmentSummary(feedback);

    // Feedback table
    const tableBody = document.getElementById("feedbackTableBody");
    tableBody.replaceChildren();

    if (feedback.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 7;
        cell.textContent = "No feedback submitted yet.";
        cell.style.padding = "20px";
        cell.style.textAlign = "center";

        row.appendChild(cell);
        tableBody.appendChild(row);
    }

    feedback.forEach(item => {
        const row = document.createElement("tr");

        const patientDetails = [
            item.patientName || "Anonymous",
            item.patientEmail || "",
            item.visitDate ? "Visit: " + item.visitDate : ""
        ].filter(Boolean).join("\n");

        const values = [
            item.id || "N/A",
            patientDetails,
            item.department || "N/A",
            "★".repeat(Math.max(0, Math.min(5, Number(item.rating) || 0))) +
            " (" + (item.rating || 0) + "/5)",
            item.comments || "No comments",
            item.status || "Pending"
        ];

        values.forEach((value, index) => {
            const cell = document.createElement("td");

            cell.style.padding = "10px";
            cell.style.borderBottom = "1px solid #ddd";
            cell.textContent = value;

            if (index === 1) {
                cell.style.whiteSpace = "pre-line";
            }

            if (index === 5) {
                cell.style.fontWeight = "bold";
                cell.style.color =
                    value === "Resolved" ? "green" : "#d97706";
            }

            row.appendChild(cell);
        });

        // Action buttons
        const actionCell = document.createElement("td");
        actionCell.style.padding = "10px";

        const statusButton = document.createElement("button");

        statusButton.textContent =
            item.status === "Resolved" ? "Mark Pending" : "Mark Resolved";

        statusButton.style.margin = "4px";
        statusButton.style.padding = "8px 12px";
        statusButton.style.cursor = "pointer";

        statusButton.addEventListener("click", function () {
            const updatedFeedback = getFeedback();
            const selectedItem = updatedFeedback.find(
                feedbackItem => feedbackItem.id === item.id
            );

            if (!selectedItem) return;

            selectedItem.status =
                selectedItem.status === "Resolved" ? "Pending" : "Resolved";

            saveFeedback(updatedFeedback);
            loadDashboard();
        });

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.style.margin = "4px";
        deleteButton.style.padding = "8px 12px";
        deleteButton.style.cursor = "pointer";
        deleteButton.style.background = "#d9534f";
        deleteButton.style.color = "white";
        deleteButton.style.border = "none";
        deleteButton.style.borderRadius = "5px";

        deleteButton.addEventListener("click", function () {
            const confirmDelete = confirm(
                "Are you sure you want to delete this feedback?"
            );

            if (!confirmDelete) return;

            const updatedFeedback = getFeedback().filter(
                feedbackItem => feedbackItem.id !== item.id
            );

            saveFeedback(updatedFeedback);
            loadDashboard();
        });

        actionCell.append(statusButton, deleteButton);
        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });

    document.getElementById("adminMessage").textContent =
        total === 0
            ? "No feedback submitted yet. Submit a test feedback first."
            : "Feedback records loaded successfully.";
}

loadDashboard();
