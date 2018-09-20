/* ui/main.js

Description:
    This module renders the UI. It combines the different UI components
    returned from the submodules and renders one UI.

Dependencies:
    - header: header component
    - filters: filters components used to control the brightness/contrast, etc. of the slide
    - slidenav: the left panel that contains the thumbnails, dropdown and search
    - toolbar: contains additional buttons setting on top the slide

Return:
    - viewer - Openseadragon viewer object
 */

// define("ui/main", ["standard", "tcga", "config"], function(standard, tcga, config) {
define(["config", "standard","tcga","tcgaCached"], function(config, standard,tcga,tcgaCached) {

    function init(){
        switch(config.UI){
            case "standard":
                standard.init();
                break;
            case "tcga":
                tcga.init();
                break;
            case "tcgaCached":
		console.log("Trying to load Cached TCGA Version...");
                tcgaCached.init();
                break;

            default:
                console.error("Invalid configuration: " + config.UI + " UI not found");
        }

        webix.event(window, 'resize', function(){
            $$("root").resize();
        });
    }
   
    return {
        init: init
    }
});
