/* ---------- PREPARE MOVIE DATA ---------- */

const movieLookup = Object.fromEntries(
movieData.map(m => [m.code, m])
)

const movies = countries.map(c => {

let existing = movieLookup[c.code]

return existing || {
country: c.name,
code: c.code,
movie: "",
link: "",
stream: "",
streamName: "",
poster: "",
rating: 0,
review: "",
watched: false
}

})


/* ---------- DOM REFERENCES ---------- */

const tbody = document.getElementById("movieBody")
const movieTable = document.querySelector(".movieTable")

let watchedCountries = {}

function getRows(){
return [...tbody.querySelectorAll("tr")]
}


/* ---------- HELPER FUNCTIONS ---------- */

function getStars(rating, watched){

if(!watched) return "-"

let colorClass = "stars0"

if(rating === 1) colorClass = "stars1"
if(rating === 2) colorClass = "stars2"
if(rating === 3) colorClass = "stars3"
if(rating === 4) colorClass = "stars4"
if(rating === 5) colorClass = "stars5"

let stars = "★".repeat(rating) + "☆".repeat(5-rating)

return `<span class="${colorClass}">${stars}</span>`
}

/* ---------- BUILD TABLE ---------- */

movies.forEach(m => {

let stars = getStars(m.rating, m.watched)

let watchIcon = m.watched ? "✅" : "❌"

let streamLink = m.stream
? `<a class="streamLink" href="${m.stream}" target="_blank" rel="noopener">${m.streamName || "Watch"}</a>`
: "-"

let poster = m.poster
? `<img class="poster" src="${m.poster}" alt="${m.movie || 'Movie poster'}">`
: "-"

let movieTitle = m.movie
? `<a href="${m.link}" target="_blank" rel="noopener">${m.movie}</a>`
: "—"

let row = document.createElement("tr")

row.dataset.country = m.code
row.dataset.countryName = (m.country || "").toLowerCase()
row.dataset.movieName = (m.movie || "").toLowerCase()
row.dataset.rating = m.rating

row.innerHTML = `

<td data-label="Country">
<div class="countryCell">
<img class="flag" src="https://flagcdn.com/w40/${m.code.toLowerCase()}.png">
<span>${m.country}</span>
</div>
</td>

<td data-label="Movie">
<div class="movieCell">
${poster}
<span>${movieTitle}</span>
</div>
</td>

<td class="stars" data-label="Rating">${stars}</td>

<td class="reviewCol" data-label="Review">${m.watched ? m.review : "-"}</td>

<td data-label="Stream">${streamLink}</td>

<td class="watched" data-label="Watched">${watchIcon}</td>
`

tbody.appendChild(row)

if(m.watched){
watchedCountries[m.code] = m.movie
}

})


/* ---------- MAP ---------- */

let activeCountry = null

let map = new jsVectorMap({

selector: "#map",
map: "world",

zoomButtons: false,
zoomOnScroll: false,

regionStyle:{
initial:{ fill:"#d3d3d3" }
},

series:{
regions:[{
values:Object.fromEntries(
Object.keys(watchedCountries).map(c => [c,1])
),
scale:[ "#d3d3d3", "#4CAF50" ],
normalizeFunction:"linear"
}]
},

onRegionTooltipShow:function(e, tooltip, code){

if(watchedCountries[code]){
tooltip.text(tooltip.text() + " 🎬 " + watchedCountries[code])
}

},

onRegionClick:function(event, code){

activeCountry = activeCountry === code ? null : code

getRows().forEach(row => {

row.style.display =
!activeCountry || row.dataset.country === activeCountry
? ""
: "none"

})

movieTable.scrollIntoView({
behavior:"smooth"
})

}

})


/* ---------- PROGRESS ---------- */

let total = movies.length
let watched = movies.filter(m => m.watched).length

document.getElementById("progress").innerText =
"🎬 Movies watched: " + watched + " / " + total

document.getElementById("progressFill").style.width =
(watched / total * 100) + "%"


/* ---------- TOP MOVIES ---------- */

let topMovies = [...movies]
.filter(m => m.watched)
.sort((a,b) => b.rating - a.rating)
.slice(0,5)

topMovies.forEach(m => {

let li = document.createElement("li")
li.innerText = `${m.movie} (${m.rating}⭐)`

document.getElementById("topMovies").appendChild(li)

})


/* ---------- SEARCH ---------- */

let searchInput = document.getElementById("searchInput")

searchInput.addEventListener("keyup", function(){

let value = this.value.toLowerCase()

getRows().forEach(row => {

let country = row.dataset.countryName
let movie = row.dataset.movieName

row.style.display =
(country.includes(value) || movie.includes(value))
? ""
: "none"

})

})


/* ---------- SORT ---------- */

document.getElementById("sortSelect").addEventListener("change", function(){

let rowsArray = getRows()

if(this.value === "country"){

rowsArray.sort((a,b) =>
a.dataset.countryName.localeCompare(b.dataset.countryName)
)

}

if(this.value === "rating"){

rowsArray.sort((a,b) =>
b.dataset.rating - a.dataset.rating
)

}

rowsArray.forEach(row => tbody.appendChild(row))

})


/* ---------- RESET ---------- */

document.getElementById("resetBtn").onclick = function(){

searchInput.value = ""
activeCountry = null

getRows().forEach(row => {
row.style.display = ""
})

}
