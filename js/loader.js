
var JS_DEBUG = false;
var DEFAULT_COOKIE_EXDAYS = 365;

function getVersion() {
    if (typeof VERSION == 'undefined')
        return (new Date()).getTime();
    else
        return VERSION;
}

function log(msg) {
    if (typeof console != 'undefined' && 'log' in console)
        console.log(msg);
}

/**
 * Returns true is a specified object is an array.
 */
function isArray(obj) {
    if ('isArray' in Array)
        return Array.isArray(obj);
    else
        return Object.prototype.toString.call(obj) === "[object Array]";
}

function getCookie(c_name, def) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1) {
        c_start = c_value.indexOf(c_name + "=");
    }
    if (c_start == -1) {
        c_value = null;
    } else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1) {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start,c_end));
    }
    def = typeof(def) == 'undefined' ? null : def;
    return c_value == null ? def : c_value;
}

function setCookie(c_name, value, exdays) {
    if (typeof exdays == 'undefined')
        exdays = null;
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + (exdays == null ? 0 : exdays));
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

function getURLVars(name) {
    var vars = [], hash;
    var href = decodeURIComponent(window.location.href);
    var anchor = href.indexOf("#");
    if (anchor >= 0)
        href = href.slice(0, anchor);
    var hashes = href.slice(href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = typeof hash[1] == 'undefined' ? hash[1] : hash[1].replace("%20", " ");
    }

    if (typeof name != 'undefined')
        return vars[name];

    return vars;
}

function loadResource(filename, filetype, callback) {
    var url = filename + "?ver=" + getVersion();
    log("Loading: " + url);
    if (filetype == "js") { // if filename is a external JavaScript file
        var fileref = document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", url);
    } else if (filetype == "css") { // if filename is an external CSS file
        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", url);
    }
    if (typeof fileref != "undefined") {
        fileref.onload = function() {
            log("Finished loading: " + filename);
            if (typeof callback != 'undefined')
                callback();
        };
        fileref.onreadystatechange = function() {
            if (fileref.readyState == 'loaded' || fileref.readyState == 'complete') {
                log("Finished loading: " + filename);
                if (typeof callback != 'undefined')
                    callback();
            }
        }
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }
}

function loadResources(res, callback) {
    if (res.length == 0) {
        if (typeof callback != "undefined" && callback != null) {
            log("Initializing the webpage");
            callback();
        }
    } else {
        var obj = res.shift();
        if (isArray(obj)) {
            var count = obj.length;
            while (obj.length > 0) {
                var r = obj.shift();
                loadResource(r.name, r.type, function() {
                    count--;
                    if (count == 0)
                        loadResources(res, callback);
                });
            }
        } else {
            loadResource(obj.name, obj.type, function() {
                loadResources(res, callback);
            });
        }
    }
}

/* Note that these cookie names should be the same as the IDs of the corresponding options. */
var COOKIE_NOCACHE = "nocache";
var COOKIE_LOAD_1S = "load-1s";
var COOKIE_LOAD_2S = "load-2s";
var COOKIE_LOAD_3S = "load-3s";
var COOKIE_LOAD_4S = "load-4s";
var COOKIE_LOAD_5S = "load-5s";
var COOKIE_LOAD_EVALUATION = "load-evaluation";
var COOKIE_LOAD_HETEROGENEOUS_TYPES = "load-heterogeneous-types";
var RESOURCES_LOADED = {
    "1s": getCookie(COOKIE_LOAD_1S, "true") == "true",
    "2s": getCookie(COOKIE_LOAD_2S, "true") == "true",
    "3s": getCookie(COOKIE_LOAD_3S, "true") == "true",
    "4s": getCookie(COOKIE_LOAD_4S, "true") == "true",
    "5s": getCookie(COOKIE_LOAD_5S, "true") == "true",
    "evaluation": getCookie(COOKIE_LOAD_EVALUATION, "true") == "true"
};
var COOKIE_TRANSLATE = "translate";
var LANG = "en";
var goptions = {
    translate: getCookie(COOKIE_TRANSLATE, "true") == "true",
    isTranslationNeeded: function() {
        return LANG != "en" && goptions.translate;
    }
};
var ename = {
    guardians: {
        "40259": "Almighty Ladon",
        "40260": "Mighty Ladon",
        "40261": "Great Ladon",
        "40268": "Archfiend Abaddon",
        "40274": "Almighty Puca",
        "40275": "Mighty Puca",
        "40276": "Great Puca",
        "40321": "Almighty Palladium",
        "40322": "Mighty Palladium",
        "40323": "Great Palladium"
    }
};

