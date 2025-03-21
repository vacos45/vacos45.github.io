// DOM Elements
const codeEditorElement = document.getElementById('code-editor');
const runButton = document.getElementById('run-btn');
const consoleOutput = document.getElementById('console');
const clearConsoleButton = document.getElementById('clear-console-btn');
const packageInput = document.getElementById('package-input');
const installButton = document.getElementById('install-btn');
const packageResults = document.getElementById('package-results');
const previewFrame = document.getElementById('preview');
const saveButton = document.getElementById('save-btn');
const loadButton = document.getElementById('load-btn');
const snippetModal = document.getElementById('snippet-modal');
const closeModal = document.querySelector('.close-modal');
const modalTitle = document.getElementById('modal-title');
const modalSaveSection = document.getElementById('modal-save-section');
const modalLoadSection = document.getElementById('modal-load-section');
const snippetName = document.getElementById('snippet-name');
const snippetDescription = document.getElementById('snippet-description');
const saveSnippetButton = document.getElementById('save-snippet-btn');
const snippetList = document.getElementById('snippet-list');
const templateSelector = document.getElementById('template-selector');
const themeSwitch = document.getElementById('theme-switch');
const themeLabel = document.getElementById('theme-label');
const fileSystemBtn = document.getElementById('file-system-btn');
const fileSystemModal = document.getElementById('file-system-modal');
const browsePackagesBtn = document.getElementById('browse-packages-btn');
const packageBrowserModal = document.getElementById('package-browser-modal');
const collabBtn = document.getElementById('collab-btn');
const sessionIdInput = document.getElementById('session-id-input');
const joinSessionBtn = document.getElementById('join-session-btn');
const collabInfo = document.getElementById('collab-info');
const connectionIndicator = document.getElementById('connection-indicator');
const connectionText = document.getElementById('connection-text');
const fileTree = document.getElementById('file-tree');
const fileNameInput = document.getElementById('file-name');
const newFileBtn = document.getElementById('new-file-btn');
const newFolderBtn = document.getElementById('new-folder-btn');
const saveFileBtn = document.getElementById('save-file-btn');
const deleteFileBtn = document.getElementById('delete-file-btn');
const fileEditorContainer = document.getElementById('file-editor-container');

// Theme settings
let currentTheme = localStorage.getItem('theme') || 'light';
let currentEditorTheme = currentTheme === 'dark' ? 'dracula' : 'eclipse';

// File System
let fileSystem = JSON.parse(localStorage.getItem('pythonFileSystem') || '{"root": {"type": "folder", "children": {}}}');
let currentFilePath = null;
let fileEditor = null;

// Package Browser Categories
const packageCategories = {
    'data-science': [
        { name: 'numpy', description: 'Fundamental package for scientific computing', version: '1.24.3' },
        { name: 'pandas', description: 'Data analysis and manipulation library', version: '2.0.3' },
        { name: 'scipy', description: 'Scientific computation library', version: '1.11.2' },
        { name: 'statsmodels', description: 'Statistical modeling and econometrics', version: '0.14.0' },
        { name: 'scikit-learn', description: 'Machine learning library', version: '1.3.0' }
    ],
    'web-frameworks': [
        { name: 'flask', description: 'Lightweight WSGI web application framework', version: '2.3.3' },
        { name: 'django', description: 'High-level web framework', version: '4.2.4' },
        { name: 'fastapi', description: 'Modern, fast web framework for APIs', version: '0.101.1' },
        { name: 'tornado', description: 'Asynchronous networking library', version: '6.3.3' }
    ],
    'utils': [
        { name: 'requests', description: 'HTTP library for Python', version: '2.31.0' },
        { name: 'pyyaml', description: 'YAML parser and emitter', version: '6.0.1' },
        { name: 'python-dateutil', description: 'Extensions to the standard datetime module', version: '2.8.2' },
        { name: 'pytz', description: 'World timezone definitions', version: '2023.3' },
        { name: 'tqdm', description: 'Fast, extensible progress bar', version: '4.66.1' }
    ],
    'visualization': [
        { name: 'matplotlib', description: 'Plotting library', version: '3.7.2' },
        { name: 'seaborn', description: 'Statistical data visualization', version: '0.12.2' },
        { name: 'plotly', description: 'Interactive visualization library', version: '5.16.1' },
        { name: 'bokeh', description: 'Interactive visualization library for modern web browsers', version: '3.2.2' }
    ],
    'ml': [
        { name: 'tensorflow', description: 'Open source platform for machine learning', version: '2.13.0' },
        { name: 'pytorch', description: 'Deep learning framework', version: '2.0.1' },
        { name: 'xgboost', description: 'Gradient boosting framework', version: '1.7.6' },
        { name: 'lightgbm', description: 'Gradient boosting framework', version: '4.0.0' },
        { name: 'keras', description: 'Deep learning API', version: '2.13.1' }
    ],
    'popular': [
        { name: 'numpy', description: 'Fundamental package for scientific computing', version: '1.24.3' },
        { name: 'pandas', description: 'Data analysis and manipulation library', version: '2.0.3' },
        { name: 'matplotlib', description: 'Plotting library', version: '3.7.2' },
        { name: 'requests', description: 'HTTP library for Python', version: '2.31.0' },
        { name: 'scikit-learn', description: 'Machine learning library', version: '1.3.0' },
        { name: 'tensorflow', description: 'Open source platform for machine learning', version: '2.13.0' },
        { name: 'flask', description: 'Lightweight WSGI web application framework', version: '2.3.3' },
        { name: 'django', description: 'High-level web framework', version: '4.2.4' }
    ]
};

