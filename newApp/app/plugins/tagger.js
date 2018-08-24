define(["config"], function(config) {
	//
	var currTagId = '';

	function updateTag(id) {
		// update tag when dealing with segmented
		currValue = $$(id).getValue();
		tagItem = $$("slideSelector").getSelectedItem();
		url = config.BASE_URL + '/item/' + tagItem._id;
		// get current value of tag. If it is equal to empty string, don't push metadata
		// reasoning: don't want to push empty metadata
		if(currValue != "") {
			tagItem.meta.tags[id.substring(0,id.length-3)] = currValue;
			webix.ajax().put(url, {"metadata": {"tags": tagItem.meta.tags}}, function(test,xml,xhr) {
				if(alert) {
					// webix.message("Metadata was pushed")
				}
			})
		}
	}

	// save as updateTag but handles the case of combo boxes
	// more difficult because the onChange does not give back the id of the view
	// to get around this you can use a click handler and a global variable
	// to get the currentId of the view
	function updateTagCombo(tag_id) {
		tagItem = $$("slideSelector").getSelectedItem();
		url = config.BASE_URL + '/item/' + tagItem._id;
		// get current value of tag. If it is equal to empty string, don't push metadata
		// reasoning: don't want to push empty metadata
		if(currTagId != ""){
			tag_id = currTagId;
		}
		currValue = $$(tag_id).getValue();
		if(currValue != "") {
			tagItem.meta.tags[tag_id.substring(0,tag_id.length-3)] = currValue;
			webix.ajax().put(url, {"metadata": {"tags": tagItem.meta.tags}}, function(test,xml,xhr) {
				if(alert) {
					// webix.message("Metadata was pushed")
				}
			})
		}
	}

	function makePromise(url) {
        // Sets up a promise in the proper way using webix
        return new webix.promise(function(success, fail) {
            webix.ajax(url, function(text){
                if (text) success (text);
                else fail(text.error);
            });
        });
    };


	rows = [];
	schema = false;
	// THIS HAS TO BE SYNCHRONOUS BECAUSE IT NEEDS THE SCHEMA BEFOREHAND
	// if schema folder name given, get the schema via girder call
	if(config.SCHEMA_COLLECTION_NAME) {
		// get id of collection containing schema folder
		url = config.BASE_URL + "/resource/lookup?path=collection/" + config.SCHEMA_COLLECTION_NAME;
		webix.ajax().sync().get(url, function(collection) {
			collectionId = JSON.parse(collection)._id;
			// list the folders inside the collection and look for the id of folder schema
			url = config.BASE_URL + "/folder?limit=1000&parentType=collection&parentId=" + collectionId;
			webix.ajax().sync().get(url, function(folders) {
				folders = JSON.parse(folders);
				// find the schema folder and get its folder metadata
				folders.forEach(function(fld) {
					if(fld['name'] == 'schema') {
						// get the metadata
						schema = fld['meta']['metadata_schema'];
					};
				});
			});
		});
	};

	// sets variable to current combo box
	function handler() {
		currTagId = this['s']['id']
	}

	// loop through each tag
	for (var tag in config.TAGS) {
		// if the length of the options for this tag is less then 4, use segmented view
		if(config.TAGS[tag].length == 0) {
			config.TAGS[tag] = schema[tag];
		}
		if(config.TAGS[tag].length < 4) {
			rows.push({view:"segmented", labelWidth:60, id:tag+"TAG", options:config.TAGS[tag], click:updateTag,
				value:'', label:tag + ":"
			});
		} else {
		// otherwise use combo box
			rows.push({view:"combo", label:tag+":",id:tag+"TAG",options:config.TAGS[tag], click:handler,
				on: {
					"onChange":function(id) {
						updateTagCombo(tag+"TAG")
					}
				}
			});
		}
	}
	// This empty row template prevents the rest of the UI to shrink according to taggerHeader
	rows.push({view:"template",
		template:"<img src=''/>", 
		id:"slideLabel"});

	var taggerHeader = {
        id: "taggerHeader",
        header: "Tagger",
        body: { rows: rows },
        width: 400
    }

	$$("layout_body").addView({rows: [taggerHeader]})
})