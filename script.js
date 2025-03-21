/**
 * Create a module card element
 * @param {Object} module - Module data
 * @returns {HTMLElement} Module card element
 */
function createModuleCard(module) {
    const card = document.createElement('div');
    card.className = 'module-card';

    if (module.completed) {
        card.classList.add('completed');
    }

    if (module.locked) {
        card.classList.add('locked');
    }

    // Create card header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'module-header';

    const moduleNumber = document.createElement('div');
    moduleNumber.className = 'module-number';
    moduleNumber.textContent = module.moduleNumber;

    const moduleTitle = document.createElement('h3');
    moduleTitle.className = 'module-title';
    moduleTitle.textContent = module.title;

    cardHeader.appendChild(moduleNumber);
    cardHeader.appendChild(moduleTitle);

    // Create card content
    const cardContent = document.createElement('div');
    cardContent.className = 'module-content';

    const description = document.createElement('p');
    description.className = 'module-description';
    description.textContent = module.description;

    // Create topics preview if available
    let topicsPreview = '';
    if (module.topics && module.topics.length > 0) {
        const topicsToShow = module.topics.slice(0, 3);
        topicsPreview = `
            <div class="module-topics">
                <h4>Topics</h4>
                <ul>
                    ${topicsToShow.map(topic => `<li>${topic}</li>`).join('')}
                    ${module.topics.length > 3 ? `<li class="more">+${module.topics.length - 3} more topics</li>` : ''}
                </ul>
            </div>
        `;
    }

    // Create module meta information
    const meta = document.createElement('div');
    meta.className = 'module-meta';

    meta.innerHTML = `
        <div class="module-meta-item">
            <span>${module.lessonCount} Lessons</span>
        </div>
        <div class="module-meta-item">
            <span>${module.estimatedTime}</span>
        </div>
    `;

    // Assemble card content
    cardContent.appendChild(description);

    if (topicsPreview) {
        const topicsElement = document.createElement('div');
        topicsElement.innerHTML = topicsPreview;
        cardContent.appendChild(topicsElement.firstElementChild);
    }

    cardContent.appendChild(meta);

    // Assemble full card
    card.appendChild(cardHeader);
    card.appendChild(cardContent);

    // Add click event to view module
    card.addEventListener('click', () => {
        if (!module.locked) {
            viewModule(module.id);
        }
    });

    return card;
}

/**
 * Process commands for basic reconnaissance lab
 * @param {string} command - Full command
 * @param {Array} parts - Command parts
 * @param {string} mainCommand - Main command
 * @returns {string} Command output
 */
