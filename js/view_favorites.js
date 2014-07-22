var MAX_STARS = 5;
var SKILL_SIZE = 3;
var MAX_LEVEL = 70;
var STAT_NAMES = ["hp", "mp", "atk", "def", "agi", "wis"];

function setCardImage(c) {
  if (c == null)
    $("#fav-new-card-image").html("");
  else
    $("#fav-new-card-image").html(c.getImage(200));
}

function setExCardImage(c) {
  if (c == null)
    $("#fav-new-excard-image").html("");
  else
    $("#fav-new-excard-image").html(c.getImage(200));
}

function getCard() {
  var id = parseInt($("#fav-new-card-name").find("option:selected").val());
  var card = Card.get(id);
  if (card == null)
    return null;

  var type = Type.get(parseInt($("#fav-new-card-type").find("option:selected").val()));
  if (type != null) 
    card.setType(type);
  var level = parseInt($("#fav-new-card-level").find("option:selected").val());
  if (!isNaN(level))
    card.setLevel(level);
  var stoned = $("#fav-new-card-stoned").find("option:selected").val();
  var status = card.getStats();
  if (stoned == "custom") {
    status.hp = parseInt($("#fav-new-card-hp").val());
    status.mp = parseInt($("#fav-new-card-mp").val());
    status.atk = parseInt($("#fav-new-card-atk").val());
    status.def = parseInt($("#fav-new-card-def").val());
    status.agi= parseInt($("#fav-new-card-agi").val());
    status.wis = parseInt($("#fav-new-card-wis").val());
  }
  if (stoned == "fsemp" || stoned == "fs") {
    status.hp += card.getStoneHP();
    status.atk += card.getStoneATK();
    status.def += card.getStoneDEF();
    status.agi += card.getStoneAGI();
    status.wis += card.getStoneWIS();
  }
  if (stoned == "fs")
    status.mp += card.getStoneMP();
  card.status = status;
  card.status.type = stoned;
  var skills = [];
  for (var i = 0; i < SKILL_SIZE; i++) {
    var skill = Skill.get($("#fav-new-card-skill" + i).find("option:selected").val());
    if (skill != null)
      skills.push(skill);
  }
  card.setSkills(skills);

  return card;
}

function getExCard() {
  var id = parseInt($("#fav-new-excard-name").find("option:selected").val());
  var card = ExCard.get(id);
  if (card == null)
    return null;
  var skill = ExSkill.get(parseInt($("#fav-new-excard-skill").find("option:selected").val()));
  if (skill != null)
    card.setSkill(skill);

  return card;
}

function updateCardStatus(card) {
  if (typeof card == 'undefined' || card == null)
    card = getCard();
  var status = card.status;
  $.each(STAT_NAMES, function(i, f) {
    $("#fav-new-card-" + f).val(status[f]);
  });
}

function insertStars() {
  $("#fav-new-card-stars")
    .html("")
    .off()
    .change(function() {
      var stars = parseInt($(this).find("option:selected").val());
      if (stars == 0) {
        $("#fav-new-card-border").html("");
        $("#fav-new-card-name").html("");
        $("#fav-new-card-type").html("");
        $("#fav-new-card-level").html("");
        $("#fav-new-card-stoned").html("");
        $("#fav-new-card-hp").val("");
        $("#fav-new-card-mp").val("");
        $("#fav-new-card-atk").val("");
        $("#fav-new-card-def").val("");
        $("#fav-new-card-agi").val("");
        $("#fav-new-card-wis").val("");
        $("#fav-new-card-skill0").html("");
        $("#fav-new-card-skill1").html("");
        $("#fav-new-card-skill2").html("");
        setCardImage(null);
      } else {
        insertBorder(stars);
      }
    });

  for (var i = 0; i <= MAX_STARS; i++)
    $("#fav-new-card-stars")
      .append(
        $("<option value='" + i + "'>" + (i == 0 ? "None" : i) + "</option>")
          .attr("selected", i == 0)
        );
  $("#fav-new-card-stars").change();
}

