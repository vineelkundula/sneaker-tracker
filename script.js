// ===============================
// SNEAKER TRACKER JAVASCRIPT
// ===============================

let sneakers = [];
let currentSearch = "";
let currentFilter = "All";
let currentSort = "default";
let countdownTimer = null;

// ===============================
// FAVORITES
// ===============================

let favorites = [];

try {
    favorites = JSON.parse(localStorage.getItem("favorites")) || [];
} catch (error) {
    favorites = [];
}

// ===============================
// HTML ELEMENTS
// ===============================

const container = document.getElementById("sneaker-container");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const sortSelect = document.getElementById("sortSelect");
const detailsSection = document.getElementById("sneaker-details");
const browseReleasesBtn = document.getElementById("browseReleasesBtn");

const analyzeSneakerBtn = document.getElementById("analyzeSneakerBtn");
const aiNewsInput = document.getElementById("aiNewsInput");
const aiStatus = document.getElementById("aiStatus");

const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");

let isAdmin = false;

const loginModal = document.getElementById("loginModal");
const closeLoginBtn = document.getElementById("closeLoginBtn");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const adminPassword = document.getElementById("adminPassword");
const loginStatus = document.getElementById("loginStatus");

const adminOnlyMessage = document.getElementById("adminOnlyMessage");
const aiAnalyzerContent = document.getElementById("aiAnalyzerContent");
const aiAdminLoginBtn = document.getElementById("aiAdminLoginBtn");

// ===============================
// LOAD SNEAKERS
// ===============================

async function loadSneakers() {

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/sneakers"
        );

        if (!response.ok) {
            throw new Error("Could not load sneakers.");
        }

        sneakers = await response.json();

        updateDisplay();

    } catch (error) {

        console.error("Failed to load sneakers:", error);

        if (container) {

            container.innerHTML = `
                <div class="no-results">
                    <h2>Backend not connected</h2>
                    <p>Make sure Flask is running.</p>
                </div>
            `;

        }
    }
}

// ===============================
// DISPLAY SNEAKERS
// ===============================

