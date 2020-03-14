function sendQ() {
    var baseurl = "https://best-airbnb.herokuapp.com";
    var sqlQ = document.getElementById("sqlq").value;
    sqlQ = sqlQ.replace(/\n/g," ");
    if (sqlQ.length > 0){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", baseurl + "/custom?sql=" + sqlQ, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var results = JSON.parse(xhr.responseText);
                console.log(results)

                //main table content we fill from data from the rest call
                var main = "";
                for( let attr in results[0]){
                    main+= "<th> "+attr+" </th>"
                }
                for (i = 0; i < results.length; i++) {
                    main += "<tr>"
                    for( let attr in results[0]){
                        main+= "<th> "+results[i][attr]+" </th>"
                    }
                    main += "</tr>";
                }
                var tbl = "<table>"+main + "</table>";
                document.getElementById("personinfo").innerHTML = tbl;
            } else if(xhr.status === 400){
                alert("Invalid SQL Request") ;
                document.getElementById("sqlq").value = "";
                return false;
            }
        };
        xhr.send();
    }else{
        alert("SQL Command Cannot Be Empty") ;
    }
  
}

function clear(){
    document.getElementById("personinfo").innerHTML = " ";
}
