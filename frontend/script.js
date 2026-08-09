
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const analyzebtn = document.getElementById("analyzebtn");
const resultSection = document.getElementById("resultSection");
const diseaseresult = document.getElementById("diseaseresult");
const suggestionrel = document.getElementById("suggestionrel");
const confidencerel = document.getElementById("confidencerel");
const loading = document.getElementById("loading");
const resetbtn = document.getElementById("resetbtn");
const fileInput = document.getElementById("imageInput");

imageInput.addEventListener("change", function () {
    //image select hone ke baad ka code
    const file = imageInput.files[0];
    const imageURL = URL.createObjectURL(file);
    imagePreview.src = imageURL;
    imagePreview.style.display = "block";
    document.querySelector(".uploadbox h3").textContent = file.name;

});
analyzebtn.addEventListener("click", function () {

    if (!imageInput.files[0]) {
        alert("Please upload a crop image first");
        return;
    }
    const file = imageInput.files[0];

    loading.style.display = "block";
    analyzebtn.textContent = "Analyzing...";
    analyzebtn.disabled = true;

    const formData = new FormData();

    formData.append("image", file);

    const userId = localStorage.getItem("user_id");
    formData.append("user_id", userId);

    fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Analysis failed");
            }

            return response.json();
        })
        .then(data => {

            console.log("AI RESULT:", data);

            // Show disease
            diseaseresult.textContent = data.disease;

            // Show recommendation
            suggestionrel.textContent = data.suggestion;

            // Show confidence
            confidencerel.textContent = data.confidence;

            // Set confidence bar
            confidenceBar.style.width = data.confidence;

            // Show result section
            resultSection.style.display = "block";

            // Stop loading
            loading.style.display = "none";

            // Reset button
            analyzebtn.textContent = "Analyze Crop";
            analyzebtn.disabled = false;

            // Scroll to result
            resultSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            // Refresh history
            loadHistory();

            // Refresh dashboard stats
            loadDashboardStats();

        })
        .catch(error => {

            console.error("Analysis Error:", error);

            loading.style.display = "none";

            analyzebtn.textContent = "Analyze Crop";
            analyzebtn.disabled = false;

            alert("Something went wrong!");
        });
});

resetbtn.addEventListener("click", function () {
    resultSection.style.display = "none";
    imagePreview.src = "";
    imagePreview.style.display = "none";
    imageInput.value = "";
    document.querySelector(".uploadbox h3").textContent = "upload crop image";
});

async function loadHistory() {

    const response = await fetch("http://127.0.0.1:5000/history");
    const data = await response.json();

    const container = document.getElementById("historyContainer");

    container.innerHTML = "";

    data.forEach(item => {

        container.innerHTML += `
        <div class="history-card">
            <h3>${item.disease}</h3>
            <p><strong>Confidence:</strong> ${item.confidence}</p>
            <p>${item.suggestion}</p>
            <small>${item.time}</small>
        </div>
    `;

    });

}
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("loggedIn");
        window.location.href = "login.html";
    });
}

loadHistory();

async function loadHistory() {

    try {

        const userId = localStorage.getItem("user_id");

        const response = await fetch(
            `http://127.0.0.1:5000/history?user_id=${userId}`
        );

        if (!response.ok) {
            throw new Error("Failed to load history");
        }

        const data = await response.json();

        const container = document.getElementById("historyContainer");

        container.innerHTML = "";

        if (data.length === 0) {

            container.innerHTML = `
                <div class="empty-history">
                    <div>📜</div>
                    <h3>No predictions yet</h3>
                    <p>Your crop analysis history will appear here.</p>
                </div>
            `;

            return;
        }

        data.forEach(item => {

            const isHealthy =
                item.disease.toLowerCase().includes("healthy");

            const statusClass = isHealthy ? "healthy" : "diseased";

            const statusIcon = isHealthy ? "🌱" : "⚠️";

            container.innerHTML += `

                <div class="history-item ${statusClass}">

                    <div class="history-icon">
                        ${statusIcon}
                    </div>

                    <div class="history-info">

                        <h3>${item.disease}</h3>

                        <p>
                            ${item.suggestion}
                        </p>

                        <small>
                            🕒 ${item.time}
                        </small>

                    </div>

                    <div class="history-confidence">

                        <span>Confidence</span>

                        <strong>
                            ${item.confidence}
                        </strong>

                    </div>

                </div>

            `;

        });

    } catch (error) {

        console.error("History Error:", error);

    }
}
loadHistory();


