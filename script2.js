console.log("Let's write JavaScript");
let songs = [];
let currFolder;
let currentSong = new Audio();

function secondsToMinutesSeconds(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

async function getSongs(folder) {
    try {
        currFolder = folder; // Update the current folder
        let response = await fetch(`http://127.0.0.1:5500/${folder}/`);
        let text = await response.text();
        console.log("Fetched Folder:", folder, text);

        let div = document.createElement("div");
        div.innerHTML = text;

        let links = div.querySelectorAll("ul#files li a");

        let songList = [];
        links.forEach(link => {
            let songName = link.href.split(`/${folder}/`)[1];
            if (songName && songName.endsWith(".mp3")) {
                songList.push(decodeURIComponent(songName));
            }
        });

        return songList;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

const playMusic = (track) => {
    let songPath = `/${currFolder}/` + encodeURIComponent(track);

    console.log("Playing:", songPath);

    currentSong.src = songPath;
    currentSong.play().catch(error => console.error("Audio Play Error:", error));

    document.getElementById("play").src = "pause.svg";
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

const getCurrentSongName = () => {
    return decodeURIComponent(currentSong.src.split("/").pop());
};

async function loadPlaylist(folder) {
    songs = await getSongs(folder);
    console.log("Loaded Playlist:", songs);

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = ""; // Clear previous songs

    songs.forEach(song => {
        let songItem = document.createElement("li");
        songItem.innerHTML = `
            <img class="invert" src="music.svg" alt="">
            <div class="info">
                <div><u>Song</u> - ${song}</div>
                <div><u>Artist</u> - Rhythm Realm</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="">
            </div>
        `;
        songUL.appendChild(songItem);

        songItem.addEventListener("click", () => {
            playMusic(song);
        });
    });
}



async function main() {
    await loadPlaylist("songs/cs"); // Load default playlist

  

    document.getElementById("play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.getElementById("play").src = "pause.svg";
        } else {
            currentSong.pause();
            document.getElementById("play").src = "play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".songtime").innerHTML =
                `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    document.getElementById("next").addEventListener("click", () => {
        let currentSongName = getCurrentSongName();
        let index = songs.indexOf(currentSongName);
        if (index !== -1 && index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    document.getElementById("previos").addEventListener("click", () => {
        let currentSongName = getCurrentSongName();
        let index = songs.indexOf(currentSongName);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    // Fixed: Load playlist when a card is clicked
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async (e) => {
            let folder = e.currentTarget.dataset.folder;
            console.log("Switching to folder:", folder);
            await loadPlaylist(`songs/${folder}`);
        });
    });
}

main();
