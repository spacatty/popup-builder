# Create Popup Project

`create-popup` is a CLI tool that allows you to quickly set up and develop customizable popups with Tailwind CSS. This tool initializes a new project folder containing all necessary files, including HTML, CSS, and JavaScript templates for popup development.

## Installation and Usage

### Install Globally via NPM

```bash
npm install -g create-popup
```

### Create a New Project

To create a new popup project, run:

```bash
npx create-popup <project_name>
```

This command initializes a new folder, `<project_name>`, with the following structure:

```plaintext
<project_name>
│   app.js                # Main build and dev script
│   tailwind.config.js    # Tailwind configuration file
│   package.json          # Project dependencies and scripts
└─── base/
│   └─── iframe.css
│   └─── iframe.html
│   └─── popup.html
│   └─── popup.js.template
│   └─── tailwind.css
└─── src/
│   └─── index.html
│   └─── popup.html
│   └─── popup.js
```

The `src` folder contains the generated files for development:

- `index.html`: The main page where the popup will be displayed.
- `popup.html`: The HTML template for your popup content.
- `popup.js`: A JavaScript file generated from `popup.js.template` with inlined styles and embedded HTML.

### Project Commands

After creating your project, navigate into the project directory:

```bash
cd <project_name>
```

#### Start Development

Run the development server with:

```bash
npm run dev
```

This command initializes a local server, watches for changes in `popup.html`, and rebuilds `popup.js` automatically with hot-reloading functionality. Access the server at `http://localhost:<available_port>`.

#### Build for Production

To generate the final `popup.js` file for production, run:

```bash
npm run build
```

The `build` command compiles all necessary styles and scripts into `src/popup.js`, replacing placeholders and inlining all CSS into the JavaScript file.

### Project Files and Folders

- **app.js**: The main script that powers the CLI tool. It handles initializing, building, and watching for changes.
- **tailwind.config.js**: Tailwind CSS configuration, automatically set up to scan `popup.html` for class usage.
- **base/**: A directory containing template files used to generate `src` folder contents:
  - `iframe.html`, `iframe.css`: Styles and template for the iframe where the popup will render.
  - `popup.html`: Template for the popup content.
  - `popup.js.template`: JavaScript template file for generating `popup.js` with inlined CSS and HTML.
  - `tailwind.css`: Base imports for Tailwind CSS processing.

---

This setup provides everything you need to start developing and customizing popups quickly, with automatic building and CSS inlining for streamlined workflow.
