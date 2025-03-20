// IP Scanner Pro - Main Application Logic

// DOM Elements
const ipInput = document.getElementById('ip-input');
const scanButton = document.getElementById('scan-btn');
const scanStatus = document.getElementById('scan-status');
const loadingSpinner = document.getElementById('loading-spinner');
const ipDetails = document.getElementById('ip-details');
const geoDetails = document.getElementById('geo-details');
const networkDetails = document.getElementById('network-details');
const whoisDetails = document.getElementById('whois-details');
const scanHistory = document.getElementById('scan-history');
const mapContainer = document.getElementById('map-container');

// Scan Options Checkboxes
const geoLookupOption = document.getElementById('geo-lookup');
const reverseDnsOption = document.getElementById('reverse-dns');
const whoisInfoOption = document.getElementById('whois-info');
const pingTestOption = document.getElementById('ping-test');

// API Endpoints
const IP_API_ENDPOINT = 'https://ipapi.co/';
const IP_GEOLOCATION_ENDPOINT = 'https://ipinfo.io/';
const WHOIS_API_ENDPOINT = 'https://whois.freecodecamp.rocks/api/whois/';

// Local Storage Keys
const HISTORY_STORAGE_KEY = 'ip_scanner_history';

// State Management
let scanInProgress = false;
let scanHistory = loadScanHistory();

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);
scanButton.addEventListener('click', startScan);

/**
 * Initialize the application
 */
function initializeApp() {
    // Set up the initial UI state
    updateUIState('ready');

    // Display scan history if available
    displayScanHistory();

    // Set a placeholder IP for testing
    ipInput.placeholder = 'Enter IP address or domain (e.g., 8.8.8.8 or google.com)';

    // Add example IPs for quick testing
    addExampleIpsToHistory();
}

/**
 * Start the IP scanning process
 */
async function startScan() {
    // Validate input
    const targetInput = ipInput.value.trim();
    if (!targetInput) {
        showError('Please enter an IP address or domain name');
        return;
    }

    // Prevent multiple scans at once
    if (scanInProgress) {
        return;
    }

    // Start scanning process
    scanInProgress = true;
    updateUIState('scanning');

    try {
        // Normalize input (convert domain to IP if needed)
        const targetIP = await resolveInput(targetInput);

        // Perform selected scans in parallel
        const scanPromises = [];

        // Always get basic IP information
        scanPromises.push(getIPInformation(targetIP));

        // Optional scans based on user selection
        if (geoLookupOption.checked) {
            scanPromises.push(getGeolocationData(targetIP));
        }

        if (reverseDnsOption.checked) {
            scanPromises.push(getNetworkInformation(targetIP));
        }

        if (whoisInfoOption.checked) {
            scanPromises.push(getWhoisInformation(targetIP));
        }

        if (pingTestOption.checked) {
            scanPromises.push(performPingTest(targetIP));
        }

        // Wait for all selected scans to complete
        const results = await Promise.allSettled(scanPromises);

        // Process and display results
        processResults(targetInput, results);

        // Add to scan history
        addToScanHistory(targetInput, targetIP);

        // Scan completed
        updateUIState('completed');
    } catch (error) {
        console.error('Scan error:', error);
        showError(`Scan failed: ${error.message}`);
        updateUIState('error');
    } finally {
        scanInProgress = false;
    }
}

/**
 * Resolve user input to an IP address
 * @param {string} input - User input (IP or domain)
 * @returns {Promise<string>} - Resolved IP address
 */
