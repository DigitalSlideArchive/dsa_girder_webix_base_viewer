// define(["ui", "config", "jquery", "session", "webix"], function(ui, config, $, session) {
// define(["ui", "session", "config", "jquery", "webix"], function(ui, session, config, $) {

define(["session", "config", "jquery", "common/header", "webix", ], function(session, config,   $, header) {

    if (session.valid()) {
        $.ajaxSetup({
            headers: { 'Girder-Token': session.token() }
        });
        webix.ajax().headers({
            'Girder-Token': +session.token()
        });

        webix.attachEvent("onBeforeAjax",
            function(mode, url, data, request, headers, files, promise) {
                headers["Girder-Token"] = session.token();
            }
        );
    }

    itemsToLoad = 5000; ///make 5000 after your done testing
    var foxDataURL = "http://digitalslidearchive.emory.edu:8080/api/v1/resource/5ad1088a92ca9a001adeca53/items?type=collection&limit=" + itemsToLoad + "&sort=_id&sortdir=1";

    webix.ready(function() {

        var foxDataCols = [
            { id: "name", sort: "string", header: ["slideName", { content: "textFilter" }] },
            { id: "Column", sort: "int", header: ["Column:", {content: "selectFilter"}] ,editor:"text"},
            { id: "BrainID", sort: "string", header: ["Brain ID", { content: "selectFilter" }], editor:"text"},
            { id: "Stain", header: ["Stain", { content: "selectFilter" }], editor:"text"},
            { id: "Hemi", editor:"text", header: ["Block", {content: "selectFilter"}]},
            { id: "Section", editor:"text"},
            { id: "StainDate", editor:"text", sort: "string"},
            { id: "_id" }
        ]


        var leftPanel = {
            rows: [
                { view: "label", label: "Slide Info", id: "slideItemCount" },
                { view: "template", id:"thumbnail", template: ""},
                { view: "template", id:"label", template: ""}
            ]
        }

        //update a group via datatable modification
        function updateGroupMetadata(item, key, value) {
            url = config.BASE_URL + '/item/' + item._id;
            if (!('meta' in item)) {
                item['meta'] = {};
                item['meta']['groups'] = {};
                item['meta']['groups'][key] = value
                webix.ajax().put(url, {"metadata": item.meta}, function(test,xml,xhr) {
                    if(alert){
                        webix.message("Metadata was updated.")
                    }
                })
            } else if (!('groups' in item.meta)) {
                item['meta']['groups'] = {};
                item['meta']['groups'][key] = value;
                webix.ajax().put(url, {"metadata": item.meta}, function(test,xml,xhr) {
                    if(alert){
                        webix.message("Metadata was updated.")
                    }
                })
            } else {
                item['meta']['groups'][key] = value;
                webix.ajax().put(url, {"metadata": item.meta}, function(test,xml,xhr) {
                    if(alert){
                        webix.message("Metadata was updated.")
                    }
                })
            }
        };

        var slideDataGrid = {
            view: "datatable",
            id: "datagrid",
            columns: foxDataCols,
            select: "row",
            url: foxDataURL,
            gravity: 10,
            pager: "dataTablePager",
            scheme: {
                $init: function(obj) {
                    //obj - data object from incoming data                                            
                    if (obj.meta) {
                        if (obj.meta.groups) {
                            obj.BrainID = obj.meta.groups.BrainID; // set value based on data in the incoming dataset      
                            obj.Column = obj.meta.groups.Column;
                            obj.Stain = obj.meta.groups.Stain; // or calculate values on the fly             
                            obj.StainDate = obj.meta.groups.StainDate; // set value based on data in the incoming dataset      
                            obj.Hemi = obj.meta.groups.Hemi;
                            obj.Section = obj.meta.groups.Section;
                        }
                    }

                }
            },
            ready: function() {
                firstId = $$("datagrid").getFirstId();
                $$("thumbnail").define("template", "<div class='webix_strong'>#name#</div><img src='" + config.BASE_URL + "/item/#_id#/tiles/thumbnail?width=256'/>");
                $$("label").define("template", "<img src='" + config.BASE_URL + "/item/#_id#/tiles/images/label?width=256'/>");
                $$("datagrid").select(firstId);
            },
            on: {
                onAfterSelect: function(id) {
                    curItem=  this.getItem(id);
                    $$("thumbnail").parse(curItem);
                    $$("label").parse(curItem);
                },
                onEditorChange: function(id){
                    var item = $$("datagrid").getItem(id.row); //get the information on selected row
                    var key = id.column; //key, such as BrainID, Hemi, etc. for recently edited cell
                    var value = item[key]; //new value, recently changed in cell
                    //run the function that takes in the change in the cell and saves it on the API
                    updateGroupMetadata(item, key, value);
                },
                onItemDblClick: function(id) {
                    this.edit(id);
                }
            }
        }


        var slideDataPager = {
            view: "pager",
            id: "dataTablePager",
            template: "{common.first()}{common.prev()} Page {common.pages()}{common.next()}{common.last()} out of  #limit# TotalRecs #count#",
            size: 50,
            group: 5
        };

        webix.ui({
            container: "main_layout",
            id: "root",
            rows: [
                header,
                {
                    id: "layout_body",
                    cols: [
                        leftPanel, { view: "resizer" },
                        { rows: [slideDataPager,slideDataGrid] },
                        {view: "resizer"}
                    ]
                }
            ]
        });



    })


    //     // not sure what these two lines do.....

    //     // but login is already used so does it need to be here...?
    //     if (config.UI == "standard") {
    //         // require(["login"])
    //         require(["routes", "login"]);
    //     // }
    //     //     require(["routes", "login", ]);
    //     // else
    //     //     require(["routes",  "login" ]);
    //     }
    // });

    // $.each(config.MODULE_CONFIG, function(moduleName, moduleEnabled) {
    //     if (moduleEnabled) {
    //         require([moduleName]);
    //     }
    // });


});




        // header:[ "Film title",{content:"textFilter"}]

// var thumbnailsPanel = {
//         view: "dataview",
//         id: "thumbnails",
//         select: true,
//         template: "<div class='webix_strong'>#name#</div><img src='" + config.BASE_URL + "/item/#_id#/tiles/thumbnail'/>",
//         pager: "item_pager",
//         datatype: "json",
//         datafetch: 5,
//         type: {
//             height: 170,
//             width: 200
//         },
//         on: {
//             onItemClick: function(id, e, node) {
//                 var item = this.getItem(id);
//                 slide.init(item);
//             },
//             onAfterRender: function() {
//                 if (this.getFirstId()) {
//                     var item = this.getItem(this.getFirstId());
//                     slide.init(item);
//                 }
//             }
//         }
//     };
