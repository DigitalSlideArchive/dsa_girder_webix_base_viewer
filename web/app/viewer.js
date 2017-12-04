/* viewer.js

Description:
	This module initializes and defines the configurations for the Openseadragon
	viewer. Any additional configurations and event handlers should be added here.

Dependencies:
	- osd: Openseadragon module

Return:
	- viewer - Openseadragon viewer object
 */

define("viewer", ["osdImgHelper","osd", "pubsub"], function(meh, osd, pubsub) {

    var viewer = osd({
        id: 'image_viewer',
        prefixUrl: "bower_components/openseadragon/built-openseadragon/openseadragon/images/",
        navigatorPosition: "BOTTOM_RIGHT",
        showNavigator: true
    });
    
//    var imagingHelper = new osdImgHelper.ImagingHelper({ viewer: viewer });



    return viewer;
});
