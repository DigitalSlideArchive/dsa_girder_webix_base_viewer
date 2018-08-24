/* viewer.js

Description:
	This module initializes and defines the configurations for the Openseadragon
	viewer. Any additional configurations and event handlers should be added here.

Dependencies:
	- osd: Openseadragon module

Return:
	- viewer - Openseadragon viewer object
 */

// define(["osdImgHelper","osd", "pubsub","config"], function(oshIH, osd, pubsub,config) {
  define(["osd", "config", "pubsub","svg"], function(osd, config, pubsub) {

    var viewer = osd({
        id: 'image_viewer',
        prefixUrl: "node_modules/openseadragon/build/openseadragon/images/",
        navigatorPosition: "BOTTOM_RIGHT",
        showNavigator: true
    });

      //this loads after the viewer is created..

     if ( config.MODULE_CONFIG["zoomButtons"] )  { require(["zoomButtons"])};

	viewer.svgOverlay();

    return viewer;
});
