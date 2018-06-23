$(document).ready(function () {
    $('.parallax').parallax();
    $('.collapsible').collapsible();
    $('.modal').modal();
    $('input#input_text, textarea#textarea1').characterCounter();
    updateArticles();
    updateArchive();
});

// trigger scrape route
$(document).on("click", "#button", function () {
    $.get("/scrape", function (data) {
        modalComplete(data);
        updateArticles();

    }).done(function () {

    })
});

// trigger msg modal
function modalComplete(textmsg) {
    $('#modal-index').modal('open');
    $('#modal-index-content').text(textmsg);
}

function updateArticles() {
    // Grab the articles as a json
    $.getJSON("/articles", function (data) {
        $("#article_list").empty();
        // For each one
        for (var i = 0; i < data.length; i++) {
            // Display the apropos information on the page
            //console.log(data[i]);
            if (!data[i].saved) {
                var li = $("<li>");
                var divh = $('<div class="collapsible-header">');
                var icon = '<i class="material-icons">label_outline</i>';
                var icon_save = '<i class="material-icons">play_for_work</i>';
                var divb = $('<div class="collapsible-body">');
                var br = $('<br>');
                var span = $('<p>');
                var atag = $('<a class="weblink" target="_blank">');
                var btn = $('<a class="save waves-effect waves-light right">');
                //icon.text("label_outline");
                //divh.append(icon);
                divh.html(icon + data[i].title);
                span.append(data[i].body);
                atag.text(data[i].link);
                atag.attr('href', data[i].link);
                span.append(br);
                span.append(br);
                span.append(atag);
                btn.html(icon_save);
                btn.attr("data-id", data[i]._id);
                divb.append(span);
                divb.append(btn);
                li.append(divh);
                li.append(divb);
                $("#article_list").append(li);
            }
            // $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
        }
    });
}

function updateArchive() {
    // Grab the articles as a json
    $.getJSON("/articles", function (data) {
        $("#archive_list").empty();
        // For each one
        for (var i = 0; i < data.length; i++) {
            // Display the apropos information on the page
            //console.log(data[i]);
            if (data[i].saved) {
                var li = $("<li>");
                var divh = $('<div class="collapsible-header">');
                var icon = '<i class="material-icons">label</i>';
                var icon_note = '<i class="material-icons">comment</i>';
                var icon_delete = '<i class="material-icons">delete</i>';
                //var icon = $('<i class="material-icons">');
                var divb = $('<div class="collapsible-body">');
                var br = $('<br>');
                var span = $('<p>');
                var atag = $('<a class="weblink" target="_blank">');
                var btnn = $('<a id="modal" class="waves-effect waves-light  right">');
                var btnd = $('<a class="delete waves-effect waves-light  right">');
                //icon.text("label_outline");
                //divh.append(icon);
                divh.html(icon + data[i].title);
                span.append(data[i].body);
                atag.text(data[i].link);
                atag.attr('href', data[i].link);
                span.append(br);
                span.append(br);
                span.append(atag);
                btnn.html(icon_note);
                btnn.attr("data-id", data[i]._id);
                btnn.attr("href", "#modal-note");
                btnd.html(icon_delete);
                btnd.attr("data-id", data[i]._id);
                divb.append(span);
                divb.append(btnd);
                divb.append(btnn);
                li.append(divh);
                li.append(divb);
                $("#archive_list").append(li);
            }
            // $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
        }
    });
}

// When you click the savenote button
$(document).on("click", "#note-submit", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("article-id");
    var notetitle = $("#note-title").val();
    var notetext = $("#note-text").val();
    console.log(thisId, notetitle, notetext);

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                // Value taken from title input
                title: notetitle,
                // Value taken from note textarea
                body: notetext
            }
        })
        // With that done
        .done(function (data) {
            modalComplete("'" + notetitle + "'" + " - has been added to notes.");
            getNotes(data._id);
            // Empty the notes section
            //$("#note").empty();
        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#note-title").val("");
    $("#note-text").val("");
});

// save article
$(document).on("click", ".save", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    console.log(thisId);
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
            method: "POST",
            url: "/save/" + thisId,
            data: {
                // saved = true
                saved: true
            }
        })
        // With that done
        .done(function (data) {
            // Log the response
            console.log(data);
            modalComplete("'" + data.title + "'" + " - has been saved to archive.");
            updateArticles();
        });
});

// delete archived article
$(document).on("click", ".delete", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    console.log(thisId);
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
            method: "DELETE",
            url: "/delete/" + thisId
        })
        // With that done
        .done(function (data) {
            // Log the response
            console.log(data);
            modalComplete("'" + thisId + "'" + " - has been deleted.");
            updateArchive();
        });
});

// delete note
$(document).on("click", ".note-delete", function () {
    var note_id = $(this).attr('note-id');
    console.log(note_id);
    $.ajax({
            method: "DELETE",
            url: "/note/delete/" + note_id
        })
        // With that done
        .done(function (data) {
            // Log the response
            //console.log(data);
            modalComplete("'" + note_id + "'" + " - has been deleted.");
            getNotes(localStorage.article_id);
        });
});

// trigger note modal
$(document).on("click", "#modal", function () {
    var data_id = $(this).attr('data-id');
    localStorage.setItem('article_id', data_id);
    getNotes(data_id);
    $('#modal-note').modal('open');
    // save the article id in the submit button
    $('#note-submit').attr('article-id', data_id);
    console.log(data_id);
    //$('.modal-title').text('RESV ' + date + " " + time);
});

function getNotes(thisId) {
    $("#note").empty();
    // Now make an ajax call for the Article
    $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
        // With that done, add the note information to the page
        .done(function (data) {
            console.log(data.notes);
            var li_title = $('<li class="collection-header">');
            // The title of the article
            li_title.text("Notes for: " + data.title);
            $("#note").append(li_title);
            for (i in data.notes) {
                var li = $('<li>');
                var divh = $('<div class="collapsible-header collection-item">');
                var divb = $('<div class="collapsible-body">');
                // var atag = '<a class="secondary-content"><i class="material-icons">delete</i></a>';
                var atag = $('<a class="secondary-content waves-effect note-delete">');
                var itag = $('<i class="material-icons">');
                itag.text('delete');
                atag.attr('note-id', data.notes[i]._id);
                atag.append(itag);
                divh.text(data.notes[i].title);
                divb.text(data.notes[i].body);
                divb.append(atag);
                li.append(divh);
                li.append(divb);
                $('#note').append(li);
            }
        });
}