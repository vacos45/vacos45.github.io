// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get references to all editor elements
    const htmlEditor = document.getElementById('htmlEditor');
    const cssEditor = document.getElementById('cssEditor');
    const jsEditor = document.getElementById('jsEditor');
    const pythonEditor = document.getElementById('pythonEditor');
    const outputFrame = document.getElementById('outputFrame');
    const consoleOutput = document.getElementById('consoleOutput');
    const runBtn = document.getElementById('runBtn');
    const clearBtn = document.getElementById('clearBtn');

    // Load saved code from localStorage if available
    loadFromLocalStorage();

    // Run button click handler
    runBtn.addEventListener('click', runCode);

    // Clear button click handler
    clearBtn.addEventListener('click', clearAll);

    // Keyboard shortcut (Ctrl+Enter) to run code
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            runCode();
            e.preventDefault();
        }
    });

    // Tab key behavior in textareas (insert tab instead of changing focus)
    const editors = [htmlEditor, cssEditor, jsEditor, pythonEditor];
    editors.forEach(editor => {
        editor.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();

                // Insert a tab at cursor position
                const start = this.selectionStart;
                const end = this.selectionEnd;

                this.value = this.value.substring(0, start) +
                            '    ' + // 4 spaces for a tab
                            this.value.substring(end);

                // Move cursor after the inserted tab
                this.selectionStart = this.selectionEnd = start + 4;
            }
        });

        // Save to localStorage when editor content changes
        editor.addEventListener('input', saveToLocalStorage);
    });

    // Function to run all code
    function runCode() {
        // Clear previous console output but keep a history marker
        const historyMarker = document.createElement('div');
        historyMarker.className = 'console-history-marker';
        historyMarker.textContent = '--- New Execution ---';
        consoleOutput.appendChild(historyMarker);

        // Get code from editors
        const htmlCode = htmlEditor.value;
        const cssCode = cssEditor.value;
        const jsCode = jsEditor.value;
        const pythonCode = pythonEditor.value;

        // Create content for the iframe
        const iframeContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    ${cssCode}
                </style>
                <script src="https://cdn.jsdelivr.net/npm/brython@3.11.0/brython.min.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/brython@3.11.0/brython_stdlib.js"></script>
            </head>
            <body onload="brython()">
                ${htmlCode}

                <script type="text/python">
                ${pythonCode}
                </script>

                <script>
                // Custom console log to capture JavaScript console output
                (function() {
                    const originalConsole = {
                        log: console.log,
                        error: console.error,
                        warn: console.warn,
                        info: console.info
                    };

                    // Redirect console methods to parent
                    console.log = function() {
                        originalConsole.log.apply(console, arguments);
                        sendToConsole('log', arguments);
                    };

                    console.error = function() {
                        originalConsole.error.apply(console, arguments);
                        sendToConsole('error', arguments);
                    };

                    console.warn = function() {
                        originalConsole.warn.apply(console, arguments);
                        sendToConsole('warn', arguments);
                    };

                    console.info = function() {
                        originalConsole.info.apply(console, arguments);
                        sendToConsole('info', arguments);
                    };

                    function sendToConsole(method, args) {
                        const message = Array.from(args).map(arg =>
                            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                        ).join(' ');

                        window.parent.postMessage({
                            type: 'console',
                            method: method,
                            message: message
                        }, '*');
                    }

                    // Catch and report errors
                    window.addEventListener('error', function(e) {
                        sendToConsole('error', [`JavaScript Error: ${e.message} at line ${e.lineno}`]);
                        return false;
                    });
                })();

                // Execute JavaScript code
                try {
                    ${jsCode}
                } catch(error) {
                    console.error('JavaScript Error:', error.message);
                }
                </script>
            </body>
            </html>
        `;

        // Write to the iframe
        const iframe = outputFrame;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(iframeContent);
        iframeDoc.close();

        // Save code to localStorage
        saveToLocalStorage();
    }

    // Function to clear all editors and output
    function clearAll() {
        if (confirm('Are you sure you want to clear all code and console output?')) {
            htmlEditor.value = '';
            cssEditor.value = '';
            jsEditor.value = '';
            pythonEditor.value = '';
            consoleOutput.innerHTML = '';

            // Clear the iframe
            const iframe = outputFrame;
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write('');
            iframeDoc.close();

            // Clear localStorage
            localStorage.removeItem('codeEditorHTML');
            localStorage.removeItem('codeEditorCSS');
            localStorage.removeItem('codeEditorJS');
            localStorage.removeItem('codeEditorPython');
        }
    }

    // Function to save editor content to localStorage
    function saveToLocalStorage() {
        localStorage.setItem('codeEditorHTML', htmlEditor.value);
        localStorage.setItem('codeEditorCSS', cssEditor.value);
        localStorage.setItem('codeEditorJS', jsEditor.value);
        localStorage.setItem('codeEditorPython', pythonEditor.value);
    }

    // Function to load editor content from localStorage
    function loadFromLocalStorage() {
        htmlEditor.value = localStorage.getItem('codeEditorHTML') || '';
        cssEditor.value = localStorage.getItem('codeEditorCSS') || '';
        jsEditor.value = localStorage.getItem('codeEditorJS') || '';
        pythonEditor.value = localStorage.getItem('codeEditorPython') || '';
    }

    // Listen for console messages from the iframe
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'console') {
            const pre = document.createElement('pre');
            pre.classList.add('js-output');

            if (event.data.method === 'error') {
                pre.classList.add('error');
            }

            pre.textContent = event.data.message;
            consoleOutput.appendChild(pre);

            // Scroll console to bottom
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
        }
    });

    // Set some initial sample code if editors are empty
    if (!htmlEditor.value && !cssEditor.value && !jsEditor.value && !pythonEditor.value) {
        htmlEditor.value = '<div id="output">Hello World!</div>';
        cssEditor.value = '#output {\n    color: blue;\n    font-size: 24px;\n    text-align: center;\n    margin-top: 50px;\n}';
        jsEditor.value = 'console.log("JavaScript is running!");\n\n// You can modify the DOM\ndocument.getElementById("output").innerHTML += "<br>Modified by JavaScript";';
        pythonEditor.value = 'from browser import document, html\n\n# Python can also modify the DOM\ndocument["output"] <= html.BR() + "Modified by Python"\n\nprint("Python is running!")';

        // Save this initial code to localStorage
        saveToLocalStorage();
    }

    // Run the code on initial load
    runCode();
});
