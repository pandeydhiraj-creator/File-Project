
const fileForm = document.getElementById("fileForm");
const filenameInput = document.getElementById("filename");
const contentInput = document.getElementById("content");
const message = document.getElementById("message");
const refreshButton = document.getElementById("refreshButton");
const fileList = document.getElementById("fileList");

// CREATE FILE
fileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const filename = filenameInput.value.trim();
    const content = contentInput.value;

    try {
        const response = await fetch("/api/createFile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ filename, content })
        });

        const data = await response.json();

        message.textContent = data.message || data.error;

        if (response.ok) {
            fileForm.reset();

            // File create hone ke baad list update hogi
            loadFiles();
        }

    } catch (error) {
        message.textContent = "Server se connect nahi ho pa raha hai.";
    }
});


async function loadFiles() {
    try {
        const response = await fetch("/api/files");

        const files = await response.json();

        console.log("Server response:", files);

        if (!response.ok) {
            throw new Error("Files load nahi hui");
        }

        fileList.innerHTML = "";

        files.forEach((file) => {
            const li = document.createElement("li");

            const button = document.createElement("button");
            button.type = "button";
            button.textContent = file;

            button.addEventListener("click", () => {
                readFile(file);
            });

            li.appendChild(button);
            fileList.appendChild(li);
        });

        if (files.length === 0) {
            fileList.textContent = "Abhi koi file nahi hai.";
        }

    } catch (error) {
        console.error("Error loading files:", error);
        fileList.textContent = "Files load nahi ho paayi.";
    }
}

// REFRESH BUTTON
// REFRESH BUTTON
refreshButton.addEventListener("click", () => {
    console.log("Refresh button clicked");
    loadFiles();
});


// READ FILE CONTENT
async function readFile(filename) {
    try {
        const response = await fetch(
            "/api/files/" + encodeURIComponent(filename)
        );

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.error || "File read nahi hui.";
            return;
        }

        message.textContent =
            "File: " + data.filename + " | Content: " + data.content;

    } catch (error) {
        message.textContent = "File read nahi ho paayi.";
    }
}


// Page open hote hi existing files load karo
loadFiles();
