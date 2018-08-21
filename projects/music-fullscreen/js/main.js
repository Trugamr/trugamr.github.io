var overlay = document.getElementById('grad-overlay');
var background = document.getElementById('container');
var artwork = document.getElementById('artwork');
var title = document.getElementById('title');
var artist = document.getElementById('artist');
var controls = document.getElementById('controls');
var seekbar = document.getElementById('progress-bar');

var lightVibrantColor = 'rgb(215, 43, 105)';
var backgroundImageUrl ='resources/images/backdrop_5.jpg';
//methods cant use this image when viewing file locally, file has to be viewed in a live server
var artworkUrl = 'resources/images/art_5.jpg';
var musicTitle = 'Cruel';
var musicArtist = 'Foxes';

function rgbToAlpha(rgbColor) {
    var rgbaColor;
    rgbaColor = rgbColor.replace(')', ', 0.8)');
    rgbaColor = rgbaColor.replace('rgb', 'rgba');
    return rgbaColor;
}

//changing background artist image
background.style = 'background: url(\' ' + backgroundImageUrl + ' \'); ';

//changing artwork
artwork.src = artworkUrl;

//changing title and artist
title.innerText = musicTitle;
artist.innerText = musicArtist;

//seeking
function seek(e) {
    this.seekbar.value = e.offsetX/e.target.clientWidth * 100; 
    // console.log(e);
}


//updating vibrant colors
function updateColors(extractedColors) {
    //copying Vibrant color values array
    if(extractedColors.Vibrant == undefined && extractedColors.LightVibrant != undefined) {
        var rgbValues = extractedColors.LightVibrant;
    } else if(extractedColors.LightVibrant == undefined && extractedColors.Vibrant == undefined) {
        var rgbValues = extractedColors.Muted;
    } else {
        var rgbValues = extractedColors.Vibrant;
    }
    //rgb values to usable rgb color string
    var rgbColor = 'rgb(' + rgbValues.rgb[0] + ', ' + rgbValues.rgb[1] + ', ' + rgbValues.rgb[2] + ')'
   
    //changing gradient color
    overlay.style = "background: linear-gradient(rgba(0,0,0,0.5) , rgba(30,30,30,0.66)," + rgbToAlpha(rgbColor) + ")";
    //adding 3d effct/multiple shadows to music controls
    controls.style = 'filter: drop-shadow(1px 1px 0px ' + rgbColor + ') drop-shadow(2px 2px 0px ' + rgbColor + ');' //drop-shadow(3px 3px 0px ' + testing[index].color + ');';
    //changing seebar bg color
    seekbar.style.background = rgbColor;
    //adding displaced colored background to artowkr using box-shadow
    artwork.style = 'box-shadow: 7px 7px 0px 0px rgba(0, 0, 0, 0.16), 14px 14px 0px ' + rgbColor + ';';
}

//extracting vibrant color from image ob load
artwork.setAttribute('crossOrigin', 'anonymous');
this.artwork.addEventListener('load', function() {
    var artwork = document.getElementById('artwork');    
    var vibrant = new Vibrant(artwork);
    var swatches = vibrant.swatches();
    console.log(swatches);        
    updateColors(swatches);
    // for (var swatch in swatches)
    //     if (swatches.hasOwnProperty(swatch) && swatches[swatch])
    //         console.log(swatch, swatches[swatch].getHex())
});


//search music function