// Collaborative Coding Setup
let socket = null;
let sessionId = null;
let isCollaborating = false;
let userRole = null;
let collaborators = new Set();

// Initialize CodeMirror
const codeEditor = CodeMirror(codeEditorElement, {
    mode: "python",
    theme: currentEditorTheme,
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    smartIndent: true,
    lineWrapping: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    extraKeys: {
        "Tab": function(cm) {
            if (cm.somethingSelected()) {
                cm.indentSelection("add");
            } else {
                cm.replaceSelection("    ", "end", "+input");
            }
        }
    }
});

// Apply saved theme on page load
document.documentElement.setAttribute('data-theme', currentTheme);
themeSwitch.checked = (currentTheme === 'dark');
updateThemeLabel();

// Initialize preview iframe content
initializePreview();

let pyodide = null;
let micropip = null;
let pyodideLoading = false;
let installedPackages = new Set();

// Code templates
const codeTemplates = {
    'hello-world': `# Simple Hello World
print("Hello, World!")

# Using Python's f-strings
name = "Python WebAssembly"
print(f"Hello from {name}!")`,

    'dom-manipulation': `# DOM Manipulation Example
# Access and modify the preview iframe content

# Get the document from the preview iframe
doc = document.getElementById('preview').contentDocument

# Clear the current content
doc.body.innerHTML = ""

# Create some elements
h1 = doc.createElement('h1')
h1.textContent = "Created with Python!"
h1.style.color = "#2d68c4"

p = doc.createElement('p')
p.textContent = "This content was generated using Python code running in WebAssembly."
p.style.marginTop = "20px"

button = doc.createElement('button')
button.textContent = "Click Me!"
button.style.padding = "10px 20px"
button.style.backgroundColor = "#4CAF50"
button.style.color = "white"
button.style.border = "none"
button.style.borderRadius = "4px"
button.style.marginTop = "20px"
button.style.cursor = "pointer"

# Append elements to the document
doc.body.appendChild(h1)
doc.body.appendChild(p)
doc.body.appendChild(button)

print("DOM elements created successfully!")`,

    'numpy-example': `# NumPy Example
# First, install numpy if not already installed
import micropip
try:
    import numpy as np
    print("NumPy is already installed!")
except ImportError:
    print("Installing NumPy...")
    await micropip.install('numpy')
    import numpy as np
    print("NumPy installed successfully!")

# Create arrays
a = np.array([1, 2, 3, 4, 5])
b = np.array([5, 4, 3, 2, 1])

# Operations
print("Array a:", a)
print("Array b:", b)
print("Sum:", a + b)
print("Difference:", a - b)
print("Product:", a * b)
print("Mean of a:", np.mean(a))
print("Standard deviation of a:", np.std(a))

# Create a matrix
matrix = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
print("Matrix:\\n", matrix)
print("Matrix transpose:\\n", matrix.T)
print("Matrix determinant:", np.linalg.det(matrix))

print("NumPy computation completed!")`,

    'matplotlib-example': `# Matplotlib Example
# First, install matplotlib if not already installed
import micropip
import io
import base64
from js import document

try:
    import matplotlib
    import matplotlib.pyplot as plt
    print("Matplotlib is already installed!")
except ImportError:
    print("Installing matplotlib...")
    await micropip.install('matplotlib')
    import matplotlib
    matplotlib.use('module://matplotlib.backends.html5_canvas_backend')
    import matplotlib.pyplot as plt
    print("Matplotlib installed successfully!")

# Create a figure
plt.figure(figsize=(8, 6))

# Create some data
import numpy as np
x = np.linspace(0, 10, 100)
y1 = np.sin(x)
y2 = np.cos(x)

# Plot data
plt.plot(x, y1, 'b-', label='sin(x)')
plt.plot(x, y2, 'r-', label='cos(x)')
plt.grid(True)
plt.legend()
plt.title('Sine and Cosine Functions')
plt.xlabel('x')
plt.ylabel('y')

# Display the plot in the preview
# Save the figure to a BytesIO object
buffer = io.BytesIO()
plt.savefig(buffer, format='png')
buffer.seek(0)

# Convert to base64
img_str = base64.b64encode(buffer.read()).decode('utf-8')

# Get the document from the preview iframe
doc = document.getElementById('preview').contentDocument

# Display the image
doc.body.innerHTML = f'<img src="data:image/png;base64,{img_str}" width="100%">'

print("Plot generated and displayed in the preview!")
`
};

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

