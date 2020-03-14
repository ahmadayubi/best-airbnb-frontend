window.onload = function () {
    onCreate();
}

function onCreate() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    getData(vars.employee_id, vars.property_id);

}

function getData(eID, pID) {
    var baseurl = "https://best-airbnb.herokuapp.com";

    var check = new XMLHttpRequest();
    check.open("GET", baseurl + "/custom?sql=select * from public.prop_manage where employee_id=" + eID + " and property_id=" + pID, true);
    check.onreadystatechange = function () {
        if (check.readyState === 4 && check.status === 200) {
            var results = JSON.parse(check.responseText);
            if (results > 0) { //CHANCE BACK TO 0 LATERRRRRRR
                var xhr = new XMLHttpRequest();
                xhr.open("GET", baseurl + "/custom?sql=select * from public.property where id=" + pID, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var results = JSON.parse(xhr.responseText);
                        var info = "";
                        info += "<h3>Property Info</h3>"
                        info += "<p>House Number: " + results[0].house_num + "</br>";
                        info += "Street: " + results[0].street + "</br>";
                        info += "City: " + results[0].city + "</br>";
                        info += "Province: " + results[0].province + "</br>";
                        info += "Country: " + results[0].country + "</br>";
                        info += "Rate: " + results[0].rate + "</br>";
                        info += "Description: " + results[0].description + "</br>";
                        info += "Amenities: " + results[0].amenities + "</br>";
                        info += "Bed Count: " + results[0].bed_count + "</br>";
                        info += "Bath Count: " + results[0].bath_count + "</br>";
                        info += "Room Type: " + results[0].room_type + "</br>";
                        info += "</p>"

                        document.getElementById("prop").innerHTML = info;
                    } else if (xhr.status === 400) {
                        alert("Error");
                        return false;
                    }
                };
                xhr.send();
            } else {

                document.getElementById("intro").innerHTML = "<h2>Property Is Not Under Your Management</h2>";
            }
        } else if (check.status === 400) {
            alert("Error");
            return false;
        }
    };
    check.send();
}