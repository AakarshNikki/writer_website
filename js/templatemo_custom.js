"use strict";
var menuDisabled = false;

jQuery(document).ready(function($){

	/************** Menu Content Opening *********************/
	$(".main_menu a").on('click',function(){
		var id =  $(this).attr('class');
		id = id.split('-');
		return false;
	});
	

	$(".main_menu a.templatemo_homeservice").click(function(){
		$("#menu-container .portfolio").hide();
		$('#menu-container .services').fadeOut(1000, function(){
            $('#menu-container .homepage').fadeIn(1000);
	    });
		return false;
	});
	
	$(".main_menu a.templatemo_page2").click(function( ){
        $('#menu-container .homepage').fadeOut(1000, function(){									  
            $('#menu-container .services').fadeIn(1000);
	    });
	    return false;
	});
	
	$(".main_menu a.templatemo_homeportfolio").click(function(){
		$('#menu-container .portfolio').fadeOut(1000, function(){
            $('#menu-container .homepage').fadeIn(1000);
	    });
		return false;
	});

	/************** Clean Custom Stories Dashboard Slider Logic *********************/
	/************** Clean Custom Stories Dashboard Slider Logic *********************/
	$(".main_menu a.templatemo_page3").click(function(){    
		$('#menu-container .homepage').fadeOut(1000, function(){
			$('#menu-container .portfolio').fadeIn(1000, function() {
				// Reset stories slider track viewport positioning to slide 1 on open
                $(".nick-stories-slider-track").css("transform", "translateX(0%)");
                $(".nick-dot").removeClass("active").first().addClass("active");
			});
		});
		return false;
	});

    // Handle interactive clicks on the pagination dashboard index dots
    $(".nick-dot").on("click", function() {
        var slideIndex = $(this).data("slide");
        var translationPercent = -(slideIndex * 50); // Move window space along track lengths
        
        $(".nick-stories-slider-track").css("transform", "translateX(" + translationPercent + "%)");
        $(".nick-dot").removeClass("active");
        $(this).addClass("active");
    });

    // Handle interactive clicks on the pagination dashboard index dots
    $(".nick-dot").on("click", function() {
        var slideIndex = $(this).data("slide");
        var translationPercent = -(slideIndex * 50); // Move window space along track lengths
        
        $(".nick-stories-slider-track").css("transform", "translateX(" + translationPercent + "%)");
        $(".nick-dot").removeClass("active");
        $(this).addClass("active");
    });
	
	$(".main_menu a.templatemo_hometestimonial").click(function(){
		$('#menu-container .testimonial').fadeOut(1000, function(){
            $('#menu-container .homepage').fadeIn(1000);
	    });
		return false;
	});
	
	$(".main_menu a.templatemo_page4").click(function(){    
        $('#menu-container .homepage').fadeOut(1000, function(){
            $('#menu-container .testimonial').fadeIn(1000);
	    });
		return false
	});

	$(".main_menu a.templatemo_homeabout").click(function(){
		$('#menu-container .about').fadeOut(1000, function(){
            $('#menu-container .homepage').fadeIn(1000);
	    });
		return false;
	});

	$(".main_menu a.templatemo_page5").click(function(){    
        $('#menu-container .homepage').fadeOut(1000, function(){
            $('#menu-container .about').fadeIn(1000);
	    });
		return false;
	});
	
	$(".main_menu a.templatemo_homecontact").click(function(){
		$('#menu-container .contact').fadeOut(1000, function(){
            $('#menu-container .homepage').fadeIn(1000);
	    });
		return false;
	});
	
	$(".main_menu a.templatemo_page6").click(function(){    
        $('#menu-container .homepage').fadeOut(1000, function(){
            $('#menu-container .contact').fadeIn(1000);
		    loadScript();		
	    });
	});
	
	/************** Gallery Hover Effect *********************/
	$(".overlay").hide();

	$('.gallery-item').hover(
	  function() {
	    $(this).find('.overlay').addClass('animated fadeIn').show();
	  },
	  function() {
	    $(this).find('.overlay').removeClass('animated fadeIn').hide();
	  }
	);

	/************** LightBox *********************/
	$(function(){
		$('[data-rel="lightbox"]').lightbox();
	});

	$("a.menu-toggle-btn").click(function() {
	  $(".responsive_menu").stop(true,true).slideToggle();
	  return false;
	});
 
    $(".responsive_menu a").click(function(){
		$('.responsive_menu').hide();
	});

});

function loadScript() {
  // Check if map script reference is already appended to head to avoid double load drops
  if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=initialize';
      document.body.appendChild(script);
  } else {
      initialize();
  }
}

function initialize() {
    var mapOptions = {
      zoom: 12,
      center: new google.maps.LatLng(11.127123, 78.656894) // Center positioned gracefully over South India
    };
    // FIX: Targets 'nick_map' matching your native index markup id element directly
    var map = new google.maps.Map(document.getElementById('nick_map'), mapOptions);
}