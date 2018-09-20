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

define("tcgaCached/main", ["tcgaCached/slidenav", "common/toolbar", "common/header", "common/footer", "webix"], function(slidenav, toolbar, header, footer) {


    rightPanelStub = {
                multi:true,
                view:"accordion",
                gravity: 0.3,
                id: "rightPanelStub",
                // collapsed: true,
                collapsed: false,
                cols:[
                    { header:"SimpleAnnotator",  id: "tcgaRightAccordion",
                    body: { view:"layout", id: "tcgaRightAccordionBody", rows: [ { template: "content 1",  id: "tcgaRightplaceHolder", gravity: 0.01} ]},
                            // , width:150
                        }
                ]
            };


    function init() {
        //This is the Openseadragon layer
        viewerPanel = {
            id: "viewer_root",
            borderless: true,
            rows: [
                toolbar,
                {
                    id: "viewer_body",
                    cols: [
                        { view: "template", id: "viewer_panel", content: "geo_osd" }
                        // { gravity: 0.2, collapsed: true, view: "accordion", multi: true, id: , 
                        // body: { rows: [{ template: "HI" }] } }
                    ]
                }
            ]
        };
        //properties for dynamic edits are $$("tcgaRightPanel).define("width", 300) and then $$("tcgaRightPanel").resize();
        //Render the main layout
        //It contains the header, slidenav, Openseadragon layer
        webix.ui({
            container: "main_layout",
            id: "root",
            rows: [
                header, {
                    id: "mainSlidePanel", cols: [
                        slidenav, {
                            view: "resizer"
                        },
                        {

                            rows: [

                                viewerPanel,
                                footer
                            ]
                        }
                    ]
                }
            ]
        });
    }

    return {
        init: init
    }
});