// Toggle theme function
function toggleTheme() {
    currentTheme = themeSwitch.checked ? 'dark' : 'light';
    currentEditorTheme = currentTheme === 'dark' ? 'dracula' : 'eclipse';

    document.documentElement.setAttribute('data-theme', currentTheme);
    codeEditor.setOption('theme', currentEditorTheme);

    if (fileEditor) {
        fileEditor.setOption('theme', currentEditorTheme);
    }

    localStorage.setItem('theme', currentTheme);
    updateThemeLabel();
}

// Update theme label
function updateThemeLabel() {
    themeLabel.textContent = currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
}

// File System Functions
function initializeFileSystem() {
    if (!fileEditor) {
        // Initialize file editor
        fileEditor = CodeMirror(fileEditorContainer, {
            mode: "python",
            theme: currentEditorTheme,
            lineNumbers: true,
            indentUnit: 4,
            tabSize: 4,
            indentWithTabs: false,
            smartIndent: true,
            lineWrapping: true,
            matchBrackets: true,
            autoCloseBrackets: true
        });
    }

    renderFileTree();

    // Hide file buttons initially
    deleteFileBtn.style.display = 'none';
    fileNameInput.value = '';
    fileEditor.setValue('');
}

function renderFileTree() {
    fileTree.innerHTML = '';
    renderFolder(fileSystem.root, 'root', fileTree);
}

function renderFolder(folder, path, parentElement) {
    const folderEntries = Object.entries(folder.children);

    // Sort entries - folders first, then files
    folderEntries.sort((a, b) => {
        if (a[1].type === 'folder' && b[1].type !== 'folder') return -1;
        if (a[1].type !== 'folder' && b[1].type === 'folder') return 1;
        return a[0].localeCompare(b[0]);
    });

    folderEntries.forEach(([name, item]) => {
        const itemPath = path === 'root' ? name : `${path}/${name}`;
        const itemElement = document.createElement('div');

        if (item.type === 'folder') {
            itemElement.classList.add('file-tree-item', 'file-folder');
            itemElement.innerHTML = `<span>📁 ${name}</span>`;

            const folderContents = document.createElement('div');
            folderContents.classList.add('folder-contents');

            renderFolder(item, itemPath, folderContents);

            itemElement.addEventListener('click', (e) => {
                e.stopPropagation();
                folderContents.style.display = folderContents.style.display === 'none' ? 'block' : 'none';
            });

            itemElement.appendChild(folderContents);
        } else {
            itemElement.classList.add('file-tree-item', 'file-python');
            itemElement.innerHTML = `<span>📄 ${name}</span>`;

            itemElement.addEventListener('click', (e) => {
                e.stopPropagation();
                openFile(itemPath);
            });
        }

        parentElement.appendChild(itemElement);
    });
}

