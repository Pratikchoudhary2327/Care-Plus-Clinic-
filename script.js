
const feedbackForm = document.getElementById("feedbackForm");

// =====================================
// GET SAVED FEEDBACK
// =====================================

function getAllFeedback() {
    try {
        const savedFeedback = JSON.parse(
            localStorage.getItem("clinicFeedback") || "[]"
        );

        return Array.isArray(savedFeedback) ? savedFeedback : [];

    } catch (error) {
        console.error("Unable to read saved feedback:", error);
        return [];
    }
}

// =====================================
// DISPLAY SUBMITTED FEEDBACK
// =====================================

function displayFeedback() {

    if (!feedbackForm) return;

    let feedbackSection = document.getElementById("submittedFeedback");

    if (!feedbackSection) {

        feedbackSection = document.createElement("section");

        feedbackSection.id = "submittedFeedback";
        feedbackSection.className = "feedback-form";

        feedbackSection.style.marginTop = "30px";

        feedbackForm.parentElement.appendChild(feedbackSection);
    }

    feedbackSection.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = "Recently Submitted Feedback";

    feedbackSection.appendChild(heading);

    const allFeedback = getAllFeedback();

    if (allFeedback.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.textContent =
            "No feedback has been submitted yet.";

        feedbackSection.appendChild(emptyMessage);

        return;
    }

    // Show latest feedback first
    const recentFeedback = [...allFeedback].reverse();

    recentFeedback.forEach(function (feedback) {

        const card = document.createElement("div");

        card.style.background = "#edf7fb";
        card.style.padding = "16px";
        card.style.marginTop = "15px";
        card.style.borderRadius = "9px";
        card.style.borderLeft = "4px solid #087f8c";

        const name = document.createElement("h4");

        name.textContent = feedback.patientName;

        name.style.color = "#087f8c";

        const department = document.createElement("p");

        department.textContent =
            "Department: " + feedback.department;

        const rating = document.createElement("p");

        rating.textContent =
            "Rating: " + "★".repeat(feedback.rating) +
            "☆".repeat(5 - feedback.rating);

        rating.style.color = "#e6a400";

        const comments = document.createElement("p");

        comments.textContent =
            "Feedback: " + feedback.comments;

        const feedbackId = document.createElement("small");

        feedbackId.textContent =
            "Feedback ID: " + feedback.id;

        card.appendChild(name);
        card.appendChild(department);
        card.appendChild(rating);
        card.appendChild(comments);
        card.appendChild(feedbackId);

        feedbackSection.appendChild(card);
    });
}

// =====================================
// FEEDBACK FORM SUBMISSION
// =====================================

if (feedbackForm) {

    feedbackForm.addEventListener("submit", function (event) {

        event.preventDefault();

        // Get form values
        const patientName =
            document.getElementById("patientName").value.trim();

        const patientEmail =
            document.getElementById("patientEmail").value.trim();

        const anonymous =
            document.getElementById("anonymous").value;

        const visitDate =
            document.getElementById("visitDate").value;

        const appointmentId =
            document.getElementById("appointmentId").value.trim();

        const department =
            document.getElementById("department").value;

        const comments =
            document.getElementById("comments").value.trim();

        // Read selected star rating
        const selectedRating =
            document.querySelector(
                'input[name="rating"]:checked'
            );

        const rating = selectedRating
            ? Number(selectedRating.value)
            : 0;

        // Validate rating
        if (rating < 1 || rating > 5) {

            document.getElementById("message").textContent =
                "Please select a star rating.";

            document.getElementById("message").style.color = "#d83c60";

            return;
        }

        // Generate unique feedback ID
        const feedbackNumber =
            "CF" + Date.now().toString().slice(-8);

        // Prepare feedback data
        const feedback = {

            id: feedbackNumber,

            patientName:
                anonymous === "Yes"
                    ? "Anonymous"
                    : (patientName || "Patient"),

            patientEmail:
                anonymous === "Yes" ? "" : patientEmail,

            anonymous: anonymous,

            visitDate: visitDate,

            appointmentId: appointmentId,

            department: department,

            rating: rating,

            comments: comments,

            status: "Pending",

            submittedAt: new Date().toISOString()
        };

        // Save feedback
        try {

            const allFeedback = getAllFeedback();

            allFeedback.push(feedback);

            localStorage.setItem(
                "clinicFeedback",
                JSON.stringify(allFeedback)
            );

        } catch (error) {

            document.getElementById("message").textContent =
                "Unable to save feedback. Please check browser storage.";

            document.getElementById("message").style.color = "#d83c60";

            return;
        }

        // Show success message
        document.getElementById("message").textContent =
            "Thank you! Your feedback has been submitted successfully.";

        document.getElementById("message").style.color = "green";

        document.getElementById("feedbackId").textContent =
            "Your Feedback ID: " + feedbackNumber;

        // Reset form
        feedbackForm.reset();

        // Refresh feedback display
        displayFeedback();

    });

    // Display previously submitted feedback
    displayFeedback();
}
