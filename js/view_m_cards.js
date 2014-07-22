var cur_options = clone(Calculator.default_options);

var Mobile = {
    ids: {
        ignore_qs: "options_ignore_qs",
        ignore_sap: "options_ignore_sap",
        ignore_nonrecommended: "options_ignore_nonrecommended",
        plus_normal: "options_plus_normal",
        merge_results: "options_merge_results"
    },
    getOptions: function() {
        cur_options.qs = !$("#" + Mobile.ids.ignore_qs).is(':checked');
        cur_options.sap = !$("#" + Mobile.ids.ignore_sap).is(':checked');
        cur_options.nonrecommended = !$("#" + Mobile.ids.ignore_nonrecommended).is(':checked')
        cur_options.merge_oneshotby = $("#" + Mobile.ids.merge_results).is(':checked');
        cur_options.plus_normal = $("#" + Mobile.ids.plus_normal).is(':checked');
        return cur_options;
    }
};

function removePage(id) {
    $("#" + id).remove();
}

function hasPage(id) {
    return $("#" + id).length != 0;
}

function nPage(id) {
    return "<div data-role='page' id='" + id + "'></div>";
}

function nHeader(header, bid, bname) {
    return "<div data-role='header'>" +
        "<h1>" + header + "</h1>" +
        "<a href='#" + bid + "' class='ui-btn-left'>" + bname + "</a>" +
        "</div>";
}

function nSeparator(name) {
    return "<div><h2 class='separator'>" + name + "</h2></div>";
}

function nListview(id) {
    return "<div role='main' class='ui-content'>" +
        "<div data-role='listview' id='" + id + "'></div>" +
        "</div>";
}

function nCollapsibleList(id, title) {
    return "<div data-role='collapsible'><h1>" + title + "</h1>" +
        "<ul data-role='listview' data-inset='false' id='" + id + "'></ul></div>";
}

function nPopup(id) {
    return "<div data-role='popup' id='" + id + "' ></div>";
}

function mkCardItem(card, bid, options) {
    var prefix = typeof options == "object" && "prefix" in options ? options.prefix : "";
    var suffix = typeof options == "object" && "suffix" in options ? options.suffix : "";
    return  $("<li></li>")
        .append(
            $("<a href='javascript:navCard(\"" + card.id + "\", \"" + bid + "\");'></a>")
                .append($(card.attribute.getImage()).addClass("ui-li-icon").addClass("ui-corner-none"))
                .append(card.getAvatar(32))
                .append(" " + prefix + card.name + suffix)
        );
}

function mkExCardItem(card, bid, options) {
    var prefix = typeof options == "object" && "prefix" in options ? options.prefix : "";
    var suffix = typeof options == "object" && "suffix" in options ? options.suffix : "";
    return  $("<li></li>")
        .append(
            $("<a href='javascript:navExCard(\"" + card.id + "\", \"" + bid + "\");'></a>")
                .append($(card.attribute.getImage()).addClass("ui-li-icon").addClass("ui-corner-none"))
                .append(card.getAvatar(32))
                .append(" " + prefix + card.name + suffix)
        );
}

function iCards(ex, id, cards, bid) {
    if (ex)
        insertExCards(id, cards, bid);
    else
        insertCards(id, cards, bid);
}

