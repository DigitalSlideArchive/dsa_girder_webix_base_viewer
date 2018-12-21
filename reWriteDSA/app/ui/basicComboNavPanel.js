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
                    var depCombo1Menu = $$("depCombo1").getPopup().getList();
                    depCombo1Menu.clearAll();
                    depCombo1Menu.parse(folders);
                    $$("depCombo1").setValue(folders[0].id);

                })
        })
    };

    var updateSlideGalleryItems = function(newV, oldV) {
        /* This means there has been a new selection on the terminal drop down combo
        and we need to load a new list of slides to display in our gallery */
        //console.log(this); //So this should keep track of who actually called this function
        girderItem = this.getList().getItem(newV); //this should be a folder...	

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
                            function() { combo.setValue(this.getFirstId()) })
                        }
                    });
            }
        };

        config.combo1Template = "#name#" //Can override what the combo lists

        webix.protoUI({
            name: "dependent",
            $cssName: "combo"
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
                    dependentUrl: config.BASE_URL + "/folder?limit=2000&parentType=folder&parentId=",
                    label: "select Second Folder",
                    options: {
                        body: { template: config.combo1Template }

                    },
                    id: "depCombo2",
                    on: {
                        onAfterRender: function() { console.log(this.getPopup().getList().getFirstId()) }


                    }
                },
                {
                    view: "dependent",
                    master: "depCombo2",
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