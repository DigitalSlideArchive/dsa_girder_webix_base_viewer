require(["pubsub", "slide", "config", "webix"], function(pubsub, slide, config) {

    /*
    This will add a panel on the right to view slide macro and label image 
    and also metadata eleents pop up on the bottom panel
     */




    slideParams = "?height=300" /* can set width/height of the macro image */
    labelImg = config.BASE_URL + "/item/#_id#/tiles/images/label" + slideParams
    macroImg = config.BASE_URL + "/item/#_id#/tiles/images/macro" + slideParams

    //HOW TO REMOVE UNDERLINES
    //<textarea spellcheck="false"> or <input type="text" spellcheck="false">

    //How to not display the img ICON if img not available..
     // onerror="this.style.display='none'"/>

    imgId = "596e284592ca9a000d23e8b7"
    var labelMacroPanel = {
        view: "template",
        id: "macro",
        template: " <div class='webix_strong'>#name#</div><img id='labelImg' src='" + labelImg + "'><img id='macroImg' src='" + macroImg + "'>",
            type: {
                height: 170,
                width: 200
            },
    }


    pubsub.subscribe("SLIDE", function(msg, slide) {
        // initialize the geojs viewer

        console.log(slide);
        $$("slideName").setValue(slide["name"]);
        macroData = { "_id": slide['_id'], "name": slide["name"] }

        /*This will display all the metaData Items for the current slide...*/ 


        $$("metaDataList").clearAll();


        /* This is not very intuitively written, but basically it iterates through the metaData
        associated with a slide, and for every K --> Key it prints out the corresponding V-->Value */
        for (var k in slide.meta) {
        $$("metaDataList").add({"k":k, "v": slide.meta[k]} )
                }
        
        $$("macro").parse(macroData);
    });


    sampleImg = "";
    imgMacroView = { id: "metaDataList", view: "list", template: "#k# #v#" };

    var DEBUG = false;

    function updateGroups(id) {
        curSlideName = $$("slideName").getValue();
        webix.message(curSlideName);
        webix.message(slide['_id']);

        var url = config.BASE_URL + "/item/" + slide._id;
        if (DEBUG) console.log(url);
        webix.ajax().put(url, { "name": curSlideName }, function(text, xml, xhr) {
            // response
            if (DEBUG)
                console.log("Successfully updated girder with new slide name");
            //console.log(text);
        });
    }



    $$("layout_body").addView({
        view: "accordion",
        multi: true,
        id: "slideDetailPanel",
        gravity: 0.3,
        cols: [{
            header: "slideDetails",
            body: {
                rows: [{
                        cols: [
                            { view: "button", id: "BrainIDB", value: "Update", borderless: true, autowidth: true, click: updateGroups },
                            { view: "text", id: "slideName", label: 'Name', labelPosition: "top", value: "" }
                        ]
                    },
                    { header: "Label/MacroImages", body: labelMacroPanel },
                    { header: "MetaData Widget", body: imgMacroView }
                ]
            }
        }]
    })

});