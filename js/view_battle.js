
var COOKIE_DELAY = "battle.delay";
var COOKIE_METER = "battle.meter";
var COOKIE_ME_SD = "battle.me.sd";
var COOKIE_ME_LS = "battle.me.ls";
var COOKIE_ME_REVIVAL = "battle.me.revival";
var COOKIE_ME_DS = "battle.me.ds";
var COOKIE_ME_SAP = "battle.me.sap";
var COOKIE_ME_GS = "battle.me.gs";
var COOKIE_ME_MR = "battle.me.mr";
var COOKIE_ME_MR2 = "battle.me.mr2";
var COOKIE_ME_NP = "battle.me.np";
var COOKIE_OPPO_SD = "battle.oppo.sd";
var COOKIE_OPPO_LS = "battle.oppo.ls";
var COOKIE_OPPO_REVIVAL = "battle.oppo.revival";
var COOKIE_OPPO_DS = "battle.oppo.ds";
var COOKIE_OPPO_SAP = "battle.oppo.sap";
var COOKIE_OPPO_GS = "battle.oppo.gs";
var COOKIE_OPPO_MR = "battle.oppo.mr";
var COOKIE_OPPO_MR2 = "battle.oppo.mr2";
var COOKIE_OPPO_NP = "battle.oppo.np";
var COOKIE_ANIMATION = "battle.animation";
var COOKIE_BATTLE_MESSAGE = "battle.message";
var COOKIE_AGIBUFF = "battle.agibuff";
var COOKIE_QS_RESET = "battle.qs.reset";
var COOKIE_DR_RESET = "battle.dr.reset";

var targets = [
    {id: "#my_team", prefix: "my_", title: "My Party"}, 
    {id: "#oppo_team", prefix: "oppo_", title: "Opponent's Party"}
];

var COOKIE_BATTLE_DEFAULT_PARTY = {};
COOKIE_BATTLE_DEFAULT_PARTY[targets[0].prefix] = "battle.default." + targets[0].prefix + "party";
COOKIE_BATTLE_DEFAULT_PARTY[targets[1].prefix] = "battle.default." + targets[1].prefix + "party";

var messages = new Array();
var options = {
    animation: getCookie(COOKIE_ANIMATION, true),
    battle_message: getCookie(COOKIE_BATTLE_MESSAGE, "true") == "true",
    delay: parseFloat(getCookie(COOKIE_DELAY, 400)),
    me: {
        sd: parseFloat(getCookie(COOKIE_ME_SD, 0.4)),
        ls: parseFloat(getCookie(COOKIE_ME_LS, 0.6)),
        revival: parseFloat(getCookie(COOKIE_ME_REVIVAL, 0.4)),
        ds: parseFloat(getCookie(COOKIE_ME_DS, 0.6)),
        sap: parseFloat(getCookie(COOKIE_ME_SAP, 0.6)),
        gs: parseFloat(getCookie(COOKIE_ME_GS, 0.6)),
        mr: parseFloat(getCookie(COOKIE_ME_MR, 0.6)),
        mr2: parseFloat(getCookie(COOKIE_ME_MR2, 0.6)),
        np: parseFloat(getCookie(COOKIE_ME_NP, 0.6))
    },
    oppo: {
        sd: parseFloat(getCookie(COOKIE_OPPO_SD, 0.8)),
        ls: parseFloat(getCookie(COOKIE_OPPO_LS, 0.8)),
        revival: parseFloat(getCookie(COOKIE_OPPO_REVIVAL, 0.8)),
        ds: parseFloat(getCookie(COOKIE_OPPO_DS, 0.8)),
        sap: parseFloat(getCookie(COOKIE_OPPO_SAP, 0.8)),
        gs: parseFloat(getCookie(COOKIE_OPPO_GS, 0.8)),
        mr: parseFloat(getCookie(COOKIE_OPPO_MR, 0.8)),
        mr2: parseFloat(getCookie(COOKIE_OPPO_MR2, 0.8)),
        np: parseFloat(getCookie(COOKIE_OPPO_NP, 0.8))
    },
    meter: parseFloat(getCookie(COOKIE_METER, 10000)),
    agibuff: parseInt(getCookie(COOKIE_AGIBUFF, 0)),
    qs_reset: parseInt(getCookie(COOKIE_QS_RESET, RESET_ZERO)),
    dr_reset: parseInt(getCookie(COOKIE_DR_RESET, RESET_ZERO))
};

function clearMessage() {
    $("#message").val("");
}

function outputMessage(m) {
    $("#message")
        .val($("#message").val() + m + "\n")
        .scrollTop($("#message")[0].scrollHeight);
}

/**
 * Inserts a message for an action.
 * g1: the action performer
 * g2: the target of the action
 * m: the message
 * opts: options
 */
function msg(g1, g2, m, opts) {
    if (!options.battle_message)
        return;

    /* Swap g1 and g2 sucht that g1 is always in my party and g2 in the opponent's party. */
    if (opts.rev) {
        var tmp = g1;
        g1 = g2;
        g2 = tmp;
    }

    /* Check if this is the first appearance of the cards in the battle. */
    var first1 = typeof g1.battle.first == 'undefined' || g1.battle.first == true;
    var first2 = typeof g2.battle.first == 'undefined' || g2.battle.first == true;
    if (first1)
        g1.battle.first = false;
    if (first2)
        g2.battle.first = false;

    /* Clone the cards such that the status at this time can be saved. */
    g1 = clone(g1);
    g1.battle = clone(g1.battle);
    g1.battle.first = first1;
    g1.battle.status = clone(g1.battle.status);
    g2 = clone(g2);
    g2.battle = clone(g2.battle);
    g2.battle.first = first2;
    g2.battle.status = clone(g2.battle.status);
    
    /* Insert the message. */
    messages.push({g1: g1, g2: g2, m: m, t: opts.type, a: opts.rev ? g2 : g1, d: opts.rev ? g1 : g2});
}

