document.getElementById("loginBtn").addEventListener("click", async function () {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please fill all fields");
        return;
    }

    try {

        const response = await fetch("http://127.0.0.1:5000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        console.log("Login response:", data);
        console.log("Status:", response.status);

        if (response.ok) {

            localStorage.setItem("user_id", data.user_id);

            alert("Login successful!");

            window.location.href = "index.html";

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.error("Login error:", error);
        alert("Something went wrong");

    }

});