function navCardStatsOfType(cid, tid) {
    var card = Card.get(cid);
    var type = Type.get(tid);
    card.setType(type);
    var pid = "card_stats_of_type";
    if (hasPage(pid)) {
        removePage(pid);
    }
    $("body").append(nPage(pid));
    var lid1 = pid + "_initial";
    var lid2 = pid + "_stones";
    var lid3 = pid + "_max_level";
    var lid4 = pid + "_max_card";
    $("#" + pid)
        .append(nHeader(type.name + " " + card.name, "card_stats", "Back"))
        .append(nSeparator("Initial Values"))
        .append(nListview(lid1))
        .append(nSeparator("Stones Needed"))
        .append(nListview(lid2))
        .append(nSeparator("Max Level Stats"))
        .append(nListview(lid3))
        .append(nSeparator("Max Card Stats"))
        .append(nListview(lid4));

    $("#" + lid1)
        .append($("<li>HP: " + card.getMinHP() + "</li>").data("mult", type.hp))
        .append($("<li>MP: " + card.getMinMP() + "</li>").data("mult", type.mp))
        .append($("<li>ATK: " + card.getMinATK() + "</li>").data("mult", type.atk))
        .append($("<li>DEF: " + card.getMinDEF() + "</li>").data("mult", type.def))
        .append($("<li>AGI: " + card.getMinAGI() + "</li>").data("mult", type.agi))
        .append($("<li>WIS: " + card.getMinWIS() + "</li>").data("mult", type.wis));

    $("#" + lid2)
        .append($("<li>HP: " + card.getStoneHP() + "</li>").data("mult", type.hp))
        .append($("<li>MP: " + card.getStoneMP() + "</li>").data("mult", type.mp))
        .append($("<li>ATK: " + card.getStoneATK() + "</li>").data("mult", type.atk))
        .append($("<li>DEF: " + card.getStoneDEF() + "</li>").data("mult", type.def))
        .append($("<li>AGI: " + card.getStoneAGI() + "</li>").data("mult", type.agi))
        .append($("<li>WIS: " + card.getStoneWIS() + "</li>").data("mult", type.wis));

    $("#" + lid3)
        .append($("<li>HP: " + card.getMaxHP() + "</li>").data("mult", type.hp))
        .append($("<li>MP: " + card.getMaxMP() + "</li>").data("mult", type.mp))
        .append($("<li>ATK: " + card.getMaxATK() + "</li>").data("mult", type.atk))
        .append($("<li>DEF: " + card.getMaxDEF() + "</li>").data("mult", type.def))
        .append($("<li>AGI: " + card.getMaxAGI() + "</li>").data("mult", type.agi))
        .append($("<li>WIS: " + card.getMaxWIS() + "</li>").data("mult", type.wis));

    $("#" + lid4)
        .append($("<li>HP: " + card.getMaxStonedHP() + "</li>").data("mult", type.hp))
        .append($("<li>MP: " + card.getMaxStonedMP() + "</li>").data("mult", type.mp))
        .append($("<li>ATK: " + card.getMaxStonedATK() + "</li>").data("mult", type.atk))
        .append($("<li>DEF: " + card.getMaxStonedDEF() + "</li>").data("mult", type.def))
        .append($("<li>AGI: " + card.getMaxStonedAGI() + "</li>").data("mult", type.agi))
        .append($("<li>WIS: " + card.getMaxStonedWIS() + "</li>").data("mult", type.wis));

        $("#" + pid + " li").each(function() {
            if ($(this).data("mult") > 1)
                $(this).css("color", "green");
            else if ($(this).data("mult") < 1)
                $(this).css("color", "red");
            else
                $(this).css("color", "black");
        });
    $.mobile.changePage("#" + pid);
}

function navCardStats(cid) {
    var card = Card.get(cid);
    var pid = "card_stats";
    var lid = "card_stats_data";
    if (hasPage(pid)) {
        removePage(pid);
    }
    $("body").append(
        $(nPage(pid))
            .append(nHeader(card.name, "card_" + cid, "Back"))
            .append(nListview(lid))
    );

    for (var i = 0; i < Type.all.length; i++) {
        var type = Type.all[i];
        $("#" + lid).append("<li><a href='javascript:navCardStatsOfType(\"" + cid + "\", " + type.id + ");'>" + 
            type.name + "</a></li>")
    }
    $.mobile.changePage("#" + pid);
}

