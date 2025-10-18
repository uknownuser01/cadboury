// Game state management
let gameState = {
    currentScreen: 'landing',
    currentQuestion: 0,
    answers: {},
    attemptsLeft: 3,
    firstAttemptMade: false,
    gameCompleted: false
};

// Screen management
function showScreen(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        gameState.currentScreen = screenId;
    }
}

// Start survey from landing page
function startSurvey() {
    showScreen('question-1');
    gameState.currentQuestion = 1;
}

// Handle question answers and navigation
function nextQuestion(questionNum, answer) {
    // Store the answer
    gameState.answers[`question_${questionNum}`] = answer;
    
    // Navigate to next question or game
    if (questionNum < 5) {
        const nextQuestionId = `question-${questionNum + 1}`;
        showScreen(nextQuestionId);
        gameState.currentQuestion = questionNum + 1;
    } else {
        // All questions answered, start the gift game
        showScreen('gift-game');
        updateAttemptsDisplay();
    }
}

// Update attempts display
function updateAttemptsDisplay() {
    const attemptsElement = document.getElementById('attempts-left');
    if (attemptsElement) {
        attemptsElement.textContent = gameState.attemptsLeft;
    }
}

// Gift box selection logic
function selectGiftBox(boxIndex) {
    if (gameState.gameCompleted) {
        return; // Game already completed
    }
    
    const giftBox = document.querySelectorAll('.gift-box')[boxIndex];
    
    // First attempt should always fail
    if (!gameState.firstAttemptMade) {
        gameState.firstAttemptMade = true;
        gameState.attemptsLeft--;
        
        // Mark box as opened (failed)
        giftBox.classList.add('opened');
        
        // Show empty result screen
        showEmptyResult();
    } else {
        // Second attempt should always win
        gameState.gameCompleted = true;
        
        // Mark box as winner
        giftBox.classList.add('winner');
        
        // Show winning screen with confetti
        setTimeout(() => {
            showWinningScreen();
            createConfetti();
        }, 1000);
    }
}

// Show empty box result
function showEmptyResult() {
    const remainingElement = document.getElementById('remaining-attempts');
    if (remainingElement) {
        remainingElement.textContent = gameState.attemptsLeft;
    }
    showScreen('empty-result');
}

// Try again after empty box
function tryAgain() {
    showScreen('gift-game');
    updateAttemptsDisplay();
}

// Show winning screen
function showWinningScreen() {
    showScreen('winning-screen');
    setTimeout(() => {
        // Sharing progress always resets on win screen re-entry
        resetSharingProgress();
    }, 350);
}

// Create confetti animation
function createConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#6B46C1', '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'];
    
    // Clear existing confetti
    container.innerHTML = '';
    
    // Create 50 confetti pieces
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        
        // Random color
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Random position
        confetti.style.left = Math.random() * 100 + '%';
        
        // Random delay
        confetti.style.animationDelay = Math.random() * 3 + 's';
        
        // Random size
        const size = Math.random() * 8 + 4;
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        
        container.appendChild(confetti);
    }
    
    // Remove confetti after animation
    setTimeout(() => {
        container.innerHTML = '';
    }, 6000);
}

// WhatsApp sharing logic with 10-share tracking
const SHARING_TARGET = 10;
let currentShares = 0;
const progressMessages = [
    { shares: 0, message: "Share with 10 WhatsApp friends - 0/10 completed", action_text: "Click WhatsApp button to start sharing" },
    { shares: 1, message: "Great! Share with 9 more friends - 1/10 completed" },
    { shares: 5, message: "Halfway there! 5 more to go - 5/10 completed" },
    { shares: 9, message: "Almost done! 1 more friend - 9/10 completed" },
    { shares: 10, message: "Perfect! You've shared with 10 friends - 10/10 completed", action_text: "You can now continue to claim your prize" },
];

function getProgressMessage(shares) {
    // Find the highest message for current shares
    let bestMsg = progressMessages[0];
    for (let m of progressMessages) {
        if (shares >= m.shares) bestMsg = m;
    }
    return bestMsg;
}

function updateSharingProgressUI() {
    const fill = document.getElementById("sharing-progress-fill");
    const text = document.getElementById("progress-text");
    const hint = document.getElementById("progress-hint");
    const continueBtn = document.getElementById("continue-btn");
    // Progress percent
    let pct = Math.round((currentShares / SHARING_TARGET) * 100);
    fill.style.width = pct + '%';
    // Animate
    fill.classList.remove('animate');
    void fill.offsetWidth; fill.classList.add('animate');
    // Messaging
    let msg = getProgressMessage(currentShares);
    text.textContent = msg.message;
    if (msg.action_text) {
        hint.textContent = msg.action_text;
    }
    else if (currentShares < SHARING_TARGET) {
        hint.textContent = `Share with ${SHARING_TARGET - currentShares} more friend${SHARING_TARGET-currentShares===1?'':'s'}`;
    } else {
        hint.textContent = "You can now continue to claim your prize";
    }
    // Continue button state
    if (currentShares >= SHARING_TARGET) {
        continueBtn.disabled = false;
        continueBtn.style.background = '#6B46C1';
        continueBtn.style.color = '#fff';
    } else {
        continueBtn.disabled = true;
        continueBtn.style.background = '';
        continueBtn.style.color = '';
    }
}

