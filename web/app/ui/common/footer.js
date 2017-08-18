define("common/footer", function() {
    
    var footer = {
        id: "footer", 
        borderless: true, 
        height: 25, 
        view: "template", 
        template: "<span>#name# | #url#</span>", 
        data:{name: "", url: ""},
        css: "footer"
    };

    return footer;
});