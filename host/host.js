var baseurl = "https://best-airbnb.herokuapp.com";
var vars = {};
var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value;
});
var host_id = vars.host_id;


// TO DO - fix rates, update agreement column to be char[], nested callbacks in host_property, amenities are hardcoded rn


getPropertyType();


function addRentalProperty(prop_id, agreement_id) {
    query = "INSERT INTO public.rental_property VALUES(" + host_id + ", " + agreement_id + ", " + prop_id + ")";
    console.log(query);

    var xhr = new XMLHttpRequest();
    xhr.open("GET", baseurl + "/custom?sql=" + query, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {} else if (xhr.status === 400) {
            return false;
        }
    };
    xhr.send();
}

function addPropertyAgreement(prop_id) {
    var data = {};
    var query;
    $("#message2").hide();

    var xhr = new XMLHttpRequest();
    var tableCount = 0;
    xhr.open("GET", baseurl + "/custom?sql=SELECT COUNT(*) FROM public.agreement", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var results = JSON.parse(xhr.responseText);
            tableCount = results[0]['count'];

            data.id = parseInt(tableCount) + 1;
            data.startDate = document.getElementById("startDate").value;
            data.endDate = document.getElementById("endDate").value;
            // data.agreement = document.getElementById("propAgreementFile").value;


            query = "INSERT INTO public.agreement VALUES(" + data.id + ", '" + data.startDate + "', '" +
                data.endDate + "', ARRAY['t'])";

            var xhr2 = new XMLHttpRequest();
            xhr2.open("GET", baseurl + "/custom?sql=" + query, true);
            xhr2.onreadystatechange = function() {
                if (xhr2.readyState === 4 && xhr2.status === 200) {

                    document.getElementById("message2").innerHTML = "Property agreement added!";
                    $("#message2").removeClass("alert-danger").addClass("alert-success");
                    $("#message2").show();

                    addRentalProperty(prop_id, data.id);

                } else if (xhr2.status === 400) {
                    document.getElementById("message2").innerHTML = "Invalid SQL Request";
                    $("#message2").removeClass("alert-success").addClass("alert-danger");
                    $("#message2").show();
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


function setRateRange() {
    var propType = document.getElementById("propertyType").value;

    console.log('SELECT min_price, max_price FROM public.property_type WHERE type="' + propType + '"');

    var xhr = new XMLHttpRequest();
    xhr.open("GET", baseurl + "/custom?sql=SELECT min_price, max_price FROM public.property_type WHERE type='" + propType + "'", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var results = JSON.parse(xhr.responseText);
            console.log(results);

            // $('#ratePerNight').attr({
            //     'min': results[0]['min_price'],
            //     'max': results[0]['max_price']
            // });

        } else if (xhr.status === 400) {
            $('#ratePerNight').attr({
                'min': 0,
            });
            return false;
        }
    };
    xhr.send();
}


function getPropertyType() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", baseurl + "/custom?sql=SELECT min_price, max_price, type FROM public.property_type", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var results = JSON.parse(xhr.responseText);
            var propType = '';

            for (var i = 0; i < results.length; i++) {
                propType += '<option value="' + results[i]['type'] + '">' + results[i]['type'] + '</option>\n';
            }
            $('#propertyType').append(propType);

            console.log(results);
        } else if (xhr.status === 400) {
            return false;
        }
    };
    xhr.send();
}


function addProperty() {
    var data = {};
    var query;
    $("#message").hide();

    var xhr = new XMLHttpRequest();
    var tableCount = 0;
    xhr.open("GET", baseurl + "/custom?sql=SELECT COUNT(*) FROM public.property", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var results = JSON.parse(xhr.responseText);
            tableCount = results[0]['count'];

            // Get column values
            data.id = parseInt(tableCount) + 1;
            data.house_num = document.getElementById("streetNum").value;
            data.street = document.getElementById("street").value;
            data.city = document.getElementById("propertyCity").value;
            data.province = document.getElementById("propertyProvince").value;
            data.country = document.getElementById("country").value;
            data.description = document.getElementById("propertyDescription").value;
            data.rate = parseInt(document.getElementById("ratePerNight").value);
            data.bedCount = document.getElementById("numOfBeds").value;
            data.bathCount = document.getElementById("numOfBaths").value;

            var selectedRoomTypes = "'{";
            $("#roomType input:checkbox:checked").each(function() {
                selectedRoomTypes += $(this).val() + ','
            });
            data.roomTypes = selectedRoomTypes.replace(/,\s*$/, "") + "}'";

            var selectedAmenities = "'{";
            $("#amenities input:checkbox:checked").each(function() {
                selectedAmenities += $(this).val() + ','
            });
            data.amenities = selectedAmenities.replace(/,\s*$/, "") + "}'";

            // Query to insert new property record
            query = "INSERT INTO public.property VALUES(" + data.id + ", '" + data.house_num + "', '" +
                data.street + "', '" + data.city + "', '" + data.province + "', '" + data.country + "', " + data.rate + ", '" +
                data.description + "', " + data.amenities + ", " + data.bedCount + ", " + data.bathCount + ', ' +
                data.roomTypes + ")";

            var xhr2 = new XMLHttpRequest();
            xhr2.open("GET", baseurl + "/custom?sql=" + query, true);
            xhr2.onreadystatechange = function() {
                if (xhr2.readyState === 4 && xhr2.status === 200) {

                    document.getElementById("message").innerHTML = "Property added!";
                    $("#message").removeClass("alert-danger").addClass("alert-success");
                    $("#message").show();
                    addPropertyAgreement(data.id);

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