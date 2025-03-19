document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const proxyForm = document.getElementById('proxyForm');
    const urlInput = document.getElementById('urlInput');
    const proxyViewer = document.getElementById('proxyViewer');
    const proxyFrame = document.getElementById('proxyFrame');
    const proxyUrl = document.getElementById('proxyUrl');
    const refreshBtn = document.getElementById('refreshBtn');
    const closeBtn = document.getElementById('closeBtn');
    
    // Public CORS proxies that can be used
    const corsProxies = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://cors-anywhere.herokuapp.com/',
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://cors-proxy.htmldriven.com/?url=',
        'https://crossorigin.me/',
        'https://thingproxy.freeboard.io/fetch/',
        'https://yacdn.org/proxy/',
        'https://cors.bridged.cc/',
        'https://crossorigin.root.sx/',
        'https://proxy.cors.sh/',
        'https://corsproxy.github.io/?',
        'https://fastly-cors-anywhere.herokuapp.com/',
        'https://cors.samiprogramming.fi/?url=',
        'https://corsproxy.fly.dev/',
        'https://nine4.workers.dev/?url=',
        'https://bypass.fish/api/v1/proxy?url=',
        'https://bypass.churchless.tech/proxy?url='
    ];
    
    // Default proxy index
    let currentProxyIndex = 0;
    
    // User agent randomization for better bypass
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    ];
    
    // URL encoding modes to try
    const encodingModes = [
        url => encodeURIComponent(url),
        url => btoa(url),
        url => url,
        url => encodeURIComponent(btoa(url))
    ];
    
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
        
        // Load content through the proxy
        loadThroughProxy(url);
        
        // Scroll to the proxy viewer
        proxyViewer.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Load content through proxy
    function loadThroughProxy(url) {
        // Set loading state
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
                    .loader {
                        border: 5px solid #f3f3f3;
                        border-top: 5px solid #3498db;
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        animation: spin 1s linear infinite;
                        margin: 20px auto;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .progress {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #f0f0f0;
                        border-radius: 4px;
                        height: 10px;
                        overflow: hidden;
                    }
                    .progress-bar {
                        height: 100%;
                        background-color: #4caf50;
                        width: 0%;
                        transition: width 0.3s;
                        animation: progress 3s infinite linear;
                    }
                    @keyframes progress {
                        0% { width: 0%; }
                        100% { width: 100%; }
                    }
                </style>
            </head>
            <body>
                <h2>Loading content...</h2>
                <div class="loader"></div>
                <p>Fetching content from: ${url}</p>
                <div class="progress"><div class="progress-bar"></div></div>
                <p><small>Using proxy service ${currentProxyIndex + 1}/${corsProxies.length}</small></p>
            </body>
            </html>
        `;
        
        // Get a random user agent
        const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
        
        // Get encoding mode
        const encodingMode = encodingModes[currentProxyIndex % encodingModes.length];
        
        // Use the current proxy with the selected encoding
        const proxyUrl = corsProxies[currentProxyIndex] + encodingMode(url);
        
        // Fetch options with headers to help bypass filters
        const fetchOptions = {
            headers: {
                'User-Agent': randomUserAgent,
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'text/html,application/xhtml+xml,application/xml',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'DNT': '1'
            },
            cache: 'no-store',
            redirect: 'follow',
            referrerPolicy: 'no-referrer'
        };
        
        // Attempt to fetch content through proxy
        tryFetchWithTimeout(proxyUrl, fetchOptions)
            .then(html => {
                if (!html || html.length === 0) {
                    throw new Error('Empty response received');
                }
                
                // Process the HTML to fix relative URLs
                const processedHtml = processHtml(html, url);
                
                // Create a blob from the HTML with appropriate content type
                const blob = new Blob([processedHtml], { type: 'text/html;charset=utf-8' });
                const blobUrl = URL.createObjectURL(blob);
                
                // Set the blob URL as the iframe src
                proxyFrame.src = blobUrl;
            })
            .catch(error => {
                console.error('Error fetching content:', error);
                
                // Try the next proxy if available
                currentProxyIndex = (currentProxyIndex + 1) % corsProxies.length;
                
                // Auto-retry with the next proxy if we haven't tried all proxies yet
                if (retriesCount < corsProxies.length) {
                    retriesCount++;
                    loadThroughProxy(url);
                    return;
                }
                
                // Show error message if all proxies failed
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
                            .error {
                                background-color: #ffebee;
                                padding: 20px;
                                border-radius: 10px;
                                margin: 20px auto;
                                max-width: 600px;
                            }
                            .error h2 {
                                color: #c62828;
                            }
                            .retry-btn {
                                background-color: #2a76dd;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 5px;
                                cursor: pointer;
                                margin-top: 20px;
                            }
                            .options {
                                display: flex;
                                justify-content: center;
                                gap: 10px;
                                margin-top: 20px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="error">
                            <h2>Error Loading Content</h2>
                            <p>Unable to load the requested URL through our proxies.</p>
                            <p>Error: ${error.message}</p>
                            <p>We've tried multiple proxy services without success.</p>
                            <div class="options">
                                <button class="retry-btn" onclick="window.parent.document.getElementById('refreshBtn').click()">
                                    Try Again
                                </button>
                                <button class="retry-btn" style="background-color: #4caf50;" onclick="window.parent.retryWithAltMethod('${url}')">
                                    Try Alternative Method
                                </button>
                            </div>
                        </div>
                    </body>
                    </html>
                `;
            });
    }
    
    // Global retries count
    let retriesCount = 0;
    
    // Alternative method function exposed to window for iframe access
    window.retryWithAltMethod = function(url) {
        retriesCount = 0;
        // Reset proxy index to try different approach
        currentProxyIndex = Math.floor(Math.random() * corsProxies.length);
        loadThroughProxyAlt(url);
    };
    
    // Alternative fetch approach with timeout
    function tryFetchWithTimeout(url, options, timeout = 10000) {
        return new Promise((resolve, reject) => {
            // Set timeout
            const timeoutId = setTimeout(() => {
                reject(new Error('Request timed out'));
            }, timeout);
            
            fetch(url, options)
                .then(response => {
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(resolve)
                .catch(reject);
        });
    }
    
    // Alternative proxy approach using data URI
    function loadThroughProxyAlt(url) {
        // Show loading state
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
                    .loader {
                        border: 5px solid #f3f3f3;
                        border-top: 5px solid #3498db;
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        animation: spin 1s linear infinite;
                        margin: 20px auto;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </head>
            <body>
                <h2>Loading content (alternative method)...</h2>
                <div class="loader"></div>
                <p>Using alternative bypass technique for: ${url}</p>
            </body>
            </html>
        `;
        
        // Use jsonp approach for alternative method
        const script = document.createElement('script');
        const callbackName = 'proxyCallback' + Math.floor(Math.random() * 1000000);
        
        // Different approach using another set of proxies
        const altProxies = [
            `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&callback=${callbackName}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
            `https://cors-proxy.htmldriven.com/?url=${encodeURIComponent(url)}`
        ];
        
        const selectedAltProxy = altProxies[Math.floor(Math.random() * altProxies.length)];
        script.src = selectedAltProxy;
        
        // Define callback function
        window[callbackName] = function(data) {
            // Clean up
            document.body.removeChild(script);
            delete window[callbackName];
            
            try {
                // Extract content from proxy response
                let html = '';
                if (data.contents) {
                    html = data.contents;
                } else if (data.response) {
                    html = data.response;
                } else {
                    html = JSON.stringify(data);
                }
                
                // Process HTML
                const processedHtml = processHtml(html, url);
                
                // Create blob and load in iframe
                const blob = new Blob([processedHtml], { type: 'text/html;charset=utf-8' });
                const blobUrl = URL.createObjectURL(blob);
                proxyFrame.src = blobUrl;
            } catch (error) {
                console.error('Error processing alternative proxy data:', error);
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
                            .error {
                                background-color: #ffebee;
                                padding: 20px;
                                border-radius: 10px;
                                margin: 20px auto;
                                max-width: 600px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="error">
                            <h2>All Proxy Methods Failed</h2>
                            <p>We were unable to bypass the restrictions for this website.</p>
                            <p>Please try a different website or try again later.</p>
                        </div>
                    </body>
                    </html>
                `;
            }
        };
        
        // Handle errors with the script
        script.onerror = function() {
            document.body.removeChild(script);
            delete window[callbackName];
            
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
                        .error {
                            background-color: #ffebee;
                            padding: 20px;
                            border-radius: 10px;
                            margin: 20px auto;
                            max-width: 600px;
                        }
                    </style>
                </head>
                <body>
                    <div class="error">
                        <h2>Alternative Method Failed</h2>
                        <p>We were unable to bypass the restrictions using alternative methods.</p>
                        <p>This website may be heavily protected or the content might not be accessible.</p>
                    </div>
                </body>
                </html>
            `;
        };
        
        // Add to document to start the request
        document.body.appendChild(script);
    }
    }
    
    // Process HTML to fix relative URLs and enhance proxy bypassing
    function processHtml(html, baseUrl) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const base = new URL(baseUrl);
        
        // Fix relative URLs in various elements
        fixRelativeUrls(doc, 'a', 'href', base);
        fixRelativeUrls(doc, 'img', 'src', base);
        fixRelativeUrls(doc, 'link', 'href', base);
        fixRelativeUrls(doc, 'script', 'src', base);
        fixRelativeUrls(doc, 'form', 'action', base);
        fixRelativeUrls(doc, 'iframe', 'src', base);
        fixRelativeUrls(doc, 'source', 'src', base);
        fixRelativeUrls(doc, 'video', 'src', base);
        fixRelativeUrls(doc, 'audio', 'src', base);
        fixRelativeUrls(doc, 'embed', 'src', base);
        fixRelativeUrls(doc, 'object', 'data', base);
        fixRelativeUrls(doc, 'track', 'src', base);
        
        // Fix CSS background images
        const styleElements = doc.querySelectorAll('style');
        styleElements.forEach(styleElement => {
            if (styleElement.textContent) {
                styleElement.textContent = fixCssUrls(styleElement.textContent, base);
            }
        });
        
        // Fix inline styles with background images
        const elementsWithStyle = doc.querySelectorAll('[style*="url("]');
        elementsWithStyle.forEach(element => {
            const style = element.getAttribute('style');
            if (style) {
                element.setAttribute('style', fixCssUrls(style, base));
            }
        });
        
        // Add base tag if not present
        if (!doc.querySelector('base')) {
            const baseTag = doc.createElement('base');
            baseTag.href = baseUrl;
            if (doc.head) {
                doc.head.insertBefore(baseTag, doc.head.firstChild);
            } else {
                // Create head if not present
                const head = doc.createElement('head');
                head.appendChild(baseTag);
                doc.documentElement.insertBefore(head, doc.documentElement.firstChild);
            }
        }
        
        // Remove Content-Security-Policy meta tags to prevent blocking
        const cspMetaTags = doc.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
        cspMetaTags.forEach(tag => tag.remove());
        
        // Remove X-Frame-Options meta tags to prevent frame blocking
        const xfoMetaTags = doc.querySelectorAll('meta[http-equiv="X-Frame-Options"]');
        xfoMetaTags.forEach(tag => tag.remove());
        
        // Fix form submissions
        const forms = doc.querySelectorAll('form');
        forms.forEach(form => {
            form.setAttribute('target', '_blank');
            
            // Add our own event listener via script for forms
            const formId = 'proxy_form_' + Math.random().toString(36).substring(2, 9);
            form.setAttribute('id', formId);
        });
        
        // Add proxy script for handling clicks and form submissions
        const proxyScript = doc.createElement('script');
        proxyScript.textContent = `
            // Handle link clicks
            document.addEventListener('click', function(e) {
                const link = e.target.closest('a');
                if (link) {
                    const href = link.getAttribute('href');
                    if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                            let fullUrl = href;
                            if (!href.match(/^https?:\\/\\//)) {
                                const base = document.querySelector('base');
                                const baseHref = base ? base.href : '${baseUrl}';
                                fullUrl = new URL(href, baseHref).href;
                            }
                            window.parent.postMessage({ type: 'navigate', url: fullUrl }, '*');
                        } catch (err) {
                            console.error('Error processing link click:', err);
                        }
                        return false;
                    }
                }
            }, true);
            
            // Handle form submissions
            document.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const form = e.target;
                const action = form.action || '${baseUrl}';
                const method = form.method || 'get';
                
                const formData = new FormData(form);
                const data = {};
                for (let [key, value] of formData.entries()) {
                    data[key] = value;
                }
                
                // Send message to parent
                window.parent.postMessage({
                    type: 'formSubmit',
                    url: action,
                    method: method,
                    data: JSON.stringify(data)
                }, '*');
                
                return false;
            }, true);
            
            // Fix AJAX requests
            const originalXHROpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
                let newUrl = url;
                if (!url.match(/^https?:\\/\\//)) {
                    const base = document.querySelector('base');
                    const baseHref = base ? base.href : '${baseUrl}';
                    newUrl = new URL(url, baseHref).href;
                }
                originalXHROpen.call(this, method, newUrl, async, user, password);
            };
            
            // Notify parent when loaded
            window.addEventListener('DOMContentLoaded', function() {
                window.parent.postMessage({ type: 'pageLoaded', title: document.title }, '*');
            });
        `;
        
        // Append script to body or create body if it doesn't exist
        if (doc.body) {
            doc.body.appendChild(proxyScript);
        } else {
            const body = doc.createElement('body');
            body.appendChild(proxyScript);
            doc.documentElement.appendChild(body);
        }
        
        // Add additional meta tags for responsiveness
        const viewport = doc.createElement('meta');
        viewport.setAttribute('name', 'viewport');
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        if (doc.head) {
            doc.head.appendChild(viewport);
        }
        
        // Add proxy style overrides to handle common issues
        const styleOverrides = doc.createElement('style');
        styleOverrides.textContent = `
            /* Fix for X-Frame-Options: DENY workarounds */
            html, body { display: block !important; visibility: visible !important; }
            /* Fix for potential frame-busting scripts */
            html { height: 100% !important; }
            /* Ensure content is visible */
            body { opacity: 1 !important; display: block !important; }
        `;
        if (doc.head) {
            doc.head.appendChild(styleOverrides);
        }
        
        return new XMLSerializer().serializeToString(doc);
    }
    
    // Fix CSS URLs (background images, etc.)
    function fixCssUrls(css, baseUrl) {
        return css.replace(/url\(['"]?([^'")]+)['"]?\)/g, (match, url) => {
            // Skip data URLs
            if (url.startsWith('data:')) {
                return match;
            }
            
            try {
                const absoluteUrl = new URL(url, baseUrl).href;
                return `url("${absoluteUrl}")`;
            } catch (e) {
                return match;
            }
        });
    }
    
    // Fix relative URLs in elements
    function fixRelativeUrls(doc, selector, attribute, base) {
        const elements = doc.querySelectorAll(selector);
        elements.forEach(element => {
            const value = element.getAttribute(attribute);
            if (value && !value.startsWith('data:') && !value.startsWith('javascript:') && !value.match(/^https?:\/\//)) {
                try {
                    const absoluteUrl = new URL(value, base).href;
                    element.setAttribute(attribute, absoluteUrl);
                } catch (e) {
                    console.error(`Failed to fix URL: ${value}`, e);
                }
            }
        });
    }
    
    // Handle messages from the iframe
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'navigate') {
            const url = event.data.url;
            if (isValidUrl(url)) {
                showProxyViewer(url);
            }
        }
    });
    
    // Refresh the proxy content
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            const currentUrl = proxyUrl.textContent;
            if (currentUrl) {
                // Try the next proxy
                currentProxyIndex = (currentProxyIndex + 1) % corsProxies.length;
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
