var overlay = document.getElementById('grad-overlay');
var background = document.getElementById('container');
var artwork = document.getElementById('artwork');
var title = document.getElementById('title');
var artist = document.getElementById('artist');
var controls = document.getElementById('controls');
var seekbar = document.getElementById('progress-bar');

var lightVibrantColor = 'rgb(215, 43, 105)';
var backgroundImageUrl ='../resources/images/backdrop_5.jpg';
var artworkUrl = '../resources/images/art_5.jpg';
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

//seeking to 
function seek(e) {
    this.seekbar.value = e.offsetX/e.target.clientWidth * 100; 
    // console.log(e);
}


//updating vibrant colors
function updateColors(extractedColors) {
    //copying Vibrant color values array
    var rgbValues = extractedColors.Vibrant;
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
    updateColors(swatches);
    // for (var swatch in swatches)
    //     if (swatches.hasOwnProperty(swatch) && swatches[swatch])
    //         console.log(swatch, swatches[swatch].getHex())
    // console.log(swatches);        
});


//search music
function searchMusic() {
    var searchString = document.getElementById('search').value;
    var baseSearchUrl = 'https://musicbrainz.org/ws/2/';
    var releaseQuery = 'release/?query=release:';
    //emptying every search button click
    document.getElementById('results').innerHTML = "";

    var request = new XMLHttpRequest();
    request.open('GET', baseSearchUrl + releaseQuery + searchString);
    request.onload = function() {
        var respData = request.responseXML;
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

    console.log(data);
}

function getArtwork(rel_id) {
    var artworkData ;
    var artwork = document.getElementById('artwork');
    var artworkRequest = new XMLHttpRequest();
    artworkRequest.open('GET', 'http://coverartarchive.org/release/' + rel_id);
    artworkRequest.onload = function() {
        console.log(this.status);
        if(this.status == 404) {
            //return sad face
            artwork.src = ('data:image/png;base64,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');
        } else {
            var artworkData = JSON.parse(artworkRequest.responseText);
            console.log(artworkData.images[0].thumbnails.large);            
            artwork.src = artworkData.images[0].thumbnails.large;
        }
        
    }
    artworkRequest.send();
}

















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
        bg: '../resources/images/backdrop_1.jpg',
        art: '../resources/images/art_1.jpg',
        color: 'rgb(203, 40, 131)',
        title: 'Glorious',
        artist: 'Arty'
    },
    {
        bg: '../resources/images/backdrop_4.jpg',
        art: '../resources/images/art_4.jpg',
        color: 'rgb(251, 243, 4)',
        title: 'Rude',
        artist: 'MAGIC!'
    },
    {
        bg: '../resources/images/backdrop_3.jpg',
        art: '../resources/images/art_3.jpg',
        color: 'rgb(13, 177, 225)',
        title: 'Shape of You',
        artist: 'Ed Sheeran'
    },
    {
        bg: '../resources/images/backdrop_5.jpg',
        art: '../resources/images/art_5.jpg',
        color: 'rgb(215, 43, 105)',
        title: 'Cruel',
        artist: 'Foxes'
    },
    {
        bg: '../resources/images/backdrop_7.jpg',
        art: '../resources/images/art_7.jpg',
        color: 'rgb(240, 104, 69)',
        title: 'Honey',
        artist: 'Kehlani'
    },
    {
        bg: 'https://earmilk.com/wp-content/uploads/2017/11/dj-snakejpg-950x451.jpg',
        art: 'https://i1.sndcdn.com/artworks-000243919916-gyq18i-t500x500.jpg',
        color: 'rgb(255, 255, 255)',
        title: 'A Different Way',
        artist: 'DJ Snake'
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