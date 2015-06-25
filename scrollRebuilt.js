var areYouReady = function(){
  if(typeof $ !== "undefined" && typeof brightcove !== 'undefined'){
    videosInView();
  } else {
    setTimeout(areYouReady, 200);
  }
};

if(!excludedVideos){
    console.log("Keine Ausgeschlossenen Videos.")
    var excludedVideos = []
  }else{
    console.log("Ausgeschlossene Videos:" + excludedVideos)
};

var videosInView = function(){
  
  var videoIDs = [], experienceIDs = [], APIModules, videosource, player, videoPlayer, nowPlaying;
  var videoID  = $( ".video__still" ).parent().attr("data-video");
    
    //individual class for each video container
    $( '.video__still' ).each(function(i) {
      i = i+1;
      $(this).addClass('video__' + i);
    });

    //Push all video ids into videoIDs array
    $('.video__still')
      .parent()
      .each(function(){
        videoIDs.push($(this).attr('data-video'))
        var experienceID = 'myExperience' + $(this).attr('data-video')
        experienceIDs.push(experienceID)    
    });

    //Events emitted by the players on load and when ready
    window.BCTEST = function() {
      return {
        onTemplateLoad: function(evt) {
          if(!APIModules){
        		APIModules = brightcove.api.modules.APIModules;
        	}
    		},
    		onTemplateReady: function (evt) {
          playIt(evt.target.experience.id)
          $(nowPlaying).find("img").fadeOut("slow")
          $(nowPlaying).find(".video__wrapper").css({"position":"relative", "left": "0"})          
        }
      } 
    }();


    // Helpers from UnderscoreJS which makes scroll event trigger every 200ms
		var _now = Date.now || function() {
		    return new Date().getTime();
		  };
    
    var _debounce = function(func, wait, immediate) {
	    var timeout, args, context, timestamp, result;

	    var later = function() {
	      var last = _now() - timestamp;

	      if (last < wait && last >= 0) {
	        timeout = setTimeout(later, wait - last);
	      } else {
	        timeout = null;
	        if (!immediate) {
	          result = func.apply(context, args);
	          if (!timeout) context = args = null;
	        }
	      }
	    };

	    return function() {
	      context = this;
	      args = arguments;
	      timestamp = _now();
	      var callNow = immediate && !timeout;
	      if (!timeout) timeout = setTimeout(later, wait);
	      if (callNow) {
	        result = func.apply(context, args);
	        context = args = null;
	      }

	      return result;
			};
		};

		//Helper: checks if ther video still has been replaced with the video yet
    var videoStill = function(videoName){
      return $(videoName).find('.video__wrapper').length === 0 
    };

    //Helper: excludes a video from the script if the user has clicked on it once Flash-Object only.
    var catchClickOnVideo= function(){
      $(".video__still").on("mousedown", function(event){
        excludedVideos.push($(this).parent().attr("data-video"))
      })
    };


    //Stops all videos except for the one that is passed into it. 
    var stopOtherPlayers = function(experienceID){
      for (var i = 0; i < experienceIDs.length; i++) {
        if(experienceIDs[i] != experienceID){
          getVideoPlayer( experienceIDs[i] )
          	.then( function(videoPlayer){										
							videoPlayer.pause()											
	        	})
	        	.catch( function(error){
	        		return;
	        	})
	      };
	    };
	  }


    //Takes a videoID and makes the corresponding player available
    var getVideoPlayerExperience = function( experienceID ) {
    	return new Promise( function (fulfill, reject){
    		fulfill(brightcove.api.getExperience(experienceID))    		
    	})
    };


	var getVideoPlayer = function( experienceID ){
	  return new Promise(function (fulfill, reject){
	    getVideoPlayerExperience( experienceID ).then(function (video){
	      try {
	        fulfill( video.getModule(APIModules.VIDEO_PLAYER) );
	      } catch (ex) {
	        reject(ex);
	      }
	    });
	  });
	};



    //Replaces the video still with a functioning video container
    var buildVideo = function(index){ 
      var videoName = ".video__" + index
      nowPlaying = videoName
      videoSource = '<div style="position:absolute; left: 3000px;" class="video__wrapper data-video="'+ videoIDs[index-1] +'">'+'<object id='+ experienceIDs[index-1] +' class="BrightcoveExperience">'
            + '<param name="htmlFallback" value="true" /> '
            + '<param name="bgcolor" value="#FFFFFF" />'
            + '<param name="playerID" value="2922359108001" />'
            + '<param name="playerKey" value="AQ~~%2CAAAABDk7jCk~%2CHc7JUgOccNpvlYo3iMVDRDd9PQS2LC9K" />'
            + '<param name="isVid" value="true" />'
            + '<param name="isUI" value="true" />'
            + '<param name="dynamicStreaming" value="true" />'
            + '<param name="@videoPlayer" value="'+ videoIDs[index-1] +'" />'
            + '<param name="includeAPI" value="true" />'
            + '<param name="templateLoadHandler" value="BCTEST.onTemplateLoad" />'
            + '<param name="templateReadyHandler" value="BCTEST.onTemplateReady" />'
            + '<param name="autoStart" value="false" />'
            + '</object></div>'
        $( videoName ).append( videoSource );
        $(videoName).find(".icon-playbutton").css({"background-image":"url('http://images.zeit.de/static/img/ajax-loader.gif?1379601496')"})
        brightcove.createExperiences();
        if($( videoName ).parent().hasClass("figure-stamp")){
						$( videoName ).css({ "width": "100%", "float": "none" })
				}
    };

    //Takes a video ID and runs the corresponding video
    var playIt = function( experienceID ){ 
  		var videoID = experienceID.replace('myExperience', '')
      if(excludedVideos.indexOf(videoID) == -1){
        getVideoPlayer( experienceID ).then( function(videoPlayer){
          videoPlayer.play();
          stopOtherPlayers(experienceID);
        })         
      }
    };

    //Takes a video ID and pauses the corresponding video
    var pauseIt = function(experienceID){
  		getVideoPlayer( experienceID ).then( function(videoPlayer){
  			videoPlayer.pause();
  		})  
    };

    //The Core function: it loops through the array of players on page, builds, plays or pauses the video depending on presence in view and state.
	  var playPauseInView = function() {
	    for (var i = 1; i <= videoIDs.length; i++) {
	      var videoName = ".video__" + i
	      if ( isScrolledIntoView( videoName ) && excludedVideos.indexOf(videoIDs[i-1]) == -1 ) {
	        if( videoStill(videoName) ){
	          buildVideo(i)
	        } else {
	          	playIt(experienceIDs[i-1])
	        }             
	      //When video is out of view
	      } else {
	          if( !videoStill(videoName) && excludedVideos.indexOf(videoIDs[i-1]) == -1 ){
	           pauseIt(experienceIDs[i-1])  
	          };
	      }
	    }; //end of loop
	  }

	  //Checks if the given element is in view
	  var isScrolledIntoView = function( elem ) {
      var docViewTop = $(window).scrollTop(),
          docViewBottom = docViewTop + $(window).height(),
          elemTop = $(elem).offset().top,
          elemBottom = elemTop + $(elem).height();

      //evaluates to true when in view
      return (
        (elemBottom >= docViewTop) && 
        (elemTop <= docViewBottom) && 
        (elemBottom <= docViewBottom) &&
        (elemTop >= docViewTop)
      );
    }

    // Scroll event listener that triggers every 150ms only
    var debouncedPlayPauseInView = _debounce(playPauseInView, 150);
    $(window).on("scroll", debouncedPlayPauseInView);

    catchClickOnVideo();
}

areYouReady();