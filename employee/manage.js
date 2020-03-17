var propertyID;

window.onload = function () {
    onCreate();
}


function onCreate() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    propertyID = vars.property_id;
    getData(vars.employee_id, propertyID);

}

function getData(eID, pID) {
    document.getElementById("propID").innerHTML = '<h2 class="mb-2" style="margin-bottom: 40px;">Edit Property Details For Property ' + pID + '</h2>';
    var baseurl = "https://best-airbnb.herokuapp.com";
    var check = new XMLHttpRequest();
    check.open("GET", baseurl + "/custom?sql=select * from public.prop_manage where employee_id=" + eID + " and property_id=" + pID, true);
    check.onreadystatechange = function () {
        if (check.readyState === 4 && check.status === 200) {
            var results = JSON.parse(check.responseText);
            if (results.length > 0) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", baseurl + "/custom?sql=select * from public.property where id=" + pID, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var results = JSON.parse(xhr.responseText);
                        var info = "";

                        document.getElementById("street_num").value = results[0].house_num;
                        document.getElementById("street").value = results[0].street;
                        document.getElementById("city").value = results[0].city;
                        document.getElementById("province").value = results[0].province;
                        document.getElementById("country").value = results[0].country;
                        document.getElementById("rate").value = results[0].rate;
                        document.getElementById("description").value = results[0].description;
                        let amen = results[0].amenities.substring(1);
                        amen = amen.substring(0, amen.length - 1);
                        let amenS = amen.split(',');
                        for (let i = 0; i < amenS.length; i++) {
                            document.getElementById(amenS[i]).checked = true;
                        }
                        document.getElementById("numOfBeds").value = results[0].bed_count;
                        document.getElementById("numOfBaths").value = results[0].bath_count;
                        let rType = results[0].room_type.substring(1);
                        rType = rType.substring(0, rType.length - 1);
                        let rTypeS = rType.split(',');
                        for (let j = 0; j < rTypeS.length; j++) {
                            document.getElementById(rTypeS[j]).checked = true;
                        }
                    } else if (xhr.status === 400) {
                        document.getElementById("intro").innerHTML = 'SERVER ERROR';
                    }
                };
                xhr.send();
            } else {
                document.getElementById("intro").innerHTML = '<h3>Property Is Not Under Your Management</h3> <button class="btn btn-primary" onclick="goBack()">Go Back</button>';
                document.getElementById("formInfo").style.visibility = "hidden";
                document.getElementById("propID").style.visibility = "hidden";
            }
        } else if (check.status === 400) {
            document.getElementById("intro").innerHTML = '<a href="employee_login.html">SERVER ERROR, GO BACK</a>';
        }
    };
    check.send();
}

function goBack() {
    window.history.back();
}

function update() {



    var baseurl = "https://best-airbnb.herokuapp.com";
    var xhr = new XMLHttpRequest();

    var updateInfo = "";
    updateInfo += "set house_num='" + document.getElementById("street_num").value + "',";
    updateInfo += "street='" + document.getElementById("street").value + "',";
    updateInfo += "city='" + document.getElementById("city").value + "',";
    updateInfo += "province='" + document.getElementById("province").value + "',";
    updateInfo += "country='" + document.getElementById("country").value + "',";
    let rateS = document.getElementById("rate").value;
    if (rateS.includes("$")) {
        rateS = rateS.substring(1);
    }
    updateInfo += "rate=" + rateS + ",";
    updateInfo += "description='" + document.getElementById("description").value + "',";
    var amen = []
    if (document.getElementById("gym").checked === true) {
        amen.push("gym");
    }
    if (document.getElementById("laundry").checked === true) {
        amen.push("laundry");
    }
    if (document.getElementById("parking").checked === true) {
        amen.push("parking");
    }
    if (document.getElementById("pool").checked === true) {
        amen.push("pool");
    }
    if (document.getElementById("security").checked === true) {
        amen.push("security");
    }
    if (document.getElementById("wifi").checked === true) {
        amen.push("wifi");
    }
    let sAmen = "amenities='" + JSON.stringify(amen).replace("[", "{");
    sAmen = sAmen.replace("]", "}");
    sAmen += "',";

    var room = []
    if (document.getElementById("unique").checked === true) {
        room.push("unique");
    }
    if (document.getElementById("shared").checked === true) {
        room.push("shared");
    }
    if (document.getElementById("private").checked === true) {
        room.push("private");
    }
    let sRoom = "room_type='" + JSON.stringify(room).replace("[", "{");
    sRoom = sRoom.replace("]", "}");

    sRoom += "',";

    updateInfo += sRoom;
    updateInfo += sAmen;
    updateInfo += "bed_count=" + document.getElementById("numOfBeds").value + ",";
    updateInfo += "bath_count=" + document.getElementById("numOfBaths").value + "";
    console.log(updateInfo);
    xhr.open("GET", baseurl + "/custom?sql=update public.property " + updateInfo + " where id=" + propertyID + ";", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            alert("Property Information Has Been Updated");
        } else if (xhr.status === 400) {
            document.getElementById("intro").innerHTML = '<a href="employee_login.html">SERVER ERROR, GO BACK</a>';
        }
    };
    xhr.send();
}