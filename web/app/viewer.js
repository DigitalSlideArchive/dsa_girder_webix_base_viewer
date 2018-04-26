/* viewer.js

Description:
	This module initializes and defines the configurations for the Openseadragon
	viewer. Any additional configurations and event handlers should be added here.

Dependencies:
	- osd: Openseadragon module

Return:
	- viewer - Openseadragon viewer object
 */

define("viewer", ["osdImgHelper","osd", "pubsub","config"], function(oshIH, osd, pubsub,config) {

    var viewer = osd({
        id: 'image_viewer',
        prefixUrl: "bower_components/openseadragon/built-openseadragon/openseadragon/images/",
        navigatorPosition: "BOTTOM_RIGHT",
        showNavigator: true
    });

      //this loads after the viewer is created..

       console.log(config);
     if ( config.MODULE_CONFIG["zoomButtons"] )  { require(["zoomButtons"])};

    return viewer;
});
