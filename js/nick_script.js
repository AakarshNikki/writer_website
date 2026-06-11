/*
 * Nick Portfolio Core Script Pipeline
 * Combines Layouts, Tabs, Image Popups, Slides, and Immersive GSAP Readers into a single file.
 */

"use strict";

// =====================================================================
// PART 1: EASY RESPONSIVE TABS ENGINE MODIFICATION
// =====================================================================
(function ($) {
    $.fn.extend({
        easyResponsiveTabs: function (options) {
            var defaults = { type: 'default', width: 'auto', fit: true, closed: false, activate: function(){} };
            options = $.extend(defaults, options);
            var opt = options, jtype = opt.type, jfit = opt.fit, jwidth = opt.width, vtabs = 'vertical', accord = 'accordion';
            var hash = window.location.hash;
            var historyApi = !!(window.history && history.replaceState);
            
            $(this).bind('tabactivate', function(e, currentTab) {
                if(typeof options.activate === 'function') { options.activate.call(currentTab, e); }
            });

            this.each(function () {
                var $respTabs = $(this);
                var $respTabsList = $respTabs.find('ul.resp-tabs-list');
                var respTabsId = $respTabs.attr('id');
                $respTabs.find('ul.resp-tabs-list li').addClass('resp-tab-item');
                $respTabs.css({ 'display': 'block', 'width': jwidth });
                $respTabs.find('.resp-tabs-container > div').addClass('resp-tab-content');
                
                if (jtype == vtabs) { $respTabs.addClass('resp-vtabs'); }
                if (jfit == true) { $respTabs.css({ width: '100%', margin: '0px' }); }
                if (jtype == accord) { $respTabs.addClass('resp-easy-accordion'); $respTabs.find('.resp-tabs-list').css('display', 'none'); }

                $respTabs.find('.resp-tab-content').before("<h2 class='resp-accordion' role='tab'><span class='resp-arrow'></span></h2>");

                var itemCount = 0;
                $respTabs.find('.resp-accordion').each(function () {
                    var $tabItemh2 = $(this);
                    var $tabItem = $respTabs.find('.resp-tab-item:eq(' + itemCount + ')');
                    var $accItem = $respTabs.find('.resp-accordion:eq(' + itemCount + ')');
                    $accItem.append($tabItem.html());
                    $accItem.data($tabItem.data());
                    $tabItemh2.attr('aria-controls', 'tab_item-' + (itemCount));
                    itemCount++;
                });

                var count = 0;
                $respTabs.find('.resp-tab-item').each(function () {
                    var $tabItem = $(this);
                    $tabItem.attr('aria-controls', 'tab_item-' + (count));
                    $tabItem.attr('role', 'tab');
                    var tabcount = 0;
                    $respTabs.find('.resp-tab-content').each(function () {
                        $(this).attr('aria-labelledby', 'tab_item-' + (tabcount));
                        tabcount++;
                    });
                    count++;
                });
                
                var tabNum = 0;
                if(hash!='') {
                    var matches = hash.match(new RegExp(respTabsId+"([0-9]+)"));
                    if (matches!==null && matches.length===2) {
                        tabNum = parseInt(matches[1],10)-1;
                        if (tabNum > count) { tabNum = 0; }
                    }
                }

                $($respTabs.find('.resp-tab-item')[tabNum]).addClass('resp-tab-active');

                if(options.closed !== true && !(options.closed === 'accordion' && !$respTabsList.is(':visible')) && !(options.closed === 'tabs' && $respTabsList.is(':visible'))) {
                    $($respTabs.find('.resp-accordion')[tabNum]).addClass('resp-tab-active');
                    $($respTabs.find('.resp-tab-content')[tabNum]).addClass('resp-tab-content-active').attr('style', 'display:block');
                } else {
                    $($respTabs.find('.resp-tab-content')[tabNum]).addClass('resp-tab-content-active resp-accordion-closed');
                }

                $respTabs.find("[role=tab]").each(function () {
                    $(this).click(function () {
                        var $currentTab = $(this);
                        var $tabAria = $currentTab.attr('aria-controls');

                        if ($currentTab.hasClass('resp-accordion') && $currentTab.hasClass('resp-tab-active')) {
                            $respTabs.find('.resp-tab-content-active').slideUp('', function () { $(this).addClass('resp-accordion-closed'); });
                            $currentTab.removeClass('resp-tab-active');
                            return false;
                        }
                        if (!$currentTab.hasClass('resp-tab-active') && $currentTab.hasClass('resp-accordion')) {
                            $respTabs.find('.resp-tab-active').removeClass('resp-tab-active');
                            $respTabs.find('.resp-tab-content-active').slideUp().removeClass('resp-tab-content-active resp-accordion-closed');
                            $respTabs.find("[aria-controls=" + $tabAria + "]").addClass('resp-tab-active');
                            $respTabs.find('.resp-tab-content[aria-labelledby = ' + $tabAria + ']').slideDown().addClass('resp-tab-content-active');
                        } else {
                            $respTabs.find('.resp-tab-active').removeClass('resp-tab-active');
                            $respTabs.find('.resp-tab-content-active').removeAttr('style').removeClass('resp-tab-content-active').removeClass('resp-accordion-closed');
                            $respTabs.find("[aria-controls=" + $tabAria + "]").addClass('resp-tab-active');
                            $respTabs.find('.resp-tab-content[aria-labelledby = ' + $tabAria + ']').addClass('resp-tab-content-active').attr('style', 'display:block');
                        }
                        $currentTab.trigger('tabactivate', $currentTab);
                        
                        if(historyApi) {
                            var currentHash = window.location.hash;
                            var newHash = respTabsId+(parseInt($tabAria.substring(9),10)+1).toString();
                            if (currentHash!="") {
                                var re = new RegExp(respTabsId+"[0-9]+");
                                newHash = currentHash.match(re)!=null ? currentHash.replace(re,newHash) : currentHash+"|"+newHash;
                            } else {
                                newHash = '#'+newHash;
                            }
                            history.replaceState(null,null,newHash);
                        }
                    });
                });
                
                $(window).resize(function () { $respTabs.find('.resp-accordion-closed').removeAttr('style'); });
            });
        }
    });
})(jQuery);

