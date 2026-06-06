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

    // Variable hook to hold the ScrollMagic controller instance
    let poemScrollController = null;

    function initPoemRevealEngine() {
        // Destroy existing instance if it exists to allow fresh re-calculation
        if (poemScrollController) { poemScrollController.destroy(true); }

        const liquifyTrigger = document.querySelector('.js-liquify-trigger');
        const textTriggers = [...document.querySelectorAll('.o-container p')];
        const inkTriggers = [...document.querySelectorAll('.js-ink-trigger')];

        // Instantiate ScrollMagic controller dynamically now that panel elements have structural size
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
            onComplete: () => { if (typeof onCompleteCallback === "function") onCompleteCallback(); }
        });
    }

    // Navigation Click Mappings// Navigation Click Mappings Updated for Header Control
    $(".main_menu a.nick_page2").click(function(e) { 
        e.preventDefault(); 
        // Seamlessly hides the main portfolio brand header over the poems panel canvas
        gsap.to(".logocontainer", { opacity: 0, duration: 0.3, onComplete: () => $(".logocontainer").hide() });

        transitionToSection('#menu-container .homepage', '#menu-container .services', function() {
            initPoemRevealEngine();
        }); 
    });
    
    $(".main_menu a.nick_homeservice").click(function(e) { 
        e.preventDefault(); 
        // Restores the main portfolio header when moving back home
        $(".logocontainer").show();
        gsap.to(".logocontainer", { opacity: 1, duration: 0.3 });

        transitionToSection('#menu-container .services', '#menu-container .homepage', function() {
            if (poemScrollController) { poemScrollController.destroy(true); poemScrollController = null; }
        }); 
    });
    
    $(".main_menu a.nick_page3").click(function(e) {
        e.preventDefault();
        transitionToSection('#menu-container .homepage', '#menu-container .portfolio', () => {
            gsap.set(".nick-stories-slider-track", { xPercent: 0 });
            $(".nick-dot").removeClass("active").first().addClass("active");
        });
    });
    $(".main_menu a.nick_homeportfolio").click(function(e) { e.preventDefault(); transitionToSection('#menu-container .portfolio', '#menu-container .homepage'); });

    $(".main_menu a.nick_page4").click(function(e) { e.preventDefault(); transitionToSection('#menu-container .homepage', '#menu-container .testimonial'); });
    $(".main_menu a.nick_hometestimonial").click(function(e) { e.preventDefault(); transitionToSection('#menu-container .testimonial', '#menu-container .homepage'); });

    $(".main_menu a.nick_page5").click(function(e) { e.preventDefault(); transitionToSection('#menu-container .homepage', '#menu-container .about'); });
    $(".main_menu a.nick_homeabout").click(function(e) { e.preventDefault(); transitionToSection('#menu-container .about', '#menu-container .homepage'); });

    $(".main_menu a.nick_page6").click(function(e) { e.preventDefault(); transitionToSection('#menu-container .homepage', '#menu-container .contact', () => { loadMapScript(); }); });
    $(".main_menu a.nick_homecontact").click(function(e) { e.preventDefault(); transitionToSection('#menu-container .contact', '#menu-container .homepage'); });

    // Slider track adjustments
    $(".nick-dot").on("click", function() {
        var slideIndex = $(this).data("slide");
        gsap.to(".nick-stories-slider-track", { xPercent: -(slideIndex * 50), duration: 0.6, ease: "power2.out" });
        $(".nick-dot").removeClass("active"); $(this).addClass("active");
    });

    // Mobile nav visibility loops
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
        gsap.to("#story-reader", { opacity: 0, display: "none", duration: 0.3 });
    });
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