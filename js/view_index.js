
/* Options for battle simulation. */
var cur_options = clone(Calculator.default_options);
var cur_restriction_index = 0;
var custom_restriction_index = -1;

/* Open the dialog and display the content with a specified ID. */
function openDialog(id) {
    $("#dialog div").each(function() {
        if ($(this).attr('id') == id) {
            $(this).show();
            $("#dialog").dialog("option", "title", $(this).attr("title"))
        } else
            $(this).hide();
        })
    $("#dialog").dialog("open");
}

/* Close the dialog. */
function closeDialog() {
    $("#dialog").dialog("close");
}

/* Show top 100. The argument v can be HP, MP, ATK, DEF, AGI, or WIS. */
function showTop100(v, options) {
    var tops = Card.getTop(v, 100, options);

    var title = "Top 100 " + v;

    var f;
    var description;
    if (options.buff == "none") {
        f = function(g) { return g.getMaxStats(0); };
        description = "<ul><li>All the values are from unenhanced (rebirth) Cool types.</li><li>Buffs are not considered.</li></ul>";
    } else if (options.buff == "recommended") {
        f = function(g) { return g.getMaxStats(1); };
        description = "<ul><li>All the values are from (rebirth) Cool types.</li><li>Only recommended buffs are considered.</li></ul>";
    } else if (options.buff == "all") {
        f = function(g) { return g.getMaxStats(2); };
        description = "<ul><li>All the values are from (rebirth) Cool types.</li><li>All buffs are considered.</li></ul>";
    }

    $("#selected-guardian").html("").append("<div id='top100'></div>");
    $("#top100")
        .append("<div class='title'>" + title + "</div>")
        .append(description);
    for (var i = 0; i < tops.length; i++) {
        var top = tops[i];

        if (top.cards.length == 0)
            continue;

        $("#top100").append("<div id='top100_" + i + "'></div>");
        var id = "#top100_" + i;

        $(id)
            .append("<div class='title'>" + top.title + "</div>")
            .append("<table><tr> \
            <th>Rank</th> \
            <th>Name</th> \
            <th>Attribute</th> \
            <th>HP</th> \
            <th>MP</th> \
            <th>ATK</th> \
            <th>DEF</th> \
            <th>AGI</th> \
            <th>WIS</th> \
            <th>Total</th> \
            <th>Encounter</th> \
          </tr></table>");

        for (var j = 0; j < top.cards.length; j++) {
            var g = top.cards[j];
            var status = f(g);
            $(id + " table").append(
                $("<tr></tr>")
                    .append("<td>" + (j + 1) + "</td>")
                    .append($("<td></td>").append(
                        Card.mklnk(g.id)
                    ))
                    .append("<td style='text-align: center;'>" + g.attribute.getImage(5) + "</td>")
                    .append("<td>" + status.hp + "</td>")
                    .append("<td>" + status.mp + "</td>")
                    .append("<td>" + status.atk + "</td>")
                    .append("<td>" + status.def + "</td>")
                    .append("<td>" + status.agi + "</td>")
                    .append("<td>" + status.wis + "</td>")
                    .append("<td>" + (status.hp + status.mp + status.atk + status.def + status.agi + status.wis) + "</td>")
                    .append("<td>" + g.place.name + "</td>")
            );
        }
    }
}

function showAcknowledgements() {
    openDialog("acknowledgements");
}

function showHelpsNeeded() {
    openDialog("helpsneeded");
}

function showRelatedLinks() {
    openDialog("related_links");
}

function initHelpsNeeded() {
    var gs = new Array();
    for (var gid in Card.notes)
        gs.push(Card.get(gid));
    gs.sort(Sorting.compose(Sorting.stars, Sorting.name));
    var stars = null;
    for (var i = 0; i < gs.length; i++) {
        var g = gs[i];
        var gid = g.id;
        var note = Card.notes[gid];
        if (stars != g.stars) {
            stars = g.stars;
            $("#helpsneeded").append("<h3>" + getStarsText(g.stars) + "</h3>");
            $("#helpsneeded").append("<ul></ul>");
        }
        $("#helpsneeded ul").last().append("<li>" + Card.mklnk(gid) + ": " + note + "</li>");
    }
}

function getCustomSkills() {
    var custom_skills = [];
    $("#skill_selection option:selected").each(function() {
        var sid = $(this).val();
        var skill = Skill.get(sid);
        if (skill != null && $.inArray(skill, custom_skills) == -1)
            custom_skills.push(skill);
    });
    return custom_skills;
}

