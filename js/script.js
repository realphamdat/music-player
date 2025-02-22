const wrapper = document.querySelector(".wrapper"),
  musicImg = wrapper.querySelector(".img-area img"),
  musicName = wrapper.querySelector(".song-details .name"),
  playPauseBtn = wrapper.querySelector(".play-pause"),
  prevBtn = wrapper.querySelector("#prev"),
  nextBtn = wrapper.querySelector("#next"),
  mainAudio = wrapper.querySelector("#main-audio"),
  progressArea = wrapper.querySelector(".progress-area"),
  progressBar = progressArea.querySelector(".progress-bar"),
  musicList = wrapper.querySelector(".music-list"),
  moreMusicBtn = wrapper.querySelector("#more-music"),
  closeMoreMusic = musicList.querySelector("#close"),
  repeatBtn = wrapper.querySelector("#repeat-plist"),
  ulTag = wrapper.querySelector("ul"),
  searchInput = wrapper.querySelector("#search-input"),
  totalSongs = wrapper.querySelector("#total-songs"),
  searchResults = wrapper.querySelector("#search-results");

let musicIndex = Math.floor(Math.random() * allMusic.length);
let isMusicPaused = true;

window.addEventListener("load", () => {
  loadMusicListFromFolder();
  loadMusic(musicIndex);
  updatePlayingSong();
  updateTotalSongs();
});

// Load music details
function loadMusic(index) {
  const song = allMusic[index];
  musicName.innerText = song.name;
  musicImg.src = song.img;
  mainAudio.src = song.src;
}

// Play music
function playMusic() {
  wrapper.classList.add("paused");
  playPauseBtn.querySelector("i").innerText = "pause";
  mainAudio.play();
}

// Pause music
function pauseMusic() {
  wrapper.classList.remove("paused");
  playPauseBtn.querySelector("i").innerText = "play_arrow";
  mainAudio.pause();
}

// Play previous song
function prevMusic() {
  musicIndex = (musicIndex - 1 + allMusic.length) % allMusic.length;
  loadMusic(musicIndex);
  playMusic();
  updatePlayingSong(); // Update list
}

// Play next song
function nextMusic() {
  musicIndex = (musicIndex + 1) % allMusic.length;
  loadMusic(musicIndex);
  playMusic();
  updatePlayingSong(); // Update list
}

// Select a song from the list
function selectSong(element) {
  const selectedIndex = element.getAttribute("li-index");
  musicIndex = selectedIndex - 1;
  loadMusic(musicIndex);
  playMusic();
  updatePlayingSong(); // Update list
}

// Play or pause event
playPauseBtn.addEventListener("click", () => {
  const isPlaying = wrapper.classList.contains("paused");
  isPlaying ? pauseMusic() : playMusic();
  updatePlayingSong();
});

// Previous and next button events
prevBtn.addEventListener("click", prevMusic);
nextBtn.addEventListener("click", nextMusic);

// Update progress bar as music plays
mainAudio.addEventListener("timeupdate", (e) => {
  if (mainAudio.duration) {
    const progressWidth = (e.target.currentTime / mainAudio.duration) * 100;
    progressBar.style.width = `${progressWidth}%`;

    updateCurrentTime(e.target.currentTime);
  }
});

// Update current time and duration
function updateCurrentTime(currentTime) {
  const currentMin = Math.floor(currentTime / 60);
  const currentSec = Math.floor(currentTime % 60)
    .toString()
    .padStart(2, "0");
  wrapper.querySelector(".current-time").innerText = `${currentMin}:${currentSec}`;
}

mainAudio.addEventListener("loadeddata", () => {
  const totalMin = Math.floor(mainAudio.duration / 60);
  const totalSec = Math.floor(mainAudio.duration % 60)
    .toString()
    .padStart(2, "0");
  wrapper.querySelector(".max-duration").innerText = `${totalMin}:${totalSec}`;
});

// Seek through the progress bar
progressArea.addEventListener("click", (e) => {
  const progressWidth = progressArea.clientWidth;
  const clickedOffsetX = e.offsetX;
  mainAudio.currentTime = (clickedOffsetX / progressWidth) * mainAudio.duration;
  playMusic();
  updatePlayingSong();
});

// Repeat/shuffle button event
repeatBtn.addEventListener("click", () => {
  switch (repeatBtn.innerText) {
    case "repeat":
      repeatBtn.innerText = "repeat_one";
      repeatBtn.setAttribute("title", "Song looped");
      break;
    case "repeat_one":
      repeatBtn.innerText = "shuffle";
      repeatBtn.setAttribute("title", "Playback shuffled");
      break;
    case "shuffle":
      repeatBtn.innerText = "repeat";
      repeatBtn.setAttribute("title", "Playlist looped");
      break;
  }
});

