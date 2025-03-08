// Function to fetch songs from the selected folder
async function getSongs(folder) {
    try {
        // Ensure the folder name is properly encoded to handle spaces and special characters
        let encodedFolder = encodeURIComponent(folder);

        console.log(`Fetching songs from: ${encodedFolder}`);

        let response = await fetch(`http://127.0.0.1:5500/${encodedFolder}/`);

        if (!response.ok) {
            throw new Error(`Failed to load songs from ${folder}. Status: ${response.status}`);
        }

        let html = await response.text();
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, "text/html");

        // Extract file names from the directory listing
        let links = doc.querySelectorAll("a");
        let songs = [];

        links.forEach(link => {
            let href = link.getAttribute("href");

            // Ensure we're only adding valid audio files
            if (href.endsWith(".mp3") || href.endsWith(".wav") || href.endsWith(".ogg")) {
                songs.push(decodeURIComponent(href));
            }
        });

        if (songs.length === 0) {
            console.warn("No valid songs found in the selected folder.");
        }

        // Pass the songs to the function that handles UI update
        displaySongs(songs, folder);
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}

// Function to display songs in the UI
function displaySongs(songs, folder) {
    let songList = document.getElementById("song-list");
    songList.innerHTML = ""; // Clear previous list

    if (songs.length === 0) {
        songList.innerHTML = `<p>No songs found in ${folder}.</p>`;
        return;
    }

    songs.forEach(song => {
        let songItem = document.createElement("li");
        songItem.textContent = song.replace(/^.*[\\/]/, ""); // Display only the file name
        songItem.addEventListener("click", () => playSong(folder, song));
        songList.appendChild(songItem);
    });
}

// Function to play selected song
function playSong(folder, song) {
    let audioPlayer = document.getElementById("audio-player");
    let encodedSong = encodeURIComponent(song);
    let encodedFolder = encodeURIComponent(folder);

    audioPlayer.src = `http://127.0.0.1:5500/${encodedFolder}/${encodedSong}`;
    audioPlayer.play();

    console.log(`Playing: ${song} from ${folder}`);
}

// Event listener for folder selection
document.getElementById("folder-select").addEventListener("change", function () {
    let selectedFolder = this.value;
    if (selectedFolder) {
        getSongs(selectedFolder);
    }
});

// Initial default fetch (optional)
getSongs("songs"); // Change this to a valid default folder name if needed