function searchMusic() {
    var searchString = document.getElementById('search').value;
    var baseSearchUrl = 'https://musicbrainz.org/ws/2/';
    var releaseQuery = 'release/?query=release:';
    var responseFormat = '&fmt=json';

    //clearing result box
    var resultBox = document.getElementById('results');
    resultBox.innerHTML = '';

    var searchRequest = new XMLHttpRequest();
    searchRequest.open('GET', baseSearchUrl + releaseQuery + searchString.replace(" ", " AND ") + responseFormat);
    searchRequest.onload = function() {
        if(searchRequest.status == 200) {
            var respData = JSON.parse(searchRequest.responseText).releases;
        
            respData.forEach(release =>
                resultBox.innerHTML += `
                <div class="card" onclick="getAndUpdateInfo(event);" data-release_id="`+ release.id +`" data-title="`+ release.title +`" data-artist="`+ release["artist-credit"][0].artist.name +`" data-artist_id="` + release["artist-credit"][0].artist.id + `" >` + release.title + ` by ` + release["artist-credit"][0].artist.name + `</div>`);
            
            console.log(respData);
        }
    }
    searchRequest.send();
}



/*
//old dirty parsing xml
//search music
function searchMusic() {
    var searchString = document.getElementById('search').value;
    var baseSearchUrl = 'https://musicbrainz.org/ws/2/';
    var releaseQuery = 'release/?query=release:';
    var responseFormat = '&fmt=json';
    //emptying every search button click
    document.getElementById('results').innerHTML = "";

    var request = new XMLHttpRequest();
    request.open('GET', baseSearchUrl + releaseQuery + searchString + responseFormat);
    request.onload = function() {
        var respData = JSON.parse(request.responseText);
        var releases =  respData.getElementsByTagName('release');
        var artists =  respData.querySelectorAll('artist-credit > name-credit > artist > name');
        var artist_ids = respData.querySelectorAll('artist-credit > name-credit > artist');   
        var resultData = [];
        for(var i = 0; i < releases.length; i++) {
            var release_id = releases[i].getAttribute('id');
            var title = releases[i].childNodes[0].innerHTML;
            var artist = null , artist_id = null;
            
            if(respData.querySelectorAll('artist-credit > name-credit').length > 0) {
                artist = artists[i].innerHTML;
                artist_id = artist_ids[i].getAttribute('id');                
            }

            var obj = {
                release_id: release_id,
                title: title,
                artist_id: artist_id,
                artist: artist
            }
            resultData.push(obj);
        }
        //title releases[0].childNodes[0].innerHTML;
        console.log(resultData);
        //showing results
        var resultBox = document.getElementById('results');

        resultData.forEach(item =>
            resultBox.innerHTML += `
            <div class="card" onclick="getAndUpdateInfo(event);" data-release_id="`+ item.release_id +`" data-title="`+ item.title +`" data-artist="`+ item.artist +`" data-artist_id="` + item.artist_id + `" >` + item.title + ` by ` + item.artist + `</div>`
        );
    }
    request.send();
}
*/

//extracting id and other info by setting as data-attribute
function getAndUpdateInfo(e) {
    var release_id = e.target.getAttribute('data-release_id');
    var title = e.target.getAttribute('data-title');
    var artist = e.target.getAttribute('data-artist');
    var artist_id = e.target.getAttribute('data-artist_id');
    var data = {
        release_id: release_id,
        title: title,
        artist: artist,
        artist_id: artist_id
    }

    //updating title and artist
    this.title.innerText = data.title;
    this.artist.innerText = data.artist;

    //updating artwork
    getArtwork(data.release_id);

    //updating background
    getArtistBackground(data.artist_id);

    console.log(data);
}

function getArtwork(rel_id) {
    var artwork = document.getElementById('artwork');
    var artworkRequest = new XMLHttpRequest();
    artworkRequest.open('GET', 'https://coverartarchive.org/release/' + rel_id);
    artworkRequest.onload = function() {
        console.log('Artwork Status', this.status);
        if(this.status == 404) {
            //return sad face
            artwork.src = ('resources/images/art_0.jpg');
        } else {
            var artworkData = JSON.parse(artworkRequest.responseText);
            artwork.src = artworkData.images[0].thumbnails.large;
            // console.log(artworkData.images[0].thumbnails.large);            
        }
        
    }
    artworkRequest.send();
}


