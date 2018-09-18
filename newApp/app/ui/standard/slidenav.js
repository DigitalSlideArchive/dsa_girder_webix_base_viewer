// define("standard/slidenav", ["config", "viewer", "slide", "session", "jquery", "webix"], function(config, viewer, slide, session, $) {
define(["config", "slide", 'jquery', "webix"], function(config, slide, $) {
    var subfolders = '';

    function recomputePagerItems() {
        var itemWidth = $$("slideSelector").config.type.width;
        var itemHeight = $$("slideSelector").config.type.height;
        var dataWidth = $$("slideSelector").$width;
        var dataHeight = $$("slideSelector").$height;

        var pagerSize = $$("slideSelector").getPager().config.size;

        /* Compute items per row and items per column */
        thumbsPerRow = Math.floor(dataWidth / itemWidth);
        if (thumbsPerRow < 1) { thumbsPerRow = 1 }

        thumbsPerCol = Math.floor(dataHeight / itemHeight);
        if (thumbsPerCol < 1) { thumbsPerCol = 1 }
        //    console.log(thumbsPerCol,thumbsPerRow);

        pagerSize = thumbsPerCol * thumbsPerRow;
        $$("slideSelector").getPager().define({ size: pagerSize });
        $$("slideSelector").refresh()
    }

    function makePromise(url) {
        // Sets up a promise in the proper way using webix
        return new webix.promise(function(success, fail) {
            webix.ajax(url, function(text) {
                if (text) success(text);
                else fail(text.error)
            })
        })
    }

    $.extend({
        getQueryParameters: function(str) {
            return (str || document.location.search).replace(/(^\?)/, '').split("&").map(function(n) { return n = n.split("="), this[n[0]] = n[1], this }.bind({}))[0];
        }
    });


    function girderHelpers(requestType, girderObjectID = null) {
        switch (requestType) {
            case 'getCollURL':
                url = config.BASE_URL + "/resource/lookup?path=collection/" + config.COLLECTION_NAME;
                promise = makePromise(url);
                break;
            case 'listFoldersInCollection':
                url = config.BASE_URL + "/folder?limit=1000&parentType=collection&parentId=" + girderObjectID;
                promise = makePromise(url);
                break;
            case 'listFoldersinFolder':
                url = config.BASE_URL + "/folder?limit=5000&parentType=folder&parentId=" + girderObjectID;
                url = config.BASE_URL + "/folder?parentType=folder&parentId=" + girderObjectID + "&limit=500";
                promise = makePromise(url);
                break;
                //adrc.digitalslidearchive.emory.edu:8080/api/v1/item?folderId=5ad11d6a92ca9a001adee5b3&limit=50&sort=lowerName&sortdir=1
            case 'listItemsInFolder':
                url = config.BASE_URL + "/item?folderId=" + girderObjectID + "&limit=5000"
                // url = config.BASE_URL + "/item?limit=500&folderId=" + girderObjectID;
                promise = makePromise(url);
                break;
            case 'recurseGetItems':
                url = config.BASE_URL + "/resource/" + girderObjectID + "/items?type=folder&limit=5000&sort=_id&sortdir=1";
                promise = makePromise(url);
                break;
            default:
                console.log("No case found.....errors will happen");
        }
        return promise;
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
                // onItemClick : function(id) {
                //     // Get the item selected
                //     // console.log($$("thumbnails").getItem(id));
                // },
                onAfterSelect: function(id) {
                    var item = this.getItem(id);
                    if (config.UI == "standard") {
                        slide.init(item);

                    } else {
                        webix.message("Could not find an appropriate action to take.")
                    }

                    // THIS IS THE TAGGER LOGIC, ONLY RUNS IF tagger IS SET TO TRUE IN config.js
                    if (config.MODULE_CONFIG["tagger"]) {
                        // change the slide label
                        $$("slideLabel").define("template",
                            "<img src='http://adrc.digitalslidearchive.emory.edu:8080/api/v1/item/" + item._id + "/tiles/images/label?width=256&height=256&encoding=JPEG' />")
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
                    // END OF THE TAGGER LOGIC
                },
                onAfterLoad: function() {
                    //////////////////////// this runs everytime you reload what is on the slideseletor....
                    firstId = $$("slideSelector").getFirstId()
                    $$("slideSelector").select(firstId);

                }
            }
        };
    } else if (config.SLIDE_SELECTOR == 'table') {
        ColList = [
            { id: "name", sort: "string" },
            { id: "_id", sort: "string" },
            // {id: "Stain", map:"#meta.tags.Stain#", sort: "string"}
            // {id: "Stain", sort:"string",header:["Stain",{content:"selectFilter"}],editor:"text"},
        ];


        slideSelector = {
            view: "datatable",
            id: "slideSelector",
            // map: {
            //     // 'Stain': "#meta.tags.Stain#"
            // },
            columns: ColList,
            rowHeight: 100,
            select: "row",
            // autowidth: true,
            autoConfig: true,
            columnWidth: 200,
            // editable:false,
            // editaction:"none",  
            on: {
                onAfterSelect: function(id) {
                    var item = this.getItem(id);
                    if (config.UI == "standard") {
                        slide.init(item);

                    } else {
                        webix.message("Could not find an appropriate action to take.")
                    };

                    // THIS IS THE TAGGER LOGIC, ONLY RUNS IF tagger IS SET TO TRUE IN config.js
                    if (config.MODULE_CONFIG["tagger"]) {
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
                },
                onAfterLoad: function() {
                    firstId = $$("slideSelector").getFirstId();
                    $$("slideSelector").select(firstId);

                    $$("item_pager").setPage(0);
                    $$("slideSelector").scrollTo(0)
                }
            }
        };
    }

    itemFilter =
        {
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
        id: "item_pager",
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
                template: "#name#"
            }
        },
        on: {
            onAfterRender: webix.once(function() {
                var folderssave = '';
                var subfoldersave = '';
                var slidessave = '';
                // a series of girder get calls. 
                // First get the collection id by using its name (from Config)
                girderHelpers('getCollURL').then(function(collection) {
                    var collId = JSON.parse(collection)._id
                    return girderHelpers('listFoldersInCollection', collId);
                }).then(function(folders) {
                    folders = JSON.parse(folders);
                    folderssave = folders;
                    var foldersMenu = $$("slideset").getPopup().getList();
                    foldersMenu.clearAll();
                    ////////////////    FILLING THE FIRST COMBO BOX, THIS SHOULD ALWAYS BE DONE, DON'T CHANGE   /////////////////////////////////////////////////////////////////////
                    foldersMenu.parse(folders);
                    //////////////////  NORMALLY THE NEXT GIRDER CALL STARTS WITH THE ZERO INDEX OF folders. IF   ///////////////////////////////////////////////////////////////
                    //////////////////  HOWEVER YOU WANT TO START ON A DIFFERENT FOLDER, GIVE THE CORRECT INDEX   ///////////////////////////////////////////////////////////////
                    //return girderHelpers('listFoldersinFolder', folders[correctId]._id);
                    return girderHelpers('listFoldersinFolder', folders[0]._id);
                }).then(function(folders2) {
                    folders2 = JSON.parse(folders2)
                    // Based on if there is folders inside the first folder selected, it migiht create another combo
                    // before filling the slideSelector
                    if (folders2.length == 0) {
                        $$("slideset").attachEvent("onChange", function(id) {
                            var folder = this.getPopup().getBody().getItem(id);
                            // need to render the new items
                            girderHelpers('listItemsInFolder', folder._id).then(function(items) {
                                items = JSON.parse(items);
                                items = items.filter(function(item) {
                                    return item.largeImage != undefined;
                                })
                                $$("slideSelector").clearAll();
                                $$("slideSelector").parse(items);
                                $$("slideSelector").refresh();
                            })
                        });
                        ////////////////////    If there is no second layer, then choose the correct slide here   /////////////////////////////////////////////
                        // $$("slideSelector").select(myItemId) // should not be the girder id, but the webix id 
                    } else {
                        // This is if there is another layer.
                        // appends the new combo view after the first one 
                        $$("combos").addView({
                            view: "combo",
                            id: "subcombo",
                            options: { body: { template: "#name#" } }
                        }, 1)
                        $$("slideset").attachEvent("onChange", function(id) {
                            var folder = this.getPopup().getBody().getItem(id);
                            girderHelpers('listFoldersinFolder', folder._id).then(function(subfolders) {
                                subfolders = JSON.parse(subfolders);
                                subfoldersave = subfolders;
                                var subfoldersMenu = $$("subcombo").getPopup().getList();
                                subfoldersMenu.clearAll();
                                subfoldersMenu.parse(subfolders);
                                $$("subcombo").setValue(subfolders[0].id) // note: setting to first value in combo
                            })
                        })

                        ////////////////////////////// HERE SET THE VALUE OF THE FIRST COMBO BOX TO WHAT YOU WANT FOR THE 
                        // INITIAL RENDER OF THE SITE
                        $$("subcombo").attachEvent("onChange", function(id) {
                            // ATTACHING EVENT TO SUBCOMBO BOX
                            // AGAIN DON'T CHANGE THE 
                            subfld_id = this.getPopup().getBody().getItem(id)._id;
                            if (config.VIRTUAL) {
                                promise = girderHelpers('listItemsInFolder', subfld_id);
                            } else {
                                promise = girderHelpers('recurseGetItems', subfld_id);
                            }
                            promise.then(function(items) {
                                items = JSON.parse(items);
                                items = items.filter(function(item) {
                                    return item.largeImage != undefined;
                                })
                                slidessave = items;
                                $$("slideSelector").clearAll();
                                $$("slideSelector").parse(items);
                                $$("slideSelector").refresh();
                            })
                        })
                        //////////////////////////// if this doesn't work then maybe start here??????
                    }
                });
                webix.delay(function() {
                    if (folderssave != '') {
                        ////////////////////////////    Oh crap, this is where you can set the initial stuff ... =(((())))

                        qp = $.getQueryParameters();


                        var folderssave_IDX = 0;
                        var subfoldersave_IDX = 0;


                        if (qp.cohort) {
                            folderssave.forEach(function(k, v) {
                                if (k.name == qp.cohort) {
                                    folderssave_IDX = v;
                                }
                            })
                        }


                        $$("slideset").setValue(folderssave[folderssave_IDX].id);
                        webix.delay(function() {
                            if (qp.patientID) {
                                subfoldersave.forEach(function(k, v) {
                                    if (k.name == qp.patientID) {
                                        subfoldersave_IDX = v;
                                    }
                                })
                            }


                            $$("subcombo").setValue(subfoldersave[subfoldersave_IDX].id)
                            webix.delay(function() {
                                $$("slideSelector").select(slidessave[0].id);
                            }, '', [], 500);
                        }, '', [], 500);
                    }
                }, '', [], 1000);

            })
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
            recomputePagerItems();
        })
    }

    return slidesPanel;
});