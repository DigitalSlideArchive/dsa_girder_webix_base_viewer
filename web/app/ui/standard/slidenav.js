define("standard/slidenav", ["config", "viewer", "slide", "session", "jquery", "webix"], function(config, viewer, slide, session, $) {



/*    if(session.valid()){
        $.ajaxSetup({
            headers: {'Girder-Token': session.token()}
        });

        webix.ajax().headers({
            'Girder-Token': session.token()
        });

        webix.attachEvent("onBeforeAjax", 
            function(mode, url, data, request, headers, files, promise){
                headers["Girder-Token"] = session.token();
            }
        );
    }
    
*/
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
            onAfterRender: function(){
                if(this.getFirstId()){
                    var item = this.getItem(this.getFirstId());
                    slide.init(item);
                }
            }
        }
    };

    itemPager = {
        view:"pager",
        id: "item_pager",
        template: "<center>{common.prev()}{common.page()}/#limit#{common.next()}(#count# slides)</center>",
        animate:true,
        size:5,
        group:4
    };

    //dropdown for slide groups
    //Data is pulled from DAS webservice
    dropdown = {
        view: "combo",
        placeholder: "Select Slide Set",
        id: "slideset",
        options: {
            filter:function(item, value){
                if(item.name.toString().toLowerCase().indexOf(value.toLowerCase()) > -1)
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
                $.get(config.BASE_URL + "/folder?parentType=folder&parentId=" + item._id, function(folders){
                    var sFoldersMenu = $$("samples").getPopup().getList();
                    sFoldersMenu.clearAll();
                    folders = folders.filter(function(folder){
                        return !folder.name.startsWith(".");
                    });
                    sFoldersMenu.parse(folders);
                    $$("samples").setValue(folders[0].id);
                });
            },
            onAfterRender: webix.once(function() {
                /* This is a chain of AJAX calls
                

                 */
                $.get(config.BASE_URL + "/resource/lookup?path=/collection/" + config.COLLECTION_NAME)
                 .then(function(collection){
                    return $.get(config.BASE_URL + "/folder?limit=1000&parentType=collection&parentId=" + collection._id);
                }).then(function(folders){
                    var foldersMenu = $$("slideset").getPopup().getList();
                    foldersMenu.clearAll();
                    folders = folders.filter(function(folder){
                        return !folder.name.startsWith(".");
                    });
                    foldersMenu.parse(folders);
                    $$("slideset").setValue(folders[0].id);
                    return $.get(config.BASE_URL + "/folder?parentType=folder&parentId=" + folders[0]._id);
                }).then(function(folders){
                    var sFoldersMenu = $$("samples").getPopup().getList();
                    sFoldersMenu.clearAll();
                    folders = folders.filter(function(folder){
                        return !folder.name.startsWith(".");
                    });
                    sFoldersMenu.parse(folders);
                    $$("samples").setValue(folders[0].id);

                    if(config.THIRD_MENU)
                        return $.get(config.BASE_URL + "/folder?parentType=folder&parentId=" + folders[0]._id);
                    else
                        return $.get(config.BASE_URL + "/item?limit=500&folderId=" + folders[0]._id);
                }).then(function(folders){
                    if(config.THIRD_MENU){
                        var ssFoldersMenu = $$("subsamples").getPopup().getList();
                        ssFoldersMenu.clearAll();
                        folders = folders.filter(function(folder){
                           return !folder.name.startsWith(".");
                        });
                        ssFoldersMenu.parse(folders);
                        $$("subsamples").setValue(folders[0].id);
                        return $.get(config.BASE_URL + "/item?limit=500&folderId=" + folders[0]._id);
                    }
                    else{
                        items = folders.filter(function(item){
                            return item.largeImage != undefined;
                        });

                        $$("thumbnails").clearAll();
                        $$("thumbnails").parse(items);
                    }
                }).done(function(items){
                    items = items.filter(function(item){
                        return item.largeImage != undefined;
                    });
                    $$("thumbnails").clearAll();
                    $$("thumbnails").parse(items);
                })
            })
        }
    };

    samples_dropdown = {
        view: "combo",
        placeholder: "Select Sample",
        id: "samples",
        options: {
            filter:function(item, value){
                if(item.name.toString().toLowerCase().indexOf(value.toLowerCase()) > -1)
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

                if(config.THIRD_MENU){
                    $.get(config.BASE_URL + "/folder?parentType=folder&parentId=" + item._id, function(folders){
                        folders = folders.filter(function(folder){
                            return !folder.name.startsWith(".");
                        });
                        var sFoldersMenu = $$("subsamples").getPopup().getList();
                        sFoldersMenu.clearAll();
                        sFoldersMenu.parse(folders);
                        $$("subsamples").setValue(folders[0].id);  
                    });
                } 
                else{
                    var thumbs = $$("thumbnails");
                    var url = config.BASE_URL + "/item?folderId=" + item._id;
                    thumbs.clearAll();

                    $.get(config.BASE_URL + "/item?folderId=" + item._id, function(items){
                        items = items.filter(function(item){
                            return item.largeImage != undefined;
                        });
                        thumbs.parse(items);
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
            filter:function(item, value){
                if(item.name.toString().toLowerCase().indexOf(value.toLowerCase()) > -1)
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
                var thumbs = $$("thumbnails");
                var url = config.BASE_URL + "/item?folderId=" + item._id;
                thumbs.clearAll();

                $.get(config.BASE_URL + "/item?folderId=" + item._id, function(items){
                    items = items.filter(function(item){
                        return item.largeImage != undefined;
                    });
                    thumbs.parse(items);
                })
            }
        }
    };

    var rows = [dropdown, samples_dropdown, itemPager,  thumbnailsPanel];
    if(config.THIRD_MENU)
        rows.splice(2, 0, subsamples_dropdown);

    //slides panel is the left panel, contains two rows 
    //containing the slide group dropdown and the thumbnails panel 
    var wideIcon = "<span class='aligned wide webix_icon fa-plus-circle'></span>";
    var narrowIcon = "<span class='aligned narrow webix_icon fa-minus-circle'></span>";
    var slidesPanel = {
        id: "slidenav",
        header: "Slides " + wideIcon + narrowIcon,
        onClick:{
            wide:function(event, id){
                var count = $$("thumbnails").count();
                this.config.width = 205*6;
                this.resize();

              $$("item_pager").config.size = Math.min(30, count);
              $$("item_pager").refresh();
              $$("thumbnails").refresh();
              return false;
            }, 
            narrow:function(event, id){
              this.config.width = 220;
              this.resize();

              $$("item_pager").config.size = 5;
              $$("item_pager").refresh();
              $$("thumbnails").refresh();
              return false;
            }
        },
        body: {rows: rows},
        width: 220
    };

    function shuffle(arra1) {
        var ctr = arra1.length, temp, index;

        // While there are elements in the array
            while (ctr > 0) {
        // Pick a random index
                index = Math.floor(Math.random() * ctr);
        // Decrease ctr by 1
                ctr--;
        // And swap the last element with it
                temp = arra1[ctr];
                arra1[ctr] = arra1[index];
                arra1[index] = temp;
            }

        return arra1;
    }

    return slidesPanel;
});