function getArtistBackground(artistId) {
    baseUrl = 'https://webservice.fanart.tv/v3/music/';
    dummyApiKey = '9a7123364e89108c7b1c1d55ccf85a6a';
    var backgroundRequest = new XMLHttpRequest();
    backgroundRequest.open('GET', baseUrl + artistId + '?api_key=' + dummyApiKey);
    backgroundRequest.onload = function() {
        console.log('Background Status', this.status);
        if(this.status == 404) {
            //changing background artist image
            background.style = 'background: url(\' ' + 'resources/images/backdrop_0.jpg' + ' \'); ';
        } else {
            respData = JSON.parse(this.responseText);
            if(respData.artistbackground == undefined) {
                background.style = 'background: url(\' ' + 'resources/images/backdrop_0.jpg' + ' \'); ';
            } else {
                randomIndex = Math.floor(Math.random() * respData.artistbackground.length);
                background.style = 'background: url(\' ' + respData.artistbackground[randomIndex].url + ' \'); ';
            }
            console.log(respData);
        }
    }
    backgroundRequest.send();
}


//morphing play pause
var svg = document.getElementById("play-pause-btn");
var s = Snap(svg);

var playBtn = Snap.select('#play-btn');
var pauseBtn = Snap.select('#pause-btn');

var playBtnPoints = playBtn.node.getAttribute('d');
var pauseBtnPoints = pauseBtn.node.getAttribute('d');

var toPause = function(){
    playBtn.animate({ d: pauseBtnPoints }, 200);  
}

var toPlay = function(){
    playBtn.animate({ d: playBtnPoints }, 200);  
}

var playing = false;
document.getElementById('play-pause-btn').addEventListener('click', function () {
    if(playing) {
        toPlay();
        playing = false;
    } else {
        toPause();
        playing = true;
    }
})



//siderbar stuff
document.getElementById('menu-btn').addEventListener('click', function() {
    document.getElementById('sidebar').classList.add('show');
});

document.getElementById('back-btn').addEventListener('click', function() {
    document.getElementById('sidebar').classList.remove('show');
});


//preview-testing function
var testing = [
    {
        bg: 'resources/images/backdrop_1.jpg',
        art: 'resources/images/art_1.jpg',
        color: 'rgb(203, 40, 131)',
        title: 'Glorious',
        artist: 'Arty'
    },
    {
        bg: 'resources/images/backdrop_4.jpg',
        art: 'resources/images/art_4.jpg',
        color: 'rgb(251, 243, 4)',
        title: 'Rude',
        artist: 'MAGIC!'
    },
    {
        bg: 'resources/images/backdrop_3.jpg',
        art: 'resources/images/art_3.jpg',
        color: 'rgb(13, 177, 225)',
        title: 'Shape of You',
        artist: 'Ed Sheeran'
    },
    {
        bg: 'resources/images/backdrop_5.jpg',
        art: 'resources/images/art_5.jpg',
        color: 'rgb(215, 43, 105)',
        title: 'Cruel',
        artist: 'Foxes'
    },
    {
        bg: 'resources/images/backdrop_7.jpg',
        art: 'resources/images/art_7.jpg',
        color: 'rgb(240, 104, 69)',
        title: 'Honey',
        artist: 'Kehlani'
    },
    {
        bg: 'resources/images/backdrop_8.jpg',
        art: 'resources/images/art_8.jpg',
        color: 'rgb(255, 255, 255)',
        title: 'Andromeda',
        artist: 'Gorillaz'
    }
]
var index = 4;
document.getElementById('testing-btn').addEventListener('click', function() {
    if(index >= testing.length) {
        index = 0;
    }
    
    //changing background artist image
    background.style = 'background: url(\' ' + testing[index].bg + ' \'); ';

    //changing artwork
    artwork.src = testing[index].art;
    
    //changing title and artist
    title.innerText = testing[index].title;
    artist.innerText = testing[index].artist;
    
    index++;
});