function createFile(name, content = '', parentPath = 'root') {
    if (!name.trim()) return false;

    // Add .py extension if not provided
    if (!name.endsWith('.py')) {
        name = `${name}.py`;
    }

    const pathParts = parentPath.split('/');
    let current = fileSystem;

    // Navigate to the parent folder
    for (const part of pathParts) {
        if (part === 'root') {
            current = current.root;
        } else {
            if (!current.children[part] || current.children[part].type !== 'folder') {
                return false;
            }
            current = current.children[part];
        }
    }

    // Check if file already exists
    if (current.children[name]) {
        return false;
    }

    // Create the file
    current.children[name] = {
        type: 'file',
        content: content
    };

    // Save to localStorage
    saveFileSystem();

    return true;
}

function createFolder(name, parentPath = 'root') {
    if (!name.trim()) return false;

    const pathParts = parentPath.split('/');
    let current = fileSystem;

    // Navigate to the parent folder
    for (const part of pathParts) {
        if (part === 'root') {
            current = current.root;
        } else {
            if (!current.children[part] || current.children[part].type !== 'folder') {
                return false;
            }
            current = current.children[part];
        }
    }

    // Check if folder already exists
    if (current.children[name]) {
        return false;
    }

    // Create the folder
    current.children[name] = {
        type: 'folder',
        children: {}
    };

    // Save to localStorage
    saveFileSystem();

    return true;
}