function processBasicReconLab(command, parts, mainCommand) {
    // Maintain state between commands
    if (!APP_STATE.terminal.labState) {
        APP_STATE.terminal.labState = {
            basicRecon: {
                dbInitialized: false,
                scannedHosts: [],
                currentWorkspace: 'default',
                discoveredServices: {},
                msfConsoleActive: false,
                msfPrompt: 'msf6 > '
            }
        };
    }

    const labState = APP_STATE.terminal.labState.basicRecon;

    if (labState.msfConsoleActive) {
        return processMsfConsoleCommand(command, parts, mainCommand, labState);
    }

    switch (mainCommand) {
        case 'msfconsole':
            labState.msfConsoleActive = true;
            return `
<span class="highlight">                                                  </span>
<span class="highlight">      .:okOOOkl:.                                </span>
<span class="highlight">    .xNMMMMMMMMMWO:                              </span>
<span class="highlight">   :NMMMMMMMMMMMMMMd:                            </span>
<span class="highlight">  :XMMMMMMMMMMMMMMMMk:                           </span>
<span class="highlight">  lMMMMMMMMMMMMMMMMMM0:                          </span>
<span class="highlight">  :XMMMMMMMMMMMMMMMMMWk.                         </span>
<span class="highlight">   :XMMMMMMMMMMMMMMMMMMo                         </span>
<span class="highlight">    .lOKKKKKKKKKKKKKKKK0l.                       </span>
<span class="highlight">                                                  </span>

       =[ metasploit v6.3.4-dev                          ]
+ -- --=[ 2275 exploits - 1192 auxiliary - 398 post       ]
+ -- --=[ 951 payloads - 45 encoders - 11 nops            ]
+ -- --=[ 9 evasion                                       ]

Metasploit tip: View all productivity tips with the tips command

${labState.dbInitialized ?
    '[*] Connected to msf. Connection type: postgresql.' :
    '[*] No database connected. Run db_connect to connect to a database'}

${labState.msfPrompt}`;

        case 'msfdb':
            if (parts[1] === 'init') {
                labState.dbInitialized = true;
                return `
[+] Starting database
[+] Creating database user 'msf'
[+] Creating databases 'msf'
[+] Creating databases 'msf_test'
[+] Creating configuration file '/usr/share/metasploit-framework/config/database.yml'
[+] Creating initial database schema

[*] PostgreSQL database started and configured successfully
[*] To connect to the database at a later time, use db_connect
`;
            }
            return `
Usage: msfdb [options]
  options:
    init     Initialize the database
    reinit   Delete and reinitialize the database
    delete   Delete database and stop using it
    start    Start the database
    stop     Stop the database
    status   Check service status
    help     Show this help
`;

        case 'nmap':
            if (parts.length === 1) {
                return `
Nmap 7.93 ( https://nmap.org )
Usage: nmap [Scan Type(s)] [Options] {target specification}
`;
            }

            // Simple target extraction - in real app, would be more robust
            const targetMatch = command.match(/\b(?:\d{1,3}\.){3}\d{1,3}(?:\/\d{1,2})?\b/);
            const target = targetMatch ? targetMatch[0] : 'unknown';

            if (target === '192.168.1.10') {
                // Record the host as scanned
                if (!labState.scannedHosts.includes(target)) {
                    labState.scannedHosts.push(target);

                    // Record discovered services
                    labState.discoveredServices[target] = {
                        '21': { port: 21, service: 'ftp', version: 'vsftpd 3.0.3' },
                        '22': { port: 22, service: 'ssh', version: 'OpenSSH 7.9p1' },
                        '80': { port: 80, service: 'http', version: 'Apache httpd 2.4.38' }
                    };
                }

                return `
Starting Nmap 7.93 ( https://nmap.org ) at ${new Date().toLocaleString()}
Nmap scan report for 192.168.1.10
Host is up (0.0054s latency).
Not shown: 997 closed tcp ports (reset)
PORT   STATE SERVICE
21/tcp open  ftp
22/tcp open  ssh
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 2.41 seconds
`;
            } else if (target === '192.168.1.20') {
                // Record the host as scanned
                if (!labState.scannedHosts.includes(target)) {
                    labState.scannedHosts.push(target);

                    // Record discovered services
                    labState.discoveredServices[target] = {
                        '139': { port: 139, service: 'netbios-ssn', version: 'Microsoft Windows netbios-ssn' },
                        '445': { port: 445, service: 'microsoft-ds', version: 'Microsoft Windows 7 - 10 microsoft-ds' },
                        '3389': { port: 3389, service: 'ms-wbt-server', version: 'Microsoft Terminal Services' }
                    };
                }

                return `
Starting Nmap 7.93 ( https://nmap.org ) at ${new Date().toLocaleString()}
Nmap scan report for 192.168.1.20
Host is up (0.0067s latency).
Not shown: 997 closed tcp ports (reset)
PORT     STATE SERVICE
139/tcp  open  netbios-ssn
445/tcp  open  microsoft-ds
3389/tcp open  ms-wbt-server

Nmap done: 1 IP address (1 host up) scanned in 2.67 seconds
`;
            } else if (target === '192.168.1.30') {
                // Record the host as scanned
                if (!labState.scannedHosts.includes(target)) {
                    labState.scannedHosts.push(target);

                    // Record discovered services
                    labState.discoveredServices[target] = {
                        '22': { port: 22, service: 'ssh', version: 'OpenSSH 8.2p1' },
                        '5432': { port: 5432, service: 'postgresql', version: 'PostgreSQL DB 12.1' }
                    };
                }

                return `
Starting Nmap 7.93 ( https://nmap.org ) at ${new Date().toLocaleString()}
Nmap scan report for 192.168.1.30
Host is up (0.0042s latency).
Not shown: 998 closed tcp ports (reset)
PORT     STATE SERVICE
22/tcp   open  ssh
5432/tcp open  postgresql

Nmap done: 1 IP address (1 host up) scanned in 2.05 seconds
`;
            }

            if (command.includes('-sV') && target !== 'unknown') {
                return `
Starting Nmap 7.93 ( https://nmap.org ) at ${new Date().toLocaleString()}
Note: Host seems down. If it is really up, but blocking our ping probes, try -Pn
Nmap done: 1 IP address (0 hosts up) scanned in 3.19 seconds
`;
            }

            return `
Starting Nmap 7.93 ( https://nmap.org ) at ${new Date().toLocaleString()}
Note: Host seems down. If it is really up, but blocking our ping probes, try -Pn
Nmap done: 1 IP address (0 hosts up) scanned in 3.19 seconds
`;

        default:
            return processGeneralCommand(command);
    }
}

