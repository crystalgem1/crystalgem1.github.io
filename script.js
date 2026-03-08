// -- Data -- //
const serverIp = "gearbound.exphost.net";
let animationFrameId = null;
let galleryInterval = 0;
let isMenuOpen = false;

function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    const hamburger = document.getElementById('hamburger-menu');
    const dropdown = document.getElementById('drop-down');
    if (hamburger) hamburger.classList.toggle('active', isMenuOpen);
    if (dropdown) dropdown.classList.toggle('active', isMenuOpen);
}

// Updated with 'align' parameter (defaults to 'start', but links can pass 'center')
function scrollToSection(sectionId, align = 'start') {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: align });
    }
    if (isMenuOpen) toggleMenu(); // Close mobile menu if open
}

// Teams Data
const teamsData = [
    {
        name: "FoxyTown",
        color: "#E38839", // Brass
        members: ["port0001", "XicefireboyX", "Gamingfoxy81", "didamorte", "xPkz_", "TomReh", "Krumist_", "Warri0rDan", "AnderZytolga"]
    },
    {
        name: "Anchor",
        color: "#bf70bc", // Modrinth Green
        members: ["PreChecked", "AsealGuy", "D505"]
    }
];

// Gallery States
let isGalleryPaused = false;
let isGalleryExpanded = false;
let scrollVelocity = 0;
let isHoveringGallery = false;
let autoScrollTimeout = 0;
const AUTO_RESUME_DELAY = 4000;

const galleryData = {
    "Placeholder": [
        {
            src: "assets/screenshots/placeholder/2026-02-03_07.24.47.avif",
            title: "Cave",
            desc: "Shader: Eclipse <br> placeholder image for community made images"
        },
        {
            src: "assets/screenshots/placeholder/2026-02-03_07.29.29.avif",
            title: "Ancient city",
            desc: "Shader: Eclipse <br> placeholder image for community made images"
        },
        {
            src: "assets/screenshots/placeholder/2026-02-03_07.30.48.avif",
            title: "the Nether!",
            desc: "Shader: Eclipse <br> placeholder image for community made images"
        },
        {
            src: "assets/screenshots/placeholder/2026-02-03_07.31.02.avif",
            title: "A Cozy Place",
            desc: "Shader: Eclipse <br> placeholder image for community made images"
        },
        {
            src: "assets/screenshots/placeholder/2026-02-03_07.33.06.avif",
            title: "Spooky Scary Skelleton",
            desc: "Shader: Eclipse <br> placeholder image for community made images"
        },
        {
            src: "assets/screenshots/placeholder/2026-02-03_07.35.26.avif",
            title: "Epic end fight soon?",
            desc: "Shader: Eclipse <br> placeholder image for community made images"
        },
        {
            src: "assets/screenshots/placeholder/2026-02-03_07.38.01.avif",
            title: "End citys from a long time ago",
            desc: "Shader: Eclipse <br> placeholder image for community made images"
        },
        {
            src: "assets/screenshots/placeholder/2026-02-03_13.59.39.avif",
            title: "A Cold night",
            desc: "Shader: Eclipse <br> placeholder image for community made images"
        },
        {
            src: "assets/screenshots/placeholder/2026-02-04_03.47.03.avif",
            title: "Caves",
            desc: "Looks good even in vanilla <br> placeholder image for community made images"
        },
        {
            src: "assets/screenshots/placeholder/2026-02-04_03.55.40.avif",
            title: "A Undrground Eco System",
            desc: "Shader: Eclipse <br> placeholder image for community made images"
        },
        {
            src: "assets/screenshots/placeholder/2026-02-04_04.00.39.avif",
            title: "???",
            desc: "Shader: Eclipse <br> placeholder image for community made images"
        },
        {
            src: "assets/screenshots/placeholder/2026-02-16_10.13.44.avif",
            title: "Another Night Survived!",
            desc: "Shader: Eclipse <br> placeholder image for community made images"
        },
        {
            src: "assets/screenshots/placeholder/2026-02-16_10.22.03.avif",
            title: "Desert",
            desc: "Shader: Eclipse <br> placeholder image for community made images"
        }
    ],
    "Terrain Gen": [],
    "Player Builds": []
};

