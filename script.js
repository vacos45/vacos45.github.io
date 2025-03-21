// script.js
let pyodide;
const installedPackages = new Set();

async function initializePyodide() {
    pyodide = await loadPyodide();
    await pyodide.loadPackage("micropip");
    pyodide.setStdout({ batched: (text) => appendToConsole(text) });
    pyodide.setStderr({ batched: (text) => appendToConsole(text, 'error') });
    
    // Expose DOM API to Python
    pyodide.runPython(`
        from js import document, console
        import sys
        sys.stdout = sys.stderr = open('/dev/stdout', 'w')
    `);
}

async function runCode() {
    const code = document.getElementById('python-code').value;
    const previewFrame = document.getElementById('preview');
    
    try {
        // Execute in preview iframe
        previewFrame.srcdoc = '<html><body></body></html>';
        await new Promise(resolve => previewFrame.onload = resolve);
        
        // Run Python code with DOM access
        await pyodide.runPythonAsync(`
            from js import preview
            __import__('sys').modules['browser'] = preview.contentWindow
            ${code}
        `);
    } catch (err) {
        appendToConsole(err.toString(), 'error');
    }
}

function togglePackageManager() {
    const pm = document.getElementById('package-manager');
    pm.style.display = pm.style.display === 'none' ? 'block' : 'none';
}

async function installPackage(pkg) {
    try {
        await pyodide.runPythonAsync(`
            import micropip
            await micropip.install('${pkg}')
        `);
        installedPackages.add(pkg);
        appendToConsole(`Installed ${pkg}`);
    } catch (err) {
        appendToConsole(`Failed to install ${pkg}: ${err}`, 'error');
    }
}

function appendToConsole(text, type = 'log') {
    const div = document.createElement('div');
    div.className = type;
    div.textContent = text;
    document.getElementById('console-content').appendChild(div);
}

// Initialize on load
window.addEventListener('load', async () => {
    await initializePyodide();
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') runCode();
    });
});
