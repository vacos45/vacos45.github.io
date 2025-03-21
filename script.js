// Document Ready Handler
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the website functionality
    initializeMobileMenu();
    loadFeaturedScripts();
    initializeScriptViewer();
    initializeCategories();
    initializeModals();
    initializeFormSubmissions();
    initializeSearchFunctionality();
});

// Mobile Menu Handler
function initializeMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');

            // Toggle menu animation
            const bars = menuToggle.querySelectorAll('.bar');
            menuToggle.classList.toggle('active');

            if (menuToggle.classList.contains('active')) {
                bars[0].style.transform = 'translateY(9px) rotate(45deg)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'translateY(-9px) rotate(-45deg)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });

        // Close mobile menu when clicking on a link
        const navLinkElements = document.querySelectorAll('.nav-links a');
        navLinkElements.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');

                    const bars = menuToggle.querySelectorAll('.bar');
                    bars[0].style.transform = 'none';
                    bars[1].style.opacity = '1';
                    bars[2].style.transform = 'none';
                }
            });
        });
    }
}

// Sample data for scripts
const sampleScripts = [
    {
        id: 1,
        title: "Advanced Admin Commands",
        description: "A comprehensive suite of admin commands for game moderation and management. Includes teleportation, player management, and environment controls.",
        code: `-- Advanced Admin Commands Script
local AdminCommands = {}
local Players = game:GetService("Players")
local ServerStorage = game:GetService("ServerStorage")

-- Configuration
AdminCommands.admins = {
    ["username1"] = true,
    ["username2"] = true
}

-- Command functions
function AdminCommands:Teleport(player, target)
    if not self:IsAdmin(player) then return end
    local targetPlayer = self:GetPlayer(target)
    if targetPlayer then
        player.Character:SetPrimaryPartCFrame(targetPlayer.Character.PrimaryPart.CFrame)
    end
end

function AdminCommands:Kick(player, target, reason)
    if not self:IsAdmin(player) then return end
    local targetPlayer = self:GetPlayer(target)
    if targetPlayer then
        targetPlayer:Kick(reason or "You have been kicked by an admin")
    end
end

function AdminCommands:IsAdmin(player)
    return self.admins[player.Name] or player.UserId == game.CreatorId
end

function AdminCommands:GetPlayer(name)
    for _, player in ipairs(Players:GetPlayers()) do
        if player.Name:lower():find(name:lower()) then
            return player
        end
    end
    return nil
end

-- Initialize and return the module
return AdminCommands`,
        author: "ScriptMaster99",
        date: "March 15, 2025",
        category: "gameplay"
    },
    {
        id: 2,
        title: "Custom UI Framework",
        description: "A lightweight, customizable UI framework for building interactive interfaces in Roblox games. Features easy styling, animations, and event handling.",
        code: `-- Custom UI Framework
local UIFramework = {}
local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")

-- Style configuration
UIFramework.defaultStyle = {
    backgroundColor = Color3.fromRGB(40, 40, 40),
    textColor = Color3.fromRGB(255, 255, 255),
    accentColor = Color3.fromRGB(255, 100, 100),
    cornerRadius = UDim.new(0, 8),
    font = Enum.Font.GothamSemibold,
    fontSize = Enum.FontSize.Size14,
    padding = UDim.new(0, 10)
}

-- Create a new frame with the framework style
function UIFramework:CreateFrame(options)
    options = options or {}

    local frame = Instance.new("Frame")
    frame.BackgroundColor3 = options.backgroundColor or self.defaultStyle.backgroundColor
    frame.BorderSizePixel = 0

    local corner = Instance.new("UICorner", frame)
    corner.CornerRadius = options.cornerRadius or self.defaultStyle.cornerRadius

    local padding = Instance.new("UIPadding", frame)
    padding.PaddingTop = options.padding or self.defaultStyle.padding
    padding.PaddingBottom = options.padding or self.defaultStyle.padding
    padding.PaddingLeft = options.padding or self.defaultStyle.padding
    padding.PaddingRight = options.padding or self.defaultStyle.padding

    return frame
end

-- Handle animations and effects
function UIFramework:ApplyHoverEffect(element, options)
    options = options or {}
    local defaultScale = element.Size
    local hoverScale = defaultScale * (options.scale or 1.05)

    element.MouseEnter:Connect(function()
        local tween = TweenService:Create(
            element,
            TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
            {Size = hoverScale}
        )
        tween:Play()
    end)

    element.MouseLeave:Connect(function()
        local tween = TweenService:Create(
            element,
            TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
            {Size = defaultScale}
        )
        tween:Play()
    end)
end

return UIFramework`,
        author: "UIDesigner42",
        date: "February 28, 2025",
        category: "ui"
    },
    {
        id: 3,
        title: "Auto Farm Script",
        description: "Automated resource collection script that works in various Roblox farming games. Features customizable collection patterns and item detection.",
        code: `-- Auto Farm Script
-- Use with caution and only in games where automation is allowed
local AutoFarm = {}
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

-- Configuration
AutoFarm.settings = {
    enabled = false,
    collectionRadius = 30,
    collectionDelay = 0.5,
    targetResourceTypes = {"Ore", "Wood", "Crop"},
    visualFeedback = true
}

local player = Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()

-- Helper functions
function AutoFarm:GetNearbyResources()
    local resources = {}
    for _, obj in pairs(workspace:GetChildren()) do
        -- Check if the object is a resource by tag or property
        if table.find(self.settings.targetResourceTypes, obj.Name) or
           (obj:FindFirstChild("ResourceType") and
            table.find(self.settings.targetResourceTypes, obj.ResourceType.Value)) then

            local distance = (character.HumanoidRootPart.Position - obj.Position).magnitude
            if distance <= self.settings.collectionRadius then
                table.insert(resources, {
                    instance = obj,
                    distance = distance
                })
            end
        end
    end

    -- Sort by distance
    table.sort(resources, function(a, b)
        return a.distance < b.distance
    end)

    return resources
end

function AutoFarm:CollectResource(resource)
    if not resource or not resource.instance or not resource.instance.Parent then return end

    -- Move to the resource
    local humanoid = character:FindFirstChild("Humanoid")
    if humanoid then
        humanoid:MoveTo(resource.instance.Position)
    end

    -- Visual feedback
    if self.settings.visualFeedback then
        local highlight = Instance.new("Highlight")
        highlight.FillColor = Color3.fromRGB(0, 255, 0)
        highlight.OutlineColor = Color3.fromRGB(0, 255, 0)
        highlight.FillTransparency = 0.5
        highlight.Parent = resource.instance

        game:GetService("Debris"):AddItem(highlight, 1)
    end

    -- Wait for character to reach resource
    wait(resource.distance / 10) -- Approximate time to reach

    -- Trigger collection (this depends on the game's collection mechanism)
    -- This is just a generic example
    local args = {
        resource.instance
    }
    game:GetService("ReplicatedStorage").CollectResource:FireServer(unpack(args))
end

-- Main farm loop
function AutoFarm:Start()
    self.settings.enabled = true

    spawn(function()
        while self.settings.enabled do
            local resources = self:GetNearbyResources()

            for _, resource in ipairs(resources) do
                if self.settings.enabled then
                    self:CollectResource(resource)
                    wait(self.settings.collectionDelay)
                else
                    break
                end
            end

            wait(1)
        end
    end)
end

function AutoFarm:Stop()
    self.settings.enabled = false
end

return AutoFarm`,
        author: "FarmingPro",
        date: "March 10, 2025",
        category: "automation"
    },
    {
        id: 4,
        title: "Particle Effect System",
        description: "Create stunning visual effects with this comprehensive particle system. Includes presets for fire, water, magic, and explosions with customizable properties.",
        code: `-- Particle Effect System
local ParticleSystem = {}
local TweenService = game:GetService("TweenService")

-- Preset configurations
ParticleSystem.presets = {
    fire = {
        color = ColorSequence.new({
            ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 255, 0)),
            ColorSequenceKeypoint.new(0.5, Color3.fromRGB(255, 100, 0)),
            ColorSequenceKeypoint.new(1, Color3.fromRGB(100, 0, 0))
        }),
        size = NumberSequence.new({
            NumberSequenceKeypoint.new(0, 0),
            NumberSequenceKeypoint.new(0.1, 1),
            NumberSequenceKeypoint.new(1, 0)
        }),
        transparency = NumberSequence.new({
            NumberSequenceKeypoint.new(0, 0),
            NumberSequenceKeypoint.new(0.8, 0.5),
            NumberSequenceKeypoint.new(1, 1)
        }),
        rate = 50,
        speed = NumberRange.new(5, 8),
        lifetime = NumberRange.new(0.5, 1.5),
        rotSpeed = NumberRange.new(-30, 30),
        acceleration = Vector3.new(0, 5, 0)
    },

    water = {
        color = ColorSequence.new({
            ColorSequenceKeypoint.new(0, Color3.fromRGB(200, 200, 255)),
            ColorSequenceKeypoint.new(1, Color3.fromRGB(0, 100, 255))
        }),
        size = NumberSequence.new({
            NumberSequenceKeypoint.new(0, 0),
            NumberSequenceKeypoint.new(0.1, 0.5),
            NumberSequenceKeypoint.new(1, 0)
        }),
        transparency = NumberSequence.new({
            NumberSequenceKeypoint.new(0, 0.2),
            NumberSequenceKeypoint.new(0.8, 0.6),
            NumberSequenceKeypoint.new(1, 1)
        }),
        rate = 40,
        speed = NumberRange.new(2, 5),
        lifetime = NumberRange.new(1, 2),
        rotSpeed = NumberRange.new(-10, 10),
        acceleration = Vector3.new(0, -5, 0)
    }
    -- Additional presets would go here
}

-- Create a particle emitter with the specified preset
function ParticleSystem:CreateEffect(preset, parent)
    preset = typeof(preset) == "string" and self.presets[preset:lower()] or preset
    if not preset then
        warn("ParticleSystem: Invalid preset specified")
        return
    end

    local emitter = Instance.new("ParticleEmitter")
    emitter.Color = preset.color
    emitter.Size = preset.size
    emitter.Transparency = preset.transparency
    emitter.Rate = preset.rate
    emitter.Speed = preset.speed
    emitter.Lifetime = preset.lifetime
    emitter.RotSpeed = preset.rotSpeed
    emitter.Acceleration = preset.acceleration
    emitter.SpreadAngle = Vector2.new(0, 180)
    emitter.Enabled = true

    if parent then
        emitter.Parent = parent
    end

    return emitter
end

-- Create a one-time burst effect
function ParticleSystem:Burst(preset, position, parent)
    local part = Instance.new("Part")
    part.Anchored = true
    part.CanCollide = false
    part.Transparency = 1
    part.Position = position
    part.Size = Vector3.new(0.1, 0.1, 0.1)
    part.Parent = parent or workspace

    local emitter = self:CreateEffect(preset, part)
    emitter.Enabled = false
    emitter:Emit(50)

    -- Clean up after effect is done
    delay(5, function()
        part:Destroy()
    end)

    return emitter
end

return ParticleSystem`,
        author: "VFXArtist",
        date: "March 18, 2025",
        category: "visuals"
    }
];