/**
 * Process Metasploit console commands for recon lab
 * @param {string} command - Full command
 * @param {Array} parts - Command parts
 * @param {string} mainCommand - Main command
 * @param {Object} labState - Lab state
 * @returns {string} Command output
 */
function processMsfConsoleCommand(command, parts, mainCommand, labState) {
    // Common MSF commands
    switch (mainCommand) {
        case 'exit':
        case 'quit':
            labState.msfConsoleActive = false;
            return '\n[*] You have left the MSF console.\n';

        case 'help':
            return `
Core Commands
=============

    Command       Description
    -------       -----------
    ?             Help menu
    banner        Display an awesome metasploit banner
    cd            Change the current working directory
    color         Toggle color
    connect       Communicate with a host
    exit          Exit the console
    get           Gets the value of a context-specific variable
    getg          Gets the value of a global variable
    grep          Grep the output of another command
    help          Help menu
    history       Show command history
    load          Load a framework plugin
    quit          Exit the console
    route         Route traffic through a session
    save          Saves the active datastores
    sessions      Dump session listings and display information about sessions
    set           Sets a context-specific variable to a value
    setg          Sets a global variable to a value
    sleep         Do nothing for the specified number of seconds
    spool         Write console output into a file as well the screen
    threads       View and manipulate background threads
    tips          Show a list of useful productivity tips
    unload        Unload a framework plugin
    unset         Unsets one or more context-specific variables
    unsetg        Unsets one or more global variables
    version       Show the framework and console library version numbers


Database Backend Commands
========================

    Command           Description
    -------           -----------
    analyze           Analyze database information about a specific address or address range
    db_connect        Connect to an existing data service
    db_disconnect     Disconnect from the current data service
    db_export         Export a file containing the contents of the database
    db_import         Import a scan result file (filetype will be auto-detected)
    db_nmap           Executes nmap and records the output automatically
    db_rebuild_cache  Rebuilds the database-stored module cache
    db_remove         Remove the saved data service entry
    db_save           Save the current data service connection as the default to reconnect on startup
    db_status         Show the current data service status
    hosts             List all hosts in the database
    loot              List all loot in the database
    notes             List all notes in the database
    services          List all services in the database
    vulns             List all vulnerabilities in the database
    workspace         Switch between database workspaces


Module Commands
==============

    Command       Description
    -------       -----------
    advanced      Displays advanced options for one or more modules
    back          Move back from the current context
    info          Displays information about one or more modules
    loadpath      Searches for and loads modules from a path
    options       Displays global options or for one or more modules
    popm          Pops the latest module off the stack and makes it active
    previous      Sets the previously loaded module as the current module
    pushm         Pushes the active or list of modules onto the module stack
    reload_all    Reloads all modules from all defined module paths
    search        Searches module names and descriptions
    show          Displays modules of a given type, or all modules
    use           Interact with a module by name or search term/index


Job Commands
===========

    Command       Description
    -------       -----------
    handler       Start a payload handler as job
    jobs          Displays and manages jobs


Resource Script Commands
=======================

    Command       Description
    -------       -----------
    makerc        Save commands entered since start to a file
    resource      Run the commands stored in a file


Developer Commands
================

    Command       Description
    -------       -----------
    edit          Edit the current module or a file with the preferred editor
    irb           Open an interactive Ruby shell in the current context
    log           Display framework.log paged to the end if possible
    pry           Open the Pry debugger on the current module or Framework
    reload_lib    Reload Ruby library files from specified paths

msf6 > `;

        case 'db_status':
            if (labState.dbInitialized) {
                return `[*] Connected to msf. Connection type: postgresql.\n${labState.msfPrompt}`;
            } else {
                return `[*] No database connected. Run db_connect to connect to a database\n${labState.msfPrompt}`;
            }

        case 'db_nmap':
            if (!labState.dbInitialized) {
                return `[-] Error: No database connected. Run msfdb init or db_connect.\n${labState.msfPrompt}`;
            }

            // Simple target extraction - in real app, would be more robust
            const targetMatch = command.match(/\b(?:\d{1,3}\.){3}\d{1,3}(?:\/\d{1,2})?\b/);
            const target = targetMatch ? targetMatch[0] : 'unknown';

            if (target === '192.168.1.10') {
                // Record the host as scanned
                if (!labState.scannedHosts.includes(target)) {
                    labState.scannedHosts.push(target);
                }

                // Record discovered services
                labState.discoveredServices[target] = {
                    '21': { port: 21, service: 'ftp', version: 'vsftpd 3.0.3' },
                    '22': { port: 22, service: 'ssh', version: 'OpenSSH 7.9p1' },
                    '80': { port: 80, service: 'http', version: 'Apache httpd 2.4.38' }
                };

                return `
[*] Nmap: Starting Nmap 7.93 ( https://nmap.org )
[*] Nmap: Nmap scan report for 192.168.1.10
[*] Nmap: Host is up (0.0054s latency).
[*] Nmap: Not shown: 997 closed tcp ports (reset)
[*] Nmap: PORT   STATE SERVICE VERSION
[*] Nmap: 21/tcp open  ftp     vsftpd 3.0.3
[*] Nmap: 22/tcp open  ssh     OpenSSH 7.9p1
[*] Nmap: 80/tcp open  http    Apache httpd 2.4.38
[*] Nmap: Nmap done: 1 IP address (1 host up) scanned in 2.41 seconds
[*] Nmap: finished successfully
[*] Importing 'nmap_scan_import' data
[*] Successfully imported 'nmap_scan_import'

${labState.msfPrompt}`;
            }

            return `
[*] Nmap: Starting Nmap 7.93 ( https://nmap.org )
[*] Nmap: Note: Host seems down. If it is really up, but blocking our ping probes, try -Pn
[*] Nmap: Nmap done: 1 IP address (0 hosts up) scanned in 3.19 seconds
[*] Nmap: finished with errors

${labState.msfPrompt}`;

        case 'hosts':
            if (!labState.dbInitialized) {
                return `[-] Error: No database connected. Run msfdb init or db_connect.\n${labState.msfPrompt}`;
            }

            if (labState.scannedHosts.length === 0) {
                return `No hosts found in the database.\n${labState.msfPrompt}`;
            }

            let hostsOutput = `
Hosts
=====

address         mac  name  os_name  os_flavor  os_sp  purpose  info  comments
-------         ---  ----  -------  ---------  -----  -------  ----  --------
`;

            labState.scannedHosts.forEach(host => {
                hostsOutput += `${host}                                                \n`;
            });

            return hostsOutput + labState.msfPrompt;

        case 'services':
            if (!labState.dbInitialized) {
                return `[-] Error: No database connected. Run msfdb init or db_connect.\n${labState.msfPrompt}`;
            }

            if (Object.keys(labState.discoveredServices).length === 0) {
                return `No services found in the database.\n${labState.msfPrompt}`;
            }

            let servicesOutput = `
Services
========

host          port  proto  name          state  info
----          ----  -----  ----          -----  ----
`;

            Object.entries(labState.discoveredServices).forEach(([host, services]) => {
                Object.values(services).forEach(service => {
                    servicesOutput += `${host}  ${service.port}    tcp    ${service.service.padEnd(12)}  open   ${service.version || ''}\n`;
                });
            });

            return servicesOutput + labState.msfPrompt;

        case 'workspace':
            if (!labState.dbInitialized) {
                return `[-] Error: No database connected. Run msfdb init or db_connect.\n${labState.msfPrompt}`;
            }

            if (parts.length === 1) {
                return `
Workspaces
==========

current  name
-------  ----
*        ${labState.currentWorkspace}
         default

${labState.msfPrompt}`;
            }

            if (parts[1] === '-a' && parts[2]) {
                return `[*] Added workspace: ${parts[2]}\n${labState.msfPrompt}`;
            }

            labState.currentWorkspace = parts[1];
            return `[*] Workspace: ${parts[1]}\n${labState.msfPrompt}`;

        case 'search':
            // Simple search implementation
            if (parts.length === 1) {
                return `Usage: search [keywords]\nExample: search cve:2020 type:exploit platform:windows\n${labState.msfPrompt}`;
            }

            const term = parts.slice(1).join(' ').toLowerCase();

            if (term.includes('ftp') || term.includes('vsftpd')) {
                return `
Matching Modules
===============

   #  Name                                   Disclosure Date  Rank       Check  Description
   -  ----                                   ---------------  ----       -----  -----------
   0  exploit/unix/ftp/vsftpd_234_backdoor   2011-07-03       excellent  Yes    VSFTPD v2.3.4 Backdoor Command Execution
   1  auxiliary/scanner/ftp/ftp_version      n/a              normal     No     FTP Banner Scanner
   2  auxiliary/scanner/ftp/ftp_login        n/a              normal     No     FTP Authentication Scanner

${labState.msfPrompt}`;
            }

            if (term.includes('ssh') || term.includes('openssh')) {
                return `
Matching Modules
===============

   #  Name                                   Disclosure Date  Rank       Check  Description
   -  ----                                   ---------------  ----       -----  -----------
   0  auxiliary/scanner/ssh/ssh_version      n/a              normal     No     SSH Version Scanner
   1  auxiliary/scanner/ssh/ssh_login        n/a              normal     No     SSH Login Check Scanner
   2  auxiliary/scanner/ssh/ssh_enumusers    2006-07-19       normal     No     SSH Username Enumeration

${labState.msfPrompt}`;
            }

            if (term.includes('http') || term.includes('apache')) {
                return `
Matching Modules
===============

   #  Name                                             Disclosure Date  Rank       Check  Description
   -  ----                                             ---------------  ----       -----  -----------
   0  auxiliary/scanner/http/http_version              n/a              normal     No     HTTP Version Detection
   1  auxiliary/scanner/http/apache_userdir_enum       n/a              normal     No     Apache Userdir Module User Enumeration
   2  auxiliary/scanner/http/brute_dirs                n/a              normal     No     Directory Brute Forcer
   3  auxiliary/scanner/http/dir_scanner               n/a              normal     No     HTTP Directory Scanner

${labState.msfPrompt}`;
            }

            return `No results found for "${term}"\n${labState.msfPrompt}`;

        case 'use':
            if (parts.length === 1) {
                return `Usage: use module_name\nExample: use exploit/windows/smb/ms17_010_eternalblue\n${labState.msfPrompt}`;
            }

            const module = parts[1];

            // Return different prompts based on the module type
            if (module.startsWith('exploit/')) {
                labState.msfPrompt = `msf6 exploit(${module.replace('exploit/', '')}) > `;
                return `\n${labState.msfPrompt}`;
            } else if (module.startsWith('auxiliary/')) {
                labState.msfPrompt = `msf6 auxiliary(${module.replace('auxiliary/', '')}) > `;
                return `\n${labState.msfPrompt}`;
            } else if (module.startsWith('post/')) {
                labState.msfPrompt = `msf6 post(${module.replace('post/', '')}) > `;
                return `\n${labState.msfPrompt}`;
            } else if (module.startsWith('payload/')) {
                labState.msfPrompt = `msf6 payload(${module.replace('payload/', '')}) > `;
                return `\n${labState.msfPrompt}`;
            } else {
                return `[-] Failed to load module: ${module}\n${labState.msfPrompt}`;
            }

        case 'banner':
            return `
                 _________
               /          /|      .-------------------.
              /          / |     /                    /|
             /_________ / /|    /                    / |
            |          |/ /|   /--------------------|  |
            |  ________|/ /   /                     |  /
            | |        | /   /--------------------- | /
            | |        |/    | M E T A S P L O I T |/     *
            | |               -----------------------     /|
            | |                                          / |
            | |                                         /  |
     *      | |                                        /   |
      \\     | |                                       /    |
       \\    | |                                      /     |
        \\   | |                                     /      |
         \\  | |                                    /       |
          \\ | |                                   /        |
           \\| |                                  /         |
            | |                                 /__________|
            | |                                |           |
            | |                                | |_______| |
            | |                                | |       | |
            | |                                | |       | |
            | |                                | |       | |
            | |                                | |       | |
            | |                                | |_______| |
            | |                                |           |
            | |                                |___________|
            | |                               /
            | |                              /
            | |                             /
            | |                            /
            | |                           /
            | |                          /
            | |                         /
            | |                        /
            | |___________              /
            |             |            /
            |             |           /
            |             |          /
            |_____________|         /


       =[ metasploit v6.3.4-dev                          ]
+ -- --=[ 2275 exploits - 1192 auxiliary - 398 post       ]
+ -- --=[ 951 payloads - 45 encoders - 11 nops            ]
+ -- --=[ 9 evasion                                       ]

${labState.msfPrompt}`;

        case 'back':
            labState.msfPrompt = 'msf6 > ';
            return labState.msfPrompt;

        default:
            if (labState.msfPrompt !== 'msf6 > ') {
                // In a module context, handle module-specific commands
                return handleModuleCommands(command, parts, mainCommand, labState);
            }
            return `[-] Unknown command: ${mainCommand}\n${labState.msfPrompt}`;
    }
}