var helper = {
    gIndex: function(e) {
        return $(e).parent().data("index");
    },
    gPrefix: function(e) {
        return $(e).parent().data("prefix");
    },
    gType: function(e) {
        return Type.get($(e).parent().find(".battle-line-type").val());
    },
    gCard: function(e) {
        var gid = $(e).parent().find(".battle-line-guardian").val();
        var g = Card.get(gid);
        if (g != null) {
            var type = Type.get($(e).parent().find(".battle-line-type").val());
            var level = parseInt($(e).parent().find(".battle-line-level").val());
            g.setType(type);
            g.setLevel(level);
        }
        return g;
    },
    gExCard: function(e) {
        var gid = $(e).parent().find(".battle-line-ex-card").val();
        var g = ExCard.get(gid);
        return g;
    },
    gStatus: function(e) {
        var g = this.gCard(e);
        var status = g.getStats();
        var stoned = $(e).parent().find(".battle-line-stoned");
        if ($(stoned).val() == "custom") {
            status.hp = $(stoned).data("hp") > 0 ? $(stoned).data("hp") : status.hp;
            status.mp = $(stoned).data("mp") > 0 ? $(stoned).data("mp") : status.mp;
            status.atk = $(stoned).data("atk") > 0 ? $(stoned).data("atk") : status.atk;
            status.def = $(stoned).data("def") > 0 ? $(stoned).data("def") : status.def;
            status.agi = $(stoned).data("agi") > 0 ? $(stoned).data("agi") : status.agi;
            status.wis = $(stoned).data("wis") > 0 ? $(stoned).data("wis") : status.wis;
        } else if ($(stoned).val() == "fsemp" || $(stoned).val() == "fs") {
            status.hp += g.getStoneHP();
            status.atk += g.getStoneATK();
            status.def += g.getStoneDEF();
            status.agi += g.getStoneAGI();
            status.wis += g.getStoneWIS();
            if ($(stoned).val() == "fs")
                status.mp += g.getStoneMP();
        }
        return status;
    },
    uStatus: function(e) {
        var s = this.gStatus(e);
        $(e).parent()
            .find(".battle-line-status")
            .html(s.hp + " / " + s.mp + " / " + s.atk + " / " + s.def + " / " + s.agi + " / " + s.wis);
    },
    uType: function(e, g) {
        g.setType(getBestBattleType(g));
        $(e).parent()
            .find(".battle-line-type")
            .val(g.getType().id);
    },
    uLevel: function(e, g) {
        $(e).parent()
            .find(".battle-line-level")
            .val(g.getMaxLevel());
    }
};

function insertExStars(prefix, index) {
    var id = "#" + prefix + "ex" + index + "stars";
    $(id)
        .html("")
        .off()
        .change(function() {
            var stars = parseInt($(this).find("option:selected").val());
            var index = helper.gIndex($(this));
            if (stars == 0) {
                $("#" + prefix + "ex" + index + "card").html("");
                $("#" + prefix + "ex" + index + "skill").html("");
                setAvatar(prefix, "ex" + index, null);
            } else
                insertExCards(prefix, index, stars);
        });
    for (var i = 0; i < STAR_SIZE + 1; i++) {
        $(id).append(
            $("<option value='" + i + "'>" + (i == 0 ? "None" : i) + "</option>")
                .attr("selected", i == 0)
        );
    }
}

function insertExCards(prefix, index, stars) {
    $("#" + prefix + "ex" + index + "skill").html("");

    var id = "#" + prefix + "ex" + index + "card";
    var gs = Selector.select(
        Selector.and(Selector.stars(stars), Selector.border(index == 1 ? ExType.red.id : ExType.blue.id)),
        ExCard.all
    );
    gs.sort(Sorting.name);
    $(id)
        .html("")
        .off();
    for (var i = 0; i < gs.length; i++) {
        var g = gs[i];
        var en = goptions.isTranslationNeeded() && g.id in ename.guardians ? " (" + ename.guardians[g.id] + ")" : "";
        $(id).append(
            $("<option value='" + g.id + "'>" + g.name + en + "</option>")
            .attr("selected", i == 0)
        );
    }
    $(id).change(function() {
        var index = helper.gIndex($(this));
        var g = helper.gExCard($(this));
        if (g != null) {
            insertExSkills(prefix, index, g);
            setAvatar(prefix, "ex" + index, g);
        } else
            setAvatar(prefix, "ex" + index, null);
    });
    
    $(id).change();
}

function insertExSkills(prefix, index, g) {
    var id = "#" + prefix + "ex" + index + "skill";
    $(id).html("");

    if (g == null)
        return;

    var skills = g.skills;
    for (var i = 0; i < skills.length; i++) {
        var skill = skills[i];
        $(id).append(
            $("<option></option>")
                .append($("<span></span>").addClass("skill-name").html(skill.name))
                .val(skill.id)
        ).val(g.cskill.id);
    }
}

function setAvatar(prefix, index, g) {
    if (g == null)
        $("#" + prefix + "avatar" + index).html("&nbsp;");
    else
        $("#" + prefix + "avatar" + index).html("<img width='50px' src='" + sitebase + "images/" + locale.getLanguage() + "/avatars/card_thu" + g.id + image_ext + "' />");
}

function insertStars(prefix, index) {
    var id = "#" + prefix + "stars" + index;
    $(id)
        .html("")
        .off()
        .change(function() {
            var stars = parseInt($(this).find("option:selected").val());
            var index = helper.gIndex($(this));
            if (stars == 0) {
                $("#" + prefix + "border" + index).html("");
                $("#" + prefix + "guardian" + index).html("");
                $("#" + prefix + "type" + index).html("");
                $("#" + prefix + "level" + index).html("");
                $("#" + prefix + "stoned" + index).html("");
                $("#" + prefix + "status" + index).html("");
                for (var i = 0; i < SKILL_SIZE; i++) {
                    $("#" + prefix + "skill" + index + "_" + i).html("");
                }
                setAvatar(prefix, index, null);
            } else
                insertBorder(prefix, index, stars);
        });
    for (var i = 0; i < STAR_SIZE + 1; i++) {
        $(id).append(
            $("<option value='" + i + "'>" + (i == 0 ? "None" : i) + "</option>")
                .attr("selected", i == 0)
        );
    }
}

function insertBorder(prefix, index, stars) {
    var id = "#" + prefix + "border" + index;
    $(id)
        .html("")
        .off()
        .change(function() {
            var border = parseInt($(this).find("option:selected").val());
            insertCards(prefix, index, stars, border);
        });
    for (var i = 0; i < (stars == 5 ? Border.all.length : 1); i++) {
        var b = Border.all[i];

        $(id).append(
            $("<option value='" + b.id + "'>" + b.name + "</option>")
                .attr("selected", false)
        );
    }

    $(id).val(Border.none.id);
    $(id).change();
}

