// Wait until DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Loader removal after page load
  window.addEventListener("load", function () {
    const loader = document.getElementById("loader");
    const content = document.getElementById("content");
    loader.classList.add("fade-out");
    setTimeout(() => {
      loader.style.display = "none";
      content.classList.remove("hidden");
    }, 600);
  });

  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll("nav ul li a");
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 60, // Adjust for header height
          behavior: "smooth",
        });
      }
    });
  });

  // Accordion functionality for advanced sections
  const accordions = document.querySelectorAll(".accordion-header");
  accordions.forEach((header) => {
    header.addEventListener("click", function () {
      this.classList.toggle("active");
      const content = this.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });

  // Back-to-top button functionality
  const backToTopButton = document.getElementById("back-to-top");
  window.addEventListener("scroll", function () {
    backToTopButton.style.display = window.pageYOffset > 300 ? "block" : "none";
  });
  backToTopButton.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Terminal Simulation
  const terminalInput = document.getElementById("terminal-input");
  const terminalOutput = document.getElementById("terminal-output");

  // Pre-defined command responses
  const commands = {
    help: `Available commands:
- help: Show this help message.
- search: Simulate searching for exploits.
- use: Simulate module selection.
- show options: Display module options.
- set: Set module parameters.
- exploit: Execute the simulated exploit.`,
    search: `Simulating search...
Found exploits: exploit/windows/smb/ms17_010_eternalblue, exploit/linux/http/apache_mod_cgi_bash_env,
...`,
    "use": `Module selected. Type "show options" to view parameters.`,
    "show options": `RHOSTS: <target IP>
RPORT: <port>
Other options: [default values]`,
    set: `Option set successfully.`,
    exploit: `Launching exploit...
[+] Exploit completed. Check for session details.`,
  };

  // Handle command execution
  terminalInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const inputCommand = terminalInput.value.trim();
      if (!inputCommand) return;
      appendToTerminal(`msf> ${inputCommand}`);
      processCommand(inputCommand);
      terminalInput.value = "";
    }
  });

  function processCommand(cmd) {
    // Extract first word as the command
    const commandKey = cmd.split(" ")[0].toLowerCase();
    let response = commands[commandKey];
    if (!response) {
      response = `Command "${cmd}" not found. Type "help" for available commands.`;
    }
    appendToTerminal(response);
  }

  function appendToTerminal(text) {
    const line = document.createElement("div");
    line.className = "terminal-line";
    line.textContent = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }
});
