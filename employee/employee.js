var employeeID;
var baseurl = "https://best-airbnb.herokuapp.com";

function onCreate() {

    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    employeeID = vars.employee_id;
    sqlRequest(employeeID);
}
function manageProp() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    var propID = document.getElementById("property_id").value;
    window.location.href = "employee_manage.html?employee_id=" + employeeID + "&property_id=" + propID;
}

function sqlRequest(sqlQ) {


    var xhr = new XMLHttpRequest();
    xhr.open("GET", baseurl + "/custom?sql=select first_name, last_name, country, salary from public.employee inner join works_at on employee.id=works_at.employee_id where id=" + sqlQ, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var results = JSON.parse(xhr.responseText);
            if (results.length === 0) {
                document.getElementById("intro").innerHTML = '<a href="employee_login.html">Employee Does Not Exist, Go Back</a>';
            } else {
                document.getElementById("intro").innerHTML = "<h2>Welcome back, " + results[0].first_name + " " + results[0].last_name + " ($" + results[0].salary + "/Year)" + "</h2>";
                var employeeCountry = results[0].country.toLowerCase();

                var xhr3 = new XMLHttpRequest();
                xhr3.open("GET", baseurl + "/custom?sql=select * from public.property where id not in (select property_id from public.prop_manage) and country='" + employeeCountry + "' order by id", true);
                xhr3.onreadystatechange = function () {
                    if (xhr3.readyState === 4 && xhr3.status === 200) {
                        var results2 = JSON.parse(xhr3.responseText);
                        if (results2.length > 0) {
                            results2.forEach(function (post) {
                                let card = document.createElement('div');
                                card.className = 'card w-100 mb-2 text-white bg-danger';
                                let cardBody = document.createElement('div');
                                cardBody.className = 'card-body';
                                let title = document.createElement('h5');
                                title.innerText = 'Property ID: ' + post.id;
                                title.className = 'card-title';

                                let para = document.createElement('p');
                                para.className = 'card-text';
                                para.innerText = 'Address: ' + post.house_num + ' ' + post.street + ' ' + post.city + ' ' + post.province;
                                let para2 = document.createElement('p');
                                para2.className = 'card-text';
                                para2.innerText = 'Rate: ' + post.rate;
                                cardBody.appendChild(title);
                                cardBody.appendChild(para);
                                cardBody.appendChild(para2);
                                card.appendChild(cardBody);
                                document.getElementById('UnclaimedProps').appendChild(card);
                            });
                        } else {
                            document.getElementById("unclaimed-header").innerText = 'All Properties In ' + results[0].country + ' Are Under Management';
                            document.getElementById("submitClaim").disabled = true;
                        }
                    } else if (xhr3.status === 400) {
                        document.getElementById("UnclaimedProps").innerHTML = '<a href="employee_login.html">SERVER ERROR, GO BACK</a>';

                    }
                };
                xhr3.send();
            }


        } else if (xhr.status === 400) {
            document.getElementById("props").innerHTML = '<a href="employee_login.html">SERVER ERROR, GO BACK</a>';

        }
    };
    xhr.send();
    var xhr2 = new XMLHttpRequest();
    xhr2.open("GET", baseurl + "/custom?sql=select property_id from public.prop_manage where employee_id=" + sqlQ, true);
    xhr2.onreadystatechange = function () {
        if (xhr2.readyState === 4 && xhr2.status === 200) {

            var results = JSON.parse(xhr2.responseText);
            if (results.length > 0) {
                results.forEach(function (post) {
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", baseurl + "/custom?sql=select * from public.property where id=" + post.property_id + " order by id", true);
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            var propDetails = JSON.parse(xhr.responseText);
                            let card = document.createElement('div');
                            card.className = 'card w-100 mb-2 text-white bg-success';
                            let cardBody = document.createElement('div');
                            cardBody.className = 'card-body';
                            let title = document.createElement('h5');
                            title.innerText = 'Property ID: ' + post.property_id;
                            title.className = 'card-title';

                            let para = document.createElement('p');
                            para.className = 'card-text';
                            para.innerText = 'Address: ' + propDetails[0].house_num + ' ' + propDetails[0].street + ' ' + propDetails[0].city + ' ' + propDetails[0].province;
                            let para2 = document.createElement('p');
                            para2.className = 'card-text';
                            para2.innerText = 'Rate: ' + propDetails[0].rate;
                            cardBody.appendChild(title);
                            cardBody.appendChild(para);
                            cardBody.appendChild(para2);
                            card.appendChild(cardBody);
                            document.getElementById('props').appendChild(card);

                        } else if (xhr.status === 400) {
                            document.getElementById("props").innerHTML = '<a href="employee_login.html">SERVER ERROR, GO BACK</a>';

                        }
                    };
                    xhr.send();
                });


            } else {
                document.getElementById("props").innerHTML = "No Properties Under Management";
            }
        } else if (xhr2.status === 400) {
            document.getElementById("props").innerHTML = '<a href="employee_login.html">SERVER ERROR, GO BACK</a>';

        }
    };
    xhr2.send();

}


function claimProp() {

    var claimPropID = document.getElementById("property_id_claim").value;
    console.log(claimPropID);


    var xhr = new XMLHttpRequest();
    xhr.open("GET", baseurl + "/custom?sql=insert into public.prop_manage (property_id, employee_id) values (" + claimPropID + "," + employeeID + ")", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            alert("Property Is Now Under Your Management");
        } else if (xhr.status === 400) {
            alert("Property Does Not Exist");
        }
    };
    xhr.send();
    location.reload();
}
