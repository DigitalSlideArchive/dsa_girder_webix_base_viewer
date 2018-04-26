define("jcv", ["common/header", "session", "jquery", "config", "webix"], function(header, session, $, config) {  
      

      console.log("ACK!!!")


   function init() {
      var BASE_URL = 'http://adrc.digitalslidearchive.emory.edu:8080/api/v1/';
      var TOP_FOLDER_ID = '5abb921192ca9a00176a0fe4'; // PATIENTS folder
      var METADATA_STRUCTURE_ID = '5ab27f9592ca9a0017a2095b' //gives the keys of the metadata of interest 
      var comboCounter = 1;

      var gc = {
         folderDetails: function(id) {
            webix.ajax().sync().get(BASE_URL + 'folder/' + id + '/details', function(text, data) {
               folderInfo = data.json();
            });
            return folderInfo
         },
         listFolder: function(id) {
            webix.ajax().sync().get( BASE_URL + 'folder?parentType=folder&parentId=' + id + '&limit=5000&sort=lowerName&sortdir=1', function(text, data) {
               folders = data.json();
            });
            return folders;
         },
         getFolderMetadata: function(id) {
            webix.ajax().sync().get( BASE_URL + 'folder/' + id, function(text, data) {
                metadata = data.json().meta.projectSchema;
            });
            return metadata;
         }, 
         listItems: function(id) {
            webix.ajax().sync().get(BASE_URL + 'item?folderId=' + id + '&limit=5000&sort=lowerName&sortdir=1', function(text, data) {
               items = data.json();
            });
            return items;
         },
         listItemsToGrid: function(id) {
            webix.ajax().sync().get(BASE_URL + 'item?folderId=' + id + '&limit=5000&sort=lowerName&sortdir=1', function(text, data) {
               items = data.json();
               $$("dataGrid_id").clearAll();
               $$("dataGrid_id").parse(items);
            });
            // return items;
         },
         thumbnail: function(id) { 
            return BASE_URL + 'item/' + id + '/tiles/thumbnail?width=256&height=256&encoding=JPEG';
         },
         macro: function(id) {
            return BASE_URL + 'item/' + id + '/tiles/images/macro?width=256';
         },
         addMetaDataItem: function(id, metadata) {
            var url = BASE_URL + '/item/' + id;
            // tag1 = metadata[0];
            // tag2 = metadata[1];
            webix.ajax().put(url, {"metadata": metadata}, function(text,xml,xhr) {
               webix.message("Metadata was pushed");
            });
         }
      };

      function fillCombo(folders, combo_id) {
         list = $$(combo_id).getPopup().getList();
         list.clearAll();
         list.parse(folders);
         $$(combo_id).setValue(folders[0].id);
         return folders[0]._id;
      };

      function recurseFolders(id) {
         selectedID = this.getPopup().getBody().getItem(id)['_id'];
         currentComboID = parseInt(this.data.id);
         while(comboCounter > currentComboID) {
            $$("mainLayout").removeView(comboCounter.toString());
            comboCounter -= 1;
         };
         // recurse down making combo boxes for this
         // check if it has subfolders, if it does make the next combo box and rerun function otherwise webix message
         // folders_flag = gc.folderDetails(selectedID).nFolders > 0;
         folders = gc.listFolder(selectedID);
         if(folders.length > 0) {
            comboCounter += 1;
            $$("mainLayout").addView({view:"combo", id:comboCounter.toString(), css:"headerStyle",
               on: { onChange: recurseFolders }, options: { body: { template: "#name#"}}
               });
            folder_id = fillCombo(folders, comboCounter.toString());
         } else {
            $("#thumbImage").attr("src", '');
            $("#macroImage").attr("src", '');
            items = gc.listItemsToGrid(selectedID);
            for(var key in metadata_structure) {
               $$(key+'ID').setValue('');
            }
         };
      };

      gridMap = [
         {id: "name", sort: "string", adjust:"data", header:["File Name",{content:"selectFilter"}],editor:"text"},
         // {id: "patientID", sort: "string", header:["Patient ID",{content:"selectFilter"}],editor:"text"},
         // {id: "stainType", sort: "string", header:["Stain",{content:"selectFilter"}],editor:"text"},
         // {id: "blockID", sort: "string", header:["Block ID",{content:"selectFilter"}],editor:"text"},
         {id: "_id", sort: "string", adjust:"data", header: ['id']},
      ];

      dataGrid = {
         view:"datatable", id:"dataGrid_id", columns:gridMap, rowHeight:100, select:"row", editable:false, editaction:"none", autowidth:true,
         map: {
            'patientID': "#meta.patientID#",
            'stainType': "#meta.stainType#",
            'blockID': "#meta.blockID#"
         },
         on: {
            "onItemClick": function(id){
               item = this.getItem(id);
               var metadata = item.meta;
               for(var key in metadata_structure) {
                  $$(key+'ID').setValue(metadata[key]);
                  // $$(key).refresh();
               }
               selectedItemID = item._id;
               $("#thumbImage").attr("src", gc.thumbnail(selectedItemID)); 
               $("#macroImage").attr("src", gc.macro(selectedItemID)); 
            }
         }
      };

      leftPanel = {
         id:"mainLayout",
         rows:[]
      }

      itemDetail = {
         id:"sideLayout",
         rows: [
            {view:"template", id:"selectedBox", borderless: true, template:"<img id='thumbImage' src=''>"},
            {view:"template", id:"selectedBox2", borderless: true, template:"<img id='macroImage' src=''>"}
         ]
      }

      bottomPanel = {
        cols: [dataGrid, itemDetail]
      }

      webix.ui({
         // cols: [leftPanel]//, dataGrid]
         rows: [leftPanel, bottomPanel]
      });

      function updateMetadata(id) {
         var selectedID = item._id;
         var selectedValue = $$(id+'ID').getValue();
         gc.addMetaDataItem(selectedID, {"test": "test"});
         // console.log(item);

      };

      webix.ready(function() {
         metadata_structure = gc.getFolderMetadata(METADATA_STRUCTURE_ID);
         for(var key in metadata_structure) {
            $$("sideLayout").addView({cols: [{view:"combo", label: key, id:key+'ID', value:'', options:metadata_structure[key]},
               {view:"button", label:"Post", id:key,
               click:updateMetadata}]})
         };

         // check if the top folder has subfolders
         folders = gc.listFolder(TOP_FOLDER_ID);
         // folders_flag = gc.folderDetails(TOP_FOLDER_ID).nFolders > 0;
         if(folders.length > 0) {
            $$("mainLayout").addView({view:"combo", id:comboCounter.toString(), css:"headerStyle",
               on: { onChange: recurseFolders }, options: { body: { template: "#name#"}}
            });
            fillCombo(folders, comboCounter.toString());
         };
         // could add an else statement here that will populate the grid with just the top folder if it has no subfolders to begin with
      });
   }

   return {
      init: init
   }
});
