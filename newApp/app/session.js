// define("session", ["config", "jquery", "pubsub"], function(config, $, pubsub) {
define(function() {

    var user = null;
    load();

    function create(token){
        window.localStorage.setItem("Girder-Token", JSON.stringify(token));
        document.cookie = 'girderToken=' + token.authToken.token;
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
        document.cookie = 'girderToken=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.localStorage.removeItem("Girder-Token");
   }

   function valid(){
        return user;
   }

   function token(){
        document.cookie = 'girderToken=' + user.authToken.token;
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