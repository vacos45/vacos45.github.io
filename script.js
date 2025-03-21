// DOM Elements
const codeEditor = document.getElementById('code-editor');
const runButton = document.getElementById('run-btn');
const consoleOutput = document.getElementById('console');
const clearConsoleButton = document.getElementById('clear-console-btn');
const packageInput = document.getElementById('package-input');
const installButton = document.getElementById('install-btn');
const packageResults = document.getElementById('package-results');
const previewFrame = document.getElementById('preview');

// Initialize preview iframe content
initializePreview();

let pyodide = null;
let micropip = null;
let pyodideLoading = false;
let installedPackages = new Set();

// Initialize the preview iframe with basic HTML
function initializePreview() {
    const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
    previewDoc.open();
    previewDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 20px;
                    color: #333;
                }
            </style>
        </head>
        <body>
            <div id="output">Python output will appear here</div>
        </body>
        </html>
    `);
    previewDoc.close();
}

// Load Pyodide
async function loadPyodide() {
    if (pyodide !== null) return pyodide;
    if (pyodideLoading) {
        await new Promise(resolve => {
            const checkInterval = setInterval(() => {
                if (pyodide !== null) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
        return pyodide;
    }

    pyodideLoading = true;
    logToConsole('Loading Python environment (Pyodide)...');

    try {
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
        });

        await pyodide.loadPackagesFromImports('micropip');
        micropip = pyodide.pyimport('micropip');

        // Setup global namespace for interoperability
        pyodide.runPython(`
            import js
            import sys
            from pyodide.ffi import create_proxy, to_js
            from js import document

            class PythonConsole:
                def __init__(self):
                    self.content = ""

                def write(self, text):
                    self.content += str(text)
                    return len(text)

                def flush(self):
                    js.logToConsole(self.content, False)
                    self.content = ""
                    return None

            sys.stdout = PythonConsole()
            sys.stderr = PythonConsole()
        `);

        logToConsole('Python environment loaded successfully!');
        return pyodide;
    } catch (error) {
        logToConsole(`Error loading Pyodide: ${error}`, true);
        pyodideLoading = false;
        throw error;
    }
}

// Run Python code
async function runPythonCode() {
    if (!pyodide) {
        try {
            pyodide = await loadPyodide();
        } catch (error) {
            logToConsole('Failed to load Python environment.', true);
            return;
        }
    }

    const code = codeEditor.value.trim();

    if (!code) {
        logToConsole('No code to run!', true);
        return;
    }

    logToConsole('Running Python code...');

    try {
        // Execute the Python code
        const result = await pyodide.runPythonAsync(code);

        // If there's a return value that's not None, log it
        if (result !== undefined && result !== null) {
            const jsResult = result.toString();
            if (jsResult !== 'undefined' && jsResult !== 'None') {
                logToConsole(`Return value: ${jsResult}`);
            }
        }

        logToConsole('Code execution completed.');
    } catch (error) {
        logToConsole(`Error: ${error.message}`, true);
    }
}

// Log to console with optional error styling
function logToConsole(message, isError = false) {
    const logEntry = document.createElement('div');
    logEntry.textContent = message;
    if (isError) {
        logEntry.classList.add('error');
    }
    consoleOutput.appendChild(logEntry);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Clear console
function clearConsole() {
    consoleOutput.innerHTML = '';
}

// Search PyPI packages
async function searchPackages(query) {
    if (!query.trim()) {
        packageResults.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`https://pypi.org/simple/`);

        if (response.ok) {
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const packageLinks = Array.from(doc.querySelectorAll('a'));

            // Filter packages that match the query
            const filteredPackages = packageLinks
                .map(link => link.textContent)
                .filter(name => name.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 10); // Limit to 10 results

            // Display results
            packageResults.innerHTML = '';

            if (filteredPackages.length === 0) {
                const noResults = document.createElement('div');
                noResults.classList.add('package-item');
                noResults.textContent = 'No packages found';
                packageResults.appendChild(noResults);
            } else {
                filteredPackages.forEach(name => {
                    const packageItem = document.createElement('div');
                    packageItem.classList.add('package-item');
                    packageItem.textContent = name;
                    packageItem.addEventListener('click', () => {
                        packageInput.value = name;
                        packageResults.style.display = 'none';
                    });
                    packageResults.appendChild(packageItem);
                });
            }

            packageResults.style.display = 'block';
        } else {
            logToConsole(`Error searching packages: ${response.statusText}`, true);
            packageResults.style.display = 'none';
        }
    } catch (error) {
        logToConsole(`Error searching packages: ${error.message}`, true);
        packageResults.style.display = 'none';
    }
}

// Install a package
async function installPackage(packageName) {
    if (!packageName.trim()) {
        logToConsole('Please enter a package name', true);
        return;
    }

    if (installedPackages.has(packageName)) {
        logToConsole(`Package '${packageName}' is already installed.`);
        return;
    }

    if (!pyodide) {
        try {
            pyodide = await loadPyodide();
        } catch (error) {
            logToConsole('Failed to load Python environment.', true);
            return;
        }
    }

    logToConsole(`Installing package: ${packageName}...`);

    try {
        await micropip.install(packageName);
        installedPackages.add(packageName);
        logToConsole(`Package '${packageName}' installed successfully.`);
    } catch (error) {
        logToConsole(`Error installing package: ${error.message}`, true);
    }
}

// Event listeners
runButton.addEventListener('click', runPythonCode);
clearConsoleButton.addEventListener('click', clearConsole);

packageInput.addEventListener('input', () => {
    searchPackages(packageInput.value);
});

packageInput.addEventListener('focus', () => {
    if (packageInput.value.trim()) {
        searchPackages(packageInput.value);
    }
});

document.addEventListener('click', (event) => {
    if (!packageResults.contains(event.target) && event.target !== packageInput) {
        packageResults.style.display = 'none';
    }
});

installButton.addEventListener('click', () => {
    installPackage(packageInput.value);
});

// Make logToConsole available to Python
window.logToConsole = logToConsole;

// Load Pyodide on page load to speed up first execution
document.addEventListener('DOMContentLoaded', () => {
    // Delay loading to ensure the page renders first
    setTimeout(() => {
        loadPyodide().catch(error => {
            console.error('Failed to pre-load Pyodide:', error);
        });
    }, 1000);
});