function navCalculatorOfType(cid, tid, mode) {
    var options = Mobile.getOptions();
    options.mode = mode;

    var card = clone(Card.get(cid));
    var type = Type.get(tid);
    card.setType(type);
    card.setLevel(card.getMaxLevel());
    card.setStoned(true);
    card.setSkills(getSelectedSkills("card_" + cid));
    var pid = "calculator_of_type";
    if (hasPage(pid))
        removePage(pid);
    $("body").append(
        $(nPage(pid))
        .append(nHeader(type.name + " " + card.name, "calculator", "Back"))
    );

    var selector = Selector.stars(card.stars);
    var oppos = Selector.select(selector, Card.all);
    oppos.sort(Sorting.compose(Sorting.attribute, Sorting.name));

    var oneshots = [];
    if (mode == MODE_UOHKO)
        oneshots = Calculator.getUOHKO(card, oppos, options);
    else if (mode == MODE_OHKOBY)
        oneshots = Calculator.getOHKOBy(card, oppos, options);
    else if (mode == MODE_UQSKO)
        oneshots = Calculator.getUQSKO(card, oppos, options);
    else if (mode == MODE_QSKO)
        oneshots = Calculator.getQSKO(card, oppos, options);

    for (var i = 0; i < oneshots.length; i++) {
        var unable = oneshots[i];
        $("#" + pid)
        .append(
            $("<div data-role='collapsible'><h1>" + unable.title + ": " + unable.ccount + " (" + unable.tcount + ")" + "</h1></div>")
            .append(
                $("<ul data-role='listview' data-inset='false'></ul>")
                .each(function() {
                    for (var j = 0; j < unable.cards.length; j++) {
                        var oppo = unable.cards[j].opponent;
                        var res = "";
                        for (var k = 0; k < unable.cards[j].types.length; k++) {
                            var t = unable.cards[j].types[k];
                            if (t.isRebirthType())
                                res += "<span class='shorttype'><u>" + t.shortname + "</u></span>"; 
                            else
                                res += "<span class='shorttype'>" + t.shortname + "</span>"; 
                        }
                        if (res != "") {
                            $(this).append($("<li></li>")
                                .append($(oppo.attribute.getImage(5)).addClass("ui-li-icon").addClass("ui-corner-none"))
                                .append("<span class='guardian-name'>" + oppo.name + "</span>")
                                .append(res)
                            );
                        }
                    }
                })
            )
            .collapsible({collapsed: oneshots.length > 1})
        );
    }
    $.mobile.changePage("#" + pid);    
}

function navCalculator(cid, mode) {
    var card = Card.get(cid);
    var pid = "calculator";
    var lid = pid + "_data";
    if (hasPage(pid))
        removePage(pid);
    $("body")
    .append(
        $(nPage(pid))
        .append(nHeader(card.name, "card_" + cid, "Back"))
        .append(nListview(lid))
    );
    for (var i = 0; i < Type.all.length; i++) {
        var type = Type.all[i];
        $("#" + lid).append("<li><a href='javascript:navCalculatorOfType(\"" + cid + "\", " + 
            type.id + ", \"" + mode + "\");'>" + type.name + "</a></li>")
    }
    $.mobile.changePage("#" + pid);
}

function insertCards(id, cards, bid) {
    $.each(cards, function(idx, card) {
        $("#" + id).append(mkCardItem(card, bid))
    });
}

/* Get the selected skills. */
function getSelectedSkills(pid) {
    var res = new Array();
    for (var i = 0; i < 3; i++) {
        var skill_id = $("select#" + pid + "_skill" + i + " option:selected").val();
        var skill = Skill.get(skill_id);
        if (skill != null)
            res.push(skill);
    }
    return res;
}

/* Update the cost for casting the selected skills. */
function updateSkillCost(pid, mp) {
    var mp1 = 0;
    var max_attack = null;
    var selected_skills = getSelectedSkills(pid);
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
    $("#" + pid + "_cast1").html(mp1);
    $("#" + pid + "_cast2").html(mp2);
    $("#" + pid + "_cast3").html(mp3);
    if (mp1 > mp)
        $("#" + pid + "_cast1").css("color", "red");
    else
        $("#" + pid + "_cast1").css("color", "black");
    if (mp2 > mp)
        $("#" + pid + "_cast2").css("color", "red");
    else
        $("#" + pid + "_cast2").css("color", "black");
    if (mp3 > mp)
        $("#" + pid + "_cast3").css("color", "red");
    else
        $("#" + pid + "_cast3").css("color", "black");
}

function navOptions(cid) {
    var pid = "options";
    var lid = pid + "_data";
    if (!hasPage(pid)) {
        $("body")
        .append(
            $(nPage(pid))
            .append(nHeader("Options", "card_" + cid, "Back"))
            .append(nListview(lid))
        );
        $("#" + lid)
            .append("<label><input type='checkbox' id='" + Mobile.ids.ignore_qs + "'>Ignore QS</label>")
            .append("<label><input type='checkbox' id='" + Mobile.ids.ignore_sap + "'>Ignore Sap</label>")
            .append("<label><input type='checkbox' id='" + Mobile.ids.ignore_nonrecommended + "'>Ignore Non-Recommended Buff/Debuff (Opponent)</label>")
            .append("<label><input type='checkbox' id='" + Mobile.ids.plus_normal + "'>Plus Normal Attack (Self)</label>")
            .append("<label><input type='checkbox' id='" + Mobile.ids.merge_results + "'>Merge Results of OHKO By</label>");
        $("#" + Mobile.ids.ignore_qs).prop("checked", !cur_options.qs);
        $("#" + Mobile.ids.ignore_sap).prop("checked", !cur_options.sap);
        $("#" + Mobile.ids.nonrecommended).prop("checked", !cur_options.nonrecommended);
        $("#" + Mobile.ids.plus_normal).prop("checked", cur_options.plus_normal);
        $("#" + Mobile.ids.merge_results).prop("checked", cur_options.merge_oneshotby);
    }
    $.mobile.changePage("#" + pid);
}

