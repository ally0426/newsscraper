var id;

$(".addNote").on("click", function() {
    event.preventDefault();
    console.log(id);
    console.log("hello");
    $.ajax({
        method: "POST",
        url: "/articles/" + id,
        data: {
          body: $("#body").val()
        }
      })
        .then(function(data) {
            console.log("success");
          console.log(data);
        });
});
$(".getNote").on("click", function() {
    $("#body").val("");
    id = $(this).attr("data-id");
    $.ajax({
        method: "GET",
        url: "/articles/" + id
      }).then(function(data) {
          $("#body").val(data.note.body);
        });
});

$("#clear").on("click", function() {
  $.ajax({
    method: "DELETE",
    url: "/delete"
  }).then(function(data) {
    // console.log("done");
      location.reload();
    });
})
$("#scrape").on("click", function() {
  $("#a").text("Scraping...");
  $.ajax({
    method: "GET",
    url: "/scrape"
  }).then(function(data) {
      location.reload();
    });
})