function insertCards(prefix, index, stars, border) {
    for (var i = 0; i < SKILL_SIZE; i++)
        $("#" + prefix + "skill" + index + "_" + i).html("");

    var id = "#" + prefix + "guardian" + index;
    var gs = Selector.select(Selector.and(Selector.stars(stars), Selector.border(border)), Card.all);
    gs.sort(Sorting.compose(Sorting.border, Sorting.name));
    $(id)
        .html("")
        .off();
    for (var i = 0; i < gs.length; i++) {
        var g = gs[i];
        var en = goptions.isTranslationNeeded() && g.id in ename.guardians ? " (" + ename.guardians[g.id] + ")" : "";
        $(id).append(
            $("<option value='" + g.id + "'>" + g.name + en + "</option>")
            .attr("selected", i == 0)
        );
    }
    $(id).change(function() {
        var index = helper.gIndex($(this));
        var g = helper.gCard($(this));
        if (g != null) {
            insertSkills(prefix, index, g);
            helper.uStatus($(this));
            helper.uType($(this), g);
            helper.uLevel($(this), g);
            setAvatar(prefix, index, g);
        } else
            setAvatar(prefix, index, null);
    });
    
    if (gs.length > 0) {
        insertTypes(prefix, index, gs[0]);
        insertLevels(prefix, index, gs[0]);
        insertStoned(prefix, index);
    }
    
    $(id).change();
}

function getBestBattleType(g) {
    var ts = new Array(Type.acer, Type.coolr, Type.ace, Type.cool);
    for (var i = 0; i < ts.length; i++) {
        if (g.hasType(ts[i]))
            return ts[i];
    }
    return null;
}

function insertTypes(prefix, index, g) {
    var id = "#" + prefix + "type" + index;
    $(id)
        .html("")
        .off()
        .change(function() {
            helper.uStatus($(this));
        });
    for (var i = 0; i < Type.all.length; i++) {
        var t = Type.all[i];

        var suffix = t.isRebirthType() ? " (Rebirth)" : "";
        $(id).append(
            $("<option value='" + t.id + "'>" + t.name + suffix + "</option>")
                .attr("selected", false)
        );
    }

    g.setType(getBestBattleType(g));
    $(id).val(g.getType().id);
}

function insertLevels(prefix, index, g) {
    var id = "#" + prefix + "level" + index;
    $(id)
        .html("")
        .off()
        .change(function() {
            helper.uStatus($(this));
        });
    var type = helper.gType($(id));

    g.setType(type);
    for (var i = 0; i < MAX_LEVEL; i++) {
        $(id).append(
            $("<option value='" + (i + 1) + "'>" + (i + 1) + "</option>")
                .attr("selected", false)
        );
    }
    
    $(id).val(g.getMaxLevel());
}

function insertStoned(prefix, index) {
    $("#" + prefix + "stoned" + index)
        .html("")
        .off()
        .append("<option value='clean'>Clean</option>")
        .append("<option value='fsemp'>FSeMP</option>")
        .append("<option value='fs' selected>FS</option>")
        .append("<option value='custom'>Custom</option>")
        .click(function() {
            if ($(this).val() != "custom") {
                helper.uStatus($(this));
                return;
            }

            var me = $(this);
            var index = helper.gIndex($(this));
            var g = helper.gCard($(this));
            var status = helper.gStatus($(this));

            $("#ability-dialog")
                .hide()
                .html("<p>Please enter the abilities (with stones) of " + g.name + ".</p>")
                .append("<table class='ability-table'>" +
                    "<tr><th>HP</th><td><input type='text' id='ability-hp' value='" + status.hp + "' /></td></tr>" +
                    "<tr><th>MP</th><td><input type='text' id='ability-mp' value='" + status.mp + "' /></td></tr>" +
                    "<tr><th>ATK</th><td><input type='text' id='ability-atk' value='" + status.atk + "' /></td></tr>" +
                    "<tr><th>DEF</th><td><input type='text' id='ability-def' value='" + status.def + "' /></td></tr>" +
                    "<tr><th>AGI</th><td><input type='text' id='ability-agi' value='" + status.agi + "' /></td></tr>" +
                    "<tr><th>WIS</th><td><input type='text' id='ability-wis' value='" + status.wis + "' /></td></tr>" +
                    "</table>"
                )
                .dialog({
                    modal: true, 
                    title: "Card Abilities",
                    buttons: [
                        {text: "Close", click: function() {$(this).dialog("close");}}
                    ],
                    autoOpen: false,
                    position: {my: "center", at: "top", of: window},
                    width: 600,
                    close: function(event, ui) {
                        $("#" + prefix + "stoned" + index)
                            .data("hp", parseInt($("#ability-hp").val()))
                            .data("mp", parseInt($("#ability-mp").val()))
                            .data("atk", parseInt($("#ability-atk").val()))
                            .data("def", parseInt($("#ability-def").val()))
                            .data("agi", parseInt($("#ability-agi").val()))
                            .data("wis", parseInt($("#ability-wis").val()));
                        $(this).dialog("destroy");
                        helper.uStatus(me);
                    }
                })
                .dialog("open");
        })
        .change(function() {
            helper.uStatus($(this));
        })
        .mouseover(function() {
            var g = helper.gCard($(this));
            var status = helper.gStatus($(this));
            $(this).attr("title", 
                "HP = " + status.hp + ", MP = " + status.mp + 
                ", ATK = " + status.atk + ", DEF = " + status.def + 
                ", AGI = " + status.agi + ", WIS = " + status.wis);
        });
}