function shareWhatsApp() {
    if (currentShares >= SHARING_TARGET) return; // No more
    const message = encodeURIComponent(
        "🎉 I just won a Cadbury Gift Box worth ₹499! " +
        "Join this amazing Diwali promotion and win exciting prizes! " +
        "Click here to participate: " + window.location.href
    );
    // Try opening WhatsApp
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        window.open(`whatsapp://send?text=${message}`, '_blank');
    } else {
        window.open(`https://web.whatsapp.com/send?text=${message}`, '_blank');
    }
    // Animate WhatsApp button
    const waBtn = document.querySelector('.btn--whatsapp');
    if (waBtn) {
        waBtn.classList.remove('clicked');
        void waBtn.offsetWidth; waBtn.classList.add('clicked');
    }
    // Increment share count (simulate unique shares)
    currentShares = Math.min(currentShares+1, SHARING_TARGET);
    updateSharingProgressUI();
}

function resetSharingProgress() {
    currentShares = 0;
    updateSharingProgressUI();
}

// Show details collection form
function showDetailsForm() {
    showScreen('details-form');
    setupFormValidation();
}



// Form validation setup
function setupFormValidation() {
    const form = document.getElementById('prize-form');
    const nameField = document.getElementById('user-name');
    const phoneField = document.getElementById('user-phone');
    const addressField = document.getElementById('user-address');
    
    // Real-time validation
    nameField.addEventListener('blur', () => validateName());
    phoneField.addEventListener('input', () => validatePhone());
    phoneField.addEventListener('blur', () => validatePhone());
    addressField.addEventListener('blur', () => validateAddress());
    
    // Form submission
    form.addEventListener('submit', handleFormSubmission);
}

// Validation functions
function validateName() {
    const nameField = document.getElementById('user-name');
    const nameError = document.getElementById('name-error');
    const name = nameField.value.trim();
    
    if (name === '') {
        showFieldError(nameField, nameError, 'Please enter your name');
        return false;
    }
    
    clearFieldError(nameField, nameError);
    return true;
}

function validatePhone() {
    const phoneField = document.getElementById('user-phone');
    const phoneError = document.getElementById('phone-error');
    const phone = phoneField.value.replace(/\D/g, ''); // Remove non-digits
    
    // Auto-format: keep only digits
    phoneField.value = phone;
    
    if (phone.length !== 10) {
        showFieldError(phoneField, phoneError, 'Please enter a valid 10-digit phone number');
        return false;
    }
    
    clearFieldError(phoneField, phoneError);
    return true;
}

function validateAddress() {
    const addressField = document.getElementById('user-address');
    const addressError = document.getElementById('address-error');
    const address = addressField.value.trim();
    
    if (address === '') {
        showFieldError(addressField, addressError, 'Please enter your delivery address');
        return false;
    }
    
    clearFieldError(addressField, addressError);
    return true;
}

// Helper functions for validation UI
function showFieldError(field, errorElement, message) {
    field.classList.add('invalid');
    field.classList.remove('valid');
    errorElement.textContent = message;
    field.parentElement.classList.add('has-error');
}

function clearFieldError(field, errorElement) {
    field.classList.remove('invalid');
    field.classList.add('valid');
    errorElement.textContent = '';
    field.parentElement.classList.remove('has-error');
}

// Form submission handler
function handleFormSubmission(e) {
    e.preventDefault();
    
    // Validate all fields
    const isNameValid = validateName();
    const isPhoneValid = validatePhone();
    const isAddressValid = validateAddress();
    
    if (!isNameValid || !isPhoneValid || !isAddressValid) {
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Collect form data
    const formData = {
        name: document.getElementById('user-name').value.trim(),
        phone: document.getElementById('user-phone').value.trim(),
        address: document.getElementById('user-address').value.trim(),
        timestamp: Date.now()
    };
    
    // Store user data
    gameState.userDetails = formData;
    
    // Simulate form submission delay
    setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        // Show success modal
        showSuccessModal();
        
        // Track completion
        trackEvent('prize_claimed', formData);
    }, 1500);
}

// Success modal functions
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.add('active');
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        closeSuccessModal();
    }, 5000);
}

function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('active');
    
    // Auto-scroll to comments section after modal closes
    setTimeout(() => {
        const commentsSection = document.querySelector('.comments-section');
        if (commentsSection) {
            commentsSection.scrollIntoView({ 
                behavior: 'smooth' 
            });
        }
    }, 300);
}

// Close modal when clicking outside
function setupModalHandlers() {
    const modal = document.getElementById('success-modal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeSuccessModal();
        }
    });
    
    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeSuccessModal();
        }
    });
}

