function progress(i) {
    $("#message").html($("#message").html() + ".");
    $("#progressbar").progressbar("value", $("#progressbar").progressbar("value") + i);
}

function loadComparisonBasicData(g, options, callback) {
    var table = $("#comparison_table");

    var tname = g.type.name;
    var stats = g.getMaxStonedStats();
    var sks = List.map(function(skill) {return skill.name + " (" + skill.description + ")"}, g.getSkills()).join("<br/>");
    var cast = function(g, n) {
        if (g.canCast(n))
            return "Yes";
        else
            return "No";
    };

    $("#comparison_card").append($("<th></th>").append(g.getImage()));
    $("#comparison_name").append($("<th></th>").append(Card.mkextlnk(g, true)));
    $("#comparison_type").append($("<td></td>").append(tname));
    $("#comparison_attribute").append($("<td></td>").append(g.attribute.getImage()));
    $("#comparison_hp").append($("<td></td>").append(stats.hp));
    $("#comparison_mp").append($("<td></td>").append(stats.mp));
    $("#comparison_atk").append($("<td></td>").append(stats.atk));
    $("#comparison_def").append($("<td></td>").append(stats.def));
    $("#comparison_agi").append($("<td></td>").append(stats.agi));
    $("#comparison_wis").append($("<td></td>").append(stats.wis));
    $("#comparison_total").append($("<td></td>").append((stats.hp + stats.mp + stats.atk + stats.def + stats.agi + stats.wis)));
    $("#comparison_skills").append($("<td></td>").append(sks));
    $("#comparison_cast1").append($("<td></td>").append(cast(g, 1)));
    $("#comparison_cast2").append($("<td></td>").append(cast(g, 2)));
    $("#comparison_cast3").append($("<td></td>").append(cast(g, 3)));

    if (typeof callback == 'function')
        callback();
}

function loadComparisonOneshot(g, options, f, callback) {
    var oneshot = f();

    if (typeof oneshot != 'object') {
        $("#comparison_" + oneshot).append("<td>-</td>");
        $("#comparison_" + oneshot + "_details").append("<td>-</td>");
    } else {
        for (var j = 0; j < oneshot.length; j++) {
            var data = oneshot[j];
            $("#comparison_" + data.id).append(
                $("<td></td>")
                    .append(data.ccount + " (" + data.tcount + ")")
            );

            var cell = $("<td></td>")
                .addClass('left-align')
                .addClass('top-align');
            $("#comparison_" + data.id + "_details").append(cell);

            var oppos = data.cards;
            for (var k = 0; k < oppos.length; k++) {
                var oppo = oppos[k];

                var res = "";
                for (var l = 0; l < oppo.types.length; l++) {
                    var t = oppo.types[l];
                    if (t.isRebirthType())
                        res += "<u>" + t.shortname + "</u>"; 
                    else
                        res += t.shortname; 
                }

                $(cell).append(
                    $("<span></span>")
                        .addClass("entry")
                        .addClass("tiny-font")
                        .append($("<span></span>").addClass("guardian-attr").html(oppo.opponent.attribute.getImage(5)))
                        .append($("<span class='tiny-guardian-name'></span>").html(Card.mklnk(oppo.opponent.id)))
                        .append($("<span></span>").addClass("shorttype").html(res))
                        .append("<br/>")
                );
            }   
        }                
    }
            
    if (typeof callback == 'function')
        callback();
}

function loadComparisonCard(g, options, prog, callback) {
    g.setLevel(g.getMaxLevel());
    g.setStoned(true);
    options.merge_oneshotby = false;

    var selector = Selector.stars(g.stars);
    var opponents = Selector.select(selector);
    opponents.sort(Sorting.attribute);

    var oneshots = new Array(
        function() {
            options.mode = MODE_UOHKO;
            return Calculator.getUOHKO(g, opponents, options);
        },
        function() {
            options.mode = MODE_OHKOBY;
            return Calculator.getOHKOBy(g, opponents, options);
        },
        function() {
            var has_qs = g.hasSkill(Skill.qs);
            if (has_qs) {
                options.mode = MODE_UQSKO;
                return Calculator.getUQSKO(g, opponents, options);
            } else {
                return "uqsko"
            }
        },
        function() {
            var has_qs = g.hasSkill(Skill.qs);
            if (has_qs) {
                options.mode = MODE_QSKO;
                return Calculator.getQSKO(g, opponents, options);
            } else {
                return "qsko";
            }
        }
    );

    var i = 0;
    var f = function() {
        if (i == oneshots.length) {
            if (typeof callback == 'function')
                callback();
        } else {
            loadComparisonOneshot(g, options, oneshots[i++], function() {
                progress(prog / oneshots.length);
                f();
            });
        }
    };
    setTimeout(function() {
        loadComparisonBasicData(g, options, f);
    }, 50);
}

