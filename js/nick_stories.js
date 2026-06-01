/*
 * Nick of All Trades - Author Landing Page
 * Clean Horizontal Wheel & Mobile Touch Capture Interaction Logic for Stories
 */

$(document).ready(function () {
    let scrollPosition = 0;
    
    // Variables to capture mobile touch metrics
    let touchStartX = 0;
    let initialScrollPosition = 0;

    $(".story-select-btn").on("click", function(e) {
        e.preventDefault();
        const targetStoryToken = $(this).attr("data-story");

        $(".story-instance-data").hide();
        scrollPosition = 0;
        
        const activeSection = document.querySelector(`#${targetStoryToken}-data .nick-story-section`);
        if (activeSection) {
            gsap.set(activeSection, { x: 0 });
        }

        $(`#${targetStoryToken}-data`).show();
        
        // Open the modal by transforming its layout display to flex smoothly via GSAP
        gsap.fromTo("#story-reader", 
            { opacity: 0, display: "none" },
            { opacity: 1, display: "flex", duration: 0.4 }
        );

        bindHorizontalNavigation(targetStoryToken);
    });

    function bindHorizontalNavigation(storyId) {
        const container = document.querySelector(".nick-story-scroller-container");
        const track = document.querySelector(`#${storyId}-data .nick-story-section`);
        
        if (!container || !track) return;

        // Reset previous event listeners to avoid memory leaks or double-binding
        $("#story-reader").off("wheel touchstart touchmove");

        // --- 1. DESKTOP/TRACKPAD MOUSE WHEEL CONTROL ---
        $("#story-reader").on("wheel", function(e) {
            e.preventDefault();
            
            const maxScrollDelta = track.scrollWidth - container.clientWidth;
            const wheelSpeedMultiplier = 2.5; 
            
            const delta = e.originalEvent.deltaY || e.originalEvent.detail || -e.originalEvent.wheelDelta;
            scrollPosition += delta * wheelSpeedMultiplier;
            
            if (scrollPosition < 0) scrollPosition = 0;
            if (scrollPosition > maxScrollDelta) scrollPosition = maxScrollDelta;

            gsap.to(track, {
                x: -scrollPosition,
                duration: 0.3,
                ease: "power2.out",
                overwrite: "auto" // Prevents animation conflicts during aggressive scrolling
            });
        });

        // --- 2. SMARTPHONE TOUCH CAPTURE SYSTEM ---
        $("#story-reader").on("touchstart", function(e) {
            // Store the initial touch point and historical tracking spot
            touchStartX = e.originalEvent.touches[0].clientX;
            initialScrollPosition = scrollPosition;
        });

        $("#story-reader").on("touchmove", function(e) {
            // Prevent standard mobile elastic vertical background scrolling
            e.preventDefault();
            
            const maxScrollDelta = track.scrollWidth - container.clientWidth;
            const currentTouchX = e.originalEvent.touches[0].clientX;
            
            // Calculate swipe vector distance (Inverted to mimic dragging the page)
            const touchDeltaX = touchStartX - currentTouchX;
            
            // Apply a speed factor for responsive swiping on short viewports
            scrollPosition = initialScrollPosition + (touchDeltaX * 1.5);
            
            if (scrollPosition < 0) scrollPosition = 0;
            if (scrollPosition > maxScrollDelta) scrollPosition = maxScrollDelta;

            gsap.to(track, {
                x: -scrollPosition,
                duration: 0.2, // Slightly snappier duration for mobile touch-responsiveness
                ease: "power1.out",
                overwrite: "auto"
            });
        });
    }

    $("#close-story-reader").on("click", function() {
        $("#story-reader").off("wheel touchstart touchmove");
        gsap.to("#story-reader", {
            opacity: 0,
            display: "none",
            duration: 0.3
        });
    });
});