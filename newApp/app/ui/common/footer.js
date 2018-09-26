define("common/footer", function() {
    
    var footer = {
        id: "footer", 
        borderless: true, 
        height: 25, 
        view: "template", 
        template: "<span>#name# </span>", 
        data:{name: "", url: ""},
        css: "footer"
    };

//        template: "<span>#name# | #url#</span>", 


    return footer;
});
