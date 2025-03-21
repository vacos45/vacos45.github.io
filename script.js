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
    // Initialize particle background
    initParticles();
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
          top: targetElement.offsetTop - 60,
          behavior: "smooth",
        });
      }
    });
  });

  // Accordion functionality
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Enhanced Terminal Simulation
  const terminalInput = document.getElementById("terminal-input");
  const terminalOutput = document.getElementById("terminal-output");
  let commandHistory = [];
  let historyIndex = -1;

  // Pre-defined command responses with extra flair
  const commands = {
    help: `Available commands:
- help: Show this help message.
- search: Simulate searching for exploits.
- use: Simulate module selection.
- show: Display module options.
- set: Set module parameters.
- exploit: Execute the simulated exploit.
- clear: Clear the terminal.`,
    search: `Searching for exploits...
[✔] Found: exploit/windows/smb/ms17_010_eternalblue
[✔] Found: exploit/linux/http/apache_mod_cgi_bash_env
...`,
    use: `Module selected. Type "show" to view parameters.`,
    show: `RHOSTS: <target IP>
RPORT: <port>
Other options: [default values]`,
    set: `Option set successfully.`,
    exploit: `Launching exploit...
[+] Exploit in progress...
[+] Exploit completed. Session opened.`,
    clear: ``,
  };

  terminalInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const inputCommand = terminalInput.value.trim();
      if (!inputCommand) return;
      appendToTerminal(`msf> ${inputCommand}`);
      // Save to history
      commandHistory.push(inputCommand);
      historyIndex = commandHistory.length;
      processCommand(inputCommand);
      terminalInput.value = "";
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        terminalInput.value = commandHistory[historyIndex];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        terminalInput.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        terminalInput.value = "";
      }
    }
  });

  function processCommand(cmd) {
    const commandKey = cmd.split(" ")[0].toLowerCase();
    let response = commands[commandKey];
    if (response === undefined) {
      response = `Command "${cmd}" not found. Type "help" for available commands.`;
    }
    // If clear, wipe terminal output
    if (commandKey === "clear") {
      terminalOutput.innerHTML = "";
      return;
    }
    // Simulate delay for realism
    setTimeout(() => {
      appendToTerminal(response);
    }, 500);
  }

  function appendToTerminal(text) {
    const line = document.createElement("div");
    line.className = "terminal-line";
    line.textContent = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  // Particle background for header (simple implementation)
  function initParticles() {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let particles = [];
    const numParticles = 100;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    function Particle() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.radius = Math.random() * 2;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.speedY = Math.random() * 0.5 - 0.25;
      this.alpha = Math.random();
    }

    function init() {
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    }
    init();
    animate();
  }
});