let currentCategory = Object.keys(galleryData)[0];

// @GEARRS @INIT
function initGears() {
    const gearLeft = document.getElementById('gearLeft');
    const gearRight = document.getElementById('gearRight');

    if (!gearLeft || !gearRight) return;

    // @GEAR @CONFIG
    const parallaxSpeed = 0.35;
    const baseSpeed = 0.02;
    const scrollInputMult = 0.002;
    const friction = 0.993;

    let totalScrollRotation = 0;
    let rotationalVelocity = 0;
    // Now reading directly from window.scrollY since article scroller is gone
    let lastScrollY = window.scrollY;

    const animate = () => {
        const currentScrollY = window.scrollY;
        const deltaY = currentScrollY - lastScrollY;
        lastScrollY = currentScrollY;

        rotationalVelocity += Math.abs(deltaY) * scrollInputMult;
        rotationalVelocity *= friction;
        totalScrollRotation += rotationalVelocity;
        const rotationL = (performance.now() * baseSpeed) + totalScrollRotation;
        const rotationR = -rotationL;
        const moveY = -currentScrollY * parallaxSpeed;

        gearLeft.style.transform = `translateY(${moveY}px) rotate(${rotationL}deg)`;
        gearRight.style.transform = `translateY(${moveY}px) rotate(${rotationR}deg)`;

        animationFrameId = requestAnimationFrame(animate);
    };
    animate();
}

// @SERVER @STATUS @INIT
function initServerStatus() {
    fetch(`https://api.mcsrvstat.us/3/${serverIp}`)
        .then(response => response.json())
        .then(data => {
            const statusDiv = document.getElementById("server-status");
            const playerContainer = document.getElementById("player-container");

            if (!statusDiv || !playerContainer) return;

            if (data.online) {
                let latencyHtml = "";
                if (data.debug && typeof data.debug.ping === 'number') {
                    latencyHtml = `<p class="info-text">Ping: ${data.debug.ping}ms</p>`;
                }

                statusDiv.innerHTML = `<div class="status-line online"><span>●</span> Online</div>${latencyHtml}<p class="info-text">Players: <strong>${data.players.online}</strong> / ${data.players.max}</p><p class="info-text">Version: ${data.protocol?.name || data.version}</p>`;

                if (data.players.list && data.players.list.length > 0) {
                    let playersHtml = '<div class="player-list">';
                    data.players.list.forEach(player => {
                        const avatarUrl = `https://mc-heads.net/avatar/${player.name}/48`;
                        playersHtml += `<div class="player-item"><img src="${avatarUrl}" class="player-head" alt="${player.name}" onerror="this.src='https://mc-heads.net/avatar/MHF_Steve/48'"><span class="player-name" title="${player.name}">${player.name}</span></div>`;
                    });
                    playersHtml += '</div>';
                    playerContainer.innerHTML = '<div class="player-list-header">Who is online</div>' + playersHtml;
                } else {
                    playerContainer.innerHTML = '<p class="info-text" style="margin-top:15px; font-style:italic;">No engineers on site</p>';
                }
            } else {
                statusDiv.innerHTML = '<div class="status-line offline">❌ Offline</div>';
                playerContainer.innerHTML = '';
            }
        })
        .catch(error => {
            const statusDiv = document.getElementById("server-status");
            if (statusDiv) {
                statusDiv.innerHTML = '<span style="color:#f16436">Failed to load satellite data.</span>';
            }
            console.error("Error fetching status:", error);
        });
}

// @COPY @IP @INIT
function initCopyButton() {
    const btn = document.querySelector('.copy-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(serverIp).then(() => {
                const originalText = btn.innerText;
                btn.innerText = 'COPIED!';
                btn.style.borderColor = "#30b27b";
                btn.style.color = "#30b27b";
                btn.style.background = "#0e0e0e";

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.borderColor = "";
                    btn.style.color = "";
                    btn.style.background = "";
                }, 2000);
            }).catch(console.error);
        });
    }
}

