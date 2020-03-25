const countryHeader = document.getElementById('country-header');
const messageProperties = document.getElementById('message-properties');
const messageBooking = document.getElementById('message-booking');
const recordsTable = document.querySelector('tbody');
const formBookingStartDate = document.getElementById('start-date');
const formBookingEndDate = document.getElementById('end-date');
const formPaymentMethod = document.getElementById('payment-method');
const formAgreeTerms = document.getElementById('agreeToTerms');
let guestID;
let country;
let properties;
let currentPropertyID;
let currentTotalPrice;

window.onload = function () {
  // Get user ID from URL params 
  let vars = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value;
  });

  guestID = vars.guestID;
  country = vars.country.split("+").join(" ");
  countryHeader.innerHTML = `Properties in ${country}`;

  // Get properties data
  const url = 'https://best-airbnb.herokuapp.com'
  const query = `SELECT * FROM public.property WHERE country='${country}' ORDER BY id`
  fetch(`${url}/custom?sql=${query}`)
    .then(res => handleResponse(res))
    .then(props => {
      if (props.length === 0) {
        messageProperties.style.display = "block";
        return;
      }

      properties = props.map(p => {
        p.id = +p.id;
        p.bed_count = +p.bed_count;
        p.bath_count = +p.bath_count;
        return p;
      });
      let record = '',
        newRow = '';
      props.forEach(p => {
        record = `
        <tr>
          <th scope="row">${p.id}</th>
          <td>${p.house_num} ${p.street} ${p.city}, ${p.province}, ${p.country}</td>
          <td>${p.rate}</td>
          <td>${p.description}</td>
          <td>${p.amenities}</td>
          <td>${p.bed_count}</td>
          <td>${p.bath_count}</td>
          <td>${p.room_type}</td>
          <td>
            <button
              type='button'
              class='btn btn-sm btn-outline-success'
              onClick='bookingConfirmation(${p.id})'
            >
              Book
            </button>
          </td>
        </tr>`;
        newRow = recordsTable.insertRow(recordsTable.rows.length);
        newRow.innerHTML = record;
      });
    })
    .catch(err => console.log(err));
}

function bookingConfirmation(propertyID) {
  currentPropertyID = propertyID;
  const property = properties.find(p => p.id === propertyID);
  const url = 'https://best-airbnb.herokuapp.com'
  const query = `
    SELECT *
    FROM public.rental_property r
    JOIN public.agreement a
    ON r.agreement_id = a."ID"
    WHERE r.property_id=${propertyID}
  `;

  fetch(`${url}/custom?sql=${query}`)
    .then(res => handleResponse(res))
    .then(agreement => {
      let hasAgreement = agreement.length !== 0;

      if (hasAgreement) {
        agreement = agreement[0];
        const minDate = new Date(agreement.start_date).toISOString().split("T")[0];
        const maxDate = new Date(agreement.end_date).toISOString().split("T")[0];

        document.getElementById('available-dates').innerText = `Available Dates:\n${minDate} to ${maxDate}`;
        document.getElementById('rate').innerText = `Rate: ${property.rate}`;

        formBookingStartDate.setAttribute("min", minDate);
        formBookingStartDate.setAttribute("max", maxDate);
        formBookingEndDate.setAttribute("min", minDate);
        formBookingEndDate.setAttribute("max", maxDate);

        resetBookingForm();
        hideErrorBooking();
        $('#bookingModal').modal('show');
      } else {
        $('#noAgreementModal').modal('show');
      }

    });

}

function bookCurrentProperty() {
  const startDate = formBookingStartDate.value;
  const endDate = formBookingEndDate.value;
  // check if form has been filled
  if (!startDate || !endDate) {
    showErrorBooking("Please select your booking dates.");
  } else if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
    showErrorBooking("Please select a valid date range.");
  } else if (!formAgreeTerms.checked) {
    showErrorBooking("You must agree to the terms and conditions to continue.");
  } else {
    hideErrorBooking();
    // create payment
    const paymentID = getRandomID();
    const status = "pending";
    const type = formPaymentMethod.value;
    const payment = { id: paymentID, amount: "$" + currentTotalPrice, status, type };

    // create booking
    const bookingID = getRandomID();
    const propertyID = currentPropertyID;
    const booking = { id: bookingID, paymentID, guestID, propertyID, endDate, startDate };

    // create queries
    const queryCreatePayment = `
      INSERT INTO public.payment
      VALUES
      (
        ${payment.id},
        '${payment.amount}',
        '${payment.status}',
        '${payment.type}'
      )`;
    const queryCreateBooking = `
      INSERT INTO public.booking
      VALUES
      (
        ${booking.id},
        ${booking.paymentID},
        ${booking.guestID},
        ${booking.propertyID},
        '${booking.endDate}',
        '${booking.startDate}'
      )`;

    const url = 'https://best-airbnb.herokuapp.com'
    fetch(`${url}/custom?sql=${queryCreatePayment}`)
      .then(res => {
        if (res.ok) return fetch(`${url}/custom?sql=${queryCreateBooking}`);
        else {
          showErrorBooking("A server-side error occurred when creating your payment.");
        };
      })
      .then(res => {
        if (res.ok) {
          showSuccessBooking();
          setTimeout(() => window.location.replace(`/guest/guest_home.html?guest_id=${guestID}`), 3000);
        }
        else {
          showErrorBooking("A server-side error occurred when creating your payment.");
        };
      })
  }
}

function onDateChange() {
  if (!formBookingEndDate.value || !formBookingStartDate) {
    document.getElementById('payment-amount').innerText = '';
    return;
  }
  const startDate = moment(new Date(formBookingStartDate.value));
  const endDate = moment(new Date(formBookingEndDate.value));
  const duration = endDate.diff(startDate, "days") + 1;

  if (duration <= 0) {
    document.getElementById('payment-amount').innerText = '';
  } else {
    const rateString = properties.find(p => p.id === currentPropertyID).rate;
    const totalPrice = Number(rateString.replace(/[^0-9.-]+/g, "")) * duration;
    currentTotalPrice = totalPrice;

    document.getElementById('payment-amount').innerText = `Total price: ${rateString} * ${duration} days = $${totalPrice}`;
  }
}

function resetBookingForm() {
  formBookingStartDate.value = "";
  formBookingEndDate.value = "";
  formAgreeTerms.checked = false;
  document.getElementById('payment-amount').innerText = '';
}

function showErrorBooking(errorMsg) {
  messageBooking.innerText = errorMsg;
  messageBooking.style.display = "block";
}

function hideErrorBooking() {
  messageBooking.style.display = "none";
}

function showSuccessBooking() {
  document.getElementById('message-success').style.display = 'block';
}

function getRandomID() {
  return Math.floor(Math.random() * 100000);
}

function handleResponse(res) {
  if (res.ok) return res.json();
  else console.log(res);
}
