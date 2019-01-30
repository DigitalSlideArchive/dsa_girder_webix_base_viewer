/* This is a basic navigation panel that uses combo boxes and dataviews */

define("app/ui/basicComboNavPanel", ["app/config", "app/dsaHelperFunctions", "webix"],function(config, helpers, webix) {
            /* qp is query parameter--- eventually want to think through an API to navigate to a slide... */
    qp = {}
    qp.name = "TCGA-02-0006";

    var prePopulateCombos = true;

    function startLoadingCombos() {
        helpers.girderHelpers("getResourceID").then(function(rsrcInfo) {
            rsrcInfo = JSON.parse(rsrcInfo);
            helpers.girderHelpers("getFolders", rsrcInfo).then(
                function(folders) {
                    //	var combo1Menu = $$("combo1").getPopup().getList();
                    folders = JSON.parse(folders);
                    //TO DO.. add a list of names and/or name types to not render
                    foldersToLoad = []
                    //Ignore folers that start with a "."
                    folders.forEach( function( row, idx) {   if ( row.name[0] != ".") { foldersToLoad.push(row)  }      } )

                    var depCombo1Menu = $$("depCombo1").getPopup().getList();
                    depCombo1Menu.clearAll();
                    depCombo1Menu.parse(foldersToLoad);
                    $$("depCombo1").setValue(foldersToLoad[0].id);

                })
        })
    };

    var updateSlideGalleryItems = function(newV, oldV) {
        /* This means there has been a new selection on the terminal drop down combo
        and we need to load a new list of slides to display in our gallery */
        //console.log(this); //So this should keep track of who actually called this function
        girderItem = this.getList().getItem(newV); //this should be a folder...	
        loadSlideGalleryItems(girderItem)
    }

  function loadSlideGalleryItems(newFolder) {
        /* This expects a folder and/or entire girder Item with an _id; this
        can than recursively get all the items and load them into the gallery */
        girderItem = newFolder; //this should be a folder... 
        helpers.girderHelpers("recurseGetItems", girderItem).then(function(rsrcInfo) {
            $$("slideGallery").clearAll();
            $$("slideGallery").parse(rsrcInfo);
        })
    }

    const LinkedInputs = {
        $init: function(config) {
            var master = $$(config.master);
            master.attachEvent("onChange", (newV) => {
	        //Get selected item from the master combo
	        //  console.log( master.getItem(newV));
	        //$$("depCombo1").getList().getItem(1543874719561)

	        //Note: this refers to the COMBO itself, the list associated with the combo is
	        //retrieved by the getList() argument..
	        		const combo = this; 
                    //combo.setValue();
                    combo.getList().clearAll();
                    
                    if (newV) {
                        combo.getList().load(config.dependentUrl + master.getList().getItem(newV)._id,
                            function(data) { 
                            
                                    //See if it gets any data... if it doesn't I should probably hide the list...
                                    data = JSON.parse(data);
                                    if (data.length == 0 )
                                        {
                                        webix.message("NO DATA FOUND...");
                                        //Load items into the slide gallery...
                                            loadSlideGalleryItems(master.getList().getItem(newV))
                                        //If no data.. that means this data should have items..
                                        //basically we hit a folder that doens't hae subfolders.
                                        //so we then try and see if there are any slides in it..
                                        //so we need to load data into the slide gallery
                                        combo.hide();

                                        } 
                                    else
                                        {
                                            combo.show();
                                            combo.setValue(this.getFirstId()) 
                                        }
                            })
                        }
                    });
            }
        };

        config.combo1Template = "#name#" //Can override what the combo lists

        webix.protoUI({
            name: "dependent",
            $cssName: "combo",
        }, LinkedInputs, webix.ui.combo);

        linkedCombos = {
            view: "form",
            elementsConfig: { labelWidth: 120 },
            elements: [{
                    view: "combo",
                    label: "depCombo1",
                    id: "depCombo1",
                    options: {
                        body: {
                            template: "#name#"
                        }
                    },
                    on: {
                        onAfterRender: webix.once(function() { startLoadingCombos(this) })
                    }
                },
                {
                    view: "dependent",
                    master: "depCombo1",
                    hidden:true,
                    dependentUrl: config.BASE_URL + "/folder?limit=2000&parentType=folder&parentId=",
                    label: "select Second Folder",
                    options: {
                        body: { template: config.combo1Template }

                    },
                    id: "depCombo2",
                    // on: {
                    //     onAfterRender: function() { 
                    //         console.log(this.getPopup().getList().getFirstId())
                    //          }
                    // }
                },
                {
                    view: "dependent",
                    master: "depCombo2",
                    hidden:true,
                    dependentUrl: config.BASE_URL + "/folder?limit=2000&parentType=folder&parentId=",
                    label: "Select Third Folder",
                    id: "depCombo3",
                    options: {
                        body: { template: "#name#" }
                    },
                    on: {
                        onChange: updateSlideGalleryItems
                    }
                }
            ]
        };
        return { rows: [linkedCombos] }
    })


        // combo1Menu.clearAll();
        // combo1Menu.parse(folders);

        //if a query parameter is set, it wil try and lookup the item name and set that as the first
        //loaded view..
        // initialItem = combo1Menu.find(function(obj) { return obj.name == qp.name ? true : false }, true);
        // if (!initialItem) {
        //     initialItemId = combo1Menu.getFirstId()
        // } else {
        //     initialItemId = initialItem
        // }

        // $$("combo1").setValue(initialItem.id)


        // initialItem = combo1Menu.find(function(obj) { return obj.name == qp.name ? true : false }, true);
        // if (!initialItem) {
        //     initialItemId = combo1Menu.getFirstId()
        // } else {
        //     initialItemId = initialItem
        // }

        // $$("combo1").setValue(initialItem.id)