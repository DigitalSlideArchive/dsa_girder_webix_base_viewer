/* viewer.js

Description:
	This module initializes and defines the configurations for the Openseadragon
	viewer. Any additional configurations and event handlers should be added here.

Dependencies:
	- osd: Openseadragon module

Return:
	- viewer - Openseadragon viewer object
 */

define("viewer", ["osdImgHelper","osd", "pubsub"], function(oshIH, osd, pubsub) {

    var viewer = osd({
        id: 'image_viewer',
        prefixUrl: "bower_components/openseadragon/built-openseadragon/openseadragon/images/",
        navigatorPosition: "BOTTOM_RIGHT",
        showNavigator: true
    });
    
    console.log("Hello world");

    require(["zoomButtons"]);  //this loads after the viewer is created..

//    var imagingHelper = new osdImgHelper.ImagingHelper({ viewer: viewer });



    return viewer;
});