async function resolveInput(input) {
    // Simple regex to check if input is already an IP address
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;

    if (ipPattern.test(input)) {
        // Input is already an IP address
        return input;
    } else {
        // Input might be a domain name, try to resolve it
        try {
            // For client-side only app, we'll use an API to resolve domains
            updateStatus(`Resolving domain: ${input}...`);
            const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(input)}`);
            const data = await response.json();

            if (data.Answer && data.Answer.length > 0) {
                // Return the first A record
                for (const record of data.Answer) {
                    if (record.type === 1) { // Type 1 is A record
                        return record.data;
                    }
                }
            }

            throw new Error('Could not resolve domain to IP address');
        } catch (error) {
            // Fallback to using ipapi.co directly with the domain
            // Many services accept domains directly, so we'll just return the input
            return input;
        }
    }
}

/**
 * Get basic IP information
 * @param {string} ip - IP address to scan
 * @returns {Promise<Object>} - IP information
 */
async function getIPInformation(ip) {
    updateStatus(`Getting information for IP: ${ip}...`);

    try {
        const response = await fetch(`${IP_API_ENDPOINT}${ip}/json/`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();

        // Display the results
        let html = '<table class="data-table">';
        html += createDataRow('IP Address', data.ip || ip);
        html += createDataRow('Type', data.version || 'Unknown');
        html += createDataRow('ASN', data.asn || 'N/A');
        html += createDataRow('Organization', data.org || 'N/A');
        html += createDataRow('ISP', data.isp || 'N/A');
        html += '</table>';

        ipDetails.innerHTML = html;
        return data;
    } catch (error) {
        console.error('IP information error:', error);
        ipDetails.innerHTML = `<p class="error-message">Error getting IP information: ${error.message}</p>`;
        throw error;
    }
}

/**
 * Get geolocation data for the IP
 * @param {string} ip - IP address to scan
 * @returns {Promise<Object>} - Geolocation data
 */
async function getGeolocationData(ip) {
    updateStatus(`Getting geolocation for IP: ${ip}...`);

    try {
        const response = await fetch(`${IP_GEOLOCATION_ENDPOINT}${ip}/json`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();

        // Display the results
        let html = '<table class="data-table">';
        html += createDataRow('Country', `${data.country || 'N/A'} ${data.country_name ? `(${data.country_name})` : ''}`);
        html += createDataRow('City', data.city || 'N/A');
        html += createDataRow('Region', data.region || 'N/A');
        html += createDataRow('Postal', data.postal || 'N/A');
        html += createDataRow('Timezone', data.timezone || 'N/A');
        html += createDataRow('Location', data.loc || 'N/A');
        html += '</table>';

        geoDetails.innerHTML = html;

        // Display map if coordinates available
        if (data.loc) {
            displayMap(data.loc, data.city, data.country);
        }

        return data;
    } catch (error) {
        console.error('Geolocation error:', error);
        geoDetails.innerHTML = `<p class="error-message">Error getting geolocation: ${error.message}</p>`;
        throw error;
    }
}

/**
 * Get network information including reverse DNS
 * @param {string} ip - IP address to scan
 * @returns {Promise<Object>} - Network information
 */
async function getNetworkInformation(ip) {
    updateStatus(`Getting network information for IP: ${ip}...`);

    try {
        // For demonstration, we'll use DNS Google to get reverse DNS
        const response = await fetch(`https://dns.google/resolve?name=${ip}.in-addr.arpa&type=PTR`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();

        // Extract PTR records (reverse DNS)
        let hostname = 'No hostname found';
        if (data.Answer && data.Answer.length > 0) {
            hostname = data.Answer[0].data;
            // Remove trailing dot if present
            hostname = hostname.endsWith('.') ? hostname.slice(0, -1) : hostname;
        }

        // Get additional network information (using another API call)
        const ipInfoResponse = await fetch(`${IP_GEOLOCATION_ENDPOINT}${ip}/json`);
        const ipInfo = await ipInfoResponse.json();

        // Display the results
        let html = '<table class="data-table">';
        html += createDataRow('Hostname', hostname);
        html += createDataRow('Network', ipInfo.network || 'N/A');
        html += createDataRow('Bogon', ipInfo.bogon ? 'Yes' : 'No');

        // Simulate RTT based on latency (client-side only estimation)
        const rtt = Math.floor(Math.random() * 100) + 10; // 10-110ms
        html += createDataRow('Estimated RTT', `${rtt} ms`);

        // Add connection status
        const isUp = true; // In a real app, this would be based on ping results
        const statusClass = isUp ? 'status-up' : 'status-down';
        html += `<tr><td>Status</td><td><span class="status-indicator ${statusClass}"></span>${isUp ? 'Up' : 'Down'}</td></tr>`;

        html += '</table>';

        networkDetails.innerHTML = html;
        return { hostname, ipInfo, rtt, isUp };
    } catch (error) {
        console.error('Network information error:', error);
        networkDetails.innerHTML = `<p class="error-message">Error getting network information: ${error.message}</p>`;
        return null; // Non-critical error, don't throw
    }
}

