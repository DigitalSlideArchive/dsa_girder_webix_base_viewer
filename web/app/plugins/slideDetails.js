require(["pubsub","slide","config","webix"], function(pubsub,slide,config) {

    /*
	This will add a panel on the right to view slide macro and label image 
    and also metadata eleents pop up on the bottom panel
     */
slideParams = "?height=300" /* can set width/height of the macro image */
    
labelImg = config.BASE_URL + "/item/#_id#/tiles/images/label" + slideParams
macroImg = config.BASE_URL + "/item/#_id#/tiles/images/macro" + slideParams

//#down vote
//<textarea spellcheck="false"> or <input type="text" spellcheck="false">

//http://candygram.neurology.emory.edu:8080/api/v1/item/596e284492ca9a000d23e8b5/tiles/images/label?height=300

	imgId = ""
  var labelMacroPanel = {
        view: "template",
        id: "macro",
        template: "<div class='webix_strong'>#name#</div><img id='labelImg' src='" + labelImg + "'><img id='macroImg' src='" + macroImg + "'>",
        type: {
            height: 170,
            width: 200
        },
	data: {"_id": imgId,"name": "Macro"}
        }



    var slideMetaDataPanel =
        {
            view: "template",
            id: "slideMetaDataPanel",
            template: "SlideMag: #tiles.magnification# <br>ImageX: #tiles.sizeX# ImageY: #tiles.sizeY#, Has METAData?:#metadata#"
        }

   pubsub.subscribe("SLIDE", function(msg, slide) {


//http://candygram.neurology.emory.edu:8080/api/v1/item/596e284592ca9a000d23e8b7/tiles/images/label?height=300
	console.log(slide);
       $$("slideName").setValue(slide["name"]);
	macroData = { "_id": slide['_id'], "name": slide["name"] }
	


	//Fields to take from the slide leement and put in the MACRO spot are
         // name which is a top level parameter
		//want to get tiles.magnification
		//
 			

	$$("macro").parse(macroData);

    $$("slideMetaDataPanel").parse(slide); //pass current slide metadata to the detail panel

    });


sampleImg = "";
imgMacroView = { view: "template", template:"<img id='stinkasaurus' src='"+sampleImg+"'>"  }  ;

var DEBUG = false;


function updateGroups(id)
	{
	curSlideName = $$("slideName").getValue();
	webix.message(curSlideName);
       webix.message(slide['_id']);

       var url = config.BASE_URL + "/item/" + slide._id;
        if (DEBUG) console.log(url);
        webix.ajax().put(url, { "name": curSlideName }, function(text, xml, xhr) {
            // response
            if (DEBUG)
                console.log("Successfully updated girder with new slide name");
            //console.log(text);
        });
    }

$$("layout_body").addView({view:"accordion", multi: true, id: "slideDetailPanel", gravity: 0.3, cols:[
	{ header:"slideDetails", body:
	{
		rows:[ 
		  { cols: [
		 {view:"button", id:"BrainIDB", value:"Update", borderless:true, autowidth:true, click:updateGroups},
	         {view:"text", id:"slideName", label:'Name', labelPosition:"top", value:""}
		 	]},
		        { header:"Label/MacroImages", body:  labelMacroPanel	},
		        { header:"MetaData Widget", body:slideMetaDataPanel }
			]
	}
	}
			]})


/*	$$("toolbar").addView( {
        id: "apply_filter_btn",
        label: "Apply Filters",
        view: "button",
        click: ("$$('filters_window').show();")
    });

    /*
    reset()
        Reset all sliders to default values
     */
/*  
  function reset() {
        $$("contrast_slider").setValue(100);
        $$("brightness_slider").setValue(100);
        $$("saturation_slider").setValue(100);
        $$("hue_rotate_slider").setValue(0);
        $$("invert_slider").setValue(0);
        $$("blur_slider").setValue(0);
        $$("grayscale_slider").setValue(0);

        apply();
    }

    /*
    apply()
        Set the values and apply the new style to Openseadragon
        viewer
     */
/*  function apply() {
        var css = 'contrast(' + $$("contrast_slider").getValue() + '%) ' +
            'brightness(' + $$("brightness_slider").getValue() + '%) ' +
            'hue-rotate(' + $$("hue_rotate_slider").getValue() + ') ' +
            'saturate(' + $$("saturation_slider").getValue() + '%) ' +
            'invert(' + $$("invert_slider").getValue() + '%) ' +
            'grayscale(' + $$("grayscale_slider").getValue() + '%) ' +
            'blur(' + $$("blur_slider").getValue() + 'px)';

        $('.magic').css('-webkit-filter', css);
        $('.openseadragon-canvas').css('-webkit-filter', css);
    }
*/
    //Window for slide filters
  /*  var contrastSlider = {
        view: "slider",
        type: "alt",
        label: "Contrast",
        value: 100,
        max: 100,
        id: "contrast_slider",
        title: webix.template("Selected: #value#"),
        on: {
            "onSliderDrag": apply,
            "onChange": apply
        }
    };

   

    var hueSlider = {
        view: "slider",
        type: "alt",
        label: "Hue Rotate",
        value: 0,
        max: 360,
        id: "hue_rotate_slider",
        title: webix.template("Selected: #value#"),
        on: {
            "onSliderDrag": apply,
            "onChange": apply
        }
    };

    var invertSlider = {
        view: "slider",
        type: "alt",
        label: "Invert",
        value: 0,
        max: 100,
        id: "invert_slider",
        title: webix.template("Selected: #value#"),
        on: {
            "onSliderDrag": apply,
            "onChange": apply
        }
    };

   


/*
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


$$("viewer_root").addView({view:"template",template:"slideDetails"})
"$template4"
    webix.ui(view);
	*/
});
