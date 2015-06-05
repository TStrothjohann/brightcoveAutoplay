if (typeof jQuery !== 'undefined' || typeof brightcove !== 'undefined') {
  var videoIDs = []
  var $jq = jQuery.noConflict();

  $jq(document).ready( function() {
    
    //individual class for each video container
    $jq( '.video__still' ).each(function(i) {
      i = i+1;
      $jq(this).addClass('video__' + i);
    });

    //Push all video ids into videoIDs array
    $jq('.video__still')
      .parent()
      .each(function(){
        videoIDs.push($jq(this).attr('data-video'))
    });

    window.BCTEST = function() {
      var videoID   = $jq( ".video__still" ).parent().attr("data-video"),
      videosource,
      is_rendering  = false,
      is_playing    = false,
      player      = null, 
      videoPlayer   = null, 
      players = [],
      APIModules;

      var buildVideo = function(index){ 
      	var videoName = ".video__" + index
        videoSource = '<div class="video__wrapper data-video="'+ videoIDs[index-1] +'">'+'<object id="myExperience'+ videoIDs[index-1] +'" class="BrightcoveExperience">'
              + '<param name="htmlFallback" value="true" /> '
              + '<param name="bgcolor" value="#FFFFFF" />'
              + '<param name="width" value="580" />'
              + '<param name="height" value="326" />'
              + '<param name="playerID" value="71289488001" />'
              + '<param name="playerKey" value="AQ~~,AAAABDk7jCk~,Hc7JUgOccNp4D5O9OupA8T0ybhDjWLSQ" />'
              + '<param name="isVid" value="true" />'
              + '<param name="isUI" value="true" />'
              + '<param name="dynamicStreaming" value="true" />'
              + '<param name="@videoPlayer" value="'+ videoIDs[index-1] +'" />'
              + '<param name="includeAPI" value="true" />'
              + '<param name="templateLoadHandler" value="BCTEST.onTemplateLoad" />'
              + '<param name="templateReadyHandler" value="BCTEST.onTemplateReady" />'
              + '<param name="autoStart" value="false" />'
              + '</object></div>'
          $jq( videoName ).empty().append( videoSource );
          brightcove.createExperiences();
      };

      return {
        onTemplateLoad: function( experienceID ) {
          is_rendering = true;
          console.log("loading");
        },

        onTemplateReady: function (evt) {
          APIModules = brightcove.api.modules.APIModules;
          player = brightcove.api.getExperience(evt.target.experience.id);               
          initialVideoPlayer = player.getModule(APIModules.VIDEO_PLAYER);
          initialVideoPlayer.play();
          is_playing = true;
          console.log("playing");
          players.push(evt.target.experience.id)
        },

        isScrolledIntoView: function( elem ) {
          // again: vars at the top of a function
          var docViewTop = $jq(window).scrollTop(),
              docViewBottom = docViewTop + $jq(window).height(),
              elemTop = $jq(elem).offset().top,
              elemBottom = elemTop + $jq(elem).height();

          //evaluates to true when in view
          return (
            (elemBottom >= docViewTop) && 
            (elemTop <= docViewBottom) && 
            (elemBottom <= docViewBottom) &&
            (elemTop >= docViewTop)
          );
        },

        playPauseInView: function() {
          for (var i = 1; i <= videoIDs.length; i++) {
            var videoName = ".video__" + i
           
            if ( this.isScrolledIntoView( videoName )) {
              //if video still replace with video
              if( videoStill(videoName) ){
              	buildVideo(i)
              //else play the video
              } else {
              	player = brightcove.api.getExperience(players[i-1]);               
                videoPlayer = player.getModule(APIModules.VIDEO_PLAYER);
                videoPlayer.play();
                is_playing = true;
                console.log("playing");
              }
              
              console.log("inView"+players[i-1])
            //When video is out of view
            } else {
            		if( !videoStill(videoName) ){
	            		player = brightcove.api.getExperience(players[i-1]);               
	              	videoPlayer = player.getModule(APIModules.VIDEO_PLAYER);           	            		
	            		videoPlayer.pause();
	            		is_playing = false;	            	            	
            			console.log("outOfView"+players[i-1])
            		};
            }
          }; //end of loop
        }        
      }
    }();

    // Scroll event listener
    $jq(window).on("scroll", function(){
      BCTEST.playPauseInView();
    });

    var videoStill = function(videoName){
    	console.log($jq(videoName).children().first().hasClass('figure__media'))
    	return $jq(videoName).children().first().hasClass('figure__media')
    };
  });
}