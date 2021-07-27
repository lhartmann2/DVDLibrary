$(document).ready(function(){
    loadContent();
    showCreateForm();
    editButtons();
    search();
    viewButton();
});

function search() {
    $("#searchButton").click(function() {
       $("#errorMessages").empty();
       var errors = false;
       var searchTerms = $("#searchTerms").val();
       var searchCat = $("#searchCategory").val();

       if((searchTerms == "") && (searchCat == "0")) {
           errors = true;
           genericError("Please enter both search terms and search category.");
       } else if(searchTerms == "") {
            errors = true;
            genericError("Please enter search terms.");
        } else if(searchCat == "0") {
            errors = true;
            genericError("Please select a search category.");
        } if(searchCat == "Release Year") {
            $("#searchTerms").val($("#searchTerms").val().replace(/[^\d,]/g,''));
            searchTerms = $("#searchTerms").val();
            //alert(searchTerms);
            var curYear = new Date().getFullYear();
            if((searchTerms < 1888) || (searchTerms > curYear)) {
                errors = true;
                genericError("Enter a 4-digit year between 1888 and "+curYear+".");
            }
        }
        if(!errors) {
            var rows = $("#dvdRows");
            clearFields();
            var catUrl = searchCat;
            if(searchCat == "Title") {
                catUrl = "title";
            } else if(searchCat == "Director") {
                catUrl = "director";
            } else if(searchCat == "Rating") {
                catUrl = "rating";
            } else if(searchCat == "Release Year") {
                catUrl = "year";
            }

            $.ajax({
               type: "GET",
               url: "https://tsg-dvds.herokuapp.com/dvds/" + catUrl + "/" + searchTerms,
               success: function(dvdArray) {
                   if(dvdArray == null) {
                       genericError("No results for "+searchCat+": '"+searchTerms+"' found.");
                   } else {
                       $("#searchBanner").append("Search results for "+searchCat+": '"+searchTerms+"':");
                       $.each(dvdArray, function (index, dvd) {
                           var dvdId = dvd.id;
                           var row = "<tr>";
                           row += "<td>" + dvd.title + "</td>";
                           row += "<td>" + dvd.releaseYear + "</td>";
                           row += "<td>" + dvd.director + "</td>";
                           row += "<td>" + dvd.rating + "</td>";
                           row += '<td><button type="button" class="btn btn-info" onclick="showEditForm(' + dvdId + ')">Edit</button>' +
                               '   ' +
                               '<button type="button" class="btn btn-danger" onclick="showDeleteForm(' + dvdId + ')">Delete</button></td>';
                           row += "</tr>";

                           rows.append(row);
                       });
                   }
               },
               error: function(xhr) {
                   xhrError(xhr);
               }
            });
        }


    });
}

function loadContent() {
    clearFields();

    var rows = $("#dvdRows");

    $.ajax({
        type: "GET",
        url: "https://tsg-dvds.herokuapp.com/dvds",
        success: function(dvdArray) {

            $.each(dvdArray, function(index, dvd) {
               var dvdId = dvd.id;
               var row = "<tr>";
               row += "<td><a class='card-text' href='javascript:void(0);' onclick='showViewForm("+dvdId+")'>" + dvd.title + "</a></td>";
               row += "<td>" + dvd.releaseYear + "</td>";
               row += "<td>" + dvd.director + "</td>";
               row += "<td>" + dvd.rating + "</td>";
               row += '<td><button type="button" class="btn btn-info" onclick="showEditForm('+dvdId+')">Edit</button>' +
                    '   ' +
                    '<button type="button" class="btn btn-danger" onclick="showDeleteForm('+dvdId+')">Delete</button></td>';
               row += "</tr>";

               rows.append(row);
            });
        },
        error: function(xhr) {
            xhrError(xhr);
        }
    });


}

function viewButton() {
    $("#viewBackButton").click(function() {
        $("#errorMessages").empty();
        loadContent();
        $("#viewDvdDiv").hide("fast");
        $("#mainFormDiv").show("fast");
        $("#mainTable").show("fast");
    });
}

function showViewForm(dvdId) {
    $("#errorMessages").empty();
    clearFields();


    $.ajax({
        type: "GET",
        url: "https://tsg-dvds.herokuapp.com/dvd/" +dvdId,
        success: function(dvd) {
            $("#viewTitle").append(dvd.title);
            $("#viewReleaseYear").append(dvd.releaseYear);
            $("#viewDirector").append(dvd.director);
            $("#viewRating").append(dvd.rating);
            $("#viewNotes").append(dvd.notes);

            $("#mainFormDiv").hide("fast");
            $("#mainTable").hide("fast");
            $("#viewDvdDiv").show("fast");
        },
        error: function(xhr) {
            xhrError(xhr);
        }
    });
}