// @TEAMS
function renderTeams() {
    const container = document.getElementById('teams-grid');
    if (!container) return;

    let html = '';
    teamsData.forEach(team => {
        let membersHtml = '<div class="player-list">';
        team.members.forEach(member => {
            const avatarUrl = `https://mc-heads.net/avatar/${member}/48`;
            membersHtml += `
                <div class="player-item">
                    <img src="${avatarUrl}" class="player-head" alt="${member}" onerror="this.src='https://mc-heads.net/avatar/MHF_Steve/48'">
                    <span class="player-name" title="${member}">${member}</span>
                </div>`;
        });
        membersHtml += '</div>';
        html += `
            <div class="team-card" style="border-color: ${team.color}40;">
                <h3 class="team-name" style="color: ${team.color}; border-color: ${team.color}66;">${team.name}</h3>
                ${membersHtml}
            </div>`;
    });
    container.innerHTML = html;
}

// @GALLERY
function renderGallery() {
    const container = document.getElementById('gallery-track');
    const track = document.getElementById('gallery-track');

    if (!container || !track) return;

    const renderSet = (list) => {
        return list.map(img => `<div class="gallery-item"><img src="${img.src}" alt="${img.title}" loading="lazy"><div class="gallery-caption"><h4>${img.title}</h4><p>${img.desc}</p></div></div>`).join('');
    };

    if (isGalleryExpanded) {
        const currentImages = galleryData[currentCategory] || [];
        container.innerHTML = renderSet(currentImages);
    } else {
        let allImages = [];
        Object.values(galleryData).forEach((imageArray) => {
            allImages = allImages.concat(imageArray);
        });
        container.innerHTML = renderSet(allImages) + renderSet(allImages) + renderSet(allImages);
    }

    const newTrack = track.cloneNode(true);
    track.parentNode?.replaceChild(newTrack, track);

    newTrack.addEventListener('scroll', () => handleGalleryScroll());
    newTrack.addEventListener('mouseenter', () => isHoveringGallery = true);
    newTrack.addEventListener('mouseleave', () => isHoveringGallery = false);

    newTrack.addEventListener('wheel', (e) => {
        if (!isGalleryExpanded) {
            e.preventDefault();
            newTrack.style.scrollBehavior = 'auto';
            scrollVelocity += e.deltaY * 0.5;
            handleUserInteraction();
        }
    }, { passive: false });

    newTrack.addEventListener('click', (e) => {
        const target = e.target.closest('.gallery-item');
        if (target && newTrack.contains(target)) {
            handleUserInteraction();
            const img = target.querySelector('img');

            if (!isGalleryExpanded) {
                const center = target.offsetLeft + (target.offsetWidth / 2) - (newTrack.clientWidth / 2);
                newTrack.scrollTo({ left: center, behavior: 'smooth' });
                scrollVelocity = 0;
                if (img) openLightbox(img.src);
            } else {
                if (img) openLightbox(img.src);
            }
        }
    });

    if (!isGalleryExpanded) {
        setTimeout(() => {
            newTrack.scrollLeft = newTrack.scrollWidth / 3;
            updateGalleryScaling();
            startGalleryAutoScroll();
        }, 100);
    }
}

