document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const scriptsContainer = document.getElementById('scripts-container');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    // State variables
    let currentPage = 1;
    let totalPages = 1;
    let currentSearchQuery = '';

    // Initialize
    fetchScripts();

    // Event listeners
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            if (currentSearchQuery) {
                searchScripts(currentSearchQuery, currentPage);
            } else {
                fetchScripts(currentPage);
            }
        }
    });
    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            if (currentSearchQuery) {
                searchScripts(currentSearchQuery, currentPage);
            } else {
                fetchScripts(currentPage);
            }
        }
    });

    // Function to handle search
    function handleSearch() {
        const query = searchInput.value.trim();
        if (query) {
            currentSearchQuery = query;
            currentPage = 1;
            searchScripts(query, currentPage);
        } else {
            currentSearchQuery = '';
            currentPage = 1;
            fetchScripts(currentPage);
        }
    }

    // Function to fetch scripts
    async function fetchScripts(page = 1) {
        showLoading();
        try {
            const proxyUrl = `https://scriptblox-api-proxy.vercel.app/api/fetch?page=${page}`;
            const response = await fetch(proxyUrl);
            const data = await response.json();

            if (data && data.result) {
                displayScripts(data.result.scripts);
                updatePagination(page, data.result.totalPages);
            } else {
                showError('Failed to fetch scripts');
            }
        } catch (error) {
            console.error('Error fetching scripts:', error);
            showError('Error fetching scripts. Please try again later.');
        }
    }

    // Function to search scripts
    async function searchScripts(query, page = 1) {
        showLoading();
        try {
            const proxyUrl = `https://scriptblox-api-proxy.vercel.app/api/search?q=${encodeURIComponent(query)}&mode=free&page=${page}`;
            const response = await fetch(proxyUrl);
            const data = await response.json();

            if (data && data.result) {
                displayScripts(data.result.scripts);
                updatePagination(page, data.result.totalPages);
            } else {
                showError('No scripts found');
            }
        } catch (error) {
            console.error('Error searching scripts:', error);
            showError('Error searching scripts. Please try again later.');
        }
    }

    // Function to display scripts
    function displayScripts(scripts) {
        if (!scripts || scripts.length === 0) {
            scriptsContainer.innerHTML = '<div class="loading">No scripts found</div>';
            return;
        }

        scriptsContainer.innerHTML = '';

        scripts.forEach(script => {
            const scriptCard = document.createElement('div');
            scriptCard.className = 'script-card';

            const scriptType = script.scriptType || 'free';
            const scriptCode = script.script || 'No script code available';

            scriptCard.innerHTML = `
                <h2 class="script-title">${script.title}</h2>
                <div class="script-game">${script.game?.name || 'Universal Script'}</div>
                <div class="script-code">
                    ${scriptCode}
                    <button class="copy-btn" data-script="${escapeHtml(scriptCode)}">Copy</button>
                </div>
                <div class="script-details">
                    <div class="script-views">${formatNumber(script.views || 0)} views</div>
                    <div class="script-type ${scriptType.toLowerCase()}">${scriptType}</div>
                </div>
            `;

            scriptsContainer.appendChild(scriptCard);
        });

        // Add event listeners to copy buttons
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', () => {
                const scriptCode = button.getAttribute('data-script');
                copyToClipboard(scriptCode);
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            });
        });
    }

    // Function to update pagination
    function updatePagination(currentPage, totalPages) {
        this.currentPage = currentPage;
        this.totalPages = totalPages;

        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageButton.disabled = currentPage <= 1;
        nextPageButton.disabled = currentPage >= totalPages;
    }

    // Helper function to show loading state
    function showLoading() {
        scriptsContainer.innerHTML = '<div class="loading">Loading scripts...</div>';
    }

    // Helper function to show error message
    function showError(message) {
        scriptsContainer.innerHTML = `<div class="loading">${message}</div>`;
    }

    // Helper function to format numbers (e.g., 1000 -> 1K)
    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Helper function to escape HTML
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Helper function to copy text to clipboard
    function copyToClipboard(text) {
        // Create a temporary textarea element
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);

        // Select and copy the text
        textarea.select();
        document.execCommand('copy');

        // Clean up
        document.body.removeChild(textarea);
    }
});