/**
 * Handle Metasploit module-specific commands
 * @param {string} command - Full command
 * @param {Array} parts - Command parts
 * @param {string} mainCommand - Main command
 * @param {Object} labState - Lab state
 * @returns {string} Command output
 */
function handleModuleCommands(command, parts, mainCommand, labState) {
    // Extract the current module type and name from the prompt
    const moduleMatch = labState.msfPrompt.match(/msf6 (\w+)\((.*?)\)/);

    if (!moduleMatch) {
        return `[-] Error: Unable to determine module context\n${labState.msfPrompt}`;
    }

    const moduleType = moduleMatch[1];
    const moduleName = moduleMatch[2];

    switch (mainCommand) {
        case 'info':
            // Return information about the current module
            if (moduleType === 'auxiliary' && moduleName.includes('scanner/http/http_version')) {
                return `
       Name: HTTP Version Detection
     Module: auxiliary/scanner/http/http_version
    License: Metasploit Framework License (BSD)
       Rank: Normal

Provided by:
  hdm <x@hdm.io>

Check supported:
  No

Basic options:
  Name         Current Setting  Required  Description
  ----         ---------------  --------  -----------
  Proxies                       no        A proxy chain of format type:host:port[,type:host:port][...]
  RHOSTS                        yes       The target host(s), see https://github.com/rapid7/metasploit-framework/wiki/Using-Metasploit
  RPORT        80               yes       The target port (TCP)
  SSL          false            no        Negotiate SSL/TLS for outgoing connections
  THREADS      1                yes       The number of concurrent threads (max one per host)
  VHOST                         no        HTTP server virtual host

Description:
  Detect web server version.

${labState.msfPrompt}`;
            }

            // Add more module info cases as needed for other modules

            return `
       Name: ${moduleType.charAt(0).toUpperCase() + moduleType.slice(1)} Module ${moduleName}
     Module: ${moduleType}/${moduleName}
    License: Metasploit Framework License (BSD)
       Rank: Normal

Provided by:
  Metasploit Team

Basic options:
  Name         Current Setting  Required  Description
  ----         ---------------  --------  -----------
  RHOSTS                        yes       The target host(s), see https://github.com/rapid7/metasploit-framework/wiki/Using-Metasploit
  RPORT        0                yes       The target port (TCP)

Description:
  This module performs various operations related to ${moduleType}/${moduleName}.

${labState.msfPrompt}`;

        case 'options':
            // Return options for the current module
            if (moduleType === 'auxiliary' && moduleName.includes('scanner/http/http_version')) {
                return `
Module options (auxiliary/scanner/http/http_version):

   Name         Current Setting  Required  Description
   ----         ---------------  --------  -----------
   Proxies                       no        A proxy chain of format type:host:port[,type:host:port][...]
   RHOSTS                        yes       The target host(s), see https://github.com/rapid7/metasploit-framework/wiki/Using-Metasploit
   RPORT        80               yes       The target port (TCP)
   SSL          false            no        Negotiate SSL/TLS for outgoing connections
   THREADS      1                yes       The number of concurrent threads (max one per host)
   VHOST                         no        HTTP server virtual host

${labState.msfPrompt}`;
            }

            // Add more options cases as needed for other modules

            return `
Module options (${moduleType}/${moduleName}):

   Name         Current Setting  Required  Description
   ----         ---------------  --------  -----------
   RHOSTS                        yes       The target host(s), see https://github.com/rapid7/metasploit-framework/wiki/Using-Metasploit
   RPORT        0                yes       The target port (TCP)

${labState.msfPrompt}`;

        case 'set':
            if (parts.length < 3) {
                return `[-] Error: Missing required argument\nUsage: set <option> <value>\n${labState.msfPrompt}`;
            }

            const option = parts[1].toUpperCase();
            const value = parts.slice(2).join(' ');

            return `${option} => ${value}\n${labState.msfPrompt}`;

        case 'run':
        case 'exploit':
            // Simulate running the module
            if (moduleType === 'auxiliary' && moduleName.includes('scanner/http/http_version')) {
                return `
[*] Scanning 1 host(s)...
[+] 192.168.1.10:80 Apache/2.4.38 (Debian)
[*] Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed

${labState.msfPrompt}`;
            }

            // Add more run cases as needed for other modules

            return `
[*] Running module against specified targets
[*] No results returned
[*] ${moduleType} module execution completed

${labState.msfPrompt}`;

        default:
            return `[-] Unknown command: ${mainCommand}\n${labState.msfPrompt}`;
    }
}
