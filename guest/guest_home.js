window.onload = function () {
  // Get user ID from URL params 
  let vars = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value;
  });
  const guestID = vars.guest_id;
  document.getElementById('guest-id').value = guestID;

  // TODO: add querying endpoints for guest, booking, and property

  // Get guest data
  const url = 'https://best-airbnb.herokuapp.com'
  fetch(`${url}/guests/${guestID}`)
    .then(res => handleResponse(res))
    .then(data => {
      if (data.length == 0) {
        let warningMsg = document.getElementById('message');
        warningMsg.innerHTML = `Guest with id=${guestID} does not exist.`;
        warningMsg.style.display = 'block';
      } else {
        return data[0]
      }
    })
    .then(guest => {
      document.getElementById('welcome-msg').innerHTML = `Welcome ${guest.first_name} ${guest.last_name}!`;
    })
    .catch(err => console.log(err));

  // Get bookings
  const queryBookings = `SELECT * FROM public.booking WHERE guest_id=${guestID}`
  fetch(`${url}/custom?sql=${queryBookings}`)
    .then(res => handleResponse(res))
    .then(bookings => {
      // console.log(bookings)

      // Get properties related to bookings
      const bookingIDs = bookings.map(b => b.property_id);
      return Promise.all([bookings, fetch(`${url}/properties?ids=[${bookingIDs}]`)]);
    })
    .then(([bookings, propertiesRes]) => {
      return this.Promise.all([bookings, handleResponse(propertiesRes)]);
    })
    .then(([bookings, properties]) => {
      // Populate table
      console.log(bookings)
      const recordsTable = document.querySelector('tbody');
      let record = '',
        newRow = '';
      bookings.forEach(b => {
        let p = properties.find(p => p.id === b.property_id);
        let start_date = new Date(b.start_date).toISOString().split("T")[0];
        let end_date = new Date(b.end_date).toISOString().split("T")[0];

        record = `
        <tr>
          <th scope="row">${b.booking_id}</th>
          <td>${p.house_num} ${p.street} ${p.city}, ${p.province}, ${p.country}</td>
          <td>${p.rate}</td>
          <td>${p.description}</td>
          <td>${start_date}</td>
          <td>${end_date}</td>
          <td><input type='button' class='btn btn-sm btn-outline-success' value='Add a review'></td>
        </tr>`;
        newRow = recordsTable.insertRow(recordsTable.rows.length);
        newRow.innerHTML = record;
      });
    })
    .catch(err => console.log(err));;
}

function handleResponse(res) {
  if (res.ok) return res.json();
  else console.log(res);
}
