// define("standard/slidenav", ["config", "viewer", "slide", "session", "jquery", "webix"], function(config, viewer, slide, session, $) {
define(["config", "slide", "dsaHelperFunctions", "jquery", "webix"], function(config, slide, dsa, $) {
    
    config.WinshipAPI = true;


     qp = $.getQueryParameters();

     console.log(qp);

    var subfolders = '';

    function taggerInit() {
        // change the slide label
        $$("slideLabel").define("template", "<img src='http://adrc.digitalslidearchive.emory.edu:8080/api/v1/item/" + item._id + "/tiles/images/label?width=256&height=256&encoding=JPEG' />")
        $$("slideLabel").refresh();
        // need the url to check if metadata is present for this item
        url = config.BASE_URL + '/item/' + item._id;
        // check if the item has metadata at all, if it doesn't add it
        if (!("meta" in item)) {
            item['meta'] = {}
            webix.ajax().put(url, { "metadata": { "tags": {} } }, function(test, xml, xhr) {
                if (alert) {
                    webix.message("Metadata was pushed")
                }
            })
            for (var tag in config.TAGS) {
                $$(tag + "TAG").setValue('')
            }
        } else if (!("tags" in item.meta)) {
            item['meta']['tags'] = {}
            webix.ajax().put(url, { "metadata": { "tags": {} } }, function(test, xml, xhr) {
                if (alert) {
                    webix.message("Metadata was pushed")
                }
            })
            for (var tag in config.TAGS) {
                $$(tag + "TAG").setValue('')
            }
        } else {
            for (var tag in config.TAGS) {
                if (tag in item.meta["tags"]) {
                    $$(tag + "TAG").setValue(item.meta["tags"][tag]);
                } else {
                    $$(tag + "TAG").setValue('');
                }
            }
        }
    }


    if (config.SLIDE_SELECTOR == 'thumbnails') {

        slideSelector = {
            view: "dataview",
            id: "slideSelector",
            select: true,
            template: "<div class='webix_strong'>#name#</div><img src='" + config.BASE_URL + "/item/#_id#/tiles/thumbnail'/>",
            datatype: "json",
            datafetch: 5,
            type: {
                height: 170,
                width: 200
            },
            pager: "item_pager",
            on: {
                onAfterSelect: function(id) {
                    var item = this.getItem(id);
                    if (config.UI == "standard") {
                        slide.init(item);
                    } else {
                        webix.message("Could not find an appropriate action to take.")
                    }
                    // THIS IS THE TAGGER LOGIC, ONLY RUNS IF tagger IS SET TO TRUE IN config.js
                    if (config.MODULE_CONFIG["tagger"]) taggerInit
                    // END OF THE TAGGER LOGIC
                },
                onAfterLoad: function() {
                    //////////////////////// this runs everytime you reload what is on the slideseletor....
                    
                    //winshipMode
                    // if (config.WinshipAPI)
                    // {


                    // }
                    // else{
                        //THIS SELECTS THE FIRST SLIDE/THUMBNAIL

                    firstId = $$("slideSelector").getFirstId()
                    $$("slideSelector").select(firstId);
                    // }
                }
            }
        };
    } else { webix.message("SLIDE SELECTOR CONFIG NOT") }
    // else if (config.SLIDE_SELECTOR == 'table') { REMOVED

    itemFilter = {
        view: "toolbar",
        cols: [{
            view: "search",
            align: "center",
            placeholder: "Search..",
            id: "thumbSearch",
            width: 200,
            on: {
                "onTimedKeyPress": function() {
                    value = this.getValue().toLowerCase();
                    $$("slideSelector").filter(function(obj) { //here it filters data!
                        return obj.name.toLowerCase().indexOf(value) != -1
                    })
                }
            }
        }]
    }

    itemPager = {
        view: "pager",
        id: "itemPager",
        template: "<center>{common.prev()}{common.page()}/#limit#{common.next()}(#count# slides)</center>",
        animate: true,
        size: 5,
        group: 4
    };

    //dropdown for slide groups
    //Data is pulled from DSA webservice
    dropdown = {
        view: "combo",
        placeholder: "Select Slide Set",
        id: "slideset",
        options: {
            body: {
                template: config.SLIDELABELTEMPLATE  //set this from the config
            }
        },
        on: {
            onAfterRender: function() { webix.message("Render this..")}
        }
    };

    //   var rows = [dropdown, samples_dropdown, itemPager, itemFilter, thumbnailsPanel];
    var rows = [dropdown, itemPager, itemFilter, slideSelector]
    //   if (config.THIRD_MENU)
    //       rows.splice(2, 0, subsamples_dropdown);

    //   //slides panel is the left panel, contains two rows 
    //   //containing the slide group dropdown and the thumbnails panel 
    // icons are given in a format that can be rendered in the webix header view (although it is not set with view but with header)
    var wideIcon = "<span class='aligned wide webix_icon fa-plus-circle'></span>";
    var narrowIcon = "<span class='aligned narrow webix_icon fa-minus-circle'></span>";
    var slidesPanel = {
        id: "slidenav",
        header: "Slides " + wideIcon + narrowIcon,
        body: { id: "combos", rows: rows },
        width: 220
    };

    // /* Adding a way to dynamically change the number of wthumbnails */
    if (config.SLIDE_SELECTOR == 'slideSelector') {
        webix.attachEvent("onResize", function() {
            dsa.recomputePagerItems();
        })
    }
    //I can only init the slidesPanel once... I have created the slide panel
    return slidesPanel;
});