function insertCardsSelection() {
    var stars = List.seq(1, 6);
    var getid = function(x) {
        return x.id;
    };
    var queries = new Array(
        {name: "id", value: new Array(), ignore: 0},
        {name: "stars", value: stars, ignore: stars.length},
        {name: "place", value: List.map(getid, Place.all), ignore: Place.all.length},
        {name: "attr", value: List.map(getid, Attribute.all), ignore: Attribute.all.length},
        {name: "border", value: List.map(getid, Border.all), ignore: Border.all.length},
        {name: "shape", value: List.map(getid, Shape.all), ignore: Shape.all.length},
        {name: "skill", value: List.map(getid, Skill.all), ignore: Skill.all.length}
    );
    var s_ids = queries[0].value;
    var s_stars = queries[1].value;
    var s_places = queries[2].value;
    var s_attrs = queries[3].value;
    var s_borders = queries[4].value;
    var s_shapes = queries[5].value;
    var s_skills = queries[6].value;

    var update = function() {
        var strs = new Array();
        for (var i = 0; i < queries.length; i++) {
            if (queries[i].value.length == queries[i].ignore)
                continue;
            var s = queries[i].value.join(",");
            strs.push(queries[i].name + "=" + s);
        }
        var s = strs.join("&");
        $("#basic_query_string").html(s);
        $("#advanced_query_string").html(s);
    };

    $("#cards_selection")
        .append(
          $("<p>Mode:&nbsp;</p>")
            .append(
                $("<input type='radio' id='basic_radio' name='selector_mode' value='basic' checked />")
                    .click(function() {
                        $("#advanced_selector").hide();
                        $("#basic_selector").show();
                    })
            )
            .append("<label id='basic_radio'>Basic</label>&nbsp;")
            .append(
                $("<input type='radio' id='advanced_radio' name='selector_mode' value='advanced' />")
                    .click(function() {
                        $("#basic_selector").hide();
                        $("#advanced_selector").show();
                    })
            )
            .append("<label id='advanced radio'>Advanced</label>")
        )
        .append(
            $("<p id='basic_selector'></p>")
                .append(
                    $("<table></table>")
                        .append("<tr><td colspan='2' class='tips'>You may copy the following query string and use it in the advanced mode next time.</td></tr>")
                        .append("<tr><th>Query String</th><td id='basic_query_string'></td>")
                        .append("<tr><th>ID</th><td><textarea id='id_selector' rows='2' cols='80'></textarea></td></tr>")
                        .append("<tr><th>Stars</th><td id='stars_selector'></td></tr>")
                        .append("<tr><th>Encounter</th><td id='place_selector'></td></tr>")
                        .append("<tr><th>Attribute</th><td id='attr_selector'></td></tr>")
                        .append("<tr><th>Border</th><td id='border_selector'></td></tr>")
                        .append("<tr><th>Shape</th><td id='shape_selector'></td></tr>")
                        .append("<tr><th>Skill</th><td id='skill_selector'></td></tr>")
                )
        )
        .append(
            $("<p id='advanced_selector'></p>")
                .append("<p>Please write a query string below.</p>")
                .append("<textarea id='advanced_query_string' rows='5' cols='80'></textarea>")
                .hide()
        );

    $("#id_selector").bind("keyup cut paste", function() {
        List.clear(s_ids);
        var is = $(this).val().split(",");
        for (var i = 0; i < is.length; i++) {
            if (is[i].length > 0)
                s_ids.push(is[i]);
        }
        update();
    });
    var data = new Array(
        { id: "stars_selector", src: stars, dst: s_stars, width: 0,
          value: function(x) {return x; }, content: function(x) {
            return List.map(
                    function(x) {return "<img width='24px' src='images/rare_star" + image_ext + "' />";}, 
                    List.seq(0, x)
                  ).join("");
        }},
        { id: "place_selector", src: Place.all, dst: s_places, width: 1,
          value: function(x) {return x.id; }, content: function(x) {return x.name; }},
        { id: "attr_selector", src: Attribute.all, dst: s_attrs, width: 0, 
          value: function(x) {return x.id; }, content: function(x) {return x.getImage(); }},
        { id: "border_selector", src: Border.all, dst: s_borders, width: 0,
          value: function(x) {return x.id; }, content: function(x) {return x.name; }},
        { id: "shape_selector", src: Shape.all, dst: s_shapes, width: 10,
          value: function(x) {return x.id; }, content: function(x) {return x.getImage(32); }},
        { id: "skill_selector", src: Skill.all, dst: s_skills, width: 1,
          value: function(x) {return x.id; }, content: function(x) {return x.name + " (" + x.description + ")"; }}
    );

    for (var i = 0; i < data.length; i++) { 
        var d = data[i];
        $("#" + d.id).each((function(d) {
            return function() {
                $(this).append(
                    $("<label></label>").append(
                        $("<input type='checkbox' value='toggle_" + d.id + "' checked />")
                            .change(function() {
                                var that = this;
                                var selected = $(this).is(':checked');
                                $("#" + d.id).find("input:checkbox").each(function() {
                                    if (that == this)
                                        return;
                                    var checked = $(this).is(':checked');
                                    $(this).prop('checked', selected);
                                    var v = parseInt($(this).val());
                                    if (!checked && selected)
                                        d.dst.push(v);
                                    else if (!selected)
                                        d.dst.remove(v);
                                    update();
                                })
                            })
                    )
                    .append("Select/deselect all")
                ).append("<br/>");
                for (var j = 0; j < d.src.length; j++) {
                    $(this).append(
                        $("<label></label>")
                            .append($("<input type='checkbox' value='" + d.value(d.src[j]) + "' checked />").change(function() {
                                var v = parseInt($(this).val());
                                if ($(this).is(':checked'))
                                    d.dst.push(v);
                                else
                                    d.dst.remove(v);
                                update();
                            }))
                            .append(d.content(d.src[j]) + "&nbsp;&nbsp;")
                    );
                    if (d.width > 0 && j % d.width == d.width - 1)
                        $(this).append("<br/>");
                }
            }
        })(d));
    }
    
    update();
}

/* Get the selected skills. */
function getSelectedSkills() {
    var res = new Array();
    for (var i = 0; i < 3; i++) {
        var skill_id = $("select#skill" + i + " option:selected").val();
        var skill = Skill.get(skill_id);
        if (skill != null)
            res.push(skill);
    }
    return res;
}

/* Update the cost for casting the selected skills. */
function updateSkillCost(mp) {
    var mp1 = 0;
    var max_attack = null;
    var selected_skills = getSelectedSkills();
    for (var i = 0; i < selected_skills.length; i++) {
        var skill = selected_skills[i];
        if (skill.type == 0) {
            if (max_attack == null || skill.cost.mp > max_attack)
                max_attack = skill.cost.mp;
        } else
            mp1 += skill.cost.mp;
    }
    mp1 += max_attack == null ? 0 : max_attack;
    var mp2 = mp1 + (max_attack == null ? 0 : max_attack);
    var mp3 = mp2 + (max_attack == null ? 0 : max_attack);
    $("#skill_mp1").html(mp1);
    $("#skill_mp2").html(mp2);
    $("#skill_mp3").html(mp3);
    if (mp1 > mp)
        $("#mp_exceed1").show();
    else
        $("#mp_exceed1").hide();
    if (mp2 > mp)
        $("#mp_exceed2").show();
    else
        $("#mp_exceed2").hide();
    if (mp3 > mp)
        $("#mp_exceed3").show();
    else
        $("#mp_exceed3").hide();
}

function formatStats(e, mult) {
    if (mult > 1)
      $(e).css('color', 'green');
    else if (mult < 1)
      $(e).css('color', 'red');
    else
      $(e).css('color', 'black');
}