function insertSkills(prefix, index, g) {
    var type = Type.get($("#" + prefix + "type" + index).val());
    
    var gskills = type.isRebirthType() ? g.recommendsrb : g.recommends;
    var sorted_skills = new Array();
    sorted_skills.push.apply(sorted_skills, Skill.getLearnableSkills());
    for (var i = 0; i < g.skills.length; i++) {
        if (g.skills[i].stone == 0)
            sorted_skills.push(g.skills[i]);
    }
    sorted_skills.sort(Sorting.compose(Sorting.skill, Sorting.name));

    for (var i = 0; i < SKILL_SIZE; i++) {
        var id = "#" + prefix + "skill" + index + "_" + i;
        $(id)
            .html("")
            .append("<option id='-1'>None</option>");
        for (var j = 0; j < sorted_skills.length; j++) {
            var skill = sorted_skills[j];
            $(id).append(
                $("<option></option>")
                    .append($("<span></span>").addClass("skill-name").html(skill.name))
                    .append($("<span></span>").addClass("skill-description").html(" (" + skill.description + ")"))
                    .each(function () {
                        if (i < gskills.length && skill.id == gskills[i].id)
                            $(this).attr("selected", true);
                    })
                    .val(skill.id)
            );
            if (j + 1 < sorted_skills.length) {
                var next = sorted_skills[j + 1];
                if (skill.stone == 0 && next.stone == 1)
                    $(id).append("<option>=============================</option>");
                else if (skill.level == next.level + 1 && skill.attribute != Attribute.death && next.attribute != Attribute.death)
                    $(id).append("<option>=============================</option>");
            }
        }
    }
}

function setStars(prefix, index, stars) {
    var id = "#" + prefix + "stars" + index;
    $(id).val(stars);
    $(id).change();
}

function setBorder(prefix, index, border) {
    var id = "#" + prefix + "border" + index;
    $(id).val(border);
    $(id).change();
}

function setExStars(prefix, index, stars) {
    var id = "#" + prefix + "ex" + index + "stars";
    $(id).val(stars);
    $(id).change();
}

function setCard(prefix, index, gid) {
    var id = "#" + prefix + "guardian" + index;
    $(id).val(gid);
    $(id).change();
}

function setExCard(prefix, index, gid) {
    var id = "#" + prefix + "ex" + index + "card";
    $(id).val(gid);
    $(id).change();
}

function setType(prefix, index, tid) {
    var id = "#" + prefix + "type" + index;
    $(id).val(tid);
    $(id).change();
}

function setLevel(prefix, index, level) {
    var id = "#" + prefix + "level" + index;
    $(id).val(level);
    $(id).change();
}

function setStoned(prefix, index, stoned) {
    var id = "#" + prefix + "stoned" + index;
    $(id).val(stoned.toLowerCase());
    $(id).change();
}

function setSkills(prefix, index, sks) {
    for (var i = 0; i < SKILL_SIZE; i++) {
        var id = "#" + prefix + "skill" + index + "_" + i;
        if (i < sks.length)
            $(id).val(sks[i]);
        else
            $(id).val(SKILL_NONE);
    }
}

function setExSkill(prefix, index, skill) {
    var id = "#" + prefix + "ex" + index + "skill";
    if (skill != null)
        $(id).val(skill.id);
    else
        $(id).val(SKILL_NONE);
}

function getSkills(prefix, index) {
    var res = new Array();
    for (var i = 0; i < 3; i++) {
        var id = "#" + prefix + "skill" + index + "_" + i;
        var sid = $(id).find("option:selected").val();
        var skill = Skill.get(sid);
        if (skill != null)
            res.push(skill);
    }
    return res;
}

function getExSkill(prefix, index) {
    var id = "#" + prefix + "ex" + index + "skill";
    var sid = $(id).find("option:selected").val();
    var skill = ExSkill.get(sid);
    return skill;
}

function setCustomStatus(prefix, index, status) {
    $("#" + prefix + "stoned" + index)
        .data("hp", status.hp)
        .data("mp", status.mp)
        .data("atk", status.atk)
        .data("def", status.def)
        .data("agi", status.agi)
        .data("wis", status.wis)
        .change();
}

function setImage(target, prefix, g) {
    if (g == null)
        return;

    var alive = function(e) {
        $(e)
            .css("filter", "")
            .css("-webkit-filter", "")
            .css("-moz-filter", "")
            .css("-o-filter", "")
            .css("-ms-filter", "");
    };

    if (g.battle.first) {
        $("#" + prefix + "-image")
            .html("")
            .append(g.getImage(200));
    }

    if (g.battle.status.hp <= 0 && !g.battle.ls) {
        $("#" + prefix + "-image img").addClass("defeated");
        $(target.id + "_avatars img:nth-of-type(" + (g.battle.position + 1) + ")")
            .addClass("defeated");
    }

    var id = prefix + "-hp";
    $("#" + id)
        .html("")
        .append(
            $("<progress id='" + id + "bar'></progress>")
                .attr("max", g.status.hp)
                .attr("value", g.battle.status.hp)
                .addClass("hp")
        );
    
    id = prefix + "-mp";
    $("#" + id)
        .html("")
        .append(
            $("<progress id='" + id + "bar'></progress>")
                .attr("max", g.status.mp)
                .attr("value", g.battle.status.mp)
                .addClass("mp")
        );
}

function swap(prefix, i1, i2) {
    var lines = new Array(
        {index: i1, element: $("#" + prefix + "line" + i1)}, 
        {index: i2, element: $("#" + prefix + "line" + i2)}
    );
    $(lines[0].element).insertBefore($(lines[1].element).next());

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].element;
        i1 = lines[i].index;
        i2 = lines[(i + 1) % 2].index;
        $(line)
            .attr("id", prefix + "line" + i2)
            .data("index", i2)
            .find("span.battle-line-header").html(i2 + 1);
        $(line).find("#" + prefix + "stars" + i1).attr("id", prefix + "stars" + i2);
        $(line).find("#" + prefix + "border" + i1).attr("id", prefix + "border" + i2);
        $(line).find("#" + prefix + "guardian" + i1).attr("id", prefix + "guardian" + i2);
        $(line).find("#" + prefix + "type" + i1).attr("id", prefix + "type" + i2);
        $(line).find("#" + prefix + "level" + i1).attr("id", prefix + "level" + i2);
        $(line).find("#" + prefix + "stoned" + i1).attr("id", prefix + "stoned" + i2);
        for (var j = 0; j < SKILL_SIZE; j++)
            $(line).find("#" + prefix + "skill" + i1 + "_" + j).attr("id", prefix + "skill" + i2 + "_" + j);
        $(line).find("#" + prefix + "status" + i1).attr("id", prefix + "status" + i2);
    }
}

function moveUp(prefix, idx) {
    if (idx == 0)
        return;
    swap(prefix, idx - 1, idx);
}

function moveDown(prefix, idx) {
    if (idx == TEAM_SIZE - 1)
        return;
    swap(prefix, idx, idx + 1);
}

