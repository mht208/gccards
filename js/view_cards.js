
var MIN_FONT_SIZE = 12;

function getMostNewCards() {
    var cards = [];
    var count = 0;
    $.each(WhatIsNew.getCards(), function(date, data) {
        for (var i = 0; i < data.cards.length && count < 20; i++, count++) {
            cards.push(data.cards[i]);
        }
    });
    return cards;
}

function toDescending(str) {
    var res = [];
    for (var i = 0; i < str.length; i++) {
        res.push(
            $("<span></span>")
                .css("font-size", MIN_FONT_SIZE + (str.length - 1 - i) * 2)
                .html(str.charAt(i))
        );
    }
    return res;
}

function toAscending(str) {
    var res = [];
    for (var i = 0; i < str.length; i++) {
        res.push(
            $("<span></span>")
                .css("font-size", MIN_FONT_SIZE + i * 2)
                .html(str.charAt(i))
        );
    }
    return res;
}

function toNormal(str) {
}

function insertGuardians(options) {
    var id = options.id;
    var name = options.name;
    var stars = options.stars;
    var attr = options.attr;
    var place = options.place;
    var border = options.border;
    var shape = options.shape;
    var skill = options.skill;

    id = typeof(id) == 'undefined' ? null : id;
    name = typeof(name) == 'undefined' ? null : name;
    stars = typeof(stars) == 'undefined' ? null : stars;
    attr = typeof(attr) == 'undefined' ? null : attr;
    place = typeof(place) == 'undefined' ? null : place;
    border = typeof(border) == 'undefined' ? null : border;
    shape = typeof(shape) == 'undefined' ? null : shape;
    skill = typeof(skill) == 'undefined' ? null : skill;

    var gs = [];
    if (selector = id == null && name == null && stars == null && attr == null && place == null && 
        border == null && shape == null && skill == null) {
        gs = getMostNewCards();
    } else {
        var selector = Selector.all;
        if (id != null)
            selector = Selector.and(selector, Selector.id(id));
        if (name != null)
            selector = Selector.and(selector, Selector.name(name));
        if (stars != null)
            selector = Selector.and(selector, Selector.stars(stars));
        if (attr != null)
            selector = Selector.and(selector, Selector.attribute(attr));
        if (place != null)
            selector = Selector.and(selector, Selector.place(place));
        if (border != null)
            selector = Selector.and(selector, Selector.border(border));
        if (shape != null)
            selector = Selector.and(selector, Selector.shape(shape));
        if (skill != null)
            selector = Selector.and(selector, Selector.skill(skill));
        gs = Selector.select(selector);

        gs.sort(Sorting.reverse(Sorting.id));
    }
    
    $("#cardtable")
        .data("current", "id")
        .data("descending", false);
    insertCards(gs);
}