function navCard(cid, bid) {
    var card = Card.get(cid);
    if (card.hasType(Type.acer))
        card.setType(Type.acer);
    else
        card.setType(Type.coolr);
    var pid = "card_" + cid;
    var lid_data = "card_" + cid + "_data";
    var lid_stats = "card_" + cid + "_stats";
    var lid_skills = "card_" + cid + "_skills";
    var lid_calc = "card_" + cid + "_calculator";
    if (!hasPage(pid)) {
        $("body")
        .append(
            $(nPage(pid))
            .append(nHeader(card.name, bid, "Back"))
            .append(nListview(lid_data))
            .append(nSeparator("Max Card Stats (" + card.getType().name + ")"))
            .append(nListview(lid_stats))
            .append(nSeparator("Skills"))
            .append(nListview(lid_skills))
            .append(nSeparator("Calculator"))
            .append(nListview(lid_calc))
        );
        $("#" + lid_data)
            .append("<li><p>" + card.getImage(200) + "</li>")
            .each(function() {
                if (card.id in Card.notes) 
                    $(this).append("<li class='warning'>(" + Card.notes[card.id] + ")</li>");
            })
            .append("<li>Profile: <p class='wrap'>" + card.description + "</p></li>")
            .append("<li>Stars: <span>" + card.getStarsImage() + "</span></li>")
            .append("<li>Border: <span>" + card.border.name + "</span></li>")
            .append("<li>Attribute: <span>" + card.attribute.name + " " + card.attribute.getImage(24) + "<span></li>")
            .append("<li>Place: " + card.getPlaceName() + "</li>")
            .append("<li>Event: " + card.event.name + "</li>")
            .append("<li>Silhouette: <span>" + card.shape.getImage(32) + "</span></li>");
        $("#" + lid_stats)
            .append($("<li>HP: " + card.getMaxStonedHP() + "</li>").css("color", "green"))
            .append($("<li>MP: " + card.getMaxStonedMP() + "</li>").css("color", "green"))
            .append($("<li>ATK: " + card.getMaxStonedATK() + "</li>").css("color", "green"))
            .append($("<li>DEF: " + card.getMaxStonedDEF() + "</li>").css("color", "green"))
            .append($("<li>AGI: " + card.getMaxStonedAGI() + "</li>").css("color", "green"))
            .append($("<li>WIS: " + card.getMaxStonedWIS() + "</li>").css("color", "green"))
            .append("<li><a href='javascript:navCardStats(\"" + card.id + "\");'>Stats by Type</a></li>")
        $("#" + lid_skills)
            .each(function() {
                var skills = card.learns;
                for (var lv in skills)
                    $(this).append("<li>" + lv + ": " + 
                        skills[lv].name + " (" + skills[lv].description + ")" + "</li>");
            });
        $("#" + lid_calc)
            .append("<li><h2>MP Consumption</h2>" +
                    "<p>Single Cast: <span id='" + pid + "_cast1'></span></p>" +
                    "<p>Double Cast: <span id='" + pid + "_cast2'></span></p>" +
                    "<p>Triple Cast: <span id='" + pid + "_cast3'></span></p>" +
                    "</li>")
            .each(function() {
                var gskills = card.getRecommends();
                var sorted_skills = new Array();
                sorted_skills.push.apply(sorted_skills, Skill.getLearnableSkills());
                for (var i = 0; i < Math.min(card.skills.length, card.getLearntSkillSize()); i++) {
                    if (card.skills[i].stone == 0)
                        sorted_skills.push(card.skills[i]);
                }
                sorted_skills.sort(Sorting.compose(Sorting.skill, Sorting.name));

                for (var i = 0; i < 3; i++) {
                    var select = $("<select id='" + pid + "_skill" + i + "'></select>");
                    $(this).append(select);
                    $(select).append($("<option>None</option>").val(-1));
                    for (var j = 0; j < sorted_skills.length; j++) {
                        var skill = sorted_skills[j];
                        $(select).change(function() { updateSkillCost(pid, card.getMaxStonedMP()); });
                        $(select).append(
                          $("<option></option>")
                            .append($("<span></span>").html(skill.name))
                            .append($("<span></span>").html(" (" + skill.description + ")" + (card.canLearnSkill(skill) ? "" : "*")))
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
                            else if (skill.level == next.level + 1 && skill.attribute != Attribute.death && 
                                next.attribute != Attribute.death)
                                $(select).append("<option>====================</option>");
                        }
                    }
                }
            })
            .append("<li><a href='javascript:navOptions(\"" + cid + "\");'>Options</a></li>")
            .append("<li><a href='javascript:navCalculator(\"" + card.id + "\", \"" + MODE_UOHKO + "\");'>Unable to OHKO</a></li>")
            .append("<li><a href='javascript:navCalculator(\"" + card.id + "\", \"" + MODE_OHKOBY + "\");'>OHKO By</a></li>")
            .append("<li><a href='javascript:navCalculator(\"" + card.id + "\", \"" + MODE_UQSKO + "\");'>Unable to QS-KO</a></li>")
            .append("<li><a href='javascript:navCalculator(\"" + card.id + "\", \"" + MODE_QSKO + "\");'>QS-KO</a></li>")
            ;
        updateSkillCost(pid, card.getMaxStonedMP());
    }
    $.mobile.changePage("#" + pid);
}

