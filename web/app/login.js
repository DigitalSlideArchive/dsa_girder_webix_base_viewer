define("login", ["config", "jquery", "session", "webix"], function(config, $, session) {

    webix.ui({
        view:"window",
        head: "Login",
        position: "center",
        id: "login_window",
        modal:true,
        body:{
            view: "form", 
            id: "login_form",
            width: 400,
            rules:{
                $all: webix.rules.isNotEmpty
            },
            elementsConfig:{
                labelPosition: "top",
                labelWidth: 140,
                bottomPadding: 18
            },
            elements:[
                { id: "login_message", view:"template", template: "<span style='color:red'>#message#</span>", data: {message:""}, borderless:true, autoheight: true},
                { id: "username", view:"text", label:"Username", name: "username", invalidMessage: "Username can not be empty"},
                { id: "password", view:"text", label:"Password", name: "password", type:"password", invalidMessage: "Password can not be empty"},
                { margin:5, cols:[
                    { view:"button", value:"Login", type:"form", click: function(){
                            if($$("login_form").validate()){
                                login();
                            }
                        }
                    },
                    { view:"button", value:"Cancel", click: function(){
                            $$("login_form").clear();
                            $$("login_form").clearValidation();
                            $$("login_message").define("data", {message: ""});
                            $$('login_window').hide();
                        }
                    }
                ]}
            ]
        }
    });

    webix.UIManager.addHotKey("enter", login, $$("login_form"));

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
            error: function(resp){
                $$("login_message").define("data", {message: "Error: " + resp.statusText});
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