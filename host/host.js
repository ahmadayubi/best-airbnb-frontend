function addProperty() {
    var baseurl = "https://best-airbnb.herokuapp.com";
    var data = {};
    var query;

    var xhr = new XMLHttpRequest();
    var tableCount = 0;
    xhr.open("GET", baseurl + "/custom?sql=SELECT COUNT(*) FROM public.property", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var results = JSON.parse(xhr.responseText);
            tableCount = results[0]['count'];


            data.id = parseInt(tableCount) + 1;
            data.house_num = document.getElementById("streetNum").value;
            data.street = document.getElementById("street").value;
            data.city = document.getElementById("propertyCity").value;
            data.province = document.getElementById("propertyProvince").value;
            data.country = document.getElementById("country").value;
            data.description = document.getElementById("propertyDescription").value;
            data.bedCount = document.getElementById("numOfBeds").value;
            data.bathCount = document.getElementById("numOfBaths").value;

            // do room type and rate
            data.rate = 100;
            data.roomType = null;
            data.amenities = null;

            query = "INSERT INTO public.property VALUES(" + data.id + ", '" + data.house_num + "', '" +
                data.street + "', '" + data.city + "', '" + data.province + "', '" + data.country + "', " + data.rate + ", '" +
                data.description + "', " + data.amenities + ", " + data.bedCount + ", " + data.bathCount + ', ' +
                data.roomType + ")";


            var xhr2 = new XMLHttpRequest();

            xhr2.open("GET", baseurl + "/custom?sql=" + query, true);
            xhr2.onreadystatechange = function() {
                if (xhr2.readyState === 4 && xhr2.status === 200) {
                    var results = JSON.parse(xhr2.responseText);

                    document.getElementById("message").innerHTML = "Property added!";
                    $("#message").removeClass("alert-danger").addClass("alert-success");
                    $("#message").show();

                } else if (xhr2.status === 400) {
                    document.getElementById("message").innerHTML = "Invalid SQL Request";
                    $("#message").removeClass("alert-success").addClass("alert-danger");
                    $("#message").show();
                    return false;
                }
            };
            xhr2.send();


        } else if (xhr.status === 400) {
            return false;
        }

    };

    xhr.send();
}


// Customize amenities
function getAmenities() {

    var baseurl = "https://best-airbnb.herokuapp.com";

    var xhr = new XMLHttpRequest();
    xhr.open("GET", baseurl + "/custom?sql=SELECT unnest(enum_range(NULL::amenities_type))::text", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var results = JSON.parse(xhr.responseText);
            console.log(results);
        } else if (xhr.status === 400) {
            return false;
        }
    };
    xhr.send();
}