function insertExCards(id, cards, bid) {
    $.each(cards, function(idx, card) {
        $("#" + id).append(mkCardItem(card, bid))
    });
}

function navExCard(cid, bid) {
    var card = ExCard.get(cid);
    var pid = "ex_card_" + cid;
    var lid_d = "ex_card_" + cid + "_data";
    var lid_s = "ex_card_" + cid + "_skills";
    if (!hasPage(pid)) {
        $("body").append(
            $(nPage(pid))
            .append(nHeader(card.name, bid, "Back"))
            .append(nListview(lid_d))
            .append(nSeparator("Skills"))
            .append(nListview(lid_s))
        );
        $("#" + lid_d)
            .append("<li><p>" + card.getImage(200) + "</p></li>")
            .each(function() {
                if (card.id in ExCard.notes) 
                    $(this).append("<li class='warning'>(" + ExCard.notes[card.id] + ")</li>");
            })
            .append("<li>Profile: <p>" + card.description + "</p></li>")
            .append("<li>Stars: <span>" + card.getStarsImage() + "</span></li>")
            .append("<li>Border: <span>" + card.border.name + "</span></li>")
            .append("<li>Attribute: <span>" + card.attribute.name + " " + card.attribute.getImage(24) + "<span></li>")
            .append("<li>Place: " + card.getPlaceName() + "</li>")
            .append("<li>Event: " + card.event.name + "</li>")
            .append("<li>Silhouette: <span>" + card.shape.getImage(32) + "</span></li>");

        var skills = card.skills;
        for (var i = 0; i < skills.length; i++)
            $("#" + lid_s).append("<li class='wrap'>" + skills[i].name + "</li>");
    }
    $.mobile.changePage("#" + pid);
}

function navByStar(ex, i) {
    var pid = (ex ? "ex_" : "") + "star_" + i;
    if (!hasPage(pid)) {
        var lid = (ex ? "ex_" : "") + "star_" + i + "_cards";
        $("body")
        .append(
            $(nPage(pid))
            .append(nHeader(Card.getStarsImage(i), (ex ? "ex_" : "") + "by_stars", "By Stars"))
            .append(nListview(lid))
        );
        var cards = Selector.select(Selector.stars(i), ex ? ExCard.all : Card.all);
        cards.sort(Sorting.name);
        iCards(ex, lid, cards, pid);
    }
    $.mobile.changePage("#" + pid);
}

function navByStars(ex) {
    var pid = (ex ? "ex_" : "") + "by_stars";
    if (!hasPage(pid)) {
        var lid = (ex ? "ex_" : "") + "stars_list";
        $("body")
        .append(
            $(nPage(pid))
            .append(nHeader("Stars", (ex ? "ex_" : "") + "cards", ex ? "ExCards" : "Cards"))
            .append(nListview(lid))
        )
        for (var i = 1; i <= 5; i++) {
            $("#" + lid).append("<li><a href='javascript:navByStar(" + ex + ", " + i + ");'><span>" + 
                Card.getStarsImage(i) + "</span></a></li>");
        }
    }
    $.mobile.changePage("#" + pid);
}

