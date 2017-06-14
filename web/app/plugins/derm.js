require(["pubsub", "session", "config", "jquery"], function(pubsub, session, config, $) {

	var user_key = session.username() + "_" + "answers";
	var user_prog_key = session.username() + "_" + "progress";
	var currentCaseId = null;
	var original_element = null;
	var count = 1;
	var max_time = 10*60;
	var minutes = max_time/60;
	var seconds = 0;
	var timer = null;
	var slide = null;
	var stain_count = 1;
	var stain_fields = [
		{ template:"Stain #1", type:"section"},
		{view: "label", label: "Stain:"},
		{
			view: "combo", 
			index: stain_count,
			name: "stain1.type", 
			options: ["CD31", "CD34", "ERG", "CD3", "CD4", "CD5", "CD8", "CD20", "CD45", "CD56", "BCL2", "BCL6", "CD10", "Cyclin D1", "MUM1", "S100", "SOX10", "MITF", "MELAN-A", "HHV8", "Congo Red", "Spirochete", "PAS", "GMS", "Mucicarmine", "AFB", "CK7", "CK20", "AE1/AE3", "Other"],
			on:{
				onChange: function(stain){
					var key = "stain"+ this.data.index +"_type_other";
					if(stain == "Other"){
						$$(key).show();
					}
					else{
						$$(key).hide();
					}
				}
			}
		},
		{view: "text", name:"stain1.type_other", id: "stain1_type_other", placeholder: "Specify other stains", hidden: true},
		{view: "label", label: "IHC Stain:"},
		{view: "radio", name: "stain1.ihc", options: [{value: "Positive"}, {value: "Negative"}]},
		{view: "label", label: "Additional Comments"},
		{view: "textarea", name: "stain1.comments", height: 80}
	]

	$$("slideset").disable();
	$$("samples").disable();

	if(!session.valid()){
		$$("login_window").show();
		$$("loading_window").hide();
		
		var elements = [
			{
				view: "template",
				template: "You must login first",
				autoheight:true
			},
			{}
		];
	} else {
		$.get(config.BASE_URL + "/folder/5931a19292ca9a000d43c49e", function(resp){
			console.log(resp)
			count = 0;
			if(resp.meta.hasOwnProperty(user_prog_key)){
				count = resp.meta[user_prog_key];
			}
		});

		var elements = [
			{
				template: "Hello #username#, the expected completion time is no more than 10 minutes. After 10 minutes the app will timeout.",
				data: {username: session.username()},
				autoheight: true
			},
			{
				id: "case_counter",
				template: "<div style='text-align:center'>Case #count# of #total#</div>",
				data: {count: count, total: "NA"},
				autoheight: true
			},
			/*{
				id: "timer",
				template: "<div style='color:red;text-align:center;font-size:20px'>#minutes# #seconds#</div>",
				data: {minutes: minutes + " minutes", seconds: seconds + " seconds"},
				align: "center",
				autoheight: true
			},*/
			{
				id: "msg",
				template: "<div style='color:red;text-align:center;font-size:20px'>#msg#</div>",
				data: {msg: ""},
				align: "center",
				autoheight: true
			},
			{
				view: "fieldset",
				label: "Patient Level Questions",
				body: {
					rows:[
						{view: "label", label: "Can you make a diagnosis?"},
						{view: "radio", name: "diagnosed", options: [{value: "Yes"}, {value: "No"}]},
						{view: "label", label: "Additional Comments"},
						{view: "textarea", name:"comments", height: 80},
					]
				}
			},
			{rows: webix.copy(stain_fields)},
			{
				view: "button",
				value: "Add Stain",
				type:"form",
				width: 100,
				align: "center",
				click: addStain
			},
			{
				view: "button",
				id: "save_btn",
				value: "Save",
				type:"danger",
				width: 100,
				align: "center",
				click: save
			},
			{}
		]
		startTimer();
		original_elements = webix.copy(elements);
	}

	function addStain(){
		var fields = webix.copy(stain_fields);
		fields[0].template = "Stain #" + ++stain_count;
		fields[2].index = stain_count;
		fields[2].name = "stain" + stain_count + ".type";
		fields[3].name = "stain" + stain_count + ".type_other";
		fields[3].id = "stain" + stain_count + "_type_other";
		fields[5].name = "stain" + stain_count + ".ihc";
		fields[7].name = "stain" + stain_count + ".comment";
		$$("derm_form").addView({ rows: fields }, 3 + stain_count);
	}

	function nextCase(){
		var foldersMenu = $$("slideset").getPopup().getList();
		$$("slideset").setValue(foldersMenu.getNextId($$("slideset").getValue()));
		startTimer();
	}

	function startTimer(){
		minutes = max_time/60;
        seconds = 0;
        clearInterval(timer);
        timer = null;

	    timer = setInterval(function(){ 
			//$$("timer").setValues({minutes: minutes + " minutes", seconds: seconds + " seconds"}); 
			if(seconds == 0){
				if(minutes == 0 && seconds == 0){
					clearInterval(timer);
					timer = null;
					$$("msg").setValues({msg: "Timeout (refresh the page to start again)"}); 
					$$("save_btn").disable();	
				}
				minutes--;
				seconds = 60;
			}
			seconds--;
		}, 1000);
	}

	/*
	save form
	 */
	function save(){
		var tmp = $$('derm_form').getValues();
		var data = {};
		data[user_key] = {
			duration: max_time - minutes*60 - seconds,
			diagnosed: tmp.diagnosed,
			comments: tmp.comments,
			stain: []
		};
		
		for(var key in tmp)
			if(key.startsWith("stain")) 
				data[user_key].stain.push(tmp[key])

		$.ajax({
			url: config.BASE_URL + "/folder/" + currentCaseId + "/metadata",
			method: "PUT",
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(data),
			success: function(){
				count++;
				var progress = {};
				progress[user_prog_key] = count;
				console.log("success");

				$.ajax({
					url: config.BASE_URL + "/folder/5931a19292ca9a000d43c49e/metadata",
					method: "PUT",
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify(progress)
				});

				$$('derm_form').clear();
				webix.ui(original_elements, $$("derm_form"));
				stain_count = 1;
				clearInterval(timer);
				timer = null;
				nextCase();
			},
			error: function(){
				console.log("error");
			}
		});
	}

	/*
    Keep listening for changes to the SLIDE variable that gets
    published by the slidenav module.

    If SLIDE changes, then update the Aperio view, by clearing all
    previously loaded data and load the new Aperio files.

    If no Aperio files are found, disable the button!
     */
    pubsub.subscribe("SLIDE", function(msg, data) {
    	slide = data;
    
    	//if(currentCaseId != slide.item.folderId)
    	//	count++;

    	$$("case_counter").setValues({count: count, total: $$("slideset").getPopup().getList().count()});
    	
    	var key = session.username() + "_answers";

    	$.get(config.BASE_URL + "/folder/" + slide.folderId, function(resp){
    		if(resp.hasOwnProperty("meta") && resp.meta.hasOwnProperty(key)){
    			//count = resp.meta[key].total_completed;
    			//console.log(resp);
    			nextCase();
    		}
    		else{
    			$$("loading_window").hide();
    		}
   
    	});

    	/*if(slide.item.hasOwnProperty("meta") && slide.item.meta.hasOwnProperty(key)){

    		
    	} 
    	else{
    		$$("loading_window").hide();
    	}*/
    	console.log(timer, currentCaseId, slide.item.folderId)
        /*if(timer == null || currentCaseId != slide.item.folderId){
        	console.log("in")
        	minutes = max_time/60;
        	seconds = 0;

	        timer = setInterval(function(){ 
				$$("timer").setValues({minutes: minutes + " minutes", seconds: seconds + " seconds"}); 
				if(seconds == 0){
					if(minutes == 0 && seconds == 0){
						clearInterval(timer);
						timer = null;
						$$("timer").setValues({minutes: "Timeout", seconds: "(refresh the page to start again)"}); 
						$$("save_btn").disable();	
					}
					minutes--;
					seconds = 60;
				}
				seconds--;
			}, 1000);
    	}*/

    	currentCaseId = slide.item.folderId;
    });

    webix.ui({
		view:"window",
		id: "loading_window",
		height:50,
		width:300,
		head:"Navigating, please wait...",
		position:"center",
		modal:true
	}).show();

	/*
	Add the panel dynamicaly as a forth column when this plugin
	is loaded.
	 */
	var panel = {
		id: "derm_form",
		complexData:true,
		view: "form",
		width: 300,
		scroll:"y", 
		elements: elements
	};

	$$("layout_body").addView(panel, 3);

});