function showCreateForm() {
    $("#createButton").click(function() {
        $("#errorMessages").empty();
        $("#mainFormDiv").hide("fast");
        $("#mainTable").hide("fast");
        $("#createDvdDiv").show();
    });

    //Cancel Button
    $("#createCancelButton").click(function() {
       loadContent();
       $("#errorMessages").empty();
       $("#createDvdDiv").hide("fast");
       $("#mainFormDiv").show("fast");
       $("#mainTable").show("fast");
    });

    //Submit button
    $("#createSubmitButton").click(function() {
       $("#errorMessages").empty();
       var title = $("#createTitle").val();
       var year = $("#createYear").val();
       var director = $("#createDirector").val();
       var rating = $("#createRating").val();
       var notes = $("#createNotes").val();

       if(!(validateInput(title, year, director, rating))) {
           $.ajax({
              type: "POST",
              url:  "https://tsg-dvds.herokuapp.com/dvd/",
              data: JSON.stringify({
                  title: title,
                  releaseYear: year,
                  director: director,
                  rating: rating,
                  notes: notes
              }),
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
              },
              dataType: 'json',
              success: function() {
                  $("#errorMessages").empty();
                  loadContent();
                  $("#createDvdDiv").hide("fast");
                  $("#mainFormDiv").show("fast");
                  $("#mainTable").show("fast");
              },
              error: function(xhr) {
                  xhrError(xhr);
              }
           });
       }
    });
}

function showEditForm(dvdId) {
    $("#errorMessages").empty();

    $.ajax({
        type: "GET",
        url: "https://tsg-dvds.herokuapp.com/dvd/" + dvdId,
        success: function(dvd) {
            var title = dvd.title;
            $("#editBanner").append(title);
            $("#editTitle").val(title);
            $("#editYear").val(dvd.releaseYear);
            $("#editDirector").val(dvd.director);
            $("#editRating").val(dvd.rating);
            $("#editNotes").val(dvd.notes);
            $("#editDvdId").val(dvdId);

            $("#mainFormDiv").hide("fast");
            $("#mainTable").hide("fast");
            $("#editDvdDiv").show("fast");
        },
        error: function(xhr) {
            xhrError(xhr);
        }
    });
}

function editButtons() {
    //Cancel
    $("#editCancelButton").click(function() {
        $("#errorMessages").empty();
        loadContent();
        $("#editDvdDiv").hide("fast");
        $("#mainFormDiv").show("fast");
        $("#mainTable").show("fast");
    });

    //Submit changes
    $("#editSubmitButton").click(function() {
        //$("#errorMessages").empty();
        var dvdid = $("#editDvdId").val();
        var year = $("#editYear").val();
        var title = $("#editTitle").val();
        var director = $("#editDirector").val();
        var rating = $("#editRating").val();

        if(!(validateInput(title, year, director, rating))) {
            $.ajax({
                type: "PUT",
                url: "https://tsg-dvds.herokuapp.com/dvd/" + dvdid,
                data: JSON.stringify({
                    id: dvdid,
                    title: title,
                    releaseYear: year,
                    director: director,
                    rating: rating,
                    notes: $("#editNotes").val()
                }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                dateType: 'json',
                success: function () {
                    $("#errorMessages").empty();
                    loadContent();
                    $("#editDvdDiv").hide("fast");
                    $("#mainFormDiv").show("fast");
                    $("#mainTable").show("fast");
                },
                error: function (xhr) {
                    xhrError(xhr);
                }


            });
        }
    });
}

function showDeleteForm(dvdId) {

}

function validateInput(title, year, director, rating) {
    var errors = false;
    var curYear = new Date().getFullYear();

    if((year<1888) || (year>(curYear))) {
        genericError("Enter a 4-digit year between 1888 and "+curYear+".");
        errors=true;
    } else if(title == "") {
        genericError("Please enter a title.");
        errors=true;
    } else if(director == "") {
        genericError("Please enter a director.");
        errors=true;
    } else if(rating == "") {
        genericError("Please select a rating.");
        errors=true;
    }

    return errors;
}

function clearFields() {
    $("#searchBanner").empty();
    $("#dvdRows").empty();
    $("#createTitle").empty();
    $("#createYear").empty();
    $("#createDirector").empty();
    $("#createRating").selectedIndex = 0;
    $("#createNotes").empty();

    $("#editBanner").empty();
    $("#editBanner").append("Edit DVD: ");
    $("#editTitle").empty();
    $("#editDirector").empty();
    $("#editYear").empty();
    $("#editRating").selectedIndex = 0;
    $("#editNotes").empty();

    $("#viewTitle").empty();
    $("#viewReleaseYear").empty();
    $("#viewRating").empty();
    $("#viewDirector").empty();
    $("#viewNotes").empty();

}

function xhrError(xhr) {
    $("#errorMessages")
        .append($('<li>')
            .attr({class: 'list-group-item list-group-item-danger'})
            .text("Error contacting web service: "+xhr.status+" - "+xhr.statusText+ " - Please try again later."));
}

function genericError(text) {
    $("#errorMessages")
        .append($('<li>')
            .attr({class: 'list-group-item list-group-item-danger'})
            .text("Error: "+text));
}