function displaySneakers(list) {

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (list.length === 0) {

        container.innerHTML = `
            <div class="no-results">
                <h2>No sneakers found</h2>
                <p>Try changing your search or filter.</p>
            </div>
        `;

        return;
    }

    list.forEach(function(sneaker) {

        const card = document.createElement("div");

        card.className = "card";

        const isFavorite =
            favorites.includes(sneaker.name);

        let image = sneaker.image;

        if (!image || image.trim() === "") {

            image =
                "https://via.placeholder.com/400x400?text=No+Image";

        }

        // ===============================
        // ADMIN DELETE BUTTON
        // TOP RIGHT OF CARD
        // ===============================

        const deleteButtonHTML = isAdmin
            ? `
                <button
                    class="delete-sneaker-btn"
                    data-id="${sneaker.id}"
                    title="Delete sneaker"
                    aria-label="Delete sneaker"
                >
                    🗑
                </button>
            `
            : "";

        // ===============================
        // ADMIN IMAGE BUTTON
        // ===============================

        const imageButtonHTML = isAdmin
            ? `
                <button
                    class="image-btn"
                    data-id="${sneaker.id}"
                >
                    🖼️ Add Image
                </button>
            `
            : "";

        // ===============================
        // CARD HTML
        // ===============================

        card.innerHTML = `
            ${deleteButtonHTML}

            <img
                src="${image}"
                alt="${sneaker.name}"
            >

            <div class="card-content">

                <h2>${sneaker.name}</h2>

                <p>
                    <strong>Release:</strong>
                    ${sneaker.releaseDate || "TBA"}
                </p>

                <p class="status">
                    ${sneaker.status || "Unknown"}
                </p>

                <h3>
                    ${
                        sneaker.price !== null &&
                        sneaker.price !== undefined
                            ? "$" + sneaker.price
                            : "Price TBA"
                    }
                </h3>

                <button
                    class="favorite-btn"
                    data-name="${sneaker.name}"
                >
                    ${
                        isFavorite
                            ? "❤️ Favorited"
                            : "♡ Favorite"
                    }
                </button>

                ${imageButtonHTML}

            </div>
        `;

        container.appendChild(card);

        // ===============================
        // DELETE BUTTON
        // ===============================

        if (isAdmin) {

            const deleteButton =
                card.querySelector(".delete-sneaker-btn");

            if (deleteButton) {

                deleteButton.addEventListener(
                    "click",
                    async function(event) {

                        event.preventDefault();
                        event.stopPropagation();

                        const confirmed =
                            confirm(
                                "Are you sure you want to delete " +
                                sneaker.name +
                                "?"
                            );

                        if (!confirmed) {
                            return;
                        }

                        try {

                            const response =
                                await fetch(
                                    "http://127.0.0.1:5000/api/sneakers/" +
                                    sneaker.id,
                                    {
                                        method: "DELETE",
                                        credentials: "include"
                                    }
                                );

                            const result =
                                await response.json();

                            if (!response.ok) {

                                throw new Error(
                                    result.error ||
                                    "Could not delete sneaker."
                                );

                            }

                            favorites =
                                favorites.filter(
                                    function(name) {
                                        return name !== sneaker.name;
                                    }
                                );

                            localStorage.setItem(
                                "favorites",
                                JSON.stringify(favorites)
                            );

                            await loadSneakers();

                        } catch (error) {

                            console.error(error);

                            alert(
                                error.message ||
                                "Could not delete sneaker."
                            );

                        }

                    }
                );

            }

        }

        // ===============================
        // CARD CLICK
        // ===============================

        card.addEventListener(
            "click",
            function() {

                showSneakerDetails(sneaker);

            }
        );

        // ===============================
        // FAVORITE BUTTON
        // ===============================

        const favoriteButton =
            card.querySelector(".favorite-btn");

        if (favoriteButton) {

            favoriteButton.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();
                    event.stopPropagation();

                    const name =
                        favoriteButton.dataset.name;

                    if (favorites.includes(name)) {

                        favorites =
                            favorites.filter(
                                function(item) {
                                    return item !== name;
                                }
                            );

                    } else {

                        favorites.push(name);

                    }

                    localStorage.setItem(
                        "favorites",
                        JSON.stringify(favorites)
                    );

                    updateDisplay();

                }
            );

        }

        // ===============================
        // ADMIN ADD IMAGE BUTTON
        // ===============================

        if (isAdmin) {

            const imageButton =
                card.querySelector(".image-btn");

            if (imageButton) {

                imageButton.addEventListener(
                    "click",
                    async function(event) {

                        event.preventDefault();
                        event.stopPropagation();

                        const imageUrl =
                            prompt(
                                "Paste the image URL for " +
                                sneaker.name +
                                ":"
                            );

                        if (
                            !imageUrl ||
                            imageUrl.trim() === ""
                        ) {
                            return;
                        }

                        try {

                            const response =
                                await fetch(
                                    "http://127.0.0.1:5000/api/sneakers/" +
                                    sneaker.id +
                                    "/image",
                                    {
                                        method: "PUT",

                                        credentials: "include",

                                        headers: {
                                            "Content-Type":
                                                "application/json"
                                        },

                                        body: JSON.stringify({
                                            image:
                                                imageUrl.trim()
                                        })
                                    }
                                );

                            const result =
                                await response.json();

                            if (!response.ok) {

                                throw new Error(
                                    result.error ||
                                    "Image update failed."
                                );

                            }

                            await loadSneakers();

                        } catch (error) {

                            console.error(error);

                            alert(
                                error.message ||
                                "Could not update the sneaker image."
                            );

                        }

                    }
                );

            }

        }

    });

}

// ===============================
// COUNTDOWN
// ===============================