function openFile(path) {
    const pathParts = path.split('/');
    const fileName = pathParts.pop();
    const folderPath = pathParts.join('/') || 'root';

    let current = fileSystem;

    // Navigate to the parent folder
    for (const part of pathParts) {
        if (part === 'root') {
            current = current.root;
        } else {
            if (!current.children[part] || current.children[part].type !== 'folder') {
                return false;
            }
            current = current.children[part];
        }
    }

    // Check if file exists
    if (!current.children[fileName] || current.children[fileName].type !== 'file') {
        return false;
    }

    // Set current file path and load content
    currentFilePath = path;
    fileNameInput.value = fileName;
    fileEditor.setValue(current.children[fileName].content);

    // Show delete button
    deleteFileBtn.style.display = 'block';

    // Add active class to selected file
    document.querySelectorAll('.file-tree-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Highlight the selected file
    Array.from(document.querySelectorAll('.file-tree-item')).find(
        item => item.textContent.includes(fileName)
    )?.classList.add('selected');

    return true;
}

function saveFile() {
    if (!fileNameInput.value.trim()) {
        alert('Please enter a file name');
        return;
    }

    const content = fileEditor.getValue();

    if (currentFilePath) {
        // Update existing file
        const pathParts = currentFilePath.split('/');
        const fileName = pathParts.pop();
        let current = fileSystem;

        // Navigate to the parent folder
        for (const part of pathParts) {
            if (part === 'root') {
                current = current.root;
            } else {
                current = current.children[part];
            }
        }

        // If the filename has changed, create a new file and delete the old one
        if (fileName !== fileNameInput.value) {
            // Create new file
            const newName = fileNameInput.value;
            const newFileName = newName.endsWith('.py') ? newName : `${newName}.py`;
            const folderPath = pathParts.join('/') || 'root';

            if (createFile(newFileName, content, folderPath)) {
                // Delete old file
                delete current.children[fileName];
                currentFilePath = folderPath === 'root' ? newFileName : `${folderPath}/${newFileName}`;

                // Save to localStorage
                saveFileSystem();

                // Refresh file tree
                renderFileTree();

                logToConsole(`Renamed file to ${newFileName} and saved`);
            } else {
                alert(`Failed to rename file. File "${newFileName}" may already exist.`);
            }
        } else {
            // Update existing file
            current.children[fileName].content = content;

            // Save to localStorage
            saveFileSystem();

            logToConsole(`File "${fileName}" saved`);
        }
    } else {
        // Create new file
        const name = fileNameInput.value;
        const fileName = name.endsWith('.py') ? name : `${name}.py`;

        if (createFile(fileName, content)) {
            currentFilePath = fileName;

            // Refresh file tree
            renderFileTree();

            logToConsole(`File "${fileName}" created`);
        } else {
            alert(`Failed to create file. File "${fileName}" may already exist.`);
        }
    }
}

function deleteFile() {
    if (!currentFilePath) return;

    if (!confirm('Are you sure you want to delete this file?')) return;

    const pathParts = currentFilePath.split('/');
    const fileName = pathParts.pop();
    let current = fileSystem;

    // Navigate to the parent folder
    for (const part of pathParts) {
        if (part === 'root') {
            current = current.root;
        } else {
            current = current.children[part];
        }
    }

    // Delete the file
    delete current.children[fileName];

    // Save to localStorage
    saveFileSystem();

    // Reset file editor
    currentFilePath = null;
    fileNameInput.value = '';
    fileEditor.setValue('');
    deleteFileBtn.style.display = 'none';

    // Refresh file tree
    renderFileTree();

    logToConsole(`File "${fileName}" deleted`);
}

function createNewFile() {
    currentFilePath = null;
    fileNameInput.value = '';
    fileEditor.setValue('');
    deleteFileBtn.style.display = 'none';

    // Remove selected class from all items
    document.querySelectorAll('.file-tree-item').forEach(item => {
        item.classList.remove('selected');
    });
}

function createNewFolder() {
    const folderName = prompt('Enter folder name:');

    if (!folderName || !folderName.trim()) return;

    if (createFolder(folderName)) {
        renderFileTree();
        logToConsole(`Folder "${folderName}" created`);
    } else {
        alert(`Failed to create folder. Folder "${folderName}" may already exist.`);
    }
}

function saveFileSystem() {
    localStorage.setItem('pythonFileSystem', JSON.stringify(fileSystem));
}

function importFileToMain() {
    if (!currentFilePath) {
        alert('Please open a file first');
        return;
    }

    const content = fileEditor.getValue();
    codeEditor.setValue(content);
    closeFileSystemModal();
    logToConsole(`Imported file "${currentFilePath}" to main editor`);
}

function showFileSystemModal() {
    initializeFileSystem();
    fileSystemModal.style.display = 'block';
}

function closeFileSystemModal() {
    fileSystemModal.style.display = 'none';
}

// Python Module Import System
function setupPythonImports() {
    if (!pyodide) return;

    // Create a virtual filesystem for Python imports
    const pythonFileSystem = {};

    function traverseFileSystem(folder, path) {
        Object.entries(folder.children).forEach(([name, item]) => {
            const itemPath = path ? `${path}/${name}` : name;

            if (item.type === 'file' && name.endsWith('.py')) {
                pythonFileSystem[itemPath] = item.content;
            } else if (item.type === 'folder') {
                traverseFileSystem(item, itemPath);
            }
        });
    }

    traverseFileSystem(fileSystem.root, '');

    // Register custom import handler
    pyodide.runPython(`
        import sys
        import importlib.machinery
        from pathlib import Path

        class CustomImporter:
            @staticmethod
            def find_spec(name, path, target=None):
                # Check if it's a module in our virtual filesystem
                module_path = f"{name.replace('.', '/')}.py"
                if module_path in js.pythonFileSystem:
                    return importlib.machinery.ModuleSpec(
                        name=name,
                        loader=CustomImporter,
                        origin=module_path
                    )
                return None

            @staticmethod
            def create_module(spec):
                return None  # Use default module creation

            @staticmethod
            def exec_module(module):
                module_path = module.__spec__.origin
                code = js.pythonFileSystem[module_path]
                exec(code, module.__dict__)

        # Add the custom importer to sys.meta_path
        sys.meta_path.insert(0, CustomImporter)
    `);

    // Make the filesystem available to Python
    pyodide.globals.set('pythonFileSystem', pythonFileSystem);

    logToConsole('Python module import system initialized');
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
            sys.stderr = PythonConsole();
        `);

        // Setup import system
        setupPythonImports();

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

    const code = codeEditor.getValue().trim();

    if (!code) {
        logToConsole('No code to run!', true);
        return;
    }

    logToConsole('Running Python code...');

    try {
        // Update the Python import system
        setupPythonImports();

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

// Search PyPI packages with version and description
async function searchPackages(query) {
    if (!query.trim()) {
        packageResults.style.display = 'none';
        return;
    }

    try {
        // Using PyPI JSON API for better package info
        const response = await fetch(`https://pypi.org/pypi/${query}/json`);

        if (response.ok) {
            const data = await response.json();
            const packageInfo = {
                name: data.info.name,
                version: data.info.version,
                summary: data.info.summary || "No description available",
                author: data.info.author || "Unknown author",
                homepage: data.info.home_page || ""
            };

            // Display package details
            packageResults.innerHTML = '';

            const packageItem = document.createElement('div');
            packageItem.classList.add('package-item');

            packageItem.innerHTML = `
                <div class="package-item-title">${packageInfo.name} (${packageInfo.version})</div>
                <div class="package-details">
                    <div>${packageInfo.summary}</div>
                    <div>Author: ${packageInfo.author}</div>
                    ${packageInfo.homepage ? `<div>Homepage: <a href="${packageInfo.homepage}" target="_blank">${packageInfo.homepage}</a></div>` : ''}
                </div>
            `;

            packageItem.addEventListener('click', () => {
                packageInput.value = packageInfo.name;
                packageResults.style.display = 'none';
            });

            packageResults.appendChild(packageItem);
            packageResults.style.display = 'block';
        } else if (response.status === 404) {
            // If exact package not found, search for similar packages
            const similarResponse = await fetch(`https://pypi.org/search/?q=${query}&format=json`);

            if (similarResponse.ok) {
                const data = await similarResponse.json();
                const packages = data.results || [];

                packageResults.innerHTML = '';

                if (packages.length === 0) {
                    const noResults = document.createElement('div');
                    noResults.classList.add('package-item');
                    noResults.textContent = 'No packages found';
                    packageResults.appendChild(noResults);
                } else {
                    // Limit to 5 packages for better UX
                    const limitedPackages = packages.slice(0, 5);

                    limitedPackages.forEach(pkg => {
                        const packageItem = document.createElement('div');
                        packageItem.classList.add('package-item');

                        packageItem.innerHTML = `
                            <div class="package-item-title">${pkg.name} (${pkg.version})</div>
                            <div class="package-details">
                                <div>${pkg.summary || "No description available"}</div>
                            </div>
                        `;

                        packageItem.addEventListener('click', () => {
                            packageInput.value = pkg.name;
                            packageResults.style.display = 'none';
                        });

                        packageResults.appendChild(packageItem);
                    });
                }

                packageResults.style.display = 'block';
            } else {
                logToConsole(`Error searching packages: ${similarResponse.statusText}`, true);
                packageResults.style.display = 'none';
            }
        } else {
            logToConsole(`Error searching packages: ${response.statusText}`, true);
            packageResults.style.display = 'none';
        }
    } catch (error) {
        // Fallback to simple search
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
        } catch (fallbackError) {
            logToConsole(`Error searching packages: ${fallbackError.message}`, true);
            packageResults.style.display = 'none';
        }
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

// Save and load snippets functionality
function saveCodeSnippet() {
    const name = snippetName.value.trim();
    if (!name) {
        alert('Please enter a name for your snippet');
        return;
    }

    const code = codeEditor.getValue();
    if (!code) {
        alert('Cannot save an empty code snippet');
        return;
    }

    const description = snippetDescription.value.trim();
    const timestamp = new Date().toISOString();

    // Get existing snippets or initialize empty array
    const snippets = JSON.parse(localStorage.getItem('pyodideSnippets') || '[]');

    // Add new snippet
    snippets.push({
        id: Date.now().toString(),
        name,
        description,
        code,
        timestamp
    });

    // Save to localStorage
    localStorage.setItem('pyodideSnippets', JSON.stringify(snippets));

    // Close modal and reset fields
    closeSnippetModal();
    snippetName.value = '';
    snippetDescription.value = '';

    logToConsole(`Snippet '${name}' saved successfully.`);
}

function loadCodeSnippets() {
    // Get snippets from localStorage
    const snippets = JSON.parse(localStorage.getItem('pyodideSnippets') || '[]');

    // Clear snippet list
    snippetList.innerHTML = '';

    if (snippets.length === 0) {
        const noSnippets = document.createElement('div');
        noSnippets.classList.add('package-item');
        noSnippets.textContent = 'No saved snippets found';
        snippetList.appendChild(noSnippets);
        return;
    }

    // Sort by timestamp, newest first
    snippets.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Populate snippet list
    snippets.forEach(snippet => {
        const snippetItem = document.createElement('div');
        snippetItem.classList.add('snippet-item');

        const formattedDate = new Date(snippet.timestamp).toLocaleString();

        snippetItem.innerHTML = `
            <div class="snippet-item-header">
                <div class="snippet-item-title">${snippet.name}</div>
                <div class="snippet-item-date">${formattedDate}</div>
            </div>
            ${snippet.description ? `<div class="snippet-item-description">${snippet.description}</div>` : ''}
            <div class="snippet-item-actions">
                <button class="load-snippet-btn" data-id="${snippet.id}">Load</button>
                <button class="delete-snippet-btn" data-id="${snippet.id}">Delete</button>
            </div>
        `;

        snippetList.appendChild(snippetItem);
    });

    // Add event listeners for load and delete buttons
    document.querySelectorAll('.load-snippet-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const snippet = snippets.find(s => s.id === id);
            if (snippet) {
                codeEditor.setValue(snippet.code);
                closeSnippetModal();
                logToConsole(`Loaded snippet: ${snippet.name}`);
            }
        });
    });

    document.querySelectorAll('.delete-snippet-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this snippet?')) {
                const filteredSnippets = snippets.filter(s => s.id !== id);
                localStorage.setItem('pyodideSnippets', JSON.stringify(filteredSnippets));
                loadCodeSnippets(); // Refresh the list
                logToConsole('Snippet deleted.');
            }
        });
    });
}