function insertExStars() {
  $("#fav-new-excard-stars")
    .html("")
    .off()
    .change(function() {
      var stars = parseInt($(this).find("option:selected").val());
      if (stars == 0) {
        $("#fav-new-excard-border").html("");
        $("#fav-new-excard-name").html("");
        $("#fav-new-excard-skill").html("");
        setExCardImage(null);
      } else {
        insertExBorder(stars);
      }
    });

  for (var i = 0; i <= MAX_STARS; i++)
    $("#fav-new-excard-stars")
      .append(
        $("<option value='" + i + "'>" + (i == 0 ? "None" : i) + "</option>")
          .attr("selected", i == 0)
        );
  $("#fav-new-excard-stars").change();
}

function insertBorder(stars) {
  $("#fav-new-card-border")
    .html("")
    .off()
    .change(function() {
        var border = parseInt($(this).find("option:selected").val());
        insertCards(stars, border);
    });
  for (var i = 0; i < (stars == 5 ? Border.all.length : 1); i++) {
    var b = Border.all[i];

    $("#fav-new-card-border").append(
      $("<option value='" + b.id + "'>" + b.name + "</option>")
        .attr("selected", false)
    );
  }

  $("#fav-new-card-border").val(Border.none.id);
  $("#fav-new-card-border").change();
}

function insertExBorder(stars) {
  $("#fav-new-excard-border")
    .html("")
    .off()
    .change(function() {
        var border = parseInt($(this).find("option:selected").val());
        insertExCards(stars, border);
    });
  for (var i = 0; i < ExType.all.length; i++) {
    var b = ExType.all[i];

    $("#fav-new-excard-border").append(
      $("<option value='" + b.id + "'>" + b.name + "</option>")
        .attr("selected", false)
    );
  }

  $("#fav-new-excard-border").val(ExType.red.id);
  $("#fav-new-excard-border").change();
}

function insertCards(stars, border) {
  for (var i = 0; i < SKILL_SIZE; i++)
    $("#fav-new-card-skill" + i).html("");

  var cards = Selector.select(Selector.and(Selector.stars(stars), Selector.border(border)), Card.all);
  cards.sort(Sorting.compose(Sorting.border, Sorting.name));
  $("#fav-new-card-name")
    .html("")
    .off()
    .change(function() {
      var card = getCard();
      setCardImage(card);
      if (card != null) {
        insertSkills(card);
        updateCardStatus(card);
      }
    });
  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
      var en = goptions.isTranslationNeeded() && card.id in ename.guardians ? " (" + ename.guardians[card.id] + ")" : "";
      $("#fav-new-card-name")
        .append(
          $("<option value='" + card.id + "'>" + card.name + en + "</option>")
            .attr("selected", i == 0)
        );
  }
    
  if (cards.length > 0) {
    insertTypes(cards[0]);
    insertStoned(cards[0]);
  }
    
  $("#fav-new-card-name").change();
}

function insertExCards(stars, border) {
  $("#fav-new-excard-skill").html("");

  var cards = Selector.select(Selector.and(Selector.stars(stars), Selector.border(border)), ExCard.all);
  cards.sort(Sorting.compose(Sorting.border, Sorting.name));
  $("#fav-new-excard-name")
    .html("")
    .off()
    .change(function() {
      var card = getExCard();
      setExCardImage(card);
      if (card != null)
        insertExSkills(card);
    });
  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
      var en = goptions.isTranslationNeeded() && card.id in ename.guardians ? " (" + ename.guardians[card.id] + ")" : "";
      $("#fav-new-excard-name")
        .append(
          $("<option value='" + card.id + "'>" + card.name + en + "</option>")
            .attr("selected", i == 0)
        );
  }
    
  $("#fav-new-excard-name").change();
}

function insertTypes(card) {
  var getBestBattleType = function(c) {
    var ts = new Array(Type.acer, Type.coolr, Type.ace, Type.cool);
    for (var i = 0; i < ts.length; i++) {
      if (c.hasType(ts[i]))
        return ts[i];
    }
    return null;
  };

  $("#fav-new-card-type")
    .html("")
    .off()
    .change(function() {
      var card = getCard();
      insertLevels(card);
    });
  for (var i = 0; i < Type.all.length; i++) {
    var t = Type.all[i];

    var suffix = t.isRebirthType() ? " (Rebirth)" : "";
    $("#fav-new-card-type").append(
        $("<option value='" + t.id + "'>" + t.name + suffix + "</option>")
          .attr("selected", false)
    );
  }

  card.setType(getBestBattleType(card));
  $("#fav-new-card-type").val(card.getType().id);
  insertLevels(card);
}

