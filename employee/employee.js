window.onload = function () {
    onCreate();
}

function onCreate() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    sqlRequest(vars.employee_id);

}

function manageProp() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    var propID = document.getElementById("property_id").value;
    window.location.href = "employee_manage.html?employee_id=" + vars.employee_id + "&property_id=" + propID;
}

function sqlRequest(sqlQ) {
    var baseurl = "https://best-airbnb.herokuapp.com";

    var xhr = new XMLHttpRequest();
    xhr.open("GET", baseurl + "/custom?sql=select first_name, last_name from public.employee where id=" + sqlQ, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var results = JSON.parse(xhr.responseText);
            document.getElementById("intro").innerHTML = "<h2>Welcome " + results[0].first_name + " " + results[0].last_name + "</h2>";
        } else if (xhr.status === 400) {
            alert("Error");
            return false;
        }
    };
    xhr.send();

    var xhr2 = new XMLHttpRequest();
    xhr2.open("GET", baseurl + "/custom?sql=select property_id from public.prop_manage where employee_id=" + sqlQ, true);
    xhr2.onreadystatechange = function () {
        if (xhr2.readyState === 4 && xhr2.status === 200) {
            var results = JSON.parse(xhr2.responseText);
            if (results.length > 0) {
                var main = "";
                for (let attr in results[0]) {
                    main += "<th> " + attr + " </th>"
                }
                for (i = 0; i < results.length; i++) {
                    main += "<tr>"
                    for (let attr in results[0]) {
                        main += "<th> " + results[i][attr] + " </th>"
                    }
                    main += "</tr>";
                }
                var tbl = "<table>" + main + "</table>";
                document.getElementById("props").innerHTML = tbl;
            } else {
                document.getElementById("props").innerHTML = "No Properties Under Management";
            }
        } else if (xhr2.status === 400) {
            alert("Error");
            return false;
        }
    };
    xhr2.send();

}