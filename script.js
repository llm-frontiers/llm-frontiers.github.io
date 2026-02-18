/**
 * LLM Frontiers Workshop Website
 * JavaScript for navigation and interactions
 */

(function() {
    'use strict';

    // ===========================
    // Mobile Navigation Toggle
    // ===========================

    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');

            // Animate hamburger menu
            this.classList.toggle('active');
        });

        // Close menu when clicking a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target) || navToggle.contains(event.target);
            if (!isClickInsideNav && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }

    // ===========================
    // Smooth Scrolling
    // ===========================

    // Add smooth scrolling to all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===========================
    // Navbar Scroll Effect
    // ===========================

    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Add shadow on scroll
        if (scrollTop > 50) {
            navbar.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }

        lastScrollTop = scrollTop;
    });

    // ===========================
    // Active Section Highlighting
    // ===========================

    function highlightActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightActiveSection);
    window.addEventListener('load', highlightActiveSection);

    // ===========================
    // Fade-in Animation on Scroll
    // ===========================

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeInObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Apply fade-in to cards and sections
    const fadeElements = document.querySelectorAll('.speaker-card, .organizer-card, .schedule-item');
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeInObserver.observe(el);
    });

    // ===========================
    // Email Copy Functionality
    // ===========================

    const emailLinks = document.querySelectorAll('.speaker-email, .organizer-email');

    emailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Show a subtle tooltip on click
            const email = this.textContent;

            // Optional: Add copy to clipboard functionality
            if (e.shiftKey) {
                e.preventDefault();
                navigator.clipboard.writeText(email).then(() => {
                    const originalText = this.textContent;
                    this.textContent = 'Copied!';
                    setTimeout(() => {
                        this.textContent = originalText;
                    }, 1500);
                });
            }
        });
    });

    // ===========================
    // Print Styles Helper
    // ===========================

    window.addEventListener('beforeprint', function() {
        // Expand all collapsed sections if any
        console.log('Preparing to print...');
    });

    // ===========================
    // Accessibility: Skip to Content
    // ===========================

    // Add skip to content link for keyboard navigation
    const skipLink = document.createElement('a');
    skipLink.href = '#about';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--primary-blue);
        color: white;
        padding: 8px;
        text-decoration: none;
        z-index: 9999;
    `;

    skipLink.addEventListener('focus', function() {
        this.style.top = '0';
    });

    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);

    // ===========================
    // Dynamic Theme Switcher
    // ===========================

    const themeToggle = document.getElementById('themeToggle');
    const themePalette = document.getElementById('themePalette');

    // Dynamic color cycling over time
    const themes = ['dusk', 'dawn', 'twilight', 'sage', 'rose', 'slate'];
    let currentThemeIndex = 4; // default: rose
    let autoThemeInterval = null;
    let isAutoThemeEnabled = true;

    if (themeToggle && themePalette) {
        // Check if user previously disabled auto-theme
        const autoThemeDisabled = localStorage.getItem('llm-frontiers-auto-theme-disabled');
        if (autoThemeDisabled === 'true') {
            isAutoThemeEnabled = false;
        }

        // Load saved theme or apply default rose
        const savedTheme = localStorage.getItem('llm-frontiers-theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
            currentThemeIndex = themes.indexOf(savedTheme);
            if (currentThemeIndex === -1) currentThemeIndex = 4;
            updateActiveSwatchUI(savedTheme);
        } else {
            // Apply rose as default
            document.body.setAttribute('data-theme', 'rose');
            updateActiveSwatchUI('rose');
        }

        // Start auto theme cycling (every 30 seconds)
        function startAutoThemeCycling() {
            if (!isAutoThemeEnabled) return;

            autoThemeInterval = setInterval(function() {
                currentThemeIndex = (currentThemeIndex + 1) % themes.length;
                const nextTheme = themes[currentThemeIndex];

                if (nextTheme === 'dusk') {
                    document.body.removeAttribute('data-theme');
                } else {
                    document.body.setAttribute('data-theme', nextTheme);
                }

                updateActiveSwatchUI(nextTheme);
            }, 10000); // Change theme every 10 seconds
        }

        // Update the active swatch UI
        function updateActiveSwatchUI(theme) {
            const swatches = themePalette.querySelectorAll('.theme-swatch');
            swatches.forEach(function(s) {
                s.classList.toggle('active', s.getAttribute('data-theme') === theme);
            });
        }

        // Stop auto cycling when user manually selects a theme
        function stopAutoThemeCycling() {
            if (autoThemeInterval) {
                clearInterval(autoThemeInterval);
                autoThemeInterval = null;
            }
        }

        // Start the automatic theme cycling
        startAutoThemeCycling();

        // Toggle palette visibility
        themeToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            themePalette.classList.toggle('active');
        });

        // Handle swatch clicks
        var swatches = themePalette.querySelectorAll('.theme-swatch');
        swatches.forEach(function(swatch) {
            swatch.addEventListener('click', function(e) {
                e.stopPropagation();
                var theme = this.getAttribute('data-theme');

                // User manually selected a theme, stop auto-cycling
                stopAutoThemeCycling();
                isAutoThemeEnabled = false;
                localStorage.setItem('llm-frontiers-auto-theme-disabled', 'true');

                // Update active swatch
                swatches.forEach(function(s) { s.classList.remove('active'); });
                this.classList.add('active');

                // Apply theme
                if (theme === 'dusk') {
                    document.body.removeAttribute('data-theme');
                    localStorage.removeItem('llm-frontiers-theme');
                } else {
                    document.body.setAttribute('data-theme', theme);
                    localStorage.setItem('llm-frontiers-theme', theme);
                }

                // Update current index
                currentThemeIndex = themes.indexOf(theme);

                // Close palette after selection
                setTimeout(function() {
                    themePalette.classList.remove('active');
                }, 300);
            });
        });

        // Close palette when clicking outside
        document.addEventListener('click', function(e) {
            if (!themePalette.contains(e.target) && !themeToggle.contains(e.target)) {
                themePalette.classList.remove('active');
            }
        });
    }

    // ===========================
    // Console Easter Egg
    // ===========================

    console.log('%c2026 Large Language Model Workshop', 'color: #3B4F6B; font-size: 24px; font-weight: bold;');
    console.log('%cRice University — March 13, 2026', 'color: #5A7FA0; font-size: 16px;');
    console.log('Interested in LLM research? Join us at Rice University!');

})();
