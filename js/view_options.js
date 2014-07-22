
function clearLocalStorage() {
    $.jStorage.flush();
    $("#local_storage_size").html($.jStorage.storageSize());
    Nav.updateComparisonNumber();
}

function clearCustomRecommends() {
    var keys = $.jStorage.index();
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.indexOf(locale.getLanguage() + ".recommends.") == 0)
            $.jStorage.deleteKey(key);
    }
    $("#local_storage_size").html($.jStorage.storageSize());
}

function clearCardComparison() {
    Comparison.clear();
    $("#local_storage_size").html($.jStorage.storageSize());
    Nav.updateComparisonNumber();
}

function clearFavorites() {
    Favorite.clearCards();
    Favorite.clearExCards();
    $("#local_storage_size").html($.jStorage.storageSize());
}

function saveOptions() {
    /* Save resources. */
    $("#options-resources input:checkbox").each(function() {
        var cname = $(this).attr('name');
        setCookie(cname, $(this).is(':checked'), DEFAULT_COOKIE_EXDAYS);
    });

    setCookie(COOKIE_NOCACHE, $("#options-nocache").is(':checked'), DEFAULT_COOKIE_EXDAYS);

    setCookie(COOKIE_LOAD_HETEROGENEOUS_TYPES, $("#options-heterogeneous-types").is(':checked'), DEFAULT_COOKIE_EXDAYS);

    /* Save type classification. */
    evaluation_id = $("#options-evaluation input[name=evaluation]:checked").val();
    if (RESOURCES_LOADED["evaluation"]) {
        evaluation = new Evaluation(evaluation_id);
        setCookie(EVALUATION_COOKIE_NAME, evaluation_id, DEFAULT_COOKIE_EXDAYS);
    }

    setCookie(COOKIE_TRANSLATE, $("#options-translate").is(":checked"), DEFAULT_COOKIE_EXDAYS);

    $("#options-messages").html("Options saved.");

    setTimeout(function() {
        $("#options-messages").html("");
    }, 1000);
}

function initOptions() {
    Nav.init("nav_options");

    $("#options-save")
        .button()
        .click(function() {
            saveOptions();
        });

    /* Initialize resource loading. */
    $("#options-resources input:checkbox").each(function() {
        var cname = $(this).attr('name');
        var enabled = getCookie(cname, "true") == "true";
        $(this).attr('checked', enabled);
    });

    $("#options-nocache").attr('checked', getCookie(COOKIE_NOCACHE, "") == "true");

    /* Initialize heterogeneous rebirth types. */
    $("#options-heterogeneous-types").attr('checked', getCookie(COOKIE_LOAD_HETEROGENEOUS_TYPES, "") == "true");

    /* Initialize type evaluation. */
    if (RESOURCES_LOADED["evaluation"]) {
        $("#options-evaluation")
            .append($("<ul></ul>").each(function() {
                for (var i = 0; i < evaluation_data.length; i++) {
                    var name = evaluation_data[i].name;
                    var url = evaluation_data[i].url;
                    var desc = evaluation_data[i].description;
                    if (desc.length > 0)
                        desc = " (" + desc + ") ";
                    var date = "";
                    if ('date' in evaluation_data[i])
                        date = " (Last Updated: " + evaluation_data[i].date + ")";
                    var selected = evaluation_id == i ? " checked" : "";
                    var text = url.length == 0 ?
                        "<li><label><input type='radio' name='evaluation' value='" + i + "'" + selected + "><b>" + name + "</b></label></li>" :
                        "<li><label><input type='radio' name='evaluation' value='" + i + "'" + selected + "><b>" + name + "</b></label>" + 
                        desc + "(<a href='" + url + "' target='_blank'>Details</a>)" + date + "</li>";
                    $(this).append(text);
                }
            }));
    } else {
        $("#options-classification-unloaded").show();
    }

    /* Initialize name translation. */
    $("#options-translate").attr('checked', goptions.translate);

    /* Initialize local storage. */
    $("#local_storage_size").html($.jStorage.storageSize());
    $("#clear_local_storage")
        .button()
        .click(function() {
            clearLocalStorage();
        });
    $("#clear_custom_recommends")
        .button()
        .click(function() {
            clearCustomRecommends();
        });
    $("#clear_card_comparison")
        .button()
        .click(function() {
            clearCardComparison();
        });
    $("#clear_favorites")
        .button()
        .click(function() {
            clearFavorites();
        });
}