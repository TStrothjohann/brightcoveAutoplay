if (typeof jQuery !== 'undefined' || typeof brightcove !== 'undefined') {
  var videoIDs = []
  var $jq = jQuery.noConflict();

  $jq(document).ready( function() {
    $jq( '.video__still' ).each(function(i) {
      i = i+1;
      $jq(this).addClass('video__' + i);
    });

    //Push all video ids into videoIDs Array
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
        videoplayer   = null, 
        players = [],
        APIModules;

        var buildVideo = function(index){
          
          videosource = '<div class="video__wrapper data-video="'+ videoIDs[index] +'">'+'<object id="myExperience'+ videoIDs[index] +'" class="BrightcoveExperience">'
                + '<param name="htmlFallback" value="true" /> '
                + '<param name="bgcolor" value="#FFFFFF" />'
                + '<param name="width" value="580" />'
                + '<param name="height" value="326" />'
                + '<param name="playerID" value="71289488001" />'
                + '<param name="playerKey" value="AQ~~,AAAABDk7jCk~,Hc7JUgOccNp4D5O9OupA8T0ybhDjWLSQ" />'
                + '<param name="isVid" value="true" />'
                + '<param name="isUI" value="true" />'
                + '<param name="dynamicStreaming" value="true" />'
                + '<param name="@videoPlayer" value="'+ videoIDs[index] +'" />'
                + '<param name="includeAPI" value="true" />'
                + '<param name="templateLoadHandler" value="BCTEST.onTemplateLoad" />'
                + '<param name="templateReadyHandler" value="BCTEST.onTemplateReady" />'
                + '<param name="autoStart" value="false" />'
                + '</object></div>'
            return videosource
        };

      return {
        onTemplateLoad: function( experienceID ) {
          players.push(experienceID);
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

        isScrolledIntoView: function( elem ) {
          // again: vars at the top of a function
          var docViewTop = $jq(window).scrollTop(),
            docViewBottom = docViewTop + $jq(window).height(),
            elemTop = $jq(elem).offset().top,
            elemBottom = elemTop + $jq(elem).height();

          return (
            (elemBottom >= docViewTop) && 
            (elemTop <= docViewBottom) && 
            (elemBottom <= docViewBottom) &&
            (elemTop >= docViewTop)
          );
        },

        checkIfVideoInView: function() {
          for (var i = 1; i <= videoIDs.length; i++) {
            
            var videoName = ".video__" + i
            var videoNameClass = videoName + ' .figure__media'

            if ( this.isScrolledIntoView( videoName ) ) {
              if( $jq( videoNameClass ).size() > 0 ) {
                is_rendering = true;
                
                $jq( videoName ).empty().append( buildVideo(i-1) );
                brightcove.createExperiences();
              } else {
                if( !is_rendering && videoplayer !== null && !is_playing ) {                             
                  player = brightcove.api.getExperience(players[i-1]);
                  videoPlayer = player.getModule(APIModules.VIDEO_PLAYER);
            
                  videoPlayer.play();
                  is_playing = true;
                  console.log("playing");
                }
              }
            } else {
              if( is_playing && videoplayer !== null ) {
                player = brightcove.api.getExperience(players[i-1]);
                videoPlayer = player.getModule(APIModules.VIDEO_PLAYER);
                videoPlayer.pause();
                is_playing = false;
                console.log("pause");
              }
            }
          }; //end of loop
        }
        
      }
    }();


    $jq(window).on("scroll", function(){
      BCTEST.checkIfVideoInView();
    });
  });
}