/* Use Loader.load() to load needed resources and then invoke a specified callback. */
var Loader = (function() {
    var LOAD_BASIC = 0;
    var LOAD_ENABLED = 1;
    var LOAD_ALL = 2;

    var load = function(tbl, callback) {
        var resources = new Array();

        var jp = false;
        if (getURLVars("lang") == "jp")
            jp = true;
        if (jp)
            LANG = "jp";

        resources.push({name: "js/version" + (JS_DEBUG ? "" : ".min") + ".js", type: "js"});

        resources.push([
            {name: "js/locale" + (JS_DEBUG ? "" : ".min") + ".js", type: "js"},
            {name: "js/json2" + (JS_DEBUG ? "" : ".min") + ".js", type: "js"},
            {name: "js/jstorage" + (JS_DEBUG ? "" : ".min") + ".js", type: "js"}
        ]);
        resources.push({name: "js/gc" + (JS_DEBUG ? "" : ".min") + ".js", type: "js"});

        var parallel = new Array();
        if (tbl == LOAD_ENABLED || tbl == LOAD_ALL) {
            if (RESOURCES_LOADED["1s"] || tbl == LOAD_ALL)
                parallel.push({name: (jp ? "js/1s_jp" + (JS_DEBUG ? "" : ".min") + ".js" : "js/1s" + (JS_DEBUG ? "" : ".min") + ".js"), type: "js"});
            if (RESOURCES_LOADED["2s"] || tbl == LOAD_ALL)
                parallel.push({name: (jp ? "js/2s_jp" + (JS_DEBUG ? "" : ".min") + ".js" : "js/2s" + (JS_DEBUG ? "" : ".min") + ".js"), type: "js"});
            if (RESOURCES_LOADED["3s"] || tbl == LOAD_ALL)
                parallel.push({name: (jp ? "js/3s_jp" + (JS_DEBUG ? "" : ".min") + ".js" : "js/3s" + (JS_DEBUG ? "" : ".min") + ".js"), type: "js"});
            if (RESOURCES_LOADED["4s"] || tbl == LOAD_ALL)
                parallel.push({name: (jp ? "js/4s_jp" + (JS_DEBUG ? "" : ".min") + ".js" : "js/4s" + (JS_DEBUG ? "" : ".min") + ".js"), type: "js"});
            if (RESOURCES_LOADED["5s"] || tbl == LOAD_ALL)
                parallel.push({name: (jp ? "js/5s_jp" + (JS_DEBUG ? "" : ".min") + ".js" : "js/5s" + (JS_DEBUG ? "" : ".min") + ".js"), type: "js"});
        }
        if (RESOURCES_LOADED["evaluation"]) 
            parallel.push({name: "js/evaluation" + (JS_DEBUG ? "" : ".min") + ".js", type: "js"});
        parallel.push({name: (jp ? "js/new_jp" + (JS_DEBUG ? "" : ".min") + ".js" : "js/new" + (JS_DEBUG ? "" : ".min") + ".js"), type: "js"});
        resources.push(parallel);
        
        loadResources(resources, function() {
            /* The code below provides a hack to obtain the English names of guardians.
               This is not a good practice but can be done quickly in the current framework.
            */
            if (tbl != LOAD_BASIC && goptions.isTranslationNeeded()) {
                var addAll = Card.addAll;
                Card.addAll = function(gs) {
                    for (var i = 0; i < gs.length; i++) {
                        var g = gs[i];
                        var id = g[0];
                        var name = g[1];
                        ename.guardians[id] = name;
                    }
                };
                var addLimitedTypes = Card.addLimitedTypes;
                Card.addLimitedTypes = function(ls) {
                };
                var addNotes = Card.addNotes;
                Card.addNotes = function(sn) {
                };
                var exAddAll = ExCard.addAll;
                ExCard.addAll = function(gs) {
                    for (var i = 0; i < gs.length; i++) {
                        var g = gs[i];
                        var id = g[0];
                        var name = g[1];
                        ename.guardians[id] = name;
                    }
                };
                var resources = new Array();
                var parallel = new Array();
                if (RESOURCES_LOADED["1s"] || tbl == LOAD_ALL)
                    parallel.push({name: "js/1s" + (JS_DEBUG ? "" : ".min") + ".js", type: "js"});
                if (RESOURCES_LOADED["2s"] || tbl == LOAD_ALL)
                    parallel.push({name: "js/2s" + (JS_DEBUG ? "" : ".min") + ".js", type: "js"});
                if (RESOURCES_LOADED["3s"] || tbl == LOAD_ALL)
                    parallel.push({name: "js/3s" + (JS_DEBUG ? "" : ".min") + ".js", type: "js"});
                if (RESOURCES_LOADED["4s"] || tbl == LOAD_ALL)
                    parallel.push({name: "js/4s" + (JS_DEBUG ? "" : ".min") + ".js", type: "js"});
                if (RESOURCES_LOADED["5s"] || tbl == LOAD_ALL)
                    parallel.push({name: "js/5s" + (JS_DEBUG ? "" : ".min") + ".js", type: "js"});
                resources.push(parallel);
                loadResources(resources, function() {
                    Card.addAll = addAll;
                    Card.addLimitedTypes = addLimitedTypes;
                    Card.addNotes = addNotes;
                    ExCard.addAll = exAddAll;
                    if (typeof callback != 'undefined')
                        callback();
                });
            } else if (typeof callback != 'undefined')
                callback();
        });
    };
    return {
        /** Load necessary and other enabled resources. */
        load: function(callback) {
            load(LOAD_ENABLED, callback);
        },
        /** Load all resources. */
        loadAll: function(callback) {
            load(LOAD_ALL, callback);
        },
        /** Load basic functionality resources. */
        loadBasic: function(callback) {
            load(LOAD_BASIC, callback);
        },
        /** Load specified resources. */
        loadFiles: function(files, callback) {
            var res = [];
            for (var i = 0; i < files.length; i++) {
                var fn = files[i];
                var type = null;
                if (/.js$/.test(fn)) {
                    type = "js";
                    if (!JS_DEBUG)
                        fn = fn.replace(".js", ".min.js");
                } else if (/.css$/.test(fn))
                    type = "css";
                if (type != null)
                    res.push({name: fn, type: type});
            }
            loadResources(res, callback);
        }
    };
})();