async function loadDashboardStats() {

    try {

        const userId = localStorage.getItem("user_id");

        const response = await fetch(
            `http://127.0.0.1:5000/history?user_id=${userId}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch history");
        }

        const history = await response.json();

        const total = history.length;

        const healthy = history.filter(item =>
            item.disease.toLowerCase().includes("healthy")
        ).length;

        const diseased = total - healthy;

        let averageConfidence = 0;

        if (total > 0) {

            const confidenceValues = history.map(item =>
                parseFloat(item.confidence)
            );

            averageConfidence =
                confidenceValues.reduce(
                    (sum, value) => sum + value,
                    0
                ) / total;
        }

        document.getElementById("totalPredictions").textContent = total;

        document.getElementById("healthyPredictions").textContent = healthy;

        document.getElementById("diseasedPredictions").textContent = diseased;

        document.getElementById("averageConfidence").textContent =
            averageConfidence.toFixed(1) + "%";

    } catch (error) {

        console.error("Dashboard stats error:", error);

    }
}

loadDashboardStats();

const chatbotCard = document.getElementById("chatbotCard");
const chatbotContainer = document.getElementById("chatbotContainer");
const closeChatbot = document.getElementById("closeChatbot");

chatbotCard.addEventListener("click", function () {
    chatbotContainer.style.display = "block";
});

closeChatbot.addEventListener("click", function () {
    chatbotContainer.style.display = "none";
});

document.addEventListener("DOMContentLoaded", function () {

    const chatbotCard = document.getElementById("chatbotCard");
    const chatbotContainer = document.getElementById("chatbotContainer");
    const closeChatbot = document.getElementById("closeChatbot");

    const sendChatbotMessage = document.getElementById("sendChatbotMessage");
    const chatbotInput = document.getElementById("chatbotInput");
    const chatbotMessages = document.getElementById("chatbotMessages");


    // Open chatbot
    chatbotCard.addEventListener("click", function () {
        chatbotContainer.style.display = "block";
    });


    // Close chatbot
    closeChatbot.addEventListener("click", function () {
        chatbotContainer.style.display = "none";
    });


    // Send message
    sendChatbotMessage.addEventListener("click", async function () {

        const message = chatbotInput.value.trim();

        if (!message) return;

        chatbotMessages.innerHTML += `
            <div class="user-message">
                ${message}
            </div>
        `;

        chatbotInput.value = "";


        try {

            const response = await fetch("http://127.0.0.1:5000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: message
                })
            });


            const data = await response.json();


            chatbotMessages.innerHTML += `
                <div class="bot-message">
                    ${data.response}
                </div>
            `;


        } catch (error) {

            console.error("Chatbot error:", error);

            chatbotMessages.innerHTML += `
                <div class="bot-message">
                    Sorry, I couldn't connect to the server.
                </div>
            `;
        }

    });

});

async function loadDiseaseChart() {

    try {
        const userId = localStorage.getItem("user_id");

        const response = await fetch(
            `http://127.0.0.1:5000/history?user_id=${userId}`
        );


        if (!response.ok) {
            throw new Error("Failed to fetch history");
        }

        const history = await response.json();

        const diseaseCounts = {};

        history.forEach(item => {

            const disease = item.disease;

            if (diseaseCounts[disease]) {
                diseaseCounts[disease]++;
            } else {
                diseaseCounts[disease] = 1;
            }

        });

        const labels = Object.keys(diseaseCounts);
        const values = Object.values(diseaseCounts);

        const chartCanvas = document.getElementById("diseaseChart");

        if (!chartCanvas) {
            return;
        }

        new Chart(chartCanvas, {

            type: "doughnut",

            data: {
                labels: labels,

                datasets: [{
                    label: "Predictions",
                    data: values
                }]
            },

            options: {
                responsive: true,

                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }

        });

    } catch (error) {

        console.error("Disease chart error:", error);

    }
}

