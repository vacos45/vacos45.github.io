// Initialize variables for editor instances
let htmlEditor, cssEditor, jsEditor, pythonEditor;
let pyodideInstance;
let consoleOutput = document.getElementById('console-output');
let isLoading = false;

// Function to log messages to the console
function logToConsole(message, type = 'info') {
    const span = document.createElement('span');
    span.className = `log-${type}`;
    span.textContent = message + '\n';
    consoleOutput.appendChild(span);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Initialize Ace Editor instances
function initializeEditors() {
    // Configure HTML Editor
    htmlEditor = ace.edit("html-editor");
    htmlEditor.setTheme("ace/theme/monokai");
    htmlEditor.session.setMode("ace/mode/html");
    htmlEditor.setValue(`<!DOCTYPE html>
<html>
<head>
    <title>HTML Preview</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>Edit the HTML, CSS, and JavaScript to see changes here.</p>
</body>
</html>`);

    // Configure CSS Editor
    cssEditor = ace.edit("css-editor");
    cssEditor.setTheme("ace/theme/monokai");
    cssEditor.session.setMode("ace/mode/css");
    cssEditor.setValue(`body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f0f0f0;
}

h1 {
    color: navy;
}

p {
    color: #333;
}`);

    // Configure JavaScript Editor
    jsEditor = ace.edit("js-editor");
    jsEditor.setTheme("ace/theme/monokai");
    jsEditor.session.setMode("ace/mode/javascript");
    jsEditor.setValue(`// This JavaScript will run in the preview
document.addEventListener('DOMContentLoaded', function() {
    console.log('JavaScript is running!');

    const heading = document.querySelector('h1');
    if (heading) {
        heading.addEventListener('click', function() {
            this.style.color = this.style.color === 'red' ? 'navy' : 'red';
            console.log('Heading color changed');
        });
    }
});`);

    // Configure Python Editor
    pythonEditor = ace.edit("python-editor");
    pythonEditor.setTheme("ace/theme/monokai");
    pythonEditor.session.setMode("ace/mode/python");
    pythonEditor.setValue(`# Python code example
import sys

def greet(name):
    return f"Hello, {name}!"

# Print to console
print(greet("World"))
print("Python version:", sys.version)

# Create a list and manipulate it
numbers = [1, 2, 3, 4, 5]
squared = [x**2 for x in numbers]
print("Original:", numbers)
print("Squared:", squared)`);
}

// Initialize Pyodide
async function initializePyodide() {
    try {
        logToConsole("Loading Python environment...");
        pyodideInstance = await loadPyodide();
        logToConsole("Python environment loaded successfully!");
    } catch (error) {
        logToConsole(`Error loading Python: ${error.message}`, 'error');
    }
}

// Run HTML/CSS/JS code
function runWebCode() {
    const htmlCode = htmlEditor.getValue();
    const cssCode = cssEditor.getValue();
    const jsCode = jsEditor.getValue();

    const previewFrame = document.getElementById('preview-frame');
    const preview = previewFrame.contentWindow.document;

    // Clear previous console output
    consoleOutput.innerHTML = '';

    // Write the HTML, including the CSS and JS
    preview.open();
    preview.write(`
        ${htmlCode}
        <style>${cssCode}</style>
        <script>
            // Capture console.log output
            (function() {
                const originalLog = console.log;
                const originalError = console.error;
                const originalWarn = console.warn;
                const originalInfo = console.info;

                console.log = function(...args) {
                    originalLog.apply(console, args);
                    window.parent.postMessage({
                        type: 'log',
                        level: 'info',
                        content: args.map(arg => String(arg)).join(' ')
                    }, '*');
                };

                console.error = function(...args) {
                    originalError.apply(console, args);
                    window.parent.postMessage({
                        type: 'log',
                        level: 'error',
                        content: args.map(arg => String(arg)).join(' ')
                    }, '*');
                };

                console.warn = function(...args) {
                    originalWarn.apply(console, args);
                    window.parent.postMessage({
                        type: 'log',
                        level: 'warn',
                        content: args.map(arg => String(arg)).join(' ')
                    }, '*');
                };

                console.info = function(...args) {
                    originalInfo.apply(console, args);
                    window.parent.postMessage({
                        type: 'log',
                        level: 'info',
                        content: args.map(arg => String(arg)).join(' ')
                    }, '*');
                };

                window.onerror = function(message, source, lineno, colno, error) {
                    window.parent.postMessage({
                        type: 'log',
                        level: 'error',
                        content: 'Error: ' + message + ' at line ' + lineno + ':' + colno
                    }, '*');
                    return true;
                };
            })();
        </script>
        <script>${jsCode}</script>
    `);
    preview.close();

    // Switch to preview tab
    document.querySelector('[data-output="preview"]').click();
}

// Run Python code
async function runPythonCode() {
    if (!pyodideInstance) {
        logToConsole("Python environment is not loaded yet. Please wait or reload the page.", 'error');
        return;
    }

    if (isLoading) {
        logToConsole("Please wait, another Python operation is in progress...", 'warn');
        return;
    }

    isLoading = true;
    const pythonCode = pythonEditor.getValue();

    // Clear previous output
    consoleOutput.innerHTML = '';
    logToConsole("Running Python code...");

    try {
        // Redirect Python stdout to our console
        pyodideInstance.runPython(`
            import sys
            from io import StringIO

            class PythonOutput:
                def __init__(self):
                    self.buffer = StringIO()

                def write(self, text):
                    self.buffer.write(text)
                    return len(text)

                def flush(self):
                    pass

            python_output = PythonOutput()
            sys.stdout = python_output
            sys.stderr = python_output
        `);

        // Run the user's Python code
        pyodideInstance.runPython(pythonCode);

        // Get the output
        const output = pyodideInstance.runPython("python_output.buffer.getvalue()");
        if (output) {
            logToConsole(output);
        } else {
            logToConsole("Code executed with no output.");
        }
    } catch (error) {
        logToConsole(`Error: ${error.message}`, 'error');
    } finally {
        isLoading = false;
    }

    // Switch to console tab
    document.querySelector('[data-output="console"]').click();
}

// Tab switching functionality
function setupTabSwitching() {
    // Editor tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const editors = document.querySelectorAll('.editor');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and editors
            tabButtons.forEach(btn => btn.classList.remove('active'));
            editors.forEach(editor => editor.classList.remove('active'));

            // Add active class to clicked button and corresponding editor
            button.classList.add('active');
            const targetTab = button.getAttribute('data-tab');
            document.getElementById(`${targetTab}-editor`).classList.add('active');

            // Refresh the active editor
            if (targetTab === 'html') htmlEditor.resize();
            if (targetTab === 'css') cssEditor.resize();
            if (targetTab === 'js') jsEditor.resize();
            if (targetTab === 'python') pythonEditor.resize();
        });
    });

    // Output tabs
    const outputTabButtons = document.querySelectorAll('.output-tab-btn');
    const outputs = document.querySelectorAll('.output');

    outputTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and outputs
            outputTabButtons.forEach(btn => btn.classList.remove('active'));
            outputs.forEach(output => output.classList.remove('active'));

            // Add active class to clicked button and corresponding output
            button.classList.add('active');
            const targetOutput = button.getAttribute('data-output');
            document.getElementById(targetOutput).classList.add('active');
        });
    });
}

// Handle run button click
function setupRunButton() {
    const runButton = document.getElementById('run-btn');
    const runType = document.getElementById('run-type');

    runButton.addEventListener('click', () => {
        if (runType.value === 'web') {
            runWebCode();
        } else if (runType.value === 'python') {
            runPythonCode();
        }
    });
}

// Handle messages from the iframe
function setupMessageListener() {
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'log') {
            logToConsole(event.data.content, event.data.level);
        }
    });
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize editors
    initializeEditors();

    // Set up tab switching
    setupTabSwitching();

    // Set up run button
    setupRunButton();

    // Set up message listener
    setupMessageListener();

    // Initialize Pyodide
    try {
        await initializePyodide();
    } catch (error) {
        logToConsole(`Failed to initialize Python environment: ${error.message}`, 'error');
    }

    // Run initial web code preview
    runWebCode();
});