function insertGuardian(gid, tid, custom_skills) {
    var g = Card.get(gid);
    if (g == null)
      return;

    /* Sort EX skills first. */
    ExSkill.ex1.sort(Sorting.name);
    ExSkill.ex2.sort(Sorting.name);

    var type = typeof(tid) == 'undefined' ? (g.hasType(Type.ace) ? Type.ace : Type.cool) : Type.get(tid);
    g.setType(type);
    g.setLevel(1);
    g.setStoned(false);

    var e = $("#selected-guardian");
    $(e).html("");

    var top = $("<div id='top'></div>");
    $(e).append(top);

    $(top).append($("<div id='card'></div>").addClass("card").html("<a href='" + g.getLargeImageLink() + "' target='_blank'>" + g.getImage(215) + "</a>"));

    var info = $("<div id='info'></div>");
    $(top).append(info);

    /* Title. */
    // Translate the name of the selected card to English.
    var etitle = goptions.isTranslationNeeded() && g.id in ename.guardians ? " (" + ename.guardians[g.id] + ")" : "";
    $(info).append($("<div></div>").addClass("title")
        .append("<span><a href='" + g.getLink() + "'>" + g.name + etitle + "</a></span>")
        .append(Card.notes[g.id] != null ? " <span class='warning'>(" + Card.notes[g.id] + ")</span>" : "")
    );
    
    /* Basic information. */
    var description = g.description;
    $(info).append($("<div id='stars'></div>").addClass("stars").html(getStarsText(g.stars)));
    $(info).append($("<div id='description'></div>").addClass("description").html(description));
    $(info).append(
      $("<div id='spawn'></div>").addClass('spawn')
        .append($("<span id='shape'></span>").addClass("shape").html(g.shape.getImage(30)))
        .append($("<span id='place'></span>").addClass("place").html(g.getPlaceName()))
        .append($("<span id='event'></span>").addClass("event").html(g.event == Event.none ? "" : "(" + g.event.name + ")"))
        .append($("<span id='current-type'></span>").addClass("current-type").html(g.type.name))
    );
    if (RESOURCES_LOADED["evaluation"]) {
        var etype = evaluation.getType(g, g.type);
        if (etype != UNKNOWN_TYPE)
            $("#current-type").addClass(etype + "-type" + evaluation.getRank(g, g.type));
    }
    
    /* Types. */
    var typelist = new Array(
      { id: "types",
        items: List.fold_left(function(res, t) {if (!t.isRebirthType()) res.push(t); return res; }, new Array(), Type.all) },
      { id: "rbtypes",
        items: List.fold_left(function(res, t) {if (t.isRebirthType() && t.getNormalType().getRebirthType().id == t.id) res.push(t); return res; }, new Array(), Type.all),
        note: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;::Rebirth" }
    );
    if (getCookie(COOKIE_LOAD_HETEROGENEOUS_TYPES, "") == "true") {
        typelist.push(
            { id: "heterogeneous_rbtypes",
              items: List.fold_left(function(res, t) {if (t.isRebirthType() && t.getNormalType().getRebirthType().id != t.id) res.push(t); return res; }, new Array(), Type.all),
              note: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;::Rebirth" }
        );
    }

    for (var i = 0; i < typelist.length; i++) {
        var lid = typelist[i].id;
        var items = typelist[i].items;
        var note = typelist[i].note;
        $(info).append($("<div id='" + lid + "'></div>").addClass("types"));
        for (var j = 0; j < items.length; j++) {
            var skeleton = function(tid) { 
                return function() { insertGuardian(gid, tid); };
            }
            var t = $("<a href='javascript:'></a>").append(
                $("<span></span>").html(items[j].name).each(
                    function() {
                        $(this).addClass(g.hasType(items[j]) ? "type" : "disabled");
                        if (items[j] == g.type)
                            $(this).addClass("selected");
                    }
                )
            );
            if (g.hasType(items[j]))
                $(t).click(skeleton(items[j].id));
            $("#" + lid).append(t);
        }
        if (note != null)
            $("#" + lid).append($("<span></span>").addClass("light").html(note));
    }

    /* Move types and rbtypes up when heterogeneous types are inserted. */
    if (getCookie(COOKIE_LOAD_HETEROGENEOUS_TYPES, "") == "true") {
        var dy = 25;
        $("#spawn").css("top", parseFloat($("#spawn").css("top")) - dy);
        $("#types").css("top", parseFloat($("#types").css("top")) - dy);
        $("#rbtypes").css("top", parseFloat($("#rbtypes").css("top")) - dy);
    }
    /* A hack to put the shape, encounter place, event, and current type in a right position in Japanese version. */
    if (locale.getLanguage() == LANG_JP)
        $("#spawn").css("top", parseFloat($("#spawn").css("top")) - 10);

    /* Stats */
    $(info).append(
      $("<table id='stats'></table>").addClass("stats")
        .append(
          $("<tr></tr>")
            .append($("<th class='descriptions'><a href='javascript:openDialog(\"faq_stats\");'><img width='16px' src='images/question.png'/></a></th>"))
            .append($("<th class='values'>HP</th>"))
            .append($("<th class='values'>MP</th>"))
            .append($("<th class='values'>ATK</th>"))
            .append($("<th class='values'>DEF</th>"))
            .append($("<th class='values'>AGI</th>"))
            .append($("<th class='values'>WIS</th>"))
            .append($("<th class='values'>Total</th>"))
        )
        .append(
          $("<tr></tr>")
            .append($("<th>Initial Values</th>"))
            .append($("<td></td>").html(g.getMinHP()).data('mult', type.hp))
            .append($("<td></td>").html(g.getMinMP()).data('mult', type.mp))
            .append($("<td></td>").html(g.getMinATK()).data('mult', type.atk))
            .append($("<td></td>").html(g.getMinDEF()).data('mult', type.def))
            .append($("<td></td>").html(g.getMinAGI()).data('mult', type.agi))
            .append($("<td></td>").html(g.getMinWIS()).data('mult', type.wis))
            .append($("<td></td>").html(g.getMinStats().total()))
        )
        .append(
          $("<tr></tr>")
            .append($("<th>Stones Needed</th>"))
            .append($("<td></td>").html(g.getStoneHP()).data('mult', type.hp))
            .append($("<td></td>").html(g.getStoneMP()).data('mult', type.mp))
            .append($("<td></td>").html(g.getStoneATK()).data('mult', type.atk))
            .append($("<td></td>").html(g.getStoneDEF()).data('mult', type.def))
            .append($("<td></td>").html(g.getStoneAGI()).data('mult', type.agi))
            .append($("<td></td>").html(g.getStoneWIS()).data('mult', type.wis))
            .append($("<td></td>").html(g.getStoneStats().total()))
        )
        .append(
          $("<tr></tr>")
            .append($("<th>Max Level Stats</th>"))
            .append($("<td></td>").html(g.getMaxHP()).data('mult', type.hp))
            .append($("<td></td>").html(g.getMaxMP()).data('mult', type.mp))
            .append($("<td></td>").html(g.getMaxATK()).data('mult', type.atk))
            .append($("<td></td>").html(g.getMaxDEF()).data('mult', type.def))
            .append($("<td></td>").html(g.getMaxAGI()).data('mult', type.agi))
            .append($("<td></td>").html(g.getMaxWIS()).data('mult', type.wis))
            .append($("<td></td>").html(g.getMaxStats().total()))
        )
        .append(
          $("<tr></tr>")
            .append($("<th>Max Card Stats</th>"))
            .append($("<td></td>").html(g.getMaxStonedHP()).data('mult', type.hp))
            .append($("<td></td>").html(g.getMaxStonedMP()).data('mult', type.mp))
            .append($("<td></td>").html(g.getMaxStonedATK()).data('mult', type.atk))
            .append($("<td></td>").html(g.getMaxStonedDEF()).data('mult', type.def))
            .append($("<td></td>").html(g.getMaxStonedAGI()).data('mult', type.agi))
            .append($("<td></td>").html(g.getMaxStonedWIS()).data('mult', type.wis))
            .append($("<td></td>").html(g.getMaxStonedStats().total()))
        )
    );
    $("table.stats > tbody > tr > td").each(
      function() { formatStats($(this), $(this).data('mult')); }
    );

    /* A wrapper containing three columns */
    var wrapper = $("<div id='wrapper'></div>");
    $(e).append(wrapper);

    /* The left column */
    var left = $("<div id='left'></div>");
    $(wrapper).append(left);

    /* Skill selection. */
    var gskills = custom_skills != null ? custom_skills : g.getRecommends();
    var sorted_skills = new Array();
    sorted_skills.push.apply(sorted_skills, Skill.getLearnableSkills());
    for (var i = 0; i < Math.min(g.skills.length, g.getLearntSkillSize()); i++) {
        if (g.skills[i].stone == 0)
            sorted_skills.push(g.skills[i]);
    }
    sorted_skills.sort(Sorting.compose(Sorting.skill, Sorting.name));
    $(left).append(
      $("<div></div>")
        .addClass("header")
        .append("<span>Skills & Options</span>")
        .append(
          $("<a href='javascript:'><img class='qmark' width='16' src='images/question.png' /></a>")
            .click(function() { openDialog("faq_skills"); })
        )
    );

    /* Skill selection. */
    $(left).append(
        $("<div id='skill_selection'></div>").each(function() {
            for (var i = 0; i < 3; i++) {
                var entry = $("<div></div>").addClass("entry");
                $(this).append(entry);
                
                var select = $("<select id='skill" + i + "'></select>").addClass("selector");
                $(entry).append(select);
                $(select).append($("<option>None</option>").val(-1));
                for (var j = 0; j < sorted_skills.length; j++) {
                    var skill = sorted_skills[j];
                    $(select).change(function() { updateSkillCost(g.getMaxStonedMP()); });
                    $(select).append(
                        $("<option></option>")
                            .append($("<span></span>").addClass("skill-name").html(skill.name))
                            .append($("<span></span>").addClass("skill-description").html(" (" + skill.description + ")" + (g.canLearnSkill(skill) ? "" : "*")))
                            .each(function () {
                                if (i < gskills.length && skill.id == gskills[i].id)
                                    $(this).attr("selected", true);
                            })
                                .val(skill.id)
                    );
                    if (j + 1 < sorted_skills.length) {
                        var next = sorted_skills[j + 1];
                        if (skill.stone == 0 && next.stone == 1)
                            $(select).append("<option>====================</option>");
                        else if (skill.level == next.level + 1 && skill.attribute != Attribute.death && next.attribute != Attribute.death)
                            $(select).append("<option>====================</option>");
                    }
                }
            }
        })
    )
    var setMessage = function(msg) {
        $("#shortmsg").html(msg);
        setTimeout(function() {
            $("#shortmsg").html("");
        }, 1000);
    };
    $(left).append(
      $("<div></div>").append("<span>Required MP: </span>")
                      .append("<span id='skill_mp1'></span>")
                      .append("&nbsp;&nbsp;&nbsp;<span id='mp_exceed1'><font color='red'>(Not Enough MP!)</font></span>")
                      .css('margin-top', '5px')
    ).append(
      $("<div></div>").append("<span>Double Cast: </span>")
                      .append("<span id='skill_mp2'></span>")
                      .append("&nbsp;&nbsp;<span id='mp_exceed2'><font color='red'>(Not Enough MP!)</font></span>")
    ).append(
      $("<div></div>").append("<span>Triple Cast: </span>")
                      .append("<span id='skill_mp3'></span>")
                      .append("&nbsp;&nbsp;<span id='mp_exceed3'><font color='red'>(Not Enough MP!)</font></span>")
    )
    .append("<br/>")
    .append(
        $("<div></div>")
            .append($("<a href='javascript:'><img src='images/save_24x24.jpg' alt='Save skills for this card of the selected type' title='Save skills for this card of the selected type'/></a>").click(function() {
                var custom_skills = getCustomSkills();
                g.setCustomRecommends(custom_skills, {local: true});
                setMessage("Saved skills");
            })
            )
            .append("&nbsp;&nbsp;")
            .append($("<a href='javascript:'><img src='images/save_all_24x24.jpg' alt='Save skills for this card of all types' title='Save skills for this card of all types'/></a>").click(function() {
                var custom_skills = getCustomSkills();
                g.setCustomRecommends(custom_skills);
                setMessage("Saved skills");
            })
            )
            .append("&nbsp;&nbsp;")
            .append($("<a href='javascript:'><img src='images/revert_24x24.jpg' alt='Revert to default skills for this card of the selected types' title='Revert to default skills for this card of the selected types'/></a>").click(function() {
                g.clearCustomRecommends({local: true});
                var skills = g.getRecommends();
                for (var i = 0; i < skills.length; i++)
                    $("#skill" + i).val(skills[i].id);
                for (var i = skills.length; i < 3; i++)
                    $("#skill" + i).val(-1);
                updateSkillCost(g.getMaxStonedMP());
                setMessage("Reverted to default");
            })
            )
            .append("&nbsp;&nbsp;")
            .append($("<a href='javascript:'><img src='images/revert_all_24x24.jpg' alt='Revert to default skills for this card of all types' title='Revert to default skills for this card of all types'/></a>").click(function() {
                g.clearCustomRecommends();
                var skills = g.getRecommends();
                for (var i = 0; i < skills.length; i++)
                    $("#skill" + i).val(skills[i].id);
                for (var i = skills.length; i < 3; i++)
                    $("#skill" + i).val(-1);
                updateSkillCost(g.getMaxStonedMP());
                setMessage("Reverted to default");
            })
            )
            .append("&nbsp;&nbsp;")
            .append($("<a href='javascript:'><img src='images/comparison_24x24.jpg' alt='Add this card of the selected type with the selected skills to comparison' title='Add this card of the selected type with the selected skills to comparison'/></a>").click(function() {
                var c = clone(g);
                c.setSkills(getSelectedSkills());
                Comparison.addCard(c);
                Nav.updateComparisonNumber();
                setMessage("Added to comparison");
            })
            )
    )
    .append("<div id='shortmsg'></div>")
    .append("<br/>");

    $(left).append(
      $("<div id='options'></div>")
        .append(
          $("<select id='restriction'></select>").addClass("selector").each(function() {
            for (var i = 0; i < Restrictions.length; i++) {
                $(this).append(
                  $("<option>" + Restrictions[i].name + "</option>")
                    .data('index', i)
                    .attr('selected', i == cur_restriction_index)
                );
            }
            $(this).append(
                $("<option>Custom...</option>")
                    .data('index', custom_restriction_index)
                    .attr('selected', cur_restriction_index == custom_restriction_index)
            );
          }).click(function() {
            if ($(this).find("option:selected").data('index') == custom_restriction_index)
                openDialog("cards_selection");
          })
        )
        .append("<br/>")        
        .append(
          $("<label></label>")
            .append($("<input type='checkbox' id='ignore-qs'/>").attr('checked', !cur_options.qs))
            .append("&nbsp;Ignore QS")
        )
        .append("<br/>")
        .append(
          $("<label></label>")
            .append($("<input type='checkbox' id='ignore-sap'/>").attr('checked', !cur_options.sap))
            .append("&nbsp;Ignore Sap")
        )
        .append("<br/>")
        .append(
          $("<label></label>")
            .append($("<input type='checkbox' id='ignore-nonrecommended'/>").attr('checked', !cur_options.nonrecommended))
            .append("&nbsp;Ignore Non-Recommended Buff/Debuff (Opponent)")
        )
        .append("<br/>")        
        .append(
            $("<label></label>")
                .append($("<input type='checkbox' id='opt-plus-normal'/>").attr('checked', cur_options.plus_normal))
                .append("&nbsp;Plus Normal Attack (Self)")
        )
        .append("<br/>")
        .append(
            $("<select id='opt-mode'></select>")
                .addClass("selector").each(function() {
                    $(this).append($("<option>Compute Unable to OHKO</option>").val(MODE_UOHKO));
                    $(this).append($("<option>Compute OHKO By</option>").val(MODE_OHKOBY));
                    $(this).append($("<option>Compute Unable to QS-KO</option>").val(MODE_UQSKO));
                    $(this).append($("<option>Compute QS-KO</option>").val(MODE_QSKO));
                }).val(cur_options.mode)
        )
        .append("<br/>")
        .append(
          $("<label></label>")
            .append($("<input type='checkbox' id='opt-merge-oneshotby'/>").attr('checked', cur_options.merge_oneshotby))
            .append("&nbsp;Merge Results of One Shot By")
        )
        .append("<br/>")
        .append("<div class='subheader'>My Ex Cards</div>")
        .append(
            $("<div></div>")
            .append("<span>EX1</span>")
            .append(
                $("<select id='my-ex1'></select>")
                .addClass("selector2")
                .append("<option value='-1'>None</option>")
                .each(function() {
                    for (var i = 0; i < ExSkill.ex1.length; i++)
                        $(this).append("<option value='" + ExSkill.ex1[i].id + "'>" + ExSkill.ex1[i].name + "</option>");
                })
                .val(cur_options.ex1s.ex1 == null ? -1 : cur_options.ex1s.ex1.id)
            )
        )
        .append(
            $("<div></div>")
            .append("<span>EX2</span>")
            .append(
                $("<select id='my-ex2'></select>")
                .addClass("selector2")
                .append("<option value='-1'>None</option>")
                .each(function() {
                    for (var i = 0; i < ExSkill.ex2.length; i++)
                        $(this).append("<option value='" + ExSkill.ex2[i].id + "'>" + ExSkill.ex2[i].name + "</option>");
                })
                .val(cur_options.ex1s.ex2 == null ? -1 : cur_options.ex1s.ex2.id)
            )
        )
        .append("<div class='subheader'>Opponent Ex Cards</div>")
        .append(
            $("<div></div>")
            .append("<span>Ex1</span>")
            .append(
                $("<select id='oppo-ex1'></select>")
                .addClass("selector2")
                .append("<option value='-1'>None</option>")
                .each(function() {
                    for (var i = 0; i < ExSkill.ex1.length; i++)
                        $(this).append("<option value='" + ExSkill.ex1[i].id + "'>" + ExSkill.ex1[i].name + "</option>");
                })
                .val(cur_options.ex2s.ex1 == null ? -1 : cur_options.ex2s.ex1.id)
            )
        )
        .append(
            $("<div></div>")
            .append("<span>Ex2</span>")
            .append(
                $("<select id='oppo-ex2'></select>")
                .addClass("selector2")
                .append("<option value='-1'>None</option>")
                .each(function() {
                    for (var i = 0; i < ExSkill.ex2.length; i++)
                        $(this).append("<option value='" + ExSkill.ex2[i].id + "'>" + ExSkill.ex2[i].name + "</option>");
                })
                .val(cur_options.ex2s.ex2 == null ? -1 : cur_options.ex2s.ex2.id)
            )
        )
    );

    $(left)
      .append($("<button>Calculate</button>").click((function(gid, tid) {
          return function() {
              var custom_skills = getCustomSkills();
              cur_options.qs = !$("#ignore-qs").is(':checked');
              cur_options.sap = !$("#ignore-sap").is(':checked');
              cur_options.nonrecommended = !$("#ignore-nonrecommended").is(':checked')
              cur_options.mode = $("#opt-mode").val();
              cur_options.merge_oneshotby = $("#opt-merge-oneshotby").is(':checked');
              cur_options.plus_normal = $("#opt-plus-normal").is(':checked');
              cur_restriction_index = $("#restriction option:selected").data('index');
              cur_options.ex1s.ex1 = ExSkill.get($("#my-ex1").val());
              cur_options.ex1s.ex2 = ExSkill.get($("#my-ex2").val());
              cur_options.ex2s.ex1 = ExSkill.get($("#oppo-ex1").val());
              cur_options.ex2s.ex2 = ExSkill.get($("#oppo-ex2").val());
              insertGuardian(gid, tid, custom_skills);
          };
    })(gid, tid)))
    $("#mp_exceed1").css('display', 'none');
    $("#mp_exceed2").css('display', 'none');
    updateSkillCost(g.getMaxStonedMP());

    /* Skills learnt */
    $(left).append($("<div>Skills Learnt at Level</div>").addClass("header"));
    for (var level in g.learns) {
        if (level > g.getMaxLevel())
            continue;
        var skill = g.learns[level];
        $(left).append(
          $("<div></div>").addClass("entry").addClass("small-font")
            .append($("<span></span>").addClass("skill-header").html(level))
            .append($("<span></span>").addClass("skill-name").html(skill.getLink()))
            .append($("<span></span>").addClass("skill-description").html(" (" + skill.description + ")"))
        );
    }

    /* Attributes */
    var strOfAttributes = function(attrs, delim) {
        return List.map(function(attr) { return attr.name; }, attrs).join(delim);
    };
    $(left).append($("<div>Attribute of Card</div>").addClass("header"))
           .append($("<div></div>").addClass("entry").addClass("small-font")
             .append($("<span>Element</span>").addClass("attribute-header"))
             .append($("<span></span>").addClass("attribute-name").html(g.attribute.name))
           )
           .append($("<div></div>").addClass("entry").addClass("small-font")
             .append($("<span>Criticals To</span>").addClass("attribute-header"))
             .append($("<span></span>").addClass("attribute-name").html(strOfAttributes(g.attribute.getCriticalTo(), ", ")))
           )
           .append($("<div></div>").addClass("entry").addClass("small-font")
             .append($("<span>Blocked By</span>").addClass("attribute-header"))
             .append($("<span></span>").addClass("attribute-name").html(strOfAttributes(g.attribute.getBlockedBy(), ", ")))
           )
           .append($("<div></div>").addClass("entry").addClass("small-font")
             .append($("<span>Criticals By</span>").addClass("attribute-header"))
             .append($("<span></span>").addClass("attribute-name").html(strOfAttributes(g.attribute.getCriticalBy(), ", ")))
           )
           .append($("<div></div>").addClass("entry").addClass("small-font")
             .append($("<span>Blocks</span>").addClass("attribute-header"))
             .append($("<span></span>").addClass("attribute-name").html(strOfAttributes(g.attribute.getBlocks(), ", ")))
           )

    /* The center column */
    var center = $("<div id='center'></div>");
    $(wrapper).append(center);

    g = clone(g);
    g.setLevel(g.getMaxLevel());
    g.setStoned(true);
    g.setSkills(gskills);

    /* Collect the guardians that satisfy the restrictions. */
    var selector = cur_restriction_index == custom_restriction_index ?
        Selector.fromString($("#advanced_query_string").val()) :
        Selector.and(Selector.stars(g.stars), Restrictions[cur_restriction_index].selector);

    var gs = Selector.select(selector);
    gs.sort(Sorting.compose(Sorting.attribute, Sorting.name));

    /* Find the guardians that cannot be one shoted. */
    var oneshots = [];
    if (cur_options.mode == MODE_UOHKO) {
        oneshots = Calculator.getUOHKO(g, gs, cur_options);
    } else if (cur_options.mode == MODE_OHKOBY)
        oneshots = Calculator.getOHKOBy(g, gs, cur_options);
    else if (cur_options.mode == MODE_UQSKO)
        oneshots = Calculator.getUQSKO(g, gs, cur_options);
    else if (cur_options.mode == MODE_QSKO)
        oneshots = Calculator.getQSKO(g, gs, cur_options);

    for (var k = 0; k < oneshots.length; k++) {
        var unable = oneshots[k];

        /* Insert the header. */
        $(center).append(
        $("<div></div>")
            .addClass("header")
            .append(
                $("<span></span>")
                .append("<img src='images/" + (oneshots.length == 1 ? "collapse" : "expand") +  ".png' class='expand-icon'/>")
                .append("<span>" + unable.title + ":</span>")
                .append("<span>" + unable.ccount + " (" + unable.tcount + ")</span>")
                .click((function(id) {
                    return function() {
                        if ($("#" + id).is(":hidden"))
                            $(this).find("img").attr('src', 'images/collapse.png');
                        else
                            $(this).find("img").attr('src', 'images/expand.png');
                        $("#" + id).slideToggle(300);
                    };
                })(unable.id))
                .css('cursor', 'pointer')
            )
            .append(
                $("<a href='javascript:'><img class='qmark' width='16' src='images/question.png' /></a>")
                    .click(function() { openDialog("faq_formula"); })
            )
        );
        var oneshot = $("<div id='" + unable.id + "'" + (oneshots.length == 1 ? "" : "style='display:none;'") + "></div>");
        $(center).append(oneshot);
        for (var i = 0; i < unable.cards.length; i++) {
            var opponent = unable.cards[i].opponent;
            var res = "";
            for (var j = 0; j < unable.cards[i].types.length; j++) {
                var t = unable.cards[i].types[j];
                if (t.isRebirthType())
                    res += "<span class='shorttype'><u>" + t.shortname + "</u></span>"; 
                else
                    res += "<span class='shorttype'>" + t.shortname + "</span>"; 
            }
            if (res != "") {
                $(oneshot).append($("<div></div>").addClass("entry").addClass("small-font")
                .append($("<span></span>").addClass("guardian-attr").html(opponent.attribute.getImage(5)))
                .append($("<span class='guardian-name'></span>").html(Card.mklnk(opponent.id)))
                .append($("<span></span>").addClass("shorttypes").html(res))
                );
            }
        }
        $(oneshot).append($("<hr/>"))
                .append($("<div></div>").html("Total: " + unable.ccount + " (" + unable.tcount + ")"));
    }

    $(left).append(
      $("<div></div>")
        .append($("<div>Attributes</div>").addClass("header"))
        .append($("<div id='attributes'></div>"))
    );
    insertAttributesTable(document.getElementById("attributes"));

    $(left).append(
      $("<div></div>")
        .append($("<div>Types</div>").addClass("header"))
        .append($("<table id='typenames'></table>"))
    );
    var tnames = $("#typenames");
    for (var i = 0; i < Type.all.length; i++) {
      var type = Type.all[i];
      if (type.isRebirthType())
        continue;
      $(tnames).append($("<tr></tr>")
        .append($("<td></td>").html(type.name))
        .append($("<td></td>").html(type.shortname))
        .append($("<td></td>").html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"))
        .append($("<td></td>").html(type.getRebirthType().name))
        .append($("<td></td>").append($("<u></u>").html(type.getRebirthType().shortname)))
      )
    }

    /* Minor adjustment for the addition of the menu on the left-hand side. */    
    $("#left").addClass('with-menu');
    $("#center").css("margin-top", "-8px");

    $('body').scrollTop(0);
}

function loadCards() {
    Nav.appendLanguageSuffix();
    Nav.updateComparisonNumber();
    Nav.disable('nav_damage_calculator');

    /* Initialize the cards menu. */

    /* Each object in the following array represents a tab. */
    var sortebpn = Sorting.compose([Sorting.event, Sorting.reverse(Sorting.border), Sorting.place, Sorting.name]);
    var sortpn = Sorting.compose(Sorting.place, Sorting.name);
    var glists = new Array(
        { id: "tab-limited",
          name: "Limited",
          sorter: sortebpn,
          title: "border",
          title2: "event",
          use_title2: function(g) { return g.event.id > 0; },
          loaded: RESOURCES_LOADED["5s"],
          selector: function(g) { return g.stars == 5 && g.border != Border.none; },
          cards: new Array()
        },
        { id: "tab-5s",
          name: "5*",
          sorter: sortpn,
          title: "place",
          loaded: RESOURCES_LOADED["5s"],
          selector: function(g) { return g.stars == 5 && g.border == Border.none; },
          cards: new Array()
        },
        { id: "tab-4s",
          name: "4*",
          sorter: sortpn,
          title: "place",
          loaded: RESOURCES_LOADED["4s"],
          selector: function(g) { return g.stars == 4; },
          cards: new Array()
        },
        { id: "tab-3s",
          name: "3*",
          sorter: sortpn,
          title: "place",
          loaded: RESOURCES_LOADED["3s"],
          selector: function(g) { return g.stars == 3; },
          cards: new Array()
        },
        { id: "tab-2s",
          name: "2*",
          sorter: sortpn,
          title: "place",
          loaded: RESOURCES_LOADED["2s"],
          selector: function(g) { return g.stars == 2; },
          cards: new Array()
        },
        { id: "tab-1s",
          name: "1*",
          sorter: sortpn,
          title: "place",
          loaded: RESOURCES_LOADED["1s"],
          selector: function(g) { return g.stars == 1; },
          cards: new Array()
        }
    );

    /* Add and sort cards to the tab data. */
    for (var i = 0; i < Card.all.length; i++) {
        var g = Card.all[i];
        for (var j = 0; j < glists.length; j++) {
            var glist = glists[j];
            if (glist.loaded && glist.selector(g)) {
                glist.cards.push(g);
            }
        }
    }
    for (var i = 0; i < glists.length; i++) {
        var glist = glists[i];
        glist.cards.sort(glist.sorter);
    }

    $("#guardian-list").append("<ul id='tab-list'></ul>");
    
    /* Insert cards to the tabs. */
    for (var i = 0; i < glists.length; i++) {
        var glist = glists[i];

        if (!glist.loaded)
            continue;

        $("#tab-list").append("<li><a href='#" + glist.id + "'>" + glist.name + "</a></li>");
        $("#guardian-list").append("<div id='" + glist.id + "'></div>");

        var gs = glist.cards;
        var prev = null;
        var id = null;
        var section_num = 0;
        for (var j = 0; j < gs.length; j++) {
            var g = gs[j];
            var title2 = "use_title2" in glist && glist.use_title2(g);
            var new_section = false;
            if (!title2 && (prev == null || g[glist.title] != prev)) {
                prev = g[glist.title];
                id = "guardians-section" + (section_num++);
                new_section = true;
            } else if (title2 && g[glist.title2] != prev) {
                prev = g[glist.title2];
                id = "guardians-section" + (section_num++);
                new_section = true;
            } 
            if (new_section) {
                $("#" + glist.id)
                    .append("<div class='header'>" + prev.name + "</div>")
                    .append($("<div id='" + id + "'></div>").append("<ul></ul>"));
            }
            // Translate the name of the card to English.
            var en = goptions.isTranslationNeeded() && g.id in ename.guardians ? " (" + ename.guardians[g.id] + ")" : "";
            $("div#" + glist.id + " div#" + id + " ul")
                .append(
                    $("<li></li>").append(
                        $("<a href='javascript:'></a>").html(g.name + en).data('id', g.id).each(function() {
                            if (g.event != Event.none) {
                                $(this).addClass("event_card");
                            }
                        })
                    ).append(
                        "<a href='index.html" + g.getLink() + "' target='_blank'><img src='images/external-link.png' /></a>"
                    )
                );
        }
    }

    /* Add a tab for Top 100. */
    $("#tab-list").append("<li><a href='#tab-top'>Top</a></li>");
    $("#guardian-list").append("<div id='tab-top'></div>");

    /* Make a tab active. */
    if (RESOURCES_LOADED["5s"])
        $("#guardian-list").tabs({ active: 1 });
    else
        $("#guardian-list").tabs({ active: 0 });

    /* Add click handler to all card links. */
    $("div#guardian-list ul li a").each(function() {
        $(this).click(function() {
            var gid = $(this).data('id');
            if (gid != null)
                insertGuardian(gid);
        });
    });
    
    /* Top 100 */
    $("div#tab-top")
        .append("<div class='header'>Without Buffs</div>")
        .append(" \
            <ul id='top100_no_buffs'> \
                <li><a class='internal' href='javascript:'>HP</a> <a href='?" + locale.getURLArgs("top=hp&buff=none") + "' target='_blank'><img src='images/external-link.png' /></a></li> \
                <li><a class='internal' href='javascript:'>MP</a> <a href='?" + locale.getURLArgs("top=mp&buff=none") + "' target='_blank'><img src='images/external-link.png' /></a></li> \
                <li><a class='internal' href='javascript:'>ATK</a> <a href='?" + locale.getURLArgs("top=atk&buff=none") + "' target='_blank'><img src='images/external-link.png' /></a></li> \
                <li><a class='internal' href='javascript:'>DEF</a> <a href='?" + locale.getURLArgs("top=def&buff=none") + "' target='_blank'><img src='images/external-link.png' /></a></li> \
                <li><a class='internal' href='javascript:'>AGI</a> <a href='?" + locale.getURLArgs("top=agi&buff=none") + "' target='_blank'><img src='images/external-link.png' /></a></li> \
                <li><a class='internal' href='javascript:'>WIS</a> <a href='?" + locale.getURLArgs("top=wis&buff=none") + "' target='_blank'><img src='images/external-link.png' /></a></li> \
                <li><a class='internal' href='javascript:'>Total</a> <a href='?" + locale.getURLArgs("top=total&buff=none") + "' target='_blank'><img src='images/external-link.png' /></a></li> \
            </ul> \
        ")
        .append("<div class='header'>With Recommended Buffs</div>")
        .append(" \
            <ul id='top100_recommended_buffs'> \
<li><a class='internal' href='javascript:'>ATK</a> <a href='?" + locale.getURLArgs("top=atk&buff=recommended") + "' target='_blank'><img src='images/external-link.png' /></a></li> \
                <li><a class='internal' href='javascript:'>DEF</a> <a href='?" + locale.getURLArgs("top=def&buff=recommended") + "' target='_blank'><img src='images/external-link.png' /></a></li> \
                <li><a class='internal' href='javascript:'>AGI</a> <a href='?" + locale.getURLArgs("top=agi&buff=recommended") + "' target='_blank'><img src='images/external-link.png' /></a></li> \
                <li><a class='internal' href='javascript:'>WIS</a> <a href='?" + locale.getURLArgs("top=wis&buff=recommended") + "' target='_blank'><img src='images/external-link.png' /></a></li> \
            </ul> \
        ").append("<div class='header'>With All Buffs</div>")
        .append(" \
            <ul id='top100_all_buffs'> \
                <li><a class='internal' href='javascript:'>ATK</a> <a href='?" + locale.getURLArgs("top=atk&buff=all") + "' target='_blank'><img src='images/external-link.png' /></a></li> \
                <li><a class='internal' href='javascript:'>DEF</a> <a href='?" + locale.getURLArgs("top=def&buff=all") + "' target='_blank'><img src='images/external-link.png' /></a></li> \
                <li><a class='internal' href='javascript:'>AGI</a> <a href='?" + locale.getURLArgs("top=agi&buff=all") + "' target='_blank'><img src='images/external-link.png' /></a></li> \
                <li><a class='internal' href='javascript:'>WIS</a> <a href='?" + locale.getURLArgs("top=wis&buff=all") + "' target='_blank'><img src='images/external-link.png' /></a></li> \
            </ul> \
        ");
    $("#top100_no_buffs li a.internal").each(function() {
        $(this).click(function() { 
            showTop100($(this).html(), { buff: "none" }); 
        })
    });
    $("#top100_recommended_buffs li a.internal").each(function() {
        $(this).click(function() { 
            showTop100($(this).html(), { buff: "recommended" }); 
        })
    });
    $("#top100_all_buffs li a.internal").each(function() {
        $(this).click(function() { 
            showTop100($(this).html(), { buff: "all" }); 
        })
    });

    /* Prepare the dialog. */
    $("#dialog").dialog({
        autoOpen: false,
        position: {my: "center", at: "top", of: window},
        width: 800
    });
    insertSkillsTable(document.getElementById("faq_skills_table"));
    insertCardsSelection();

    /* Initialize helps needed. */
    initHelpsNeeded();

    var args = getURLVars();
    var gid = args['id'];
    var name = args['name'];
    var top = args['top'];
    var tid = args['type'];
    if (gid != null && tid != null)
        insertGuardian(gid, tid);
    else if (gid != null)
        insertGuardian(gid);
    else if (name != null) {
        var gs = Selector.select(Selector.name(name));
        if (gs.length > 0) {
            gs.sort(function (g1, g2) { 
                if (g1.name.length < g2.name.length)
                    return -1;
                else if (g1.name.length > g2.name.length)
                    return 1;
                return Sorting.name(g1, g2);
            });
            if (tid != null)
                insertGuardian(gs[0].id, tid);
            else
                insertGuardian(gs[0].id);
        }
    } else if (top != null) {
        top = top.toUpperCase();
        if (top == "TOTAL")
            top = "Total";

        var buff = args['buff'];
        if (buff == null || (buff != "none" && buff != "recommended" && buff != "all"))
            buff = "none";

        var stars = args['stars'];

        var options = {buff : buff};
        if (stars != null)
            options["stars"] = stars;

        showTop100(top, options);
    } else {
        WhatIsNew.show("selected-guardian");
    }
}
