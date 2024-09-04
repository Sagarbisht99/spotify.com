let currentSongs = new Audio();

function convertSecondsToMinuteSeconds(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60); // Ensure seconds are integers
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs() {
    try {
        let response = await fetch('http://127.0.0.1:5500/songs/');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let text = await response.text();
        let div = document.createElement('div');
        div.innerHTML = text;

        let anchorTags = div.getElementsByTagName('a');
        let songs = [];

        for (let i = 0; i < anchorTags.length; i++) {
            const element = anchorTags[i];
            if (element.href.endsWith('mp3')) {
                songs.push(element.href.split('/songs/')[1]);
            }
        }

        return songs;
    } catch (error) {
        console.error('Error fetching songs:', error);
        return [];
    }
}

function playMusic(track, pause = false) {
    currentSongs.src = `/songs/${track}`;
    
    if (!pause) {
        currentSongs.play();
        document.querySelector('#play').src = 'pause.svg';
    }

    document.querySelector('.info').innerHTML = track;
    document.querySelector('.song-time').innerHTML = '00:00/00:00';
}

async function main() {
    let songs = await getSongs();
    if (songs.length === 0) {
        console.error('No songs found.');
        return;
    }
    
    console.log('Songs:', songs);

    playMusic(songs[0], true);

    let songUl = document.querySelector('.songLists ul');
    songUl.innerHTML = songs.map(song => `
        <li>
            <img class="invert" src="music.svg" alt="">
            <div class="song-info">
                <div>${song.replace('%20', ' ')}</div>
                <div>sagar Bisht</div>
            </div>
            <div class="play">Play Now</div>
            <img class="invert" src="play.svg" alt="">
        </li>
    `).join('');

    document.querySelectorAll('.songLists li').forEach(li => {
        li.addEventListener('click', () => {
            let track = li.querySelector('.song-info div').textContent.trim();
            playMusic(track);
        });
    });

    document.querySelector('#play').addEventListener('click', () => {
        if (currentSongs.paused) {
            currentSongs.play();
            document.querySelector('#play').src = 'pause.svg';
        } else {
            currentSongs.pause();
            document.querySelector('#play').src = 'play.svg';
        }
    });

    currentSongs.addEventListener('timeupdate', () => {
        let currentTime = currentSongs.currentTime;
        let duration = currentSongs.duration;

        document.querySelector('.song-time').innerHTML = `
            ${convertSecondsToMinuteSeconds(currentTime)}/${convertSecondsToMinuteSeconds(duration)}
        `;

        let seekbar = document.querySelector('.seekbar');
        document.querySelector('.circle').style.left = `${(currentTime / duration) * 100}%`;

        seekbar.addEventListener('click', (e) => {
            let percent = (e.offsetX / seekbar.clientWidth) * 100;
            document.querySelector('.circle').style.left = `${percent}%`;
            currentSongs.currentTime = (duration * percent) / 100;
        });
    });

    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.left').style.left = '0';
    });

    document.querySelector('.close').addEventListener('click', () => {
        document.querySelector('.left').style.left = '-130%';
    });

    document.querySelector('#previous').addEventListener('click', () => {
        let index = songs.indexOf(currentSongs.src.split('/').pop());
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    document.querySelector('#next').addEventListener('click', () => {
        let index = songs.indexOf(currentSongs.src.split('/').pop());
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector('.input').addEventListener('change', (e) => {
        currentSongs.volume = parseFloat(e.target.value) / 100;
    });
}

main();
