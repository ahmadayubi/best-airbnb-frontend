const formPropertyName = document.getElementById('property-name');
const formRatingCleanliness = document.getElementById('rating-cleanliness');
const formRatingCommunication = document.getElementById('rating-communication');
const formRatingValue = document.getElementById('rating-value');
const formRatingFinal = document.getElementById('rating-final');
let guestID;
let props;
let propsToReview;
let currentPropIDToReview;

window.onload = function () {
  // Get user ID from URL params 
  let vars = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value;
  });
  guestID = vars.guest_id;
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
      props = properties;
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
          <td>
            <button
              type='button'
              class='btn btn-sm btn-outline-success'
              onClick='openReviewModal(${p.id})'
            >
              Add/edit Review
            </button>
          </td>
        </tr>`;
        newRow = recordsTable.insertRow(recordsTable.rows.length);
        newRow.innerHTML = record;
      });
    })
    .catch(err => console.log(err));;

  // Get propsToReview
  const queryPropsToReviews = `
    SELECT property_id, review_id, communication, cleanliness, value
    FROM public.property_review p
    JOIN public.review r
    ON p.review_id = r.id
    WHERE p.guest_id=${guestID}
  `;
  fetch(`${url}/custom?sql=${queryPropsToReviews}`)
    .then(res => handleResponse(res))
    .then(pToR => propsToReview = pToR);
}

function openReviewModal(propertyID) {
  currentPropIDToReview = propertyID;
  resetReviewForm();
  $('#reviewModal').modal('show');
  let p = props.find(p => +p.id === propertyID);
  let propToReview = propsToReview.find(p => +p.property_id === propertyID)
  formPropertyName.innerHTML = `${p.house_num} ${p.street} ${p.city}, ${p.province}, ${p.country}`;

  if (propToReview) {
    formRatingValue.value = propToReview.value;
    formRatingCleanliness.value = propToReview.cleanliness;
    formRatingCommunication.value = propToReview.communication;
  }
}

// TODO: either insert or update
function submitReview() {
  // check if review already existed (so just update it)
  const existingReview = propsToReview.find(p => +p.property_id === currentPropIDToReview)
  if (existingReview) {
    console.log(existingReview);
    const reviewID = existingReview.review_id;
    const communication = +formRatingCommunication.value;
    const cleanliness = +formRatingCleanliness.value;
    const value = +formRatingValue.value;

    const queryUpdateReview = `
    UPDATE public.review
    SET
      communication=${communication},
      cleanliness=${cleanliness},
      value=${value}
    WHERE id=${reviewID}
    `;

    const url = 'https://best-airbnb.herokuapp.com'
    fetch(`${url}/custom?sql=${queryUpdateReview}`)
      .then(res => {
        if (res.ok) {
          const i = propsToReview.findIndex(p => +p.property_id === currentPropIDToReview);
          propsToReview[i].communication = communication;
          propsToReview[i].cleanliness = cleanliness;
          propsToReview[i].value = value;
          showSuccessBooking();
        }
        else {
          showErrorBooking("A server-side error occurred when updating your review.");
        };
      });

    // else create new review
  } else {
    const reviewID = getRandomID();
    const communication = +formRatingCommunication.value;
    const cleanliness = +formRatingCleanliness.value;
    const value = +formRatingValue.value;

    const review = { id: reviewID, communication, cleanliness, value }
    const propToReview = { guestID, propertyID: currentPropIDToReview, reviewID }

    console.log(review);
    console.log(propToReview);

    // create queries
    const queryCreateReview = `
    INSERT INTO public.review
    VALUES
    (
      ${review.id},
      ${review.communication},
      ${review.cleanliness},
      ${review.value}
    )`;

    const queryCreatePropToReview = `
    INSERT INTO public.property_review
    VALUES
    (
      ${propToReview.guestID},
      ${propToReview.propertyID},
      ${propToReview.reviewID}
    )`;

    const url = 'https://best-airbnb.herokuapp.com'
    fetch(`${url}/custom?sql=${queryCreateReview}`)
      .then(res => {
        if (res.ok) return fetch(`${url}/custom?sql=${queryCreatePropToReview}`);
        else {
          showErrorBooking("A server-side error occurred when submitting your review.");
        };
      })
      .then(res => {
        if (res.ok) {
          const newPropToReview = { property_id: currentPropIDToReview, reviewID, communication, cleanliness, value }
          propsToReview.push(newPropToReview);
          showSuccessBooking();
        }
        else {
          showErrorBooking("A server-side error occurred when submitting your review.");
        };
      });
  }
}

function resetReviewForm() {
  hideErrorBooking();
  hideSuccessBooking();
  formRatingCleanliness.value = 0;
  formRatingCommunication.value = 0;
  formRatingValue.value = 0;
}

function showErrorBooking(errorMsg) {
  document.getElementById('message-review').innerText = errorMsg;
  document.getElementById('message-review').style.display = "block";
}

function hideErrorBooking() {
  document.getElementById('message-review').style.display = "none";
}

function showSuccessBooking() {
  document.getElementById('message-success').style.display = 'block';
}

function hideSuccessBooking() {
  document.getElementById('message-success').style.display = 'none';
}

function getRandomID() {
  return Math.floor(Math.random() * 100000);
}

function handleResponse(res) {
  if (res.ok) return res.json();
  else console.log(res);
}
