var areYouReady = function(){
  if(typeof $ !== "undefined" && typeof brightcove !== 'undefined'){
    videosInView();
  } else {
    setTimeout(areYouReady, 200);
  }
};

var videosInView = function(){
  
  var videoIDs = [], experienceIDs = [], excludedVideos = [], APIModules, videosource, player, videoPlayer;
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
        onTemplateLoad: function() {
    			APIModules = brightcove.api.modules.APIModules;      
    		},
    		onTemplateReady: function (evt) {
          playIt(evt.target.experience.id)
        }
      } 
    }();

    var videoStill = function(videoName){
      return $(videoName).children().first().hasClass('figure__media')
    };

    var catchClickOnVideo= function(){
      $(".video__still").on("mousedown", function(event){
        excludedVideos.push($(this).parent().attr("data-video"))
      })
    };


    var stopOtherPlayers = function(experienceID){
      for (var i = experienceIDs.length - 1; i >= 0; i--) {
        if(experienceIDs[i] != experienceID){
          pauseIt(experienceIDs[i])
        }
      };
    };


    var getVideoPlayer = function( experienceID ) {
    	if(typeof experienceID !== "undefined" && brightcove.api !== "undefined"){         
       	player = brightcove.api.getExperience(experienceID);
      }
      if(typeof player !== "undefined"){
       	videoPlayer = player.getModule(APIModules.VIDEO_PLAYER);
       	return videoPlayer    
      }
    };  

    var buildVideo = function(index){ 
      var videoName = ".video__" + index
      videoSource = '<div class="video__wrapper data-video="'+ videoIDs[index-1] +'">'+'<object id="'+ experienceIDs[index-1] +'" class="BrightcoveExperience">'
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
        $( videoName ).empty().append( videoSource );
        brightcove.createExperiences();
        if($( videoName ).parent().hasClass("figure-stamp")){
						$( videoName ).css({ "width": "100%", "float": "none" })
				}
    };

    var playIt = function( experienceID ){ 
  		videoPlayer = getVideoPlayer( experienceID );
     	if( videoPlayer ){
     		videoPlayer.play(); 
       	stopOtherPlayers(experienceID);
     	}         
    };

    var pauseIt = function(experienceID){
  		videoPlayer = getVideoPlayer( experienceID );                            
    	if( videoPlayer ){
    		videoPlayer.pause();
    	}
    };

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

    // Scroll event listener
    $(window).on("scroll", function(){
      playPauseInView();
    });

    catchClickOnVideo();
}

areYouReady();