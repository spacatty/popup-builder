#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectDir = process.argv[2];

if (!projectDir) {
    console.log("Please provide a project name: npx create-popup <project_name>");
    process.exit(1);
}

// Create the project directory
fs.mkdirSync(projectDir, { recursive: true });
console.log(`Created project directory: ${projectDir}`);

// Template for the new project's package.json
const packageJsonTemplate = {
    name: projectDir,
    version: "1.0.0",
    description: "Popup builder project",
    main: "app.js",
    scripts: {
        dev: "node app.js dev",
        build: "node app.js build"
    },
    dependencies: {
        autoprefixer: "^10.4.20",
        chokidar: "^4.0.1",
        crypto: "^1.0.1",
        postcss: "^8.4.47",
        tailwindcss: "^3.4.14",
        ws: "^8.18.0"
    }
};

// Write package.json
fs.writeFileSync(
    path.join(projectDir, 'package.json'),
    JSON.stringify(packageJsonTemplate, null, 2)
);
console.log(`Created package.json for ${projectDir}`);

// Copy the app.js script and base files
const filesToCopy = ['app.js', 'tailwind.config.js', 'base'];
filesToCopy.forEach(file => {
    const source = path.join(__dirname, file);
    const destination = path.join(projectDir, file);

    // Check if the source exists before attempting to copy
    if (fs.existsSync(source)) {
        // Recursive copy for directories
        fs.cpSync(source, destination, { recursive: true });
        console.log(`Copied ${file} to ${projectDir}`);
    } else {
        console.warn(`Warning: ${file} not found.`);
    }
});

// Run npm install within the new project directory
console.log('Installing dependencies...');
execSync(`npm install`, { cwd: projectDir, stdio: 'inherit' });

console.log(`Project setup complete! To get started:\n\ncd ${projectDir}\nnpm run dev`);