// else if (config.SLIDE_SELECTOR == 'table') {
//     ColList = [
//         { id: "name", sort: "string" },
//         { id: "_id", sort: "string" },
//         // {id: "Stain", map:"#meta.tags.Stain#", sort: "string"}
//         // {id: "Stain", sort:"string",header:["Stain",{content:"selectFilter"}],editor:"text"},
//     ];


//     slideSelector = {
//         view: "datatable",
//         id: "slideSelector",
//         // map: {
//         //     // 'Stain': "#meta.tags.Stain#"
//         // },
//         columns: ColList,
//         rowHeight: 100,
//         select: "row",
//         // autowidth: true,
//         autoConfig: true,
//         columnWidth: 200,
//         // editable:false,
//         // editaction:"none",  
//         on: {
//             onAfterSelect: function(id) {
//                 var item = this.getItem(id);
//                 if (config.UI == "standard") {
//                     slide.init(item);

//                 } else {
//                     webix.message("Could not find an appropriate action to take.")
//                 };

//                 // THIS IS THE TAGGER LOGIC, ONLY RUNS IF tagger IS SET TO TRUE IN config.js
//                 if (config.MODULE_CONFIG["tagger"]) {
//                     // need the url to check if metadata is present for this item
//                     url = config.BASE_URL + '/item/' + item._id;
//                     // check if the item has metadata at all, if it doesn't add it
//                     if (!("meta" in item)) {
//                         item['meta'] = {}
//                         webix.ajax().put(url, { "metadata": { "tags": {} } }, function(test, xml, xhr) {
//                             if (alert) {
//                                 webix.message("Metadata was pushed")
//                             }
//                         })
//                         for (var tag in config.TAGS) {
//                             $$(tag + "TAG").setValue('')
//                         }
//                     } else if (!("tags" in item.meta)) {
//                         item['meta']['tags'] = {}
//                         webix.ajax().put(url, { "metadata": { "tags": {} } }, function(test, xml, xhr) {
//                             if (alert) {
//                                 webix.message("Metadata was pushed")
//                             }
//                         })
//                         for (var tag in config.TAGS) {
//                             $$(tag + "TAG").setValue('')
//                         }
//                     } else {
//                         for (var tag in config.TAGS) {
//                             if (tag in item.meta["tags"]) {
//                                 $$(tag + "TAG").setValue(item.meta["tags"][tag]);
//                             } else {
//                                 $$(tag + "TAG").setValue('');
//                             }
//                         }
//                     }
//                 }
//             },
//             onAfterLoad: function() {
//                 firstId = $$("slideSelector").getFirstId();
//                 $$("slideSelector").select(firstId);

//                 $$("item_pager").setPage(0);
//                 $$("slideSelector").scrollTo(0)
//             }
//         }
//     };
// }