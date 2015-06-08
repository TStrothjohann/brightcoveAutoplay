if (typeof jQuery !== 'undefined' || typeof brightcove !== 'undefined') {
  var videoIDs = [], experienceIDs = [], APIModules;
  var excludedVideos = [];
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
        var experienceID = 'myExperience' + $jq(this).attr('data-video')
        experienceIDs.push(experienceID)    
    });

    window.BCTEST = function() {
      var videoID   = $jq( ".video__still" ).parent().attr("data-video"),
      videosource,
      player      = null, 
      videoPlayer   = null;

      var buildVideo = function(index){ 
      	var videoName = ".video__" + index
        videoSource = '<div class="video__wrapper data-video="'+ videoIDs[index-1] +'">'+'<object id="'+ experienceIDs[index-1] +'" class="BrightcoveExperience">'
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
          APIModules = brightcove.api.modules.APIModules;
          console.log("loading");
        },

        onTemplateReady: function (evt) {
          BCTEST.playIt(evt.target.experience.id)
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
              if( videoStill(videoName) && excludedVideos.indexOf(videoIDs[i-1]) == -1 ){
              	buildVideo(i)
              } else {
              	if(excludedVideos.indexOf(videoIDs[i-1]) == -1){
                  this.playIt(experienceIDs[i-1])
                }                
              }             
            //When video is out of view
            } else {
	          		if( !videoStill(videoName) && excludedVideos.indexOf(videoIDs[i-1]) == -1 ){
           	      this.pauseIt(experienceIDs[i-1])	
	          		};
            }
          }; //end of loop
        },

        pauseIt: function(experienceID){
		      player = brightcove.api.getExperience(experienceID);               
        	videoPlayer = player.getModule(APIModules.VIDEO_PLAYER);           	            		
      		videoPlayer.pause();
        },

        playIt: function(experienceID){          
        	player = brightcove.api.getExperience(experienceID);               
          videoPlayer = player.getModule(APIModules.VIDEO_PLAYER);          
          videoPlayer.play(); 
          stopOtherPlayers(experienceID);       	
        }


      } //end of return
    }();

    // Scroll event listener
    $jq(window).on("scroll", function(){
      BCTEST.playPauseInView();
    });

    var videoStill = function(videoName){
    	return $jq(videoName).children().first().hasClass('figure__media')
    };

    var catchClick= function(){
      $jq(".video__still").on("mousedown", function(event){
        excludedVideos.push($jq(this).parent().attr("data-video"))
      })
    };
    catchClick();

    var stopOtherPlayers = function(experienceID){
      for (var i = experienceIDs.length - 1; i >= 0; i--) {
        if(experienceIDs[i] != experienceID){
          BCTEST.pauseIt(experienceIDs[i])
        }
      };
    }
  });
}