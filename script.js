// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const discordButton = document.getElementById('discord-button');
    const memberCount = document.getElementById('member-count');

    // Simulated member count (in a real app, this would come from Discord API)
    const minMembers = 500;
    const maxMembers = 1500;
    const randomMemberCount = Math.floor(Math.random() * (maxMembers - minMembers + 1)) + minMembers;

    // Update member count with animation
    let count = 0;
    const interval = setInterval(() => {
        count += Math.ceil(randomMemberCount / 50);
        if (count >= randomMemberCount) {
            count = randomMemberCount;
            clearInterval(interval);
        }
        memberCount.textContent = count.toLocaleString();
    }, 50);

    // Add pulse animation to Discord button
    setInterval(() => {
        discordButton.style.animation = 'pulse 1.5s ease-in-out';
        setTimeout(() => {
            discordButton.style.animation = '';
        }, 1500);
    }, 5000);

    // Button click effect
    discordButton.addEventListener('click', () => {
        // Track click (in a real app, you might use analytics here)
        console.log('Discord button clicked');

        // Show a message to confirm the action
        discordButton.classList.add('clicked');
        discordButton.innerHTML = '<i class="fas fa-check"></i> Opening Discord...';

        // Reset after a short delay (the link will already be opening)
        setTimeout(() => {
            discordButton.classList.remove('clicked');
            discordButton.innerHTML = '<i class="fab fa-discord"></i> Join Discord Server';
        }, 2000);
    });

    // Add smooth scrolling for any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Simple Easter Egg - Konami Code
    // Up, Up, Down, Down, Left, Right, Left, Right, B, A
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        // Check if the key pressed matches the next key in the Konami Code
        if (e.key.toLowerCase() === konamiCode[konamiIndex].toLowerCase()) {
            konamiIndex++;

            // If the full Konami Code has been entered
            if (konamiIndex === konamiCode.length) {
                // Reset the index
                konamiIndex = 0;

                // Easter egg effect - change colors temporarily
                document.body.style.transition = 'all 1s';
                document.body.style.background = 'linear-gradient(45deg, #5865F2, #EB459E)';

                // Create floating Discord logos
                for (let i = 0; i < 20; i++) {
                    createFloatingLogo();
                }

                // Return to normal after a few seconds
                setTimeout(() => {
                    document.body.style.background = 'linear-gradient(45deg, #2C2F33, #23272A)';
                    // Remove floating logos
                    document.querySelectorAll('.floating-logo').forEach(logo => {
                        logo.remove();
                    });
                }, 5000);
            }
        } else {
            // Reset if the sequence is broken
            konamiIndex = 0;
        }
    });

    // Create a floating Discord logo for easter egg
    function createFloatingLogo() {
        const logo = document.createElement('i');
        logo.className = 'fab fa-discord floating-logo';
        logo.style.position = 'fixed';
        logo.style.color = '#ffffff';
        logo.style.opacity = '0.7';
        logo.style.fontSize = Math.random() * 30 + 10 + 'px';
        logo.style.left = Math.random() * window.innerWidth + 'px';
        logo.style.top = Math.random() * window.innerHeight + 'px';
        logo.style.animation = `float ${Math.random() * 5 + 3}s linear infinite`;
        logo.style.zIndex = '9999';

        // Add animation for floating
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes float {
                0% {
                    transform: translateY(0) rotate(0deg);
                }
                50% {
                    transform: translateY(-100px) rotate(180deg);
                }
                100% {
                    transform: translateY(-200px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(logo);

        // Remove after animation completes
        setTimeout(() => {
            logo.remove();
        }, 5000);
    }

    // Simulate script data (in a real app, this might come from a database)
    const scripts = [
        { name: "Arsenal Aimbot", date: "2025-03-15" },
        { name: "Jailbreak Auto-Rob", date: "2025-03-10" },
        { name: "Adopt Me Pets Hack", date: "2025-03-05" },
        { name: "Phantom Forces ESP", date: "2025-02-28" },
        { name: "Blox Fruits Auto-Farm", date: "2025-02-20" }
    ];

    // Console Easter Egg - Display some fake "script" info when opening console
    console.log("%cWelcome to Vacos Roblox Discord!", "color: #5865F2; font-size: 24px; font-weight: bold;");
    console.log("%cJoin our Discord for exclusive scripts and leaks!", "color: white; font-size: 16px;");
    console.log("%cDiscord Link: https://discord.gg/rNg3ycbAQb", "color: #00b0f4; font-size: 14px;");
    console.log("%c⚠️ NOTE: This is just a showcase website. Scripts mentioned are not real.", "color: yellow; font-size: 12px;");
});