// =====================================================================
// PART 2: NATIVE POPUP LIGHTBOX SYSTEM
// =====================================================================
(function ($) {
    $.fn.lightbox = function (options) {
        var opts = { margin: 50, nav: true, blur: false, minSize: 0 };
        var plugin = {
            items: [], lightbox: null, image: null, current: null, locked: false, caption: null,
            init: function (items) {
                plugin.items = items;
                if (!plugin.lightbox) {
                    $('body').append(
                      '<div id="lightbox" style="display:none;"><a href="#" class="lightbox-close lightbox-button"></a>' +
                      '<div class="lightbox-nav"><a href="#" class="lightbox-previous lightbox-button"></a><a href="#" class="lightbox-next lightbox-button"></a></div>' +
                      '<div class="lightbox-caption"><p></p></div></div>'
                    );
                    plugin.lightbox = $("#lightbox");
                    plugin.caption = $('.lightbox-caption', plugin.lightbox);
                }
                plugin.items.length > 1 && opts.nav ? $('.lightbox-nav', plugin.lightbox).show() : $('.lightbox-nav', plugin.lightbox).hide();
                plugin.bindEvents();
            },
            loadImage: function () {
                $("img", plugin.lightbox).remove();
                plugin.lightbox.fadeIn('fast');
                var img = $('<img src="' + $(plugin.current).attr('href') + '" draggable="false">');
                $(img).load(function () {
                    plugin.lightbox.append(img);
                    plugin.image = $("img", plugin.lightbox).hide();
                    plugin.resizeImage();
                    var caption = $(plugin.current).data('caption');
                    if(!!caption && caption.length > 0) { plugin.caption.fadeIn(); $('p', plugin.caption).text(caption); } else { plugin.caption.hide(); }
                });
            },
            resizeImage: function () {
                var ratio, wHeight = $(window).height() - opts.margin, wWidth = $(window).outerWidth(true) - opts.margin;
                plugin.image.width('').height('');
                var iHeight = plugin.image.height(), iWidth = plugin.image.width();
                if (iWidth > wWidth) { ratio = wWidth / iWidth; iWidth = wWidth; iHeight = Math.round(iHeight * ratio); }
                if (iHeight > wHeight) { ratio = wHeight / iHeight; iHeight = wHeight; iWidth = Math.round(iWidth * ratio); }
                plugin.image.width(iWidth).height(iHeight).css({
                    'top': ($(window).height() - plugin.image.outerHeight()) / 2 + 'px',
                    'left': ($(window).width() - plugin.image.outerWidth()) / 2 + 'px'
                }).show();
                plugin.locked = false;
            },
            next: function () {
                if (plugin.locked) return; plugin.locked = true;
                var index = $.inArray(plugin.current, plugin.items);
                index >= plugin.items.length - 1 ? $(plugin.items[0]).click() : $(plugin.items[index + 1]).click();
            },
            previous: function () {
                if (plugin.locked) return; plugin.locked = true;
                var index = $.inArray(plugin.current, plugin.items);
                index <= 0 ? $(plugin.items[plugin.items.length - 1]).click() : $(plugin.items[index - 1]).click();
            },
            bindEvents: function () {
                $(plugin.items).click(function (e) {
                    e.preventDefault(); plugin.current = this; plugin.loadImage();
                    $(document).on('keydown', function (e) {
                        if (e.keyCode === 27) plugin.close();
                        if (e.keyCode === 39) plugin.next();
                        if (e.keyCode === 37) plugin.previous();
                    });
                });
                plugin.lightbox.on('click', function (e) { if (this === e.target) plugin.close(); });
                plugin.lightbox.on('click', '.lightbox-previous', function () { plugin.previous(); return false; });
                plugin.lightbox.on('click', '.lightbox-next', function () { plugin.next(); return false; });
                plugin.lightbox.on('click', '.lightbox-close', function () { plugin.close(); return false; });
                $(window).resize(function () { if (plugin.image) plugin.resizeImage(); });
            },
            close: function () { $(document).off('keydown'); $(plugin.lightbox).fadeOut('fast'); }
        };
        $.extend(opts, options);
        plugin.init(this);
    };
})(jQuery);

