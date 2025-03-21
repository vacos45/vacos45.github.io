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

  // Challenge Terminal Simulation for Kali Linux Commands
  const challengeInput = document.getElementById("challenge-input");
  const challengeOutput = document.getElementById("challenge-output");
  let commandHistory = [];
  let historyIndex = -1;

  // Pre-defined responses for a variety of Kali Linux commands
  const kaliCommands = {
    ls: `Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos`,
    pwd: `/home/kali`,
    ifconfig: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)
        RX packets 10500  bytes 8500000 (8.5 MB)
        TX packets 9800  bytes 7200000 (7.2 MB)`,
    whoami: `kali`,
    netstat: `Active Internet connections (w/o servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 kali:ssh                192.168.1.55:52412      ESTABLISHED
...`,
    uname: `Linux kali 5.10.0-kali9-amd64 #1 SMP Debian 5.10.46-4kali1 (2021-08-15) x86_64 GNU/Linux`,
    cat: `Usage: cat [OPTION] [FILE]...`,
    clear: ``,
  };

  challengeInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const inputCommand = challengeInput.value.trim();
      if (!inputCommand) return;
      appendChallengeOutput(`kali@machine:~$ ${inputCommand}`);
      // Save command to history and reset index
      commandHistory.push(inputCommand);
      historyIndex = commandHistory.length;
      processKaliCommand(inputCommand);
      challengeInput.value = "";
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        challengeInput.value = commandHistory[historyIndex];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        challengeInput.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        challengeInput.value = "";
      }
    }
  });

  function processKaliCommand(cmd) {
    const commandKey = cmd.split(" ")[0].toLowerCase();
    let response = kaliCommands[commandKey];
    if (response === undefined) {
      response = `bash: ${cmd}: command not found`;
    }
    // If clear, wipe terminal output
    if (commandKey === "clear") {
      challengeOutput.innerHTML = "";
      return;
    }
    // Simulate a realistic delay
    setTimeout(() => {
      appendChallengeOutput(response);
    }, 500);
  }

  function appendChallengeOutput(text) {
    const line = document.createElement("div");
    line.className = "terminal-line";
    line.textContent = text;
    challengeOutput.appendChild(line);
    challengeOutput.scrollTop = challengeOutput.scrollHeight;
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
