define("tcga/slidenav", ["config", "viewer", "jquery", "pubsub", "webix"], function(config, viewer, $, pubsub) {

    webix.proxy.GirderItems = {
      $proxy:true,
      load:function(view, callback, details){
        if (details){
          var data = webix.ajax(this.source+"?limit="+details.count+"&offset="+details.start);
        } else {
          var data = webix.ajax(this.source); 
        }
         
        data.then(function(resp){
            webix.ajax.$callback(view, callback, resp.text());
        }); 
      }
    };

    var thumbnailsPanel = {
        view: "dataview",
        id: "thumbnails",
        select: true,
        template: "<div class='webix_strong'>#name#</div><img src='" + config.BASE_URL + "/item/#_id#/tiles/thumbnail'/>",
        pager: "item_pager",
        datatype: "json",
        datafetch: 10,
        type: {
            height: 170,
            width: 200
        },
        on: {
            onItemClick: function(id, e, node) {
                var item = this.getItem(id);
                pubsub.publish("SLIDE", item);
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
        placeholder: "Select Cohort",
        id: "slideset",
        options: {
            body: {
                template: "#name#"  
            }
        },
        on: {
            onChange: function(id) {
                var item = this.getPopup().getBody().getItem(id);

                $.get(config.BASE_URL + "/tcga/case?cohort=" + item._id, function(resp){
                    var cases = resp["data"]
                    var sFoldersMenu = $$("samples").getPopup().getList();
                    sFoldersMenu.clearAll();
                    sFoldersMenu.parse(cases);
                    $$("samples").setValue(cases[0].id);
                });
            },
            onAfterRender: webix.once(function() {
                $.get(config.BASE_URL + "/tcga/cohort", function(resp){
                    var cohorts = resp["data"];
                    var cohortList = $$("slideset").getPopup().getList();
                    cohortList.clearAll();
                    cohortList.parse(cohorts);
                    $$("slideset").setValue(cohorts[0].id);
                });    
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
            onChange: function(id) {
                var item = this.getPopup().getBody().getItem(id);
                var thumbs = $$("thumbnails");
                var url = config.BASE_URL + "/tcga/case/" + item._id + "/images";
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
        body: {
            rows: [
                dropdown, samples_dropdown, itemPager,  thumbnailsPanel
            ]
        },
        width: 220
    };


    return slidesPanel;
});
