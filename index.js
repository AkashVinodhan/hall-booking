const express = require("express");
const app = express();

const { v4: uuidv4 } = require("uuid");

app.use(express.json());
app.listen(5000, () => console.log("Server running on port 5000"));

// variables to store data

// create a few rooms to allow bookings
let rooms = [
  {
    roomId: 1,
    seats: 2,
    amenities: ["TV", "AC"],
    price: 2500,
    bookings: {},
  },
  {
    roomId: 2,
    seats: 5,
    amenities: ["TV", "AC"],
    price: 5500,
    bookings: {},
  },
  {
    roomId: 3,
    seats: 3,
    amenities: ["TV", "AC", "Heater"],
    price: 4500,
    bookings: {},
  },
];
let roomId = 4;
let bookings = [];

//* endpoint to home page
app.get("/", (req, res) => {
  res.status(200).send({ message: "Home Page" });
});

//* enpoint to create a room

app.post("/createroom", (req, res) => {
  const { seats, amenities, price } = req.body;
  let newRoom = { roomId, seats, amenities, price, bookings: {} };
  res.status(200).send({ message: "New Room created", data: newRoom });
  rooms = [...rooms, newRoom]; // add room to existing rooms
  roomId++;
});

//* get all rooms
app.get("/rooms", (req, res) => {
  res.status(200).send({ data: rooms });
});

// * get all rooms with bookings

app.get("/bookedRooms", (req, res) => {
  let bookedRooms = rooms.filter(
    ({ bookings }) => Object.keys(bookings).length >= 1 //check if bookings exist for a room
  );
  res.status(200).send({ data: bookedRooms });
});

//* book a room

app.post("/newBooking", (req, res) => {
  const { customerName, date, startTime, endTime, room_id } = req.body;
  // check if all properties exist
  if (customerName && date && startTime && endTime && room_id) {
    const regex = new RegExp(
      "^(3[01]|[12][0-9]|0[1-9])/(1[0-2]|0[1-9])/[0-9]{4}$"
    );
    let match = regex.test(date);
    //check if date is in the right format
    if (!match) {
      res
        .status(400)
        .send({ error: "Enter date as string in dd/mm/yyyy format" });
      return;
    }
    let newBooking = {
      bookingId: uuidv4(),
      room_id,
      customerName,
      date,
      startTime,
      endTime,
    };

    let room = rooms.filter(({ roomId }) => roomId == room_id)[0];
    if (!room) {
      res.status(400).send({
        error: "Entered room id doesn't exist. Kindly select existing room-id",
      });
      return;
    }
    //* to check if the room has other bookings on the same date
    if (Object.keys(room.bookings).includes(date)) {
      res.status(400).send({
        error:
          "The room is not available for the selected date. Choose another room or a different date",
      });
    } else {
      bookings = [...bookings, newBooking]; // add booking to existing bookings
      room.bookings = {
        ...room.bookings,
        [date]: {
          customerName,
          startTime,
          endTime,
        },
      }; // *add booking details to the room
      res
        .status(200)
        .send({ message: "Booking confirmed!", details: newBooking });
    }
  } else {
    res.status(400).send({ error: "Kindly enter all the required details" });
  }
});

//* get all bookings

app.get("/bookings", (req, res) => {
  res.status(200).send(bookings);
});

//* get bookings of a paticular customer

app.get("/bookings/:customerName", (req, res) => {
  const { customerName } = req.params;
  let allBookings = bookings.filter(
    (booking) =>
      booking.customerName.toLowerCase() == customerName.toLowerCase()
  );
  if (allBookings.length <= 0) {
    res
      .status(400)
      .send({ error: `No bookings under the name ${customerName}` });
    return;
  }
  res.status(200).send({
    customerName,
    bookingsCount: allBookings.length,
    details: allBookings,
  });
});
