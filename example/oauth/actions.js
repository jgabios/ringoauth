var {Application} = require("stick"),
    oauthlogin = require('./middleware/loginmiddleware');

export("app");

var app = Application();
app.configure("params", "session", oauthlogin,  "route", "render");
app.render.base = module.resolve("templates");
app.render.master = "index.html";


app.get("/", function(request) {
    var context = {title: "It's working!"};
    if(request.session.data['username']){
        context['username'] = request.session.data['username'];
    }
    return app.render("index.html", context);
});

