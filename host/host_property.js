window.onload = function() {
    onCreate();
}

function onCreate() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    $("#addPropBtn").attr("onclick=\"window.location.href='host.html?host_id=" + vars.host_id + '\'"');
    getData(vars.host_id);

}

function getData(hID) {
    var baseurl = "https://best-airbnb.herokuapp.com";

    var check = new XMLHttpRequest();
    check.open("GET", baseurl + "/custom?sql=SELECT * FROM public.rental_property rp INNER JOIN public.property p ON rp.property_id=p.id WHERE host_id=" + hID, true);

    check.onreadystatechange = function() {
        if (check.readyState === 4 && check.status === 200) {
            var results = JSON.parse(check.responseText);
            console.log(results);

            if (results.length > 0) {

                var recordsTable = document.getElementById('prop').getElementsByTagName('tbody')[0];
                var record = '',
                    newRow = '';

                for (var i = 0; i < results.length; i++) {
                    record = '<tr><th scope="row">' + results[i].id + '</th>' +
                        '<td>' + results[i].house_num + ' ' + results[0].street + ', ' + results[i].city +
                        ', ' + results[i].province + ', ' + results[i].country + '</td>' +
                        '<td>' + results[i].rate + '</td>' +
                        '<td>' + results[i].description + '</td>' +
                        '<td>' + results[i].amenities + '</td>' +
                        '<td>' + results[i].bed_count + '</td>' +
                        '<td>' + results[i].bath_count + '</td>' +
                        '<td>' + results[i].room_type + '</td>' +
                        '</tr>';
                    newRow = recordsTable.insertRow(recordsTable.rows.length);
                    newRow.innerHTML = record;
                }
            } else {
                document.getElementById("message").innerHTML = "You do not have any hosted properties or this host ID does not exist.";
                $("#message").show();
            }
        } else if (check.status === 400) {
            alert("Error");
            return false;
        }
    };
    check.send();
}