function navByPlace(ex, id) {
    var pid = (ex ? "ex_" : "") + "place_" + id;
    if (!hasPage(pid)) {
        var place = Place.all[id];
        var lid = (ex ? "ex_" : "") + "place_" + id + "_cards";
        $("body")
        .append(
            $(nPage(pid))
            .append(nHeader(place.name, (ex ? "ex_" : "") + "by_places", "By Places"))
            .append(nListview(lid))
        );
        var cards = Selector.select(Selector.place(place.id), ex ? ExCard.all : Card.all);
        cards.sort(Sorting.name);
        iCards(ex, lid, cards, pid);
    }
    $.mobile.changePage("#" + pid);
}

function navByPlaces(ex) {
    var pid = (ex ? "ex_" : "") + "by_places";
    if (!hasPage(pid)) {
        var lid = (ex ? "ex_" : "") + "places_list";
        $("body").append(
            $(nPage(pid))
            .append(nHeader("Places", (ex ? "ex_" : "") + "cards", ex ? "ExCards" : "Cards"))
            .append(nListview(lid))
        );
        for (var i = 0; i < Place.all.length; i++) {
            $("#" + lid).append("<li><a href='javascript:navByPlace(" + ex + ", " + Place.all[i].id + ");'>" + 
                Place.all[i].name + "</a></li>");
        }
    }
    $.mobile.changePage("#" + pid);
}

function navByAttribute(ex, id) {
    var pid = (ex ? "ex_" : "") + "attribute_" + id;
    if (!hasPage(pid)) {
        var attribute = Attribute.all[id];
        var lid = (ex ? "ex_" : "") + "attribute_" + id + "_cards";
        $("body").append(
            $(nPage(pid))
            .append(nHeader(attribute.name, (ex ? "ex_" : "") + "by_attributes", "By Attributes"))
            .append(nListview(lid))
        );
        var cards = Selector.select(Selector.attribute(attribute.id), ex ? ExCard.all : Card.all);
        cards.sort(Sorting.name);
        iCards(ex, lid, cards, pid);
    }
    $.mobile.changePage("#" + pid);
}

function navByAttributes(ex) {
    var pid = (ex ? "ex_" : "") + "by_attributes";
    if (!hasPage(pid)) {
        var lid = (ex ? "ex_" : "") + "attributes_list";
        $("body").append(
            $(nPage(pid))
            .append(nHeader("Attributes", (ex ? "ex_" : "") + "cards", ex ? "ExCards" : "Cards"))
            .append(nListview(lid))
        );
        for (var i = 0; i < Attribute.all.length; i++) {
            $("#" + lid).append(
                $("<li></li>").append(
                    $("<a href='javascript:navByAttribute(" + ex + ", " + Attribute.all[i].id + ");'></a>")
                        .append($(Attribute.all[i].getImage()).addClass("ui-li-icon").addClass("ui-corner-none"))
                        .append(Attribute.all[i].name)
                )
            );
        }
    }
    $.mobile.changePage("#" + pid);
}

function navByBorder(ex, id) {
    var pid = (ex ? "ex_" : "") + "border_" + id;
    if (!hasPage(pid)) {
        var border = ex ? ExType.all[id] : Border.all[id];
        var lid = (ex ? "ex_" : "") + "border_" + id + "_cards";
        $("body").append(
            $(nPage(pid))
            .append(nHeader(border.name, (ex ? "ex_" : "") + "by_borders", "By Borders"))
            .append(nListview(lid))
        );
        var cards = Selector.select(Selector.border(border.id), ex ? ExCard.all : Card.all);
        cards.sort(Sorting.name);
        iCards(ex, lid, cards, pid);
    }
    $.mobile.changePage("#" + pid);
}

function navByBorders(ex) {
    var pid = (ex ? "ex_" : "") + "by_borders";
    if (!hasPage(pid)) {
        var lid = (ex ? "ex_" : "") + "borders_list";
        $("body").append(
            $(nPage(pid))
            .append(nHeader("Borders", (ex ? "ex_" : "") + "cards", ex ? "ExCards" : "Cards"))
            .append(nListview(lid))
        );
        var src = ex ? ExType.all : Border.all;
        for (var i = 0; i < src.length; i++) {
            $("#" + lid).append("<li><a href='javascript:navByBorder(" + ex + ", " + src[i].id + ");'>" + 
                src[i].name + "</a></li>");
        }
    }
    $.mobile.changePage("#" + pid);
}

