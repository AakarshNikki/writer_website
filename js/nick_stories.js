/*
 * Nick of All Trades - Author Landing Page
 * Clean Horizontal Wheel Capture Interaction Logic for Stories
 */

$(document).ready(function () {
    let scrollPosition = 0;

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

        bindHorizontalWheelScroll(targetStoryToken);
    });

    function bindHorizontalWheelScroll(storyId) {
        const container = document.querySelector(".nick-story-scroller-container");
        const track = document.querySelector(`#${storyId}-data .nick-story-section`);
        
        if (!container || !track) return;

        $("#story-reader").off("wheel");

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
                ease: "power2.out"
            });
        });
    }

    $("#close-story-reader").on("click", function() {
        $("#story-reader").off("wheel");
        gsap.to("#story-reader", {
            opacity: 0,
            display: "none",
            duration: 0.3
        });
    });
});