// =====================================================================
// PART 3: CORE GSAP INTERACTIVE VIEW SWITCH NAVIGATION ENGINE
// =====================================================================
jQuery(document).ready(function($) {

    let poemScrollController = null;

    function initPoemRevealEngine() {
        if (poemScrollController) { poemScrollController.destroy(true); }

        const liquifyTrigger = document.querySelector('.js-liquify-trigger');
        const textTriggers = [...document.querySelectorAll('.o-container p')];
        const inkTriggers = [...document.querySelectorAll('.js-ink-trigger')];

        poemScrollController = new ScrollMagic.Controller();
         
        new ScrollMagic.Scene({
            triggerElement: liquifyTrigger,
            triggerHook: 'onEnter',
        })
        .setTween('#liquid', 2, {
            attr: { scale: '0' },
            ease: Power4.easeOut,
            delay: 1,
        })
        .reverse(false)
        .addTo(poemScrollController);

        new ScrollMagic.Scene({
            triggerElement: liquifyTrigger,
            triggerHook: 'onEnter',
        })
        .setTween(liquifyTrigger, 3, {
            opacity: 1,
            y: 1,
            ease: Power4.easeOut,
            delay: 1,
        })
        .reverse(false)
        .addTo(poemScrollController);
         
        textTriggers.map(text => {
            const isBelowScreen = (text.getBoundingClientRect().top > window.innerHeight) ? true : false;
            const dataDelay = (text.getAttribute('data-delay') === null || isBelowScreen) ? 0.5 : text.getAttribute('data-delay');
            
            new ScrollMagic.Scene({
                triggerElement: text,
                triggerHook: 'onEnter',
            })
            .setTween(text, 1.5, {
                y: 0,
                opacity: 1,
                ease: Power4.easeOut,
                delay: dataDelay,
            })
            .reverse(false)
            .addTo(poemScrollController);
        });

        inkTriggers.map(ink => {
            new ScrollMagic.Scene({
                triggerElement: ink,
                triggerHook: 'onEnter',
            })
            .setClassToggle(ink, 'is-active')
            .reverse(false)
            .addTo(poemScrollController);
        });
    }

    function transitionToSection(outgoingSelector, incomingSelector, onCompleteCallback) {
        const tl = gsap.timeline({ defaults: { duration: 0.4, ease: "power2.out" } });
        tl.to(outgoingSelector, {
            opacity: 0, y: -15,
            onComplete: () => {
                $(outgoingSelector).hide();
                gsap.set(incomingSelector, { display: "block", opacity: 0, y: 15 });
            }
        })
        .to(incomingSelector, {
            opacity: 1, y: 0,
            onComplete: () => { 
                if (typeof onCompleteCallback === "function") onCompleteCallback(); 
                if (typeof ScrollTrigger !== 'undefined') { ScrollTrigger.refresh(); }
            }
        });
    }

    function showGlobalBackButton() {
        gsap.killTweensOf(".nick-sticky-back-container");
        $(".nick-sticky-back-container").show();
        gsap.to(".nick-sticky-back-container", { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
    }

    function hideGlobalBackButton() {
        gsap.killTweensOf(".nick-sticky-back-container");
        gsap.to(".nick-sticky-back-container", { 
            opacity: 0, scale: 0.7, duration: 0.3, ease: "power2.in",
            onComplete: () => $(".nick-sticky-back-container").hide() 
        });
    }

    $(".main_menu a.nick_page2").click(function(e) { 
        e.preventDefault(); 
        showGlobalBackButton(); 
        
        gsap.to(".logocontainer", { opacity: 0, duration: 0.3, onComplete: () => $(".logocontainer").hide() });

        transitionToSection('#menu-container .homepage', '#menu-2', function() {
            $("body").addClass("allow-scroll");
            initPoemRevealEngine();
        }); 
    });
    
    $(".main_menu a.nick_page3").click(function(e) {
        e.preventDefault();
        hideGlobalBackButton(); // FIX: Explicitly strip button from Stories grid
        transitionToSection('#menu-container .homepage', '#menu-container .portfolio', () => {
            gsap.set(".nick-stories-slider-track", { xPercent: 0 });
            $(".nick-dot").removeClass("active").first().addClass("active");
        });
    });

    $(".main_menu a.nick_page4").click(function(e) { 
        e.preventDefault(); 
    
    // Hide Logo
        gsap.to(".logocontainer", { opacity: 0, duration: 0.3, onComplete: () => $(".logocontainer").hide() });
        
        // Show Back Button
        $(".nick-sticky-back-container").css("display", "block");
        gsap.to(".nick-sticky-back-container", { opacity: 1, duration: 0.3 });

        transitionToSection('#menu-container .homepage', '#menu-4', function() {
            
            transitionToSection('#menu-container .homepage', '#menu-4', () => {
                // Wait for CSS animations/transitions to fully settle (500ms)
                setTimeout(() => {
                    if (typeof initMiscEngine === 'function') {
                        initMiscEngine();
                        console.log("Misc Engine Engaged");
                    }
                }, 500);
            }); 
        });
    });

    $(".main_menu a.nick_homeportfolio").click(function(e) { 
        e.preventDefault(); 
        hideGlobalBackButton();
        transitionToSection('#menu-container .portfolio', '#menu-container .homepage'); 
    });

    $(".main_menu a.nick_hometestimonial").click(function(e) { e.preventDefault(); hideGlobalBackButton(); transitionToSection('#menu-container .testimonial', '#menu-container .homepage'); });
    $(".main_menu a.nick_page5").click(function(e) { e.preventDefault(); showGlobalBackButton(); transitionToSection('#menu-container .homepage', '#menu-container .about'); });
    $(".main_menu a.nick_homeabout").click(function(e) { e.preventDefault(); hideGlobalBackButton(); transitionToSection('#menu-container .about', '#menu-container .homepage'); });
    $(".main_menu a.nick_page6").click(function(e) { e.preventDefault(); showGlobalBackButton(); transitionToSection('#menu-container .homepage', '#menu-container .contact', () => { loadMapScript(); }); });
    $(".main_menu a.nick_homecontact").click(function(e) { e.preventDefault(); hideGlobalBackButton(); transitionToSection('#menu-container .contact', '#menu-container .homepage'); });

    // CUSTOM BACK BUTTON FOR MISC SECTION
    $(".misc-back-btn").click(function(e) {
        e.preventDefault();
        if (typeof miscSmoothScrollInstance !== 'undefined' && miscSmoothScrollInstance) {
            miscSmoothScrollInstance.destroy();
            miscSmoothScrollInstance = null;
        }
        transitionToSection('#menu-4', '#menu-container .homepage');
    });

    // MASTER UNIVERSAL STICKY BACK CLICK INTERACTION RE-ENGINEERED
    $(".nick-sticky-back-container a.nick_global_back_trigger").click(function(e) {
        e.preventDefault();

        if ($("#menu-2").is(":visible")) {
            hideGlobalBackButton();
            $("body").removeClass("allow-scroll");
            $(".logocontainer").show();
            gsap.to(".logocontainer", { opacity: 1, duration: 0.3 });
            
            transitionToSection('#menu-2', '#menu-container .homepage', function() {
                if (poemScrollController) { poemScrollController.destroy(true); poemScrollController = null; }
            });
        } else {
            hideGlobalBackButton();
            var activeSection = $("#menu-container .content").not(".homepage").filter(":visible");
            if(activeSection.length > 0) {
                transitionToSection(activeSection, '#menu-container .homepage');
            }
        }
    });

    $(".nick-dot").on("click", function() {
        var slideIndex = $(this).data("slide");
        gsap.to(".nick-stories-slider-track", { xPercent: -(slideIndex * 50), duration: 0.6, ease: "power2.out" });
        $(".nick-dot").removeClass("active"); $(this).addClass("active");
    });

    $("a.menu-toggle-btn").click(function(e) {
        e.preventDefault(); var drawer = $(".responsive_menu");
        if (drawer.is(":visible")) {
            gsap.to(drawer, { height: 0, opacity: 0, duration: 0.3, onComplete: () => drawer.hide() });
        } else {
            drawer.show(); gsap.fromTo(drawer, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.4 });
        }
    });

    $('[data-rel="lightbox"]').lightbox();

    // =====================================================================
    // PART 4: DISCRETE 3D STORY COVERS AND PAGE-TURNING MECHANICS
    // =====================================================================
    let pages = [];
    let activePageIndex = 0;
    let isAnimating = false;
    let touchStartX = 0, touchStartY = 0;

    $(".story-select-btn").on("click", function(e) {
        e.preventDefault();
        hideGlobalBackButton(); // FIX: Explicitly strip button from individual stories

        const targetStoryToken = $(this).attr("data-story");
        $(".story-instance-data").hide();
        $(`#${targetStoryToken}-data`).show();

        pages = document.querySelectorAll(`#${targetStoryToken}-data .nick-page-panel`);
        activePageIndex = 0; isAnimating = false;

        pages.forEach((page, index) => {
            gsap.set(page, { xPercent: 0, rotationY: 0, opacity: 1, display: "block", zIndex: pages.length - index });
        });
        
        gsap.fromTo("#story-reader", { opacity: 0, display: "none" }, { opacity: 1, display: "flex", duration: 0.4 });
        bindBookControls();
    });

    function changePage(direction) {
        if (isAnimating) return;
        if (direction === "next" && activePageIndex < pages.length - 1) {
            isAnimating = true; const current = pages[activePageIndex];
            gsap.to(current, {
                rotationY: -85, xPercent: -100, opacity: 0, duration: 0.65, ease: "power2.inOut",
                onComplete: () => { gsap.set(current, { display: "none" }); activePageIndex++; isAnimating = false; }
            });
        } else if (direction === "prev" && activePageIndex > 0) {
            isAnimating = true; activePageIndex--; const prev = pages[activePageIndex];
            gsap.set(prev, { display: "block" });
            gsap.fromTo(prev, { rotationY: -85, xPercent: -100, opacity: 0 }, { rotationY: 0, xPercent: 0, opacity: 1, duration: 0.65, ease: "power2.inOut", onComplete: () => { isAnimating = false; } });
        }
    }

    function bindBookControls() {
        const $reader = $("#story-reader");
        $reader.off("wheel touchstart touchend");

        $reader.on("wheel", function(e) {
            const box = e.target.closest('.story-full-text-box');
            if (box) {
                const scrollingDown = e.originalEvent.deltaY > 0;
                if (!scrollingDown && box.scrollTop !== 0) return;
                if (scrollingDown && box.scrollHeight - box.scrollTop > box.clientHeight + 4) return;
            }
            e.preventDefault();
            if (Math.abs(e.originalEvent.deltaY) > 15) { changePage(e.originalEvent.deltaY > 0 ? "next" : "prev"); }
        });

        $reader.on("touchstart", function(e) { touchStartX = e.originalEvent.touches[0].clientX; touchStartY = e.originalEvent.touches[0].clientY; });
        $reader.on("touchend", function(e) {
            const diffX = touchStartX - e.originalEvent.changedTouches[0].clientX;
            const diffY = touchStartY - e.originalEvent.changedTouches[0].clientY;
            if (e.target.closest('.story-full-text-box') && Math.abs(diffY) > Math.abs(diffX)) return;
            if (Math.abs(diffX) > 50) { changePage(diffX > 0 ? "next" : "prev"); }
        });
    }

    $("#close-story-reader").on("click", function() {
        $("#story-reader").off("wheel touchstart touchend");
        hideGlobalBackButton(); // Ensure it stays hidden upon returning to stories menu
        gsap.to("#story-reader", { opacity: 0, display: "none", duration: 0.3 });
    });

    // =====================================================================
    // PART 6: HIGH-PERFORMANCE IMMERSIVE POEM UNROLL READER CORE
    // =====================================================================
    const poemDatabase = {
        "poem-1": {
            title: "Fallen Rose",
            text: "<p>The petals descend in silent grace,</p><p>Leaving a scar on winter's face.</p><p>A crimson memory lost in snow,</p><p>Where freezing winds of sorrow blow.</p><p>Yet deep beneath the frozen ground,</p><p>A quiet resilience can be found.</p><p>To bloom again when shadows part,</p><p>And spring unlocks the dreaming heart.</p>"
        },
        "poem-2": {
            title: "Midnight Shadows",
            text: "<p>The streetlamp casts a lonely gleam,</p><p>Upon the fragments of a dream.</p><p>The city sleeps, the world is still,</p><p>As shadows dance across the sill.</p><p>A rhythmic study of night skies,</p><p>Where hidden architecture lies.</p><p>We walk along the edge of time,</p><p>In search of reason and of rhyme.</p>"
        }
    };

    const modalView = document.querySelector('#poem-modal-reader');
    const modalScrollerContent = modalView.querySelector('.poem-scroll-scroll-content');
    const modalArticleCell = modalView.querySelector('.poem-scroll-article');
    
    let modalScrollTriggerInstance = null;

    $('.poem-grid-trigger-wrapper').on('click', '.poem-showcase-card', function(e) {
        e.preventDefault();
        const targetedId = $(this).attr('data-poem-id');
        const databaseRecord = poemDatabase[targetedId];
        
        if (!databaseRecord) return;

        document.getElementById('active-modal-poem-title').textContent = databaseRecord.title;
        document.getElementById('active-modal-poem-text').innerHTML = databaseRecord.text;

        $('body, html').css({ 'overflow': 'hidden', 'height': '100%' });

        gsap.set(modalView, { display: "block", opacity: 0 });
        gsap.to(modalView, { opacity: 1, duration: 0.4, onComplete: function() {
            buildPoemRollTimeline();
        }});
    });

    function buildPoemRollTimeline() {
        if (modalScrollTriggerInstance) { modalScrollTriggerInstance.kill(); }
        modalScrollerContent.scrollTop = 0;

        const rollTimeline = gsap.timeline()
            .to(modalArticleCell, {
                '--clip-reveal-delta': `${modalArticleCell.offsetHeight + 60}px`,
                '--crease-scale-y': 1,
                '--crease-opacity': 1,
                duration: 1,
                ease: 'none'
            });

        modalScrollTriggerInstance = ScrollTrigger.create({
            animation: rollTimeline,
            trigger: '.poem-scroll-article',
            scroller: modalScrollerContent, 
            scrub: true,
            start: "top top+=100",
            end: "bottom top+=40",
            onUpdate: self => {
                if (modalScrollerContent.scrollTop > 600) {
                    modalScrollerContent.scrollTop = 600;
                }
            }
        });
        
        ScrollTrigger.refresh();
    }

    $('#close-poem-modal-reader').off('click').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
    
        gsap.killTweensOf(modalView);
    
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.getAll().forEach(trigger => {
                try {
                    const scroller = typeof trigger.scroller === 'function' ? trigger.scroller() : null;
                    if (scroller === modalScrollerContent) { trigger.kill(); }
                } catch(err) { console.error(err); }
            });
        }
    
        if (modalScrollTriggerInstance) {
            modalScrollTriggerInstance.kill();
            modalScrollTriggerInstance = null;
        }
    
        if (modalScrollerContent) { modalScrollerContent.scrollTop = 0; }
    
        gsap.to(modalView, {
            opacity: 0,
            duration: 0.3,
            onComplete: function() {
                gsap.set(modalView, { display: "none" });
                $('html, body').css({ overflow: '', height: '', 'overflow-x': '', 'overflow-y': '' });
            }
        });
    });

    // =====================================================================
    // PART 7: SCOPED MISC SECTION CUSTOM SMOOTH SCROLL ENGINE
    // =====================================================================
    // Add this inside your document.ready function or as a standalone
    window.miscEngineInstance = null;

    window.initMiscEngine = function() {
        // 1. Clean up existing instances
        if (window.miscEngineInstance) {
            ScrollTrigger.getAll().filter(st => st.vars.trigger.closest('#menu-4')).forEach(st => st.kill());
        }
    
        // 2. Select all items
        const items = document.querySelectorAll("#menu-4 .misc-content__item");
    
        // 3. Apply the 3D Scrub effect with alternation
        items.forEach((item, index) => {
            const imgWrap = item.querySelector(".misc-content__item-imgwrap");
            
            // This line is the key: if index is even, multiplier is 1. If odd, it's -1.
            const multiplier = (index % 2 === 0) ? 1 : -1;
    
           gsap.fromTo(
                imgWrap,
                {
                    rotateX: -90,
                    rotateY: -15 * multiplier,
                    scale: .6
                },
                {
                    rotateX: 90,
                    rotateY: 15 * multiplier,
                    scale: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: imgWrap,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: .8,
                        invalidateOnRefresh: true
                    }
                }
            );
        });
        
        ScrollTrigger.refresh();

    

    
        class Item {
            constructor(el) {
                this.DOM = { el: el };
                this.DOM.image = this.DOM.el.querySelector(".misc-content__item-img");
                this.DOM.imageWrapper = this.DOM.image.parentNode;
                this.DOM.el.style.perspective = "1000px";
                this.DOM.imageWrapper.style.transformOrigin = "50% 100%";
                this.ry = 0.3; 
                this.rz = 0.1;
                
                // Initial styling for the 3D effect
                this.renderedStyles = {
                    innerTranslationY: { previous: 0, current: 0, ease: 0.1 },
                    itemRotation: { previous: 0, current: 0, ease: 0.1, toValue: Number(MathUtils.getRandomFloat(-70, -50)) }
                };
            }
    
            render(scrollY) {
                const rect = this.DOM.el.getBoundingClientRect();
                const top = scrollY + rect.top;
                
                // Calculate parallax values
                const toValue = 60; // --overflow value
                const fromValue = -60;
                const targetY = Math.max(Math.min(MathUtils.map(top - scrollY, window.innerHeight, -rect.height, fromValue, toValue), toValue), fromValue);
                
                // Interpolate (Lerp)
                this.renderedStyles.innerTranslationY.previous = MathUtils.lerp(this.renderedStyles.innerTranslationY.previous, targetY, 0.1);
                
                // Apply Styles
                this.DOM.imageWrapper.style.transform = `
                translate3d(
                    0,
                    ${this.renderedStyles.innerTranslationY.previous}px,
                    0
                )
                rotate3d(
                    1,
                    ${this.ry},
                    ${this.rz},
                    ${this.renderedStyles.itemRotation.previous}deg
                )`;
            }
        }
    
        class MiscScroll {
            constructor() {
                this.container = document.querySelector("#menu-4");
                this.items = [...this.container.querySelectorAll(".misc-content__item")].map(i => new Item(i));
                this.rafId = null;
                this.render();
            }
    
            render() {
                const scrollY = window.pageYOffset;
                this.items.forEach(item => item.render(scrollY));
                this.rafId = requestAnimationFrame(() => this.render());
            }
    
            destroy() {
                cancelAnimationFrame(this.rafId);
            }
        }
    
        window.miscEngineInstance = new MiscScroll();
    };
});