function navByShape(ex, id) {
    var pid = (ex ? "ex_" : "") + "shape_" + id;
    if (!hasPage(pid)) {
        var shape = Shape.all[id];
        var lid = (ex ? "ex_" : "") + "shape_" + id + "_cards";
        $("body").append(
            $(nPage(pid))
            .append(nHeader(shape.name, (ex ? "ex_" : "") + "by_shapes", "By Shapes"))
            .append(nListview(lid))
        );
        var cards = Selector.select(Selector.shape(shape.id), ex ? ExCard.all : Card.all);
        cards.sort(Sorting.name);
        iCards(ex, lid, cards, pid);
    }
    $.mobile.changePage("#" + pid);
}

function navByShapes(ex) {
    var pid = (ex ? "ex_" : "") + "by_shapes";
    if (!hasPage(pid)) {
        var lid = (ex ? "ex_" : "") + "shapes_list";
        $("body").append(
            $(nPage(pid))
            .append(nHeader("Shapes", (ex ? "ex_" : "") + "cards", ex ? "ExCards" : "Cards"))
            .append(nListview(lid))
        );
        for (var i = 0; i < Shape.all.length; i++) {
            $("#" + lid).append(
                $("<li></li>").append(
                    $("<a href='javascript:navByShape(" + ex + ", " + Shape.all[i].id + ");'></a>")
                        .append($(Shape.all[i].getImage(24)).addClass("ui-li-icon").addClass("ui-corner-none"))
                        .append(Shape.all[i].name)
                )
            );
        }
    }
    $.mobile.changePage("#" + pid);
}

function navBySkill(ex, id) {
    var pid = (ex ? "ex_" : "") + "skill_" + id;
    if (!hasPage(pid)) {
        var skill = ex ? ExSkill.all[id] : Skill.all[id];
        var lid = (ex ? "ex_" : "") + "skill_" + id + "_cards";
        $("body").append(
            $(nPage(pid))
            .append(nHeader(skill.name, (ex ? "ex_" : "") + "by_skills", "By Skills"))
            .append(nListview(lid))
        );
        var cards = Selector.select(Selector.skill(skill.id), ex ? ExCard.all : Card.all);
        cards.sort(Sorting.name);
        iCards(ex, lid, cards, pid);
    }
    $.mobile.changePage("#" + pid);
}

function navBySkills(ex) {
    var pid = (ex ? "ex_" : "") + "by_skills";
    if (!hasPage(pid)) {
        var lid = (ex ? "ex_" : "") + "skills_list";
        $("body").append(
            $(nPage(pid))
            .append(nHeader("Skills", (ex ? "ex_" : "") + "cards", ex ? "ExCards" : "Cards"))
            .append(nListview(lid))
        );
        var src = ex ? ExSkill.all : Skill.all;
        for (var i = 0; i < src.length; i++) {
            $("#" + lid).append(
                "<li><a href='javascript:navBySkill(" + ex + ", " + src[i].id + ");'>" + 
                src[i].name + (ex ? "" : " (" + Skill.all[i].description + ")") + "</a></li>"
            );
        }
    }
    $.mobile.changePage("#" + pid);
}

