/*
 * Nick of All Trades - Author Landing Page
 * Discrete 3D Book Page Turning Transition System
 */

$(document).ready(function () {
    let pages = [];
    let activePageIndex = 0;
    let isAnimating = false;
    
    // Variables for smartphone touch capture
    let touchStartX = 0;
    let touchStartY = 0;
    const swipeThreshold = 50; // Minimal pixel swipe distance required to turn pages

    $(".story-select-btn").on("click", function(e) {
        e.preventDefault();
        const targetStoryToken = $(this).attr("data-story");

        $(".story-instance-data").hide();
        $(`#${targetStoryToken}-data`).show();

        // Target the individual page elements inside this specific active story module
        pages = document.querySelectorAll(`#${targetStoryToken}-data .nick-page-panel`);
        activePageIndex = 0;
        isAnimating = false;

        // Establish native stacked visibility using index z-layers
        pages.forEach((page, index) => {
            gsap.set(page, {
                xPercent: 0,
                rotationY: 0,
                opacity: 1,
                display: "block",
                zIndex: pages.length - index
            });
        });
        
        // Render modal visibility smoothly
        gsap.fromTo("#story-reader", 
            { opacity: 0, display: "none" },
            { opacity: 1, display: "flex", duration: 0.4 }
        );

        bindDiscreteBookNavigation();
    });

    function changePage(direction) {
        if (isAnimating) return;

        // Going Forward (Turn Page Left)
        if (direction === "next" && activePageIndex < pages.length - 1) {
            isAnimating = true;
            const currentPage = pages[activePageIndex];

            gsap.to(currentPage, {
                rotationY: -85,
                xPercent: -100,
                opacity: 0,
                duration: 0.65,
                ease: "power2.inOut",
                onComplete: () => {
                    gsap.set(currentPage, { display: "none" });
                    activePageIndex++;
                    isAnimating = false;
                }
            });
        }
        // Going Backward (Bring Previous Page Right back over)
        else if (direction === "prev" && activePageIndex > 0) {
            isAnimating = true;
            activePageIndex--;
            const previousPage = pages[activePageIndex];

            gsap.set(previousPage, { display: "block" });

            gsap.fromTo(previousPage, 
                { rotationY: -85, xPercent: -100, opacity: 0 },
                {
                    rotationY: 0,
                    xPercent: 0,
                    opacity: 1,
                    duration: 0.65,
                    ease: "power2.inOut",
                    onComplete: () => {
                        isAnimating = false;
                    }
                }
            );
        }
    }

    function bindDiscreteBookNavigation() {
        const $reader = $("#story-reader");
        $reader.off("wheel touchstart touchend");

        // --- 1. SMART INTUITIVE MOUSE WHEEL CONTROL ---
        $reader.on("wheel", function(e) {
            const activeTextBox = e.target.closest('.story-full-text-box');
            
            // If checking a text page box, confirm vertical reading limits first
            if (activeTextBox) {
                const isScrollingDown = e.originalEvent.deltaY > 0;
                const isAtBottom = activeTextBox.scrollHeight - activeTextBox.scrollTop <= activeTextBox.clientHeight + 4;
                const isAtTop = activeTextBox.scrollTop === 0;

                if (!isScrollingDown && !isAtTop) return; // Keep reading long texts up
                if (isScrollingDown && !isAtBottom) return; // Keep reading long texts down
            }

            e.preventDefault();
            
            // Buffer minimal fast scroll wheel ticks to avoid sudden double turns
            if (Math.abs(e.originalEvent.deltaY) > 15) {
                if (e.originalEvent.deltaY > 0) {
                    changePage("next");
                } else {
                    changePage("prev");
                }
            }
        });

        // --- 2. PREMIUM MOBILE DRAG SWIPE CONTROL ---
        $reader.on("touchstart", function(e) {
            touchStartX = e.originalEvent.touches[0].clientX;
            touchStartY = e.originalEvent.touches[0].clientY;
        });

        $reader.on("touchend", function(e) {
            const touchEndX = e.originalEvent.changedTouches[0].clientX;
            const touchEndY = e.originalEvent.changedTouches[0].clientY;
            
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;

            const activeTextBox = e.target.closest('.story-full-text-box');

            // Block page turns on small text box drag interactions unless horizontal vectors dominate
            if (activeTextBox && Math.abs(diffY) > Math.abs(diffX)) {
                return; 
            }

            // Verify vector values match the minimum threshold requirement
            if (Math.abs(diffX) > swipeThreshold) {
                if (diffX > 0) {
                    changePage("next"); // Swiped left -> load next card
                } else {
                    changePage("prev"); // Swiped right -> load previous card
                }
            }
        });
    }

    $("#close-story-reader").on("click", function() {
        $("#story-reader").off("wheel touchstart touchend");
        gsap.to("#story-reader", {
            opacity: 0,
            display: "none",
            duration: 0.3
        });
    });
});