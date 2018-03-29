define("standard/slidenav", ["config", "viewer", "slide", "session", "jquery", "webix"], function(config, viewer, slide, session, $) {


    function recomputePagerItems() {
        var itemWidth = $$("thumbnails").config.type.width;
        var itemHeight = $$("thumbnails").config.type.height;
        var dataWidth = $$("thumbnails").$width;
        var dataHeight = $$("thumbnails").$height;

        var pagerSize = $$("thumbnails").getPager().config.size;

        /* Compute items per row and items per column */
        thumbsPerRow = Math.floor(dataWidth / itemWidth);
        if (thumbsPerRow < 1) { thumbsPerRow = 1 }

        thumbsPerCol = Math.floor(dataHeight / itemHeight);
        if (thumbsPerCol < 1) { thumbsPerCol = 1 }
        //    console.log(thumbsPerCol,thumbsPerRow);

        pagerSize = thumbsPerCol * thumbsPerRow;

        console.log(pagerSize);
        $$("thumbnails").getPager().define({ size: pagerSize });
        $$("thumbnails").refresh()
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
                        $$("thumbnails").filter(function(obj) { //here it filters data!
                            // console.log(obj);
                            // console.log(value);
                            // console.log(obj.name);
                            return obj.name.toLowerCase().indexOf(value) != -1
                        })
                    }
                }
            }]
        }


    //Note we have a TWO or THREE DropDown version--- samples and subsamples are defined
    //note  .id is a WEBIX defined property,  ._id the Mongo/Girder Collection UID

    function girderHelpers(requestType, girderObjectID) {
        switch (requestType) {
            case 'getCollURL':
                url = config.BASE_URL + "/resource/lookup?path=/collection/" + config.COLLECTION_NAME;
                return $.get(url);
                break;
            case 'listFoldersInCollection':
                url = config.BASE_URL + "/folder?limit=1000&parentType=collection&parentId=" + girderObjectID;
                return $.get(url);
                break;
            case 'listFoldersinFolder':
                url = config.BASE_URL + "/folder?parentType=folder&parentId=" + girderObjectID;
                return $.get(url);
                break;
            case 'listItemsInFolder':
                url = config.BASE_URL + "/item?limit=500&folderId=" + girderObjectID;
                return $.get(url);

                break;
        }
        return 'RUH ROH';
    }


    var thumbnailsPanel = {
        view: "dataview",
        id: "thumbnails",
        select: true,
        template: "<div class='webix_strong'>#name#</div><img src='" + config.BASE_URL + "/item/#_id#/tiles/thumbnail'/>",
        pager: "item_pager",
        datatype: "json",
        datafetch: 5,
        type: {
            height: 170,
            width: 200
        },
        on: {
            onItemClick: function(id, e, node) {
                var item = this.getItem(id);
                slide.init(item);
            },
            onAfterRender: function() {
                if (this.getFirstId()) {
                    var item = this.getItem(this.getFirstId());
                    slide.init(item);
                }
            }
        }
    };

    itemPager = {
        view: "pager",
        id: "item_pager",
        template: "<center>{common.prev()}{common.page()}/#limit#{common.next()}(#count# slides)</center>",
        animate: true,
        size: 5,
        group: 4
    };

    //dropdown for slide groups
    //Data is pulled from DAS webservice
    dropdown = {
        view: "combo",
        placeholder: "Select Slide Set",
        id: "slideset",
        options: {
            filter: function(item, value) {
                if (item.name.toString().toLowerCase().indexOf(value.toLowerCase()) > -1)
                    return true;
                return false;
            },
            body: {
                template: "#name#"
            }
        },
        on: {
            onChange: function(id) {
                var item = this.getPopup().getBody().getItem(id);
                //item is an object with all the info about the currently selected slide

                girderHelpers('listFoldersInCollection').then(function(folders) {
                    var sFoldersMenu = $$("samples").getPopup().getList();
                    sFoldersMenu.clearAll();
                    folders = folders.filter(function(folder) {
                        return !folder.name.startsWith(".");
                    });
                    sFoldersMenu.parse(folders);
                    $$("samples").setValue(folders[0].id);
                });
            },
            onAfterRender: webix.once(function() {

                girderHelpers('getCollURL')
                    .then(function(collection) {

                        return girderHelpers('listFoldersInCollection', collection._id);
                    }).then(function(folders) {
                        var foldersMenu = $$("slideset").getPopup().getList();
                        foldersMenu.clearAll();
                        folders = folders.filter(function(folder) {
                            return !folder.name.startsWith(".");
                        });
                        foldersMenu.parse(folders);
                        $$("slideset").setValue(folders[0].id);

                        return girderHelpers('listFoldersinFolder', folders[0]._id);
                    }).then(function(folders) {
                        var sFoldersMenu = $$("samples").getPopup().getList();
                        sFoldersMenu.clearAll();
                        folders = folders.filter(function(folder) {
                            return !folder.name.startsWith(".");
                        });
                        sFoldersMenu.parse(folders);
                        $$("samples").setValue(folders[0].id);

                        if (config.THIRD_MENU)
                            return girderHelpers('listFoldersinFolder', folders[0]._id);
                        else
                            return girderHelpers('listItemsInFolder', folders[0]._id);
                    }).then(function(folders) {
                        if (config.THIRD_MENU) {
                            var ssFoldersMenu = $$("subsamples").getPopup().getList();
                            ssFoldersMenu.clearAll();
                            folders = folders.filter(function(folder) {
                                return !folder.name.startsWith(".");
                            });
                            ssFoldersMenu.parse(folders);
                            $$("subsamples").setValue(folders[0].id);
                            return girderHelpers('listItemsInFolder', folders[0]._id);
                        } else {
                            items = folders.filter(function(item) {
                                return item.largeImage != undefined;
                            });

                            $$("thumbnails").clearAll();
                            $$("thumbnails").parse(items);
                        }
                    }).done(function(items) {
                        items = items.filter(function(item) {
                            return item.largeImage != undefined;
                        });
                        $$("thumbnails").clearAll();
                        $$("thumbnails").parse(items);
                    })
            })
        }
    };


    function filterByString(item, value) {
        if (item.name.toString().toLowerCase().indexOf(value.toLowerCase()) > -1)
            return true;
        return false;
    }

    samples_dropdown = {
        view: "combo",
        placeholder: "Select Sample",
        id: "samples",
        options: {
            filter: filterByString,
            body: {
                template: "#name#"
            }
        },
        on: {
            onChange: function(id) {
                var item = this.getPopup().getBody().getItem(id);

                if (config.THIRD_MENU) {
                    girderHelpers('listFoldersinFolder', item._id).then(function(folders) {
                        folders = folders.filter(function(folder) {
                            return !folder.name.startsWith(".");
                        });
                        var sFoldersMenu = $$("subsamples").getPopup().getList();
                        sFoldersMenu.clearAll();
                        sFoldersMenu.parse(folders);
                        $$("subsamples").setValue(folders[0].id);
                    });
                } else {
                    $$("thumbnails").clearAll();
                    girderHelpers('listItemsinFolder', item._id).then(function(items) {
                        items = items.filter(function(item) {
                            return item.largeImage != undefined;
                        });
                        $$("thumbnails").parse(items);
                    })
                }
            }
        }
    };

    subsamples_dropdown = {
        view: "combo",
        placeholder: "Select Folders",
        id: "subsamples",
        options: {
            filter: filterByString,
            body: {
                template: "#name#"
            }
        },
        on: {
            onChange: function(id) {
                var item = this.getPopup().getBody().getItem(id);
                $$("thumbnails").clearAll();

                //                $.get(config.BASE_URL + "/item?limit=5000&folderId=" + item._id, function(items){
                girderHelpers('listItemsInFolder', item._id).then(function(items) {
                    items = items.filter(function(item) {
                        return item.largeImage != undefined;
                    });
                    $$("thumbnails").parse(items);
                })
            }
        }
    };

    var rows = [dropdown, samples_dropdown, itemPager, itemFilter, thumbnailsPanel];
    if (config.THIRD_MENU)
        rows.splice(2, 0, subsamples_dropdown);

    //slides panel is the left panel, contains two rows 
    //containing the slide group dropdown and the thumbnails panel 
    var wideIcon = "<span class='aligned wide webix_icon fa-plus-circle'></span>";
    var narrowIcon = "<span class='aligned narrow webix_icon fa-minus-circle'></span>";
    var slidesPanel = {
        id: "slidenav",
        header: "Slides " + wideIcon + narrowIcon,
        onClick: {
            wide: function(event, id) {
                var count = $$("thumbnails").count();
                this.config.width = 205 * 6;
                this.resize();

                $$("item_pager").config.size = Math.min(30, count);
                $$("item_pager").refresh();
                $$("thumbnails").refresh();
                return false;
            },
            narrow: function(event, id) {
                this.config.width = 220;
                this.resize();

                $$("item_pager").config.size = 5;
                $$("item_pager").refresh();
                $$("thumbnails").refresh();
                return false;
            }
        },
        body: { rows: rows },
        width: 220
    };

  /* Adding a way to dynamically change the number of thumbnails */

    webix.attachEvent("onResize", function() {
        recomputePagerItems();
    })


    return slidesPanel;
});