function insertLevels(card) {
  $("#fav-new-card-level")
    .html("")
    .off()
    .change(function() {
      updateCardStatus();
    });
  for (var i = 0; i < card.getMaxLevel(); i++) {
    $("#fav-new-card-level").append(
      $("<option value='" + (i + 1) + "'>" + (i + 1) + "</option>")
        .attr("selected", false)
    );
  }
  
  $("#fav-new-card-level")
    .val(card.getMaxLevel())
    .change();
}

function insertStoned(card) {
  $("#fav-new-card-stoned")
    .html("")
    .off()
    .append("<option value='clean'>Clean</option>")
    .append("<option value='fsemp'>FSeMP</option>")
    .append("<option value='fs' selected>FS</option>")
    .append("<option value='custom'>Custom</option>")
    .change(function() {
      var stoned = $(this).val();
      var disabled = stoned != "custom";
      $.each(STAT_NAMES, function(i, n) {
        $("#fav-new-card-" + n).prop("disabled", disabled);
      });
      updateCardStatus();
    });
}

function insertSkills(card) {    
  var gskills = card.getType().isRebirthType() ? card.recommendsrb : card.recommends;
  var sorted_skills = new Array();
  sorted_skills.push.apply(sorted_skills, Skill.getLearnableSkills());
  for (var i = 0; i < card.skills.length; i++) {
      if (card.skills[i].stone == 0)
        sorted_skills.push(card.skills[i]);
  }
  sorted_skills.sort(Sorting.compose(Sorting.skill, Sorting.name));

  for (var i = 0; i < SKILL_SIZE; i++) {
    var id = "#fav-new-card-skill" + i;
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

function insertExSkills(card) {
  $("#fav-new-excard-skill")
    .html("")
    .each(function() {
        for (var i = 0; i < card.skills.length; i++)
          $(this).append("<option value='" + card.skills[i].id + "'>" + card.skills[i].name + "</option>")
    });
  if (card.skills.length > 0)
    $("#fav-new-excard-skill").val(card.skills[card.skills.length - 1].id);
}

function reloadCards() {
  var cards = Favorite.getCards();
  $("#fav-cards").html("<table id='fav-card-table'></table>");
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i];
    var stoned = (c.status.type == "custom" ? "Custom" : (c.status.type == "fs" ? "FS" : (c.status.type == "fsemp" ? "FSeMP" : "Clean")));
    $("#fav-card-table")
      .append([
        "<tr>",
          "<td>", c.id, "</td>",
          "<td>", Card.mkextlnk(c.id, true), "</td>",
          "<td>", c.getImage(100), "</td>",
          "<td>", c.getType().name, "</td>",
          "<td align='center'>", stoned, "<br/>", 
            [c.status.hp, c.status.mp, c.status.atk, c.status.def, c.status.agi, c.status.wis].join(" / "),
          "</td>",
          "<td>", List.map(function(s) { return s.name + " (" + s.description + ")"; }, c.getSkills()).join("<br/>"), "</td>",
          "<td><button id='fav-card-table-remove" + i + "'>Delete</button></td>",
        "</tr>"
      ].join(""));
      $("#fav-card-table-remove" + i)
        .button()
        .click((function(i) {
          return function() { Favorite.removeCard(cards[i]); reloadCards(); };
        })(i));
  }
}

function reloadExCards() {
  var cards = Favorite.getExCards();
  $("#fav-excards").html("<table id='fav-excard-table'></table>");
  for (var i = 0; i < cards.length; i++) {
    var c = cards[i];
    $("#fav-excard-table")
      .append([
        "<tr>",
          "<td>", c.id, "</td>",
          "<td>", ExCard.mklnk(c.id, true), "</td>",
          "<td>", c.getImage(100), "</td>",
          "<td>", c.getSkill().name, "</td>",
          "<td><button id='fav-excard-table-remove" + i + "'>Delete</button></td>",
        "</tr>"
      ].join(""));
      $("#fav-excard-table-remove" + i)
        .button()
        .click((function(i) {
          return function() { Favorite.removeExCard(cards[i]); reloadExCards(); };
        })(i));
  }
}

