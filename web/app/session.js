define("session", ["config", "jquery", "pubsub"], function(config, $, pubsub) {

    var user = null;
    load();

    function create(token){
        window.localStorage.setItem("Girder-Token", JSON.stringify(token));
        user = token;
    }

   function load(){
        var tmp = window.localStorage.getItem("Girder-Token");
        if(tmp){
            user = JSON.parse(tmp);
            return user;
        }

        return null;
   }

   function destroy(){
        user = null;
        window.localStorage.removeItem("Girder-Token");
   }

   function valid(){
        return user;
   }

   function token(){
        return user.authToken.token;
   }

   function username(){
        return user.user.login;
   }

   return{
        create: create,
        load: load,
        destroy: destroy,
        valid: valid,
        token: token,
        username: username
   }

});