function showSaveModal() {
    modalTitle.textContent = 'Save Code Snippet';
    modalSaveSection.style.display = 'block';
    modalLoadSection.style.display = 'none';
    snippetModal.style.display = 'block';
}

function showLoadModal() {
    modalTitle.textContent = 'Load Code Snippet';
    modalSaveSection.style.display = 'none';
    modalLoadSection.style.display = 'block';
    loadCodeSnippets();
    snippetModal.style.display = 'block';
}

function closeSnippetModal() {
    snippetModal.style.display = 'none';
}

// Handle code templates
function loadCodeTemplate() {
    const templateKey = templateSelector.value;
    if (!templateKey) return;

    const template = codeTemplates[templateKey];
    if (template) {
        codeEditor.setValue(template);
        logToConsole(`Loaded template: ${templateSelector.options[templateSelector.selectedIndex].text}`);
    }

    // Reset selector
    templateSelector.value = '';
}

// Collaborative coding functionality
async function startCollaboration() {
    try {
        // In a real implementation, this would connect to a WebSocket server
        // Here we'll simulate the connection locally
        sessionId = uuidv4();
        isCollaborating = true;
        userRole = 'host';

        updateConnectionStatus('connected');
        collabInfo.style.display = 'block';
        collabInfo.textContent = `Session ID: ${sessionId}`;
        collabBtn.textContent = 'End Collaboration';
        collabBtn.style.backgroundColor = '#ff5252';

        // Initialize collaboration
        setupCodeSyncListeners();

        logToConsole(`Started collaboration session: ${sessionId}`);
    } catch (error) {
        logToConsole(`Failed to start collaboration: ${error.message}`, true);
        updateConnectionStatus('disconnected');
    }
}