function insertCards(gs) {
    $("#cardtable").html("");

    var current = $("#cardtable").data("current");
    var descending = $("#cardtable").data("descending");

    var sort_and_insert = function(name, ascending_sorting) {
        gs.sort(ascending_sorting);
        if (current == name) {
            descending = !descending;
            if (descending)
                gs.reverse();
        } else {
            current = name;
            descending = false;
        }
        $("#cardtable")
            .data("current", current)
            .data("descending", descending);
        insertCards(gs);
    };

    var headers = [
        {name: "ID",               width: 50,   sorting: Sorting.id},
        {name: "Name",             width: 100,  sorting: Sorting.name},
        {name: "Image",            width: 120,  sorting: null},
        {name: "Avatar",           width: 70,   sorting: null},
        {name: "Description",      width: 200,  sorting: null},
        {name: "Event",            width: 80,   sorting: Sorting.compose(Sorting.event, Sorting.id)},
        {name: "Border",           width: 80,   sorting: Sorting.compose(Sorting.border, Sorting.id)},
        {name: "Stars",            width: 120,  sorting: Sorting.compose(Sorting.stars, Sorting.id)},
        {name: "Place",            width: 100,  sorting: Sorting.compose(Sorting.place, Sorting.id)},
        {name: "Shape",            width: 60,   sorting: null},
        {name: "Attribute",        width: 100,  sorting: null},
        {name: "HP",               width: 50,   sorting: Sorting.compose(Sorting.hp(0), Sorting.id)},
        {name: "MP",               width: 50,   sorting: Sorting.compose(Sorting.mp(0), Sorting.id)},
        {name: "ATK",              width: 50,   sorting: Sorting.compose(Sorting.atk(0), Sorting.id)},
        {name: "DEF",              width: 50,   sorting: Sorting.compose(Sorting.def(0), Sorting.id)},
        {name: "AGI",              width: 50,   sorting: Sorting.compose(Sorting.agi(0), Sorting.id)},
        {name: "WIS",              width: 50,   sorting: Sorting.compose(Sorting.wis(0), Sorting.id)},
        {name: "Image",            width: 120,  sorting: null},
        {name: "Skills",           width: 250,  sorting: null},
        {name: "Defaults",         width: 250,  sorting: null},
        {name: "Rebirth Defaults", width: 250,  sorting: null},
        {name: "Note",             width: 300,  sorting: null}
    ];

    var t = $("<table></table").addClass("guardians");
    $(t).append(
        $("<tr></tr>")
         .each(function() {
             for (var i = 0; i < headers.length; i++) {
                 var header = headers[i];
                 var sorting_column = current == header.name;
                 var name = header.name.toUpperCase();
                 if (sorting_column)
                     name = descending ? toDescending(name) : toAscending(name);
                 $(this).append(
                     $("<th></th>")
                         .css("width", header.width + "px")
                         .css("color", sorting_column ? (descending ? "green" : "red") : "black")
                         .append(name)
                         .click((function(header) {
                             return function() {
                                 if (header.sorting != null)
                                     sort_and_insert(header.name, header.sorting);
                             };
                         })(header))
                 )
             }
         })
    );
    for (var i = 0; i < gs.length; i++) {
        var g = gs[i];
        var data = [
            g.id, Card.mkextlnk(g), $("<a href='index.html?id=" + g.id + "' class='gclink'></a>").html(g.getImage(100)),
            g.getAvatar(50), g.description, g.event.name, g.border.name, g.getStarsImage(), g.place.name, g.shape.getImage(50),
            g.attribute.getImage(), g.hp, g.mp, g.atk, g.def, g.agi, g.wis,
            $("<a href='index.html?id=" + g.id + "' class='gclink'></a>").html(g.getImage(100)),
            Skill.toString(g.skills, "<br/>"), Skill.toString(g.recommends, "<br/>"), Skill.toString(g.recommendsrb, "<br/>"),
            Card.notes[g.id]
        ];
        $(t).append(
            $("<tr></tr>").each(function() {
                for (var j = 0; j < data.length; j++) {
                    $(this).append($("<td></td>").append(data[j]))
                }
            })
        )
    }
    $("#cardtable")
        .append(t)
        .append("<br/>")
        .append("<span>Number of cards: " + gs.length + "</span>");

    $('body').scrollTop(0);
}

function getCustomOptions() {
    var options = {
        id: new Array(),
        stars: new Array(),
        place: new Array(),
        attr: new Array(),
        border: new Array(),
        shape: new Array(),
        skill: new Array()        
    };
    
    var data = new Array(
        {name: "id", id: "id_selector"},
        {name: "stars", id: "stars_selector"},
        {name: "place", id: "place_selector"},
        {name: "attr", id: "attr_selector"},
        {name: "border", id: "border_selector"},
        {name: "shape", id: "shape_selector"},
        {name: "skill", id: "skill_selector"}
    );
    
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        $("#" + d.id).find("input:checkbox").each(function() {
            var v = $(this).val();
            if ($(this).is(":checked") && typeof v != 'undefined' && v != null && v != "")
                options[d.name].push(v);
        });
    }

    for (var key in options) {
        var value = options[key];
        if (value.length == "")
            options[key] = null;
        else
            options[key] = value.join(",");
    }
    
    return options;
}

function insertCustomOptions(target) {
    var stars = List.seq(1, 6);
    var getid = function(x) {
        return x.id;
    };
    var queries = new Array(
        {name: "id", ignore: 0},
        {name: "stars", ignore: stars.length},
        {name: "place", ignore: Place.all.length},
        {name: "attr", ignore: Attribute.all.length},
        {name: "border", ignore: Border.all.length},
        {name: "shape", ignore: Shape.all.length},
        {name: "skill", ignore: Skill.all.length}
    );

    $(target).append(
        "<p class='header'>ID</p>" +
        "<p><textarea id='id_selector' rows='3' cols ='30'></textarea></p>" +
        "<p class='header'>Stars</p>" +
        "<p id='stars_selector'></p>" +
        "<p class='header'>Encounter</p>" +
        "<p id='place_selector'></p>" +
        "<p class='header'>Attribute</p>" +
        "<p id='attr_selector'></p>" +
        "<p class='header'>Border</p>" +
        "<p id='border_selector'></p>" +
        "<p class='header'>Shape</p>" +
        "<p id='shape_selector'></p>" +
        "<p class='header'>Skill</p>" +
        "<p id='skill_selector'></p>" +
        "<br/>" +
        "<button id='custom_search'>Search</button>"
    );
    
    $("#custom_search")
        .button()
        .click(function() {
            var options = getCustomOptions();
            insertGuardians(options);
        });
        
    var data = new Array(
        { id: "stars_selector", src: stars,
          value: function(x) {return x; }, content: function(x) {
            return List.map(
                    function(x) {return "<img width='16px' src='images/rare_star" + image_ext + "' />";}, 
                    List.seq(0, x)
                  ).join("");
        }},
        { id: "place_selector", src: Place.all,
          value: function(x) {return x.id; }, content: function(x) {return x.name; }},
        { id: "attr_selector", src: Attribute.all,
          value: function(x) {return x.id; }, content: function(x) {return x.getImage() + " " + x.name; }},
        { id: "border_selector", src: Border.all,
          value: function(x) {return x.id; }, content: function(x) {return x.name; }},
        { id: "shape_selector", src: Shape.all,
          value: function(x) {return x.id; }, content: function(x) {return x.getImage(24); }},
        { id: "skill_selector", src: Skill.all,
          value: function(x) {return x.id; }, content: function(x) {return x.name + " (" + x.description + ")"; }}
    );

    for (var i = 0; i < data.length; i++) { 
        var d = data[i];
        $("#" + d.id).each((function(d) {
            return function() {
                $(this).append(
                    $("<label></label>").append(
                        $("<input type='checkbox' value='' checked />")
                            .change(function() {
                                var that = this;
                                var selected = $(this).is(':checked');
                                $("#" + d.id).find("input:checkbox").each(function() {
                                    if (that == this)
                                        return;
                                    $(this).prop('checked', selected);
                                })
                            })
                    )
                    .append(" Select/deselect all")
                ).append("<br/>");
                for (var j = 0; j < d.src.length; j++) {
                    $(this).append(
                        $("<label></label>")
                            .append($("<input type='checkbox' value='" + d.value(d.src[j]) + "' checked />"))
                            .append(" " + d.content(d.src[j]))
                    ).append("<br/>");
                }
            }
        })(d));
    }
}