function getParty(target) {
    return {
        cards: getCards(target),
        ex1: getExCard(target.prefix, 1),
        ex2: getExCard(target.prefix, 2)
    };
}

function getCards(target) {
    var id = target.id;
    var prefix = target.prefix;
    var gs = new Array();
    for (var i = 0; i < TEAM_SIZE; i++) {
        var gid = $("#" + prefix + "guardian" + i).val();
        var g = Card.get(gid);
        if (g == null)
            continue;

        g = clone(g);
        var tid = parseInt($("#" + prefix + "type" + i).val());
        var type = Type.get(tid);
        if (type == null)
            continue;
        g.setType(type);
        
        var level = parseInt($("#" + prefix + "level" + i).val());
        g.setLevel(level);
        
        var stoned = $("#" + prefix + "stoned" + i).val();
        var status = g.getStats();
        if (stoned == "custom") {
            status.hp = $("#" + prefix + "stoned" + i).data("hp");
            status.mp = $("#" + prefix + "stoned" + i).data("mp");
            status.atk = $("#" + prefix + "stoned" + i).data("atk");
            status.def = $("#" + prefix + "stoned" + i).data("def");
            status.agi = $("#" + prefix + "stoned" + i).data("agi");
            status.wis = $("#" + prefix + "stoned" + i).data("wis");
        } else if (stoned == "fsemp" || stoned == "fs") {
            status.hp += g.getStoneHP();
            status.atk += g.getStoneATK();
            status.def += g.getStoneDEF();
            status.agi += g.getStoneAGI();
            status.wis += g.getStoneWIS();
            if (stoned == "fs")
                status.mp += g.getStoneMP();
        }

        g.status = status;
        g.status.type = stoned;

        var gskills = getSkills(prefix, i);
        gskills.sort(function(x, y) {
            if (x.cost.mp < y.cost.mp)
                return -1;
            else if (x.cost.mp > y.cost.mp)
                return 1;
            else
                return Sorting.name(x, y);
        });
        g.setSkills(gskills);

        gs.push(g);
    }
    return gs;
}

function getExCard(prefix, index) {
    var gid = $("#" + prefix + "ex" + index + "card").val();
    var g = ExCard.get(gid);
    if (g == null)
        return g;

    g = clone(g);
    var skill= getExSkill(prefix, index);
    g.setSkill(skill);

    return g;
}

function toString(target) {
    var party = target;
    if ('id' in target && 'prefix' in target)
        party = getParty(target);
    var res = new Array();
    for (var i = 0; i < party.cards.length; i++)
        res.push(Card.encode(party.cards[i]));
    if (party.ex1 != null)
        res.push("ex1:" + ExCard.encode(party.ex1));
    if (party.ex2 != null)
        res.push("ex2:" + ExCard.encode(party.ex2));
    return res.join(" +\n");
}

function fromLine(prefix, i, line) {
    var ex1 = line.indexOf("ex1:") == 0;
    var ex2 = line.indexOf("ex2:") == 0;
    if (ex1 || ex2) {
        var str = line.substring(4);
        var c = ExCard.decode(str);
        if (c != null) {
            insertExStars(prefix, ex1 ? 1 : 2);
            setExStars(prefix, ex1 ? 1 : 2, c.stars);
            setExCard(prefix, ex1 ? 1 : 2, c.id);
            setExSkill(prefix, ex1 ? 1 : 2, c.getSkill());
        }
    } else {
        var c = Card.decode(line);
        if (c != null) {
            /* 
             * During the update, the card information may be changed.
             * Make a clone to use the decoded card.
             */
            c = clone(c, true);
            insertStars(prefix, i);
            setStars(prefix, i, c.stars);
            setBorder(prefix, i, c.border.id);
            setCard(prefix, i, c.id);
            setType(prefix, i, c.type.id);
            setLevel(prefix, i, c.level);
            setStoned(prefix, i, c.status.type);
            setSkills(prefix, i, List.map(function(skill) { return skill.id; }, c.getSkills()));
            if (c.status.type == "custom") {
                setCustomStatus(prefix, i, {
                    hp: c.status.hp, 
                    mp: c.status.mp, 
                    atk: c.status.atk, 
                    def: c.status.def, 
                    agi: c.status.agi, 
                    wis: c.status.wis
                });
            }
        }
    }
}

function fromString(target, callback) {
    if (typeof callback == 'undefined')
        callback = function() {};

    var prefix = target.prefix;
    var input = $("#" + prefix + "guardians").val().replace(/[\r\n\t ]+/g, "");
    var lines = input.split("+");
    var f = function(i, callback) {
        if (i >= lines.length)
            callback();
        else {
            setTimeout(function() {
                fromLine(prefix, i, lines[i]);
                f(i + 1, callback);
            }, 10);
        }
    }

    f(0, callback);
    $("#" + prefix + "guardians").val("");
}

function insertAvatars(target, gs, dir, callback) {
    $(target.id + "_avatars")
        .html("")
        .hide();
    for (var i = 0; i < gs.length; i++) {
        $(target.id + "_avatars")
            .append($(gs[i].getBattleImage()).addClass("avatar"));
    }
    $(target.id + "_avatars").toggle("slide", {direction: dir, distance: SLIDE_DISTANCE}, ANIMATION_DURATION, callback);
}

function shuffle(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x) {};
    return o;
};

function freeze() {
    $("button").button("disable");
}

function thaw() {
    $("button").button("enable");    
}

function later(f) {
    freeze();
    setTimeout(function() {
        f();
        thaw();
    }, 10);
}

function laterback(f, b) {
    freeze();
    setTimeout(function() {
        f(function() {
            if (typeof b != 'undefined')
                b();
            thaw();
        });
    }, 10);    
}

function suggest_iter(d, callback) {
    if (d.i == d.iters || d.best_wins == d.rounds) {
        callback(d);
    } else {
        clearMessage();
        outputMessage("Simulating lineup #" + (d.i + 1) + "...");

        var sim = new Simulator(d.my, d.oppo, d.options)
        var wins = 0;
        for (var r = 0; r < d.rounds; r++) {
            var res = sim.battle();
            if (res.win)
                wins += 1;
        }

        if (wins > d.best_wins) {
            d.best_lineup = clone(d.my);
            d.best_lineup.cards = d.best_lineup.cards.slice();
            d.best_wins = wins;
        }

        d.my.cards = shuffle(d.my.cards);
        d.i += 1;

        setTimeout(function() { suggest_iter(d, callback); }, 10);
    }
}

