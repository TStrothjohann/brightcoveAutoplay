$(document).ready( function() {
	var videoIDs = []

	//Add a class with number to each of the video-frames
    $( '.video__still' ).each(function(i) {
      i = i+1;
      $(this).addClass('video__' + i);
    });

    //Push all video ids into videoIDs Array
    $('.video__still')
		.parent()
		.each(function(){
			videoIDs.push($(this).attr('data-video'))
	});

	window.BCVideo = function(){
		var videoID   = $( ".video__still" ).parent().attr("data-video"),
		videosource   = '<div class="video__wrapper data-video="'+ videoID +'">'+'<object id="myExperience'+ videoID +'" class="BrightcoveExperience">'
                + '<param name="htmlFallback" value="true" /> '
                + '<param name="bgcolor" value="#FFFFFF" />'
                + '<param name="width" value="580" />'
                + '<param name="height" value="326" />'
                + '<param name="playerID" value="71289488001" />'
                + '<param name="playerKey" value="AQ~~,AAAABDk7jCk~,Hc7JUgOccNp4D5O9OupA8T0ybhDjWLSQ" />'
                + '<param name="isVid" value="true" />'
                + '<param name="isUI" value="true" />'
                + '<param name="dynamicStreaming" value="true" />'
                + '<param name="@videoPlayer" value="'+ videoID +'" />'
                + '<param name="includeAPI" value="true" />'
                + '<param name="templateLoadHandler" value="BCVideo.onTemplateLoad" />'
                + '<param name="templateReadyHandler" value="BCVideo.onTemplateReady" />'
                + '<param name="autoStart" value="false" />'
                + '</object></div>',
        is_rendering  = false,
        is_playing    = false,
        player      = null, 
        videoplayer   = null, 
        APIModules;

        return {
        	onTemplateLoad: function( experience_id ) {
				console.log("loaded");
			},

			onTemplateReady: function (evt) {
				player = brightcove.api.getExperience( evt.target.experience.id );
				APIModules = brightcove.api.modules.APIModules;
				videoplayer = player.getModule(APIModules.VIDEO_PLAYER);
          		videoplayer.play();
          		is_rendering = false;
				is_playing = true;
		        console.log("started");
        	},

        	isScrolledIntoView: function(elem) {
        		var docViewTop, docViewBottom, elemTop, elemBottom
        		docViewTop = $(window).scrollTop()
				docViewBottom = docViewTop + $(window).height()
            	elemTop = $(elem).offset().top
           		elemBottom = elemTop + $(elem).height();
          		
          		return (
            		(elemBottom >= docViewTop) && 
					(elemTop <= docViewBottom) && 
					(elemBottom <= docViewBottom) &&
					(elemTop >= docViewTop)
				);
			},

			checkIfVideoInView: function() {
				if ( this.isScrolledIntoView( '.video__still' ) ) {
					if( $( '.video__still .figure__media' ).size() > 0 ) {
						is_rendering = true;
						$( '.video__still' ).empty().append( videosource );
						brightcove.createExperiences();
					} else {
	              		if( !is_rendering && videoplayer !== null && !is_playing ) {
	                		videoplayer.play();
	                		is_playing = true;
	                		console.log("playing");
	              		}
	            	}
          		} else {
	            	if( is_playing && videoplayer !== null ) {
	              		videoplayer.pause();
						is_playing = false;
						console.log("pause");
	            	}
          		}
			},

			trackAction: function(action, videoid) {
				action = action || 'play';
				videoid = videoid || videoToPlay;
				console.log("Player " + action + ".");
       		}
        };
	};

	$(window).on("scroll", function(){
		BCVideo.checkIfVideoInView();
	});

});