/* =====================================================================
   INDEPENDENT MISC ARTICLE ZOOM OPENER MODULE (VANILLA JS)
===================================================================== */
document.addEventListener("DOMContentLoaded", function() {
    let zoomTimeline = null;
    let backBtnTrigger = null;
    const overlay = document.getElementById('zoom-article-overlay');

    if (!overlay) return; // Failsafe if HTML isn't present

    // --- 1. THE ARTICLE DATABASE ---
    const articleDatabase = {
        "article-1": `
            <p class="intro-text">The Middle English 'tigre' and Old English tigras derive from the French tigre, from Latin tigris.</p>
            <p>This is the full text for the FIRST article. It loads dynamically when you click.</p>
        `,
        "article-2": `
            <p class="intro-text">Welcome to the second article: Exploring the depths of procedural generation.</p>
            <p>This is completely different text for the SECOND article.</p>
        `,
        "article-3": `
            <p class="intro-text">The evolution of local LLMs and workstation setups.</p>
            <p>Content for the THIRD article goes here.</p>
        `
    };

    function initZoomModule() {
        // Ensure GSAP knows the overlay is the scroller
        ScrollTrigger.defaults({ scroller: overlay });

        zoomTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: "#zoom-article-overlay .zoom-container",
                start: "top top",
                end: "+=200%", 
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true
            }
        })
        .to("#zoom-article-overlay .zoom-scroll-prompt", { opacity: 0, z: 200, duration: 0.2 }, 0)
        
        // THE FIX: Massively increased Z-values (2000+) to guarantee they fly completely past the camera
        .to("#zoom-article-overlay .zoom-item[data-layer='1']", { opacity: 0, z: 2000, ease: "power1.inOut" }, 0)
        .to("#zoom-article-overlay .zoom-item[data-layer='2']", { opacity: 0, z: 2500, ease: "power1.inOut" }, 0)
        .to("#zoom-article-overlay .zoom-item[data-layer='3']", { opacity: 0, z: 3000, ease: "power1.inOut" }, 0)
        
        .to("#zoom-article-overlay .zoom-heading", { opacity: 1, z: 50, ease: "power1.inOut" }, 0);

        backBtnTrigger = ScrollTrigger.create({
            trigger: "#zoom-article-overlay .zoom-article-content",
            start: "top 60%", 
            onEnter: () => gsap.to("#zoom-article-back-btn", { autoAlpha: 1, scale: 1, duration: 0.3, ease: "power2.out" }),
            onLeaveBack: () => gsap.to("#zoom-article-back-btn", { autoAlpha: 0, scale: 0.7, duration: 0.3, ease: "power2.in" })
        });
    }

    // --- Open Event ---
    const readMoreBtns = document.querySelectorAll('.misc-read-more');
    
    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Extract Title
            const cardInfo = this.closest('.misc-content__item-info');
            if (cardInfo) {
                const titleEl = cardInfo.querySelector('.misc-content__item-title');
                if (titleEl) document.getElementById('zoom-dynamic-title').innerHTML = titleEl.innerText.replace(" ", "<br/>");
            }

            // Extract Content
            const targetArticleId = this.getAttribute('data-article-id');
            const dynamicContent = articleDatabase[targetArticleId] || "<p class='intro-text'>Article content coming soon. Please ensure your button has a data-article-id attribute.</p>";
            document.getElementById('zoom-dynamic-content').innerHTML = dynamicContent;

            // Force Display & Scroll Reset
            overlay.style.display = 'block';
            overlay.scrollTop = 0; 
            document.body.style.overflow = 'hidden'; 
            
            // Reset animations
            gsap.set("#zoom-article-back-btn", { autoAlpha: 0, scale: 0.7 });
            gsap.set("#zoom-article-overlay .zoom-scroll-prompt", { opacity: 1, z: 0 }); 
            
            setTimeout(() => {
                overlay.style.opacity = '1';
                
                if (!zoomTimeline) {
                    initZoomModule();
                } else {
                    ScrollTrigger.refresh(); 
                }
            }, 50);
        });
    });

    // --- Close Event ---
    const backBtn = document.getElementById('zoom-article-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            gsap.to(this, { autoAlpha: 0, scale: 0.7, duration: 0.2 });

            gsap.to(overlay, { 
                opacity: 0, 
                duration: 0.4, 
                onComplete: () => {
                    overlay.style.display = 'none';
                    document.body.style.overflow = ''; 
                    overlay.scrollTop = 0; 
                } 
            });
        });
    }
});
// =====================================================================
// PART 5: GOOGLE MAPS LOADER ASSET
// =====================================================================
function loadMapScript() {
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=initializeMap';
        document.body.appendChild(script);
    } else {
        initializeMap();
    }
}

function initializeMap() {
    var mapOptions = { zoom: 12, center: new google.maps.LatLng(11.127123, 78.656894) };
    var mapContainer = document.getElementById('nick_map');
    if(mapContainer) { new google.maps.Map(mapContainer, mapOptions); }
}