function suggest(iters, rounds) {
    loadOptions();
    options.battle_message = false;

    $("#battle-top button").button("disable");
    clearMessage();

    var my = getParty(targets[0]);
    var oppo = getParty(targets[1]);

    var finalize = function() {
        $("#message").scrollTop(0);
        $("#battle-top button").button("enable");
    }

    if (my.cards.length == 0 || my.cards.length == 1) {
        outputMessage("Are you kidding me? You have only " + my.cards.length + " card.");
        finalize();
        return;
    }

    if (oppo.cards.length == 0) {
        outputMessage("Hey! Your opponent does not have any card!");
        finalize();
        return;
    }

    var d = {
        my: my,
        oppo: oppo,
        i: 0,
        iters: iters,
        rounds: rounds,
        best_wins: 0,
        best_lineup: my,
        options: options
    };

    suggest_iter(d, function(d) {
        var rate = Math.floor(1000 * (d.best_wins / d.rounds)) / 1000;

        outputMessage("Finished simulation.");
        outputMessage("Suggested lineup: ");
        for (var i = 0; i < d.best_lineup.cards.length; i++) {
            outputMessage("  #" + (i + 1) + ": " + d.best_lineup.cards[i].name);
        }
        outputMessage("");
        outputMessage("Performance: ");
        outputMessage("  # of battles: " + d.rounds);
        outputMessage("  # of wins: " + d.best_wins);
        outputMessage("  # of losses: " + (d.rounds - d.best_wins));
        outputMessage("  Win rate: " + rate);

        outputMessage("");
        outputMessage("You may load this lineup with:");
        outputMessage(toString(d.best_lineup));

        finalize();
    });
}

function simulate(rounds) {
    loadOptions();

    $("#battle-top button").button("disable");
    clearMessage();

    setTimeout(function() {
        var my = getParty(targets[0]);
        var oppo = getParty(targets[1]);

        if (my.cards.length == 0 || oppo.cards.length == 0) {
            outputMessage("Both your party and the opponent's party should have at least one card.");
            $("#battle-top button").button("enable");
            return;
        }

        if (rounds == 1) {
            options.battle_message = true;
            $(targets[0].id).toggle("slide", {direction: "left", distance: SLIDE_DISTANCE}, ANIMATION_DURATION, function() {
                insertAvatars(targets[0], my.cards, "left");
            });
            $(targets[1].id).toggle("slide", {direction: "right", distance: SLIDE_DISTANCE}, ANIMATION_DURATION, function() {
                insertAvatars(targets[1], oppo.cards, "right", function() {
                    var sim = new Simulator(my, oppo, options);
                    var res = sim.battle();
                    output(res.messages);
                });
            });
        } else {
            options.battle_message = false;
            var wins = 0;
            var sim = new Simulator(my, oppo, options);
            for (var i = 0; i < rounds; i++) {
                var res = sim.battle();
                if (res.win)
                    wins++;
            }
            var rate = Math.floor(1000 * (wins / rounds)) / 1000;
            outputMessage("Simulated " + rounds + " battles");
            outputMessage("# of wins: " + wins);
            outputMessage("# of losses: " + (rounds - wins));
            outputMessage("Win rate: " + rate);  

            $("#battle-top button").button("enable");
        }
    }, 100);
}

/** Determines if two cards are the same by their parties and positions in the parties. */
function same(g1, g2) {
    if (g1 == null)
        return g2 == null;
    else if (g2 == null)
        return false;
    else
        return g1.battle.party == g2.battle.party && g1.battle.position == g2.battle.position;
}

function output(messages) {
    if (messages.length == 0)
        return finalize();

    var d = messages.shift();

    setImage(targets[0], "battle-my", d.me);
    setImage(targets[1], "battle-oppo", d.oppo);

    var effects = new Array();
    var attacker = same(d.a, d.me) ? "battle-my" : "battle-oppo";
    var defender = same(d.d, d.me) ? "battle-my" : "battle-oppo";

    if (options.animation) {
        if (d.t == MSG_ATTACK) {
            effects.push({target: defender, effect: "shake", method: "effect"});
        } else if (d.t == MSG_SD) {
            effects.push({target: attacker, effect: "explode", method: "toggle"});
        } else if (d.t == MSG_QS) {
            effects.push({target: attacker, effect: "slide", method: "effect"});
            effects.push({target: defender, effect: "shake", method: "effect"});
        }
    }

    outputMessage(d.m);

    var f = function() {
        if (effects.length == 0) {
            setTimeout(function() { output(messages); }, options.delay);
        } else {
            var e = effects.shift();
            if (e.method == "toggle")
                $("#" + e.target + "-image img").toggle(e.effect, f);
            else
                $("#" + e.target + "-image img").effect(e.effect, f);
        }
    };
    f();
}

function finalize() {
    for (var i = 0; i < targets.length; i++) {
        $(targets[i].id + "_avatars")
            .toggle("slide", {direction: i == 0 ? "left" : "right", distance: SLIDE_DISTANCE}, ANIMATION_DURATION, (function(i) {
                return function() {
                    $(targets[i].id).toggle("slide", {direction: i == 0 ? "left" : "right", distance: SLIDE_DISTANCE}, ANIMATION_DURATION);
                };
            })(i));
    }
    
    $("#battle-top button").button("enable");
}

function loadOptions() {
    $("#option-dialog input:text").each(function() {
        var strs = $(this).attr('id').split("-");
        if (strs.length == 2) 
            options[strs[1]] = parseFloat($(this).val());
        else {
            var side = strs[1];
            var oname = strs[2];
            options[side][oname] = parseFloat($(this).val());
        }
    });
    options.animation = $("#option-dialog input[name=animation]:checked").val() == "true";
    options.agibuff = parseInt($("#options-agibuff").val());
    options.qs_reset = parseInt($("#options-qs-reset").val());
    options.dr_reset = parseInt($("#options-dr-reset").val());
    options.transposition_reset = parseInt($("#options-transposition-reset").val());
}

function reset() {
    for (var i = 0; i < targets.length; i++) {
        var prefix = targets[i].prefix;
        for (var j = 0; j < TEAM_SIZE; j++) {
            $("#" + prefix + "stars" + j)
                .val(0)
                .change();
        }
    }
}