function getCountdown(releaseDate) {

    if (!releaseDate) {
        return "Release date TBA";
    }

    const release = new Date(releaseDate);
    const now = new Date();

    const difference = release - now;

    const days = Math.ceil(
        difference / (1000 * 60 * 60 * 24)
    );

    if (days < 0) {
        return "Already released";
    }

    if (days === 0) {
        return "Releases today!";
    }

    if (days === 1) {
        return "Releases tomorrow!";
    }

    return "Releases in " + days + " days";
}

// ===============================
// SNEAKER DETAILS
// ===============================

function showSneakerDetails(sneaker) {

    if (!container || !detailsSection) {
        return;
    }

    container.style.display = "none";
    detailsSection.style.display = "block";

    let image = sneaker.image;

    if (!image || image.trim() === "") {

        image =
            "https://via.placeholder.com/600x600?text=No+Image";

    }

    const isFavorite =
        favorites.includes(sneaker.name);

    detailsSection.innerHTML = `
        <button class="detail-back">
            Back to Releases
        </button>

        <img
            class="detail-image"
            src="${image}"
            alt="${sneaker.name}"
        >

        <div class="detail-content">

            <h1>${sneaker.name}</h1>

            <p>
                <strong>Release Date:</strong>
                ${sneaker.releaseDate || "TBA"}
            </p>

            <p>
                <strong>Status:</strong>
                ${sneaker.status || "Unknown"}
            </p>

            <h3>
                ${
                    sneaker.price !== null &&
                    sneaker.price !== undefined
                        ? "$" + sneaker.price
                        : "Price TBA"
                }
            </h3>

            <p id="countdown"></p>

            <button class="detail-favorite-btn">
                ${
                    isFavorite
                        ? "❤️ Favorited"
                        : "♡ Favorite"
                }
            </button>

        </div>
    `;

    const countdown =
        detailsSection.querySelector("#countdown");

    function updateCountdown() {

        if (countdown) {

            countdown.textContent =
                getCountdown(
                    sneaker.releaseDate
                );

        }

    }

    updateCountdown();

    if (countdownTimer) {
        clearInterval(countdownTimer);
    }

    countdownTimer =
        setInterval(updateCountdown, 60000);

    const backButton =
        detailsSection.querySelector(".detail-back");

    if (backButton) {

        backButton.addEventListener(
            "click",
            function() {

                detailsSection.style.display = "none";
                container.style.display = "grid";

                if (countdownTimer) {
                    clearInterval(countdownTimer);
                }

                countdownTimer = null;

                updateDisplay();

            }
        );

    }

    const favoriteButton =
        detailsSection.querySelector(
            ".detail-favorite-btn"
        );

    if (favoriteButton) {

        favoriteButton.addEventListener(
            "click",
            function() {

                if (favorites.includes(sneaker.name)) {

                    favorites =
                        favorites.filter(
                            function(name) {
                                return name !== sneaker.name;
                            }
                        );

                } else {

                    favorites.push(
                        sneaker.name
                    );

                }

                localStorage.setItem(
                    "favorites",
                    JSON.stringify(favorites)
                );

                showSneakerDetails(sneaker);

            }
        );

    }

}

// ===============================
// UPDATE DISPLAY
// ===============================

function updateDisplay() {

    let list = [...sneakers];

    if (currentFilter === "Confirmed") {

        list =
            list.filter(
                function(sneaker) {
                    return sneaker.status === "Confirmed";
                }
            );

    }

    if (currentFilter === "Rumor") {

        list =
            list.filter(
                function(sneaker) {
                    return sneaker.status === "Rumor";
                }
            );

    }

    if (currentFilter === "Favorites") {

        list =
            list.filter(
                function(sneaker) {
                    return favorites.includes(
                        sneaker.name
                    );
                }
            );

    }

    if (currentSearch !== "") {

        list =
            list.filter(
                function(sneaker) {

                    return sneaker.name
                        .toLowerCase()
                        .includes(currentSearch);

                }
            );

    }

    if (currentSort === "name") {

        list.sort(
            function(a, b) {
                return a.name.localeCompare(b.name);
            }
        );

    }

    if (currentSort === "price-low") {

        list.sort(
            function(a, b) {
                return (a.price || 0) -
                       (b.price || 0);
            }
        );

    }

    if (currentSort === "price-high") {

        list.sort(
            function(a, b) {
                return (b.price || 0) -
                       (a.price || 0);
            }
        );

    }

    if (currentSort === "date") {

        list.sort(
            function(a, b) {

                return new Date(a.releaseDate) -
                       new Date(b.releaseDate);

            }
        );

    }

    displaySneakers(list);
}