function loadComparisonHeaders(callback) {
    var table = $("#comparison_table");

    table
        .append($("<tr id='comparison_card'></tr>").append("<th>Card</th>"))
        .append($("<tr id='comparison_name'></tr>").append("<th>Name</th>"))
        .append($("<tr id='comparison_type'></tr>").append("<th>Type</th>"))
        .append($("<tr id='comparison_attribute'></tr>").append("<th>Attribute</th>"))
        .append($("<tr id='comparison_hp'></tr>").append("<th>HP</th>"))
        .append($("<tr id='comparison_mp'></tr>").append("<th>MP</th>"))
        .append($("<tr id='comparison_atk'></tr>").append("<th>ATK</th>"))
        .append($("<tr id='comparison_def'></tr>").append("<th>DEF</th>"))
        .append($("<tr id='comparison_agi'></tr>").append("<th>AGI</th>"))
        .append($("<tr id='comparison_wis'></tr>").append("<th>WIS</th>"))
        .append($("<tr id='comparison_total'></tr>").append("<th>Total</th>"))
        .append($("<tr id='comparison_skills'></tr>").append("<th>Skills</th>"))
        .append($("<tr id='comparison_cast1'></tr>").append("<th>Single Cast</th>"))
        .append($("<tr id='comparison_cast2'></tr>").append("<th>Double Cast</th>"))
        .append($("<tr id='comparison_cast3'></tr>").append("<th>Triple Cast</th>"))
        .append($("<tr id='comparison_uohko'></tr>").append("<th>Unable to OHKO</th>"))
        .append($("<tr id='comparison_ohko_by_qs'></tr>").append("<th>OHKO By QS</th>"))
        .append($("<tr id='comparison_ohko_by_normal'></tr>").append("<th>OHKO By<br/>Normal Attack</th>"))
        .append($("<tr id='comparison_ohko_by_physical'></tr>").append("<th>OHKO By<br/>Physical+4</th>"))
        .append($("<tr id='comparison_ohko_by_critical'></tr>").append("<th>OHKO By<br/>Critical Elemental+4</th>"))
        .append($("<tr id='comparison_ohko_by_elemental'></tr>").append("<th>OHKO By<br/>Normal Elemental+4</th>"))
        .append($("<tr id='comparison_ohko_by_blocked'></tr>").append("<th>OHKO By<br/>Blocked Elemental+4</th>"))
        .append($("<tr id='comparison_ohko_by_smash'></tr>").append("<th>OHKO By<br/>Gigant Smash</th>"))
        .append($("<tr id='comparison_ohko_by_soulslash'></tr>").append("<th>OHKO By<br/>Soul Slash</th>"))
        .append($("<tr id='comparison_uqsko'></tr>").append("<th>Unable to QS-KO</th>"))
        .append($("<tr id='comparison_qsko'></tr>").append("<th>QS-KO</th>"))
        .append($("<tr id='comparison_uohko_details'></tr>").append("<th>Unable to OHKO<br/>(Details)</th>"))
        .append($("<tr id='comparison_ohko_by_qs_details'></tr>").append("<th>OHKO By QS<br/>(Details)</th>"))
        .append($("<tr id='comparison_ohko_by_normal_details'></tr>").append("<th>OHKO By<br/>Normal Attack<br/>(Details)</th>"))
        .append($("<tr id='comparison_ohko_by_physical_details'></tr>").append("<th>OHKO By<br/>Physical+4<br/>(Details)</th>"))
        .append($("<tr id='comparison_ohko_by_critical_details'></tr>").append("<th>OHKO By<br/>Critical Elemental+4<br/>(Details)</th>"))
        .append($("<tr id='comparison_ohko_by_elemental_details'></tr>").append("<th>OHKO By<br/>Normal Elemental+4<br/>(Details)</th>"))
        .append($("<tr id='comparison_ohko_by_blocked_details'></tr>").append("<th>OHKO By<br/>Blocked Elemental+4<br/>(Details)</th>"))
        .append($("<tr id='comparison_ohko_by_smash_details'></tr>").append("<th>OHKO By<br/>Gigant Smash<br/>(Details)</th>"))
        .append($("<tr id='comparison_ohko_by_soulslash_details'></tr>").append("<th>OHKO By<br/>Soul Slash<br/>(Details)</th>"))
        .append($("<tr id='comparison_uqsko_details'></tr>").append("<th>Unable to QS-KO<br/>(Details)</th>"))
        .append($("<tr id='comparison_qsko_details'></tr>").append("<th>QS-KO<br/>(Details)</th>"))
    ;

    if (typeof callback == 'function')
        callback();
}

function loadComparisonTable(callback) {
    var gs = Comparison.getCards();

    if (gs.length == 0) {
        if (typeof callback == 'function')
            callback();
        return;
    }

    var width = 320 * gs.length + 200;
    $("#comparison_table").css('width', width);

    progress(10);

    var options = clone(Calculator.default_options);

    var count = 0;
    var f = function() {
        if (count == gs.length) {
            if (typeof callback == 'function')
                callback();
        } else {
            var g = gs[count++];
            setTimeout(function() {
                loadComparisonCard(g, options, 80 / gs.length, f);
            }, 50);
        }
    };

    setTimeout(function () {
        loadComparisonHeaders(function() {
            progress(10);
            f();
        });
    }, 50);
}

function comparison_init() {
    Nav.appendLanguageSuffix();
    Nav.updateComparisonNumber();
    Nav.disable('nav_comparison');

    $("#clear_button")
        .button()
        .click(function() {
            $("#comparison_table").html("");
            Comparison.clear();
            Nav.updateComparisonNumber();
        });

    $("#progressbar").progressbar({
        value: 0,
        max: 100
    });

    $("#comparison_table").hide();
    
    loadComparisonTable(function() {
        $("#message").hide();
        $("#progressbar").hide();
        $("#comparison_table").show();
    });
}