function showBattleAcknowledgements() {
    $("#acknowledgements-dialog").dialog("open");
}

function battle_init() {
    Nav.appendLanguageSuffix();
    Nav.updateComparisonNumber();
    Nav.disable("nav_battle_simulator2");

    $("#option-dialog")
        .dialog({
            modal: true, 
            title: "Options",
            buttons: [
                {text: "Close", click: function() { $(this).dialog("close"); }}
            ],
            autoOpen: false,
            position: {my: "center", at: "top", of: window},
            width: 600,
            close: function(event, ui) {
                loadOptions();
                setCookie(COOKIE_DELAY, options.delay, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_METER, options.meter, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_ME_SD, options.me.sd, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_ME_LS, options.me.ls, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_ME_REVIVAL, options.me.revival, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_ME_DS, options.me.ds, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_ME_SAP, options.me.sap, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_ME_GS, options.me.gs, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_ME_MR, options.me.mr, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_ME_MR2, options.me.mr2, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_ME_NP, options.me.np, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_OPPO_SD, options.oppo.sd, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_OPPO_LS, options.oppo.ls, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_OPPO_REVIVAL, options.oppo.revival, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_OPPO_DS, options.oppo.ds, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_OPPO_SAP, options.oppo.sap, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_OPPO_GS, options.oppo.gs, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_OPPO_MR, options.oppo.mr, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_OPPO_MR2, options.oppo.mr2, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_OPPO_NP, options.oppo.np, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_ANIMATION, options.animation, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_BATTLE_MESSAGE, options.battle_message, DEFAULT_COOKIE_EXDAYS);
                setCookie(COOKIE_AGIBUFF, options.agibuff, DEFAULT_COOKIE_EXDAYS);
            }
        });
    $("#option-dialog input:text").each(function() {
        var strs = $(this).attr('id').split("-");
        if (strs.length == 2)
            $(this).val(options[strs[1]]);
        else
            $(this).val(options[strs[1]][strs[2]]);
    });
    $("#option-dialog input[name=animation]").each(function() {
        if ($(this).val() == String(options.animation))
            $(this).attr("checked", true);
    });
    $("#options-agibuff").val(options.agibuff);
    $("#options-qs-reset").val(options.qs_reset);
    $("#options-dr-reset").val(options.dr_reset);
    $("#battle-button")
        .button()
        .click(function() {
            simulate(1); 
        });
    $("#winrate-button")
        .button()
        .click(function() {
            var rounds = parseInt(prompt("Enter the number of battles to be simulated: ", 100));
            if (!isNaN(rounds))
                simulate(rounds); 
        });
    $("#suggestion-button")
        .button()
        .click(function() {
            var iters = parseInt(prompt("Enter the number of random lineups to be simulated: ", 100));
            var rounds = parseInt(prompt("Enter the number of battles to be simulated for each lineup: ", 100));
            if (!isNaN(iters) && !isNaN(rounds))
                suggest(iters, rounds); 
        });
    $("#options-button")
        .button()
        .click(function() {
            $("#option-dialog").dialog("open");
        });
    $("#reset-button")
        .button()
        .click(function() {
            reset();
        });
    $("#help-dialog")
        .dialog({
            modal: true, 
            title: "Help",
            buttons: [
                {text: "Close", click: function() { $(this).dialog("close"); }}
            ],
            autoOpen: false,
            position: {my: "center", at: "top", of: window},
            width: 600
        });
    $("#help-button")
        .button()
        .click(function() {
            $("#help-dialog").dialog("open");
        });
    $("#acknowledgements-dialog")
        .dialog({
            modal: true, 
            title: "Acknowledgements",
            buttons: [
                {text: "Close", click: function() { $(this).dialog("close"); }}
            ],
            autoOpen: false,
            position: {my: "center", at: "top", of: window},
            width: 600
        });
        
    var fav_cards = Favorite.getCards();
    var fav_excards = Favorite.getExCards();

    for (var i = 0; i < targets.length; i++) {
        var target = targets[i];
        var id = target.id;
        var prefix = target.prefix;
        var title = target.title;
        $(id).append("<div class='team_name'>" + title + "</div>");
        for (var j = 0; j < TEAM_SIZE; j++) {
            $(id).append($("<div id='" + prefix + "line" + j + "'></div>").data("index", j).data("prefix", prefix)
                .append("<span class='battle-line-header'>" + (j + 1) + "</span>")
                .append("<select id='" + prefix + "stars" + j + "' class='battle-line-stars'></select>")
                .append("<select id='" + prefix + "border" + j + "' class='battle-line-border'></select>")
                .append("<br/>")
                .append(
                    $("<span class='battle-line-arrows'></span>")
                        .append(
                            $("<img src='images/down.gif' width='24px' />")
                                .click((function(prefix) {
                                    return function() {
                                        moveDown(prefix, $(this).parent().parent().data("index"));
                                    };
                                })(prefix))
                        )
                        .append(
                            $("<img src='images/up.gif' width='24px' />")
                                .click((function(prefix) {
                                    return function() {
                                        moveUp(prefix, $(this).parent().parent().data("index"));
                                    };
                                })(prefix))
                        )
                )
                .append("<select id='" + prefix + "guardian" + j + "' class='battle-line-guardian'></select>")
                .append("<br/>")
                .append("<div id='" + prefix + "avatar" + j + "' class='battle-line-avatar'>&nbsp;</div>")
                .append("<select id='" + prefix + "type" + j + "' class='battle-line-type'></select>")
                .append("<select id='" + prefix + "level" + j + "' class='battle-line-level'></select>")
                .append("<select id='" + prefix + "stoned" + j + "' class='battle-line-stoned'></select>")
                .append("<br/>")
                .append("<select id='" + prefix + "skill" + j + "_0' class='battle-line-skill'></select>")
                .append("<br/>")
                .append("<select id='" + prefix + "skill" + j + "_1' class='battle-line-skill'></select>")
                .append("<br/>")
                .append("<select id='" + prefix + "skill" + j + "_2' class='battle-line-skill'></select>")
                .append("<br/>")
                .append("<select id='" + prefix + "favorites" + j + "' class='battle-line-favorites'><option value=''>From Favorites...</option></select>")
                .append("<br/>")
                .append("<div id='" + prefix + "status" + j + "' class='battle-line-status'></div>")
            );

            /* Add selection from favorites. */
            for (var k = 0; k < fav_cards.length; k++) {
                var c = fav_cards[k];
                var stoned = (c.status.type == "custom" ? "Custom" : (c.status.type == "fs" ? "FS" : (c.status.type == "fsemp" ? "FSeMP" : "Clean")));
                var name = c.type.name + " " + c.name + " (" + stoned + ")";
                var tooltip = [name, "&#10;",
                               "HP: ", c.status.hp, "&#10;",
                               "MP: ", c.status.mp, "&#10;",
                               "ATK: ", c.status.atk, "&#10;",
                               "DEF: ", c.status.def, "&#10;",
                               "AGI: ", c.status.agi, "&#10;",
                               "WIS: ", c.status.wis, "&#10;",
                               List.map(function(s) { return s.name + " (" + s.description + ")"; }, c.getSkills()).join("&#10;")
                              ].join("");
                $("#" + prefix + "favorites" + j)
                    .append("<option title='" + tooltip + "' value='" + Card.encode(fav_cards[k]) + "'>" + name + "</option>");
            }
            $("#" + prefix + "favorites" + j)
                .off()
                .change((function(prefix, j) {
                    return function() {
                        var code = $(this).val();
                        if (code.length > 0) {
                            fromLine(prefix, j, code);
                            $(this).val('');
                        }
                    };
                })(prefix, j));
        }

        $(id).append($("<div id='" + prefix + "ex1'></div>").data("index", 1).data("prefix", prefix)
            .append("<span class='battle-line-ex-header'>EX1</span>")
            .append("<select id='" + prefix + "ex1stars' class='battle-line-ex-stars'></select>")
            .append("<select id='" + prefix + "ex1card' class='battle-line-ex-card'></select>")
            .append("<br/>")
            .append("<div id='" + prefix + "avatarex1' class='battle-line-ex-avatar'>&nbsp;</div>")
            .append("<select id='" + prefix + "ex1skill' class='battle-line-ex-skill'></select>")
            .append("<br/>")
            .append("<select id='" + prefix + "ex1favorites' class='battle-line-ex-favorite'><option value=''>From Favorites...</option></select>")
        );
        $(id).append($("<div id='" + prefix + "ex2'></div>").data("index", 2).data("prefix", prefix)
            .append("<span class='battle-line-ex-header'>EX2</span>")
            .append("<select id='" + prefix + "ex2stars' class='battle-line-ex-stars'></select>")
            .append("<select id='" + prefix + "ex2card' class='battle-line-ex-card'></select>")
            .append("<br/>")
            .append("<div id='" + prefix + "avatarex2' class='battle-line-ex-avatar'>&nbsp;</div>")
            .append("<select id='" + prefix + "ex2skill' class='battle-line-ex-skill'></select>")
            .append("<br/>")
            .append("<select id='" + prefix + "ex2favorites' class='battle-line-ex-favorite'><option value=''>From Favorites...</option></select>")
        );

        /* Add selection from favorites. */
        $.each(["ex1", "ex2"], function(idx, d) {
            for (var k = 0; k < fav_excards.length; k++) {
                if (fav_excards[k].border.id == idx)
                    $("#" + prefix + d + "favorites")
                    .append("<option value='" + ExCard.encode(fav_excards[k]) + "'>" + fav_excards[k].name + "</option>");
            }
            $("#" + prefix + d + "favorites")
                .off()
                .change((function(prefix, j, d) {
                    return function() {
                        var code = $(this).val();
                        if (code.length > 0) {
                            fromLine(prefix, j, d + ":" + code);
                            $(this).val('');
                        }
                    };
                })(prefix, j, d));
        });

        for (var j = 0; j < TEAM_SIZE; j++)
            insertStars(prefix, j);

        insertExStars(prefix, 1);
        insertExStars(prefix, 2);
        
        $(id)
            .append("<textarea id='" + prefix + "guardians' class='iofield' rows='5' cols='50'></textarea><br/>")
            .append(
                $("<button>Load</button>")
                    .button()
                    .addClass("small-font")
                    .click((function(target) {
                        return function() {
                            laterback(function(callback) {
                                fromString(target, callback);
                            });
                        };
                    })(target))
            )
            .append(
                $("<button>Save</button>")
                    .button()
                    .addClass("small-font")
                    .click((function(target) {
                        return function() {
                            later(function() {
                                var str = toString(target);
                                $("#" + target.prefix + "guardians").val(str);
                            });
                        };
                    })(target))
            )
            .append(
                $("<button>Save As Default</button>")
                    .button()
                    .addClass("small-font")
                    .click((function(target) {
                        return function() {
                            later(function() {
                                var str = toString(target);
                                setCookie(COOKIE_BATTLE_DEFAULT_PARTY[target.prefix], str, DEFAULT_COOKIE_EXDAYS);
                            });
                        };
                    })(target))
            )
            .append(
                $("<button>Random</button>")
                    .button()
                    .addClass("small-font")
                    .click((function(target) {
                        return function() {
                            var f = function(i, callback) {
                                if (i >= TEAM_SIZE)
                                    callback();
                                else {
                                    var j = Math.floor(Math.random() * Card.all.length);
                                    var g = Card.all[j];
                                    setStars(target.prefix, i, g.stars);
                                    setBorder(target.prefix, i, g.border.id);
                                    setCard(target.prefix, i, g.id);
                                    setTimeout(function() { f(i + 1, callback); }, 10);
                                }
                            };
                            var g = function(i, callback) {
                                if (i >= TEAM_SIZE)
                                    f(0, callback);
                                else {
                                    setStars(target.prefix, i, 0);
                                    setTimeout(function() { g(i + 1, callback); }, 10);
                                }
                            }
                            laterback(function(callback) {
                                g(0, callback);
                            });
                        };
                    })(target))
            );
    }

    var preload_my = getCookie(COOKIE_BATTLE_DEFAULT_PARTY[targets[0].prefix], "");
    var preload_oppo = getCookie(COOKIE_BATTLE_DEFAULT_PARTY[targets[1].prefix], "");

    $("#" + targets[0].prefix + "guardians").text(preload_my);
    $("#" + targets[1].prefix + "guardians").text(preload_oppo);
    laterback(function(callback) { 
        fromString(targets[0], function() {
            fromString(targets[1], callback);
        }); 
    });
}