// ===============================
// SEARCH
// ===============================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function() {

            currentSearch =
                searchInput.value
                    .toLowerCase()
                    .trim();

            updateDisplay();

        }
    );

}

// ===============================
// FILTERS
// ===============================

filterButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                currentFilter =
                    button.dataset.filter;

                filterButtons.forEach(
                    function(btn) {
                        btn.classList.remove("active");
                    }
                );

                button.classList.add("active");

                updateDisplay();

            }
        );

    }
);

// ===============================
// SORT
// ===============================

if (sortSelect) {

    sortSelect.addEventListener(
        "change",
        function() {

            currentSort =
                sortSelect.value;

            updateDisplay();

        }
    );

}

// ===============================
// AI ANALYZER
// ===============================

async function analyzeSneakerNews(news) {

    const response =
        await fetch(
            "http://127.0.0.1:5000/api/ai/extract",
            {
                method: "POST",

                credentials: "include",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    news: news,
                    source: "Manual AI Entry"
                })
            }
        );

    const result =
        await response.json();

    if (!response.ok) {

        throw new Error(
            result.error ||
            "AI analysis failed."
        );

    }

    return result;
}

// ===============================
// ANALYZE BUTTON
// ===============================

if (
    analyzeSneakerBtn &&
    aiNewsInput &&
    aiStatus
) {

    analyzeSneakerBtn.addEventListener(
        "click",
        async function() {

            if (!isAdmin) {

                alert(
                    "Admin access required."
                );

                return;
            }

            const news =
                aiNewsInput.value.trim();

            if (news === "") {

                alert(
                    "Please paste sneaker news first."
                );

                return;
            }

            analyzeSneakerBtn.disabled = true;

            analyzeSneakerBtn.textContent =
                "Analyzing...";

            aiStatus.textContent =
                "AI is reading the sneaker information...";

            try {

                const result =
                    await analyzeSneakerNews(news);

                console.log(
                    "AI RESULT:",
                    result
                );

                aiNewsInput.value = "";

                aiStatus.textContent =
                    "Sneaker added successfully!";

                await loadSneakers();

            } catch (error) {

                console.error(error);

                aiStatus.textContent =
                    error.message ||
                    "AI analysis failed.";

            }

            analyzeSneakerBtn.disabled = false;

            analyzeSneakerBtn.innerHTML =
                'Analyze Release <span>→</span>';

        }
    );

}

// ===============================
// BROWSE RELEASES
// ===============================