// @GALLERY @INIT @MOVEMENT
function initGalleryMomentum() {
    const animate = () => {
        const track = document.getElementById('gallery-track');
        if (track) {
            if (!isGalleryExpanded && Math.abs(scrollVelocity) > 0.5) {
                track.style.scrollBehavior = 'auto';
                track.scrollLeft += scrollVelocity;
                scrollVelocity *= 0.92;
            } else if (Math.abs(scrollVelocity) <= 0.5 && scrollVelocity !== 0) {
                scrollVelocity = 0;
                track.style.scrollBehavior = '';
                snapToNearest(track);
            }
        }
        requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
}

// @GALLERY @SCROLL
function handleGalleryScroll() {
    const track = document.getElementById('gallery-track');
    if (!track) return;
    const singleSetWidth = track.scrollWidth / 3;
    if (track.scrollLeft < 50) {
        track.scrollLeft += singleSetWidth;
    } else if (track.scrollLeft > singleSetWidth * 2) {
        track.scrollLeft -= singleSetWidth;
    }
    updateGalleryScaling();
}

function updateGalleryScaling() {
    if (isGalleryExpanded) return;
    const track = document.getElementById('gallery-track');
    if (!track) return;

    const items = track.querySelectorAll('.gallery-item');
    const centerPoint = track.scrollLeft + (track.clientWidth / 2);

    items.forEach(item => {
        const itemCenter = item.offsetLeft + (item.offsetWidth / 2);
        const distance = Math.abs(centerPoint - itemCenter);
        const maxDist = 600;

        let scale = 0.85;
        let opacity = 0.5;

        if (distance < maxDist) {
            const ratio = 1 - (distance / maxDist);
            scale = 0.85 + (0.30 * ratio);
            opacity = 0.5 + (0.5 * ratio);
        }

        if (distance < 200) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }

        item.style.transform = `scale(${scale})`;
        item.style.opacity = opacity.toString();
    });
}

// @GALLERY @AUTO @SCROLL
function startGalleryAutoScroll() {
    if (galleryInterval) clearInterval(galleryInterval);

    galleryInterval = setInterval(() => {
        if (!isGalleryPaused && !isGalleryExpanded && Math.abs(scrollVelocity) < 1) {
            const track = document.getElementById('gallery-track');
            if (!track) return;

            const items = track.querySelectorAll('.gallery-item');
            if (items.length === 0) return;

            let bestIndex = 0;
            let minDistance = Infinity;
            const centerPoint = track.scrollLeft + (track.clientWidth / 2);

            items.forEach((item, index) => {
                const itemCenter = item.offsetLeft + (item.offsetWidth / 2);
                const dist = Math.abs(centerPoint - itemCenter);
                if (dist < minDistance) {
                    minDistance = dist;
                    bestIndex = index;
                }
            });

            let nextIndex = bestIndex + 1;
            if (nextIndex >= items.length) nextIndex = 0;

            const targetItem = items[nextIndex];
            if (targetItem) {
                const scrollPos = targetItem.offsetLeft + (targetItem.offsetWidth / 2) - (track.clientWidth / 2);
                track.scrollTo({ left: scrollPos, behavior: 'smooth' });
            }
        }
    }, 5000);
}

// @GALLERY @SNAP
function snapToNearest(track) {
    const items = track.querySelectorAll('.gallery-item');
    let bestItem = null;
    let minDist = Infinity;
    const centerPoint = track.scrollLeft + (track.clientWidth / 2);

    for (const item of items) {
        const itemCenter = item.offsetLeft + (item.offsetWidth / 2);
        const dist = Math.abs(centerPoint - itemCenter);
        if (dist < minDist) {
            minDist = dist;
            bestItem = item;
        }
    }

    if (bestItem) {
        const targetPos = bestItem.offsetLeft + (bestItem.offsetWidth / 2) - (track.clientWidth / 2);
        track.scrollTo({ left: targetPos, behavior: 'smooth' });
    }
}

function handleUserInteraction() {
    clearInterval(galleryInterval);
    if (isGalleryPaused) return;
    clearTimeout(autoScrollTimeout);
    autoScrollTimeout = setTimeout(() => {
        startGalleryAutoScroll();
    }, AUTO_RESUME_DELAY);
}

// @INIT @TABS
function initTabs() {
    const tabBtns = document.querySelectorAll('#tab-btn-list .tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target;

            // Remove active classes from tab buttons in this list
            if (target.parentElement) {
                target.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            }
            target.classList.add('active');

            // Remove active classes from all tab contents
            document.querySelectorAll('#help .tab-content').forEach(c => c.classList.remove('active'));
            
            // Activate by data-tab
            const id = target.getAttribute('data-tab');
            const content = document.getElementById(id);
            if (content) content.classList.add('active');
        });
    });
}

