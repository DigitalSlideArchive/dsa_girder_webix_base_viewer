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

define("standard/main", ["standard/slidenav", "common/toolbar", "common/header", "webix"], function(slidenav, toolbar, header) {

    function init() {
        //This is the Openseadragon layer
        viewerPanel = {
            id: "viewer_root",
            borderless: true,
            rows: [
                toolbar,
                {
                    id: "viewer_panel",
                    view: "template",
                    content: "geo_osd"
                }
            ]
        };
        
        //Render the main layout
        //It contains the header, slidenav, Openseadragon layer
        webix.ui({
            container: "main_layout",
            id: "root",
            rows: [
                header, 
                {   id: "layout_body",
                    cols: [
                        slidenav, {
                            view: "resizer"
                        },
                        viewerPanel
                    ]
                }
            ]
        });

    }

    return {
        init: init
    }
});