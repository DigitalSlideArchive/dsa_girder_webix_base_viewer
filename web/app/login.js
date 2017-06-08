define("login", ["config", "jquery", "session", "webix"], function(config, $, session) {

    webix.ui({
        view:"window",
        head: "Login",
        position: "center",
        id: "login_window",
        modal:true,
        body:{
            view: "form", 
            width: 400,
            elements:[
                { id: "username", view:"text", label:"Username"},
                { id: "password", view:"text", type:"password", label:"Password"},
                { margin:5, cols:[
                    { view:"button", value:"Login" , type:"form", click: login},
                    { view:"button", value:"Cancel", click: ("$$('login_window').hide();")}
                ]},
                { id: "login_message", view:"label", value: ""},
            ]
        }
    });

    function login(){
        $.ajax({
            url: config.BASE_URL + "/user/authentication",
            method: "GET",
            headers:{
                Authorization: "Basic " + btoa($$('username').getValue() + ":" + $$('password').getValue())
            },
            success: function(resp){
                session.create(resp);
                $$('login_window').hide();
                $$('header_menu').updateItem("login_btn", {value:"Logout (" + session.username() + ")"})
                window.location.reload(true);
            },
            error: function(){
                console.log("login fail")
            }
        });
    }

    function logout(){
        session.destroy();
        $$('header_menu').updateItem("login_btn", {value:"Login"})
        window.location.reload(true);
    }

    return{
        login: login,
        logout: logout
    }
});