function cards_init() {
    var args = getURLVars();
    var id = args["id"];
    var name = args["name"];
    var stars = args["stars"];
    var attr = args["attr"];
    var place = args["place"];
    var border = args["border"];
    var shape = args["shape"]
    var skill = args["skill"];

    var data = [
        { id: "presets", source: List.filter(function(x) { return x != Attribute.none; }, Attribute.all),
          search: function(x) { return { attr: x.id, stars: 5, border: Border.none.id }; },
          description: function(x) { return x.getImage(32) + "&nbsp;" + x.name + " Team"; }
        },
        { id: "presets", source: [
            {name: "Revival", skills: [Skill.revival]},
            {name: "SD", skills: [Skill.sd]},
            {name: "Sap", skills: [Skill.sap]}
          ],
          search: function(x) { return { skill: List.map(function(x) { return x.id; }, x.skills), stars: 5, border: Border.none.id }; },
          description: function(x) { return x.name + " Team"; }
        },
        { id: "by_stars", source: List.seq(1, 6), 
          search: function(x) { return { stars: x }; },
          description: function(x) {
                return List.map(
                    function(x) {return "<img width='16px' src='images/rare_star" + image_ext + "' />";}, 
                    List.seq(0, x)
                    ).join("");
          } },
        { id: "by_place", source: Place.all, 
          search: function(x) { return { place: x.id }; },
          description: function(x) { return x.name; } },
        { id: "by_attr", source: Attribute.all, 
          search: function(x) { return { attr: x.id }; },
          description: function(x) { return x.getImage(16) + " " + x.name; } },
        { id: "by_border", source: Border.all, 
          search: function(x) { return { border: x.id }; },
          description: function(x) { return x.name; } },
        { id: "by_shape", source: Shape.all, 
          search: function(x) { return { shape: x.id }; },
          description: function(x) { return x.getImage(32); } },
        { id: "by_skill", source: Skill.all, 
          search: function(x) { return { skill: x.id }; },
          description: function(x) { return x.name + " (" + x.description + ")"; } }
    ];

    var flatten = function(obj) {
        var res = [];
        for (var key in obj) {
            res.push(key + "=" + obj[key]);
        }
        return res.join("&");
    };

    var lang = locale.getLanguage() == LANG_JP ? "lang=jp&" : "";
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        for (var j = 0; j < d.source.length; j++) {
            var src = d.source[j];
            var search = d.search(src);
            var description = d.description(src);
            $("#" + d.id).append(
                $("<li></li>").append(
                    $("<a href='javascript:insertGuardians(" + JSON.stringify(search) + ");'></a>").append(description)
                ).append(
                    "<a href='?" + lang + flatten(search) + "' target='_blank'><img src='images/external-link.png' /></a>"
                )
            );
        }
    }

    $("#filters").accordion({
        collapsible: true,
        heightStyle: "content"
    });
    
    insertCustomOptions($("#custom_selector"));
    
    Nav.appendLanguageSuffix();
    Nav.updateComparisonNumber();
    Nav.disable('nav_cards');
    
    insertGuardians({
      id: id,
      name: name,
      stars: stars,
      attr: attr,
      place: place,
      border: border,
      shape: shape,
      skill: skill
    });
}