function exportCards() {
  $("#fav-export-area").val(Favorite.getCardsCodes().join(" +\n"));
}

function exportExCards() {
  $("#fav-export-area").val(Favorite.getExCardsCodes().join(" +\n"));
}

function importCards(replace) {
  var cards = $("#fav-import-area").val();
  var a = $("#fav-import-dialog").data("target") == "card" ? Favorite.addCard : Favorite.addExCard;
  var d = $("#fav-import-dialog").data("target") == "card" ? Card.decode : ExCard.decode;
  var r = $("#fav-import-dialog").data("target") == "card" ? reloadCards : reloadExCards;
  var c = $("#fav-import-dialog").data("target") == "card" ? Favorite.clearCards : Favorite.clearExCards;
  if (replace)
    c();
  List.iter(function(card) { a(card); }, d(cards));
  r();
  $("#fav-import-dialog").dialog("close");
}

function favorites_init() {
  Nav.init('nav_favorites');

  $("#fav-wrapper").tabs();

  $("#fav-new-card-dialog")
  .dialog({
    autoOpen: false,
    modal: true,
    position: {my: "center", at: "top", of: window},
    width: 800,
    height: 600,
    close: function(event, ui) {}
  });

  $("#fav-new-excard-dialog")
  .dialog({
    autoOpen: false,
    modal: true,
    position: {my: "center", at: "top", of: window},
    width: 800,
    height: 400,
    close: function(event, ui) {}
  });

  $("#fav-export-dialog")
  .dialog({
    autoOpen: false,
    modal: true,
    position: {my: "center", at: "top", of: window},
    width: 800,
    height: 450
  });

  $("#fav-import-dialog")
  .dialog({
    autoOpen: false,
    modal: true,
    position: {my: "center", at: "top", of: window},
    width: 800,
    height: 500
  });

  $("#fav-card-add")
  .button()
  .click(function() {
    insertStars();
    $("#fav-new-card-dialog").dialog("open");
  });

  $("#fav-excard-add")
  .button()
  .click(function() {
    insertExStars();
    $("#fav-new-excard-dialog").dialog("open");
  });

  $("#fav-card-export")
  .button()
  .click(function() {
    exportCards();
    $("#fav-export-dialog").dialog("open");
  });

  $("#fav-excard-export")
  .button()
  .click(function() {
    exportExCards();
    $("#fav-export-dialog").dialog("open");
  });

  $("#fav-card-import")
  .button()
  .click(function() {
    $("#fav-import-area").val("");
    $("#fav-import-dialog")
      .data("target", "card")
      .dialog("open");
  });

  $("#fav-excard-import")
  .button()
  .click(function() {
    $("#fav-import-area").val("");
    $("#fav-import-dialog")
      .data("target", "excard")
      .dialog("open");
  });

  $("#fav-import-add")
  .button()
  .click(function() {
    importCards(false);
  });

  $("#fav-import-replace")
  .button()
  .click(function() {
    importCards(true);
  });

  $("#fav-new-card-add")
  .button()
  .click(function() {
    var card = getCard();
    if (card != null) {
      Favorite.addCard(card);
      reloadCards();
      $("#fav-new-card-dialog").dialog("close");
    }
  });

  $("#fav-new-excard-add")
  .button()
  .click(function() {
    var card = getExCard();
    if (card != null) {
      Favorite.addExCard(card);
      reloadExCards();
      $("#fav-new-excard-dialog").dialog("close");
    }
  });

  $("#fav-new-card-cancel")
  .button()
  .click(function() {
    $("#fav-new-card-dialog").dialog("close");
  });

  $("#fav-new-excard-cancel")
  .button()
  .click(function() {
    $("#fav-new-excard-dialog").dialog("close");
  });

  reloadCards();
  reloadExCards();

  $("#fav-wrapper").css("display", "block");
}