async function joinCollaboration() {
    const joinId = sessionIdInput.value.trim();

    if (!joinId) {
        alert('Please enter a session ID');
        return;
    }

    try {
        // In a real implementation, this would validate and connect to the session
        // Here we'll simulate the connection locally
        sessionId = joinId;
        isCollaborating = true;
        userRole = 'guest';

        updateConnectionStatus('connected');
        collabInfo.style.display = 'block';
        collabInfo.textContent = `Joined session: ${sessionId}`;
        collabBtn.textContent = 'Leave Session';
        collabBtn.style.backgroundColor = '#ff5252';

        // Initialize collaboration
        setupCodeSyncListeners();

        logToConsole(`Joined collaboration session: ${sessionId}`);
    } catch (error) {
        logToConsole(`Failed to join session: ${error.message}`, true);
        updateConnectionStatus('disconnected');
    }
}

function endCollaboration() {
    isCollaborating = false;
    sessionId = null;
    userRole = null;

    // Clean up event listeners
    codeEditor.off('changes', handleCodeChanges);

    updateConnectionStatus('disconnected');
    collabInfo.style.display = 'none';
    collabBtn.textContent = 'Start Collaboration';
    collabBtn.style.backgroundColor = '';

    logToConsole('Ended collaboration session');
}

function toggleCollaboration() {
    if (isCollaborating) {
        endCollaboration();
    } else {
        startCollaboration();
    }
}