loadDiseaseChart();

async function loadWeather() {

    try {

        if (!navigator.geolocation) {
            throw new Error("Geolocation is not supported");
        }

        navigator.geolocation.getCurrentPosition(
            async function (position) {

                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                const response = await fetch(
                    `http://127.0.0.1:5000/weather?latitude=${latitude}&longitude=${longitude}`
                );

                if (!response.ok) {
                    throw new Error("Weather request failed");
                }

                const data = await response.json();

                document.getElementById("weatherLocation").textContent =
                    "Current location";

                document.getElementById("temperature").textContent =
                    data.temperature + "°C";

                document.getElementById("weatherCondition").textContent =
                    data.condition;

                document.getElementById("humidity").textContent =
                    data.humidity + "%";

                document.getElementById("rainChance").textContent =
                    data.rainChance + "%";

                document.getElementById("windSpeed").textContent =
                    data.windSpeed + " km/h";

                document.getElementById("weatherIcon").textContent =
                    data.icon;

            },
            function (error) {

                console.error("Location Error:", error);

                document.getElementById("weatherCondition").textContent =
                    "Location permission required";

            }
        );

    } catch (error) {

        console.error("Weather Error:", error);

        document.getElementById("weatherCondition").textContent =
            "Weather unavailable";
    }
}

loadWeather();

// ================= CAMERA SCANNER =================

const cameraBtn = document.getElementById("cameraBtn");
const cameraContainer = document.getElementById("cameraContainer");
const cameraVideo = document.getElementById("cameraVideo");
const captureBtn = document.getElementById("captureBtn");
const cameraCanvas = document.getElementById("cameraCanvas");

let cameraStream = null;


cameraBtn.addEventListener("click", async function () {

    try {

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment"
            },
            audio: false
        });

        cameraVideo.srcObject = cameraStream;

        cameraContainer.style.display = "block";

        cameraBtn.textContent = "📷 Camera Active";

    } catch (error) {

        console.error("Camera Error:", error);

        alert("Unable to access camera. Please allow camera permission.");

    }

});


captureBtn.addEventListener("click", function () {

    if (!cameraStream) {
        alert("Please open the camera first.");
        return;
    }

    const context = cameraCanvas.getContext("2d");

    cameraCanvas.width = cameraVideo.videoWidth;
    cameraCanvas.height = cameraVideo.videoHeight;

    context.drawImage(
        cameraVideo,
        0,
        0,
        cameraCanvas.width,
        cameraCanvas.height
    );

    cameraCanvas.toBlob(function (blob) {

        const file = new File(
            [blob],
            "camera-capture.jpg",
            {
                type: "image/jpeg"
            }
        );

        // Put captured image into the existing file input
        const dataTransfer = new DataTransfer();

        dataTransfer.items.add(file);

        imageInput.files = dataTransfer.files;

        // Show captured image
        imagePreview.src = URL.createObjectURL(file);
        imagePreview.style.display = "block";

        document.querySelector(".uploadbox h3").textContent =
            "Camera capture ready";

        resultSection.style.display = "none";

        analyzebtn.disabled = false;
        analyzebtn.textContent = "Analyze Crop";

        // Stop camera
        cameraStream.getTracks().forEach(track => track.stop());

        cameraStream = null;

        cameraContainer.style.display = "none";

        cameraBtn.textContent = "📷 Open Camera";

        // Scroll to analyze button
        analyzebtn.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }, "image/jpeg");

});