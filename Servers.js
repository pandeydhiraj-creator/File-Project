
const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {

    // Public folder path
    const publicFolder = path.join(__dirname, "public");

    // Data folder path
    const dataFolder = path.join(__dirname, "data");

    // Create data folder if it does not exist
    if (!fs.existsSync(dataFolder)) {
        fs.mkdirSync(dataFolder);
    }

    // Serve HTML
    if (req.method === "GET" && req.url === "/") {

        const filePath = path.join(publicFolder, "index.html");

        fs.readFile(filePath, "utf8", (err, data) => {

            if (err) {
                res.writeHead(500, {
                    "Content-Type": "text/plain"
                });

                res.end("Error loading HTML file");
                return;
            }

            res.writeHead(200, {
                "Content-Type": "text/html"
            });

            res.end(data);
        });

        return;
    }

    // Serve CSS
    if (req.method === "GET" && req.url === "/style.css") {

        const filePath = path.join(publicFolder, "style.css");

        fs.readFile(filePath, "utf8", (err, data) => {

            if (err) {
                res.writeHead(500, {
                    "Content-Type": "text/plain"
                });

                res.end("Error loading CSS file");
                return;
            }

            res.writeHead(200, {
                "Content-Type": "text/css"
            });

            res.end(data);
        });

        return;
    }

    // Serve JavaScript
    if (req.method === "GET" && req.url === "/app.js") {

        const filePath = path.join(publicFolder, "app.js");

        fs.readFile(filePath, "utf8", (err, data) => {

            if (err) {
                res.writeHead(500, {
                    "Content-Type": "text/plain"
                });

                res.end("Error loading JavaScript file");
                return;
            }

            res.writeHead(200, {
                "Content-Type": "text/javascript"
            });

            res.end(data);
        });

        return;
    }

    // CREATE FILE
    if (req.method === "POST" && req.url === "/api/createFile") {

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {

            try {
                const fileData = JSON.parse(body);

                const fileName = fileData.filename;
                const fileContent = fileData.content;

                // Validate filename
                if (
                    typeof fileName !== "string" ||
                   !/^[a-zA-Z0-9_-]+\.txt$/.test(fileName) ||
                    typeof fileContent !== "string"
                ) {
                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        error: "Enter a valid .txt filename and content"
                    }));

                    return;
                }

                const filePath = path.join(dataFolder, fileName);

                // Create and save file
                fs.writeFile(filePath, fileContent, (err) => {

                    if (err) {
                        res.writeHead(500, {
                            "Content-Type": "application/json"
                        });

                        res.end(JSON.stringify({
                            error: "Error creating file"
                        }));

                        return;
                    }

                    res.writeHead(201, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        message: "File created successfully"
                    }));
                });

            } catch (error) {

                res.writeHead(400, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    error: "Invalid JSON data"
                }));
            }
        });

        return;
    }

    // GET ALL FILES
    if (req.method === "GET" && req.url === "/api/files") {

        fs.readdir(dataFolder, (err, files) => {

            if (err) {
                res.writeHead(500, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    error: "Unable to read files"
                }));

                return;
            }

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify(files));
        });

        return;
    }

    // READ A PARTICULAR FILE
    if (req.method === "GET" && req.url.startsWith("/api/files/")) {

        const fileName = decodeURIComponent(
            req.url.slice("/api/files/".length)
        );

        // Validate filename to prevent access outside data folder
        if (!/^[a-zA-Z0-9_-]+\.txt$/.test(fileName)) {

            res.writeHead(400, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                error: "Invalid filename"
            }));

            return;
        }

        const filePath = path.join(dataFolder, fileName);

        fs.readFile(filePath, "utf8", (err, content) => {

            if (err) {

                const statusCode = err.code === "ENOENT" ? 404 : 500;

                res.writeHead(statusCode, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    error: err.code === "ENOENT"
                        ? "File not found"
                        : "Error reading file"
                }));

                return;
            }

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                filename: fileName,
                content: content
            }));
        });

        return;
    }

    // 404 - Route not found
    res.writeHead(404, {
        "Content-Type": "text/plain"
    });

    res.end("404 - Page not found");

});

server.listen(3000, () => {
    console.log("Server is running at http://localhost:3000");
});
