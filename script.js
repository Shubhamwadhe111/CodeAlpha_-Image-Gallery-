/**
 * ==========================================================================
 * SCRIPT.JS — RESPONSIVE IMAGE GALLERY & LIGHTBOX INTERACTION LOGIC
 * ==========================================================================
 * 
 * Demonstrates:
 * - HTML & CSS layout integration
 * - Pure Vanilla JavaScript navigation & state management
 * - Dynamic Category Filtering (All, Nature, Architecture, Travel, Animals)
 * - Lightbox modal view with Next/Previous, Close, and Counter
 * - Full Keyboard Support (ESC to close, Left/Right arrows to navigate)
 * - Mobile Menu Navigation Toggle
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. DOM SELECTORS
    // ----------------------------------------------------------------------
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryCards = Array.from(document.querySelectorAll('.gallery-card'));
    
    // Lightbox Modal Elements
    const lightbox = document.getElementById('lightbox');
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxCategory = document.getElementById('lightbox-category');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    // Mobile Navigation & Header Controls
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const ctaButton = document.getElementById('cta-view-gallery');

    // State Management
    let visibleCards = [...galleryCards]; // Array of currently displayed cards
    let currentIndex = 0; // Active index inside visibleCards array

    // ----------------------------------------------------------------------
    // 2. IMAGE ERROR FALLBACK (GUARANTEES NO BROKEN IMAGES)
    // ----------------------------------------------------------------------
    const fallbackImage = 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1000&q=80';

    galleryCards.forEach(card => {
        const img = card.querySelector('img');
        if (img) {
            img.onerror = () => {
                img.src = fallbackImage;
                img.setAttribute('data-large', fallbackImage);
            };
        }
    });

    if (lightboxImg) {
        lightboxImg.onerror = () => {
            lightboxImg.src = fallbackImage;
        };
    }

    // ----------------------------------------------------------------------
    // 3. CATEGORY FILTERING LOGIC
    // ----------------------------------------------------------------------
    /**
     * Filters the gallery cards according to the chosen category
     * @param {string} filterValue - The category filter selected ('all', 'nature', etc.)
     */
    function filterGallery(filterValue) {
        visibleCards = [];

        galleryCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const matchesCategory = filterValue === 'all' || cardCategory === filterValue;

            if (matchesCategory) {
                // Show matching card with smooth animation
                card.classList.remove('hide');
                card.classList.remove('fade-out');
                card.classList.add('fade-in');
                visibleCards.push(card);
            } else {
                // Hide non-matching card
                card.classList.remove('fade-in');
                card.classList.add('fade-out');

                setTimeout(() => {
                    if (card.classList.contains('fade-out')) {
                        card.classList.add('hide');
                    }
                }, 300);
            }
        });
    }

    // Filter button click event listeners
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active styling on filter buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');
            filterGallery(filterValue);
        });
    });

    // ----------------------------------------------------------------------
    // 4. LIGHTBOX MODAL NAVIGATION & UPDATES
    // ----------------------------------------------------------------------
    /**
     * Updates lightbox content to reflect the item at `index` in `visibleCards`
     * @param {number} index - Index in the visibleCards array
     */
    function updateLightboxContent(index) {
        if (visibleCards.length === 0) return;

        const targetCard = visibleCards[index];
        const imgElement = targetCard.querySelector('.card-image-wrapper img');
        const largeImgUrl = imgElement.getAttribute('data-large') || imgElement.getAttribute('src');
        const altText = imgElement.getAttribute('alt') || 'Gallery Image';
        const titleText = targetCard.querySelector('.card-title')?.textContent || altText;
        const categoryText = targetCard.getAttribute('data-category') || 'Gallery';

        // Add fading effect during image transition
        lightboxImg.classList.add('changing');

        setTimeout(() => {
            lightboxImg.src = largeImgUrl;
            lightboxImg.alt = altText;
            lightboxTitle.textContent = titleText;
            lightboxCategory.textContent = categoryText.charAt(0).toUpperCase() + categoryText.slice(1);
            
            // Dynamic Counter (Updates dynamically based on current filtered view)
            lightboxCounter.textContent = `${index + 1} / ${visibleCards.length}`;

            lightboxImg.classList.remove('changing');
        }, 150);
    }

    /**
     * Opens Lightbox modal at given visible card index
     * @param {number} index - Index within visibleCards
     */
    function openLightbox(index) {
        if (index < 0 || index >= visibleCards.length) return;
        currentIndex = index;
        updateLightboxContent(currentIndex);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    }

    /**
     * Closes the Lightbox modal
     */
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore background scroll
    }

    /**
     * Navigates to the Next Image in the active filtered list (with wrap-around)
     */
    function showNextImage() {
        if (visibleCards.length === 0) return;
        currentIndex = (currentIndex + 1) % visibleCards.length;
        updateLightboxContent(currentIndex);
    }

    /**
     * Navigates to the Previous Image in the active filtered list (with wrap-around)
     */
    function showPrevImage() {
        if (visibleCards.length === 0) return;
        currentIndex = (currentIndex - 1 + visibleCards.length) % visibleCards.length;
        updateLightboxContent(currentIndex);
    }

    // Attach click events to each gallery card
    galleryCards.forEach(card => {
        card.addEventListener('click', () => {
            // Find current card's index within visibleCards
            const indexInVisible = visibleCards.indexOf(card);
            if (indexInVisible !== -1) {
                openLightbox(indexInVisible);
            }
        });
    });

    // Lightbox Control Listeners
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxOverlay.addEventListener('click', closeLightbox);
    
    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        showNextImage();
    });

    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevImage();
    });

    // ----------------------------------------------------------------------
    // 5. KEYBOARD ACCESSIBILITY (ESC, LEFT, RIGHT ARROWS)
    // ----------------------------------------------------------------------
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowRight') {
            showNextImage();
        } else if (e.key === 'ArrowLeft') {
            showPrevImage();
        }
    });

    // ----------------------------------------------------------------------
    // 6. MOBILE NAVIGATION MENU TOGGLE
    // ----------------------------------------------------------------------
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu on clicking any navigation link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');

                // Update active navigation link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    // ----------------------------------------------------------------------
    // 7. CTA BUTTON SMOOTH SCROLL HANDLER
    // ----------------------------------------------------------------------
    if (ctaButton) {
        ctaButton.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = document.getElementById('gallery');
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});