function updateConnectionStatus(status) {
    connectionIndicator.className = status;

    switch (status) {
        case 'connected':
            connectionText.textContent = 'Connected';
            break;
        case 'disconnected':
            connectionText.textContent = 'Not connected';
            break;
        case 'connecting':
            connectionText.textContent = 'Connecting...';
            break;
    }
}

function setupCodeSyncListeners() {
    // In a real implementation, these changes would be sent to other users
    // Here we'll just log the changes
    codeEditor.on('changes', handleCodeChanges);
}

function handleCodeChanges(instance, changes) {
    if (!isCollaborating) return;

    // In a real implementation, we would send these changes over WebSocket
    // For this demo, we'll just log that changes occurred
    logToConsole('Code changed (changes would be sent to collaborators)');
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

saveButton.addEventListener('click', showSaveModal);
loadButton.addEventListener('click', showLoadModal);
closeModal.addEventListener('click', closeSnippetModal);
saveSnippetButton.addEventListener('click', saveCodeSnippet);

templateSelector.addEventListener('change', loadCodeTemplate);

// Theme toggle
themeSwitch.addEventListener('change', toggleTheme);

// File System
fileSystemBtn.addEventListener('click', showFileSystemModal);
document.querySelectorAll('#file-system-modal .close-modal').forEach(el => {
    el.addEventListener('click', closeFileSystemModal);
});
window.addEventListener('click', (event) => {
    if (event.target === fileSystemModal) {
        closeFileSystemModal();
    }
});
newFileBtn.addEventListener('click', createNewFile);
newFolderBtn.addEventListener('click', createNewFolder);
saveFileBtn.addEventListener('click', saveFile);
deleteFileBtn.addEventListener('click', deleteFile);

// Package Browser
browsePackagesBtn.addEventListener('click', showPackageBrowser);
document.querySelectorAll('#package-browser-modal .close-modal').forEach(el => {
    el.addEventListener('click', closePackageBrowserModal);
});
window.addEventListener('click', (event) => {
    if (event.target === packageBrowserModal) {
        closePackageBrowserModal();
    }
});

// Collaboration
collabBtn.addEventListener('click', toggleCollaboration);
joinSessionBtn.addEventListener('click', joinCollaboration);

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target === snippetModal) {
        closeSnippetModal();
    }
});

// Key shortcuts
document.addEventListener('keydown', (event) => {
    // Ctrl+Enter to run code
    if (event.ctrlKey && event.key === 'Enter') {
        runPythonCode();
        event.preventDefault();
    }

    // Escape to close modals
    if (event.key === 'Escape') {
        if (snippetModal.style.display === 'block') {
            closeSnippetModal();
        }
        if (fileSystemModal.style.display === 'block') {
            closeFileSystemModal();
        }
        if (packageBrowserModal.style.display === 'block') {
            closePackageBrowserModal();
        }
    }
});

// Make logToConsole available to Python
window.logToConsole = logToConsole;

// Set default code on startup
codeEditor.setValue(`# Welcome to Real Python Execution
# This is a Python WebAssembly environment

# Try out some basic Python code:
import sys
print(f"Python version: {sys.version}")
print("Hello, World!")

# Or explore DOM manipulation:
# document.getElementById('preview').contentDocument.body.innerHTML = "<h1>Hello from Python!</h1>"

# Select a template from the dropdown for more examples
`);

// Load Pyodide on page load to speed up first execution
document.addEventListener('DOMContentLoaded', () => {
    // Delay loading to ensure the page renders first
    setTimeout(() => {
        loadPyodide().catch(error => {
            console.error('Failed to pre-load Pyodide:', error);
        });
    }, 1000);
});
