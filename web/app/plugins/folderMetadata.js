require(["pubsub", "config"], function(pubsub, config) {

    /*
    Declare some variables
     */
     var caseId = null;

     webix.message("I have now loaded the folderMetaData Plugin...")

     /*
    Update the toolbar: add the pathology button to the 
    main toolbar. This button allows the user to open
    the Aperio widget (window)
     */
    $$("toolbar").addView({
        id: "folderMetadata_window_btn",
        label: "Folder Metadata",
        view: "button",
        disabled: true,
        click: ("$$('folderMetadata_window').show();")
    });


    //We need to add a handler to see when the terminal folder is updated... //

    $$("samples").attachEvent("onChange",  function(id)  { 
                    var folder = this.getPopup().getBody().getItem(id);
                webix.message("I am in the plugin and  was selected:" + folder['name']);
                    console.log(folder);


                 $$("folderMetadata_window_btn").enable();
                    //$$("folderMetadata_window").show();


               meta = []
             $.each(folder.meta, function(key, val){
                meta.push({"key": key, "value": val});
            })
             console.log(meta);
            $$("folderMetadata_list").clearAll();
            $$("folderMetadata_list").parse(meta);

                    //need to get the metadata data for this folder


            })

    /*
    Keep listening for changes to the SLIDE variable that gets
    published by the slidenav module.

    If SLIDE changes, then update the pathology report view, by clearing all
    previously loaded data and load the new pathology files.

    If no pathology files are found, disable the button!
    */
    // pubsub.subscribe("SLIDE", function(msg, slide) {
    //     // caseId = slide.tcga.caseId;
    //     // var url = config.BASE_URL + "/tcga/case/" + slide.tcga.caseId + "/metadata/tables";
    //     $$("folderMetadata_list").clearAll();

    //     // $.get(url, function(tables){
    //     //     if(tables.length){
    //     //         $$("metadata_tables").define("options", tables);
    //     //         $$("metadata_tables").setValue(tables[0].id);
    //     //         loadMetadata(caseId, tables[0].id);
    //     //         $$("metadata_window_btn").enable();
    //     //     }
    //     //     else{
    //     //         $$("metadata_window_btn").disable();
    //     //     }
    //     // })
    // });

    /*
    Load metadata into the metadata datatable
    The function takes 

    caseId - patient ID/case ID
    table - type of metadata to render  
     */
    function loadMetadata(folderMetaData){
    //     var url = config.BASE_URL + "/tcga/case/" + caseId + "/metadata/" + table;

    //     $.get(url, function(resp){
    //         meta = []
    //         $.each(resp, function(key, val){
    //             meta.push({"key": key, "value": val});
    //         })

    //         $$("metadata_list").clearAll();


            $$("metadata_list").parse(folderMetadata);
    //     })
    }
    
    /* Window */
    var view = {
        view:"window",
        head:{
            view: "toolbar", 
            margin:-4, 
            cols:[
                {view:"label", label: "Folder Metadata" },
                { view:"icon", icon:"times-circle", click:"$$('folderMetadata_window').hide();"}
            ]
        },
        id: "folderMetadata_window",
        move: true,
        position: "top",
        resize: true,
        width: 900,
        height: 800,
        body:{
            rows:[
                {
                    view: "combo",
                    id: "folderMetadata_tables",
                    value: 1,
                    on: {
                        onChange: function(id){
                            var table = this.getPopup().getBody().getItem(id);
                            // loadMetadata(caseId, table.id);
                        }
                    }
                },
                {   
                    view: "datatable", 
                    width:800,
                    height:450,
                    select:"row",
                    id: "folderMetadata_list",
                    columns:[
                        { id: "key", header: "Key", width: 250},
                        { id: "value", header: "Value", fillspace:true}
                    ]
                }
            ]
        }
    };

    webix.ui(view);
});