function navTops(buff, v) {
    if (typeof buff == 'undefined') {
        var pid = "top";
        if (!hasPage(pid)) {
            var lid = pid + "_data";
            $("body")
            .append(
                $(nPage(pid))
                .append(nHeader("Top", "home", "Home"))
                .append(nListview(lid))
            );
            $("#" + lid)
            .append("<li><a href='javascript:navTops(0);'>Without Buffs</a></li>")
            .append("<li><a href='javascript:navTops(1);'>With Recommended Buffs</a></li>")
            .append("<li><a href='javascript:navTops(2);'>With All Buffs</a></li>")
        }
        $.mobile.changePage("#" + pid);
    } else if (typeof v == 'undefined') {
        var pid = "top_" + buff;
        var header = "Top " + (buff == 0 ? "Without Buffs" : (buff == 1 ? "With Recommended Buffs" : "With All Buffs"));
        if (!hasPage(pid)) {
            var lid = pid + "_data";
            $("body")
            .append(
                $(nPage(pid))
                .append(nHeader(header, "top", "Top"))
                .append(nListview(lid))
            );
            $("#" + lid)
            .each(function() {
                if (buff == "none") {
                    $(this)
                        .append("<li><a href='javascript:navTops(" + buff + ", \"hp\");'>HP</a></li>")
                        .append("<li><a href='javascript:navTops(" + buff + ", \"mp\");'>MP</a></li>");
                }
            })
            .append("<li><a href='javascript:navTops(" + buff + ", \"atk\");'>ATK</a></li>")
            .append("<li><a href='javascript:navTops(" + buff + ", \"def\");'>DEF</a></li>")
            .append("<li><a href='javascript:navTops(" + buff + ", \"agi\");'>AGI</a></li>")
            .append("<li><a href='javascript:navTops(" + buff + ", \"wis\");'>WIS</a></li>")
            .append("<li><a href='javascript:navTops(" + buff + ", \"total\");'>Total</a></li>")
        }
        $.mobile.changePage("#" + pid);
    } else {
        var pid = "top_" + buff + "_" + v;
        if (!hasPage(pid)) {
            $("body")
            .append(
                $(nPage(pid))
                .append(nHeader("Top " + v.toUpperCase(), "top_" + buff, "Back"))
            );
            var cates = Card.getTop(v, 100, {buff: buff});
            for (var i = 0; i < cates.length; i++) {
                var lid = pid + "_" + i;
                var cate = cates[i];
                $("#" + pid).append(nCollapsibleList(lid, cate.name));

                for (var j = 0; j < cate.cards.length; j++) {
                    var stats = cate.cards[j].getMaxStats(buff);
                    var suffix = v == "total" ? stats.total() : stats[v.toLowerCase()];
                    $("#" + lid)
                    .append(mkCardItem(cate.cards[j], pid, 
                        { prefix: (j + 1) + ". ",
                          suffix: " (" + suffix + ")"
                        }));
                }
            }
        }
        $.mobile.changePage("#" + pid);        
    }
}

function navAttributes() {
    var pid = "attributes";
    var lid = "attributes_data";
    if (!hasPage(pid)) {
        $("body").append(
            $(nPage(pid))
                .append(nHeader("Attributes", "home", "Home"))
                .append(nListview(lid))
        );
        for (var i = 0; i < Attribute.all.length; i++) {
            var attr = Attribute.all[i];
            $("#" + lid)
            .append(
                $("<li></li>")
                .append($(attr.getImage()).addClass("ui-li-icon").addClass("ui-corner-none"))
                .append(attr.name)
                .append("<p>Critical To: " + 
                    List.map(function(attr) { return attr.name; }, attr.getCriticalTo()).join(", ") + "</p>"
                )
                .append("<p>Blocked By: " +
                    List.map(function(attr) { return attr.name; }, attr.getBlockedBy()).join(", ") + "</p>"
                )
            );
        }
    }
    $.mobile.changePage("#" + pid);
}

function navSkills() {
    var pid = "skills";
    var lid = "skills_data";
    if (!hasPage(pid)) {
        $("body").append(
            $(nPage(pid))
                .append(nHeader("Skills", "home", "Home"))
                .append(nListview(lid))
        );
        for (var i = 0; i < Skill.all.length; i++) {
            var skill = Skill.all[i];
            $("#" + lid)
                .append("<li>" + skill.name + " (" + skill.description + ")" +
                    "<p>MP Cost: " + (skill == Skill.ls ? "All" : skill.cost.mp) + "</p>" +
                    "<p>HP Cost: " + skill.cost.hp + "</p>" +
                    "</li>");
        }
    }
    $.mobile.changePage("#" + pid);
}

function navNews() {
    var pid = "whatisnew";
    if (!hasPage(pid)) {
        $("body").append(
            $(nPage(pid))
            .append(nHeader("What's New", "home", "Home"))
        );
        $.each(WhatIsNew.getCards(), function(date, data) {
            var cards = data.cards;
            var excards = data.excards;
            var lid = pid + "_" + date.replace(/\//g, "_");
            $("#" + pid)
            .append(nSeparator(date))
            .append(nListview(lid));
            for (var i = 0; i < cards.length; i++) {
                $("#" + lid).append(mkCardItem(cards[i], pid))
            }
            for (var i = 0; i < excards.length; i++) {
                $("#" + lid).append(mkExCardItem(excards[i], pid))
            }
        });
    }
    $.mobile.changePage("#" + pid);
}