if (browseReleasesBtn) {

    browseReleasesBtn.addEventListener(
        "click",
        function() {

            const releases =
                document.getElementById("releases");

            if (releases) {

                releases.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

}

// ===============================
// ADMIN LOGIN BUTTON
// ===============================

if (adminLoginBtn) {

    adminLoginBtn.addEventListener(
        "click",
        function() {

            if (loginModal) {
                loginModal.style.display = "flex";
            }

            if (adminPassword) {
                adminPassword.focus();
            }

        }
    );

}

// ===============================
// AI ADMIN LOGIN BUTTON
// ===============================

if (aiAdminLoginBtn) {

    aiAdminLoginBtn.addEventListener(
        "click",
        function() {

            if (loginModal) {
                loginModal.style.display = "flex";
            }

            if (adminPassword) {
                adminPassword.focus();
            }

        }
    );

}

// ===============================
// CLOSE LOGIN
// ===============================

if (closeLoginBtn) {

    closeLoginBtn.addEventListener(
        "click",
        function() {

            if (loginModal) {
                loginModal.style.display = "none";
            }

            if (loginStatus) {
                loginStatus.textContent = "";
            }

            if (adminPassword) {
                adminPassword.value = "";
            }

        }
    );

}

// ===============================
// ADMIN LOGIN
// ===============================

if (loginSubmitBtn) {

    loginSubmitBtn.addEventListener(
        "click",
        async function() {

            const password =
                adminPassword
                    ? adminPassword.value.trim()
                    : "";

            if (password === "") {

                if (loginStatus) {
                    loginStatus.textContent =
                        "Please enter your password.";
                }

                return;
            }

            loginSubmitBtn.disabled = true;

            loginSubmitBtn.textContent =
                "Signing in...";

            try {

                const response =
                    await fetch(
                        "http://127.0.0.1:5000/api/admin/login",
                        {
                            method: "POST",

                            credentials: "include",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                password: password
                            })
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Login failed."
                    );

                }

                if (loginModal) {
                    loginModal.style.display = "none";
                }

                if (adminPassword) {
                    adminPassword.value = "";
                }

                if (loginStatus) {
                    loginStatus.textContent = "";
                }

                updateAdminUI(true);

            } catch (error) {

                console.error(error);

                if (loginStatus) {

                    loginStatus.textContent =
                        error.message ||
                        "Incorrect password.";

                }

            }

            loginSubmitBtn.disabled = false;

            loginSubmitBtn.textContent =
                "Sign In";

        }
    );

}

// ===============================
// UPDATE ADMIN UI
// ===============================

function updateAdminUI(adminStatus) {

    isAdmin = adminStatus;

    if (adminStatus) {

        if (adminOnlyMessage) {
            adminOnlyMessage.style.display = "none";
        }

        if (aiAnalyzerContent) {
            aiAnalyzerContent.style.display = "block";
        }

        if (adminLoginBtn) {
            adminLoginBtn.textContent = "🔓 Admin";
        }

        if (adminLogoutBtn) {
            adminLogoutBtn.style.display = "inline-block";
        }

    } else {

        if (adminOnlyMessage) {
            adminOnlyMessage.style.display = "block";
        }

        if (aiAnalyzerContent) {
            aiAnalyzerContent.style.display = "none";
        }

        if (adminLoginBtn) {
            adminLoginBtn.textContent = "🔐 Admin";
        }

        if (adminLogoutBtn) {
            adminLogoutBtn.style.display = "none";
        }

    }

    updateDisplay();
}

// ===============================
// ADMIN LOGOUT
// ===============================

if (adminLogoutBtn) {

    adminLogoutBtn.addEventListener(
        "click",
        async function() {

            try {

                const response =
                    await fetch(
                        "http://127.0.0.1:5000/api/admin/logout",
                        {
                            method: "POST",
                            credentials: "include"
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Logout failed."
                    );

                }

                updateAdminUI(false);

                alert(
                    "You have been signed out."
                );

                location.reload();

            } catch (error) {

                console.error(error);

                alert(
                    error.message ||
                    "Could not sign out. Make sure Flask is running."
                );

            }

        }
    );

}

// ===============================
// CHECK ADMIN STATUS
// ===============================

async function checkAdminStatus() {

    try {

        const response =
            await fetch(
                "http://127.0.0.1:5000/api/admin/status",
                {
                    credentials: "include"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Status check failed."
            );

        }

        const result =
            await response.json();

        updateAdminUI(
            result.admin === true
        );

    } catch (error) {

        console.error(
            "Admin status error:",
            error
        );

        updateAdminUI(false);

    }
}

// ===============================
// START APP
// ===============================

if (filterButtons.length > 0) {

    filterButtons[0].classList.add("active");

}

updateAdminUI(false);

loadSneakers();

checkAdminStatus();