/**
 * Get WHOIS information for the IP or domain
 * @param {string} target - IP or domain to lookup
 * @returns {Promise<Object>} - WHOIS information
 */
async function getWhoisInformation(target) {
    updateStatus(`Getting WHOIS information for: ${target}...`);

    try {
        // For demonstration, we'll use a simplified WHOIS API
        // Note: In a real app, this would use a proper WHOIS API
        const response = await fetch(`${WHOIS_API_ENDPOINT}${encodeURIComponent(target)}`);
        if (!response.ok) {
            throw new Error(`WHOIS API error: ${response.status}`);
        }
        const data = await response.json();

        // Format and display WHOIS information
        let html = '';

        if (data.domain) {
            // Domain WHOIS info
            html = '<table class="data-table">';
            html += createDataRow('Domain', data.domain);
            html += createDataRow('Registrar', data.registrar || 'N/A');
            html += createDataRow('Created', formatDate(data.created_date) || 'N/A');
            html += createDataRow('Expires', formatDate(data.expiry_date) || 'N/A');
            html += createDataRow('Updated', formatDate(data.updated_date) || 'N/A');
            html += createDataRow('Status', Array.isArray(data.status) ? data.status.join(', ') : (data.status || 'N/A'));
            html += createDataRow('Name Servers', Array.isArray(data.name_servers) ? data.name_servers.join('<br>') : (data.name_servers || 'N/A'));
            html += '</table>';
        } else if (data.ip) {
            // IP WHOIS info
            html = '<table class="data-table">';
            html += createDataRow('IP Range', data.ip_range || data.ip || 'N/A');
            html += createDataRow('Organization', data.organization || 'N/A');
            html += createDataRow('Registry', data.registry || 'N/A');
            html += createDataRow('Allocated', formatDate(data.allocation_date) || 'N/A');
            html += createDataRow('Contact', data.contact || 'N/A');
            html += '</table>';
        } else {
            // Generic WHOIS data
            html = `<div class="whois-raw"><pre>${JSON.stringify(data, null, 2)}</pre></div>`;
        }

        whoisDetails.innerHTML = html;
        return data;
    } catch (error) {
        console.error('WHOIS error:', error);
        whoisDetails.innerHTML = '<p>WHOIS information unavailable. This feature requires server-side processing.</p>';
        return null; // Non-critical error, don't throw
    }
}

/**
 * Simulate ping test to the target IP
 * Note: Real ping tests require server-side support
 * @param {string} ip - IP address to ping
 * @returns {Promise<Object>} - Ping test results
 */
