const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { error } = require("console");
const { listingSchema } = require("./schema.js");
const Review = require("./models/review.js");

const app = express();

main()
  .then(() => {
    console.log("connected to wanderlust database");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://localhost:27017/wanderlust");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.redirect("/listings");
});

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let erMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, erMsg);
  } else {
    next();
  }
};

//Index Route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const { q } = req.query;
    let filter = {};
    if (q && q.trim() !== "") {
      const regex = new RegExp(q.trim(), "i");
      filter = {
        $or: [
          { title: regex },
          { location: regex },
          { country: regex },
          { description: regex },
        ],
      };
    }
    const allListings = await Listing.find(filter);
    res.render("./listings/index.ejs", { allListings, searchQuery: q || "" });
  }),
);

//new rout
app.get(
  "/listings/new",
  wrapAsync((req, res) => {
    res.render("listings/new.ejs");
  }),
);

//Show Route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("./listings/show.ejs", { listing });
  }),
);

//edit rout
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", { listing });
  }),
);
//update
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect("/listings");
  }),
);

//delete rout
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log("delete");
    res.redirect("/listings");
  }),
);

//create rout
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    // console.log(listing);
    await newListing.save();
    res.redirect("/listings");
  }),
);

//reviews
app.post("/listings/:id/reviews", wrapAsync(async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  console.log("new review saved");
  res.redirect(`/listings/${req.params.id}`);
}));

// app.get("/testListing",async (req, res)=>{
//     let sampleListing = new Listing({
//         title: "My new villa",
//         description: "by the beach",
//         price: 1200,
//         location: "Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("Sucessfull")
// });

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { err });
  //   res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("Server running at http://localhost:8080");
});
