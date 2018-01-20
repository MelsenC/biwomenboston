jQuery(function($) {
	// DOM is ready. Safe to use $:
	
	$('body').removeClass('no-js').addClass('js');
	
	
	
	
	var mobileTimeout
	
	jQuery('#hamburger-switch').click(function(){
		if($('#mobile-menu .mobile-header').hasClass('mobile-menu-closed')){
			$('#mobile-menu .mobile-header').slideDown(800, 'swing');
			$('#mobile-menu .mobile-header').removeClass('mobile-menu-closed');
			$('#mobile-menu .mobile-header').addClass('mobile-menu-open');
			$('#hamburger-switch').addClass('active');
			$("html, body").animate({ scrollTop: 0 }, 1000);
				mobileTimeout = setTimeout(function(){
				$('#mobile-menu .mobile-header').slideUp(800, 'swing')
				$('#mobile-menu .mobile-header').removeClass('mobile-menu-open');
				$('#mobile-menu .mobile-header').addClass('mobile-menu-closed');
				$('#hamburger-switch').removeClass('active');
				}, 
				5000)
				return false;
		}
		if($('#mobile-menu .mobile-header').hasClass('mobile-menu-open')){
			clearTimeout(mobileTimeout);
			$('#mobile-menu .mobile-header').slideUp(800, 'swing');
			$('#mobile-menu .mobile-header').removeClass('mobile-menu-open');
			$('#mobile-menu .mobile-header').addClass('mobile-menu-closed');
			$('#hamburger-switch').removeClass('active');
				return false;
		}
	});
	
	//Hide menu on a tag click
	$('#mobile-menu .mobile-header a').click(function(){
				clearTimeout(mobileTimeout);
				$('#mobile-menu .mobile-header').slideUp(800, 'swing')
				$('#mobile-menu .mobile-header').removeClass('mobile-menu-open');
				$('#mobile-menu .mobile-header').addClass('mobile-menu-closed');
				$('#hamburger-switch').removeClass('active');
				});

	
	
	
	
});

