const movies = countries.map(c => {

let existing = movieData.find(m => m.code === c.code)

return existing || {
country:c.name,
code:c.code,
movie:"",
link:"",
stream:"",
poster:"",
rating:0,
review:"",
watched:false
}

})

let watchedCountries={}
let tbody=document.getElementById("movieBody")

movies.forEach(m=>{

let stars = m.watched
? "★".repeat(m.rating) + "☆".repeat(5-m.rating)
: "-"

let watchIcon = m.watched ? "✅" : "❌"

let streamLink = m.stream
? `<a class="streamLink" href="${m.stream}" target="_blank">${m.streamName || "Watch"}</a>`
: "-"

let poster = m.poster
? `<img class="poster" src="${m.poster}">`
: "-"

let movieTitle = m.movie
? `<a href="${m.link}" target="_blank">${m.movie}</a>`
: "—"

let row=document.createElement("tr")
row.dataset.country=m.code

row.innerHTML=`

<td>
<div class="countryCell">
<img class="flag" src="https://flagcdn.com/w40/${m.code.toLowerCase()}.png">
<span>${m.country}</span>
</div>
</td>

<td>
<div class="movieCell">
${poster}
<span>${movieTitle}</span>
</div>
</td>

<td class="stars">${stars}</td>

<td>${m.watched ? m.review : "-"}</td>

<td>${streamLink}</td>

<td class="watched">${watchIcon}</td>
`

tbody.appendChild(row)

if(m.watched){
watchedCountries[m.code]=m.movie
}

})

let rows = tbody.querySelectorAll("tr")

let map = new jsVectorMap({

selector:"#map",
map:"world",

zoomButtons:false,
zoomOnScroll:false,

regionStyle:{
initial:{fill:"#d3d3d3"}
},

series:{
regions:[{
values:watchedCountries,
attribute:"fill",
scale:{
"default":"#4CAF50"
}
}]
},

onRegionTooltipShow:function(e,tooltip,code){

if(watchedCountries[code]){
tooltip.text(tooltip.text()+" 🎬 "+watchedCountries[code])
}

},

onRegionClick:function(event,code){

rows.forEach(row=>{
row.style.display = row.dataset.country===code ? "" : "none"
})

document.querySelector("table").scrollIntoView({
behavior:"smooth"
})

}

})

let total = movies.length
let watched = movies.filter(m=>m.watched).length

document.getElementById("progress").innerText =
"🎬 Movies watched: "+watched+" / "+total

document.getElementById("progressFill").style.width =
(watched/total*100)+"%"

let topMovies=[...movies]
.filter(m=>m.watched)
.sort((a,b)=>b.rating-a.rating)
.slice(0,5)

topMovies.forEach(m=>{

let li=document.createElement("li")
li.innerText=`${m.movie} (${m.rating}⭐)`
document.getElementById("topMovies").appendChild(li)

})

let searchInput=document.getElementById("searchInput")

searchInput.addEventListener("keyup",function(){

let value=this.value.toLowerCase()

rows.forEach(row=>{

let country=row.cells[0].innerText.toLowerCase()
let movie=row.cells[1].innerText.toLowerCase()

row.style.display =
(country.includes(value)||movie.includes(value)) ? "" : "none"

})

})

document.getElementById("sortSelect").addEventListener("change",function(){

let rowsArray=[...rows]

if(this.value==="country"){
rowsArray.sort((a,b)=>
a.cells[0].innerText.localeCompare(b.cells[0].innerText))
}

if(this.value==="rating"){
rowsArray.sort((a,b)=>{

let r1=(a.cells[2].innerText.match(/★/g)||[]).length
let r2=(b.cells[2].innerText.match(/★/g)||[]).length

return r2-r1
})
}

rowsArray.forEach(row=>tbody.appendChild(row))

})

document.getElementById("resetBtn").onclick=function(){

searchInput.value=""

rows.forEach(row=>{
row.style.display=""
})

}
