require(["pubsub", "session", "config"], function(pubsub, session, config) {

	var max_time = 2*60;
	var minutes = max_time/60;
	var seconds = 0;
	var timer;

	if(!session.valid()){
		var elements = [
			{
				view: "template",
				template: "You must login first",
				autoheight:true
			},
			{}
		];
	} else{
		var elements = [
			{
				template: "Hello #username#, the expected completion is no more than 10 minutes.",
				data: {username: session.username()},
				autoheight: true
			},
			{
				id: "timer",
				template: "<div style='color:red;text-align:center;font-size:20px'>#minutes# #seconds#</div>",
				data: {minutes: minutes + " minutes", seconds: seconds + " seconds"},
				align: "center",
				autoheight: true
			},
			{
				view: "fieldset",
				label: "Patient Level Questions",
				body: {
					rows:[
						{view: "label", label: "Can you make a diagnosis?"},
						{view: "radio", options: [{value: "Yes"}, {value: "No"}]},
						{view: "label", label: "Additional Comments"},
						{view: "textarea", height: 80},
					]
				}
			},
			{
				view: "fieldset",
				label: "Slide Level Questions",
				body: {
					rows:[
						{view: "label", label: "Stain:"},
						{view: "combo", options: ["H&E"]},
						{view: "label", label: "IHC Stain:"},
						{view: "radio", options: [{value: "Postitive"}, {value: "Negative"}]},
						{view: "label", label: "Additional Comments"},
						{view: "textarea", height: 80},
					]
				}
			},
			{
				view: "button",
				value: "Save",
				type:"form",
				width: 100,
				align: "center",
				click: save
			},
			{}
		]
	}

	/*
	save form
	 */
	function save(){
		var duration = max_time - minutes*60 - seconds;
		console.log(duration + " seconds");
	}

	/*
    Keep listening for changes to the SLIDE variable that gets
    published by the slidenav module.

    If SLIDE changes, then update the Aperio view, by clearing all
    previously loaded data and load the new Aperio files.

    If no Aperio files are found, disable the button!
     */
    pubsub.subscribe("SLIDE", function(msg, slide) {
    	minutes = max_time/60;
        seconds = 0;
        $$("derm_form").enable();

        if(timer == null){
	        timer = setInterval(function(){ 
				$$("timer").setValues({minutes: minutes + " minutes", seconds: seconds + " seconds"}); 
				if(seconds == 0){
					if(minutes == 0 && seconds == 0){
						clearInterval(timer);
						timer = null;
						$$("timer").setValues({minutes: "Timeout", seconds: ""}); 
						$$("derm_form").disable();	
					}
					minutes--;
					seconds = 60;
				}
				seconds--;
			}, 1000);
    	}
    });

	/*
	Add the panel dynamicaly as a forth column when this plugin
	is loaded.
	 */
	var panel = {
		id: "derm_form",
		view: "form",
		width: 300,
		elements: elements
	};

	$$("layout_body").addView(panel, 3);

});