$("#save-notes").on("click", function() {  
    var thisId = $(this).attr("data-id");
    console.log(thisId)
    
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        title: $("#noteTitle").val(),
        body: $("#notesText").val()
      }
    })
    .then(function(data) {
      
      $("#notes").empty();
    });
    
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
  
  $(".view-notes").on("click", function(){
    var thisId = $(this).attr("data-id");
    window.location = "/articles-notes/" + thisId 
    console.log("here")
  })
  