// Initialize the application
function initializeApp() {
    // Show landing screen by default
    showScreen('landing-screen');
    
    // Setup modal handlers
    setupModalHandlers();
    
    // Setup image error handling for chocolate images
    setupImageErrorHandling();

    // Setup sharing progress listeners for win screen
    document.addEventListener('DOMContentLoaded', function() {
        // Sharing progress UI init
        if (document.getElementById('sharing-progress-fill')) {
            resetSharingProgress();
        }
        // WhatsApp click - add handler (overrides inline if needed)
        const waBtn = document.querySelector('.btn--whatsapp');
        if (waBtn) {
            waBtn.onclick = shareWhatsApp;
        }
        // Continue button safety (disable logic)
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            continueBtn.disabled = currentShares < SHARING_TARGET;
        }

        // Add click sound effect simulation
        const buttons = document.querySelectorAll('.btn, .gift-box, .chocolate-option');
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                // Add a small visual feedback
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 100);
            });
        });
    });
}

// Progress bar animation
function animateProgressBar(targetWidth) {
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
        progressBar.style.width = targetWidth + '%';
    }
}

// Add some Easter egg functionality
function addEasterEggs() {
    // Konami code easter egg (up, up, down, down, left, right, left, right, B, A)
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    
    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.code);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
            // Easter egg activated - extra confetti
            createConfetti();
            setTimeout(() => createConfetti(), 1000);
            setTimeout(() => createConfetti(), 2000);
            alert('🎉 Easter egg activated! Extra confetti for you!');
        }
    });
}

// Device detection and responsive adjustments
function handleResponsiveFeatures() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Adjust button sizes for mobile
        document.documentElement.style.setProperty('--mobile-btn-size', '48px');
        
        // Add touch-friendly interactions
        document.body.style.touchAction = 'manipulation';
    }
    
    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);
    });
}

// Performance optimization
function optimizePerformance() {
    // Lazy load animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '50px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.card, .gift-box, .comment');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Analytics simulation (for demo purposes)
function trackEvent(eventName, eventData = {}) {
    console.log(`Event: ${eventName}`, eventData);
    // In a real app, this would send data to analytics service
}

// Track user progress
function trackProgress() {
    trackEvent('survey_started', { timestamp: Date.now() });
    
    // Track when each question is answered
    const originalNextQuestion = nextQuestion;
    nextQuestion = function(questionNum, answer) {
        trackEvent('question_answered', {
            question: questionNum,
            answer: answer,
            timestamp: Date.now()
        });
        return originalNextQuestion(questionNum, answer);
    };
    
    // Track gift box selections
    const originalSelectGiftBox = selectGiftBox;
    selectGiftBox = function(boxIndex) {
        trackEvent('gift_box_selected', {
            boxIndex: boxIndex,
            attempt: gameState.firstAttemptMade ? 2 : 1,
            timestamp: Date.now()
        });
        return originalSelectGiftBox(boxIndex);
    };
}

// Setup image error handling for product images
function setupImageErrorHandling() {
    const chocolateImages = document.querySelectorAll('.chocolate-image');
    chocolateImages.forEach(img => {
        img.addEventListener('error', function() {
            // Create fallback content
            const fallbackDiv = document.createElement('div');
            fallbackDiv.className = 'chocolate-image-fallback';
            fallbackDiv.style.cssText = `
                width: 120px;
                height: 120px;
                border-radius: var(--radius-md);
                margin-bottom: var(--space-12);
                background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--color-white);
                font-weight: bold;
                font-size: 32px;
                border: 2px solid var(--color-border);
                transition: all var(--duration-normal) var(--ease-standard);
                box-shadow: var(--shadow-sm);
            `;
            fallbackDiv.innerHTML = '🍫';
            
            // Replace the broken image with fallback
            this.parentNode.replaceChild(fallbackDiv, this);
            
            console.warn('Failed to load chocolate image:', this.src);
        });
        
        img.addEventListener('load', function() {
            this.classList.add('loaded');
            console.log('Successfully loaded chocolate image:', this.src);
        });
        
        // If image is already cached and loaded
        if (img.complete && img.naturalHeight !== 0) {
            img.classList.add('loaded');
        }
    });
}

// Initialize everything when the page loads
window.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    addEasterEggs();
    handleResponsiveFeatures();
    optimizePerformance();
    trackProgress();
    
    // Add a welcome message in console for developers
    console.log('%c🍫 Cadbury Joy Diwali Gifts 🎁', 
        'font-size: 20px; color: #6B46C1; font-weight: bold;');
    console.log('Welcome to the Cadbury promotional game! Enjoy playing!');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, pause any animations
        trackEvent('page_hidden');
    } else {
        // Page is visible again
        trackEvent('page_visible');
    }
});

// Prevent right-click context menu on gift boxes for better UX
document.addEventListener('contextmenu', function(e) {
    if (e.target.classList.contains('gift-box')) {
        e.preventDefault();
    }
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Enter key can trigger button clicks
    if (e.key === 'Enter' && document.activeElement.classList.contains('btn')) {
        document.activeElement.click();
    }
    
    // Escape key can go back (if applicable)
    if (e.key === 'Escape' && gameState.currentScreen === 'empty-result') {
        tryAgain();
    }
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showScreen,
        startSurvey,
        nextQuestion,
        selectGiftBox,
        shareWhatsApp,
        gameState
    };
}