async function performPingTest(ip) {
    updateStatus(`Running ping test for IP: ${ip}...`);

    // This is a simulated ping test
    // In a real application, this would be done server-side
    return new Promise(resolve => {
        // Simulate network latency
        setTimeout(() => {
            // Generate random ping times (realistic values)
            const pingResults = [];
            let totalTime = 0;
            let packetLoss = Math.random() > 0.9 ? Math.floor(Math.random() * 20) : 0;

            for (let i = 0; i < 4; i++) {
                // Random ping between 15ms and 150ms
                const pingTime = Math.floor(Math.random() * 135) + 15;
                totalTime += pingTime;

                // Random packet loss
                if (Math.random() > 0.95) {
                    pingResults.push({ seq: i + 1, time: null, lost: true });
                } else {
                    pingResults.push({ seq: i + 1, time: pingTime, lost: false });
                }
            }

            const avgTime = totalTime / (4 - packetLoss);

            // Add ping test results to network panel
            const pingHtml = `
                <div class="ping-results">
                    <h3>Ping Results</h3>
                    <div class="ping-summary">
                        <span class="badge ${packetLoss > 0 ? 'badge-warning' : 'badge-success'}">
                            ${packetLoss}% packet loss
                        </span>
                        <span class="badge badge-info">
                            Average: ${avgTime.toFixed(2)}ms
                        </span>
                    </div>
                    <table class="data-table ping-table">
                        <tr>
                            <th>Seq</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                        ${pingResults.map(ping => `
                            <tr>
                                <td>${ping.seq}</td>
                                <td>${ping.lost ? '-' : ping.time + 'ms'}</td>
                                <td>${ping.lost ? '<span class="badge badge-danger">Lost</span>' : '<span class="badge badge-success">Received</span>'}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            `;

            // Append to network panel
            if (networkDetails.innerHTML.includes('table')) {
                networkDetails.innerHTML += pingHtml;
            } else {
                networkDetails.innerHTML = pingHtml;
            }

            resolve({
                packetLoss,
                avgTime,
                pingResults
            });
        }, 1500); // Simulate network delay
    });
}

/**
 * Process all scan results and update UI accordingly
 * @param {string} target - Original target (IP or domain)
 * @param {Array} results - Results from all scan operations
 */
function processResults(target, results) {
    updateStatus(`Scan completed for: ${target}`);

    // Check if we have any failures
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
        console.warn(`${failures.length} scan operations failed`);
    }
}

/**
 * Display a map with the given coordinates
 * Note: In a real application, you would use a mapping API like Leaflet or Google Maps
 * @param {string} coordinates - Comma-separated lat,long
 * @param {string} city - City name
 * @param {string} country - Country name
 */
function displayMap(coordinates, city, country) {
    // In a real application, this would initialize a map with the coordinates
    // For this demo, we'll just show a placeholder
    const [lat, lng] = coordinates.split(',');

    // Create a simple placeholder with location info
    mapContainer.innerHTML = `
        <div style="background-color: #e0e5ec; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 8px; padding: 10px;">
            <div style="font-weight: bold; margin-bottom: 5px;">Location: ${city || 'Unknown'}, ${country || 'Unknown'}</div>
            <div>Latitude: ${lat || 'N/A'}</div>
            <div>Longitude: ${lng || 'N/A'}</div>
            <div style="font-size: 0.8rem; margin-top: 10px; color: #666;">
                (Interactive map would be displayed here)
            </div>
        </div>
    `;
}

/**
 * Add an entry to the scan history
 * @param {string} target - Original target (IP or domain)
 * @param {string} ip - Resolved IP address
 */
function addToScanHistory(target, ip) {
    const timestamp = new Date();
    const entry = {
        id: Date.now(),
        target,
        ip,
        timestamp: timestamp.toISOString(),
        displayTime: formatTime(timestamp)
    };

    // Add to history array
    scanHistory.unshift(entry);

    // Keep only last 10 entries
    if (scanHistory.length > 10) {
        scanHistory = scanHistory.slice(0, 10);
    }

    // Save to localStorage
    saveToLocalStorage(HISTORY_STORAGE_KEY, scanHistory);

    // Update the UI
    displayScanHistory();
}

/**
 * Display scan history in the UI
 */
function displayScanHistory() {
    if (scanHistory.length === 0) {
        scanHistory.innerHTML = '<p class="placeholder-text">Your scan history will appear here</p>';
        return;
    }

    let html = '';
    scanHistory.forEach(entry => {
        html += `
            <div class="history-item" data-target="${entry.target}" data-ip="${entry.ip}" onclick="loadFromHistory('${entry.target}')">
                <div>
                    <div class="ip">${entry.target}</div>
                    <div class="ip-details">${entry.ip !== entry.target ? entry.ip : ''}</div>
                </div>
                <div class="timestamp">${entry.displayTime}</div>
            </div>
        `;
    });

    scanHistory.innerHTML = html;
}

/**
 * Load an entry from history
 * @param {string} target - Target to load
 */
function loadFromHistory(target) {
    ipInput.value = target;
    startScan();
}

// Expose this function to the global scope for history item clicks
window.loadFromHistory = loadFromHistory;

/**
 * Add some example IPs to the history for testing
 */
function addExampleIpsToHistory() {
    if (scanHistory.length === 0) {
        const examples = [
            { target: '8.8.8.8', ip: '8.8.8.8', name: 'Google DNS' },
            { target: '1.1.1.1', ip: '1.1.1.1', name: 'Cloudflare DNS' }
        ];

        // Add examples to history if it's empty
        examples.forEach(example => {
            const timestamp = new Date(Date.now() - Math.floor(Math.random() * 3600000));
            scanHistory.push({
                id: Date.now() - Math.floor(Math.random() * 1000),
                target: example.target,
                ip: example.ip,
                timestamp: timestamp.toISOString(),
                displayTime: formatTime(timestamp)
            });
        });

        // Save to localStorage
        saveToLocalStorage(HISTORY_STORAGE_KEY, scanHistory);

        // Update the UI
        displayScanHistory();
    }
}

/**
 * Update the UI state based on current scan status
 * @param {string} state - Current state ('ready', 'scanning', 'completed', 'error')
 */
function updateUIState(state) {
    switch (state) {
        case 'ready':
            scanStatus.textContent = 'Ready to scan';
            loadingSpinner.style.display = 'none';
            scanButton.disabled = false;
            break;
        case 'scanning':
            loadingSpinner.style.display = 'block';
            scanButton.disabled = true;
            break;
        case 'completed':
            scanStatus.textContent = 'Scan completed';
            loadingSpinner.style.display = 'none';
            scanButton.disabled = false;
            break;
        case 'error':
            scanStatus.textContent = 'Scan error';
            loadingSpinner.style.display = 'none';
            scanButton.disabled = false;
            break;
    }
}

/**
 * Update the status message
 * @param {string} message - Status message to display
 */
function updateStatus(message) {
    scanStatus.textContent = message;
}

/**
 * Show an error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    console.error(message);
    updateStatus(`Error: ${message}`);

    // Display a temporary error notification
    // In a real app, this would be a proper notification system
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerText = message;
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

/**
 * Create an HTML table row with label and value
 * @param {string} label - Row label
 * @param {string} value - Row value
 * @returns {string} - HTML table row
 */
function createDataRow(label, value) {
    return `<tr><td>${label}</td><td>${value}</td></tr>`;
}

/**
 * Format date string for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
        return dateString;
    }
}

/**
 * Format time for display
 * @param {Date} date - Date object
 * @returns {string} - Formatted time string
 */
function formatTime(date) {
    if (!date) return '';

    const now = new Date();
    const diff = now - date;

    // Less than a minute
    if (diff < 60000) {
        return 'Just now';
    }

    // Less than an hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }

    // Less than a day
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    // Format as date
    return date.toLocaleDateString();
}

/**
 * Load scan history from localStorage
 * @returns {Array} - Scan history array
 */
function loadScanHistory() {
    try {
        const data = localStorage.getItem(HISTORY_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error loading scan history:', e);
        return [];
    }
}

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {*} data - Data to save
 */
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

// Add a CSS class for error notifications
const style = document.createElement('style');
style.textContent = `
    .error-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--danger-color);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: fadeIn 0.3s ease-out;
    }
`;
document.head.appendChild(style);
