#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const chokidar = require('chokidar');
const http = require('http');
const WebSocket = require('ws');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

let port = 6201;

async function findAvailablePort(startingPort) {
    return new Promise((resolve) => {
        const server = http.createServer();
        server.listen(startingPort, () => {
            server.once('close', () => resolve(startingPort));
            server.close();
        });
        server.on('error', () => resolve(findAvailablePort(startingPort + 1)));
    });
}

const generateUniqueId = () => {
    const randomLetter = String.fromCharCode(Math.floor(Math.random() * 26) + (Math.random() < 0.5 ? 65 : 97));
    return randomLetter + crypto.randomBytes(4).toString('hex');
};

function initFiles(popupName) {
    const dirName = popupName || 'src';
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName);
        console.log(`Created directory: ${dirName}`);
    }

    // Define file paths
    const filesToCopy = ['iframe.html', 'popup.html', 'popup.js.template'];
    const destFiles = ['index.html', 'popup.html', 'popup.js'];

    // Copy base template files and rename as needed
    filesToCopy.forEach((file, i) => {
        const destPath = path.join(dirName, destFiles[i]);
        if (!fs.existsSync(destPath)) {
            fs.copyFileSync(path.join('base', file), destPath);
            console.log(`Created ${destPath}`);
        }
    });

    console.log(`Initialization complete. Files are ready in ./${dirName}`);
}

async function buildPopup(uniqueId) {
    try {
        console.log('Starting build process for popup.js...');

        const popupHtmlPath = path.join('src', 'popup.html');
        const popupHtml = fs.readFileSync(popupHtmlPath, 'utf8');

        // Set up Tailwind CSS generation
        console.log('Generating Tailwind CSS...');
        const cssSource = `@import "tailwindcss/base"; @import "tailwindcss/components"; @import "tailwindcss/utilities";`;

        // Process the Tailwind CSS and inline it into the <style> tag
        const cssResult = await postcss([tailwindcss(require('./tailwind.config.js')), autoprefixer])
            .process(cssSource, { from: undefined });

        const cssStyles = cssResult.css;
        const cssLines = cssStyles.split('\n').length;

        console.log(`Generated Tailwind CSS with approximately ${cssLines} lines of CSS.`);

        // Inject the compiled Tailwind CSS into the popup HTML
        console.log('Injecting Tailwind CSS into popup HTML...');
        const embeddedHtml = popupHtml.replace(
            '<!-- Tailwind Styles -->',
            `<style>${cssStyles}</style>`
        );

        // Replace uniqueId placeholders in the popup HTML
        console.log(`Replacing uniqueId placeholders with ID: ${uniqueId}`);
        const updatedHtml = embeddedHtml.replace(/someId/g, uniqueId);

        // Encode the updated HTML content to base64
        console.log('Encoding popup HTML content to base64...');
        const base64Html = Buffer.from(updatedHtml).toString('base64');

        // Read iframe.css and replace placeholders for the uniqueId
        console.log('Processing iframe styles...');
        const iframeStylesSource = fs.readFileSync(path.join('base', 'iframe.css'), 'utf8');
        const iframeStyles = iframeStylesSource.replace(/{{uniqueId}}/g, uniqueId);

        // Read popup.js template and replace placeholders
        console.log('Generating final popup.js from template...');
        const popupJsTemplate = fs.readFileSync(path.join('base', 'popup.js.template'), 'utf8');
        const finalPopupJs = popupJsTemplate
            .replace(/{{uniqueId}}/g, uniqueId)
            .replace('{{base64Html}}', base64Html)
            .replace('{{iframeStyles}}', iframeStyles);

        // Write the resulting JavaScript to popup.js in the src folder
        fs.writeFileSync(path.join('src', 'popup.js'), finalPopupJs, 'utf8');
        console.log('popup.js file has been built successfully.');

    } catch (error) {
        console.error('Error building popup.js:', error);
    }
}

async function watchPopupFile() {
    const uniqueId = generateUniqueId();
    const serverPort = await findAvailablePort(port);

    // Initialize and build files in src folder with generated ID
    initFiles('src');
    buildPopup(uniqueId);

    const server = http.createServer((req, res) => {
        if (req.url === '/popup.js') {
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(fs.readFileSync(path.join('src', 'popup.js')));
        } else if (req.url === '/') {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(fs.readFileSync(path.join('src', 'index.html')));
        } else {
            res.writeHead(404);
            res.end('Not found');
        }
    });

    const wss = new WebSocket.Server({ server });

    // Watch for changes in both `popup.html` and `popup.js`
    const watcher = chokidar.watch(['src/popup.html'], {
        ignored: /node_modules/,
        persistent: true,
    });

    // Rebuild `popup.js` when `popup.html` changes
    watcher.on('change', (filePath) => {
        console.log('Detected change in popup.html, rebuilding popup.js...');
        buildPopup(uniqueId).then(() => {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send('reload');
                }
            });
        });
    });

    server.listen(serverPort, () => {
        console.log(`Dev server running at http://localhost:${serverPort}`);
    });
}

const args = process.argv.slice(2);
if (args[0] === 'init') {
    initFiles(args[1]);
} else if (args[0] === 'dev') {
    watchPopupFile();  // automatically initializes and watches
} else if (args[0] === 'build') {
    const uniqueId = generateUniqueId();
    buildPopup(uniqueId);
} else {
    console.log('Unknown command. Use "init <name>", "dev", or "build".');
}
