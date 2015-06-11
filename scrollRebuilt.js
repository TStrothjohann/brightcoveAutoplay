var areYouReady = function(){
  if(typeof $ !== "undefined"){
    videosInView();
  } else {
    setTimeout(areYouReady, 200);
  }
};

var videosInView = function(){
  if (typeof jQuery !== 'undefined' || typeof brightcove !== 'undefined') {
  var videoIDs = [], experienceIDs = [], APIModules;
  var excludedVideos = [];
  var videoID   = $( ".video__still" ).parent().attr("data-video"),
      videosource,
      player        = null, 
      videoPlayer   = null;
    
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

    window.BCTEST = function() {
      return {

        onTemplateLoad: function() {
    			console.log("loading");
    			APIModules = brightcove.api.modules.APIModules;      
    		},

    		onTemplateReady: function (evt) {
          console.log("ready")
          playIt(evt.target.experience.id)
        }

      } //end of return
    }();

    // Scroll event listener
    $(window).on("scroll", function(){
      playPauseInView();
    });

    var videoStill = function(videoName){
      return $(videoName).children().first().hasClass('figure__media')
    };

    var catchClick= function(){
      $(".video__still").on("mousedown", function(event){
        excludedVideos.push($(this).parent().attr("data-video"))
      })
    };
    catchClick();

    var stopOtherPlayers = function(experienceID){
      for (var i = experienceIDs.length - 1; i >= 0; i--) {
        if(experienceIDs[i] != experienceID){
          BCTEST.pauseIt(experienceIDs[i]) // logged für jeden PLayer, der gerade nicht existiert Error.
        }
      };
    };

    var buildVideo = function(index){ 
      var videoName = ".video__" + index
      videoSource = '<div class="video__wrapper data-video="'+ videoIDs[index-1] +'">'+'<object id="'+ experienceIDs[index-1] +'" class="BrightcoveExperience">'
            + '<param name="htmlFallback" value="true" /> '
            + '<param name="bgcolor" value="#FFFFFF" />'
            + '<param name="playerID" value="71289488001" />'
            + '<param name="playerKey" value="AQ~~,AAAABDk7jCk~,Hc7JUgOccNp4D5O9OupA8T0ybhDjWLSQ" />'
            + '<param name="isVid" value="true" />'
            + '<param name="isUI" value="true" />'
            + '<param name="dynamicStreaming" value="true" />'
            + '<param name="@videoPlayer" value="'+ videoIDs[index-1] +'" />'
            + '<param name="includeAPI" value="true" />'
            + '<param name="templateLoadHandler" value="BCTEST.onTemplateLoad()" />'
            + '<param name="templateReadyHandler" value="BCTEST.onTemplateReady" />'
            + '<param name="autoStart" value="false" />'
            + '</object></div>'
        $( videoName ).empty().append( videoSource );
        brightcove.createExperiences();
        if($( videoName ).parent().hasClass("figure-stamp")){
						$( videoName ).css({ "width": "100%", "float": "none" })
				}
    };

    var playIt = function(experienceID){ 
     	if(typeof experienceID !== "undefined"){         
       	player = brightcove.api.getExperience(experienceID);
      }               
      if(typeof player !== "undefined"){
       	videoPlayer = player.getModule(APIModules.VIDEO_PLAYER);          
       	videoPlayer.play(); 
       	//stopOtherPlayers(experienceID);
      }         
    };


    var pauseIt = function(experienceID){
    	if(typeof experienceID !== "undefined"){
    		player = brightcove.api.getExperience(experienceID);               
    	}
      
      if(typeof player !== "undefined"){
      	videoPlayer = player.getModule(APIModules.VIDEO_PLAYER);                            
      	videoPlayer.pause();
      }
    };

	  var playPauseInView = function() {
	    for (var i = 1; i <= videoIDs.length; i++) {
	      var videoName = ".video__" + i
	     
	      if ( isScrolledIntoView( videoName )) {
	        if( videoStill(videoName) && excludedVideos.indexOf(videoIDs[i-1]) == -1 ){
	          buildVideo(i)
	        } else {
	          if(excludedVideos.indexOf(videoIDs[i-1]) == -1){
	            playIt(experienceIDs[i-1])
	          }                
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
} 
}



areYouReady();