// Handle song end event
mainAudio.addEventListener("ended", () => {
  switch (repeatBtn.innerText) {
    case "repeat":
      nextMusic();
      break;
    case "repeat_one":
      mainAudio.currentTime = 0;
      playMusic();
      break;
    case "shuffle":
      shuffleMusic();
      break;
  }
});

// Shuffle music
function shuffleMusic() {
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * allMusic.length);
  } while (randomIndex === musicIndex);
  musicIndex = randomIndex;
  loadMusic(musicIndex);
  playMusic();
  updatePlayingSong();
}

// Show/hide music list
moreMusicBtn.addEventListener("click", () => {
  musicList.classList.toggle("show");
});

closeMoreMusic.addEventListener("click", () => {
  musicList.classList.remove("show");
});

// Generate song list dynamically
allMusic.forEach((song, index) => {
  const liTag = `
    <li li-index="${index + 1}">
      <div class="row">
        <span>${song.name}</span>
      </div>
      <span id="audio-${index}" class="audio-duration">3:40</span>
      <audio class="audio-${index}" src="${song.src}"></audio>
    </li>`;
  ulTag.insertAdjacentHTML("beforeend", liTag);

  const liAudioTag = ulTag.querySelector(`.audio-${index}`);
  liAudioTag.addEventListener("loadeddata", () => {
    const duration = liAudioTag.duration;
    const totalMin = Math.floor(duration / 60);
    const totalSec = Math.floor(duration % 60)
      .toString()
      .padStart(2, "0");
    const durationTag = ulTag.querySelector(`#audio-${index}`);
    durationTag.innerText = `${totalMin}:${totalSec}`;
    durationTag.setAttribute("t-duration", `${totalMin}:${totalSec}`);
  });

  // Add click event listener to each list item
  const liItem = ulTag.querySelector(`li[li-index="${index + 1}"]`);
  liItem.addEventListener("click", () => selectSong(liItem));
});

// Update the song that is currently playing in the list
function updatePlayingSong() {
  const allLiTags = ulTag.querySelectorAll("li");

  // Remove 'playing' class from all list items
  allLiTags.forEach((li) => {
    li.classList.remove("playing");
    const audioTag = li.querySelector(".audio-duration");
    const songDuration = audioTag.getAttribute("t-duration");
    audioTag.innerText = songDuration; // Reset to original duration
  });

  // Add 'playing' class to the current song
  const currentLi = ulTag.querySelector(`li[li-index="${musicIndex + 1}"]`);
  if (currentLi) {
    currentLi.classList.add("playing");

    // Update the duration text to "Playing"
    const currentAudioTag = currentLi.querySelector(".audio-duration");
    currentAudioTag.innerText = "Playing";
  }
}

// Update the total number of songs
function updateTotalSongs() {
  totalSongs.innerText = allMusic.length;
}

// Update the number of search results
function updateSearchResults(count) {
  searchResults.innerText = `${count} results`;
}

// Search functionality
searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredSongs = allMusic.filter(song =>
    song.name.toLowerCase().includes(searchTerm)
  );
  renderMusicList(filteredSongs);
  updateSearchResults(filteredSongs.length);
});

// Render music list
function renderMusicList(songs) {
  ulTag.innerHTML = "";
  songs.forEach((song, index) => {
    const liTag = `
      <li li-index="${index + 1}">
        <div class="row">
          <span>${song.name}</span>
        </div>
        <span id="audio-${index}" class="audio-duration">3:40</span>
        <audio class="audio-${index}" src="${song.src}"></audio>
      </li>`;
    ulTag.insertAdjacentHTML("beforeend", liTag);

    const liAudioTag = ulTag.querySelector(`.audio-${index}`);
    liAudioTag.addEventListener("loadeddata", () => {
      const duration = liAudioTag.duration;
      const totalMin = Math.floor(duration / 60);
      const totalSec = Math.floor(duration % 60)
        .toString()
        .padStart(2, "0");
      const durationTag = ulTag.querySelector(`#audio-${index}`);
      durationTag.innerText = `${totalMin}:${totalSec}`;
      durationTag.setAttribute("t-duration", `${totalMin}:${totalSec}`);
    });

    // Add click event listener to each list item
    const liItem = ulTag.querySelector(`li[li-index="${index + 1}"]`);
    liItem.addEventListener("click", () => selectSong(liItem));
  });
}

// Load music list from folder
function loadMusicListFromFolder() {
  fetch('/path/to/folder')
    .then(response => response.json())
    .then(data => {
      allMusic = data.map(file => ({
        name: file.title,
        img: "default",
        src: file.name
      }));
      renderMusicList(allMusic);
      updateTotalSongs();
      updateSearchResults(allMusic.length);
    });
}