// @DOWNLOAD @DROPDOWN @TOGGLE
function toggleDownloadDropdown(id, event) {
    event.preventDefault();
    const dropdown = document.getElementById(id);
    const isActive = dropdown.classList.contains('active');

    // Close all other dropdowns
    document.querySelectorAll('.dl-dropdown').forEach(el => el.classList.remove('active'));

    // Toggle the clicked one
    if (!isActive && dropdown) {
        dropdown.classList.add('active');
    }
    event.stopPropagation();
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.download-wrapper')) {
        document.querySelectorAll('.dl-dropdown').forEach(el => el.classList.remove('active'));
    }
});

// @GALLERY @PAUSE
function toggleGalleryPause() {
    isGalleryPaused = !isGalleryPaused;
    const btn = document.getElementById('galleryPauseBtn');
    if (!btn) return;

    if (isGalleryPaused) {
        btn.classList.add('active');
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 2l10 5-10 5z"/></svg>';
        clearInterval(galleryInterval);
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="2" width="3" height="10" rx="1" /><rect x="8" y="2" width="3" height="10" rx="1" /></svg>';
        startGalleryAutoScroll();
    }
}

// @GALLERY @EXPAND
function toggleGalleryExpand() {
    const btn = document.getElementById('galleryExpandBtn');
    const tabsContainer = document.getElementById('gallery-sub-tabs');
    isGalleryExpanded = !isGalleryExpanded;

    if (!btn) return;

    if (isGalleryExpanded) {
        btn.classList.add('active');
        if (tabsContainer) tabsContainer.style.display = 'flex';
        renderGallery();

        setTimeout(() => {
            const track = document.getElementById('gallery-track');
            if (track) {
                track.classList.add('expanded');
                const items = track.querySelectorAll('.gallery-item');
                items.forEach(item => {
                    item.style.transform = '';
                    item.style.opacity = '1';
                    item.classList.remove('active');
                });
            }
        }, 50);
    } else {
        btn.classList.remove('active');
        if (tabsContainer) tabsContainer.style.display = 'none';

        const track = document.getElementById('gallery-track');
        if (track) track.classList.remove('expanded');
        renderGallery();
    }
}

function filterGallery(category) {
    currentCategory = category;
    const tabs = document.querySelectorAll('#gallery-sub-tabs .tab-btn');

    tabs.forEach(tab => {
        if (tab.getAttribute('data-cat') === category) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    renderGallery();

    setTimeout(() => {
        const track = document.getElementById('gallery-track');
        if (track) {
            const items = track.querySelectorAll('.gallery-item');
            items.forEach(item => {
                item.style.transform = '';
                item.style.opacity = '1';
            });
        }
    }, 10);
}

function openLightbox(src) {
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if (lightbox && lightboxImg) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('gallery-lightbox');
    if (lightbox) lightbox.classList.remove('active');
}

function renderTabs() {
    const tabsContainer = document.getElementById('gallery-sub-tabs');
    if (!tabsContainer) return;
    tabsContainer.innerHTML = '';

    Object.keys(galleryData).forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'tab-btn';

        if (currentCategory === category) {
            btn.classList.add('active');
        }
        btn.setAttribute('data-cat', category);
        btn.innerText = category;
        btn.addEventListener('click', () => {
            filterGallery(category);
        });

        tabsContainer.appendChild(btn);
    });
}

// INITIALIZE ALL
document.addEventListener('DOMContentLoaded', () => {
    initGears();
    initGalleryMomentum();
    renderTeams();
    renderTabs();
    renderGallery();
    initServerStatus();
    initCopyButton();
    initTabs();

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeLightbox();
        }
    });
});

window.addEventListener('unload', () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    if (galleryInterval) {
        clearInterval(galleryInterval);
    }
});