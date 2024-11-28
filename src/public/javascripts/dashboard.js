const { response } = require("../../app");

let selectedEmoji = null;
const selectedSongs = [];

const emojiModal = new bootstrap.Modal(document.getElementById('emojiModal'));
const songModal = new bootstrap.Modal(document.getElementById('songModal'));
const reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));

// Emoji selection
document.querySelectorAll(".emoji").forEach(emoji => {
    emoji.addEventListener("click", function() {
        // Get the emoji symbol from the data-emoji attribute
        selectedEmoji = this.getAttribute("data-emoji");

        // Check if an emoji was successfully selected
        if (selectedEmoji) {
            // Indicate that the emoji has been selected (e.g., by adding a class)
            document.querySelectorAll(".emoji").forEach(e => e.classList.remove("selected"));
            this.classList.add("selected");

            // Enable the Next button to proceed
            document.getElementById("nextToSongs").disabled = false;
        }
    });
});

// Transition from emoji modal to song modal
document.getElementById("nextToSongs").addEventListener("click", function() {
    if (selectedEmoji) {
        emojiModal.hide();
        songModal.show();
    }
});

// Song selection and transition to review modal
document.getElementById("reviewMood").addEventListener("click", function() {
    selectedSongs.length = 0;  // Clear previous song selection
    document.querySelectorAll(".song-input").forEach(input => {
        if (input.value) selectedSongs.push(input.value);
    });

    // Display selected emoji and songs in review modal
    document.getElementById("selectedEmoji").innerHTML = selectedEmoji;
    const songList = document.getElementById("selectedSongs");
    songList.innerHTML = "";  // Clear previous list items
    selectedSongs.forEach(song => {
        let li = document.createElement("li");
        li.textContent = song;
        songList.appendChild(li);
    });
    
    songModal.hide();
    reviewModal.show();
});

// Posting mood and resetting selections
document.getElementById("postMood").addEventListener("click", function() {
    const feed = document.querySelector(".friends-feed");
    
    // Create the new post HTML content
    const postHTML = `
        <div class="post card my-3 p-3">
            <div class="d-flex align-items-center">
                <span class="post-emoji me-3 fs-3">${selectedEmoji}</span>
                <div class="post-content flex-grow-1">
                    <h4 class="post-author">Tú</h4>
                    <div class="post-songs">
                        ${selectedSongs.map(song => `<span class="post-song">🎵 ${song}</span><br>`).join('')}
                    </div>
                    <span class="post-date">Justo ahora</span>
                </div>
            </div>
        </div>`;
    
    // Insert the new post at the top of the feed
    feed.insertAdjacentHTML("afterbegin", postHTML);

    // Reset selections
    reviewModal.hide();
    selectedEmoji = null;
    selectedSongs.length = 0;
    document.querySelectorAll(".song-input").forEach(input => input.value = "");
    document.getElementById("nextToSongs").disabled = true;
});

document.getElementById("submitPost").addEventListener("click", function(){
    console.log('Botón de publicar clickeado');
    const emoji = document.getElementById('emoji').value;
    const song1 = document.getElementById('song1').value;
    const song2 = document.getElementById('song2').value;
    const song3 = document.getElementById('song3').value;

    const postData = {
        emoji: emoji,
        songs: [song1, song2, song3]
    };

    fetch('/createpost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
            alert('Publicación creada con éxito');
        } else {
            alert('Hubo un error al publicar');
        }
    })
    .catch(error => {
        console.error('Error al enviar la publicación:', error);
    });
});
