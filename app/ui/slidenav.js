define("ui/slidenav", ["config", "viewer", "jquery", "webix"], function(config, viewer, $) {

    var thumbnailsPanel = {
        view: "dataview",
        id: "thumbnails",
        select: true,
        template: "<div class='webix_strong'>#name#</div><img src='" + config.BASE_URL + "/item/#_id#/tiles/thumbnail'/>",
        datatype: "json",
        type: {
            height: 170,
            width: 200
        },
        on: {
            "onItemClick": function(id, e, node) {
                var item = this.getItem(id);
                var url = config.BASE_URL + "/item/" + item._id + "/tiles";

                $.get(url, function(tiles){
                    tileSource = {
                        width: tiles.sizeX,
                        height: tiles.sizeY,
                        tileWidth: tiles.tileWidth,
                        tileHeight: tiles.tileHeight,
                        minLevel: 0,
                        maxLevel: tiles.levels - 1,
                        getTileUrl: function(level, x, y) {
                            return config.BASE_URL + "/item/" + item._id + "/tiles/zxy/" + level + "/" + x + "/" + y;
                        }
                    };

                    viewer.open(tileSource);
                });
            }
        }
    };

    //dropdown for slide groups
    //Data is pulled from DAS webservice
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
            "onChange": function(id) {
                var item = this.getPopup().getBody().getItem(id);
                
                $.get(config.BASE_URL + "/folder?parentType=folder&parentId=" + item._id, function(data){
                    var sFoldersMenu = $$("samples").getPopup().getList();
                    sFoldersMenu.clearAll();
                    sFoldersMenu.parse(data);
                    $$("samples").setValue(data[0].id);
                });
            },
            "onAfterRender": webix.once(function() {
                $.get(config.BASE_URL + "/resource/lookup?path=/collection/" + config.COLLECTION_NAME)
                 .then(function(collection){
                    return $.get(config.BASE_URL + "/folder?parentType=collection&parentId=" + collection._id);
                }).then(function(folders){
                    var foldersMenu = $$("slideset").getPopup().getList();
                    foldersMenu.clearAll();
                    foldersMenu.parse(folders);
                    $$("slideset").setValue(folders[0].id);
                    return $.get(config.BASE_URL + "/folder?parentType=folder&parentId=" + folders[0]._id);
                }).then(function(data){
                    var sFoldersMenu = $$("samples").getPopup().getList();
                    sFoldersMenu.clearAll();
                    sFoldersMenu.parse(data);
                    $$("samples").setValue(data[0].id);
                    return $.get(config.BASE_URL + "/item?limit=500&folderId=" + data[0]._id);
                }).done(function(data){
                    $$("thumbnails").clearAll();
                    $$("thumbnails").parse(data);
                })
            })
        }
    };

    samples_dropdown = {
        view: "combo",
        placeholder: "Select Sample",
        id: "samples",
        options: {
            body: {
                template: "#name#"
            }
        },
        on: {
            "onChange": function(id) {
                var item = this.getPopup().getBody().getItem(id);
                var thumbs = $$("thumbnails");
                var url = config.BASE_URL + "/item?limit=500&folderId=" + item._id;
                thumbs.clearAll();
                thumbs.load(url);
            }
        }
    };

    //slides panel is the left panel, contains two rows 
    //containing the slide group dropdown and the thumbnails panel 
    var wideIcon = "<span class='aligned wide webix_icon fa-plus-circle'></span>";
    var narrowIcon = "<span class='aligned narrow webix_icon fa-minus-circle'></span>";
    var slidesPanel = {
        id: "slidenav",
        header: "Slides " + wideIcon + narrowIcon,
        onClick:{
            wide:function(event, id){
              $$("viewer_panel").config.width = 1;
              $$(id).config.width = null; 
              $$("root").resize();
              return false;
            }, 
            narrow:function(event, id){
              $$(id).config.width = 220;
              $$("viewer_panel").config.width = null; 
              $$("root").resize();
              return false;
            }
        },
        body: {
            rows: [
                dropdown, samples_dropdown, thumbnailsPanel
            ]
        },
        width: 220
    };


    return slidesPanel;
});
