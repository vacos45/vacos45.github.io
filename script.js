document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const proxyForm = document.getElementById('proxyForm');
    const urlInput = document.getElementById('urlInput');
    const proxyViewer = document.getElementById('proxyViewer');
    const proxyFrame = document.getElementById('proxyFrame');
    const proxyUrl = document.getElementById('proxyUrl');
    const refreshBtn = document.getElementById('refreshBtn');
    const closeBtn = document.getElementById('closeBtn');
    
    // Handle proxy form submission
    if (proxyForm) {
        proxyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const targetUrl = urlInput.value.trim();
            
            if (isValidUrl(targetUrl)) {
                showProxyViewer(targetUrl);
            } else {
                alert('Please enter a valid URL (e.g., https://example.com)');
            }
        });
    }
    
    // Show proxy viewer with the specified URL
    function showProxyViewer(url) {
        proxyUrl.textContent = url;
        proxyViewer.classList.add('active');
        
        // In a real proxy, this would load content through your server
        // For this demo, we're simulating by showing a message
        proxyFrame.srcdoc = `
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        text-align: center;
                        padding: 50px;
                        color: #333;
                    }
                    .message {
                        max-width: 600px;
                        margin: 0 auto;
                        background: #f5f5f5;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
                    }
                    h2 {
                        color: #2a76dd;
                    }
                    .url {
                        font-weight: bold;
                        word-break: break-all;
                        background: #e9e9e9;
                        padding: 5px;
                        border-radius: 3px;
                        margin: 10px 0;
                        display: inline-block;
                    }
                </style>
            </head>
            <body>
                <div class="message">
                    <h2>ProxyHub Demo</h2>
                    <p>In a real proxy implementation, the content from:</p>
                    <p class="url">${url}</p>
                    <p>would be loaded here through the proxy server.</p>
                    <p>This is just a demonstration of how the interface would work.</p>
                </div>
            </body>
            </html>
        `;
        
        // Scroll to the proxy viewer
        proxyViewer.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Refresh the proxy content
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            const currentUrl = proxyUrl.textContent;
            if (currentUrl) {
                showProxyViewer(currentUrl);
            }
        });
    }
    
    // Close the proxy viewer
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            proxyViewer.classList.remove('active');
        });
    }
    
    // Validate URL
    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // Additional functionality for demonstration
    
    // Sample URLs for quick testing
    const sampleUrls = [
        'https://example.com',
        'https://wikipedia.org',
        'https://news.ycombinator.com',
        'https://github.com'
    ];
    
    // Randomly select a sample URL as placeholder
    if (urlInput) {
        const randomUrl = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
        urlInput.setAttribute('placeholder', `Enter URL (e.g., ${randomUrl})`);
    }
});
